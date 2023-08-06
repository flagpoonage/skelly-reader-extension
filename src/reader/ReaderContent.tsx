import { useEffect, useMemo } from 'react';
import { safeUrl } from '../common/safe-url';
import { useReaderContext } from './ReaderContext';

interface Props {
  html: string;
  extension_id: string;
  target_url: string | null;
}

const ext_scheme = TARGET === 'firefox' ? 'moz-extension' : 'chrome-extension';

const keyCount = (function* keyCounter() {
  let i = 1;
  while (i < 10000000) {
    yield i;
    i++;
  }

  return null;
})();

export function ReaderContent({ html, target_url, extension_id }: Props) {
  const { selectedTheme, contentFrameReference } = useReaderContext();
  // const exampleBoolean = useExampleBoolean();
  const url = useMemo(() => {
    if (!target_url) {
      return null;
    }

    const url_result = safeUrl(target_url);

    if (!url_result.success) {
      return null;
    }

    return url_result.value;
  }, [target_url]);

  const strippedDocument = useMemo(() => {
    if (!html) {
      return;
    }

    const parser = new DOMParser();
    const body_document = parser.parseFromString(html, 'text/html');

    Array.from(
      body_document.querySelectorAll(
        'link[rel=stylesheet], link[rel=preload], button, input, textarea, dialog, video, canvas, style, script, link[rel=preconnect], a[href="javascript:void(0)"]',
      ),
    ).forEach((el) => el.remove());

    Array.from(body_document.querySelectorAll('a[href^="#"]')).forEach((a) => {
      const href = a.getAttribute('href');

      if (href === '#') {
        a.removeAttribute('href');
      } else {
        // a.setAttribute('href', `about:srcdoc${href}`);
      }
    });

    Array.from(body_document.getElementsByTagName('img')).forEach((el) => {
      if (el.src.startsWith('data:')) {
        return;
      }
      const anchor = body_document.createElement('a');
      anchor.setAttribute('skelly-image', el.src);
      anchor.innerHTML = el.src;
      el.replaceWith(anchor);
    });

    Array.from(body_document.querySelectorAll('[style]')).forEach((el) => {
      el.removeAttribute('style');
    });

    return body_document;
  }, [html]);

  const documentString = useMemo(() => {
    if (!strippedDocument) {
      return;
    }

    Array.from(
      strippedDocument.querySelectorAll('link[rel=stylesheet]'),
    ).forEach((el) => el.remove());

    const head = strippedDocument.getElementsByTagName('head')[0];
    if (selectedTheme) {
      const style = strippedDocument.createElement('link');
      style.href = `${ext_scheme}://${extension_id}/themes/${selectedTheme}.css`;
      style.rel = 'stylesheet';

      head.appendChild(style);
    }

    if (url) {
      const base = strippedDocument.createElement('base');
      base.href = url.href;
      head.prepend(base);
    }

    const csp_header = strippedDocument.createElement('meta');
    csp_header.httpEquiv = 'Content-Security-Policy';
    csp_header.content = "script-src 'unsafe-inline'";
    head.append(csp_header);

    const link_script = strippedDocument.createElement('script');
    link_script.src = `${ext_scheme}://${extension_id}/injected-scripts/links.js`;

    head.appendChild(link_script);

    const window_script = strippedDocument.createElement('script');
    window_script.src = `${ext_scheme}://${extension_id}/injected-scripts/window.js`;

    head.appendChild(window_script);

    const sx = new XMLSerializer();

    const doc_string = sx.serializeToString(strippedDocument);

    return doc_string;
  }, [strippedDocument, selectedTheme, url, extension_id]);

  useEffect(() => {});

  const content_id = useMemo(() => keyCount.next().value, [documentString]);

  return (
    <div className="reader-content">
      {documentString && (
        <iframe
          ref={contentFrameReference}
          id="reader-frame"
          key={content_id}
          srcDoc={documentString}
        ></iframe>
      )}
    </div>
  );
}
