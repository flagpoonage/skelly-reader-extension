// import { InjectedWindow } from './window';

function findLinkParent(target: Node | Element): HTMLAnchorElement | null {
  const parent = target.parentElement;

  if (!parent) {
    return null;
  }

  if (parent.tagName === 'A') {
    return parent as HTMLAnchorElement;
  }

  return findLinkParent(parent);
}

function clickHandler(e: MouseEvent) {
  if (!e.target) {
    return;
  }

  const target = e.target;

  const link =
    target instanceof HTMLAnchorElement
      ? target
      : findLinkParent(target as Node | Element);

  if (!link) {
    return;
  }

  const href = link.href;

  if (!href) {
    return;
  }

  if (!href.startsWith('about:srcdoc#')) {
    e.preventDefault();

    window.parent.postMessage(
      {
        // ext_id: InjectedWindow.__EXTENSION_ID,
        // known_id: InjectedWindow.__KNOWN_IDENTIFIER,
        type: 'link_activate',
        link_href: href,
      },
      `*`,
    );
  } else {
    window.parent.postMessage(
      {
        type: 'anchor_activate',
        anchor_name: href.split('about:srcdoc#')[1],
      },
      '*',
    );
  }
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
