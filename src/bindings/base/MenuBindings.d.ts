import { ARCMenuPopupEvent, Menu } from '@advanced-rest-client/events';
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
  initialize(): Promise<void>;
  /**
   * A handler for the menu popup request coming from the `<arc-menu>` element.
   * Communicates with the IO thread (in Electron) to run a new window with a popup.
   */
  popupMenuHandler(e: ARCMenuPopupEvent): void;
  /**
   * Informs the IO thread (in Electron) or otherwise background thread that the user 
   * requested to detach the menu from the main window into a separate window.
   * 
   * @param {string} menu
   * @param {MenuSizing} sizing
   */
  detachMenu(menu: string, sizing: Menu.MenuSizing): Promise<void>;
  /**
   * Gathers the ARC menu size so the navigation opened in the new window has the same size.
   */
  getArcMenuSize(): Menu.MenuSizing;
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
