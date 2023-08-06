import { createStorageInterfaceFor } from './base';
import { createStateHook } from './hook';

export const defaultTheme = createStorageInterfaceFor<string>(
  'defaultTheme',
  chrome.storage.local,
);

export const useDefaultTheme = createStateHook(defaultTheme);
