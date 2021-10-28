import { Themes } from '@advanced-rest-client/events';
import { ThemeManagerInit } from '../../types';

/**
 * Theme manager class for the Advanced REST Client.
 * It only contains the logic that is not related to the platform bindings.
 */
export class BaseThemeManager {
  protocol: string;
  baseUri: string;
  eventsTarget: EventTarget;

  constructor(init: ThemeManagerInit);

  /**
   * Lists installed in the application themes.
   * @return A promise resolved to the theme info array
   */
  readState(): Promise<Themes.ArcThemeStore>;

  /**
   * Reads information about the current theme.
   * @return A promise resolved to the theme info
   */
  readActiveThemeInfo(): Promise<Themes.InstalledTheme>;

  /**
   * Activates the theme. It stores theme id in user preferences and loads the
   * theme.
   * @param name Theme name to activate
   * @return Promise resolved when the theme is activated
   */
  activate(name: string): Promise<void>;

  /**
   * @param name The theme to install
   */
  installTheme(name: string): Promise<void>;

  /**
   * @param name The theme to uninstall
   */
  uninstallTheme(name: string): Promise<void>;

  /**
   * Loads theme file and activates it.
   * @param themeId The id of an installed theme or location of the theme file.
   * @param noFallback By default the manager will try to revert to default
   * theme when passed theme cannot be loaded. When this option is set then
   * it will throw error instead of loading default theme.
   */
  loadTheme(themeId?: string, noFallback?: string): Promise<void>;

  /**
   * @param themeId The theme id.
   * @returns Full theme URL.
   */
  readThemeUrl(themeId: string): string;

  _loadTheme(themeId: string): Promise<void>;

  /**
   * @param status Whether to ignore the system preferences for dark / light theme.
   */
  setSystemPreferred(status: boolean): Promise<void>;

  readSystemThemeInfo(): Promise<Themes.SystemThemeInfo>;

  /**
   * Loads application theme applying user and system configuration.
   * This function should be used on each application page to load the theme.
   * @returns The id of the loaded theme.
   */
  loadApplicationTheme(): Promise<string>;

  /**
   * Loads the theme for the current system preferences.
   */
  loadSystemPreferred(): Promise<string>;

  /**
   * Loads the theme configured by the user
   */
  loadUserPreferred(): Promise<string>;
}
