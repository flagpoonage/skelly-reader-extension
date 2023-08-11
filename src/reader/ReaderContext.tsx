import {
  createContext,
  useContext,
  useRef,
  PropsWithChildren,
  MutableRefObject,
} from 'react';

export type ReaderContextValue = {
  contentFrameReference: MutableRefObject<HTMLIFrameElement | null>;
  sendMessageToFrame: (v: unknown) => void;
};

export const ReaderContext = createContext<ReaderContextValue | null>(null);

export function ReaderContextProvider({
  children,
}: PropsWithChildren<unknown>) {
  const contentFrameReference = useRef<HTMLIFrameElement | null>(null);

  const sendMessageToFrame = (v: unknown) => {
    if (contentFrameReference.current) {
      contentFrameReference.current.contentWindow?.postMessage(v, '*');
    }
  };

  return (
    <ReaderContext.Provider
      value={{ contentFrameReference, sendMessageToFrame }}
    >
      {children}
    </ReaderContext.Provider>
  );
}

export function useReaderContext() {
  const ctx = useContext(ReaderContext);

  if (!ctx) {
    throw new Error(
      'useReaderContext must be used within a <ReaderContextProvider> tree.',
    );
  }

  return ctx;
}
