/* eslint-disable class-methods-use-this */
/* eslint-disable no-plusplus */
/**
@license
Copyright 2018 The Advanced REST client authors <arc@mulesoft.com>
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

import { dedupeMixin } from '@open-wc/dedupe-mixin';
// eslint-disable-next-line no-unused-vars
import { LitElement, html } from 'lit-element';
import {classMap} from 'lit-html/directives/class-map.js';
import {ifDefined} from 'lit-html/directives/if-defined.js';
import { ArcModelEventTypes, ArcModelEvents, DataImportEventTypes, ArcNavigationEvents, TelemetryEvents } from '@advanced-rest-client/events';
import '@advanced-rest-client/icons/arc-icon.js';
import '@anypoint-web-components/awc/anypoint-icon-button.js';
import '@anypoint-web-components/awc/anypoint-icon-item.js';
import '@anypoint-web-components/awc/anypoint-item-body.js';
import '@anypoint-web-components/awc/anypoint-collapse.js';
import '@github/time-elements';
import '../../../define/http-method-label.js';
import { ListMixin } from './ListMixin.js';
import { 
  projectLegacySort, 
  validateRequestType, 
  idsArrayEqual, 
  isProjectRequest, 
} from '../../lib/Utils.js';
import {
  busyTemplate,
  requestDeletedHandler,
  requestChangedHandler,
  projectChangeHandler,
  dataImportHandler,
  dataDestroyHandler,
  readType,
  persistRequestsOrder,
  projectRequestChanged,
  requestChanged,
  updateProjectOrder,
  openRequest,
  readProjectRequests,
  queryingProperty,
  pageTokenValue,
  makingQueryValue,
  appendItems,
  loadPage,
  prepareQuery,
  handleError,
  selectedItemsValue,
  selectableValue,
  listTemplate,
  requestItemSelectionTemplate,
  requestItemActionsTemplate,
  detailsItemHandler,
  navigateItemHandler,
  requestItemLabelTemplate,
  itemClickHandler,
  notifySelection,
  dragStartHandler,
  dropTargetTemplate,
  unavailableTemplate,
  listScrollHandler,
} from './internals.js';

/** @typedef {import('@advanced-rest-client/events').ARCRequestDeletedEvent} ARCRequestDeletedEvent */
/** @typedef {import('@advanced-rest-client/events').ARCRequestUpdatedEvent} ARCRequestUpdatedEvent */
/** @typedef {import('@advanced-rest-client/events').ARCProjectUpdatedEvent} ARCProjectUpdatedEvent */
/** @typedef {import('@advanced-rest-client/events').ARCModelStateDeleteEvent} ARCModelStateDeleteEvent */
/** @typedef {import('@advanced-rest-client/events').ArcRequest.ARCHistoryRequest} ARCHistoryRequest */
/** @typedef {import('@advanced-rest-client/events').ArcRequest.ARCSavedRequest} ARCSavedRequest */
/** @typedef {import('@advanced-rest-client/events').Project.ARCProject} ARCProject */
/** @typedef {import('@advanced-rest-client/events').DataExport.ExportOptions} ExportOptions */
/** @typedef {import('@advanced-rest-client/events').DataExport.ProviderOptions} ProviderOptions */
/** @typedef {import('@advanced-rest-client/events').DataExport.ArcExportResult} ArcExportResult */
/** @typedef {import('@advanced-rest-client/events').Model.ARCEntityChangeRecord} ARCEntityChangeRecord */
/** @typedef {import('lit-element').TemplateResult} TemplateResult */
/** @typedef {import('../../types').ListType} ListType */

/**
 * @param {typeof LitElement} base
 */
