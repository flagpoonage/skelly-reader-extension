export function safeUrl(url: string) {
  try {
    return new URL(url);
  } catch (ex) {
    return;
  }
}
