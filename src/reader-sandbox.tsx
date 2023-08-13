import './reader/reader-sandbox.css';
import { renderElement } from './page-renderer';
import { ReaderContent } from './reader/ReaderContent';
import { ReaderControls } from './reader/ReaderControls';
import {
  ReaderContextProvider,
  useReaderContext,
} from './reader/ReaderContext';
import {
  createLinkActivateMessage,
  createSandboxFrameReady,
  createTopLevelInformation,
  isAnchorActivateMessage,
  isFrameContentReady,
  isHashChange,
  isLinkActivateMessage,
  isSandboxInitialize,
} from './reader/reader-messaging';
import { useEffect, useState } from 'react';
import { safeUrl } from './common/safe-url';
import { useOnClickOutside } from "./hooks/useOnClickOutside";

interface PageState {
  html: string;
  extension_id: string;
  target_url: string;
}

function Reader() {
  const [pageState, setPageState] = useState<PageState | null>();
  const ctx = useReaderContext();

  useEffect(() => {
    const handler = (ev: MessageEvent<unknown>) => {
      if (isLinkActivateMessage(ev.data)) {
        console.log('Received link activation message', ev.data);
        // if (
        //   pageState?.auth_key !== ev.data.known_id ||
        //   pageState.extension_id !== ev.data.ext_id
        // ) {
        //   console.error('Doesn't match what we want');
        //   return;
        // }

        window.parent.postMessage(ev.data, window.location.origin);
      }

      if (isAnchorActivateMessage(ev.data)) {
        console.log('Received anchor activation message', ev.data);
        window.parent.postMessage(ev.data, window.location.origin);
      }

      if (isFrameContentReady(ev.data)) {
        console.log(
          'Got frame content acknowledgement',
          window.location,
          pageState?.target_url,
        );

        if (!pageState?.target_url) {
          console.error('Missing a target URL for some reason, this is a bug');
          return;
        }

        const url = safeUrl(pageState.target_url);

        if (!url.success) {
          console.error(
            'Bad target URL for some reason, this is a bug',
            url.error,
            pageState.target_url,
          );
          return;
        }

        ctx.sendMessageToFrame(createTopLevelInformation(url.value));
      }

      if (ev.source !== window.parent) {
        return;
      }

      if (isHashChange(ev.data)) {
        console.log('Received a message bound for the internal frame', ev.data);

        ctx.sendMessageToFrame(ev.data);
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
  }, [pageState, ctx]);

  const handleOnSubmitUrl = (url: string) =>
    window.parent.postMessage(
      createLinkActivateMessage({
        link_href: url,
      }),
      '*',
    )

  return (
    <div className="reader">
      <ReaderControls
        currentUrl={pageState?.target_url}
        onSubmitUrl={handleOnSubmitUrl}
      />
      {pageState && (
        <ReaderContent
          html={pageState.html}
          target_url={pageState.target_url}
          extension_id={pageState.extension_id}
        />
      )}
    </div>
  );
}

window.parent.postMessage(createSandboxFrameReady(), window.location.origin);

renderElement(
  <ReaderContextProvider>
    <Reader/>
  </ReaderContextProvider>,
);
