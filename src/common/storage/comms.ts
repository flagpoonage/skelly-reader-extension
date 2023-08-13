import {
  ValidatorFunctionResultType,
  makeTypeAssertion,
  DW as v,
} from 'dealwith';
import { ExtensionStorageListener, StorageSystem } from './base';
import { asFailable } from '../failable';

const storageGetRequestSchema = v.object().schema({
  type: v.string().equals('__storage_comms_request'),
  operation: v.object().schema({
    request_id: v.string(),
    method: v.string().equals('get'),
    key: v.string(),
  }),
});

const storageGetResponseSchema = v.object().schema({
  type: v.string().equals('__storage_comms_response'),
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

const storageSetResponseSchema = v.object().schema({
  type: v.string().equals('__storage_comms_response'),
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

const storageRemoveResponseSchema = v.object().schema({
  type: v.string().equals('__storage_comms_response'),
  operation: v.object().schema({
    request_id: v.string(),
    method: v.string().equals('remove'),
    keys: v.oneof(v.string(), v.array().items(v.string())),
  }),
});

const storageChangeNotificationSchema = v.object().schema({
  type: v.string().equals('__storage_change_notification'),
  changes: v.record(
    v.object().schema({
      newValue: v.optional(v.anything()),
      oldValue: v.optional(v.anything()),
    }),
  ),
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

export type StorageSetResponse = ValidatorFunctionResultType<
  typeof storageSetResponseSchema
>;

export type StorageRemoveRequest = ValidatorFunctionResultType<
  typeof storageRemoveRequestSchema
>;

export type StorageRemoveResponse = ValidatorFunctionResultType<
  typeof storageRemoveResponseSchema
>;

export type StorageChangeNotification = ValidatorFunctionResultType<
  typeof storageChangeNotificationSchema
>;

export const isStorageGetRequest = makeTypeAssertion(storageGetRequestSchema);
export const isStorageGetResponse = makeTypeAssertion(storageGetResponseSchema);
export const isStorageSetRequest = makeTypeAssertion(storageSetRequestSchema);
export const isStorageSetResponse = makeTypeAssertion(storageSetResponseSchema);
export const isStorageRemoveRequest = makeTypeAssertion(
  storageRemoveRequestSchema,
);
export const isStorageRemoveResponse = makeTypeAssertion(
  storageRemoveResponseSchema,
);
export const isStorageChangeNotification = makeTypeAssertion(
  storageChangeNotificationSchema,
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
export function createStorageGetResponse(
  operation: StorageGetRequest['operation'],
  value: unknown,
): StorageGetResponse {
  return {
    type: '__storage_comms_response',
    operation,
    response: value,
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

export function createStorageSetResponse(
  operation: StorageSetRequest['operation'],
): StorageSetResponse {
  return {
    type: '__storage_comms_response',
    operation,
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

export function createStorageRemoveResponse(
  operation: StorageRemoveRequest['operation'],
): StorageRemoveResponse {
  return {
    type: '__storage_comms_response',
    operation,
  };
}

export function createStorageChangeNotification(changes: {
  [K in string]: chrome.storage.StorageChange;
}): StorageChangeNotification {
  return {
    type: '__storage_change_notification',
    changes: changes as {
      [K in string]: { newValue: unknown; oldValue: unknown };
    },
  };
}

export function createWindowCommsStorageOracle(
  system: StorageSystem = chrome.storage.local,
) {
  const windows_to_notify: Window[] = [];

  system.onChanged.addListener((c) => {
    if (windows_to_notify.length === 0) {
      return;
    }

    const notification = createStorageChangeNotification(c);

    windows_to_notify.forEach((w) => w.postMessage(notification, '*'));
  });

  window.addEventListener('message', async (ev) => {
    function isWindow(src: MessageEventSource | null): src is Window {
      if (!src) {
        console.error('Expected message source but found none');
        return false;
      }

      if (!('self' in src)) {
        console.error('Expected message source to be a window but it wasnt');
        return false;
      }
      return true;
    }

    if (ev.data === 'notify_storage_change') {
      if (!isWindow(ev.source)) {
        return;
      }

      if (windows_to_notify.indexOf(ev.source) !== -1) {
        return;
      }

      windows_to_notify.push(ev.source);
    } else if (isStorageGetRequest(ev.data)) {
      if (!isWindow(ev.source)) {
        return;
      }

      const key = ev.data.operation.key;

      const result = await asFailable(() => system.get(key));

      if (!result.success) {
        console.error('Failed to retrieve storage value', result.error);
        return;
      }

      const response = createStorageGetResponse(
        ev.data.operation,
        result.value,
      );

      ev.source.postMessage(response, '*');
    } else if (isStorageSetRequest(ev.data)) {
      if (!isWindow(ev.source)) {
        return;
      }

      const key = ev.data.operation.key;
      const value = ev.data.operation.value;

      const result = await asFailable(() => system.set({ [key]: value }));

      if (!result.success) {
        console.error('Failed to set storage value', result.error);
        return;
      }

      const response = createStorageSetResponse(ev.data.operation);

      ev.source.postMessage(response, '*');
    } else if (isStorageRemoveRequest(ev.data)) {
      if (!isWindow(ev.source)) {
        return;
      }

      const keys = ev.data.operation.keys;

      const result = await asFailable(() => system.remove(keys));

      if (!result.success) {
        console.error('Failed to remove storage value(s)', result.error);
        return;
      }

      const response = createStorageRemoveResponse(ev.data.operation);

      ev.source.postMessage(response, '*');
    }
  });
}

export function createWindowCommsStorageSlave(target: Window): StorageSystem {
  const request_resolvers = new Map<string, (v: unknown) => void>();
  const listeners: ExtensionStorageListener[] = [];

  target.postMessage('notify_storage_change', '*');

  window.addEventListener('message', (ev) => {
    if (isStorageGetResponse(ev.data)) {
      const resolver = request_resolvers.get(ev.data.operation.request_id);

      if (!resolver) {
        console.error('Missing resolver for request', ev.data.operation);
        return;
      }

      resolver(ev.data.response);
    }
    if (isStorageSetResponse(ev.data) || isStorageRemoveResponse(ev.data)) {
      const resolver = request_resolvers.get(ev.data.operation.request_id);

      if (!resolver) {
        console.error('Missing resolver for request', ev.data.operation);
        return;
      }

      resolver(void 0);
    }
    if (isStorageChangeNotification(ev.data)) {
      const changes = ev.data.changes;
      listeners.forEach((l) => l(changes));
    }
  });

  const get: StorageSystem['get'] = function <K extends string>(key: K) {
    const request = createStorageGetRequest(key);

    return new Promise<{ [X in K]: unknown }>((rs, reject) => {
      const resolver = (v: unknown) => {
        request_resolvers.delete(request.operation.request_id);
        rs(v as { [X in K]: unknown });
      };

      request_resolvers.set(request.operation.request_id, resolver);
      target.postMessage(request, '*');

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
      const resolver = () => {
        request_resolvers.delete(request.operation.request_id);
        rs();
      };

      request_resolvers.set(request.operation.request_id, resolver);
      target.postMessage(request, '*');

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
      const resolver = () => {
        request_resolvers.delete(request.operation.request_id);
        rs();
      };

      request_resolvers.set(request.operation.request_id, resolver);
      target.postMessage(request, '*');

      setTimeout(() => {
        if (request_resolvers.has(request.operation.request_id)) {
          reject(new Error('Storage comms request timed out'));
        }
      }, 1000);
    });
  };

  const onChanged = {
    addListener: (cb: ExtensionStorageListener) => {
      if (listeners.indexOf(cb) !== -1) {
        return;
      }

      listeners.push(cb);
    },
    removeListener: (cb: ExtensionStorageListener) => {
      const idx = listeners.indexOf(cb);

      if (idx === -1) {
        return;
      }

      listeners.splice(idx, 1);
    },
  };

  return { get, set, remove, onChanged };
}
