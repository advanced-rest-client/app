/* eslint-disable no-plusplus */
/* eslint-disable class-methods-use-this */
import { Events } from '@advanced-rest-client/events';
import * as Constants from '../../Constants.js';

/** @typedef {import('@advanced-rest-client/events').Themes.ArcThemeStore} ArcThemeStore */
/** @typedef {import('@advanced-rest-client/events').Themes.InstalledTheme} InstalledTheme */
/** @typedef {import('@advanced-rest-client/events').Themes.SystemThemeInfo} SystemThemeInfo */
/** @typedef {import('../../types').ThemeManagerInit} ThemeManagerInit */

/**
 * Theme manager class for the Advanced REST Client.
 * It only contains the logic that is not related to the platform bindings.
 */
export class BaseThemeManager {
  /**
   * @param {ThemeManagerInit} init 
   */
  constructor(init) {
    this.protocol = init.protocol;
    this.baseUri = init.baseUri;
    this.eventsTarget = init.eventsTarget || document.body;
  }

  /**
   * Lists installed in the application themes.
   * @return {Promise<ArcThemeStore>} A promise resolved to the theme info array
   */
  readState() {
    // throw new Error(`readState(): Not implemented`);
    return Events.Theme.readSate(this.eventsTarget);
  }

  /**
   * Reads information about the current theme.
   * @return {Promise<InstalledTheme>} A promise resolved to the theme info
   */
  readActiveThemeInfo() {
    // throw new Error(`readActiveThemeInfo(): Not implemented`);
    return Events.Theme.readActiveThemeInfo(this.eventsTarget);
  }

  /**
   * Activates the theme. It stores theme id in user preferences and loads the
   * theme.
   * @param {string} name Theme name to activate
   * @return {Promise<void>} Promise resolved when the theme is activated
   */
  activate(name) {
    throw new Error(`activate(${name}): Not implemented`);
    // return Events.Theme.activate(this.eventsTarget, name);
  }

  /**
   * @param {string} name The theme to install
   * @returns {Promise<void>} 
   */
  async installTheme(name) {
    if (!name) {
      throw new Error('The name is required');
    }
    // return Events.Theme.install(this.eventsTarget, name);
    throw new Error(`installTheme(${name}): Not implemented`);
  }

  /**
   * @param {string} name The theme to uninstall
   * @returns {Promise<void>} 
   */
  async uninstallTheme(name) {
    if (!name) {
      throw new Error('The name is required');
    }
    throw new Error(`uninstallTheme(${name}): Not implemented`);
    // return Events.Theme.uninstall(this.eventsTarget, name);
  }

  /**
   * Loads theme file and activates it.
   * @param {string=} themeId The id of an installed theme or location of the theme file.
   * @param {boolean=} noFallback By default the manager will try to revert to default
   * theme when passed theme cannot be loaded. When this option is set then
   * it will throw error instead of loading default theme.
   * @return {Promise<void>}
   */
  async loadTheme(themeId, noFallback) {
    let id = themeId;
    if (!id || id === 'dd1b715f-af00-4ee8-8b0c-2a262b3cf0c8') {
      id = Constants.defaultTheme;
    } else if (id === '859e0c71-ce8b-44df-843b-bca602c13d06') {
      id = Constants.anypointTheme;
    }
    try {
      await this._loadTheme(id);
    } catch (cause) {
      if (!noFallback && id !== Constants.defaultTheme) {
        await this._loadTheme(Constants.defaultTheme);
        return;
      }
      throw cause;
    }
  }

  /**
   * @param {string} themeId The theme id.
   * @returns {string} Full theme URL.
   */
  readThemeUrl(themeId) {
    const { protocol, baseUri } = this;
    return `${protocol}//${baseUri}/${themeId}`;
  }

  /**
   * @param {string} themeId
   * @returns {Promise<void>}
   */
  async _loadTheme(themeId) {
    const nodes = /** @type NodeListOf<HTMLLinkElement> */ (document.head.querySelectorAll('link[rel="stylesheet"][arc-theme="true"]'));
    for (let i = nodes.length - 1; i >= 0; i--) {
      nodes[i].parentNode.removeChild(nodes[i]);
    }
    const link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('type', 'text/css');
    link.setAttribute('arc-theme', 'true');
    const url = this.readThemeUrl(themeId);
    link.setAttribute('href', url);
    document.head.appendChild(link);
  }

  /**
   * @param {boolean} status Whether to ignore the system preferences for dark / light theme.
   */
  async setSystemPreferred(status) {
    throw new Error(`setSystemPreferred(${status}): Not implemented`);
    // return Events.Theme.setSystemPreferred(this.eventsTarget, status);
  }

  /**
   * @returns {Promise<SystemThemeInfo>} 
   */
  async readSystemThemeInfo() {
    // throw new Error(`readSystemThemeInfo(): Not implemented`);
    return Events.Theme.readSystemThemeInfo(this.eventsTarget);
  }

  /**
   * Loads application theme applying user and system configuration.
   * This function should be used on each application page to load the theme.
   * @returns {Promise<string>} The id of the loaded theme.
   */
  async loadApplicationTheme() {
    const settings = await this.readState();
    if (settings.systemPreferred) {
      return this.loadSystemPreferred();
    }
    return this.loadUserPreferred();
  }

  /**
   * Loads the theme for the current system preferences.
   * @returns {Promise<string>}
   */
  async loadSystemPreferred() {
    const systemInfo = await this.readSystemThemeInfo();
    const id = systemInfo.shouldUseDarkColors ? Constants.darkTheme : Constants.defaultTheme;
    try {
      await this.loadTheme(id);
      Events.Theme.themeActivated(this.eventsTarget, id);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    }
    Events.Theme.themeActivated(this.eventsTarget, id);
    return id;
  }

  /**
   * Loads the theme configured by the user
   * @returns {Promise<string>}
   */
  async loadUserPreferred() {
    const info = await this.readActiveThemeInfo();
    const id = info && info.name || Constants.defaultTheme;
    try {
      await this.loadTheme(id);
      Events.Theme.themeActivated(this.eventsTarget, id);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    }
    return id;
  }
}
