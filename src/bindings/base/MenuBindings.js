/* eslint-disable no-unused-vars */
/* eslint-disable class-methods-use-this */
import { EventTypes, Events } from '@advanced-rest-client/events';
import { PlatformBindings } from './PlatformBindings.js';

/** @typedef {import('@advanced-rest-client/events').Menu.MenuSizing} MenuSizing */
/** @typedef {import('@advanced-rest-client/events').ARCMenuPopupEvent} ARCMenuPopupEvent */

/**
 * The base bindings for the popup menu.
 */
export class MenuBindings extends PlatformBindings {
  async initialize() {
    // from the elements
    window.addEventListener(EventTypes.Navigation.popupMenu, this.popupMenuHandler.bind(this));
    // to the platform (Electron, web)
    window.addEventListener(EventTypes.Menu.popup, this.executePopupHandler.bind(this));
  }

  /**
   * @param {ARCMenuPopupEvent} e
   */
  popupMenuHandler(e) {
    const { menu } = e;
    const sizing = this.getArcMenuSize();
    Events.Menu.popup(document.body, menu, sizing);
  }

  /**
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
   * @param {CustomEvent} e
   */
  executePopupHandler(e) {
    const { menu, sizing } = e.detail;
    e.detail.result = this.executePopup(menu, sizing);
  }

  /**
   * Sends the information to the IO thread to detach a menu from the main window.
   * @param {string} menu The name of the menu.
   * @param {MenuSizing} sizing The size of the created menu window.
   */
  async executePopup(menu, sizing) {
    throw new Error('Not yet implemented.');
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
   * @param {...any[]} args
   */
  popupMenuNavigate(menu, ...args) {
    switch (menu) {
      // @ts-ignore
      case 'request': Events.Navigation.navigateRequest(document.body, ...args); break;
      // @ts-ignore
      case 'project': Events.Navigation.navigateProject(document.body, ...args); break;
      // @ts-ignore
      case 'navigate': Events.Navigation.navigate(document.body, ...args); break;
      default:
    }
  }
}
