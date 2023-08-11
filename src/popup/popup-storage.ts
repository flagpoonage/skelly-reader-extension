import { configureStorage } from '../common/storage';

export const popupStorage = configureStorage(chrome.storage.local);
