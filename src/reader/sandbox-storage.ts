import { configureStorage } from '../common/storage';
import { createWindowCommsStorageSlave } from '../common/storage/comms';

export const sandboxStorage = configureStorage(
  createWindowCommsStorageSlave(window.parent),
);
