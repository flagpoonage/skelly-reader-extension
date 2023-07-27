import {
  SignatureInfo,
  importJsonWebKeyFromString,
  signPayloadWithJsonWebKey,
} from './common/crypto-utils';
import { asFailable, asSuccess } from './common/failable';
export interface SignedPayload {
  phrase: string;
  signature: SignatureInfo;
  time: number;
}

export const Signature = new (class SignatureClass {
  private key: CryptoKey | null = null;
  private last_signature: SignedPayload | null = null;

  createIdentityString = (id: string, domain: string, date?: Date) => {
    return `${id}@${domain}@${(date ?? new Date()).toISOString()}`;
  };

  createSignature = async (id: string, domain: string, privateKey: string) => {
    if (!this.key) {
      const key_result = await importJsonWebKeyFromString(privateKey, 'sign');
      if (!key_result.success) {
        return key_result;
      }

      this.key = key_result.value;
    }

    const now = new Date();
    const identity = this.createIdentityString(id, domain, now);
    const signature_result = await signPayloadWithJsonWebKey(
      identity,
      this.key,
    );

    if (!signature_result.success) {
      return signature_result;
    }

    const signature = signature_result.value;
    const payload: SignedPayload = {
      time: now.getTime(),
      phrase: identity,
      signature,
    };

    this.last_signature = payload;

    return asFailable(async () => payload);
  };

  signIdentity = async (id: string, domain: string, privateKey: string) => {
    const now = new Date().getTime();
    if (!this.last_signature || this.last_signature.time < now - 10000) {
      return this.createSignature(id, domain, privateKey);
    }

    return asSuccess(this.last_signature);
  };
})();
