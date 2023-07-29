import { createContext, useContext, useMemo, useState } from 'react';

export interface ReaderContextFields {
  selectedTheme: string | null;
}

export interface ReaderContextFunctions {
  setSelectedTheme: (v: string | null) => void;
}

export type ReaderContextValue = ReaderContextFields & ReaderContextFunctions;

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

  const functions = useMemo<ReaderContextFunctions>(() => {
    return {
      setSelectedTheme: (v: string | null) =>
        setCtx((p) => ({ ...p, selectedTheme: v })),
    };
  }, [setCtx]);

  const value = useMemo<ReaderContextValue>(
    () => Object.assign({}, functions, ctx),
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
