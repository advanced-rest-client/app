/* eslint-disable class-methods-use-this */
/**
@license
Copyright 2021 The Advanced REST client authors <arc@mulesoft.com>
Licensed under the Apache License, Version 2.0 (the "License"); you may not
use this file except in compliance with the License. You may obtain a copy of
the License at
http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
License for the specific language governing permissions and limitations under
the License.
*/
import { LitElement, html } from 'lit-element';
import { ArcModelEvents, ExportEvents } from '@advanced-rest-client/events';
import '@advanced-rest-client/highlight/arc-marked.js';
import { MarkdownStyles } from '@advanced-rest-client/highlight';
import '@advanced-rest-client/icons/arc-icon.js';
import '@anypoint-web-components/awc/anypoint-menu-button.js';
import '@anypoint-web-components/awc/anypoint-listbox.js';
import '@anypoint-web-components/awc/anypoint-icon-item.js';
import '@anypoint-web-components/awc/anypoint-icon-button.js';
import '@anypoint-web-components/awc/anypoint-button.js';
import '@anypoint-web-components/awc/bottom-sheet.js';
import '@material/mwc-snackbar';
import { SavedListMixin } from '../request/SavedListMixin.js';
import ListStyles from '../request/ListStyles.js';
import * as internals from '../request/internals.js';
import { RequestsListMixin } from '../request/RequestsListMixin.js';
import panelStyles from '../request/HistoryPanelStyles.js';
import elementStyles from './styles/ProjectScreen.js';
import '../../../define/export-options.js';
import '../../../define/project-meta-editor.js';

/** @typedef {import('@advanced-rest-client/events').Project.ARCProject} ARCProject */
/** @typedef {import('@advanced-rest-client/events').ArcRequest.ARCSavedRequest} ARCSavedRequest */
/** @typedef {import('lit-element').TemplateResult} TemplateResult */
/** @typedef {import('../../types').ListType} ListType */

export const projectIdValue = Symbol('projectIdValue');
export const projectIdChanged = Symbol('projectIdChanged');
export const projectHeaderTemplate = Symbol('projectHeaderTemplate');
export const headerContextMenuTemplate = Symbol('headerContextMenuTemplate');
export const descriptionTemplate = Symbol('descriptionTemplate');
export const confirmDeleteProjectTemplate = Symbol('confirmDeleteProjectTemplate');
export const deleteProjectDialogValue = Symbol('deleteProjectDialogValue');
export const deleteProjectHandler = Symbol('deleteProjectHandler');
export const metaEditorTemplate = Symbol('metaEditorTemplate');
export const editorHandler = Symbol('editorHandler');
export const metaEditorClose = Symbol('metaEditorClose');
export const sheetClosedHandler = Symbol('sheetClosedHandler');

const {
  readProjectRequests,
  busyTemplate,
  unavailableTemplate,
  listTemplate,
  queryingValue,
  contentActionsTemplate,
  contentActionHandler,
  toggleSelectAllValue,
  selectedItemsValue,
  notifySelection,
  loadPage,
  deleteAction,
  deleteUndoTemplate,
  deleteUndoOpened,
  deleteLatestList,
  deleteUndoAction,
  snackbarClosedHandler,
  exportAction,
  exportOptionsTemplate,
  exportOptionsOpened,
  exportOverlayClosed,
  exportAccept,
  exportCancel,
  driveExportedTemplate,
  deleteCancel,
  deleteConfirm,
} = internals;

export default class ProjectScreenElement extends SavedListMixin(RequestsListMixin(LitElement)) {
  static get styles() {
    return [elementStyles, ListStyles, MarkdownStyles, panelStyles];
  }

  static get properties() {
    return {
      /**
       * When true the project meta editor is opened.
       */
      editor: { type: Boolean, reflect: true },
    };
  }

  /**
   * @returns {string}
   */
  get projectId() {
    return this[projectIdValue];
  }

  set projectId(value) {
    const old = this[projectIdValue];
    /* istanbul ignore if */
    if (old === value) {
      return;
    }
    this[projectIdValue] = value;
    this[projectIdChanged](value);
  }

