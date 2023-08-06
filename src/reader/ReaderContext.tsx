import {
  createContext,
  useContext,
  useMemo,
  useRef,
  useState,
  PropsWithChildren,
  MutableRefObject, useEffect
} from 'react';
import {
  displayDefaultVideos,
  displayDefaultImages,
  displayDefaultSVG,
  defaultTheme
} from "../storage/defaults";

export interface ReaderContextFields {
  selectedTheme: string | null;
  displayImages: boolean
  displaySVG: boolean
  displayVideos: boolean
}

export interface ReaderContextFunctions {
  setSelectedTheme: (v: string | null) => void;
  sendMessageToFrame: (v: unknown) => void;
  displayImages: (v: boolean) => void
  displaySVG: (v: boolean) => void
  displayVideos: (v: boolean) => void
}

export type ReaderContextValue = ReaderContextFields &
  ReaderContextFunctions & {
  contentFrameReference: MutableRefObject<HTMLIFrameElement | null>;
};

export const ReaderContext = createContext<ReaderContextValue | null>(null);

function createDefaultContext(): ReaderContextFields {
  return {
    selectedTheme: 'none',
    displayImages: false,
    displaySVG: true,
    displayVideos: false
  };
}

export function ReaderContextProvider({
                                        children,
                                      }: PropsWithChildren<unknown>) {
  const [ctx, setCtx] = useState<ReaderContextFields>(createDefaultContext());
  const contentFrameReference = useRef<HTMLIFrameElement | null>(null);

  const functions = useMemo<ReaderContextFunctions>(() => {
    return {
      setSelectedTheme: (v: string | null) =>
        setCtx((p) => ({...p, selectedTheme: v})),
      sendMessageToFrame: (v: unknown) => {
        if (contentFrameReference.current) {
          contentFrameReference.current.contentWindow?.postMessage(v, '*');
        }
      },
      displayImages: (v: boolean) => setCtx((p) => ({...p, displayImages: v})),
      displaySVG: (v: boolean) => setCtx((p) => ({...p, displaySVG: v})),
      displayVideos: (v: boolean) => setCtx((p) => ({...p, displayVideos: v}))
    };
  }, [setCtx]);

  const value = useMemo<ReaderContextValue>(
    () => Object.assign({}, functions, ctx, {contentFrameReference}),
    [functions, ctx],
  );

  const setDefaultValues = async () => {
    const defaultImages = await displayDefaultImages.get()
    const defaultSVG = await displayDefaultSVG.get()
    const defaultVideos = await displayDefaultVideos.get()
    const defaultThemeValue = await defaultTheme.get()

    setCtx(({
      displayImages: defaultImages,
      displayVideos: defaultVideos,
      displaySVG: defaultSVG,
      selectedTheme: defaultThemeValue
    }))
  }

  useEffect(() => {
    setDefaultValues()
  }, []);

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
