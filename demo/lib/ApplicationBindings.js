import { EventTypes } from '@advanced-rest-client/events';

/** @typedef {import('@advanced-rest-client/events').Application.AppVersionInfo} AppVersionInfo */

export class ApplicationBindings {
  initialize() {
    window.addEventListener(EventTypes.App.versionInfo, this.versionInfoHandler.bind(this));
  }

  /**
   * @returns {Promise<AppVersionInfo>}
   */
  async versionInfo() {
    return {
      appVersion: '0.0.0-demo',
      chrome: '0.0.0-chrome',
    };
  }

  /**
   * @param {CustomEvent} e 
   */
  versionInfoHandler(e) {
    e.detail.result = this.versionInfo();
  }
}
