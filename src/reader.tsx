import {
  createSandboxInitialize,
  isSandboxFrameReady,
} from './reader/reader-messaging';
import './reader/reader.css';

const buffer = new Uint8Array(32);
const authkey = crypto.getRandomValues(buffer);
const key = btoa(
  String.fromCharCode.apply(null, authkey as unknown as number[]),
);

const target_url = new URLSearchParams(window.location.search).get('read');

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

  function handleMessage(event: MessageEvent<unknown>) {
    const { data, source } = event;
    if (isSandboxFrameReady(data)) {
      console.log('Sandbox is ready', data);
      if (key && target_url) {
        source?.postMessage(createSandboxInitialize(target_url, key), '*');
      }
    }
  }
}
document.readyState === 'loading'
  ? document.addEventListener('DOMContentLoaded', onLoad)
  : onLoad();
