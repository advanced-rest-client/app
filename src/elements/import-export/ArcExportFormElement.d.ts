import { CSSResult, TemplateResult } from 'lit-element';
import { ExportPanelBase } from './ExportPanelBase.js';
import { DataExport } from '@advanced-rest-client/arc-types';

declare function exportItemsTemplate(): TemplateResult;

export declare const loadingProperty: unique symbol;
export declare const loadingValue: unique symbol;
export declare const loadingChangeHandler: unique symbol;
export declare const arcnativeexportHandler: unique symbol;
export declare const notifySuccess: unique symbol;
export declare const notifyError: unique symbol;
export declare const prepare: unique symbol;

/**
 * Export data form with export flow logic.
 *
 * Provides the UI and and logic to export data from the data store to `destination`
 * export method provider. It uses events API to communicate with other elements.
 *
 * Required elements to be present in the DOM:
 *
 * -   `arc-data-export` - getting data from the datastore
 * -   element that handles `file-data-save` event
 * -   element that handles `google-drive-data-save` event

 * ### Example
 *
 * ```html
 * <arc-data-export app-version="12.0.0" electron-cookies></arc-data-export>
 * <google-drive-upload></google-drive-upload>
 * <file-save></file-save>
 *
 * <export-panel></export-panel>
 * ```
 * 
 * @fires loadingchange When the `loading` state changes
 */
export class ArcExportFormElement extends ExportPanelBase {
  [loadingProperty]: boolean;
  [loadingValue]: boolean;
  [loadingChangeHandler]: EventListener;
  [arcnativeexportHandler]: EventListener;

  static get styles(): CSSResult;

  get loading(): boolean;

  /**
   * `loadingchange` event listener
   */
  onloadingchange: EventListener;

  /**
   * ARC export event handler
   */
  onarcnativeexport: EventListener;
  /**
   * @attribute
   */
  file: string;

  constructor();

  /**
   * Selects all items on the list.
   */
  selectAll(): void;

  /**
   * Uses current form data to start export flow.
   * This function is to expose public API to export data.
   *
   * @returns A promise resolved when export finishes
   */
  startExport(): Promise<DataExport.ArcExportResult>;

  render(): TemplateResult;

  /**
   * Handler for click event. Calls `startExport()` function.
   */
  [prepare](): void;
  [notifySuccess](): void;
  [notifyError](): void;
}
