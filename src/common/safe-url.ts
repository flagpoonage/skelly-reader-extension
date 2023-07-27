import { asSyncFailable } from './failable';

export function safeUrl(url: string) {
  return asSyncFailable(() => new URL(url));
}
