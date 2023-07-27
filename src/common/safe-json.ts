import { asSyncFailable } from './failable';

export function safeJson(value: string) {
  return asSyncFailable(() => JSON.parse(value));
}
