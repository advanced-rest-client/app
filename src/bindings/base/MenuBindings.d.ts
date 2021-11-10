import { ARCMenuPopupEvent, Menu } from '@advanced-rest-client/events';
import { PlatformBindings } from './PlatformBindings.js';

/** @typedef {import('@advanced-rest-client/events').Menu.MenuSizing} MenuSizing */
/** @typedef {import('@advanced-rest-client/events').ARCMenuPopupEvent} ARCMenuPopupEvent */

/**
 * The base bindings for the popup menu.
 */
export class MenuBindings extends PlatformBindings {
  initialize(): Promise<void>;
  popupMenuHandler(e: ARCMenuPopupEvent): void;
  getArcMenuSize(): Menu.MenuSizing;
  executePopupHandler(e: CustomEvent): void;

  /**
   * Sends the information to the IO thread to detach a menu from the main window.
   * @param menu The name of the menu.
   * @param sizing The size of the created menu window.
   */
  executePopup(menu: string, sizing: Menu.MenuSizing): Promise<void>;

  /**
   * Dispatches a DOM event informing the UI that a menu has been opened.
   */
  popupMenuOpened(menu: string): void;

  /**
   * Dispatches a DOM event informing the UI that a menu has been closed.
   */
  popupMenuClosed(menu: string): void;

  /**
   * Dispatches a DOM event informing the UI that a navigation ocurred in the popup menu.
   */
  popupMenuNavigate(menu: string, ...args: any[]): void;
}
