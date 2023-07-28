import { FailableResult, asFailable } from './failable';
import { safeJson } from './safe-json';

export async function generateSigningKeyPair(exportable = true) {
  return asFailable(() =>
    globalThis.crypto.subtle.generateKey(
      {
        name: 'RSA-PSS',
        hash: 'SHA-256',
        modulusLength: 4096,
        publicExponent: new Uint8Array([1, 0, 1]),
      },
      exportable,
      ['sign', 'verify'],
    ),
  );
}

export async function exportJsonWebKey(key: CryptoKey) {
  return asFailable(() => globalThis.crypto.subtle.exportKey('jwk', key));
}

export async function importJsonWebKeyFromString(
  value: string,
  usage: 'sign' | 'verify',
) {
  const json = safeJson(value);

  if (!json.success) {
    return json;
  }

  return importJsonWebKey(json.value as JsonWebKey, usage);
}

export async function importJsonWebKey(
  value: JsonWebKey,
  usage: 'sign' | 'verify',
) {
  return asFailable(() =>
    globalThis.crypto.subtle.importKey(
      'jwk',
      value,
      {
        name: 'RSA-PSS',
        hash: 'SHA-256',
      },
      false,
      [usage],
    ),
  );
}

export type CryptoKeyInput = string | JsonWebKey | CryptoKey;
export type SignatureInfoInput =
  | SignatureInfo
  | ArrayBuffer
  | Uint8Array
  | string;

export interface SignatureInfo {
  buffer: ArrayBuffer;
  bytes: Uint8Array;
  base64: string;
}

export async function getCryptoKeyFromValue(
  key: CryptoKeyInput,
  usage: 'sign' | 'verify',
) {
  if (typeof key === 'string') {
    return importJsonWebKeyFromString(key, usage);
  }
  if (key instanceof CryptoKey) {
    return asFailable(async () => key);
  }
  return importJsonWebKey(key, usage);
}

export async function signPayloadWithJsonWebKey(
  payload: string,
  key: CryptoKeyInput,
): Promise<FailableResult<SignatureInfo>> {
  const signing_key_result = await getCryptoKeyFromValue(key, 'sign');

  if (!signing_key_result.success) {
    return signing_key_result;
  }

  return asFailable(async () => {
    const signing_key = signing_key_result.value;
    const identity_bytes = new TextEncoder().encode(payload);
    const signature = await globalThis.crypto.subtle.sign(
      {
        name: 'RSA-PSS',
        saltLength: 32,
      },
      signing_key,
      identity_bytes,
    );

    const bytes_of_signature = new Uint8Array(signature);
    const b64_of_signature = btoa(
      String.fromCharCode.apply(
        null,
        bytes_of_signature as unknown as number[],
      ),
    );

    return {
      buffer: signature,
      bytes: bytes_of_signature,
      base64: b64_of_signature,
    } as SignatureInfo;
  });
}
function base64ToBytes(base64: string) {
  const binString = atob(base64);
  return Uint8Array.from(binString, (m) => m.codePointAt(0) as number);
}

export function getSignatureInfoOfPayload(
  payload: SignatureInfoInput,
): SignatureInfo {
  if (typeof payload === 'string') {
    const bytes = base64ToBytes(payload);
    return {
      buffer: bytes.buffer,
      bytes,
      base64: payload,
    };
  } else if (payload instanceof ArrayBuffer) {
    const bytes = new Uint8Array(payload);
    const base64 = btoa(
      String.fromCharCode.apply(null, bytes as unknown as number[]),
    );
    return {
      buffer: payload,
      bytes,
      base64,
    };
  }
  if (payload instanceof Uint8Array) {
    const base64 = btoa(
      String.fromCharCode.apply(null, payload as unknown as number[]),
    );
    return {
      buffer: payload.buffer,
      bytes: payload,
      base64,
    };
  }

  return payload;
}

export async function verifyPayloadWithJsonWebKey(
  data: string | Uint8Array | ArrayBuffer,
  signature: SignatureInfoInput,
  key: CryptoKeyInput,
) {
  const verify_key_result = await getCryptoKeyFromValue(key, 'verify');

  if (!verify_key_result.success) {
    return verify_key_result;
  }

  return asFailable(async () => {
    const verify_key = verify_key_result.value;
    const signature_info = getSignatureInfoOfPayload(signature);

    const identity_bytes =
      typeof data === 'string'
        ? new TextEncoder().encode(data)
        : data instanceof ArrayBuffer
        ? new Uint8Array(data)
        : data;

    return await globalThis.crypto.subtle.verify(
      {
        name: 'RSA-PSS',
        saltLength: 32,
      },
      verify_key,
      signature_info.buffer,
      identity_bytes,
    );
  });
}
