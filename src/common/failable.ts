export interface FailableSuccess<T = unknown> {
  success: true;
  value: T;
}

export interface FailableError<E extends Error = Error> {
  success: false;
  error: E;
}

export type FailableResult<T = unknown, E extends Error = Error> =
  | FailableSuccess<T>
  | FailableError<E>;

export async function asFailable<T = unknown, E extends Error = Error>(
  handler: () => Promise<T>,
): Promise<FailableResult<T, E>> {
  try {
    const result = await handler();
    return { success: true, value: result };
  } catch (exception) {
    // Not type safe, we don't know if it's really that kind of error
    if (exception instanceof Error) {
      return { success: false, error: exception as E };
    }

    const error = new Error(JSON.stringify(exception));

    return { success: false, error: error as E };
  }
}

export function asSyncFailable<T = unknown, E extends Error = Error>(
  handler: () => T,
): FailableResult<T, E> {
  try {
    const result = handler();
    return { success: true, value: result };
  } catch (exception) {
    // Not type safe, we don't know if it's really that kind of error
    if (exception instanceof Error) {
      return { success: false, error: exception as E };
    }

    const error = new Error(JSON.stringify(exception));

    return { success: false, error: error as E };
  }
}
