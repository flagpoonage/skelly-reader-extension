import { ChangeEvent } from 'react';
import { useReaderContext } from './ReaderContext';

export function ReaderControls() {
  const ctx = useReaderContext();

  function onChange(e: ChangeEvent<HTMLSelectElement>) {
    ctx.setSelectedTheme(e.target.value === 'none' ? null : e.target.value);
  }

  return (
    <footer className="reader-controls">
      <div>Reader Controls</div>
      <div>
        <select onChange={onChange} value={ctx.selectedTheme ?? 'none'}>
          <option value="none">No theme</option>
          <option value="greenscreen">Green Screen</option>
          <option value="jamesh.me">jamesh.me</option>
          <option value="esbuild">ESBuild</option>
          <option value="webpack">Webpack</option>
          <option value="overreacted">Overreacted</option>
        </select>
      </div>
    </footer>
  );
}
