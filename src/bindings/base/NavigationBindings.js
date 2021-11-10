/* eslint-disable no-unused-vars */
/* eslint-disable class-methods-use-this */
import { EventTypes } from '@advanced-rest-client/events';
import { PlatformBindings } from './PlatformBindings.js';

/** @typedef {import('@advanced-rest-client/events').ARCExternalNavigationEvent} ARCExternalNavigationEvent */
/** @typedef {import('@advanced-rest-client/events').ARCHelpTopicEvent} ARCHelpTopicEvent */

/**
 * Base class for navigation bindings.
 * These navigation bindings are not related to in-app navigation but rather external navigation.
 */
export class NavigationBindings extends PlatformBindings {
  async initialize() {
    window.addEventListener(EventTypes.Navigation.navigateExternal, this.externalNavigationHandler.bind(this));
    window.addEventListener(EventTypes.Navigation.helpTopic, this.helpNavigationHandler.bind(this));
  }

  /**
   * @param {ARCExternalNavigationEvent} e
   * @todo: Move this to the bindings!
   */
  externalNavigationHandler(e) {
    const { url, detail } = e;
    const { purpose } = detail;
    if (!purpose) {
      this.navigateExternal(url);
    } else {
      this.openWebUrl(url, purpose);
    }
  }

  /**
   * @param {ARCHelpTopicEvent} e
   * @todo: Move this to the bindings!
   */
  helpNavigationHandler(e) {
    const { topic } = e;
    this.helpTopic(topic);
  }

  /**
   * @param {string} url
   */
  navigateExternal(url) {
    throw new Error('Not yet implemented');
  }

  /**
   * @param {string} url
   * @param {string=} purpose
   */
  openWebUrl(url, purpose) {
    throw new Error('Not yet implemented');
  }

  /**
   * @param {string} topic
   */
  helpTopic(topic) {
    throw new Error('Not yet implemented');
  }
}
