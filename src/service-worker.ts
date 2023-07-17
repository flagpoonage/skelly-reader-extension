import { safeUrl } from './common/safe-url';
import { extension } from './extension';

extension.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Received message on service worker', message);
  (async () => {
    if (message === 'return-sender') {
      return sender;
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

      const response = await fetch(url, { method: 'GET' });

      const text = await response.text();

      return text;
    }
  })().then((a) => {
    console.log('Sending response', a);
    sendResponse(a);
  });

  return true;
});
