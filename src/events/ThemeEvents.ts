import { ContextEvent } from "@api-client/core/build/browser";
import { ArcThemeStore, InstalledTheme, SystemThemeInfo } from "../models/Themes.js";
import { EventTypes } from "./EventTypes.js";

export class ThemeEvents {
  /** 
   * Loads application theme applying user and system configuration.
   * This function should be used on each application page to load the theme.
   * @param target The node on which to dispatch the event.
   * @returns The id of the loaded theme.
   */
  static async loadApplicationTheme(target: EventTarget = window): Promise<string | undefined> {
    const e = new ContextEvent<Record<string, unknown>, string>(EventTypes.Theme.loadApplicationTheme, {});
    target.dispatchEvent(e);
    return e.detail.result;
  }

  /** 
   * Loads theme file and activates it.
   * 
   * @param themeId The id of an installed theme or location of the theme file.
   * @param noFallback By default the manager will try to revert to the default
   * theme when passed theme cannot be loaded. When this option is set then
   * it will throw error instead of loading the default theme.
   * @param target The node on which to dispatch the event.
   */
  static async loadTheme(themeId?: string, noFallback?: boolean, target: EventTarget = window): Promise<void> {
    const e = new ContextEvent<{ themeId?: string, noFallback?: boolean }, void>(EventTypes.Theme.loadTheme, { themeId, noFallback });
    target.dispatchEvent(e);
    await e.detail.result;
  }

  /** 
   * Lists installed in the application themes.
   * @param target The node on which to dispatch the event.
   * @returns A promise resolved to the theme info array
   */
  static async readSate(target: EventTarget = window): Promise<ArcThemeStore | undefined> {
    const e = new ContextEvent<Record<string, unknown>, ArcThemeStore>(EventTypes.Theme.readSate, {});
    target.dispatchEvent(e);
    return e.detail.result;
  }

  /** 
   * Reads information about the current theme.
   * @param target The node on which to dispatch the event.
   * @returns A promise resolved to the theme info array
   */
  static async readActiveThemeInfo(target: EventTarget = window): Promise<InstalledTheme | undefined> {
    const e = new ContextEvent<Record<string, unknown>, InstalledTheme>(EventTypes.Theme.readActiveThemeInfo, {});
    target.dispatchEvent(e);
    return e.detail.result;
  }

  /** 
   * Activates the theme. It stores theme id in user preferences and loads the
   * theme.
   * @param name The theme name to activate
   * @param target The node on which to dispatch the event.
   */
  static async activate(name: string, target: EventTarget = window): Promise<void> {
    const e = new ContextEvent<{name: string}, void>(EventTypes.Theme.activate, { name });
    target.dispatchEvent(e);
    await e.detail.result;
  }

  /** 
   * Installs a theme.
   * @param name The theme to install
   * @param target The node on which to dispatch the event.
   */
  static async install(name: string, target: EventTarget = window): Promise<void>{
    const e = new ContextEvent(EventTypes.Theme.install, { name });
    target.dispatchEvent(e);
    await e.detail.result;
  }

  /** 
   * Uninstalls a theme.
   * 
   * @param name The theme to uninstall
   * @param target The node on which to dispatch the event.
   */
  static async uninstall(name: string, target: EventTarget = window): Promise<void> {
    const e = new ContextEvent(EventTypes.Theme.uninstall, { name });
    target.dispatchEvent(e);
    await e.detail.result;
  }

  /** 
   * @param status Whether to ignore the system preferences for dark / light theme.
   * @param target The node on which to dispatch the event.
   */
  static async setSystemPreferred(status: boolean, target: EventTarget = window): Promise<void> {
    const e = new ContextEvent(EventTypes.Theme.setSystemPreferred, { status });
    target.dispatchEvent(e);
    await e.detail.result;
  }

  /** 
   * @param target The node on which to dispatch the event.
   */
  static async readSystemThemeInfo(target: EventTarget = window): Promise<SystemThemeInfo | undefined> {
    const e = new ContextEvent<Record<string, unknown>, SystemThemeInfo>(EventTypes.Theme.readSystemThemeInfo, {});
    target.dispatchEvent(e);
    return e.detail.result;
  }

  /** 
   * @param target The node on which to dispatch the event.
   */
  static async loadSystemPreferred(target: EventTarget = window): Promise<string | undefined> {
    const e = new ContextEvent<Record<string, unknown>, string>(EventTypes.Theme.loadSystemPreferred, {});
    target.dispatchEvent(e);
    return e.detail.result;
  }

  /** 
   * @param target The node on which to dispatch the event.
   */
  static async loadUserPreferred(target: EventTarget = window): Promise<string | undefined> {
    const e = new ContextEvent<Record<string, unknown>, string>(EventTypes.Theme.loadUserPreferred, {});
    target.dispatchEvent(e);
    return e.detail.result;
  }

  /**
   * Dispatched when a theme has been activated.
   * 
   * @param id The id of the activated theme
   */
  static themeActivated(id: string, target: EventTarget = window): void {
    const e = new CustomEvent(EventTypes.Theme.State.activated, {
      detail: { id },
      bubbles: true,
      composed: true,
    });
    target.dispatchEvent(e);
  }
}
