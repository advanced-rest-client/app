/* eslint-disable class-methods-use-this */
import { html, LitElement } from 'lit-element';
import { ResizableMixin } from '@anypoint-web-components/awc';
import { MarkdownStyles } from '@advanced-rest-client/highlight';
import '@github/time-elements';
import '@advanced-rest-client/icons/arc-icon.js';
import '@anypoint-web-components/awc/anypoint-button.js';
import '@anypoint-web-components/awc/anypoint-chip.js';
import '@advanced-rest-client/highlight/arc-marked.js';
import { ArcModelEvents, ArcModelEventTypes, ArcNavigationEvents, TelemetryEvents } from '@advanced-rest-client/events';
import '../../../define/http-method-label.js';
import elementStyles from './styles/RequestDetail.js';
import {
  requestArcRequestEntity,
  requestIdValue,
  requestTypeValue,
  requestValue,
  projectsValue,
  processRequestChange,
  processRequestValue,
  awaitingUpdateValue,
  loadingValue,
  openProjectHandler,
  requestChangeHandler,
  deleteHandler,
  editHandler,
  projectsTemplate,
  deleteButtonTemplate,
  editButtonTemplate,
  requestChanged,
  titleTemplate,
  addressTemplate,
  timeTemplate,
  processProjectsResponse,
  descriptionTemplate,
} from './internals.js';

/** @typedef {import('lit-html').TemplateResult} TemplateResult */
/** @typedef {import('lit-element').CSSResult} CSSResult */
/** @typedef {import('@advanced-rest-client/events').Project.ARCProject} ARCProject */
/** @typedef {import('@advanced-rest-client/events').ArcRequest.ARCSavedRequest} ARCSavedRequest */
/** @typedef {import('@advanced-rest-client/events').ArcRequest.ARCHistoryRequest} ARCHistoryRequest */
/** @typedef {import('@advanced-rest-client/events').ARCRequestUpdatedEvent} ARCRequestUpdatedEvent */
/** @typedef {import('@anypoint-web-components/awc').AnypointChipElement} AnypointChip */
/** @typedef {import('../../types').ARCProjectNames} ARCProjectNames */

export default class RequestMetaDetailsElement extends ResizableMixin(LitElement) {
  /**
   * @returns {CSSResult|CSSResult[]}
   */
  static get styles() {
    return [
      MarkdownStyles,
      elementStyles,
    ];
  }

  static get properties() {
    return {
      /**
       * The request entity id to request from the data store.
       * The `requestType` must also be set to either `history` or `saved`.
       */
      requestId: { type: String },
      /**
       * The type of the processed request
       */
      requestType: { type: String },
      /**
       * Enables Anypoint theme
       */
      anypoint: { type: Boolean },
    };
  }

  get requestId() {
    return this[requestIdValue];
  }

  set requestId(value) {
    const old = this[requestIdValue];
    if (old === value) {
      return;
    }
    this[requestIdValue] = value;
    this[processRequestChange]();
  }

  get requestType() {
    return this[requestTypeValue];
  }

  set requestType(value) {
    const old = this[requestTypeValue];
    if (old === value) {
      return;
    }
    this[requestTypeValue] = value;
    this[processRequestChange]();
  }

  /**
   * @returns {ARCHistoryRequest|ARCSavedRequest}
   */
  get request() {
    return this[requestValue];
  }

  /**
   * @param {ARCHistoryRequest|ARCSavedRequest} value Sets a request object to render without requesting a data from the data store.
   * Useful when dealing with a request that hasn't been stored in the data store.
   */
  set request(value) {
    const old = this[requestValue];
    if (old === value) {
      return;
    }
    this[requestValue] = value;
    this[processRequestValue]();
  }

  /**
   * @return {boolean} Tests whether the current request object is stored in the data store
   */
  get isStored() {
    const request = /** @type ARCHistoryRequest|ARCSavedRequest */ (this[requestValue]);
    if (!request) {
      return false;
    }
    return !!(request._id && request._rev);
  }

  /**
   * @return {Boolean} True when the current request is a history type request.
   */
  get isHistory() {
    const request = this[requestValue];
    if (!request) {
      return false;
    }
    return !!(request && request.type === 'history');
  }

