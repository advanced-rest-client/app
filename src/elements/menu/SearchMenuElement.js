/* eslint-disable arrow-body-style */
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
import { ArcModelEvents, ArcNavigationEvents } from '@advanced-rest-client/events';
import '@anypoint-web-components/awc/anypoint-input.js';
import '@anypoint-web-components/awc/anypoint-item.js';
import '@anypoint-web-components/awc/anypoint-item-body.js';
import '@github/time-elements';
import ListStyles from '../request/ListStyles.js';
import { ListMixin } from '../request/ListMixin.js';
import elementStyles from './styles/SearchStyles.js';

/** @typedef {import('@anypoint-web-components/awc').AnypointInputElement} AnypointInput */
/** @typedef {import('@advanced-rest-client/events').ArcRequest.ARCHistoryRequest} ARCHistoryRequest */
/** @typedef {import('@advanced-rest-client/events').ArcRequest.ARCSavedRequest} ARCSavedRequest */
/** @typedef {import('lit-element').TemplateResult} TemplateResult */
/** @typedef {import('../../types').HistorySearchItem} HistorySearchItem */
/** @typedef {import('../../types').SavedSearchItem} SavedSearchItem */

export const formTemplate = Symbol('formTemplate');
export const searchHandler = Symbol('searchHandler');
export const searchInput = Symbol('searchInput');
export const noResultsTemplate = Symbol('noResultsTemplate');
export const resultsTemplate = Symbol('resultsTemplate');
export const commitValue = Symbol('commitValue');
export const searchItemTemplate = Symbol('searchItemTemplate');
export const itemClickHandler = Symbol('itemClickHandler');
export const dragStartHandler = Symbol('dragStartHandler');
export const historyItemTemplate = Symbol('historyItemTemplate');
export const savedItemTemplate = Symbol('savedItemTemplate');
export const readType = Symbol('readType');
export const postQuery = Symbol('postQuery');
export const postProcessHistoryItem = Symbol('postProcessHistoryItem');
export const postProcessSavedItem = Symbol('postProcessSavedItem');

/**
 * Advanced REST Client's history menu element.
 */
export default class SearchMenuElement extends ListMixin(LitElement) {
  static get styles() {
    return [ListStyles, elementStyles];
  }

  /**
   * Computed value. True when the query has been performed and no items
   * has been returned. 
   *
   * @returns {boolean}
   */
  get noResults() {
    const { items, querying, inSearch } = this;
    const q = this[commitValue];
    return inSearch && !querying && !!q && !(items && items.length);
  }

  /**
   * Computed value. True when the query has been performed and no items
   * has been returned. 
   *
   * @return {boolean}
   */
  get hasResults() {
    const { items } = this;
    return !!(items && items.length);
  }

  static get properties() {
    return {
      /** 
       * The current search input value
       */
      q: { type: String },

      /** 
       * When set it queries for the data.
       */
      querying: { type: Boolean, reflect: true },

      /** 
       * The list of query results.
       */
      items: { type: Array },

      /** 
       * When set the search has been performed.
       */
      inSearch: { type: Boolean },
      /**
       * Adds draggable property to the request list item element.
       * The `dataTransfer` object has `arc/request-object` mime type with
       * serialized JSON with request model.
       * @attribute
       */
      draggableEnabled: { type: Boolean },
    };
  }

  constructor() {
    super();
    this.anypoint = false;
    this.querying = false;
    this.inSearch = false;
    this.draggableEnabled = false;
    /** 
     * The current search input value
     */
    this.q = '';
    /** 
     * The last committed to the search value.
     */
    this[commitValue] = '';
    /** 
     * @type {(HistorySearchItem|SavedSearchItem)[]}
     */
    this.items = undefined;
  }

  [searchHandler]() {
    this.query();
  }

  /**
   * @param {Event} e 
   */
  [searchInput](e) {
    const input = /** @type AnypointInput */ (e.target);
    const { value } = input;
    this.q = value;
  }