  constructor() {
    super();
    this.editor = false;
    this.type = /** @type ListType */ ('project');
    this.listActions = true;
    this.selectable = true;
    this.noAuto = true;
  }

  /**
   * @param {Map<string | number | symbol, unknown>} arg
   */
  firstUpdated(arg) {
    super.firstUpdated(arg);
    if (this.projectId) {
      this[projectIdChanged](this.projectId);
    }
  }

  /**
   * Updates project info when `projectId` changed.
   * @param {string} id Project data store id.
   * @returns {Promise<void>}
   */
  async [projectIdChanged](id) {
    this.project = undefined;
    if (!id || !this.parentElement) {
      return;
    }
    await this[loadPage]();
  }

  /**
   * Queries for the request data,
   *
   * @return {Promise<void>} Resolved promise when the query ends.
   */
  async [loadPage]() {
    this[queryingValue] = true;
    this.requestUpdate();
    try {
      this.requests = await this[readProjectRequests](this.projectId);
    } catch (e) {
      // 
    }
    this[queryingValue] = false;
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
      case 'refresh': this.refresh(); break;
      case 'toggle-all': this.toggleSelection(); break;
      case 'delete': this[deleteAction](); break;
      case 'export': this[exportAction](); break;
      default:
    }
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

  async [deleteAction]() {
    const selected = /** @type string[] */(this[selectedItemsValue]);
    let ids;
    if (!Array.isArray(selected) || !selected.length) {
      ids = this.requests.map((item) => item._id);
    } else {
      ids = selected;
    }
    this[deleteLatestList] = await ArcModelEvents.Request.deleteBulk(this, 'saved', ids);
    this[selectedItemsValue] = undefined;
    this[notifySelection]();
    this[deleteUndoOpened] = true;
    await this.requestUpdate();
  }

  async [deleteUndoAction]() {
    const deleted = this[deleteLatestList];
    if (!deleted || !deleted.length) {
      return;
    }
    await ArcModelEvents.Request.undeleteBulk(this, 'saved', deleted);
    this[deleteLatestList] = undefined;
    this[deleteUndoOpened] = false;
    this.requestUpdate();
  }

  [snackbarClosedHandler]() {
    this[deleteUndoOpened] = false;
  }

  [deleteProjectHandler]() {
    this[deleteProjectDialogValue] = true;
    this.requestUpdate();
  }

  [deleteCancel]() {
    this[deleteProjectDialogValue] = false;
    this.requestUpdate();
  }

