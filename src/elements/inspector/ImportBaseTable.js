/* eslint-disable lit-a11y/click-events-have-key-events */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-unused-vars  */

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
import { LitElement, html } from 'lit-element';
import { keyboardArrowDown } from '@advanced-rest-client/icons/ArcIcons.js';
import '@anypoint-web-components/awc/anypoint-collapse.js';
import '@anypoint-web-components/awc/anypoint-icon-button.js';
import '@anypoint-web-components/awc/anypoint-checkbox.js';
import '@anypoint-web-components/awc/anypoint-icon-item.js';
import '@anypoint-web-components/awc/anypoint-item-body.js';
import '@anypoint-web-components/awc/anypoint-selector.js';
import styles from './CommonStyles.js';

/** @typedef {import('@anypoint-web-components/awc').AnypointSelectorElement} AnypointSelectorElement */
/** @typedef {import('lit-element').TemplateResult} TemplateResult */

export const toggleSelectedAll = Symbol('toggleSelectedAll');
export const toggleSelectedAllClick = Symbol('toggleSelectedAllClick');
export const selectedHandler = Symbol('selectedHandler');
export const dataChanged = Symbol('dataChanged');
export const createSelectionArray = Symbol('createSelectionArray');
export const toggleOpenedHandler = Symbol('toggleOpenedHandler');

/**
 * Base table class. Contains methods and templates to be
 * used by other tables.
 *
 * In most cases child classes should only define their own `itemBodyTemplate` function.
 */
export class ImportBaseTable extends LitElement {
  static get styles() {
    return styles;
  }

  static get properties() {
    return {
      /**
       * Title of the table when using base table
       */
      tableTitle: { type: String },
      // Indicates if the table is displaying list of items
      opened: { type: Boolean, reflect: true },
      // The data to render.
      data: { type: Array },
      /**
       * List of IDs of selected items.
       */
      selectedIndexes: { type: Array },
      // True to select all elements from the list
      allSelected: { type: Boolean },
      /**
       * Enables Anypoint theme
       */
      anypoint: { type: Boolean }
    };
  }

  /**
   * @return {Boolean} If true, the user selected some elements on list. Check the
   * `this.selectedIndexes` property to check for the selected elements.
   */
  get hasSelection() {
    const { selectedIndexes } = this;
    return !!(selectedIndexes && selectedIndexes.length);
  }

  get data() {
    return this._data;
  }

  set data(value) {
    const old = this._data;
    if (old === value) {
      return;
    }
    this._data = value;
    this.requestUpdate('data', old);
    this[dataChanged](value);
  }

  /**
   * @return {AnypointSelectorElement} Handler to the current selection list.
   */
  get list() {
    return this.shadowRoot.querySelector('anypoint-selector');
  }

  /**
   * @returns {any[]} The selected in the view items.
   */
  get selectedItems() {
    const indexes = this.selectedIndexes;
    const items = this.data;
    const result = [];
    if (!items || !indexes.length) {
      return result;
    }
    items.forEach((item) => {
      const id = item.key;
      if (indexes.indexOf(id) !== -1) {
        result[result.length] = item;
      }
    });
    return result;
  }

  constructor() {
    super();
    this.selectedIndexes = [];
    this.tableTitle = undefined;
    this.anypoint = false;
  }

  firstUpdated() {
    if (this.selectedIndexes.length) {
      this.setSelected(this.selectedIndexes);
    }
  }

  /**
   * Handler for the toggle table click.
   * @param {PointerEvent} e
   */
  [toggleOpenedHandler](e) {
    if (e.defaultPrevented) {
      return;
    }
    this.toggleOpened();
  }

  /**
   * Toggles opened state
   */
  toggleOpened() {
    this.opened = !this.opened;
  }

  /**
   * @param {any[]} items The import data
   * @return {string[]} List of selected ids
   */
  [createSelectionArray](items) {
    return (items || []).map((item) => item.key);
  }

  /**
   * @param {any[]} [data=[]] The import data
   */
  [dataChanged](data=[]) {
    const arr = this[createSelectionArray](data);
    this.selectedIndexes = arr;
    this.setSelected(arr);
    this.allSelected = true;
  }

