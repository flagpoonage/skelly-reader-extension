import { extension } from './extension';
import {
  createHashChange,
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

  window.addEventListener('hashchange', async (ev) => {
    const win = frame.contentWindow;

    if (!win) {
      console.log('No window to post to');
      return;
    }

    console.log(ev.newURL, ev.oldURL);

    const new_url = new URL(new URL(ev.newURL).hash.substring(1));
    const old_url = new URL(new URL(ev.oldURL).hash.substring(1));

    console.log(new_url, old_url);

    if (
      new_url.origin === old_url.origin &&
      new_url.pathname === old_url.pathname
    ) {
      win.postMessage(createHashChange(new_url.hash), '*');
      // Don't load a new page, because it's just the anchor that's changing.
    } else {
      const updated_url = window.location.hash.substring(1);

      if (updated_url) {
        const response = await extension.runtime.sendMessage({
          type: 'fetch',
          url: updated_url,
        });

        win.postMessage(
          createSandboxInitialize(
            updated_url,
            response,
            callback_params.authkey,
          ),
          '*',
        );
      }
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
