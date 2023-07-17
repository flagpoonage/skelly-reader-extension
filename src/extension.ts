export const extension =
  'browser' in globalThis && browser.runtime ? browser : chrome;
