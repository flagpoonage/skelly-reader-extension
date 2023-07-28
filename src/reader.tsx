import './reader/reader.css';
import { renderElement } from './page-renderer';
import { ReaderContent } from './reader/ReaderContent';
import { ReaderControls } from './reader/ReaderControls';

function Reader() {
  const params = new URLSearchParams(window.location.search);
  const file = params.get('read') ?? null;

  return (
    <div className="reader">
      <ReaderContent file={file} />
      <ReaderControls />
    </div>
  );
}

renderElement(<Reader />);
