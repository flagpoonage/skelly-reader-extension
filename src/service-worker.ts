import { safeUrl } from './common/safe-url';
import { extension } from './extension';
import { Signature } from './signature';
import { getPrivateKeyFromStorage } from './storage/private_key';
import { getUserFromStorage } from './storage/user';

extension.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Received message on service worker', message);
  (async () => {
    if (message === 'return-sender') {
      return sender;
    }
    if (message === 'request-signature') {
      const user = await getUserFromStorage();
      const private_key = await getPrivateKeyFromStorage();

      if (!user || !private_key) {
        return null;
      }

      return await Signature.getSignature(user.id, user.domain, private_key);
    }
    if (
      typeof message === 'object' &&
      message.type === 'fetch' &&
      typeof message.url === 'string'
    ) {
      const url = safeUrl(message.url);

      if (!url) {
        return null;
      }

      // const user = await getUserFromStorage();
      // const private_key = await getPrivateKeyFromStorage();

      // if (!user || !private_key) {
      //   return null;
      // }
      // const { phrase, signature } = await Signature.getSignature(
      //   user.id,
      //   user.domain,
      //   private_key,
      // );

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          // Authorization: `Skelly ${phrase} ${signature}`,
        },
      });

      const text = await response.text();

      return text;
    }
  })().then((a) => {
    console.log('Sending response', a);
    sendResponse(a);
  });

  return true;
});

extension.tabs.onCreated.addListener((tab) => {
  const tab_id = tab.id;
  const tab_url_value = tab.url ?? tab.pendingUrl;
  if (!tab_url_value || !tab_id) {
    return;
  }

  const url = safeUrl(tab_url_value);

  if (!url) {
    return;
  }

  if (!url.pathname.endsWith('.skelly')) {
    return;
  }

  extension.tabs.update(tab_id, {
    url: `${extension.runtime.getURL('reader.html')}?read=${url.href}`,
  });
});

extension.tabs.onUpdated.addListener((tabId, info) => {
  if (!info.url) {
    return;
  }

  const url = safeUrl(info.url);

  if (!url) {
    return;
  }

  if (!url.pathname.endsWith('.skelly')) {
    return;
  }

  extension.tabs.update(tabId, {
    url: `${extension.runtime.getURL('reader.html')}?read=${url.href}`,
  });
});

(async () => {
  const key = await globalThis.crypto.subtle.generateKey(
    {
      name: 'RSA-PSS',
      hash: 'SHA-256',
      modulusLength: 4096,
      publicExponent: new Uint8Array([1, 0, 1]),
    },
    true,
    ['sign', 'verify'],
  );

  function ab2str(buf: ArrayBuffer) {
    return String.fromCharCode.apply(
      null,
      new Uint8Array(buf) as unknown as number[],
    );
  }

  async function exportCryptoKey(type: 'public' | 'private', key: CryptoKey) {
    const exported = await globalThis.crypto.subtle.exportKey(
      type === 'public' ? 'spki' : 'pkcs8',
      key,
    );
    const n = type.toUpperCase();
    const exportedAsString = ab2str(exported);
    const exportedAsBase64 = globalThis.btoa(exportedAsString);
    const pemExported = `-----BEGIN ${n} KEY-----\n${exportedAsBase64}\n-----END ${n} KEY-----`;
    return pemExported;
  }

  const pem_priv = await exportCryptoKey('private', key.privateKey);
  const pem_pub = await exportCryptoKey('public', key.publicKey);

  console.log(pem_priv);
  console.log(pem_pub);
})();