  constructor() {
    super();
    this.anypoint = false;
    this[requestChangeHandler] = this[requestChangeHandler].bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    this.setAttribute('role', 'dialog');
    this.setAttribute('aria-label', 'Request details dialog');
    window.addEventListener(ArcModelEventTypes.Request.State.update, this[requestChangeHandler]);
    const { requestId, requestType } = this;
    const request = /** @type ARCHistoryRequest|ARCSavedRequest */ (this[requestValue]);
    if (requestId && requestType && !request) {
      this[requestArcRequestEntity](requestId, requestType);
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener(ArcModelEventTypes.Request.State.update, this[requestChangeHandler]);
  }

  /**
   * @param {ARCRequestUpdatedEvent} e
   */
  [requestChangeHandler](e) {
    const { changeRecord } = e;
    const { requestId } = this;
    const { id, item } = changeRecord;
    if (id !== requestId) {
      return;
    }
    this[requestValue] = /** @type ARCHistoryRequest|ARCSavedRequest */ (item);
    this[processRequestValue]();
  }

  async [processRequestChange]() {
    if (this[awaitingUpdateValue]) {
      return;
    }
    this[awaitingUpdateValue] = true;
    await this.updateComplete;
    this[awaitingUpdateValue] = false;
    const { requestId, requestType } = this;
    if (!requestId || !requestType) {
      return;
    }
    this[requestArcRequestEntity](requestId, requestType);
  }

  /**
   * Requests for the ARCRequest entity from the requests model.
   *
   * @param {string} requestId
   * @param {string} requestType
   */
  async [requestArcRequestEntity](requestId, requestType) {
    if (!this.parentElement || this[loadingValue]) {
      return;
    }
    this[loadingValue] = true;
    try {
      this[requestValue] = /** @type ARCSavedRequest|ARCHistoryRequest */ (await ArcModelEvents.Request.read(this, requestType, requestId));
      this[processRequestValue]();
    } catch (e) {
      TelemetryEvents.exception(this, e.message, false);
    }
    this[loadingValue] = false;
  }

  /**
   * Reads projects for the request, id any.
   */
  async [processRequestValue]() {
    this[projectsValue] = /** @type ARCProjectNames[] */ ([]);
    const request = /** @type ARCHistoryRequest|ARCSavedRequest */ (this[requestValue]);
    if (!request) {
      return;
    }
    const typed = /** @type ARCSavedRequest */ (request);
    if (!Array.isArray(typed.projects) || !typed.projects.length) {
      this[requestChanged]();
      return;
    }
    const projects = await ArcModelEvents.Project.listAll(this, typed.projects);
    this[projectsValue] = this[processProjectsResponse](projects, typed.projects);
    this[requestChanged]();
    setTimeout(() => this.notifyResize());
  }

  [requestChanged]() {
    this.requestUpdate();
  }

  /**
   * Sends `navigate` event set to current read project.
   *
   * @param {PointerEvent} e
   */
  [openProjectHandler](e) {
    e.preventDefault();
    e.stopPropagation();
    const projects = this[projectsValue];
    const chip = /** @type AnypointChip */ (e.currentTarget);
    const index = Number(chip.dataset.index);
    const id = projects[index]._id;
    ArcNavigationEvents.navigateProject(this, id, 'open');
  }

  /**
   * Dispatches an event to the data store to remove the element.
   */
  async [deleteHandler]() {
    const { requestId, requestType } = this;
    if (!requestId || !requestType) {
      return;
    }
    try {
      ArcModelEvents.Request.delete(this, requestType, requestId);
    } catch (e) {
      TelemetryEvents.exception(this, e.message, false);
      // eslint-disable-next-line no-console
      console.error(e);
    }
  }

  /**
   * Sends non-bubbling `edit` event to the parent element to perform
   * edit action.
   */
  [editHandler]() {
    this.dispatchEvent(new CustomEvent('edit'));
  }

  render() {
    const request = /** @type ARCSavedRequest|ARCHistoryRequest */ (this[requestValue] || {});
    return html`
    ${this[titleTemplate]()}
    ${this[addressTemplate]()}
    ${this[descriptionTemplate]()}
    ${this[timeTemplate]('Created', request.created)}
    ${this[timeTemplate]('Updated', request.updated, request.created)}
    ${this[projectsTemplate]()}
    <div class="actions">
      ${this[deleteButtonTemplate](request)}
      ${this[editButtonTemplate]()}
    </div>`;
  }

  [projectsTemplate]() {
    const projects = this[projectsValue];
    if (!Array.isArray(projects) || !projects.length) {
      return '';
    }
    const { anypoint } = this;
    return html`<div class="meta-row">
      <div class="label">
        Projects
      </div>
      <div class="value">
      ${projects.map((item, index) => html`
        <anypoint-chip
          ?disabled="${item.missing}"
          title="Open project details"
          @click="${this[openProjectHandler]}"
          data-index="${index}"
          data-action="open-project"
          ?anypoint="${anypoint}"
        >${item.name}</anypoint-chip>`)}
      </div>
    </div>`;
  }

  /**
   * Renders the delete button when the request is already saved,
   * meaning when it has `_id` and `_rev`
   * @param {ARCSavedRequest|ARCHistoryRequest} request
   * @return {TemplateResult|string}
   */
  [deleteButtonTemplate](request) {
    const { _id, _rev } = request;
    if (!_id || !_rev) {
      return '';
    }
    return html`
    <anypoint-button
      @click="${this[deleteHandler]}"
      data-action="delete-request"
      title="Removes request from the data store"
      aria-label="Activate to remove the request"
      ?anypoint="${this.anypoint}"
    >
      <arc-icon icon="deleteIcon"></arc-icon>
      Delete
    </anypoint-button>`;
  }

  [editButtonTemplate]() {
    return html`
    <anypoint-button
      @click="${this[editHandler]}"
      data-action="edit-request"
      title="Opens request editor"
      aria-label="Activate to edit request"
      ?anypoint="${this.anypoint}"
    >
      <arc-icon icon="edit"></arc-icon>
      Edit
    </anypoint-button>
    `;
  }

  /**
   * @return {TemplateResult} Template for the dialog title
   */
  [titleTemplate]() {
    const request = /** @type ARCSavedRequest|ARCHistoryRequest */ (this[requestValue] || {});
    const { isHistory, isStored } = this;
    const isSaved = isStored && !isHistory;

    const typed = /** @type ARCSavedRequest */ (request);
    const title = typed.name || 'Request details'
    return html`
    <div class="title-area">
      <h2 class="title">${title}</h2>
      ${isSaved ? html`<span class="pill">Saved request</span>` : ''}
      ${isHistory ? html`<span class="pill">History request</span>` : ''}
      ${!isStored ? html`<span class="pill accent">Unsaved request</span>` : ''}
    </div>
    `;
  }

  /**
   * @return {TemplateResult|string} Template for the URL and method
   */
  [addressTemplate]() {
    const request = /** @type ARCSavedRequest|ARCHistoryRequest */ (this[requestValue]);
    if (!request || !request.method) {
      return '';
    }
    return html`
    <div class="address-detail">
      <http-method-label method="${request.method}"></http-method-label>
      <span class="url-label">${request.url || ''}</span>
    </div>`;
  }

  /**
   * Processes query response from the model.
   * @param {ARCProject[]} data The response
   * @param {string[]} keys Requested keys
   * @returns {ARCProjectNames[]} Processed response or undefined.
   */
  [processProjectsResponse](data, keys) {
    if (!Array.isArray(data) || !data.length) {
      return [];
    }
    const result = /** @type ARCProjectNames[] */ ([]);
    data.forEach((item, i) => {
      let project = /** @type ARCProjectNames */ (item);
      if (!project) {
        project = {
          missing: true,
          name: keys[i],
        };
      } else {
        project.missing = false;
      }
      result.push(project);
    });
    return result;
  }

  /**
   * @return {TemplateResult|string} Template for the description
   */
  [descriptionTemplate]() {
    const request = /** @type ARCSavedRequest|ARCHistoryRequest */ (this[requestValue] || {});
    const typed = /** @type ARCSavedRequest */ (request);
    if (!typed || !typed.description) {
      return '';
    }
    return html`
    <arc-marked markdown="${typed.description}" sanitize>
      <div class="markdown-html markdown-body description"></div>
    </arc-marked>`;
  }

  /**
   * @param {string} label
   * @param {number} value
   * @param {number=} other
   * @return {TemplateResult|string} Template for a time label
   */
  [timeTemplate](label, value, other) {
    if (!value || value === other) {
      return '';
    }
    const d = new Date(value);
    const timeStr = d.toISOString();
    return html`
    <div class="meta-row">
      <div class="label">
        ${label}
      </div>
      <div class="value">
        <relative-time datetime="${timeStr}"></relative-time> at
        <local-time datetime="${timeStr}" hour="numeric" minute="numeric" second="numeric"></local-time>
      </div>
    </div>`;
  }
}