  /**
   * Runs the query for the current term
   * @returns {Promise<void>} 
   */
  async query() {
    if (this.querying) {
      return;
    }
    const { q } = this;
    if (!q) {
      this.items = undefined;
      this.inSearch = false;
      this[commitValue] = '';
      return;
    }
    this.querying = true;
    this.inSearch = true;
    this[commitValue] = this.q;
    try {
      const result = await ArcModelEvents.Request.query(this, this.q);
      await this[postQuery](result);
    } catch (e) {
      // 
    }
    this.querying = false;
  }

  /**
   * Updates the requests into the search objects.
   * @param {(ARCHistoryRequest | ARCSavedRequest)[]} results
   * @returns {Promise<void>} 
   */
  async [postQuery](results) {
    if (!Array.isArray(results) || !results.length) {
      this.items = undefined;
      return;
    }
    const ps = results.map(async (item) => {
      if (item.type === 'history') {
        return this[postProcessHistoryItem](item);
      }
      return this[postProcessSavedItem](/** @type ARCSavedRequest */ (item));
    });
    const result = await Promise.all(ps);
    this.items = result;
  }

  /**
   * Post processes history object
   * @param {ARCHistoryRequest} item
   * @returns {Promise<HistorySearchItem>}
   */
  async [postProcessHistoryItem](item) {
    const { updated, created } = item;
    const date = updated || created || Date.now();
    const d = new Date(date);
    const iso = d.toISOString();
    return {
      kind: 'ARC#HistorySearchItem',
      isoTime: iso,
      item,
    };
  }

  /**
   * Post processes saved object
   * @param {ARCSavedRequest} item
   * @returns {Promise<SavedSearchItem>}
   */
  async [postProcessSavedItem](item) {
    const result = /** @type SavedSearchItem */ ({
      kind: 'ARC#SavedSearchItem',
      item,
      projects: [],
    });
    if (item.projects && item.projects.length) {
      try {
        const info = await ArcModelEvents.Project.readBulk(this, item.projects);
        result.projects = info.map((project) => {
          return {
            id: project._id,
            label: project.name,
          };
        });
      } catch (e) {
        // 
      }
    }
    return result;
  }

  /**
   * @param {string} type
   * @returns {string} The type used in the ARC request model.
   */
  [readType](type) {
    if (type === 'history') {
      return type;
    }
    return 'saved';
  }

  /**
   * Sets draggable properties recognized by the components.
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
    const type = this[readType](node.dataset.type);
    const dt = e.dataTransfer;
    dt.setData('arc/id', id);
    dt.setData('arc/type', type);
    dt.setData('arc/request', '1');
    dt.setData('arc/source', this.localName);
    dt.effectAllowed = 'copy';
    if (type === 'history') {
      dt.setData('arc/history', '1');
    } else {
      dt.setData('arc/saved', '1');
    }
  }

  /**
   * Triggers the navigation
   * @param {Event} e
   */
  [itemClickHandler](e) {
    const node = /** @type HTMLElement */ (e.currentTarget);
    const { id, type } = node.dataset;
    if (!id) {
      return;
    }
    ArcNavigationEvents.navigateRequest(this, id, this[readType](type), 'open');
  }

  render() {
    return html`
    ${this[formTemplate]()}
    ${this[noResultsTemplate]()}
    ${this[resultsTemplate]()}
    `;
  }

  /**
   * @returns {TemplateResult|string} The template for the search input
   */
  [formTemplate]() {
    const { anypoint, q, querying } = this;
    return html`
    <div class="search-form">
      <anypoint-input 
        noLabelFloat 
        type="search"
        ?anypoint="${anypoint}"
        ?outlined="${!anypoint}"
        class="search-input"
        .value="${q}"
        @search="${this[searchHandler]}"
        @input="${this[searchInput]}"
      >
        <label slot="label">Search</label>
        <arc-icon icon="search" slot="prefix"></arc-icon>
      </anypoint-input>
      ${querying ? html`<progress class="query-progress"></progress>` : ''}
    </div>
    `;
  }

