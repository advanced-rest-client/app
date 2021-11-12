import { TemplateResult } from 'lit-html';
import '@anypoint-web-components/awc/anypoint-dropdown-menu.js';
import '@anypoint-web-components/awc/anypoint-listbox.js';
import '@anypoint-web-components/awc/anypoint-item.js';
import '@anypoint-web-components/awc/anypoint-item-body.js';
import '@anypoint-web-components/awc/anypoint-button.js';
import '@anypoint-web-components/awc/anypoint-switch.js';
import '@advanced-rest-client/icons/arc-icon.js';
import { Application } from '@advanced-rest-client/events';
import { UpdateInfo } from 'electron-updater';
import { ApplicationScreen } from './ApplicationScreen.js';

export const checkingUpdateHandler: unique symbol;
export const updateAvailableHandler: unique symbol;
export const updateNotAvailableHandler: unique symbol;
export const updateErrorHandler: unique symbol;
export const downloadingHandler: unique symbol;
export const downloadedHandler: unique symbol;

export class AboutScreen extends ApplicationScreen {
  get updateDownloaded(): boolean;
  get updateProgress(): boolean;
  get isError(): boolean;
  get updateLabel(): string;
  /**
   * page of the update status label
   */
  updateStatePage: number;
  /** 
   * State of auto update setting.
   */
  autoUpdate: boolean;
  /** 
   * Associated message with current error code.
   */
  errorMessage: string;
  errorCode: string;
  /**
   * Whether to allow updating the application with a pre-release version.
   */
  allowPreRelease: boolean;
  /**
   * Current release channel.
   */
  upgradeInfo: UpdateInfo;
  /**
   * Current application version info.
   */
  versionInfo: Application.AppVersionInfo;

  constructor();
  initialize(): Promise<void>;
  /**
   * Reads the application configuration and sets up variables.
   */
  setupConfig(): Promise<void>;
  listen(): void;
  [checkingUpdateHandler](): void;
  [updateAvailableHandler](e: CustomEvent): void;
  [updateNotAvailableHandler](): void;
  [updateErrorHandler](e: CustomEvent): void;
  [downloadingHandler](): void;
  [downloadedHandler](): void;
  createErrorMessage(code?: string, message?: string): void;
  /**
   * Requests the application to check for updates.
   */
  updateCheck(): Promise<void>;
  /**
   * Triggers the update.
   */
  updateInstall(): Promise<void>;
  /**
   * A handler for a link click.
   * Dispatches the navigation event to prevent default action which on platforms like Electron
   * can have unintended result.
   * @param {MouseEvent} e
   */
  linkHandler(e: MouseEvent): void;
  autoChangeHandler(e: Event): Promise<void>;
  preReleaseChangeHandler(e: Event): Promise<void>;
  appTemplate(): TemplateResult;
  titleTemplate(): TemplateResult;
  updatesSettingsTemplate(): TemplateResult;
  channelsTemplate(): TemplateResult;
  errorTemplate(): TemplateResult | string;
  authorTemplate(): TemplateResult;
}
