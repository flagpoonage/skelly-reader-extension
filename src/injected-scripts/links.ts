// import { InjectedWindow } from './window';

function clickHandler(e: MouseEvent) {
  if (!e.target) {
    return;
  }

  const target = e.target;
  e.preventDefault();

  if (!(target instanceof HTMLAnchorElement)) {
    return;
  }

  window.parent.postMessage(
    {
      // ext_id: InjectedWindow.__EXTENSION_ID,
      // known_id: InjectedWindow.__KNOWN_IDENTIFIER,
      type: 'link_activate',
      link_href: target.href,
    },
    `*`,
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
