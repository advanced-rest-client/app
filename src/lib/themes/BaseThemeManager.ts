/* eslint-disable no-plusplus */
/* eslint-disable class-methods-use-this */
import { ThemeManagerInit } from '../../types.js';
import * as Constants from './Constants.js';

/** @typedef {import('@advanced-rest-client/events').Theme.ArcThemeStore} ArcThemeStore */
/** @typedef {import('@advanced-rest-client/events').Theme.InstalledTheme} InstalledTheme */
/** @typedef {import('@advanced-rest-client/events').Theme.SystemThemeInfo} SystemThemeInfo */
/** @typedef {import('../../types').ThemeManagerInit} ThemeManagerInit */

/**
 * Theme manager class for the Advanced REST Client.
 * It only contains the logic that is not related to the platform bindings.
 */
export class BaseThemeManager {
  protocol: string;

  baseUri: string;

  eventsTarget: EventTarget;
  
  constructor(init: ThemeManagerInit) {
    this.protocol = init.protocol;
    this.baseUri = init.baseUri;
    this.eventsTarget = init.eventsTarget || document.body;
  }

  /**
   * Activates the theme. It stores theme id in user preferences and loads the
   * theme.
   * @param name Theme name to activate
   * @returns Promise resolved when the theme is activated
   */
  activate(name: string): Promise<void> {
    throw new Error(`activate(${name}): Not implemented`);
  }

  /**
   * @param {string} name The theme to install
   * @returns {Promise<void>} 
   */
  async installTheme(name: string): Promise<void> {
    if (!name) {
      throw new Error('The name is required');
    }
    throw new Error(`installTheme(${name}): Not implemented`);
  }

  /**
   * @param {string} name The theme to uninstall
   * @returns {Promise<void>} 
   */
  async uninstallTheme(name: string): Promise<void> {
    if (!name) {
      throw new Error('The name is required');
    }
    throw new Error(`uninstallTheme(${name}): Not implemented`);
  }

  /**
   * Loads theme file and activates it.
   * @param themeId The id of an installed theme or location of the theme file.
   * @param noFallback By default the manager will try to revert to default
   * theme when passed theme cannot be loaded. When this option is set then
   * it will throw error instead of loading default theme.
   */
  async loadTheme(themeId?: string, noFallback?: boolean): Promise<void> {
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
   * @param themeId The theme id.
   * @returns Full theme URL.
   */
  readThemeUrl(themeId: string): string {
    const { protocol, baseUri } = this;
    return `${protocol}//${baseUri}/${themeId}`;
  }

  protected async _loadTheme(themeId: string): Promise<void> {
    const nodes = (document.head.querySelectorAll('link[rel="stylesheet"][arc-theme="true"]')) as NodeListOf<HTMLLinkElement>;
    for (let i = nodes.length - 1; i >= 0; i--) {
      nodes[i].parentNode?.removeChild(nodes[i]);
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
   * Loads application theme applying user and system configuration.
   * This function should be used on each application page to load the theme.
   * @returns The id of the loaded theme.
   */
  async loadApplicationTheme(): Promise<string> {
    const settings = await Events.Theme.readSate(this.eventsTarget);
    if (settings.systemPreferred) {
      return this.loadSystemPreferred();
    }
    return this.loadUserPreferred();
  }

  /**
   * Loads the theme for the current system preferences.
   */
  async loadSystemPreferred(): Promise<string> {
    const systemInfo = await Events.Theme.readSystemThemeInfo(this.eventsTarget);
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
   */
  async loadUserPreferred(): Promise<string> {
    const info = await Events.Theme.readActiveThemeInfo(this.eventsTarget);
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
