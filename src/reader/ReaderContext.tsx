import { createContext, useContext, useMemo, useRef, useState } from 'react';

export interface ReaderContextFields {
  selectedTheme: string | null;
}

export interface ReaderContextFunctions {
  setSelectedTheme: (v: string | null) => void;
  sendMessageToFrame: (v: unknown) => void;
}

export type ReaderContextValue = ReaderContextFields &
  ReaderContextFunctions & {
    contentFrameReference: React.MutableRefObject<HTMLIFrameElement | null>;
  };

export const ReaderContext = createContext<ReaderContextValue | null>(null);

function createDefaultContext(): ReaderContextFields {
  return {
    selectedTheme: null,
  };
}

export function ReaderContextProvider({
  children,
}: React.PropsWithChildren<unknown>) {
  const [ctx, setCtx] = useState<ReaderContextFields>(createDefaultContext());
  const contentFrameReference = useRef<HTMLIFrameElement | null>(null);

  const functions = useMemo<ReaderContextFunctions>(() => {
    return {
      setSelectedTheme: (v: string | null) =>
        setCtx((p) => ({ ...p, selectedTheme: v })),
      sendMessageToFrame: (v: unknown) => {
        if (contentFrameReference.current) {
          contentFrameReference.current.contentWindow?.postMessage(v, '*');
        }
      },
    };
  }, [setCtx]);

  const value = useMemo<ReaderContextValue>(
    () => Object.assign({}, functions, ctx, { contentFrameReference }),
    [functions, ctx],
  );

  return (
    <ReaderContext.Provider value={value}>{children}</ReaderContext.Provider>
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
