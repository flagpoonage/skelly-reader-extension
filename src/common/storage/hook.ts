import { useState, useEffect } from 'react';
import { ExtensionStorageOf } from './base';

export function createStateHook<T>(
  intf: ExtensionStorageOf<T>,
  callback?: () => void | undefined,
) {
  return function useStorageState() {
    const [data, setData] = useState<T>();

    useEffect(() => {
      const listener = (newv: T | undefined, oldv: T | undefined, v: boolean, key: string) => {
        console.log(`KEY >>> ${key}`, newv)
        setData(newv);
      }
      intf.onChange.addListener(listener, true);

      if (callback) {
        callback();
      }

      return () => {
        intf.onChange.removeListener(listener);
      };
    }, []);

    return data;
  };
}
