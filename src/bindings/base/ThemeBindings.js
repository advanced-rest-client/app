/* eslint-disable no-unused-vars */
/* eslint-disable class-methods-use-this */
import { EventTypes } from '@advanced-rest-client/events';
import * as Constants from '@advanced-rest-client/base/src/Constants.js';
import { PlatformBindings } from './PlatformBindings.js';
import { BaseThemeManager } from '../../lib/themes/BaseThemeManager.js';

/** @typedef {import('@advanced-rest-client/events').Theme.ArcThemeStore} ArcThemeStore */
/** @typedef {import('@advanced-rest-client/events').Theme.InstalledTheme} InstalledTheme */
/** @typedef {import('@advanced-rest-client/events').Theme.SystemThemeInfo} SystemThemeInfo */

/**
 * The base class for application themes bindings.
 */
export class ThemeBindings extends PlatformBindings {
  /**
   * @param {string} protocol The protocol to use when requesting for a theme.
   * @param {string} baseUri The base URI to use when requesting for a theme.
   */
  constructor(protocol, baseUri) {
    super();
    this.themes = new BaseThemeManager({
      protocol,
      baseUri,
    });
  }

  async initialize() {
    window.addEventListener(EventTypes.Theme.loadTheme, this.loadThemeHandler.bind(this));
    window.addEventListener(EventTypes.Theme.loadApplicationTheme, this.loadApplicationThemeHandler.bind(this));
    window.addEventListener(EventTypes.Theme.readSate, this.readSateHandler.bind(this));
    window.addEventListener(EventTypes.Theme.activate, this.activateHandler.bind(this));
    window.addEventListener(EventTypes.Theme.install, this.installHandler.bind(this));
    window.addEventListener(EventTypes.Theme.uninstall, this.uninstallHandler.bind(this));
    window.addEventListener(EventTypes.Theme.readActiveThemeInfo, this.readActiveThemeInfoHandler.bind(this));
    window.addEventListener(EventTypes.Theme.readSystemThemeInfo, this.readSystemThemeInfoHandler.bind(this));
    window.addEventListener(EventTypes.Theme.setSystemPreferred, this.setSystemPreferredHandler.bind(this));
  }

  /**
   * @param {CustomEvent} e 
   */
  loadThemeHandler(e) {
    const { themeId, noFallback } = e.detail;
    e.detail.result = this.themes.loadTheme(themeId, noFallback);
  }

  /**
   * @param {CustomEvent} e 
   */
  setSystemPreferredHandler(e) {
    const { status } = e.detail;
    e.detail.result = this.setSystemPreferred(status);
  }

  /**
   * @param {CustomEvent} e 
   */
  loadApplicationThemeHandler(e) {
    e.detail.result = this.themes.loadApplicationTheme();
  }

  /**
   * @param {CustomEvent} e 
   */
  activateHandler(e) {
    e.detail.result = this.activate(e.detail.name);
  }

  /**
   * @param {CustomEvent} e 
   */
  installHandler(e) {
    e.detail.result = this.themes.installTheme(e.detail.name);
  }

  /**
   * @param {CustomEvent} e 
   */
  uninstallHandler(e) {
    e.detail.result = this.themes.uninstallTheme(e.detail.name);
  }

  /**
   * @param {CustomEvent} e 
   */
  readSateHandler(e) {
    e.detail.result = this.readState();
  }

  /**
   * @param {CustomEvent} e 
   */
  readActiveThemeInfoHandler(e) {
    e.detail.result = this.readActiveThemeInfo();
  }

  /**
   * @param {CustomEvent} e 
   */
  readSystemThemeInfoHandler(e) {
    e.detail.result = this.readSystemThemeInfo();
  }

  /**
   * @returns {ArcThemeStore}
   */
  defaultSettings() {
    return /** @type ArcThemeStore */ ({
      kind: 'ARC#ThemeInfo',
      version: '1.1.0',
      systemPreferred: true,
      themes: [],
    });
  }

  /**
   * @returns {Promise<ArcThemeStore>}
   */
  async readState() {
    throw new Error('Not implemented');
  }

  /**
   * Activates the theme. It stores theme id in user preferences and loads the
   * theme.
   * @param {string} name Theme name to activate
   * @return {Promise<void>} Promise resolved when the theme is activated
   */
  async activate(name) {
    throw new Error('Not implemented');
  }

  /**
   * @returns {Promise<InstalledTheme>}
   */
  async readActiveThemeInfo() {
    const state = await this.readState();
    const { themes, active=Constants.defaultTheme } = state;
    let info = themes.find((theme) => theme.name === active || theme._id === active);
    if (!info && active === Constants.defaultTheme) {
      throw new Error(`The default theme is not installed.`);
    }
    if (info) {
      return info;
    }
    // then find the default theme.
    info = themes.find((theme) => theme.name === Constants.defaultTheme || theme._id === Constants.defaultTheme);
    if (!info && active === Constants.defaultTheme) {
      throw new Error(`The default theme is not installed.`);
    }
    return info;
  }

  /**
   * @returns {Promise<SystemThemeInfo>} 
   */
  async readSystemThemeInfo() {
    return {
      shouldUseDarkColors: false,
      shouldUseHighContrastColors: false,
      shouldUseInvertedColorScheme: false,
    };
  }

  /**
   * @param {boolean} status 
   */
  async setSystemPreferred(status) {
    throw new Error('Not implemented');
  }
}
