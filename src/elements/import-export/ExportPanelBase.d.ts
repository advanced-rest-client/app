import { TemplateResult, LitElement } from 'lit-element';
import { DataExport, GoogleDrive } from '@advanced-rest-client/arc-types';
import { Suggestion } from '@anypoint-web-components/awc';

/** @typedef {import('@advanced-rest-client/arc-types').GoogleDrive.AppFolder} AppFolder */

export declare const destinationTemplate: unique symbol;
export declare const fileInputTemplate: unique symbol;
export declare const driveInputTemplate: unique symbol;
export declare const encryptionPasswordTemplate: unique symbol;
export declare const encryptionTemplate: unique symbol;
export declare const skipImportTemplate: unique symbol;
export declare const buildExportOptions: unique symbol;
export declare const buildProviderOptions: unique symbol;
export declare const driveFoldersChanged: unique symbol;
export declare const driveSuggestionsValue: unique symbol;
export declare const parentNameValue: unique symbol;
export declare const inputHandler: unique symbol;
export declare const parentsInputHandler: unique symbol;
declare const isDriveChanged: unique symbol;
declare const listDriveFolders: unique symbol;
declare const destinationHandler: unique symbol;
declare const checkedHandler: unique symbol;

/**
 * @fires resize When the size of the element changes
 */
export declare class ExportPanelBase extends LitElement {
  [driveSuggestionsValue]?: Suggestion[];
  [parentNameValue]?: string;

  /**
   * Export file name.
   * @attribute
   */
  file?: string;
  /**
   * The identifier of the parent. It can be a file path for local filesystem
   * or Google Drive folder name.
   * @attribute
   */
  parentId?: string;
  /**
   * Export provider. By default it is `drive` or `file`.
   * @attribute
   */
  provider?: string;
  /**
   * Tells the application to set configuration on the export file to
   * skip import and insert project directly into workspace.
   * @attribute
   */
  skipImport?: boolean;
  /**
   * Computed value, true when current provider is Google Drive.
   * @attribute
   */
  isDrive?: boolean;
  /**
   * List of Google Drive folders created by this application.
   * @attribute
   */
  driveFolders?: GoogleDrive.AppFolder[]
  /**
   * Enables Anypoint compatibility
   * @attribute
   */
  compatibility?: boolean;
  /**
   * Enables outlined theme.
   * @attribute
   */
  outlined?: boolean;
  /**
   * When set the encrypt file option is enabled.
   * @attribute
   */
  encryptFile?: boolean;
  /**
   * Encryption passphrase
   * @attribute
   */
  passphrase?: string;
  /**
   * When set it renders encryption options.
   * @attribute
   */
  withEncrypt?: boolean;

  /**
   * The `googledrivelistappfolders` event handler
   */
  ongoogledrivelistappfolders: EventListener;

  constructor();

  connectedCallback(): void;

  /**
   * Checks whether the current for is valid.
   * @returns True when the current form is valid.
   */
  validate(): boolean;

  [buildExportOptions](): DataExport.ExportOptions;

  [buildProviderOptions](): DataExport.ProviderOptions;

  /**
   * Called automatically when `isDrive` property change.
   * Dispatches `resize` custom event so parent elements can position this element
   * in e.g dialogs.
   */
  [isDriveChanged](): void;

  /**
   * Attempts to read application settings by dispatching `settings-read`
   * with type `google-drive`. It expects to return `appFolders` with a list
   * of folder created by the app. This value is set as a suggestions on
   * folder input.
   */
  [listDriveFolders](): Promise<void>;

  /**
   * Transforms AppFolder model into the suggestions value.
   *
   * @param folders List of application folders.
   */
  [driveFoldersChanged](folders: GoogleDrive.AppFolder[]): void;

  [inputHandler](e: CustomEvent): void;

  [parentsInputHandler](e: CustomEvent): void;

  [checkedHandler](e: CustomEvent): void;

  [destinationHandler](e: CustomEvent): void;

  [driveInputTemplate](): TemplateResult;

  [destinationTemplate](): TemplateResult;

  [skipImportTemplate](): TemplateResult;

  [encryptionTemplate](): TemplateResult;

  [encryptionPasswordTemplate](): TemplateResult;

  [fileInputTemplate](): TemplateResult;
}
