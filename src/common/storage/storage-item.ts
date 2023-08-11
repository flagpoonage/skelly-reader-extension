import {
  ExtensionStorageOf,
  StorageSystem,
  createStorageInterfaceFor,
} from './base';
import { createStateHook } from './hook';

export function configureStorageItem<TYPE, K extends string = string>(
  name: string,
  storage: StorageSystem = chrome.storage.local,
) {
  const storageInterface = createStorageInterfaceFor<TYPE>(name, storage);
  const storageHook = createStateHook(storageInterface);

  return {
    [`use${name}`]: storageHook,
    [name]: storageInterface,
  } as {
    [X in `use${K}` | K]: X extends `use${K}`
      ? () => TYPE | undefined
      : X extends K
      ? ExtensionStorageOf<TYPE>
      : never;
  };
}

const c = configureStorageItem<number, 'Anastatus'>(
  'Anastatus',
  chrome.storage.local,
);

c.useAnastatus();
