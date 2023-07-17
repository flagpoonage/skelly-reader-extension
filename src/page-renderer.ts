import { createRoot } from 'react-dom/client';

const root_id = 'root';

function getRoot() {
  const existing_root = document.getElementById(root_id);

  if (existing_root) {
    return existing_root;
  }

  const new_root = document.createElement('div');
  new_root.id = root_id;
  document.body.appendChild(new_root);
  return new_root;
}

export function renderElement(element: React.ReactElement) {
  function _render() {
    const root = createRoot(getRoot());
    root.render(element);
  }

  document.readyState === 'complete'
    ? _render()
    : document.addEventListener('DOMContentLoaded', _render);
}
