import { safeUrl } from './common/safe-url';
import { extension } from './extension';
import { Signature } from './signature';
import { getPrivateKeyFromStorage } from './storage/private_key';
import { getUserFromStorage } from './storage/user';

const extension_root = `chrome-extension://${extension.runtime.id}`;

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

      return await Signature.signIdentity(user.id, user.domain, private_key);
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

      const user = await getUserFromStorage();
      const private_key = await getPrivateKeyFromStorage();

      const headers = new Headers();

      if (user && private_key) {
        const result = await Signature.signIdentity(
          user.id,
          user.domain,
          private_key,
        );

        if (result.success) {
          const { phrase, signature } = result.value;
          headers.set('Authorization', `Skelly ${phrase} ${signature.base64}`);
        } else {
          console.error('Cannot sign payload', result.error);
        }
      }

      const response = await fetch(url_result.value, {
        method: 'GET',
        headers,
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
    url: `${extension.runtime.getURL('reader.html')}#${url.href}`,
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
    url: `${extension.runtime.getURL('reader.html')}#${url.href}`,
  });
});

extension.webRequest.onHeadersReceived.addListener(
  (req) => {
    if (req.initiator !== extension_root) {
      return;
    }

    return {
      responseHeaders: req.responseHeaders?.filter(
        (a) => a.name !== 'set-cookie',
      ),
    };
  },
  {
    urls: ['http://*/*', 'https://*/*'],
  },
  ['responseHeaders', 'extraHeaders'],
);
