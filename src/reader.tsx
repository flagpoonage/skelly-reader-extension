import './reader/reader.css';
import { renderElement } from './page-renderer';
import { ReaderContent } from './reader/ReaderContent';
import { ReaderControls } from './reader/ReaderControls';
import { ReaderContextProvider } from './reader/ReaderContext';

function Reader() {
  const params = new URLSearchParams(window.location.search);
  const file = params.get('read') ?? null;

  return (
    <ReaderContextProvider>
      <div className="reader">
        <ReaderControls />
        <ReaderContent file={file} />
      </div>
    </ReaderContextProvider>
  );
}

renderElement(<Reader />);
