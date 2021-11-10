import { Theme } from '@advanced-rest-client/events';
import { ThemeBindings } from '../base/ThemeBindings.js';

/**
 * Web platform bindings for the application themes related logic.
 */
export class ThemeBindingsWeb extends ThemeBindings {
  /**
   * @param protocol The protocol to use when requesting for a theme.
   * @param baseUri The base URI to use when requesting for a theme.
   */
  constructor(protocol: string, baseUri: string);
  darkMatcherQueryHandler(e: MediaQueryListEvent): Promise<void>;
  /**
   * @returns {ArcThemeStore}
   */
  defaultSettings(): Theme.ArcThemeStore;
  readState(): Promise<Theme.ArcThemeStore>;
  /**
   * Activates the theme. It stores theme id in user preferences and loads the
   * theme.
   * @param name Theme name to activate
   * @returns Promise resolved when the theme is activated
   */
  activate(name: string): Promise<void>;
  readSystemThemeInfo(): Promise<Theme.SystemThemeInfo>;
  setSystemPreferred(status: boolean): Promise<void>;
}
