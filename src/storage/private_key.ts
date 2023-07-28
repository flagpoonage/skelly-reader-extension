import { extension } from '../extension';

export function setPrivateKeyInStorage(key: string) {
  return extension.storage.local.set({ private_key: key });
}

export async function getPrivateKeyFromStorage() {
  const { private_key } = await extension.storage.local.get('private_key');

  if (!private_key) {
    return null;
  }

  return private_key;
}
