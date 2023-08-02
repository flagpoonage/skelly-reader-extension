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
      chrome.tabs.create({ url: `${app}#${active_tab.url}` });
    } else {
      chrome.tabs.update(first_tab_id, {
        active: true,
      });
    }
  };
  return (
    <div className='main-wrapper'>
      <div className="text-3xl font-bold underline">
        Hello world!
      </div> <br/>
      <button onClick={onClick}>Open App</button>
      <button
        onClick={() =>
          chrome.tabs.create({url: `${chrome.runtime.getURL('crypto.html')}`})
        }
      >
        Open Crypto
      </button>
    </div>
  );
}

renderElement(<Popup/>);
