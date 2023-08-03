import { extension } from './extension';
import {
  createSandboxInitialize,
  isAnchorActivateMessage,
  isLinkActivateMessage,
  isSandboxFrameReady,
} from './reader/reader-messaging';
import './reader/reader.css';

function createAuthKey() {
  const buffer = new Uint8Array(32);
  const authkey = crypto.getRandomValues(buffer);
  return btoa(String.fromCharCode.apply(null, authkey as unknown as number[]));
}

const target_url = window.location.hash.substring(1);

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

  window.addEventListener('hashchange', async () => {
    const win = frame.contentWindow;

    if (!win) {
      console.log('No window to post to');
      return;
    }

    const updated_url = window.location.hash.substring(1);

    if (updated_url) {
      const response = await extension.runtime.sendMessage({
        type: 'fetch',
        url: updated_url,
      });

      win.postMessage(
        createSandboxInitialize(updated_url, response, callback_params.authkey),
        '*',
      );
    }
  });

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

    if (isLinkActivateMessage(data)) {
      console.log('Received link activation at top level!', data);
      window.location.href = `${window.location.origin}${window.location.pathname}#${data.link_href}`;
      return;
    }

    if (isAnchorActivateMessage(data)) {
      console.log(
        'Current hash',
        window.location.hash,
        window.location.hash.split('#')[0],
        window.location.hash.split('#')[1],
      );
      history.pushState(
        null,
        '',
        `${window.location.origin}${window.location.pathname}#${
          window.location.hash.split('#')[1]
        }#${data.anchor_name}`,
      );
    }

    if (isSandboxFrameReady(data)) {
      console.log('Sandbox is ready', data);

      if (target_url) {
        extension.runtime.sendMessage(
          {
            type: 'fetch',
            url: target_url,
          },
          (response) => {
            win.postMessage(
              createSandboxInitialize(
                target_url,
                response,
                callback_params.authkey,
              ),
              '*',
            );
          },
        );
      }
    }
  }
}
document.readyState === 'loading'
  ? document.addEventListener('DOMContentLoaded', onLoad)
  : onLoad();
