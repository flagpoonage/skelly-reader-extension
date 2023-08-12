export type StorageListener<T> = (
  newValue: T | undefined,
  oldValue: T | undefined,
  triggeredOnAssign: boolean,
  key: string,
) => void | Promise<void>;

export type ExtensionSessionStorageArea = chrome.storage.SessionStorageArea;
export type ExtensionLocalStorageArea = chrome.storage.LocalStorageArea;
export type ExtensionStorageArea = chrome.storage.StorageArea;
export type ExtensionStorageChange = chrome.storage.StorageChange;

export type ExtensionStorageListener = (changes: {
  [key: string]: ExtensionStorageChange;
}) => void;

type StorageTransactionFunction<T, K> = (
  fns: ExtensionStorageTransactionOf<T>,
) => Promise<K>;

type StorageTransaction<T> = <K = void>(
  t: StorageTransactionFunction<T, K>,
) => Promise<K>;

export interface ExtensionStorageOf<T> {
  get: () => Promise<T | undefined>;
  getAndRemove: () => Promise<T | undefined>;
  transact: StorageTransaction<T>;
  set: (v: T | undefined) => Promise<void>;
  remove: () => Promise<void>;
  onChange: {
    addListener: (
      callback: StorageListener<T>,
      triggerOnAssigned?: boolean,
    ) => void;
    removeListener: (callback: StorageListener<T>) => void;
  };
}

export type ExtensionStorageTransactionOf<T> = Omit<
  ExtensionStorageOf<T>,
  'onChange' | 'transact'
>;

export interface StorageChannel {
  // Inference type only, any is necessary.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  set: (items: { [key: string]: any }) => Promise<void>;
  // Inference type only, any is necessary.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get: <K extends string>(key: K) => Promise<{ [X in K]: any }>;
  remove: (keys: string | string[]) => Promise<void>;
  onChanged: {
    addListener: (cb: ExtensionStorageListener) => void;
    removeListener: (cb: ExtensionStorageListener) => void;
  };
}

export type StorageSystem = StorageChannel;

// Inference type only, any is necessary.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ExtractExtensionStorageType<T extends ExtensionStorageOf<any>> =
  T extends ExtensionStorageOf<infer V> ? V : never;

function createStorageTransactionFunctions<T>(
  key: string,
  area: StorageSystem,
) {
  const getter = async () => {
    const stored_data = await area.get(key);
    return stored_data[key] as T | undefined;
  };

  const getAndRemover = async () => {
    const value = await getter();
    await remover();
    return value;
  };

  const setter = async (v: T | undefined) => {
    return await area.set({ [key]: v });
  };

  const remover = async () => {
    return await area.remove(key);
  };

  return {
    get: getter,
    getAndRemove: getAndRemover,
    set: setter,
    remove: remover,
  };
}

export function createStorageInterfaceFor<T>(
  key: string,
  area: StorageSystem,
): ExtensionStorageOf<T> {
  type K = T | undefined;

  const _listeners = new Map<StorageListener<T>, ExtensionStorageListener>();
  let _transaction = Promise.resolve();

  const fns = createStorageTransactionFunctions<T>(key, area);

  const transact = <R>(trans: StorageTransactionFunction<T, R>): Promise<R> => {
    return new Promise<R>((rs, rj) => {
      _transaction = _transaction
        .then(async () => {
          try {
            const result = await trans(fns);
            rs(result);
          } catch (ex) {
            rj(ex);
          }
        })
        .catch(rj);
    });
  };

  const getter = async () => {
    return new Promise<T | undefined>((rs, rj) => {
      _transaction = _transaction.then(async () => {
        try {
          rs(await fns.get());
        } catch (ex) {
          return rj(ex);
        }
      });
    });
  };

  const getAndRemover = async () => {
    return new Promise<T | undefined>((rs, rj) => {
      _transaction = _transaction.then(async () => {
        try {
          rs(await fns.getAndRemove());
        } catch (ex) {
          return rj(ex);
        }
      });
    });
  };

  const setter = async (v: K) => {
    return new Promise<void>((rs, rj) => {
      _transaction = _transaction.then(async () => {
        try {
          rs(await fns.set(v));
        } catch (ex) {
          return rj(ex);
        }
      });
    });
  };

  const remover = async () => {
    return new Promise<void>((rs, rj) => {
      _transaction = _transaction.then(async () => {
        try {
          rs(await fns.remove());
        } catch (ex) {
          return rj(ex);
        }
      });
    });
  };

  const onChange = {
    addListener: (callback: StorageListener<T>, triggerOnAssigned = false) => {
      const listener: ExtensionStorageListener = (changes) => {
        if (!changes[key]) {
          return;
        }

        callback(changes[key].newValue, changes[key].oldValue, false, key);
      };

      try {
        area.onChanged.addListener(listener);
      } catch (ex) {
        return;
      }

      _listeners.set(callback, listener);

      if (triggerOnAssigned) {
        (async () => {
          const existing = await area.get(key);
          callback(existing[key], existing[key], true, key);
        })();
      }
    },
    removeListener: (callback: StorageListener<T>) => {
      const listener = _listeners.get(callback);

      if (!listener) {
        return;
      }

      try {
        area.onChanged.removeListener(listener);
      } catch (ex) {
        return;
      }
    },
  };

  return {
    get: getter,
    getAndRemove: getAndRemover,
    set: setter,
    transact,
    remove: remover,
    onChange,
  };
}
