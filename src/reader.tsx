import { renderElement } from './page-renderer';
import './popup/popup.css';

function Reader() {
  const params = new URLSearchParams(window.location.search);
  const file = params.get('read');
  return <div>Reading: {file}</div>;
}

renderElement(<Reader />);
