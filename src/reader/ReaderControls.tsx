import { ChangeEvent } from 'react';
import { sandboxStorage } from './sandbox-storage';

const { useDefaultTheme, DefaultTheme } = sandboxStorage;

export function ReaderControls() {
  function onChange(e: ChangeEvent<HTMLSelectElement>) {
    DefaultTheme.set(e.target.value);
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
