/* eslint-disable class-methods-use-this */
/* eslint-disable no-plusplus */

import { html } from 'lit-element';
import '@anypoint-web-components/awc/anypoint-input.js';
import '@anypoint-web-components/awc/anypoint-button.js';
import '@anypoint-web-components/awc/anypoint-chip-input.js';
import { MonacoTheme, MonacoStyles } from '@advanced-rest-client/monaco-support';
import { ArcModelEvents, WorkspaceEvents } from '@advanced-rest-client/events';
import { ProjectsListConsumerMixin } from './ProjectsListConsumerMixin.js';
import * as internals from './internals.js';
import RequestMetaDetailsElement from './RequestMetaDetailsElement.js';
import styles from './styles/RequestMetaEditor.js';
import {
  requestValue,
  requestChanged,
  titleTemplate,
  nameInputTemplate,
  addressTemplate,
  selectedProjectsValue,
  overrideValue,
  savingValue,
  submitHandler,
  overrideHandler,
  computeEventDetail,
  restoreProjects,
  inputHandler,
  projectsHandler,
  cancelHandler,
  saveHandler,
  descriptionTemplate,
  actionsTemplate,
  savedActionsTemplate,
  unsavedActionsTemplate,
  projectsTemplate,
  keydownHandler,
} from './internals.js';

/** @typedef {import('lit-element').CSSResult} CSSResult */
/** @typedef {import('@advanced-rest-client/events').ArcRequest.ARCSavedRequest} ARCSavedRequest */
/** @typedef {import('@advanced-rest-client/events').ArcRequest.ARCHistoryRequest} ARCHistoryRequest */
/** @typedef {import('@advanced-rest-client/events').Project.ARCProject} ARCProject */
/** @typedef {import('@advanced-rest-client/events').ARCProjectUpdatedEvent} ARCProjectUpdatedEvent */
/** @typedef {import('monaco-editor').editor.IStandaloneEditorConstructionOptions} IStandaloneEditorConstructionOptions */
/** @typedef {import('./ProjectsListConsumerMixin').ProjectSelectionInfo} ProjectSelectionInfo */
/** @typedef {import('@anypoint-web-components/awc').AnypointInputElement} AnypointInput */
/** @typedef {import('@anypoint-web-components/awc').AnypointChipInputElement} AnypointChipInputElement */

/* global  monaco */

/**
 * Cancels an event
 * @param {Event} e
 */
function stopEvent(e) {
  e.stopPropagation();
}

export const generateEditorConfig = Symbol('generateEditorConfig');
export const monacoValueChanged = Symbol('monacoValueChanged');
export const monacoInstance = Symbol('monacoInstance');

/**
 * A dialog to edit request meta data.
 *
 * It requires `<request-model>` and `<project-model>` to be in the DOM to
 * handle data queries.
 *
 * ## Usage
 *
 * Assign `request` property to a request object. The component decides
 * what view to render (saved vs. not saved request).
 *
 * ```html
 * <saved-request-editor request='{...}'></saved-request-editor>
 * ```
 *
 * If the request has both `_id` and `_rev` properties (PouchDB properties)
 * it renders "saved" view.
 */
export default class RequestMetaEditorElement extends ProjectsListConsumerMixin(RequestMetaDetailsElement) {
  /**
   * @returns {CSSResult[]}
   */
  static get styles() {
    return [
      ...(/** @type CSSResult[] */ (RequestMetaDetailsElement.styles)),
      styles,
      MonacoStyles,
    ];
  }

  static get properties() {
    return {
      /**
       * Name of the request.
       */
      name: { type: String },
      /**
       * Request description.
       */
      description: { type: String },
      /**
       * List of selected in the dialog project names.
       */
      selectedProjects: { type: Array },
      /**
       * Enables material's outlined theme for inputs.
       */
      outlined: { type: Boolean },
      /** 
       * When set is always treats the current request as unsaved request.
       * When storing the request the id and rev are removed.
       */
      saveAs: { type: Boolean },
    };
  }

  get selectedProjects() {
    return this[selectedProjectsValue];
  }

  set selectedProjects(value) {
    const old = this[selectedProjectsValue];
    const oldSerialized = Array.isArray(old) ? JSON.stringify(old) : '';
    const thisStringified = Array.isArray(value) ? JSON.stringify(value) : '';
    if (oldSerialized === thisStringified) {
      return;
    }
    this[selectedProjectsValue] = value;
    this.requestUpdate();
  }

  /**
   * Computes value for `isSaved` property.
   * @return {Boolean}
   */
  get isSavedRequest() {
    const request = this[requestValue];
    if (!request || this.saveAs) {
      return false;
    }
    const history = !!(request && request.type === 'history');
    return history ? false : !!request._rev;
  }

