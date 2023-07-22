export function isObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

export function isArray<T = unknown>(
  value: unknown,
  typeValidation?: (v: unknown) => v is T,
): value is T[] {
  return (
    Array.isArray(value) && (!typeValidation || value.every(typeValidation))
  );
}