  async [deleteConfirm]() {
    const { projectId } = this;
    await ArcModelEvents.Project.delete(this, projectId);
    this[deleteProjectDialogValue] = false;
    this.projectId = undefined;
    this.requests = undefined;
    this.project = undefined;
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
  async [exportAccept](e) {
    this[exportOverlayClosed]();
    const data = {
      projects: [this.project],
      requests: [],
    };
    const selected = /** @type string[] */(this[selectedItemsValue]);
    if (!Array.isArray(selected) || !selected.length) {
      data.requests = this.requests;
    } else {
      data.requests = this.requests.filter((r) => selected.includes(r._id));
      data.projects[0].requests = data.projects[0].requests.filter((id) => selected.includes(id));
    }
    const { exportOptions, providerOptions } = e.detail;
    const eo = { ...exportOptions, kind: 'ARC#Project' };
    const result = await ExportEvents.nativeData(this, data, eo, providerOptions);
    if (!result.interrupted && exportOptions.provider === 'drive') {
      // @ts-ignore
      this.shadowRoot.querySelector('#driveExport').open = true;
    }
  }

  [exportCancel]() {
    this[exportOverlayClosed]();
  }

  [editorHandler]() {
    this.editor = true;
  }

  [metaEditorClose]() {
    this.editor = false;
  }

  [sheetClosedHandler](e) {
    const prop = e.target.dataset.openProperty;
    this[prop] = e.detail.value;
  }

  render() {
    return html`
    ${this[busyTemplate]()}
    ${this[projectHeaderTemplate]()}
    ${this[descriptionTemplate]()}
    ${this[contentActionsTemplate]()}
    ${this[unavailableTemplate]()}
    <div class="list">
    ${this[listTemplate]()}
    </div>
    ${this[deleteUndoTemplate]()}
    ${this[exportOptionsTemplate]()}
    ${this[driveExportedTemplate]()}
    ${this[confirmDeleteProjectTemplate]()}
    ${this[metaEditorTemplate]()}
    `;
  }

  /**
   * @returns {TemplateResult|string} Project header template
   */
  [projectHeaderTemplate]() {
    const { project } = this;
    if (!project) {
      return '';
    }
    return html`
    <div class="title">
      <h2>${project.name || ''}</h2>
      ${this[headerContextMenuTemplate]()}
    </div>
    `;
  }

  [headerContextMenuTemplate]() {
    const { anypoint } = this;
    return html`
    <div class="header-actions">
      <anypoint-menu-button
        dynamicAlign
        closeOnActivate
        id="mainMenu"
        ?anypoint="${anypoint}"
      >
        <anypoint-icon-button
          aria-label="Activate to open context menu"
          slot="dropdown-trigger"
          ?anypoint="${anypoint}">
          <arc-icon class="icon" icon="moreVert"></arc-icon>
        </anypoint-icon-button>
        <anypoint-listbox
          slot="dropdown-content"
          id="mainMenuOptions"
          ?anypoint="${anypoint}"
        >
          <anypoint-icon-item
            class="menu-item"
            data-action="toggle-edit"
            @click="${this[editorHandler]}"
          >
            <arc-icon class="icon" slot="item-icon" icon="edit"></arc-icon>Edit details
          </anypoint-icon-item>
          <anypoint-icon-item
            class="menu-item"
            data-action="export-all"
            @click="${this[exportAction]}"
          >
            <arc-icon class="icon" slot="item-icon" icon="archive"></arc-icon>Export project
          </anypoint-icon-item>
          <anypoint-icon-item
            class="menu-item"
            data-action="delete-project"
            @click="${this[deleteProjectHandler]}"
          >
            <arc-icon class="icon" slot="item-icon" icon="clear"></arc-icon>Delete project
          </anypoint-icon-item>
        </anypoint-listbox>
      </anypoint-menu-button>
    </div>
    `;
  }

  /**
   * @returns {TemplateResult|string} Project description template
   */
  [descriptionTemplate]() {
    const { project } = this;
    if (!project || !project.description) {
      return '';
    }
    return html`
    <arc-marked .markdown="${project.description}">
      <div slot="markdown-html" class="markdown-html markdown-body description-value"></div>
    </arc-marked>`;
  }

  [contentActionsTemplate]() {
    const { dataUnavailable } = this;
    if (dataUnavailable) {
      return '';
    }
    const { selectedItems } = this;
    const expLabel = selectedItems && selectedItems.length ? 'Export project with selected requests' : 'Export project with all requests';
    const delLabel = selectedItems && selectedItems.length ? 'Delete selected requests' : 'Delete all requests in the project';
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
        file="arc-project.arc"
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

  /**
   * @returns {TemplateResult|string} The template for the delete all data dialog
   */
  [confirmDeleteProjectTemplate]() {
    if (!this[deleteProjectDialogValue]) {
      return '';
    }
    return html`
    <div class="delete-container">
      <div class="delete-all-overlay"></div>
      <div class="delete-all-dialog dialog">
        <h2>Confirm delete project</h2>
        <p>The project will be permanently deleted.</p>
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
   * @returns {TemplateResult|string} The template for the project details editor.
   */
  [metaEditorTemplate]() {
    const { project } = this;
    if (!project) {
      return '';
    }
    const { anypoint, editor } = this;
    return html`
    <bottom-sheet
      id="exportOptionsContainer"
      .opened="${editor}"
      data-open-property="editor"
      noCancelOnEscKey
      noCancelOnOutsideClick
      @closed="${this[sheetClosedHandler]}"
    >
      <project-meta-editor
        ?anypoint="${anypoint}"
        .project="${project}"
        @close="${this[metaEditorClose]}"
      ></project-meta-editor>
    </bottom-sheet>
    `;
  }
}