  /**
   * @param {string[]} values The list of selected indexes
   */
  setSelected(values) {
    const node = this.list;
    if (!node) {
      return;
    }
    // @ts-ignore
    node.selectedValues = values;
  }

  /**
   * @param {CustomEvent} e
   */
  [selectedHandler](e) {
    this.selectedIndexes = e.detail.value;
    this.requestUpdate();
  }

  /**
   * @param {PointerEvent} e
   */
  [toggleSelectedAllClick](e) {
    e.preventDefault();
    e.stopPropagation();
  }

  /**
   * @param {CustomEvent} e
   */
  [toggleSelectedAll](e) {
    const { value } = e.detail;
    this.allSelected = value;
    let indexes = [];
    if (value) {
      indexes = this[createSelectionArray](this.data);
    }
    this.setSelected(indexes);
    this.requestUpdate();
  }

  /**
   * @return {TemplateResult} Main render function
   */
  render() {
    return html`
    ${this.headerTemplate()}
    ${this.contentTemplate()}`;
  }

  /**
   * @param {any} item Single import item
   * @param {number} index The index of the item in the source array.
   * @return {TemplateResult} Template for the item body.
   */
  itemBodyContentTemplate(item, index) {
    return html`
    <anypoint-item-body>
      ${this.itemBodyTemplate(item, index)}
    </anypoint-item-body>
    `;
  }

  /**
   * @param {any} item Single import item
   * @param {number} index The index of the item in the source array.
   * @returns {TemplateResult|string} A template for body content of the import item.
   */
  // @ts-ignore
  itemBodyTemplate(item, index) {
    return '';
  }

  /**
   * @param {any[]} data The data to render.
   * @returns {TemplateResult[]|string} A template for the list items
   */
  repeaterTemplate(data) {
    if (!data || !data.length) {
      return '';
    }
    const { selectedIndexes } = this;
    return data.map((item, index) => html`
    <anypoint-icon-item data-index="${index}" data-key="${item.key}">
      <anypoint-checkbox
        data-index="${index}"
        .checked="${selectedIndexes.indexOf(item.key) !== -1}"
        slot="item-icon"
        aria-label="Toggle selection"
        tabindex="-1"
      ></anypoint-checkbox>
      ${this.itemBodyContentTemplate(item, index)}
    </anypoint-icon-item>`);
  }

  /**
   * @returns {TemplateResult} A template for the table header
   */
  headerTemplate() {
    const { tableTitle, selectedIndexes, opened, anypoint, allSelected } = this;
    const cnt = selectedIndexes ? selectedIndexes.length : 0;
    const iconClass = `toggle-icon${(opened ? ' opened' : '')}`;
    return html`
    <header class="title" @click="${this.toggleOpened}">
      <anypoint-checkbox
        class="select-all"
        ?checked="${allSelected}"
        title="Select / deselect all"
        aria-label="Activate to select or deselect all"
        @click="${this[toggleSelectedAllClick]}"
        @checkedchange="${this[toggleSelectedAll]}"
      ></anypoint-checkbox>
      <h3>${tableTitle} (${cnt})</h3>
      <anypoint-icon-button
        class="${iconClass}"
        aria-label="Activate to toggle table opened"
        title="Toggle table opened"
        ?anypoint="${anypoint}"
      >
        <span class="icon">${keyboardArrowDown}</span>
      </anypoint-icon-button>
    </header>`;
  }

  /**
   * @returns {TemplateResult} A template for the table content
   */
  contentTemplate() {
    return html`
    <anypoint-collapse .opened="${this.opened}">
      <anypoint-selector
        multi
        toggle
        attrforselected="data-key"
        selectable="anypoint-icon-item"
        .selectedValues="${this.selectedIndexes}"
        @selectedvalues-changed="${this[selectedHandler]}"
      >
      ${this.repeaterTemplate(this.data)}
      </anypoint-selector>
    </anypoint-collapse>`;
  }
}
