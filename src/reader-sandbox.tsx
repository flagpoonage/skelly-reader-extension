import './reader/reader-sandbox.css';
import { renderElement } from './page-renderer';
import { ReaderContent } from './reader/ReaderContent';
import { ReaderControls } from './reader/ReaderControls';
import { ReaderContextProvider } from './reader/ReaderContext';
import {
  createSandboxFrameReady,
  isAnchorActivateMessage,
  isLinkActivateMessage,
  isSandboxInitialize,
} from './reader/reader-messaging';
import { useEffect, useState } from 'react';

interface PageState {
  html: string;
  extension_id: string;
  target_url: string;
}

function Reader() {
  const [pageState, setPageState] = useState<PageState | null>();

  useEffect(() => {
    const handler = (ev: MessageEvent<unknown>) => {
      if (isLinkActivateMessage(ev.data)) {
        console.log('Received link activation message', ev.data);
        // if (
        //   pageState?.auth_key !== ev.data.known_id ||
        //   pageState.extension_id !== ev.data.ext_id
        // ) {
        //   console.error('Doesnt match what we want');
        //   return;
        // }

        window.parent.postMessage(ev.data, window.location.origin);
      }

      if (isAnchorActivateMessage(ev.data)) {
        console.log('Received anchor activation message', ev.data);
        window.parent.postMessage(ev.data, window.location.origin);
      }

      if (ev.source !== window.parent) {
        return;
      }

      if (isSandboxInitialize(ev.data)) {
        setPageState({
          html: ev.data.html_string,
          extension_id: ev.data.extension_id,
          target_url: ev.data.target_url,
        });
      }
    };

    window.addEventListener('message', handler);

    return () => {
      window.removeEventListener('message', handler);
    };
  }, [pageState]);

  return (
    <ReaderContextProvider>
      <div className="reader">
        <ReaderControls />
        {pageState && (
          <ReaderContent
            html={pageState.html}
            target_url={pageState.target_url}
            extension_id={pageState.extension_id}
          />
        )}
      </div>
    </ReaderContextProvider>
  );
}

window.parent.postMessage(createSandboxFrameReady(), window.location.origin);

renderElement(<Reader />);
