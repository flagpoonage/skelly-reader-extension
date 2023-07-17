import { useEffect, useState } from 'react';
import { renderElement } from './page-renderer';
import './popup/popup.css';
import { safeUrl } from './common/safe-url';

function Reader() {
  const [documentString, setDocumentString] = useState<string | null>(null);
  const params = new URLSearchParams(window.location.search);
  const file = params.get('read');

  useEffect(() => {
    if (!file) {
      return;
    }

    const url = safeUrl(file);

    if (!url) {
      return;
    }

    (async () => {
      const response = await chrome.runtime.sendMessage({
        type: 'fetch',
        url: file,
      });
      // const response = await fetch(url, {
      //   method: 'GET',
      // });

      // const data = await response.text();
      const parser = new DOMParser();
      const body_document = parser.parseFromString(response, 'text/html');

      const head = body_document.getElementsByTagName('head')[0];

      const style = document.createElement('link');
      style.href = chrome.runtime.getURL('themes/greenscreen.css');
      style.rel = 'stylesheet';

      head.appendChild(style);

      const sx = new XMLSerializer();

      const doc_string = sx.serializeToString(body_document);

      setDocumentString(doc_string);

      // document.createDocumentFragment();
    })();
  }, [file]);

  return (
    <div>
      Reading: {file}
      {documentString && (
        <iframe width="100%" height="100%" srcDoc={documentString}></iframe>
      )}
    </div>
  );
}

renderElement(<Reader />);
