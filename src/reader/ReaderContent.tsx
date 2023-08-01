import { useMemo } from 'react';
import { safeUrl } from '../common/safe-url';
import { useReaderContext } from './ReaderContext';

interface Props {
  html: string;
  auth_key: string;
  extension_id: string;
  target_url: string | null;
}

export function ReaderContent({
  html,
  target_url,
  extension_id,
  auth_key,
}: Props) {
  const { selectedTheme } = useReaderContext();
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

  // useEffect(() => {
  //   if (!url) {
  //     return;
  //   }

  //   (async () => {
  //     const response = await chrome.runtime.sendMessage({
  //       type: 'fetch',
  //       url: url,
  //     });

  //     setOriginalSource(response);
  //   })();
  // }, [url]);

  const strippedDocument = useMemo(() => {
    if (!html) {
      return;
    }

    const parser = new DOMParser();
    const body_document = parser.parseFromString(html, 'text/html');

    Array.from(
      body_document.querySelectorAll(
        'link[rel=stylesheet], link[rel=preload], video, canvas, style, script, link[rel=preconnect], a[href="javascript:void(0)"',
      ),
    ).forEach((el) => {
      // console.log('Stripping non-compliant element', el);
      el.remove();
    });

    Array.from(body_document.querySelectorAll('a[href^="#"]')).forEach((a) => {
      const href = a.getAttribute('href');
      a.setAttribute('href', `about:srcdoc${href}`);
    });

    Array.from(body_document.getElementsByTagName('img')).forEach((el) => {
      // console.log('Replacing image with marker', el);
      const anchor = body_document.createElement('a');
      anchor.setAttribute('skelly-image', el.src);
      anchor.innerHTML = el.src;
      el.replaceWith(anchor);
    });

    Array.from(body_document.querySelectorAll('[style]')).forEach((el) => {
      // console.log('Stripping inline style', el.getAttribute('style'), el);
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
      style.href = `chrome-extension://${extension_id}/themes/${selectedTheme}.css`;
      style.rel = 'stylesheet';

      head.appendChild(style);
    }

    if (url) {
      const base = strippedDocument.createElement('base');
      base.href = url.href;
      head.prepend(base);
    }

    // <meta
    //   http-equiv="Content-Security-Policy"
    //   content="default-src 'self'; img-src https://*; child-src 'none';"
    // />;

    const csp_header = strippedDocument.createElement('meta');
    csp_header.httpEquiv = 'Content-Security-Policy';
    csp_header.content = "script-src 'unsafe-inline'";
    head.append(csp_header);

    const window_script = strippedDocument.createElement('script');

    window_script.innerHTML = `window.__EXTENSION_ID = '${extension_id}'; window.__KNOWN_IDENTIFIER = '${auth_key}';`;

    // window_script.nonce = 'nonced';
    // window_script.setAttribute('nonce', 'nonced');

    head.appendChild(window_script);

    const link_script = strippedDocument.createElement('script');
    link_script.src = `chrome-extension://${extension_id}/injected-scripts/links.js`;

    head.appendChild(link_script);

    const sx = new XMLSerializer();

    const doc_string = sx.serializeToString(strippedDocument);

    return doc_string;
  }, [strippedDocument, selectedTheme, url, extension_id, auth_key]);

  return (
    <div className="reader-content">
      {documentString && (
        <iframe id="reader-frame" srcDoc={documentString}></iframe>
      )}
    </div>
  );
}
