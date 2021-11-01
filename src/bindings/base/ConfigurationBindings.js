/* eslint-disable no-unused-vars */
/* eslint-disable class-methods-use-this */
import { EventTypes } from '@advanced-rest-client/events';
import { PlatformBindings } from './PlatformBindings.js';

/** @typedef {import('@advanced-rest-client/events').Config.ARCConfig} ARCConfig */

/**
 * The base class for application settings bindings.
 */
export class ConfigurationBindings extends PlatformBindings {
  async initialize() {
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
    e.detail.result = this.read(e.detail.key);
  }

  /**
   * @param {CustomEvent} e 
   */
  updateHandler(e) {
    e.detail.result = this.update(e.detail.key, e.detail.value);
  }

  /**
   * @returns {Promise<ARCConfig>}
   */
  async readAll() {
    throw new Error('Not implemented');
  }

  /**
   * Reads a value of a specific property.
   * @param {string} key The property path.
   * @returns {Promise<unknown>}
   */
  async read(key) {
    throw new Error('not implemented');
  }

  /**
   * Updates a single property in the app settings.
   * @param {string} key 
   * @param {unknown} value 
   * @returns {Promise<void>}
   */
  async update(key, value) {
    throw new Error('Not implemented');
  }
}
