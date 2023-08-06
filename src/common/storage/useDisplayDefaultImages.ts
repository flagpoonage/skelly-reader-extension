import { createStorageInterfaceFor } from './base';
import { createStateHook } from './hook';

export const displayDefaultImages = createStorageInterfaceFor<boolean>(
  'displayDefaultImages',
  chrome.storage.local,
);

export const useDisplayDefaultImages = createStateHook(displayDefaultImages);
