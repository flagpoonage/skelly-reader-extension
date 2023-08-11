import {
  ValidatorFunctionResultType,
  makeTypeAssertion,
  DW as v,
} from 'dealwith';
import {
  ExtensionStorageListener,
  ExtensionStorageOf,
  StorageSystem,
} from './base';

const storageGetRequestSchema = v.object().schema({
  type: v.string().equals('__storage_comms_request'),
  operation: v.object().schema({
    request_id: v.string(),
    method: v.string().equals('get'),
    key: v.string(),
  }),
});

const storageGetResponseSchema = v.object().schema({
  type: v.string().equals('__storage_commands_response'),
  operation: v.object().schema({
    request_id: v.string(),
    method: v.string().equals('get'),
    key: v.string(),
  }),
  response: v.anything(),
});

const storageSetRequestSchema = v.object().schema({
  type: v.string().equals('__storage_comms_request'),
  operation: v.object().schema({
    request_id: v.string(),
    method: v.string().equals('set'),
    key: v.string(),
    value: v.anything(),
  }),
});

const storageRemoveRequestSchema = v.object().schema({
  type: v.string().equals('__storage_comms_request'),
  operation: v.object().schema({
    request_id: v.string(),
    method: v.string().equals('remove'),
    keys: v.oneof(v.string(), v.array().items(v.string())),
  }),
});

export type StorageGetRequest = ValidatorFunctionResultType<
  typeof storageGetRequestSchema
>;

export type StorageGetResponse = ValidatorFunctionResultType<
  typeof storageGetResponseSchema
>;

export type StorageSetRequest = ValidatorFunctionResultType<
  typeof storageSetRequestSchema
>;

export type StorageRemoveRequest = ValidatorFunctionResultType<
  typeof storageRemoveRequestSchema
>;

export const isStorageGetRequest = makeTypeAssertion(storageGetRequestSchema);
export const isStorageGetResponse = makeTypeAssertion(storageGetResponseSchema);
export const isStorageSetRequest = makeTypeAssertion(storageGetRequestSchema);
export const isStorageRemoveRequest = makeTypeAssertion(
  storageRemoveRequestSchema,
);

export function createStorageGetRequest(key: string): StorageGetRequest {
  return {
    type: '__storage_comms_request',
    operation: {
      request_id: crypto.randomUUID(),
      method: 'get',
      key,
    },
  };
}

export function createStorageSetRequest(
  key: string,
  v: unknown,
): StorageSetRequest {
  return {
    type: '__storage_comms_request',
    operation: {
      request_id: crypto.randomUUID(),
      method: 'set',
      key,
      value: v,
    },
  };
}

export function createStorageRemoveRequest(
  keys: string | string[],
): StorageRemoveRequest {
  return {
    type: '__storage_comms_request',
    operation: {
      request_id: crypto.randomUUID(),
      method: 'remove',
      keys,
    },
  };
}

export function createWindowCommsStorageSytem(target: Window): StorageSystem {
  const request_resolvers = new Map<string, (v: unknown) => void>();

  window.addEventListener('message', (ev) => {
    if (isStorageGetResponse(ev.data)) {
      const resolver = request_resolvers.get(ev.data.operation.request_id);

      if (!resolver) {
        console.error('Missing resolver for request', ev.data.operation);
        return;
      }

      resolver(ev.data.response);
    }
  });

  const get: StorageSystem['get'] = function <K extends string>(key: K) {
    const request = createStorageGetRequest(key);

    return new Promise<{ [X in K]: unknown }>((rs, reject) => {
      const resolver = (v: unknown) => {
        request_resolvers.delete(request.operation.request_id);
        rs({ [key]: v } as { [X in K]: unknown });
      };

      request_resolvers.set(request.operation.request_id, resolver);
      target.postMessage(request);

      setTimeout(() => {
        if (request_resolvers.has(request.operation.request_id)) {
          reject(new Error('Storage comms request timed out'));
        }
      }, 1000);
    });
  };

  const set: StorageSystem['set'] = function (v) {
    const [key, value] = Object.entries(v)[0];
    const request = createStorageSetRequest(key, value);

    return new Promise<void>((rs, reject) => {
      const resolver = (v: any) => {
        request_resolvers.delete(request.operation.request_id);
        rs(v);
      };

      request_resolvers.set(request.operation.request_id, resolver);
      target.postMessage(request);

      setTimeout(() => {
        if (request_resolvers.has(request.operation.request_id)) {
          reject(new Error('Storage comms request timed out'));
        }
      }, 1000);
    });
  };

  const remove: StorageSystem['remove'] = function (v) {
    const request = createStorageRemoveRequest(v);

    return new Promise<void>((rs, reject) => {
      const resolver = (v: any) => {
        request_resolvers.delete(request.operation.request_id);
        rs(v);
      };

      request_resolvers.set(request.operation.request_id, resolver);
      target.postMessage(request);

      setTimeout(() => {
        if (request_resolvers.has(request.operation.request_id)) {
          reject(new Error('Storage comms request timed out'));
        }
      }, 1000);
    });
  };

  const onChanged = {
    addListener: (cb: ExtensionStorageListener) => void 0,
    removeListener: () => void 0,
  };

  return { get, set, remove, onChanged };
}

export function createCommsStorageInterfaceFor<T>(
  key: string,
): ExtensionStorageOf<T> {
  return createStorageInterfaceFor<T>(key);
}
