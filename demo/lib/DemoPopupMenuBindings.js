import { PopupMenuBindings } from '../../index.js';

export class DemoPopupMenuBindings extends PopupMenuBindings {
  async initialize() {
    await super.initialize();
    window.addEventListener('beforeunload', this.informClosedHandler.bind(this));
  }

  /**
   * A handler for the `beforeunload` event.
   * Informs the main app that this window is closing.
   */
  informClosedHandler() {
    const search = new URLSearchParams(window.location.search);
    const type = search.get('type');
    this.informClosed(type);
  }

  /**
   * Sends the information to the IO thread that this window is closed
   * and the menu should return to the arc-menu in all opened windows.
   * 
   * @param {string} type The type of the popup window being closed.
   */
  async informClosed(type) {
    window.opener.postMessage({
      payload: 'popup-closing',
      type,
    });
  }

  /**
   * Informs the main application window about a navigation that ocurred in the menu window.
   * 
   * @param {string} type The type of the navigation (request, project, api, etc.)
   * @param {...any} args Thew list of arguments to send to the page.
   */
  async propagateNavigation(type, ...args) {
    window.opener.postMessage({
      payload: 'popup-navigate',
      type,
      ...args,
    });
  }
}
