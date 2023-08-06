// import { InjectedWindow } from './window';

import {
  createAnchorActivateMessage,
  createLinkActivateMessage,
} from '../reader/reader-messaging';

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

  if (e.ctrlKey || e.shiftKey || e.metaKey || e.button !== 0) {
    // Only intercept normal link clicks, otherwise just let the browser
    // do what it wants to
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
      createLinkActivateMessage({ link_href: href }),
      `*`,
    );
  } else {
    // This fucks with history if we allow the link to actually activate,
    // so it's simulating by scrolling the target anchor into view and telling
    // the extension to update it's URL.
    e.preventDefault();
    const anchor_name = href.split('about:srcdoc#')[1];

    const el = document.getElementById(anchor_name);

    if (!el) {
      return;
    }

    el.scrollIntoView(true);

    window.parent.postMessage(createAnchorActivateMessage(anchor_name), '*');
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