  constructor() {
    super();
    this.outlined = false;
    this.saveAs = false;
    this[monacoValueChanged] = this[monacoValueChanged].bind(this);
    this[keydownHandler] = this[keydownHandler].bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('keydown', this[keydownHandler]);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('keydown', this[keydownHandler]);
  }

  /**
   * @param {KeyboardEvent} e
   */
  [keydownHandler](e) {
    const { ctrlKey, key } = e;
    if (ctrlKey && key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
    }
  }

  /**
   * @param {ARCProjectUpdatedEvent} e
   */
  async [internals.projectChangeHandler](e) {
    await super[internals.projectChangeHandler](e);
    this[requestChanged]();
  }

  /**
   * @param {Map<string | number | symbol, unknown>} args
   */
  firstUpdated(args) {
    super.firstUpdated(args);
    const config = this[generateEditorConfig]();
    // @ts-ignore
    const instance = monaco.editor.create(this.shadowRoot.querySelector('.monaco'), config);
    instance.onDidChangeModelContent(this[monacoValueChanged]);
    this[monacoInstance] = instance;
  }

  /**
   * Resets the state of the UI
   */
  reset() {
    this.name = '';
    this.description = '';
    this.selectedProjects = [];
  }

  [generateEditorConfig]() {
    let config = /** IStandaloneEditorConstructionOptions */ ({
      minimap: {
        enabled: false,
      },
      formatOnType: true,
      folding: true,
      tabSize: 2,
      detectIndentation: true,
      value: this.description,
    });
    // @ts-ignore
    config = MonacoTheme.assignTheme(monaco, config);
    config.language = 'markdown';
    return config;
  }

  [monacoValueChanged]() {
    this.description =  this[monacoInstance].getValue();
  }

  /**
   * Sends the `cancel` custom event to cancel the edit.
   */
  [cancelHandler]() {
    this.dispatchEvent(new CustomEvent('close'));
  }

  /**
   * Sets `override` to `false` and sends the form.
   */
  [saveHandler]() {
    this[overrideValue] = false;
    this.send();
  }

  /**
   * Sets `override` to `true` and sends the form.
   */
  [overrideHandler]() {
    this[overrideValue] = true;
    this.send();
  }

  /**
   * Validates and submits the form.
   */
  async send() {
    if (!this.validate()) {
      return;
    }
    const { request, projects } = this[computeEventDetail]();
    this[savingValue] = true;
    this.requestUpdate();
    const record = await ArcModelEvents.Request.store(this, 'saved', request, projects);
    this[savingValue] = false;
    this.request = record.item;
    this.dispatchEvent(new CustomEvent('update', {
      detail: record.item,
    }));
    this.requestUpdate();
    this.dispatchEvent(new CustomEvent('close'));
    if (!this[overrideValue] || this.saveAs) {
      WorkspaceEvents.appendRequest(this, record.item);
    }
  }

  /**
   * @returns {boolean} True when all inputs are valid.
   */
  validate() {
    const inputs = /** @type AnypointInput[] */ (Array.from(this.shadowRoot.querySelectorAll('form anypoint-input, form anypoint-chip-input')));
    let result = true;
    inputs.forEach((input) => {
      if (!input.validate()) {
        result = false;
      }
    });
    return result;
  }

  /**
   * Calls the `save()` function on form submit.
   *
   * @param {Event} e
   */
  [submitHandler](e) {
    e.preventDefault();
    this.send();
  }

  /**
   * Computes `save-request` custom event's `detail` object
   * @return {Object} A detail property of the event.
   */
  [computeEventDetail]() {
    const storeRequest = /** @type ARCSavedRequest */ ({ ...this[requestValue] });
    storeRequest.name = this.name;
    storeRequest.description = this.description;
    if ((!this[overrideValue] || this.saveAs) && storeRequest._id) {
      delete storeRequest._id;
      delete storeRequest._rev;
    }
    const info = /** @type ProjectSelectionInfo */ (this[internals.computeProjectSelection](this.selectedProjects));
    storeRequest.projects = info.existing;
    return {
      request: storeRequest,
      projects: info.add.length ? info.add : undefined,
    };
  }

  [requestChanged]() {
    super[requestChanged]();
    const request = /** @type ARCSavedRequest|ARCHistoryRequest */ (this[requestValue] || {});
    if (!request) {
      this.reset();
      return;
    }
    const typed = /** @type ARCSavedRequest */ (request);
    this.name = typed.name || '';
    this.description = typed.description || '';
    this[restoreProjects](typed);
    if (this[monacoInstance]) {
      this[monacoInstance].setValue(this.description);
    }
  }

