import { EventTypes, Events } from '@advanced-rest-client/events';
import { get, set } from 'idb-keyval';
import { BaseThemeManager } from '../../pages.js';
import * as Constants from '../../src/Constants.js';

/** @typedef {import('@advanced-rest-client/events').Theme.ArcThemeStore} ArcThemeStore */
/** @typedef {import('@advanced-rest-client/events').Theme.InstalledTheme} InstalledTheme */
/** @typedef {import('@advanced-rest-client/events').Theme.SystemThemeInfo} SystemThemeInfo */

const settingsKey = 'ArcAppThemeBindings';

export class ThemeBindings {
  constructor() {
    const base = new URL(window.location.href);
    this.themes = new BaseThemeManager({
      protocol: 'http:',
      baseUri: `${base.host}/demo/themes`
    });
    this.darkMatcher = window.matchMedia('(prefers-color-scheme: dark)');
    this.darkMatcher.addEventListener('change', this.darkMatcherQueryHandler.bind(this));
  }

  initialize() {
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
   * @param {MediaQueryListEvent} e 
   */
  async darkMatcherQueryHandler(e) {
    const state = await this.readState();
    if (state.systemPreferred === false) {
      return;
    }
    if (e.matches) {
      await this.activate(Constants.darkTheme);
      await this.themes.loadTheme(Constants.darkTheme);
    } else {
      await this.activate(Constants.defaultTheme);
      await this.themes.loadTheme(Constants.defaultTheme);
    }
  }

  /**
   * @returns {ArcThemeStore}
   */
  defaultSettings() {
    return /** @type ArcThemeStore */ ({
      kind: 'ARC#ThemeInfo',
      version: '1.1.0',
      systemPreferred: true,
      themes: [
        {
          _id: "@advanced-rest-client/arc-electron-default-theme",
          name: "@advanced-rest-client/arc-electron-default-theme",
          title: "Default theme",
          version: "4.0.0",
          location: "@advanced-rest-client/arc-electron-default-theme",
          mainFile: "@advanced-rest-client/arc-electron-default-theme/arc-electron-default-theme.css",
          description: "Advanced REST Client default theme",
          isDefault: true
        },
        {
          _id: "@advanced-rest-client/arc-electron-anypoint-theme",
          name: "@advanced-rest-client/arc-electron-anypoint-theme",
          title: "Anypoint theme",
          version: "3.0.2",
          location: "@advanced-rest-client/arc-electron-anypoint-theme",
          mainFile: "@advanced-rest-client/arc-electron-anypoint-theme/arc-electron-anypoint-theme.css",
          description: "Advanced REST Client anypoint theme",
          isDefault: true
        },
        {
          _id: "@advanced-rest-client/arc-electron-dark-theme",
          name: "@advanced-rest-client/arc-electron-dark-theme",
          title: "Dark theme",
          version: "3.0.2",
          location: "@advanced-rest-client/arc-electron-dark-theme",
          mainFile: "@advanced-rest-client/arc-electron-dark-theme/arc-electron-dark-theme.css",
          description: "Advanced REST Client dark theme",
          isDefault: true
        }
      ],
    });
  }

  /**
   * @returns {Promise<ArcThemeStore>}
   */
  async readState() {
    let info = await get(settingsKey);
    if (!info) {
      info = this.defaultSettings();
    }
    return info;
  }

  /**
   * Activates the theme. It stores theme id in user preferences and loads the
   * theme.
   * @param {string} name Theme name to activate
   * @return {Promise<void>} Promise resolved when the theme is activated
   */
  async activate(name) {
    const state = await this.readState();
    state.active = name;
    await set(settingsKey, state);
  }

  /**
   * @returns {Promise<InstalledTheme>}
   */
  async readActiveThemeInfo() {
    const state = await this.readState();
    const { themes, active } = state;
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
      shouldUseDarkColors: this.darkMatcher.matches,
      shouldUseHighContrastColors: false,
      shouldUseInvertedColorScheme: false,
    };
  }

  /**
   * @param {boolean} status 
   */
  async setSystemPreferred(status) {
    const state = await this.readState();
    state.systemPreferred = status;
    await set(settingsKey, state);
    if (status) {
      await this.themes.loadSystemPreferred();
    } else {
      await this.themes.loadSystemPreferred();
    }
    Events.Theme.themeActivated(window, state.active);
  }
}
