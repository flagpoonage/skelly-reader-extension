export interface InjectedWindow extends Window {
  __EXTENSION_ID: string;
  __KNOWN_IDENTIFIER: string;
}

export const InjectedWindow = window as unknown as InjectedWindow;
