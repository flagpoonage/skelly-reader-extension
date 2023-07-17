import { renderElement } from './page-renderer';
import './popup/popup.css';

function Popup() {
  const onClick = async () => {
    const app = chrome.runtime.getURL('reader.html');
    const current_window = await chrome.windows.getCurrent();

    const [active_tab] = await chrome.tabs.query({
      active: true,
      windowId: current_window.id,
    });

    const tabs = await chrome.tabs.query({
      url: app,
      windowId: current_window?.id,
    });

    const first_tab_id = tabs?.[0]?.id;

    if (typeof first_tab_id !== 'number') {
      chrome.tabs.create({ url: `${app}?read=${active_tab.url}` });
    } else {
      chrome.tabs.update(first_tab_id, {
        active: true,
      });
    }
  };
  return (
    <div>
      <button onClick={onClick}>Open App</button>
    </div>
  );
}

renderElement(<Popup />);
