/* eslint-disable no-unused-vars */
/* eslint-disable class-methods-use-this */
import { EventTypes } from '@advanced-rest-client/events';
import { PlatformBindings } from './PlatformBindings.js';

/** @typedef {import('@advanced-rest-client/events').ARCRequestNavigationEvent} ARCRequestNavigationEvent */
/** @typedef {import('@advanced-rest-client/events').ARCProjectNavigationEvent} ARCProjectNavigationEvent */
/** @typedef {import('@advanced-rest-client/events').ARCNavigationEvent} ARCNavigationEvent */
/** @typedef {import('@advanced-rest-client/events').ARCRestApiNavigationEvent} ARCRestApiNavigationEvent */

/**
 * These bindings are to be attached to the popup menu window.
 * Proxies the state and user requests to the corresponding application window (it should be the last active window).
 */
export class PopupMenuBindings extends PlatformBindings {
  async initialize() {
    window.addEventListener(EventTypes.Navigation.navigateRequest, this.navigateRequestHandler.bind(this));
    window.addEventListener(EventTypes.Navigation.navigateProject, this.navigateProjectHandler.bind(this));
    window.addEventListener(EventTypes.Navigation.navigate, this.navigateHandler.bind(this));
    window.addEventListener(EventTypes.Navigation.navigateRestApi, this.navigateRestApiHandler.bind(this));
  }

  /**
   * @param {ARCRequestNavigationEvent} e 
   */
  navigateRequestHandler(e) {
    const { requestId, requestType, action } = e;
    this.propagateNavigation('request', requestId, requestType, action);
  }

  /**
   * @param {ARCProjectNavigationEvent} e
   */
  navigateProjectHandler(e) {
    const { id, action, route } = e;
    this.propagateNavigation('project', id, action, route);
  }

  /**
   * @param {ARCNavigationEvent} e
   */
  navigateHandler(e) {
    const allowed = [
      'exchange-search',
      'history',
      'saved',
    ];
    if (allowed.includes(e.route)) {
      this.propagateNavigation('navigate', e.route);
    }
  }

  /**
   * @param {ARCRestApiNavigationEvent} e 
   */
  navigateRestApiHandler(e) {
    const { api, action, version } = e;
    this.propagateNavigation('api', api, version, action);
  }

  /**
   * Sends the information to the IO thread that this window is closed
   * and the menu should return to the arc-menu in all opened windows.
   * 
   * @param {string} type The type of the popup window being closed.
   */
  async informClosed(type) {
    throw new Error('Not yet implemented.');
  }

  /**
   * Informs the main application window about a navigation that ocurred in the menu window.
   * 
   * @param {string} type The type of the navigation (request, project, api, etc.)
   * @param {...any} args Thew list of arguments to send to the page.
   */
  async propagateNavigation(type, ...args) {
    throw new Error('Not yet implemented.');
  }
}
