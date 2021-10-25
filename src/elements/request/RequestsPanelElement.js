/* eslint-disable class-methods-use-this */
import { LitElement, html } from 'lit-element';
import '@advanced-rest-client/icons/arc-icon.js';
import '@anypoint-web-components/awc/anypoint-input.js';
import '@anypoint-web-components/awc/anypoint-icon-button.js';
import '@anypoint-web-components/awc/bottom-sheet.js';
import '@material/mwc-snackbar';
import { ArcModelEvents, ExportEvents } from '@advanced-rest-client/events';
import '../../../define/export-options.js';
import { RequestsListMixin } from './RequestsListMixin.js';
import elementStyles from './HistoryPanelStyles.js';
import listStyles from './ListStyles.js';
import {
  busyTemplate,
  unavailableTemplate,
  listTemplate,
  contentActionsTemplate,
  customActionsTemplate,
  contentActionHandler,
  searchIconTemplate,
  searchInputTemplate,
  searchHandler,
  searchEmptyTemplate,
  toggleSelectAllValue,
  selectedItemsValue,
  listScrollHandler,
  confirmDeleteAllTemplate,
  deleteAllDialogValue,
  deleteAction,
  deleteSelected,
  deleteAll,
  deleteCancel,
  deleteConfirm,
  notifySelection,
  deleteLatestList,
  deleteUndoOpened,
  deleteUndoTemplate,
  deleteUndoAction,
  snackbarClosedHandler,
  exportAction,
  exportAll,
  exportSelected,
  exportOptionsTemplate,
  exportOptionsOpened,
  exportOverlayClosed,
  exportCancel,
  exportAccept,
  driveExportedTemplate,
  dropTargetTemplate,
  readType,
  exportKindValue,
} from './internals.js';

/** @typedef {import('../../../').ExportOptionsElement} ExportOptionsElement */
/** @typedef {import('@advanced-rest-client/events').DataExport.ProviderOptions} ProviderOptions */
/** @typedef {import('@advanced-rest-client/events').DataExport.ExportOptions} ExportOptions */
/** @typedef {import('lit-element').TemplateResult} TemplateResult */

export default class RequestsPanelElement extends RequestsListMixin(LitElement) {
  static get styles() {
    return [elementStyles, listStyles];
  }

  constructor() {
    super();
    this.listActions = true;
    this.selectable = true;
  }

  /**
   * Toggles selection of all items on the list.
   */
  toggleSelection() {
    this[toggleSelectAllValue] = !this[toggleSelectAllValue];
    this[selectedItemsValue] = /** @type string[] */ ([]);
    if (this[toggleSelectAllValue]) {
      this[selectedItemsValue] = (this.requests || []).map((item) => item._id);
    }
    this[notifySelection]();
    this.requestUpdate();
  }

  /**
   * A handler for the content action click. Calls a function depending on the click icon.
   * @param {PointerEvent} e
   */
  [contentActionHandler](e) {
    const node = /** @type HTMLElement */(e.currentTarget);
    const { action } = node.dataset;
    switch (action) {
      case 'search': this.isSearch = true; break;
      case 'refresh': this.refresh(); break;
      case 'toggle-all': this.toggleSelection(); break;
      case 'delete': this[deleteAction](); break;
      case 'export': this[exportAction](); break;
      default:
    }
  }

  /**
   * @param {CustomEvent} e
   */
  async [searchHandler](e) {
    const node = /** @type  HTMLInputElement */ (e.target);
    const { value } = node;
    await this.query(value);
  }

  [deleteAction]() {
    const selected = /** @type string[] */(this[selectedItemsValue]);
    if (!Array.isArray(selected) || !selected.length) {
      this[deleteAll]();
    } else {
      this[deleteSelected]();
    }
  }

  async [deleteSelected]() {
    const selected = /** @type string[] */(this[selectedItemsValue]);
    this[deleteLatestList] = await ArcModelEvents.Request.deleteBulk(this, this[readType](), selected);
    this[selectedItemsValue] = undefined;
    this[notifySelection]();
    this[deleteUndoOpened] = true;
    await this.requestUpdate();
  }

  [deleteAll]() {
    this[deleteAllDialogValue] = true;
    this.requestUpdate();
  }

  [deleteCancel]() {
    this[deleteAllDialogValue] = false;
    this.requestUpdate();
  }

