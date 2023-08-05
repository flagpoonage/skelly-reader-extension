import { createStorageInterfaceFor } from './base';
import { createStateHook } from './hook';

export const someExampleBooleanValue = createStorageInterfaceFor<boolean>(
  'exampleKey',
  chrome.storage.local,
);

export const useExampleBoolean = createStateHook(someExampleBooleanValue);
