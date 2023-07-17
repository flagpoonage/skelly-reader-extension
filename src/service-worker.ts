import { extension } from './extension';

extension.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message === 'return-sender') {
    sendResponse(sender);
  }
  console.log('Received message on service worker', message);
});
