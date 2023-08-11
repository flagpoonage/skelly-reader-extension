import { ChangeEvent } from 'react';
// import { useReaderContext } from './ReaderContext';
import { sandboxStorage } from './sandbox-storage';
import { ReaderAddressBar } from './ReaderAddressBar';

const { useDefaultTheme, DefaultTheme } = sandboxStorage;

interface Props {
  currentUrl: string | undefined;
  onSubmitUrl: (url: string) => void;
}

export function ReaderControls({ currentUrl, onSubmitUrl }: Props) {
  function onChange(e: ChangeEvent<HTMLSelectElement>) {
    DefaultTheme.set(e.target.value);
  }

  const theme = useDefaultTheme();

  return (
    <footer className="reader-controls">
      <div>
        <select onChange={onChange} value={theme ?? 'none'}>
          <option value="none">No theme</option>
          <option value="greenscreen">Green Screen</option>
          <option value="jamesh.me">jamesh.me</option>
          <option value="esbuild">ESBuild</option>
          <option value="webpack">Webpack</option>
          <option value="overreacted">Overreacted</option>
          <option value="rust">Rust</option>
        </select>
      </div>
      <ReaderAddressBar currentUrl={currentUrl} onSubmitUrl={onSubmitUrl} />
    </footer>
  );
}
