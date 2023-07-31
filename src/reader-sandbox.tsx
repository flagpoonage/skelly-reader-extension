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
  target_url: string;
}

function Reader({ target_url }: Props) {
  return (
    <ReaderContextProvider>
      <div className="reader">
        <ReaderControls />
        <ReaderContent target_url={target_url} />
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
    renderElement(<Reader target_url={ev.data.target_url} />);
  }
}

// function handleMessage(ev: MessageEvent<unknown>) {}

// renderElement(<Reader />);
