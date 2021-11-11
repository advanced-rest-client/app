/* eslint-disable no-unused-vars */
/* eslint-disable class-methods-use-this */
import { EventTypes, Events } from '@advanced-rest-client/events';
import { PlatformBindings } from './PlatformBindings.js';

/** @typedef {import('@advanced-rest-client/events').Menu.MenuSizing} MenuSizing */
/** @typedef {import('@advanced-rest-client/events').ARCMenuPopupEvent} ARCMenuPopupEvent */

/**
 * The base bindings for the popup menu.
 * These to be used in the **main** application window from where the menu can be detached.
 * 
 * @todo 1: In the child class implement an event listener that handles the menu opened state
 * and informs the UI via the DOM events. Use `popupMenuOpened()` and `popupMenuClosed()`
 * to notify the current window about a menu opened/closed state.
 * 
 * @todo 2: Implement an event listener from the main IO thread (in Electron) that 
 * runs the logic that informs this window that a navigation ocurred.
 */
export class MenuBindings extends PlatformBindings {
  async initialize() {
    window.addEventListener(EventTypes.Navigation.popupMenu, this.popupMenuHandler.bind(this));
  }

  /**
   * A handler for the menu popup request coming from the `<arc-menu>` element.
   * Communicates with the IO thread (in Electron) to run a new window with a popup.
   * 
   * @param {ARCMenuPopupEvent} e
   */
  popupMenuHandler(e) {
    const { menu } = e;
    const sizing = this.getArcMenuSize();
    this.detachMenu(menu, sizing);
  }

  /**
   * Informs the IO thread (in Electron) or otherwise background thread that the user 
   * requested to detach the menu from the main window into a separate window.
   * 
   * @param {string} menu
   * @param {MenuSizing} sizing
   */
  async detachMenu(menu, sizing) {
    throw new Error('Not yet implemented.');
  }

  /**
   * Gathers the ARC menu size so the navigation opened in the new window has the same size.
   * @returns {MenuSizing}
   */
  getArcMenuSize() {
    const element = document.querySelector('arc-menu');
    if (!element) {
      return {
        width: 256,
        height: 800,
      }
    }
    const rect = element.getBoundingClientRect();
    return {
      height: rect.height,
      width: rect.width
    };
  }

  /**
   * Dispatches a DOM event informing the UI that a menu has been opened.
   * @param {string} menu
   */
  popupMenuOpened(menu) {
    Events.Menu.State.open(document.body, menu);
  }

  /**
   * Dispatches a DOM event informing the UI that a menu has been closed.
   * @param {string} menu
   */
  popupMenuClosed(menu) {
    Events.Menu.State.close(document.body, menu);
  }

  /**
   * Dispatches a DOM event informing the UI that a navigation ocurred in the popup menu.
   * @param {string} menu
   * @param {...any} args
   */
  popupMenuNavigate(menu, ...args) {
    switch (menu) {
      // @ts-ignore
      case 'request': Events.Navigation.navigateRequest(document.body, ...args); break;
      // @ts-ignore
      case 'project': Events.Navigation.navigateProject(document.body, ...args); break;
      // @ts-ignore
      case 'navigate': Events.Navigation.navigate(document.body, ...args); break;
      // @ts-ignore
      case 'api': Events.Navigation.navigateRestApi(document.body, ...args); break;
      case 'help': Events.Navigation.helpTopic(document.body, args[0]); break;
      default:
    }
  }
}
