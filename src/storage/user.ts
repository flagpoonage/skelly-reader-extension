import { isObject } from '../common/is';
import { extension } from '../extension';

export interface UserInStorage {
  id: string;
  domain: string;
}

export function isUserInStorage(value: unknown): value is UserInStorage {
  return (
    isObject(value) &&
    typeof value.id === 'string' &&
    typeof value.domain === 'string'
  );
}

export function setUserInStorage(id: string, domain: string) {
  return extension.storage.local.set({
    user: { id, domain },
  });
}

export async function getUserFromStorage() {
  const { user } = await extension.storage.local.get('user');

  if (!isUserInStorage(user)) {
    return null;
  }

  return user;
}
