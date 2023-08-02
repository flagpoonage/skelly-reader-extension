import { renderElement } from './page-renderer';
import './popup/popup.css';
import { Toggle } from "./components/Toggle";
import { Button } from "./components/Button";

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
    <div className='w-[350px] p-4'>
      <div className='flex justify-between items-center border-b-2 pb-2 mb-2'>
        <div className='text-2xl font-bold'>
          Skelly
        </div>
        <Button className='bg-purple-950 text-white'>
          Donate
        </Button>
      </div>
      <div className='grid gap-4'>
        <Toggle text='Load images'/>
        <Toggle text='Load videos'/>
        <div className='flex justify-between'>
          <Button onClick={onClick} className='bg-emerald-900 text-white'>Open App</Button>
          <Button
            className='bg-emerald-300'
            onClick={() =>
              chrome.tabs.create({url: `${chrome.runtime.getURL('crypto.html')}`})
            }
          >
            Open Crypto
          </Button>
        </div>
      </div>
    </div>
  );
}

renderElement(<Popup/>);
