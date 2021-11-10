import { EventTypes } from '@advanced-rest-client/events';
import { DemoBindings } from '../lib/DemoBindings.js';
import { MenuScreen } from '../../index.js';

const bindings = new DemoBindings();
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
