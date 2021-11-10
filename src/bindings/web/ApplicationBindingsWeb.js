/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable class-methods-use-this */
import { get, set } from 'idb-keyval';
import { ApplicationBindings } from '../base/ApplicationBindings.js';

/** @typedef {import('@advanced-rest-client/events').Application.AppVersionInfo} AppVersionInfo */
/** @typedef {import('@advanced-rest-client/events').ArcState.ARCState} ARCState */

const settingsKey = 'ArcAppStateBindings';

/**
 * Web platform bindings for the general application related logic.
 */
export class ApplicationBindingsWeb extends ApplicationBindings {
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
   * @returns {Promise<ARCState>}
   */
  async readState() {
    let value = await get(settingsKey);
    if (!value) {
      value = /** @type ARCState */ ({
        kind: 'ARC#AppState',
      });
    }
    return value;
  }

  /**
   * @param {string} path Preference name
   * @param {any} value Preference value
   */
  async updateStateProperty(path, value) {
    try {
      const data = await this.readState();
      this.updateValue(data, path, value);
      await set(settingsKey, data);
    } catch (cause) {
      // eslint-disable-next-line no-console
      console.error(cause);
      throw cause;
    }
  }
}
