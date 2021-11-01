/* eslint-disable class-methods-use-this */
/* eslint-disable import/no-extraneous-dependencies */
import { get, set } from 'idb-keyval';
import { Events } from '@advanced-rest-client/events';
import { ThemeBindings } from '../base/ThemeBindings.js';
import * as Constants from '../../Constants.js';

/** @typedef {import('@advanced-rest-client/events').Theme.ArcThemeStore} ArcThemeStore */
/** @typedef {import('@advanced-rest-client/events').Theme.SystemThemeInfo} SystemThemeInfo */

const settingsKey = 'ArcAppThemeBindings';

/**
 * Web platform bindings for the application themes related logic.
 */
export class ThemeBindingsWeb extends ThemeBindings {
  /**
   * @param {string} protocol The protocol to use when requesting for a theme.
   * @param {string} baseUri The base URI to use when requesting for a theme.
   */
  constructor(protocol, baseUri) {
    super(protocol, baseUri);
    this.darkMatcher = window.matchMedia('(prefers-color-scheme: dark)');
    this.darkMatcher.addEventListener('change', this.darkMatcherQueryHandler.bind(this));
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
          version: "4.0.0",
          location: "@advanced-rest-client/arc-electron-anypoint-theme",
          mainFile: "@advanced-rest-client/arc-electron-anypoint-theme/arc-electron-anypoint-theme.css",
          description: "Advanced REST Client anypoint theme",
          isDefault: true
        },
        {
          _id: "@advanced-rest-client/arc-electron-dark-theme",
          name: "@advanced-rest-client/arc-electron-dark-theme",
          title: "Dark theme",
          version: "4.0.0",
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
