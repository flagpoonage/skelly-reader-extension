import { ChangeEvent } from 'react';
// import { useReaderContext } from './ReaderContext';
import { storage } from './sandbox-storage';

const { useDefaultTheme } = storage;

export function ReaderControls() {
  // const ctx = useReaderContext();

  function onChange(e: ChangeEvent<HTMLSelectElement>) {
    storage.DefaultTheme.set(e.target.value);
    // ctx.setSelectedTheme(e.target.value);
  }

  const theme = useDefaultTheme();

  return (
    <footer className="reader-controls">
      <div>Reader Controls</div>
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
    </footer>
  );
}