  /**
   * Reads project data from the request object
   * @param {ARCSavedRequest} request
   */
  [restoreProjects](request) {
    const projects = /** @type ARCProject[] */ (this.projects || []);
    let projectIds = [];
    // @ts-ignore
    if (request.legacyProject) {
      // @ts-ignore
      projectIds[projectIds.length] = request.legacyProject;
    }
    if (request.projects) {
      projectIds = projectIds.concat(request.projects);
    }
    const projectsLen = (projects && projects.length);
    if (projectsLen) {
      const projectsData = [];
      projectIds.forEach((id) => {
        for (let i = 0; i < projectsLen; i++) {
          if (projects[i]._id === id) {
            projectsData[projectsData.length] = projects[i].name;
            return;
          }
        }
        projectsData[projectsData.length] = id;
      });
      this.selectedProjects = projectsData.length ? projectsData : undefined;
    } else {
      this.selectedProjects = projectIds.length ? projectIds : undefined;
    }
  }

  [inputHandler](e) {
    const { name, value } = e.target;
    this[name] = value;
  }

  /**
   * @param {Event} e 
   */
  [projectsHandler](e) {
    const input = /** @type AnypointChipInputElement */ (e.target);
    this.selectedProjects = input.value;
  }

  [titleTemplate]() {
    const { isHistory, isStored } = this;
    const isSaved = isStored && !isHistory;
    return html`
    <div class="title-area">
      <h2 class="title">Request details</h2>
      ${isSaved ? html`<span class="pill">Saved request</span>` : ''}
      ${isHistory ? html`<span class="pill">History request</span>` : ''}
      ${!isStored ? html`<span class="pill accent">Unsaved request</span>` : ''}
    </div>`;
  }

  [nameInputTemplate]() {
    const { name, anypoint, outlined } = this;
    return html`
    <anypoint-input
      required
      autoValidate
      invalidMessage="Name is required"
      .value="${name}"
      name="name"
      @input="${this[inputHandler]}"
      ?anypoint="${anypoint}"
      ?outlined="${outlined}"
    >
      <label slot="label">Request name (required)</label>
    </anypoint-input>
    `;
  }

  [descriptionTemplate]() {
    return html`
    <div class="monaco-wrap">
      <label>Description (markdown)</label>
      <div class="monaco"></div>
    </div>`;
  }

  [projectsTemplate]() {
    const { anypoint, selectedProjects, projects } = this;
    const source = this[internals.computeProjectsAutocomplete](projects);
    return html`
    <anypoint-chip-input
      .chipsValue="${selectedProjects}"
      .source="${source}"
      @opened="${stopEvent}"
      @closed="${stopEvent}"
      @chipschange="${this[projectsHandler]}"
      ?anypoint="${anypoint}">
      <label slot="label">Add to project</label>
    </anypoint-chip-input>`;
  }

  [actionsTemplate]() {
    const { isSavedRequest } = this;
    return html`
    <anypoint-button
      @click="${this[cancelHandler]}"
      data-action="cancel-edit"
      title="Cancels any changes"
      aria-label="Activate to cancel editor"
      ?anypoint="${this.anypoint}">
      Cancel
    </anypoint-button>
    ${isSavedRequest ? this[savedActionsTemplate]() : this[unsavedActionsTemplate]()}
    `;
  }

  [savedActionsTemplate]() {
    const { anypoint } = this;
    return html`<anypoint-button
      @click="${this[saveHandler]}"
      data-action="save-as-new"
      title="Saves request as new object"
      aria-label="Activate to save request as new object"
      ?anypoint="${anypoint}"
      ?disabled="${this[savingValue]}"
    >
      Save as new
    </anypoint-button>
    <anypoint-button
      @click="${this[overrideHandler]}"
      data-action="override"
      title="Replaces request data"
      aria-label="Activate to update the request"
      ?anypoint="${anypoint}"
      ?disabled="${this[savingValue]}"
      emphasis="high"
    >
      Update
    </anypoint-button>`;
  }

  [unsavedActionsTemplate]() {
    const { anypoint } = this;
    return html`<anypoint-button
      class="action-button"
      @click="${this[saveHandler]}"
      data-action="save-request"
      title="Commits changes and stores request in data store"
      aria-label="Activate to save the request"
      ?anypoint="${anypoint}"
      ?disabled="${this[savingValue]}"
    >Save</anypoint-button>`;
  }

  render() {
    return html`
    ${this[titleTemplate]()}
    ${this[addressTemplate]()}
    <form method="POST" @submit="${this[submitHandler]}">
      ${this[nameInputTemplate]()}
      ${this[projectsTemplate]()}
      ${this[descriptionTemplate]()}
    </form>
    <div class="actions">
      ${this[actionsTemplate]()}
    </div>`;
  }
}
