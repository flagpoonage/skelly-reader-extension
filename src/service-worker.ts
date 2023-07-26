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