  [deleteConfirm]() {
    const type = this[readType]();
    ArcModelEvents.destroy(this, [type]);
    this[deleteCancel]();
    if (this[selectedItemsValue]) {
      this[selectedItemsValue] = undefined;
      this[notifySelection]();
    }
  }

  async [deleteUndoAction]() {
    const deleted = this[deleteLatestList];
    if (!deleted || !deleted.length) {
      return;
    }
    await ArcModelEvents.Request.undeleteBulk(this, this[readType](), deleted);
    this[deleteLatestList] = undefined;
    this[deleteUndoOpened] = false;
    this.requestUpdate();
  }

  [snackbarClosedHandler]() {
    this[deleteUndoOpened] = false;
  }

  [exportAction]() {
    this[exportOptionsOpened] = true;
    this.requestUpdate();
  }

  [exportOverlayClosed]() {
    this[exportOptionsOpened] = false;
    this.requestUpdate();
  }

  /**
   * @param {CustomEvent} e
   */
  [exportAccept](e) {
    this[exportOverlayClosed]();
    const selected = /** @type string[] */(this[selectedItemsValue]);
    const { exportOptions, providerOptions } = e.detail;
    if (!Array.isArray(selected) || !selected.length) {
      this[exportAll](exportOptions, providerOptions);
    } else {
      this[exportSelected](selected, exportOptions, providerOptions);
    }
  }

  [exportCancel]() {
    this[exportOverlayClosed]();
  }

  /**
   * @param {ExportOptions} exportOptions
   * @param {ProviderOptions} providerOptions
   */
  async [exportAll](exportOptions, providerOptions) {
    let dataType = this[readType]();
    if (dataType === 'saved') {
      dataType = 'requests';
    }
    const data = {
      [dataType]: true,
    };
    const eo = { ...exportOptions };
    if (!eo.kind && this[exportKindValue]) {
      eo.kind = this[exportKindValue];
    }
    const result = await ExportEvents.nativeData(this, data, eo, providerOptions);
    if (!result.interrupted && exportOptions.provider === 'drive') {
      // @ts-ignore
      this.shadowRoot.querySelector('#driveExport').open = true;
    }
  }

  /**
   * @param {string[]} selected
   * @param {ExportOptions} exportOptions
   * @param {ProviderOptions} providerOptions
   */
  async [exportSelected](selected, exportOptions, providerOptions) {
    let dataType = this[readType]();
    const requests = await ArcModelEvents.Request.readBulk(this, dataType, selected);
    if (dataType === 'saved') {
      dataType = 'requests';
    }
    const data = {
      [dataType]: requests,
    };
    const eo = { ...exportOptions };
    if (!eo.kind && this[exportKindValue]) {
      eo.kind = this[exportKindValue];
    }
    const result = await ExportEvents.nativeData(this, data, eo, providerOptions);
    if (!result) {
      return;
    }
    if (!result.interrupted && exportOptions.provider === 'drive') {
      // @ts-ignore
      this.shadowRoot.querySelector('#driveExport').open = true;
    }
  }

  render() {
    return html`
    ${this[dropTargetTemplate]()}
    ${this[busyTemplate]()}
    ${this[contentActionsTemplate]()}
    ${this[unavailableTemplate]()}
    ${this[searchEmptyTemplate]()}
    <div class="list" @scroll="${this[listScrollHandler]}">
    ${this[listTemplate]()}
    </div>
    ${this[confirmDeleteAllTemplate]()}
    ${this[deleteUndoTemplate]()}
    ${this[exportOptionsTemplate]()}
    ${this[driveExportedTemplate]()}
    `;
  }

  /**
   * @returns {TemplateResult|string} A template for the list actions
   */
  [contentActionsTemplate]() {
    const { dataUnavailable } = this;
    if (dataUnavailable) {
      return '';
    }
    const { selectedItems, isSearch } = this;
    const expLabel = selectedItems && selectedItems.length ? 'Export selected' : 'Export all';
    const delLabel = selectedItems && selectedItems.length ? 'Delete selected' : 'Delete all';
    return html`
    <div class="content-actions">
      <anypoint-icon-button @click="${this[contentActionHandler]}" data-action="export" title="${expLabel}">
        <arc-icon icon="archive"></arc-icon>
      </anypoint-icon-button>
      <anypoint-icon-button @click="${this[contentActionHandler]}" data-action="delete" title="${delLabel}">
        <arc-icon icon="deleteIcon"></arc-icon>
      </anypoint-icon-button>
      <div class="selection-divider"></div>
      <anypoint-icon-button @click="${this[contentActionHandler]}" data-action="refresh" title="Reload the list">
        <arc-icon icon="refresh"></arc-icon>
      </anypoint-icon-button>
      <anypoint-icon-button @click="${this[contentActionHandler]}" data-action="toggle-all" title="Toggle selection all">
        <arc-icon icon="selectAll"></arc-icon>
      </anypoint-icon-button>
      <div class="selection-divider"></div>
      ${isSearch ? this[searchInputTemplate]() : this[searchIconTemplate]()}
      ${this[customActionsTemplate]()}
    </div>
    `;
  }

