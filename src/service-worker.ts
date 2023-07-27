import {
  generateSigningKeyPair,
  signPayloadWithJsonWebKey,
  verifyPayloadWithJsonWebKey,
} from './common/crypto-utils';
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
      const url_result = safeUrl(message.url);

      if (!url_result.success) {
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

      const response = await fetch(url_result.value, {
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

  const url_result = safeUrl(tab_url_value);

  if (!url_result.success) {
    return;
  }

  const url = url_result.value;

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

  const url_result = safeUrl(info.url);

  if (!url_result.success) {
    return;
  }

  const url = url_result.value;

  if (!url.pathname.endsWith('.skelly')) {
    return;
  }

  extension.tabs.update(tabId, {
    url: `${extension.runtime.getURL('reader.html')}?read=${url.href}`,
  });
});

(async () => {
  const pair = await generateSigningKeyPair(true);

  if (!pair.success) {
    console.error('Cannot generate keypair', pair.error);
    return;
  }

  const data = 'This is a string';

  const signature = await signPayloadWithJsonWebKey(
    data,
    pair.value.privateKey,
  );

  if (!signature.success) {
    console.error('Cannot create signature', signature.error);
    return;
  }

  const verification = await verifyPayloadWithJsonWebKey(
    data,
    signature.value,
    pair.value.publicKey,
  );

  if (!verification.success) {
    console.error('Cannot verify signature', verification.error);
    return;
  }

  console.log(
    'Signature verified',
    data,
    signature.value,
    pair.value.privateKey,
    pair.value.publicKey,
  );
})();
