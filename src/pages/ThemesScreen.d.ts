import { TemplateResult } from 'lit-html';
import { Theme } from '@advanced-rest-client/events';
import { ApplicationScreen } from './ApplicationScreen.js';

export class ThemesScreen extends ApplicationScreen {
  /**
   * @returns `true` if selected theme is one of default themes.
   */
  get isDefaultTheme(): boolean;
  installPending: boolean;
  systemPreferred: boolean;
  activeTheme: string;
  themes: Theme.InstalledTheme[];
  installThemeName: string;

  constructor();

  initialize(): Promise<void>;

  refresh(): Promise<void>;

  /**
   * Handler for the dropdown selection event. Activates the selected theme.
   */
  _selectionHandler(e: Event): Promise<void>;

  _themeNameHandler(e: Event): void;

  _installHandler(): Promise<void>;

  _uninstallHandler(): Promise<void>;

  _ignoreSysPrefChange(e: Event): Promise<void>;

  appTemplate(): TemplateResult;

  headerTemplate(): TemplateResult;

   /**
   * @returns The template for the drop down selector with the remove option.
   */
  selectorTemplate(): TemplateResult;

  /**
   * @returns The template for the drop down selector.
   */
  selectionDropdownTemplate(): TemplateResult;

  /**
   * @returns The template for the drop down item.
   */
  selectionItemTemplate(item: Theme.InstalledTheme): TemplateResult;

  /**
   * @returns The template for the uninstall icon
   */
  removeThemeTemplate(): TemplateResult|string;

  systemPrefsTemplate(): TemplateResult;

  /**
   * @returns The template for the install section
   */
  addTemplate(): TemplateResult|string;
}
