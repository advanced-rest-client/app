import { TemplateResult } from 'lit-html';
import { Authorization } from '@advanced-rest-client/events'
import { ApplicationScreen } from './ApplicationScreen.js';

declare const themeActivatedHandler: unique symbol;

export class GoogleDrivePickerScreen extends ApplicationScreen {
  get oauthConfig(): Authorization.OAuth2Authorization;
  /** 
   * @type Whether the project is being restored from the metadata store.
   */
  initializing: boolean;
  /** 
   * @type A loading state information.
   */
  loadingStatus: string;
  driveToken: string;
  constructor();
  initialize(): Promise<void>;
  initDomEvents(): void;
  [themeActivatedHandler](e: CustomEvent): void;
  requestGoogleDriveToken(): Promise<void>;
  drivePickHandler(e: CustomEvent): void;
  appTemplate(): TemplateResult;
  /**
   * @returns The template for the host rules mapping element
   */
  googleDriveTemplate(): TemplateResult | string;
}
