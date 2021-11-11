import { ARCRequestNavigationEvent, ARCProjectNavigationEvent, ARCNavigationEvent, ARCRestApiNavigationEvent, ARCHelpTopicEvent } from '@advanced-rest-client/events';
import { PlatformBindings } from './PlatformBindings.js';

/**
 * These bindings are to be attached to the popup menu window.
 * Proxies the state and user requests to the corresponding application window (it should be the last active window).
 */
export class PopupMenuBindings extends PlatformBindings {
  initialize(): Promise<void>;
  navigateRequestHandler(e: ARCRequestNavigationEvent): void;
  navigateProjectHandler(e: ARCProjectNavigationEvent): void;
  navigateHandler(e: ARCNavigationEvent): void;
  navigateRestApiHandler(e: ARCRestApiNavigationEvent): void;
  navigateHelpTopicHandler(e: ARCHelpTopicEvent): void;
  /**
   * Sends the information to the IO thread that this window is closed
   * and the menu should return to the arc-menu in all opened windows.
   * @param type The type of the popup window being closed.
   */
  informClosed(type: string): Promise<void>;

  /**
   * Informs the main application window about a navigation that ocurred in the menu window.
   * 
   * @param type The type of the navigation (request, project, api, etc.)
   * @param args Thew list of arguments to send to the page.
   */
  propagateNavigation(type: string, ...args: any[]): Promise<void>;
}