  /**
   * @returns {TemplateResult|string} The template for the empty results page
   */
  [noResultsTemplate]() {
    const { noResults } = this;
    if (!noResults) {
      return '';
    }
    return html`
    <div class="empty-info">
      No results for <b>${this[commitValue]}</b>.
    </div>
    `;
  }

  /**
   * @returns {TemplateResult|string} The template for the search items.
   */
  [resultsTemplate]() {
    const { items, hasResults } = this;
    if (!hasResults) {
      return '';
    }
    return html`
    <div class="list">
      ${items.map((item, index) => this[searchItemTemplate](item, index))}
    </div>
    `;
  }

  /**
   * @param {HistorySearchItem | SavedSearchItem} item
   * @param {number} index
   * @returns {TemplateResult} The template for a single list item
   */
  [searchItemTemplate](item, index) {
    const { kind } = item;
    if (kind === 'ARC#HistorySearchItem') {
      return this[historyItemTemplate](/** @type HistorySearchItem */ (item), index);
    }
    return this[savedItemTemplate](/** @type SavedSearchItem */ (item), index);
  }

  /**
   * @param {HistorySearchItem} searchItem
   * @param {number} index
   * @returns {TemplateResult} The template for a history list item
   */
  [historyItemTemplate](searchItem, index) {
    const { anypoint, draggableEnabled, hasTwoLines } = this;
    const { isoTime, item } = searchItem;
    return html`
    <anypoint-item
      data-index="${index}"
      data-id="${item._id}"
      data-type="${item.type}"
      class="request-list-item"
      title="${item.url}"
      role="menuitem"
      ?anypoint="${anypoint}"
      @click="${this[itemClickHandler]}"
      draggable="${draggableEnabled ? 'true' : 'false'}"
      @dragstart="${this[dragStartHandler]}"
    >
      <anypoint-item-body ?twoline="${hasTwoLines}" ?anypoint="${anypoint}">
        <div class="url"><span class="search-operation-label">${item.method}</span> ${item.url}</div>
        <div ?hidden="${!hasTwoLines}" data-secondary>
          <span class="pill type">History</span>
          <relative-time datetime="${isoTime}">${isoTime}</relative-time>
          at <local-time datetime="${isoTime}" hour="2-digit" minute="2-digit" second="2-digit"></local-time>
        </div>
      </anypoint-item-body>
    </anypoint-item>
    `;
  }

  /**
   * @param {SavedSearchItem} searchItem
   * @param {number} index
   * @returns {TemplateResult} The template for a saved list item
   */
  [savedItemTemplate](searchItem, index) {
    const { anypoint, draggableEnabled, hasTwoLines } = this;
    const { projects, item } = searchItem;
    return html`
    <anypoint-item
      data-index="${index}"
      data-id="${item._id}"
      data-type="${item.type}"
      class="request-list-item"
      title="${item.url}"
      role="menuitem"
      ?anypoint="${anypoint}"
      @click="${this[itemClickHandler]}"
      draggable="${draggableEnabled ? 'true' : 'false'}"
      @dragstart="${this[dragStartHandler]}"
    >
      <anypoint-item-body ?twoline="${hasTwoLines}" ?anypoint="${anypoint}">
        <div class="url"><span class="search-operation-label">${item.method}</span> ${item.url}</div>
        <div ?hidden="${!hasTwoLines}" data-secondary>
          <span class="pill type">Saved</span>
          <span class="pill name" title="Request name">${item.name}</span>
          ${projects.map((project) => html`<span class="pill project" title="Project ${project.label}">${project.label}</span>`)}
        </div>
      </anypoint-item-body>
    </anypoint-item>
    `;
  }
}
