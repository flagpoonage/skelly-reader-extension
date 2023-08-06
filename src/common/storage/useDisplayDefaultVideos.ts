import { createStorageInterfaceFor } from './base';
import { createStateHook } from './hook';

export const displayDefaultVideos = createStorageInterfaceFor<boolean>(
  'displayDefaultVideos',
  chrome.storage.local,
);

export const useDisplayDefaultVideos = createStateHook(displayDefaultVideos);