const mxFunction = base => {
  class RequestsListMixinImpl extends ListMixin(base) {
    static get properties() {
      return {
        /**
         * The list of request to render.
         * It can be either saved, history or project items.
         */
        requests: { type: Array },
        /**
         * Requests list type. Can be one of:
         * - saved
         * - history
         * - project
         *
         * Depending on the the type request change event is handled differently.
         * For saved and history requests corresponding type is processed.
         * For project requests list only request that has project id in the
         * projects list is processed.
         *
         * This property must be set.
         * @attribute
         */
        type: { type: String },
        /**
         * Project datastore ID to display.
         * This should be set only when type is `project`
         * @attribute
         */
        projectId: { type: String },
        /**
         * A project object associated with requests.
         * This is only valid when `type` is set to `project`. It is set automatically
         * when `readProjectRequests()` is called.
         */
        project: { type: Object },
        /**
         * When set this component is in search mode.
         * This means that the list won't be loaded automatically and
         * some operations not related to search are disabled.
         * @attribute
         */
        isSearch: { type: Boolean },
        /**
         * When set it won't query for data automatically when attached to the DOM.
         * @attribute
         */
        noAuto: { type: Boolean },
        /**
         * When set the datastore query is performed with `detailed` option
         * @attribute
         */
        detailedSearch: { type: Boolean },
        /**
         * Adds draggable property to the request list item element.
         * The `dataTransfer` object has `arc/request-object` mime type with
         * serialized JSON with request model.
         * @attribute
         */
        draggableEnabled: { type: Boolean },
        /**
         * When set the selection controls are rendered
         * @attribute
         */
        selectable: { type: Boolean },
      };
    }

    /**
     * Computed value, true when the project has requests.
     * @return {Boolean}
     */
    get hasRequests() {
      const { requests } = this;
      return !!(requests && requests.length);
    }
  
    /**
     * True when there's no requests after refreshing the state.
     * @return {Boolean}
     */
    get dataUnavailable() {
      const { requests, querying, isSearch } = this;
      return !isSearch && !querying && !(requests && requests.length);
    }

    /**
     * Computed value. True when the query has been performed and no items
     * has been returned. It is different from `listHidden` where less
     * conditions has to be checked. It is set to true when it doesn't
     * have items, is not loading and is search.
     *
     * @return {boolean}
     */
    get searchListEmpty() {
      const { requests, querying, isSearch } = this;
      return !!isSearch && !querying && !(requests && requests.length);
    }

    /**
     * @returns {string[]|null} List of selected ids when `selectable` is set or `null` otherwise
     */
    get selectedItems() {
      if (!this.selectable) {
        return null;
      }
      return this[selectedItemsValue] || [];
    }

    /**
     * @param {string[]} value List of requests to select in the view. This has no effect when `selectable` is not set. 
     */
    set selectedItems(value) {
      const old = this[selectedItemsValue] || [];
      if (idsArrayEqual(old, value)) {
        return;
      }
      this[selectedItemsValue] = value;
      this.requestUpdate();
    }

    get selectable() {
      return this[selectableValue];
    }

    set selectable(value) {
      const old = this[selectableValue];
      if (old === value) {
        return;
      }
      this[selectableValue] = value;
      this.requestUpdate();
      if (this[selectedItemsValue]) {
        this[selectedItemsValue] = undefined;
      }
    }

    constructor() {
      super();
      this[requestDeletedHandler] = this[requestDeletedHandler].bind(this);
      this[requestChangedHandler] = this[requestChangedHandler].bind(this);
      this[projectChangeHandler] = this[projectChangeHandler].bind(this);
      this[dataImportHandler] = this[dataImportHandler].bind(this);
      this[dataDestroyHandler] = this[dataDestroyHandler].bind(this);

      /**
       * @type {ListType}
       */
      this.type = undefined;
      /**
       * @type {(ARCHistoryRequest|ARCSavedRequest)[]}
       */
      this.requests = undefined;
      /**
       * @type {ARCProject}
       */
      this.project = undefined;
      /**
       * @type {string}
       */
      this.projectId = undefined;
  
      this.detailedSearch = false;
      this.noAuto = false;
      this.isSearch = false;
      this.draggableEnabled = false;
      this.selectable = false;
    }

    connectedCallback() {
      super.connectedCallback();
      window.addEventListener(ArcModelEventTypes.Request.State.delete, this[requestDeletedHandler]);
      window.addEventListener(ArcModelEventTypes.Request.State.update, this[requestChangedHandler]);
      window.addEventListener(ArcModelEventTypes.Project.State.update, this[projectChangeHandler]);
      window.addEventListener(DataImportEventTypes.dataImported, this[dataImportHandler]);
      window.addEventListener(ArcModelEventTypes.destroyed, this[dataDestroyHandler]);
      if (!this.noAuto && !this.querying && !this.requests) {
        this.loadNext();
      }
    }

    disconnectedCallback() {
      super.disconnectedCallback();
      window.removeEventListener(ArcModelEventTypes.Request.State.delete, this[requestDeletedHandler]);
      window.removeEventListener(ArcModelEventTypes.Request.State.update, this[requestChangedHandler]);
      window.removeEventListener(ArcModelEventTypes.Project.State.update, this[projectChangeHandler]);
      window.removeEventListener(DataImportEventTypes.dataImported, this[dataImportHandler]);
      window.removeEventListener(ArcModelEventTypes.destroyed, this[dataDestroyHandler]);
    }

    /**
     * Refreshes the data from the datastore.
     * It resets the query options, clears requests and makes a query to the datastore.
     */
    refresh() {
      this.reset();
      this.loadNext();
    }

    /**
     * Resets the state of the variables.
     */
    reset() {
      this[pageTokenValue] = undefined;
      this.isSearch = false;
      this[queryingProperty] = false;
      this.requests = undefined;
      this[selectedItemsValue] = /** @type string[] */ ([]);
    }

    /**
     * Loads next page of results. It runs the task in a debouncer set to
     * next render frame so it's safe to call it more than once at the time.
     */
    loadNext() {
      if (this.isSearch) {
        return;
      }
      if (this[makingQueryValue] || this[queryingProperty]) {
        return;
      }
      this[makingQueryValue] = true;
      setTimeout(() => {
        this[makingQueryValue] = false;
        this[loadPage]();
      });
    }

    /**
     * Queries for the request data,
     *
     * @param {string} query The query term
     * @return {Promise} Resolved promise when the query ends.
     */
    async query(query) {
      if (!query) {
        if (this.isSearch) {
          this.refresh();
        }
        return;
      }
      this.isSearch = true;
      this[queryingProperty] = true;
      this.requests = undefined;
      const type = this[readType]();
      try {
        const term = this[prepareQuery](query);
        const result = await ArcModelEvents.Request.query(this, term, type, this.detailedSearch);
        this[appendItems](result);
        this[queryingProperty] = false;
      } catch (e) {
        this[queryingProperty] = false;
        this[handleError](e);
      }
      // This helps prioritize search development
      TelemetryEvents.event(this, {
        category: 'Content search',
        action: `${type} search`
      });
    }

    /**
     * Handler for `request-object-deleted` event. Removes request from the list
     * if it existed.
     * @param {ARCRequestDeletedEvent} e
     */
    [requestDeletedHandler](e) {
      const { requests } = this;
      if (!Array.isArray(requests) || !requests.length) {
        return;
      }
      const { id } = e;
      const index = requests.findIndex((r) => r._id === id);
      if (index === -1) {
        return;
      }
      requests.splice(index, 1);
      this.requestUpdate();
    }

    /**
     * Handler for the request update event.
     * 
     * Depending on the `type` property it updates / adds / removes item from the requests list.
     * @param {ARCRequestUpdatedEvent} e
     */
    async [requestChangedHandler](e) {
      const { type } = this;
      const { changeRecord, requestType } = e;
      let item = /** @type ARCHistoryRequest | ARCSavedRequest */ (null);
      if (!changeRecord.item) {
        item = await ArcModelEvents.Request.read(this, requestType, changeRecord.id);
      } else {
        item = changeRecord.item;
      }
      if (type === 'project' && requestType === 'saved') {
        this[projectRequestChanged](/** @type ARCSavedRequest */ (item));
      } else if (requestType === type) {
        this[requestChanged](item);
      }
    }

    /**
     * Handler for `data-imported` custom event.
     * Refreshes data state.
     */
    [dataImportHandler]() {
      this.refresh();
    }

    /**
     * Handler for the `datastore-destroyed` custom event.
     * If one of destroyed databases is history store then it refreshes the sate.
     * @param {ARCModelStateDeleteEvent} e
     */
    [dataDestroyHandler](e) {
      const { store } = e;
      const type = this[readType]();
      if (![this.type, type, 'all'].includes(store)) {
        return;
      }
      this.reset();
      this.requestUpdate();
    }

    /**
     * Handles request change when type is project.
     * @param {ARCSavedRequest} request Changed request object.
     */
    [projectRequestChanged](request) {
      const { projectId } = this;
      if (!projectId) {
        return;
      }
      const isProject = isProjectRequest(request, projectId);
      if (!Array.isArray(this.requests)) {
        this.requests = [];
      }
      const { requests } = this;
      if (!requests.length) {
        if (isProject) {
          this.requests = [request];
        }
        return;
      }
      const index = requests.findIndex((r) => r._id === request._id);
      if (index !== -1) {
        if (isProject) {
          requests[index] = request;
        } else {
          requests.splice(index, 1);
        }
        this.requestUpdate();
        return;
      }
      if (!isProject) {
        return;
      }
      if (this.project) {
        const pRequest = this.project.requests || [];
        const i = pRequest.indexOf(request._id);
        requests.splice(i, 0, request);
      } else {
        requests.push(request);
      }
      this.requestUpdate();
    }

    /**
     * Handles request change when type is project.
     * @param {ARCSavedRequest|ARCHistoryRequest} request Changed request object.
     */
    [requestChanged](request) {
      if (!Array.isArray(this.requests)) {
        this.requests = [];
      }
      const { requests } = this;
      const index = requests.findIndex((r) => r._id === request._id);
      if (index === -1) {
        // add to the beginning of the list
        // TODO: this should be ordered somehow
        requests.unshift(request);
      } else {
        requests[index] = request;
      }
      this.requestUpdate();
    }

    /**
     * A function to read request data for a project.
     * 
     * @param {string} id Project ID
     * @return {Promise<ARCSavedRequest[]>} Promise resolved to the list of project requests.
     */
    async [readProjectRequests](id) {
      const currentProject = this.project;
      let project;
      if (currentProject && currentProject._id === id) {
        project = currentProject;
      } else {
        project = await ArcModelEvents.Project.read(this, id);
        this.project = project;
      }
      const requests = /** @type ARCSavedRequest[] */ (await ArcModelEvents.Request.projectlist(this, project._id, {
        ignorePayload: true,
      }));
      if (!project.requests && requests) {
        requests.sort(projectLegacySort);
      }
      return requests;
    }

    /**
     * @returns {string} The type used in the ARC request model.
     */
    [readType]() {
      const { type } = this;
      validateRequestType(type);
      if (type === 'history') {
        return type;
      }
      return 'saved';
    }

    /**
     * Stores current order of requests in the project.
     * 
     * @return {Promise<ARCEntityChangeRecord|undefined>} Change record or undefined when it has the same order
     */
    async [persistRequestsOrder]() {
      const { project } = this;
      if (!project) {
        throw new Error('"project" is not set');
      }
      const { requests } = this;
      const newOrder = requests.map((item) => item._id);
      const copy = { ...project };
      if (idsArrayEqual(copy.requests, newOrder)) {
        return undefined;
      }
      copy.requests = newOrder;
      this.project = copy;
      return ArcModelEvents.Project.update(this, copy);
    }

    /**
     * Handler for the project change event.
     * 
     * @param {ARCProjectUpdatedEvent} e
     */
    async [projectChangeHandler](e) {
      if (this.type !== 'project' || !this.project) {
        return;
      }
      const rec = e.changeRecord;
      if (rec.id !== this.project._id) {
        return;
      }
      let item;
      if (rec.item) {
        item = rec.item;
      } else {
        item = await ArcModelEvents.Project.read(this, rec.id);
      }
      this.project = item;
      this[updateProjectOrder](item);
      this.requestUpdate();
    }

    /**
     * Updates requests order when project changed.
     * It reorders requests array for changed project order. It won't change
     * requests array when order is the same. It also won't change order when
     * request list is different that project's requests list.
     * @param {ARCProject} project Changed project
     * @return {boolean} True when order has changed
     */
    [updateProjectOrder](project) {
      const { requests } = this;
      if (!Array.isArray(requests) || !project.requests) {
        return false;
      }
      if (requests.length !== project.requests.length) {
        // request is being added or removed
        return false;
      }
      const newOrder = [];
      let changed = false;
      for (let i = 0, len = project.requests.length; i < len; i++) {
        const id = project.requests[i];
        const rPos = requests.findIndex((item) => item._id === id);
        if (rPos === -1) {
          // unknown state, better quit now
          return false;
        }
        newOrder[i] = requests[rPos];
        if (i !== rPos) {
          changed = true;
        }
      }
      if (changed) {
        this.requests = newOrder;
      }
      return changed;
    }

    /**
     * Dispatches navigate event to open a request
     * @param {string} id The id of the request to open.
     */
    [openRequest](id) {
      const type = this[readType]();
      ArcNavigationEvents.navigateRequest(this, id, type, 'open');
    }

    /**
     * Loads next page of results from the datastore.
     * Pagination used here has been described in PouchDB pagination strategies
     * document.
     * @return {Promise}
     */
    async [loadPage]() {
      if (this.isSearch || this.querying) {
        return;
      }
      this[queryingProperty] = true;
      try {
        const token = this[pageTokenValue];
        const type = this[readType]();
        const response = await ArcModelEvents.Request.list(this, type, {
          nextPageToken: token,
          limit: this.pageLimit,
        });
        this[queryingProperty] = false;
        if (response) {
          if (response.nextPageToken) {
            this[pageTokenValue] = response.nextPageToken;
          }
          this[appendItems](response.items);
        }  
      } catch (e) {
        this[queryingProperty] = false;
        this[handleError](e);
      }
    }

    /**
     * Prepares a query string to search the data store.
     * @param {string} query User search term
     * @return {string} Processed query
     */
    [prepareQuery](query) {
      let result = String(query);
      result = result.toLowerCase();
      if (result[0] === '_') {
        result = result.substr(1);
      }
      return result;
    }

    /**
     * Handles any error.
     * @param {Error} cause
     */
    [handleError](cause) {
      TelemetryEvents.exception(this, cause.message, false);
      throw cause;
    }

    /**
     * @param {PointerEvent} e
     */
    [navigateItemHandler](e) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      const node = /** @type HTMLElement */ (e.currentTarget);
      const { id } = node.dataset;
      if (!id) {
        return;
      }
      this[openRequest](id);
    }

    /**
     * @param {PointerEvent} e
     */
    [detailsItemHandler](e) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      const node = /** @type HTMLElement */ (e.currentTarget);
      const { id } = node.dataset;
      if (!id) {
        return;
      }
      const type = this[readType]();
      ArcNavigationEvents.navigateRequest(this, id, type, 'detail');
    }

    /**
     * @param {PointerEvent} e
     */
    [itemClickHandler](e) {
      const node = /** @type HTMLElement */ (e.currentTarget);
      const { id } = node.dataset;
      if (!this.selectable) {
        this[openRequest](id);
        return;
      }
      if (!this[selectedItemsValue]) {
        this[selectedItemsValue] = /** @type string[] */ ([]);
      }
      const allSelected = /** @type string[] */ (this[selectedItemsValue]);
      if (allSelected.includes(id)) {
        const index = allSelected.indexOf(id);
        allSelected.splice(index, 1);
      } else {
        allSelected.push(id);
      }
      this.requestUpdate();
      this[notifySelection]();
    }

    /**
     * Dispatches the `select` event when selection change.
     */
    [notifySelection]() {
      this.dispatchEvent(new CustomEvent('select'));
    }

    /**
     * Handler for the `dragstart` event added to the list item when `draggableEnabled`
     * is set to true. This function sets request data on the `dataTransfer` 
     * with the following properties:
     * - `arc/id` with value of the id of the dragged request
     * - `arc/type` with value of the current type
     * - `arc/request` which indicates the dragged property is a request 
     * - `arc/source` with the name of the element
     * Additionally the function sets default `effectAllowed` to copy.
     * 
     * @param {DragEvent} e
     */
    [dragStartHandler](e) {
      if (!this.draggableEnabled) {
        return;
      }
      const node = /** @type HTMLElement */ (e.target);
      const { id } = node.dataset;
      if (!id) {
        return;
      }
      const type = this[readType]();
      const dt = e.dataTransfer;
      dt.setData('arc/id', id);
      dt.setData('arc/type', type);
      dt.setData('arc/request', '1');
      dt.setData('arc/source', this.localName);
      dt.effectAllowed = 'copy';
    }

    /**
     * @param {Event} e
     */
    [listScrollHandler](e) {
      const node = /** @type HTMLDivElement */ (e.target);
      const delta = node.scrollHeight - (node.scrollTop + node.offsetHeight);
      if (delta < 120) {
        this.loadNext();
      }
    }

    /**
     * @returns {string} Template for the list items.
     */
    [listTemplate]() {
      return '';
    }

    /**
     * @param {string} id The id of the request
     * @returns {TemplateResult|string} Template for a selection control
     */
    [requestItemSelectionTemplate](id) {
      if (!this.selectable) {
        return '';
      }
      const allSelected = /** @type string[] */ (this[selectedItemsValue] || []);
      const selected = allSelected.includes(id);
      return html`
      <anypoint-checkbox
        slot="item-icon"
        ?checked="${selected}"
        aria-label="Select or unselect this request"
      ></anypoint-checkbox>
      `;
    }

    /**
     * @param {string} id The id of the request
     * @returns {TemplateResult|string} Template for a request's list item actions
     */
    [requestItemActionsTemplate](id) {
      if (!this.listActions) {
        return '';
      }
      const { anypoint } = this;
      return html`
      <anypoint-button
        data-id="${id}"
        class="list-action-button list-secondary-action"
        data-action="item-detail"
        ?anypoint="${anypoint}"
        @click="${this[detailsItemHandler]}"
        title="Open request details dialog"
      >Details</anypoint-button>
      <anypoint-button
        data-id="${id}"
        class="list-action-button list-main-action"
        data-action="open-item"
        @click="${this[navigateItemHandler]}"
        ?anypoint="${anypoint}"
        emphasis="high"
        title="Open request in the workspace"
      >Open</anypoint-button>
      `;
    }

    /**
     * @param {string} method The HTTP method name.
     * @returns {TemplateResult} Template for a request's http label
     */
    [requestItemLabelTemplate](method) {
      const { selectable } = this;
      const slot = selectable ?  undefined : 'item-icon';
      const classes = { 
        'with-margin': selectable
      };
      return html`<http-method-label method="${method}" slot="${ifDefined(slot)}" class=${classMap(classes)}></http-method-label>`;
    }

    /**
     * @returns {TemplateResult} A template with the drop request message
     */
    [dropTargetTemplate]() {
      return html`
      <div class="drop-message">
        <arc-icon class="drop-icon" icon="saveAlt"></arc-icon>
        <p>Drop the request here</p>
      </div>
      `;
    }

    /**
     * @returns {TemplateResult|string} A template for when data are unavailable.
     */
    [unavailableTemplate]() {
      return html``;
    }

    /**
     * @returns {TemplateResult|string} A template for the loader element
     */
    [busyTemplate]() {
      if (!this.querying) {
        return '';
      }
      return html`<progress></progress>`;
    }
  }
  return RequestsListMixinImpl;
};
/**
 * A mixin to be used with elements that consumes lists of requests.
 * It implements event listeners related to requests data change.
 *
 * @mixin
 */
export const RequestsListMixin = dedupeMixin(mxFunction);
