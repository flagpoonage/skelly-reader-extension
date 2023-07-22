/*
Convert a string into an ArrayBuffer
from https://developers.google.com/web/updates/2012/06/How-to-convert-ArrayBuffer-to-and-from-String
*/
function str2ab(str: string) {
  const buf = new ArrayBuffer(str.length);
  const bufView = new Uint8Array(buf);
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

export const Signature = new (class SignatureClass {
  private key: CryptoKey | null = null;
  private last_signature: {
    phrase: string;
    signature: string;
    time: number;
  } | null = null;

  private importKey = async (pem: string): Promise<CryptoKey> => {
    // fetch the part of the PEM string between header and footer
    const pemHeader = '-----BEGIN PRIVATE KEY-----';
    const pemFooter = '-----END PRIVATE KEY-----';
    const pemContents = pem.substring(
      pemHeader.length,
      pem.length - pemFooter.length,
    );

    // base64 decode the string to get the binary data
    const binaryDerString = globalThis.atob(pemContents);
    // convert from a binary string to an ArrayBuffer
    const binaryDer = str2ab(binaryDerString);

    this.key = await globalThis.crypto.subtle.importKey(
      'pkcs8',
      binaryDer,
      {
        name: 'RSA-PSS',
        hash: 'SHA-256',
      },
      true,
      ['sign'],
    );

    return this.key;
  };

  createIdentityString = (id: string, domain: string, date?: Date) => {
    return `${id}@${domain}@${(date ?? new Date()).toISOString()}`;
  };

  createSignature = async (
    id: string,
    domain: string,
    privateKey: string,
  ): Promise<{
    phrase: string;
    signature: string;
  }> => {
    const key = this.key ?? (await this.importKey(privateKey));
    const now = new Date();
    const identity = this.createIdentityString(id, domain, now);
    const identity_bytes = new TextEncoder().encode(identity);

    const sign_result = await globalThis.crypto.subtle.sign(
      {
        name: 'RSA-PSS',
        hash: 'SHA-256',
        saltLength: 32,
      },
      key,
      identity_bytes,
    );

    const bytes_of_sig = new Uint8Array(sign_result) as unknown as number[];
    const b64 = btoa(String.fromCharCode.apply(null, bytes_of_sig));

    this.last_signature = {
      time: now.getTime(),
      phrase: identity,
      signature: b64,
    };

    return this.last_signature;
  };

  getSignature = async (
    id: string,
    domain: string,
    privateKey: string,
  ): Promise<{ phrase: string; signature: string }> => {
    const now = new Date().getTime();
    if (!this.last_signature || this.last_signature.time < now - 10000) {
      return this.createSignature(id, domain, privateKey);
    }

    return this.last_signature;
  };
})();
