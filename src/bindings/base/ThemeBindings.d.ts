import { Theme } from '@advanced-rest-client/events';
import { PlatformBindings } from './PlatformBindings.js';
import { BaseThemeManager } from '../../lib/themes/BaseThemeManager.js';

/**
 * The base class for application themes bindings.
 */
export class ThemeBindings extends PlatformBindings {
  themes: BaseThemeManager;
  /**
   * @param protocol The protocol to use when requesting for a theme.
   * @param baseUri The base URI to use when requesting for a theme.
   */
  constructor(protocol: string, baseUri: string);
  initialize(): Promise<void>;
  loadThemeHandler(e: CustomEvent): void;
  setSystemPreferredHandler(e: CustomEvent): void;
  loadApplicationThemeHandler(e: CustomEvent): void;
  activateHandler(e: CustomEvent): void;
  installHandler(e: CustomEvent): void;
  uninstallHandler(e: CustomEvent): void;
  readSateHandler(e: CustomEvent): void;
  readActiveThemeInfoHandler(e: CustomEvent): void;
  readSystemThemeInfoHandler(e: CustomEvent): void;
  defaultSettings(): Theme.ArcThemeStore;
  readState(): Promise<Theme.ArcThemeStore>;
  /**
   * Activates the theme. It stores theme id in user preferences and loads the
   * theme.
   * @param name Theme name to activate
   * @returns Promise resolved when the theme is activated
   */
  activate(name: string): Promise<void>;
  readActiveThemeInfo(): Promise<Theme.InstalledTheme>;
  readSystemThemeInfo(): Promise<Theme.SystemThemeInfo>;
  setSystemPreferred(status: boolean): Promise<void>;
}
