/* eslint-disable class-methods-use-this */
/**
@license
Copyright 2020 The Advanced REST client authors <arc@mulesoft.com>
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
import { ArcModelEventTypes, ArcModelEvents, DataImportEventTypes, ArcNavigationEvents } from '@advanced-rest-client/events';
import '@anypoint-web-components/awc/anypoint-item.js';
import '@anypoint-web-components/awc/anypoint-item-body.js';
import { FileDropMixin } from '../filesystem/FileDropMixin.js';
import { ListMixin } from './ListMixin.js';
import {
  dataImportHandler,
  dataDestroyHandler,
  indexUpdatedHandler,
  indexDeletedHandler,
  restApiDeleteHandler,
  queryTimeoutValue,
  pageTokenValue,
  loadPage,
  openHandler,
  listScrollHandler,
  busyTemplate,
  dropTargetTemplate,
  unavailableTemplate,
  listTemplate,
  apiItemTemplate,
  itemBodyTemplate,
  itemActionsTemplate,
  noMoreItemsValue,
  makingQueryValue,
  queryingProperty,
} from './internals.js';

/** @typedef {import('@advanced-rest-client/events').ARCModelStateDeleteEvent} ARCModelStateDeleteEvent */
/** @typedef {import('@advanced-rest-client/events').ARCRestApiDeletedEvent} ARCRestApiDeletedEvent */
/** @typedef {import('@advanced-rest-client/events').ARCRestApiUpdatedEvent} ARCRestApiUpdatedEvent */
/** @typedef {import('@advanced-rest-client/events').RestApi.ARCRestApiIndex} ARCRestApiIndex */
/** @typedef {import('lit-element').TemplateResult} TemplateResult */

// /**
//  * Sorts projects list by `order` and the `title` properties.
//  *
//  * @param {ARCRestApiIndex} a
//  * @param {ARCRestApiIndex} b
//  * @return {number}
//  */
// export function sortDataFn(a, b) {
//   if (a.order < b.order) {
//     return -1;
//   }
//   if (a.order > b.order) {
//     return 1;
//   }
//   return (a.title || '').localeCompare(b.title);
// }

/**
 * @param {typeof LitElement} base
 */
