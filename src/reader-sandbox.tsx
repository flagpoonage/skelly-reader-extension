import './reader/reader-sandbox.css';
import { renderElement } from './page-renderer';
import { ReaderContent } from './reader/ReaderContent';
import { ReaderControls } from './reader/ReaderControls';
import { ReaderContextProvider } from './reader/ReaderContext';
import {
  createSandboxFrameReady,
  isSandboxInitialize,
} from './reader/reader-messaging';

interface Props {
  html: string;
  auth_key: string;
  extension_id: string;
  target_url: string;
}

function Reader({ target_url, html, auth_key, extension_id }: Props) {
  return (
    <ReaderContextProvider>
      <div className="reader">
        <ReaderControls />
        <ReaderContent
          html={html}
          target_url={target_url}
          extension_id={extension_id}
          auth_key={auth_key}
        />
      </div>
    </ReaderContextProvider>
  );
}

window.parent.postMessage(createSandboxFrameReady(), window.location.origin);

window.addEventListener('message', (ev) => {
  if (ev.source === window.parent) {
    handleParentMessage(ev);
  }
});

function handleParentMessage(ev: MessageEvent<unknown>) {
  if (isSandboxInitialize(ev.data)) {
    renderElement(
      <Reader
        html={ev.data.html_string}
        auth_key={ev.data.authkey}
        extension_id={ev.data.extension_id}
        target_url={ev.data.target_url}
      />,
    );
  }
}

// function handleMessage(ev: MessageEvent<unknown>) {}

// renderElement(<Reader />);
