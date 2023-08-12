import { StorageSystem } from './base';
import { configureStorageItem } from './storage-item';

export function configureStorage(system: StorageSystem = chrome.storage.local) {
  return {
    ...configureStorageItem<string, 'DefaultTheme'>('DefaultTheme', system),
    ...configureStorageItem<boolean, 'DisplayDefaultImages'>(
      'DisplayDefaultImages',
      system,
    ),
    ...configureStorageItem<boolean, 'DisplayDefaultSVG'>(
      'DisplayDefaultSVG',
      system,
    ),
    ...configureStorageItem<boolean, 'DisplayDefaultVideos'>(
      'DisplayDefaultVideos',
      system,
    ),
  };
}
