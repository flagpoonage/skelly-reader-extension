import { renderElement } from './page-renderer';
import './popup/popup.css';
import { Toggle } from "./components/Toggle";
import { Button } from "./components/Button";
import { Select } from "./components/Select";
import { themes } from "./common/themes";
import { ChangeEvent } from "react";
import { displayDefaultImages, useDisplayDefaultImages } from "./common/storage/useDisplayDefaultImages";
import { displayDefaultSVG, useDisplayDefaultSVG } from "./common/storage/useDisplayDefaultSVG";
import { displayDefaultVideos, useDisplayDefaultVideos } from "./common/storage/useDisplayDefaultVideos";
import { defaultTheme, useDefaultTheme } from "./common/storage/useDefaultTheme";

function Popup() {
  const defaultImages = useDisplayDefaultImages()
  const defaultSVG = useDisplayDefaultSVG()
  const defaultVideos = useDisplayDefaultVideos()
  const defaultThemeValue = useDefaultTheme()

  const handleViewInSkellyClick = async () => {
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
      chrome.tabs.create({url: `${app}#${active_tab.url}`});
    } else {
      chrome.tabs.update(first_tab_id, {
        active: true,
      });
    }
  };

  const handleCryptoClick = () => chrome.tabs.create({url: `${chrome.runtime.getURL('crypto.html')}`})

  const handleToggleImages = (enabled: boolean) => {
    displayDefaultImages.set(enabled)
  }

  const handleToggleSVG = (enabled: boolean) => {
    displayDefaultSVG.set(enabled)
  }

  const handleToggleVideos = (enabled: boolean) => {
    displayDefaultVideos.set(enabled)
  }

  const handleSetDefaultTheme = (event: ChangeEvent<HTMLSelectElement>) => {
    defaultTheme.set(event.target.value)
  }

  return (
    <div className='w-[350px] p-4'>
      <div className='flex justify-between items-center border-b-2 pb-2 mb-2'>
        <div className='text-2xl font-bold'>
          Skelly
        </div>
        <Button className='bg-purple-950 text-white'>
          $Donate$
        </Button>
      </div>
      <div className='grid gap-4'>
        <Toggle
          title='Display images'
          description='Default value for all pages open in Skelly'
          onToggle={handleToggleImages}
          enabled={defaultImages}
        />
        <Toggle
          title='Display SVG'
          description='Default value for all pages open in Skelly'
          onToggle={handleToggleSVG}
          enabled={defaultSVG === undefined ? true : defaultSVG}
        />
        <Toggle
          title='Display videos'
          description='Default value for all pages open in Skelly'
          onToggle={handleToggleVideos}
          enabled={defaultVideos}
        />
        <div>
          <label className="text-sm mb-1 block font-medium text-gray-900">Select default theme</label>
          <Select onChange={handleSetDefaultTheme} options={themes} defaultValue={defaultThemeValue ?? 'none'}/>
        </div>
        <div className='flex justify-between'>
          <Button onClick={handleViewInSkellyClick} className='bg-emerald-900 text-white'>
            View in Skelly
          </Button>
          <Button
            className='bg-emerald-300'
            onClick={handleCryptoClick}
          >
            Open Crypto
          </Button>
        </div>
      </div>
    </div>
  );
}

renderElement(<Popup/>);
