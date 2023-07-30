import { InjectedWindow } from './window';

function clickHandler(e: MouseEvent) {
  if (!e.target) {
    return;
  }

  const target = e.target;

  if (!(target instanceof HTMLAnchorElement)) {
    return;
  }

  window.postMessage(
    {
      known_id: InjectedWindow.__KNOWN_IDENTIFIER,
      type: 'link_activate',
      link_href: target.href,
    },
    `chrome-extension://${InjectedWindow.__EXTENSION_ID}`,
  );
}

function onLoad() {
  Array.from(document.querySelectorAll('a[href]')).forEach(
    (a) =>
      a instanceof HTMLAnchorElement &&
      a.addEventListener('click', clickHandler),
  );
}

document.readyState === 'loading'
  ? document.addEventListener('DOMContentLoaded', onLoad)
  : onLoad();
