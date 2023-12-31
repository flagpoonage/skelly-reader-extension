import {
  HashChange,
  createFrameContentReady,
  createHashChange,
  isHashChange,
  isTopLevelInformation,
} from '../reader/reader-messaging';
import { setTopLevel } from './top-level';

window.addEventListener('message', (ev) => {
  if (isTopLevelInformation(ev.data)) {
    setTopLevel(ev.data.info);

    if (ev.data.info.hash) {
      handleHashChange(createHashChange(ev.data.info.hash));
    }
  } else if (isHashChange(ev.data)) {
    setTopLevel({ hash: ev.data.new_hash });
    handleHashChange(ev.data);
  }

  console.log('Internal frame received a message, well done.', ev.data);
});

function handleHashChange(msg: HashChange) {
  if (!msg.new_hash) {
    window.scrollTo({ top: 0 });
  } else {
    const el_location = msg.new_hash.substring(1);

    if (!el_location) {
      console.warn('Received a hash change but no valid hash was found');
      return;
    }

    const el = document.getElementById(el_location);

    if (!el) {
      console.warn(
        'Received a hash change but theres no element with the hash to scroll to',
        el_location,
      );
      return;
    }

    el.scrollIntoView(true);
  }
}

function onLoad() {
  window.parent.postMessage(createFrameContentReady(), '*');
}

document.readyState === 'loading'
  ? document.addEventListener('DOMContentLoaded', onLoad)
  : onLoad();

console.log(window.location);
