export const observePopupState = Symbol('observePopupState');
export const popupInterval = Symbol('popupInterval');
export const popupObserver = Symbol('popupObserver');
export const intervalValue = Symbol('intervalValue');

/**
 * Adds support for the popup window authorization.
 * 
 * The set timeout hack is used because I can't see other way of doing this 
 * as load/unload events are called only once (even with redirects)
 * and there's no way of knowing what is happening in the popup (so no timeouts).
 * The user may need more time to authorize themselves and then the application.
 * 
 * This class dispatches the `close` event when the popup was closed.
 * 
 * Call the `cleanUp()` function when the authorization data is received.
 */
export class PopupAuthorization extends EventTarget {
  /**
   * @param {number} [interval=50] The popup state check interval
   */
  constructor(interval=50) {
    super();
    this[intervalValue] = interval;
    /** 
     * @type {Window}
     */
    this.popup = undefined;

    this[popupObserver] = this[popupObserver].bind(this);
  }

  /**
   * Removes any existing frame and removes any remaining listeners.
   */
  cleanUp() {
    if (this[popupInterval]) {
      clearInterval(this[popupInterval]);
      this[popupInterval] = undefined;
    }
    const { popup } = this;
    if (popup && !popup.closed) {
      popup.close();
    }
    this.popup = undefined;
  }

  /**
   * Opens a popup to request authorization from the user.
   * @param {string} url The URL to open.
   */
  load(url) {
    const op = 'menubar=no,location=no,resizable=yes,scrollbars=yes,status=no,width=800,height=600';
    const popup = window.open(url, 'oauth-window', op);
    if (!popup) {
      throw new Error('Authorization popup is being blocked.');
    }
    popup.window.focus();
    this.popup = popup;
    this[observePopupState]();
  }

  /**
   * Initializes an interval to check whether the popup window is still present.
   * The web security model does not allow pages to read the URL for the cross domain
   * connections.
   */
  [observePopupState]() {
    this[popupInterval] = setInterval(this[popupObserver], this[intervalValue]);
  }

  [popupObserver]() {
    const { popup } = this;
    if (!popup || popup.closed) {
      this.cleanUp();
      this.dispatchEvent(new Event('close'));
    }
  }
}