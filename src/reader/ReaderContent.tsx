import { useState, useEffect, useMemo } from 'react';
import { safeUrl } from '../common/safe-url';

interface Props {
  file: string | null;
}

export function ReaderContent({ file }: Props) {
  const [originalSource, setOriginalSource] = useState<string | null>(null);

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

      setOriginalSource(response);
    })();
  }, [file]);

  const strippedDocument = useMemo(() => {
    if (!originalSource) {
      return;
    }

    const parser = new DOMParser();
    const body_document = parser.parseFromString(originalSource, 'text/html');

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

    return body_document;
  }, [originalSource]);

  const documentString = useMemo(() => {
    if (!strippedDocument) {
      return;
    }

    const head = strippedDocument.getElementsByTagName('head')[0];

    Array.from(
      strippedDocument.querySelectorAll('link[rel=stylesheet]'),
    ).forEach((el) => el.remove());

    const style = strippedDocument.createElement('link');
    style.href = chrome.runtime.getURL('themes/greenscreen.css');
    style.rel = 'stylesheet';

    head.appendChild(style);

    const sx = new XMLSerializer();

    const doc_string = sx.serializeToString(strippedDocument);

    return doc_string;
  }, [strippedDocument]);

  return (
    <div className="reader-content">
      {documentString && (
        <iframe id="reader-frame" srcDoc={documentString}></iframe>
      )}
    </div>
  );
}
