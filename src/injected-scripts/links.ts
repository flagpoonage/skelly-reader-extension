// import { InjectedWindow } from './window';

import {
  createAnchorActivateMessage,
  createLinkActivateMessage,
} from '../reader/reader-messaging';
import { getTopLevel } from './top-level';

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

  const current_location = getTopLevel()?.source_url ?? '';

  if (!current_location) {
    console.error('Unknown top level');
  }

  const href_url = new URL(href);

  const new_location = `${href_url.origin}${href_url.pathname}`;

  e.preventDefault();

  if (current_location === new_location) {
    const hash_differs = getTopLevel()?.hash !== href_url.hash;
    const anchor_name = href_url.hash.split('#').slice(1).join('#');

    if (hash_differs) {
      window.parent.postMessage(createAnchorActivateMessage(anchor_name), '*');
    } else {
      // We're not going to do any hash or history changing, but we still want to scroll
      // to the correct element in this case
      const el = document.getElementById(anchor_name);

      if (!el) {
        return;
      }

      el.scrollIntoView(true);
    }
  } else {
    window.parent.postMessage(
      createLinkActivateMessage({ link_href: href }),
      `*`,
    );
  }

  // if (!href.startsWith('about:srcdoc#')) {
  // } else {
  //   // This fucks with history if we allow the link to actually activate,
  //   // so it's simulating by scrolling the target anchor into view and telling
  //   // the extension to update it's URL.
  //   e.preventDefault();
  //   const anchor_name = href.split('about:srcdoc#')[1];

  //   const el = document.getElementById(anchor_name);

  //   if (!el) {
  //     return;
  //   }

  //   el.scrollIntoView(true);

  //   window.parent.postMessage(createAnchorActivateMessage(anchor_name), '*');
  // }
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
