import './reader/reader.css';
import { useEffect, useState } from 'react';
import { renderElement } from './page-renderer';
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
      Array.from(
        body_document.querySelectorAll(
          'link[rel=stylesheet], video, canvas, style, script, link[rel=preconnect], a[href="javascript:void(0)"',
        ),
      ).forEach((el) => {
        console.log('Stripping non-compliant element', el);
        el.remove();
      });

      Array.from(body_document.getElementsByTagName('img')).forEach((el) => {
        console.log('Replacing image with marker', el);
        const anchor = body_document.createElement('a');
        anchor.setAttribute('skelly-image', el.src);
        anchor.innerHTML = el.src;
        el.replaceWith(anchor);
      });

      Array.from(body_document.querySelectorAll('[style]')).forEach((el) => {
        console.log('Stripping inline style', el.getAttribute('style'), el);
        el.removeAttribute('style');
      });

      const style = body_document.createElement('link');
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
    documentString && (
      <iframe id="reader_frame" srcDoc={documentString}></iframe>
    )
  );
}

renderElement(<Reader />);
