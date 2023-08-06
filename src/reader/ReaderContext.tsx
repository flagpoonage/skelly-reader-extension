import {
  createContext,
  useContext,
  useMemo,
  useRef,
  useState,
  PropsWithChildren,
  MutableRefObject, useEffect
} from 'react';
import { displayDefaultImages } from "../common/storage/useDisplayDefaultImages";
import { displayDefaultSVG } from "../common/storage/useDisplayDefaultSVG";
import { displayDefaultVideos } from "../common/storage/useDisplayDefaultVideos";
import { defaultTheme } from "../common/storage/useDefaultTheme";

export interface ReaderContextFields {
  selectedTheme: string;
  displayImages: boolean
  displaySVG: boolean
  displayVideos: boolean
}

export interface ReaderContextFunctions {
  setSelectedTheme: (v: string) => void;
  sendMessageToFrame: (v: unknown) => void;
  setDisplayImages: (v: boolean) => void
  setDisplaySVG: (v: boolean) => void
  setDisplayVideos: (v: boolean) => void
}

export type ReaderContextValue = ReaderContextFields &
  ReaderContextFunctions & {
  contentFrameReference: MutableRefObject<HTMLIFrameElement | null>;
};

export const ReaderContext = createContext<ReaderContextValue | null>(null);

export function createDefaultContext(): ReaderContextFields {
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
      setSelectedTheme: (v: string) => setCtx((p) => ({...p, selectedTheme: v})),
      sendMessageToFrame: (v: unknown) => {
        if (contentFrameReference.current) {
          contentFrameReference.current.contentWindow?.postMessage(v, '*');
        }
      },
      setDisplayImages: (v: boolean) => setCtx((p) => ({...p, displayImages: v})),
      setDisplaySVG: (v: boolean) => setCtx((p) => ({...p, displaySVG: v})),
      setDisplayVideos: (v: boolean) => setCtx((p) => ({...p, displayVideos: v})),
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
      displayImages: !!defaultImages,
      displayVideos: !!defaultVideos,
      displaySVG: !!defaultSVG ?? true,
      selectedTheme: defaultThemeValue ?? 'none'
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