  /**
   * @returns {TemplateResult} A template for any additional actions to be rendered in the UI.
   */
  [customActionsTemplate]() {
    return html``;
  }

  /**
   * @returns {TemplateResult} A template for the search trigger action button
   */
  [searchIconTemplate]() {
    return html`
    <anypoint-icon-button @click="${this[contentActionHandler]}" data-action="search" title="Search the requests">
      <arc-icon icon="search"></arc-icon>
    </anypoint-icon-button>`;
  }

  /**
   * @returns {TemplateResult} A template for the search input element
   */
  [searchInputTemplate]() {
    return html`
    <anypoint-input 
      type="search" 
      class="search-input" 
      noLabelFloat
      @search="${this[searchHandler]}"
    >
      <label slot="label">Search</label>
    </anypoint-input>
    `;
  }

  /**
   * @returns {TemplateResult|string} A template for the empty search result
   */
  [searchEmptyTemplate]() {
    if (!this.isSearch || !this.searchListEmpty) {
      return '';
    }
    return html`
    <div class="search-empty">
      <p><b>No results.</b> Try to change the search query.</p>
    </div>
    `;
  }

  /**
   * @returns {TemplateResult|string} A template for the delete all data dialog
   */
  [confirmDeleteAllTemplate]() {
    if (!this[deleteAllDialogValue]) {
      return '';
    }
    return html`
    <div class="delete-container">
      <div class="delete-all-overlay"></div>
      <div class="delete-all-dialog dialog">
        <h2>Confirm delete all</h2>
        <p>All requests from the data store will be permanently deleted.</p>
        <p>Do you wish to continue?</p>
        <div class="buttons">
          <anypoint-button @click="${this[exportAction]}">Make backup</anypoint-button>
          <anypoint-button class="right-button" @click="${this[deleteCancel]}">Cancel</anypoint-button>
          <anypoint-button @click="${this[deleteConfirm]}">Delete</anypoint-button>
        </div>
      </div>
    </div>
    `;
  }

  /**
   * @returns {TemplateResult|string} A template for the undo delete data toast
   */
  [deleteUndoTemplate]() {
    const opened = this[deleteUndoOpened];
    const cnt = (this[deleteLatestList] || []).length || 0;
    return html`
    <mwc-snackbar 
      labelText="${cnt} requests were deleted." 
      ?open="${opened}" 
      timeoutMs="8000"
      @closed="${this[snackbarClosedHandler]}"
    >
      <anypoint-button 
        class="snackbar-button" 
        slot="action" 
        @click="${this[deleteUndoAction]}"
      >Undo</anypoint-button>
      <anypoint-icon-button 
        aria-label="Activate to close this message"
        title="Close this message"
        slot="dismiss"
        class="snackbar-button"
      >
        <arc-icon icon="close" class="snackbar-button"></arc-icon>
      </anypoint-icon-button>
    </mwc-snackbar>
    `;
  }

  /**
   * @returns {TemplateResult|string} A template for the export options panel in the bottom-sheet element
   */
  [exportOptionsTemplate]() {
    const opened = this[exportOptionsOpened];
    const {
      anypoint,
    } = this;
    return html`
    <bottom-sheet
      withBackdrop
      .opened="${opened}"
      @closed="${this[exportOverlayClosed]}"
    >
      <export-options
        ?anypoint="${anypoint}"
        withEncrypt
        file="arc-saved-list.arc"
        provider="file"
        @accept="${this[exportAccept]}"
        @cancel="${this[exportCancel]}"
      ></export-options>
    </bottom-sheet>`;
  }

  /**
   * @returns {TemplateResult|string} A template for the Google Drive export confirmation dialog.
   */
  [driveExportedTemplate]() {
    return html`
    <mwc-snackbar id="driveExport" labelText="Data saved on Google Drive."></mwc-snackbar>
    `;
  }
}
