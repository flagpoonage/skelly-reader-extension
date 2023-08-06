import { TopLevelInformation } from '../reader/reader-messaging';

export function setTopLevel(info: Partial<TopLevelInformation['info']>) {
  // Fix this with propert window defs
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const c = (window as any)._tl;

  if (c) {
    // Fix this with propert window defs
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any)._tl = Object.assign({}, c, info);
  } else {
    // Fix this with propert window defs
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any)._tl = info;
  }
}

export function getTopLevel(): TopLevelInformation['info'] | undefined {
  // Fix this with propert window defs
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (window as any)._tl as TopLevelInformation['info'] | undefined;
}
