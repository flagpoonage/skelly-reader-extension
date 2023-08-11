import { configureStorage } from '../common/storage';
import { createWindowCommsStorageSlave } from '../common/storage/comms';

export const storage = configureStorage(
  createWindowCommsStorageSlave(window.parent),
);
