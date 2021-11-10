/* eslint-disable no-unused-vars */
/* eslint-disable class-methods-use-this */
import { EventTypes } from '@advanced-rest-client/events';
import { PlatformBindings } from './PlatformBindings.js';

/** @typedef {import('@advanced-rest-client/events').Application.AppVersionInfo} AppVersionInfo */
/** @typedef {import('@advanced-rest-client/events').ArcState.ARCState} ARCState */

/**
 * The base class that represent application bindings.
 * The application bindings provide platform specific bindings for the app to query for version info,
 * and reading and manipulating application state.
 */
export class ApplicationBindings extends PlatformBindings {
  async initialize() {
    window.addEventListener(EventTypes.App.versionInfo, this.versionInfoHandler.bind(this));
    window.addEventListener(EventTypes.App.readState, this.readStateHandler.bind(this));
    window.addEventListener(EventTypes.App.updateStateProperty, this.updateStatePropertyHandler.bind(this));
  }

  /**
   * @returns {Promise<AppVersionInfo>}
   */
  async versionInfo() {
    return {
      appVersion: '',
      chrome: '',
    };
  }

  /**
   * @returns {Promise<ARCState>}
   */
  async readState() {
    throw new Error('Not implemented');
  }

  /**
   * @param {string} path Preference name
   * @param {any} value Preference value
   */
  async updateStateProperty(path, value) {
    throw new Error('Not implemented');
  }

  /**
   * @param {CustomEvent} e 
   */
  versionInfoHandler(e) {
    e.detail.result = this.versionInfo();
  }

  /**
   * @param {CustomEvent} e 
   */
  readStateHandler(e) {
    e.detail.result = this.readState();
  }

  /**
   * @param {CustomEvent} e 
   */
  updateStatePropertyHandler(e) {
    const { name, value } = e.detail;
    e.detail.result = this.updateStateProperty(name, value);
  }
}
