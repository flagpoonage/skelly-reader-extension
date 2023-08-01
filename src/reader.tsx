import {
  createSandboxInitialize,
  isSandboxFrameReady,
} from './reader/reader-messaging';
import './reader/reader.css';

function createAuthKey() {
  const buffer = new Uint8Array(32);
  const authkey = crypto.getRandomValues(buffer);
  return btoa(String.fromCharCode.apply(null, authkey as unknown as number[]));
}

const target_url = new URLSearchParams(window.location.search).get('read');

const callback_params = {
  authkey: createAuthKey(),
};

function onLoad() {
  const frame = document.getElementById(
    'reader-sandbox',
  ) as HTMLIFrameElement | null;

  if (!frame) {
    console.log('Breaking', frame);
    return;
  }

  window.addEventListener('message', (msg) => {
    const frame = document.getElementById(
      'reader-sandbox',
    ) as HTMLIFrameElement | null;

    if (msg.source !== frame?.contentWindow) {
      console.log('Message from unknown sender!', msg);
    } else {
      handleMessage(msg);
    }
  });

  async function handleMessage(event: MessageEvent<unknown>) {
    const { data } = event;

    const win = frame?.contentWindow;

    if (!win) {
      console.log('No window to post to');
      return;
    }

    if (isSandboxFrameReady(data)) {
      console.log('Sandbox is ready', data);

      if (target_url) {
        const response = await chrome.runtime.sendMessage({
          type: 'fetch',
          url: target_url,
        });

        win.postMessage(
          createSandboxInitialize(
            target_url,
            response,
            callback_params.authkey,
          ),
          '*',
        );
      }
    }
  }
}
document.readyState === 'loading'
  ? document.addEventListener('DOMContentLoaded', onLoad)
  : onLoad();