const mxFunction = base => {
  class RestApiListMixinImpl extends FileDropMixin(ListMixin(base)) {
    static get properties() {
      return {
        /**
         * Saved items restored from the datastore.
         */
        items: { type: Array },
        /**
         * When set the element won't query for APIs data when connected to the DOM.
         * In this case manually call `loadNext()`
         */
        noAuto: { type: Boolean },
      };
    }

    /**
     * Computed value. `true` if the `items` property has values.
     * @return {Boolean}
     */
    get hasItems() {
      const { items } = this;
      return !!(items && items.length);
    }
  
    /**
     * Computed value. True if query ended and there's no results.
     * @return {Boolean}
     */
    get dataUnavailable() {
      const { hasItems, querying } = this;
      return !hasItems && !querying;
    }
  
    constructor() {
      super();
      this[dataImportHandler] = this[dataImportHandler].bind(this);
      this[dataDestroyHandler] = this[dataDestroyHandler].bind(this);
      this[indexUpdatedHandler] = this[indexUpdatedHandler].bind(this);
      this[indexDeletedHandler] = this[indexDeletedHandler].bind(this);
  
      this.items = /** @type ARCRestApiIndex[] */ ([]);
      this.noAuto = false;
      this[noMoreItemsValue] = false;
    }
  
    connectedCallback() {
      super.connectedCallback();
      window.addEventListener(DataImportEventTypes.dataImported, this[dataImportHandler]);
      window.addEventListener(ArcModelEventTypes.destroyed, this[dataDestroyHandler]);
      window.addEventListener(ArcModelEventTypes.RestApi.State.update, this[indexUpdatedHandler]);
      window.addEventListener(ArcModelEventTypes.RestApi.State.delete, this[indexDeletedHandler]);
      if (!this.noAuto && !this.querying && (!this.items || !this.items.length)) {
        this.loadNext();
      }
    }
  
    disconnectedCallback() {
      super.disconnectedCallback();
      
      if (this[queryTimeoutValue]) {
        clearTimeout(this[queryTimeoutValue]);
        this[queryTimeoutValue] = undefined;
      }
      window.removeEventListener(DataImportEventTypes.dataImported, this[dataImportHandler]);
      window.removeEventListener(ArcModelEventTypes.destroyed, this[dataDestroyHandler]);
      window.removeEventListener(ArcModelEventTypes.RestApi.State.update, this[indexUpdatedHandler]);
      window.removeEventListener(ArcModelEventTypes.RestApi.State.delete, this[indexDeletedHandler]);
    }
  
    /**
     * Refreshes data state.
     */
    [dataImportHandler]() {
      this.reset();
      this.refresh();
    }
  
    /**
     * Resets the state of the variables.
     */
    reset() {
      this[pageTokenValue] = undefined;
      if (this[queryTimeoutValue]) {
        clearTimeout(this[queryTimeoutValue]);
        this[queryTimeoutValue] = undefined;
      }
      this[queryingProperty] = false;
      this.items = /** @type ARCRestApiIndex[] */ ([]);
      this[noMoreItemsValue] = false;
    }
  
    /**
     * Refreshes the data from the datastore.
     * It resets the query options, clears items and makes a query to the datastore.
     */
    refresh() {
      this.reset();
      this.loadNext();
    }
  
    /**
     * Handler for the `datastore-destroyed` custom event.
     * If one of destroyed databases is history store then it refreshes the sate.
     * @param {ARCModelStateDeleteEvent} e
     */
    [dataDestroyHandler](e) {
      const { store } = e;
      if (!['api-index', 'all'].includes(store)) {
        return;
      }
      this.refresh();
      this.requestUpdate();
    }
  
    /**
     * The function to call when new query for data is needed.
     * Use this instead of `[loadPage]()` as this function uses debouncer to
     * prevent multiple calls at once.
     */
    loadNext() {
      if (this[makingQueryValue] || this[noMoreItemsValue] || this[queryingProperty]) {
        return;
      }
      this[makingQueryValue] = true;
      this[queryTimeoutValue] = setTimeout(() => {
        this[queryTimeoutValue] = undefined;
        this[makingQueryValue] = false;
        this[loadPage]();
      });
    }
  
    /**
     * Performs the query and processes the result.
     * This function immediately queries the data model for data.
     * It does this in a loop until all data are read.
     *
     * @return {Promise}
     */
    async [loadPage]() {
      this[queryingProperty] = true;
      try {
        const token = this[pageTokenValue];
        const response = await ArcModelEvents.RestApi.list(this, {
          nextPageToken: token,
          limit: this.pageLimit,
        });
        if (response.nextPageToken) {
          this[pageTokenValue] = response.nextPageToken;
        }
        const { items } = response;
        if (!items || !items.length) {
          this[queryingProperty] = false;
          this[noMoreItemsValue] = true;
          this.requestUpdate();
          return;
        }
        if (!this.items) {
          this.items = /** @type ARCRestApiIndex[] */ ([]);
        }
        const concat = this.items.concat(items);
        // concat.sort(sortDataFn);
        this.items = /** @type ARCRestApiIndex[] */ (concat);
      } catch(e) {
        // ...
      }
      this.requestUpdate();
      this[queryingProperty] = false;
    }
    
    /**
     * Handler for the `click` event on the list item.
     * @param {PointerEvent} e
     */
    [openHandler](e) {
      const node = /** @type HTMLElement */ (e.currentTarget);
      const index = Number(node.dataset.index);
      const item = this.items[index];
      const id = item._id;
      const version = item.latest;
      ArcNavigationEvents.navigateRestApi(this, id, version, 'documentation');
    }
  
    /**
     * Index item has been changed and should be updated / added.
     * @param {ARCRestApiUpdatedEvent} e
     */
    async [indexUpdatedHandler](e) {
      const record = e.changeRecord;
      let item;
      if (!record.item) {
        item = await ArcModelEvents.RestApi.read(this, record.id);
      } else {
        item = record.item;
      }
      if (!Array.isArray(this.items)) {
        this.items = /** @type ARCRestApiIndex[] */ ([]);
      }
      const { items } = this;
      const index = items.findIndex((api) => api._id === item._id);
  
      if (index === -1) {
        items.push(item);
        // items.sort(sortDataFn);
      } else {
        items[index] = item;
      }
      this.requestUpdate();
    }
  
    /**
     * Handler for API delete event.
     * Only non-cancelable event is considered.
     * @param {ARCRestApiDeletedEvent} e
     */
    [indexDeletedHandler](e) {
      const { items } = this;
      if (!Array.isArray(items) || !items.length) {
        return;
      }
      const { id } = e;
      const index = items.findIndex((item) => item._id === id);
      if (index === -1) {
        return;
      }
      items.splice(index, 1);
      this.requestUpdate();
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
     * Handler for the delete button click.
     * @param {PointerEvent} e
     */
    async [restApiDeleteHandler](e) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      const node = /** @type HTMLElement */ (e.currentTarget);
      const { id } = node.dataset;
      if (!id) {
        return;
      }
      await ArcModelEvents.RestApi.delete(this, id);
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

    /**
     * @returns {TemplateResult} A template for the drop file message
     */
    [dropTargetTemplate]() {
      return html`
      <section class="drop-target">
        <p class="drop-info">Drop the file here</p>
      </section>`;
    }

    /**
     * @returns {TemplateResult|string} A template for the no data view
     */
    [unavailableTemplate]() {
      const { dataUnavailable } = this;
      if (!dataUnavailable) {
        return '';
      }
      return html`
      <div class="empty-message">
        <h3 class="empty-title">Drop API project here</h3>
        <p class="empty-info">
          You can drag RAML and OAS projects here to enable
          interactive API documentation.
        </p>
      </div>`;
    }

    /**
     * @returns {string|TemplateResult} Template for the list items.
     */
    [listTemplate]() {
      const indexes = /** @type ARCRestApiIndex[] */(this.items);
      if (!Array.isArray(indexes) || !indexes.length) {
        return '';
      }
      return html`
      <div class="list" role="menu" @scroll="${this[listScrollHandler]}">
      ${indexes.map((item, index) => this[apiItemTemplate](item, index))}
      </div>
      `;
    }

    /**
     * @param {ARCRestApiIndex} api
     * @param {number} index
     * @returns {TemplateResult} Result for a single REST API item.
     */
    [apiItemTemplate](api, index) {
      const { anypoint } = this;
      return html`
      <anypoint-item
        data-index="${index}"
        data-id="${api._id}"
        @click="${this[openHandler]}"
        role="menuitem"
        ?anypoint="${anypoint}"
      >
        ${this[itemBodyTemplate](api)}
        ${this[itemActionsTemplate](api._id)}
      </anypoint-item>
      `;
    }

    /**
     * @param {ARCRestApiIndex} api
     * @returns {TemplateResult} Result for a single REST API item.
     */
    [itemBodyTemplate](api) {
      const { anypoint, hasTwoLines } = this;
      return html`
      <anypoint-item-body
        ?twoline="${hasTwoLines}"
        ?anypoint="${anypoint}"
      >
        <div class="api-title">${api.title}</div>
        <div data-secondary class="details">Version: ${api.latest}</div>
      </anypoint-item-body>
      `;
    }

    /**
     * @param {string} id The id of the API index entity
     * @returns {TemplateResult|string} Template for a list item actions
     */
    [itemActionsTemplate](id) {
      if (!this.listActions) {
        return '';
      }
      const { anypoint } = this;
      return html`
      <anypoint-button
        data-id="${id}"
        class="list-action-button list-secondary-action"
        data-action="item-delete"
        ?anypoint="${anypoint}"
        @click="${this[restApiDeleteHandler]}"
        title="Removes the API from the application"
      >Delete</anypoint-button>
      `;
    }
  }
  return RestApiListMixinImpl;
};
/**
 * A mixin that has logic and UI for the rest APIs lists.
 *
 * @mixin
 */
export const RestApiListMixin = dedupeMixin(mxFunction);
