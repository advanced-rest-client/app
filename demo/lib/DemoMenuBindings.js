import { Events } from '@advanced-rest-client/events';
import { MenuBindings } from '../../src/bindings/base/MenuBindings.js';

/** @typedef {import('@advanced-rest-client/events').Menu.MenuSizing} MenuSizing */

const openedPopups = [];

export class DemoMenuBindings extends MenuBindings {
  async initialize() {
    await super.initialize();
    window.addEventListener('message', this.windowMessageHandler.bind(this));
    window.onbeforeunload = () => {
      openedPopups.forEach((item) => item.ref.close());
    };
  }

  /**
   * Sends the information to the IO thread to detach a menu from the main window.
   * @param {string} menu The name of the menu.
   * @param {MenuSizing} sizing The size of the created menu window.
   */
  async detachMenu(menu, sizing) {
    const { width, height } = sizing;
    const url = `popup-menu.html?type=${menu}`;
    const ref = window.open(url, menu, `width=${width},height=${height},resizable`);
    if (!ref) {
      return;
    }
    openedPopups.push({
      ref,
      type: menu,
    });
    Events.Menu.State.open(document.body, menu);
  }

  /**
   * @param {MessageEvent} e 
   */
  windowMessageHandler(e) {
    const { data } = e;
    if (!data.payload) {
      return;
    }
    if (data.payload === 'popup-closing') {
      this.popupMenuClosed(data.type);
    } else if (data.payload === 'popup-navigate') {
      this.proxyNavigation(data);
    }
  }

  /**
   * @param {any} data 
   */
  proxyNavigation(data) {
    console.log(data);
    switch (data.type) {
      case 'project': this.popupMenuNavigate(data.type, data[0], data[1]); break;
      case 'request': this.popupMenuNavigate(data.type, data[0], data[1], data[2]); break;
      case 'api': this.popupMenuNavigate(data.type, data[0], data[1], data[2]); break;
      case 'navigate': this.popupMenuNavigate(data.type, data.route, data.opts); break;
      default: 
    }
  }
}
