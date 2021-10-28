import { EventTypes } from '@advanced-rest-client/events';
import { get, set } from 'idb-keyval';

const settingsKey = 'ArcAppSettingBindings';

export class ConfigurationBindings {
  initialize() {
    window.addEventListener(EventTypes.Config.readAll, this.readAllHandler.bind(this));
    window.addEventListener(EventTypes.Config.read, this.readHandler.bind(this));
    window.addEventListener(EventTypes.Config.update, this.updateHandler.bind(this));
  }

  /**
   * @param {CustomEvent} e 
   */
  readAllHandler(e) {
    e.detail.result = this.readAll();
  }

  /**
   * @param {CustomEvent} e 
   */
  readHandler(e) {
    e.detail.result = this.read();
  }

  /**
   * @param {CustomEvent} e 
   */
  updateHandler(e) {
    e.detail.result = this.update(e.detail.key, e.detail.value);
  }

  async readAll() {
    let value = await get(settingsKey);
    if (!value) {
      value = {};
    }
    return value;
  }

  async read() {
    throw new Error('not implemented');
  }

  /**
   * @param {string} key 
   * @param {unknown} value 
   */
  async update(key, value) {
    const settings = await this.readAll();
    this.updateValue(settings, key, value);
    await set(settingsKey, settings);
  }

  /**
   * Updates the value by path in the settings object
   * @param {any} settings
   * @param {string} path The path to the data
   * @param {any} value The value to set.
   */
  updateValue(settings, path, value) {
    const parts = path.split('.');
    const last = parts.pop();
    let current = settings;
    parts.forEach((part) => {
      if (!current[part]) {
        current[part] = {};
      }
      current = current[part];
    });
    current[last] = value;
  }
}
