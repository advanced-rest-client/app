import { EventTypes } from '@advanced-rest-client/events';
import { ElectronBindings } from '../lib/ElectronBindings.js';
import { MenuScreen } from '../../pages.js';

const bindings = new ElectronBindings();
bindings.initialize();
const page = new MenuScreen();
page.initialize();

function informClose() {
  window.opener.postMessage({
    payload: 'popup-closing',
    type: page.type,
  });
}

/**
 * @param  {string} type 
 * @param  {any} args 
 */
function informNavigate(type, args) {
  window.opener.postMessage({
    payload: 'popup-navigate',
    type,
    ...args,
  });
}

window.addEventListener('beforeunload', () => informClose());
window.addEventListener(EventTypes.Menu.navigate, 
  /**
   * @param {CustomEvent} e 
   */
  (e) => {
    informNavigate(e.detail.menu, e.detail.args);
  }
);
