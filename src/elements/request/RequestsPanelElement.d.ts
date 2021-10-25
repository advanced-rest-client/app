import { LitElement, CSSResult, TemplateResult } from 'lit-element';
import { RequestsListMixin } from './RequestsListMixin.js';
import {
  contentActionsTemplate,
  customActionsTemplate,
  contentActionHandler,
  searchIconTemplate,
  searchInputTemplate,
  searchHandler,
  searchEmptyTemplate,
  confirmDeleteAllTemplate,
  deleteAction,
  deleteSelected,
  deleteAll,
  deleteCancel,
  deleteConfirm,
  deleteUndoTemplate,
  deleteUndoAction,
  snackbarClosedHandler,
  exportAction,
  exportAll,
  exportSelected,
  exportOptionsTemplate,
  exportOverlayClosed,
  exportCancel,
  exportAccept,
  driveExportedTemplate,
} from './internals.js';
import { DataExport } from '@advanced-rest-client/events'

/**
 * @fires details When the request details were requested
 * @fires select When selection change
 * @fires arcnavigaterequest When a request is being navigated
 * @fires queryingchange
 */
export default class RequestsPanelElement extends RequestsListMixin(LitElement) {
  static readonly styles: CSSResult[];

  constructor();

  /**
   * Toggles selection of all items on the list.
   */
  toggleSelection(): void;

  /**
   * A handler for the content action click. Calls a function depending on the click icon.
   */
  [contentActionHandler](e: PointerEvent): void;

  [searchHandler](e: CustomEvent): Promise<void>;

  [deleteAction](): void;

  [deleteSelected](): Promise<void>;

  [deleteAll](): void;

  [deleteCancel](): void;

  [deleteConfirm](): void;

  [deleteUndoAction](): Promise<void>;

  [snackbarClosedHandler](): void;

  [exportAction](): void;

  [exportOverlayClosed](): void;

  [exportAccept](e: CustomEvent): void;

  [exportCancel](): void;

  [exportAll](exportOptions: DataExport.ExportOptions, providerOptions: DataExport.ProviderOptions): Promise<void>;

  [exportSelected](selected: string[], exportOptions: DataExport.ExportOptions, providerOptions: DataExport.ProviderOptions): Promise<void>;

  render(): TemplateResult;

  /**
   * @returns A template for the list actions
   */
  [contentActionsTemplate](): TemplateResult|string;

  /**
   * @returns A template for any additional actions to be rendered in the UI.
   */
  [customActionsTemplate](): TemplateResult;

  /**
   * @returns A template for the search trigger action button
   */
  [searchIconTemplate](): TemplateResult;

  /**
   * @returns A template for the search input element
   */
  [searchInputTemplate](): TemplateResult;

  /**
   * @returns A template for the empty search result
   */
  [searchEmptyTemplate](): TemplateResult|string;

  /**
   * @returns A template for the delete all data dialog
   */
  [confirmDeleteAllTemplate](): TemplateResult|string;

  /**
   * @returns A template for the undo delete data toast
   */
  [deleteUndoTemplate](): TemplateResult|string;

  /**
   * @returns A template for the export options panel in the bottom-sheet element
   */
  [exportOptionsTemplate](): TemplateResult|string;

  /**
   * @returns A template for the Google Drive export confirmation dialog.
   */
  [driveExportedTemplate](): TemplateResult;
}
