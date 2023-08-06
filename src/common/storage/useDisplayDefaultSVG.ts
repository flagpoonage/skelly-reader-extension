import { createStorageInterfaceFor } from './base';
import { createStateHook } from './hook';

export const displayDefaultSVG = createStorageInterfaceFor<boolean>(
  'displayDefaultSVG',
  chrome.storage.local,
);

export const useDisplayDefaultSVG = createStateHook(displayDefaultSVG);
