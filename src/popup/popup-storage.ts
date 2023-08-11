import { configureStorage } from '../common/storage';

export const storage = configureStorage(chrome.storage.local);
