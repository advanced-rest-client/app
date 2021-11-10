/* eslint-disable class-methods-use-this */
/* eslint-disable import/no-extraneous-dependencies */
import { Events } from '@advanced-rest-client/events';
import { get, set } from 'idb-keyval';
import { ConfigurationBindings } from '../base/ConfigurationBindings.js';

/** @typedef {import('@advanced-rest-client/events').Config.ARCConfig} ARCConfig */

const settingsKey = 'ArcAppSettingBindings';

/**
 * Web platform bindings for the configuration (settings) related logic.
 */
export class ConfigurationBindingsWeb extends ConfigurationBindings {
  /**
   * @returns {Promise<ARCConfig>}
   */
  async readAll() {
    let value = await get(settingsKey);
    if (!value) {
      value = {};
    }
    return value;
  }

  /**
   * Updates a single property in the app settings.
   * @param {string} key 
   * @param {unknown} value 
   * @returns {Promise<void>}
   */
  async update(key, value) {
    const settings = await this.readAll();
    this.updateValue(settings, key, value);
    await set(settingsKey, settings);
    Events.Config.State.update(window, key, value);
  }
}
