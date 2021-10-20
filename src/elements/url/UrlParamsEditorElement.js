/* eslint-disable class-methods-use-this */
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
import { ValidatableMixin, OverlayMixin, ResizableMixin } from '@anypoint-web-components/awc';
import '@anypoint-web-components/awc/anypoint-icon-button.js';
import '@anypoint-web-components/awc/anypoint-button.js';
import '@anypoint-web-components/awc/anypoint-input.js';
import '@anypoint-web-components/awc/anypoint-switch.js';
import '@advanced-rest-client/icons/arc-icon.js';
import styles from '../styles/UrlDetailedEditor.styles.js';
import { UrlParser } from '../../lib/UrlParser.js';
import {
  getHostValue,
  findSearchParam,
  findModelParam,
  valueValue,
  valueChanged,
  notifyChange,
  computeModel,
  computeSearchParams,
  queryModelChanged,
  updateParserSearch,
  parserValue,
  addParamHandler,
  removeParamHandler,
  encodeQueryParameters,
  decodeQueryParameters,
  enabledHandler,
  paramInputHandler,
  formTemplate,
  actionsTemplate,
  listTemplate,
  paramItemTemplate,
  paramRemoveTemplate,
  paramToggleTemplate,
  paramNameInput,
  paramValueInput,
} from './internals.js';

/* eslint-disable no-plusplus */
/* eslint-disable no-continue */
/* eslint-disable prefer-destructuring */

/** @typedef {import('./UrlParamsEditorElement').QueryParameter} QueryParameter */
/** @typedef {import('./UrlParamsEditorElement').ViewModel} ViewModel */
/** @typedef {import('lit-element').TemplateResult} TemplateResult */
/** @typedef {import('@anypoint-web-components/awc').AnypointInputElement} AnypointInputElement */
/** @typedef {import('@anypoint-web-components/awc').AnypointCheckboxElement} AnypointCheckboxElement */

/**
 * An element that works with the `url-input-editor` that renders an overlay
 * with query parameter values.
 */
export default class UrlParamsEditorElement extends ResizableMixin(OverlayMixin(ValidatableMixin(LitElement))) {
  static get styles() {
    return styles;
  }

  static get properties() {
    return {
      /**
       * Enables outlined theme.
       */
      outlined: { type: Boolean },
      /**
       * Enables compatibility with Anypoint components.
       */
      compatibility: { type: Boolean },
      /**
       * Current value of the editor.
       */
      value: { type: String },
      /**
       * Computed data model for the view.
       */
      model: { type: Object },
      /**
       * List of query parameters model.
       * If not set then it is computed from current URL.
       *
       * Model for query parameters is:
       * - name {String} param name
       * - value {String} param value
       * - enabled {Boolean} is param included into the `value`
       */
      queryParameters: { type: Array },
      /**
       * When set the editor is in read only mode.
       */
      readOnly: { type: Boolean },
    };
  }

  get value() {
    return this[valueValue];
  }

  set value(value) {
    const old = this[valueValue];
    if (old === value) {
      return;
    }
    this[valueValue] = value;
    this.requestUpdate('value', old);
    this[valueChanged](value);
  }

  constructor() {
    super();
    this.model = /** @type ViewModel */ ({});

    this.compatibility = false;
    this.outlined = false;
    this.readOnly = false;
    /** 
     * @type {QueryParameter[]}
     */
    this.queryParameters = undefined;
  }

  [notifyChange]() {
    this.dispatchEvent(new CustomEvent('change'));
  }

  /**
   * A handler that is called on input
   *
   * @param {string} value
   */
  [valueChanged](value) {
    const { queryParameters=[] } = this;
    const hasParams = !!queryParameters.length;
    if (!value && !hasParams) {
      return;
    }
    this[computeModel](value, queryParameters);
  }

  /**
   * @param {string} value
   * @param {QueryParameter[]} [queryModel=[]]
   */
  [computeModel](value, queryModel=[]) {
    if (!value) {
      this.model = /** @type ViewModel */ ({});
      this.queryParameters = /** @type QueryParameter[] */ ([]);
      return;
    }
    const parser = new UrlParser(value);
    this[parserValue] = parser;
    const model = {};
    model.host = this[getHostValue](parser) || '';
    model.path = parser.path || '';
    model.anchor = parser.anchor || '';
    this.model = /** @type ViewModel */ (model);
    this[computeSearchParams](parser, queryModel);
  }

  /**
   * @param {UrlParser} parser
   * @param {QueryParameter[]} [queryModel=[]]
   */
  [computeSearchParams](parser, queryModel=[]) {
    if (!this.queryParameters) {
      this.queryParameters = /** @type QueryParameter[] */ (queryModel);
    }
    const items = this.queryParameters;
    // 1 keep disabled items in the model
    // 2 remove items that are in query model but not in search params
    // 3 update value of model
    // 4 add existing search params to the model
    const { searchParams } = parser;
    for (let i = queryModel.length - 1; i >= 0; i--) {
      if (queryModel[i].enabled === false) {
        continue;
      }
      const param = this[findSearchParam](searchParams, queryModel[i].name);
      if (!param) {
        items.splice(i, 1);
      } else if (queryModel[i].value !== param[1]) {
        items[i].value = param[1];
      }
    }
    // Add to `queryModel` params that are in `parser.searchParams`
    searchParams.forEach((pairs) => {
      const param = this[findModelParam](queryModel, pairs[0]);
      if (!param) {
        items[items.length] = {
          name: pairs[0],
          value: pairs[1],
          enabled: true
        };
      }
    });
    this.queryParameters = /** @type QueryParameter[] */ ([...items]);
  }

  [queryModelChanged]() {
    if (this.readOnly) {
      return;
    }
    if (!this[parserValue]) {
      this[parserValue] = new UrlParser('');
    }
    this[updateParserSearch](this.queryParameters);
    this[valueValue] = this[parserValue].value;
    this[notifyChange]();
  }

  /**
   * Updates `queryParameters` model from change record.
   *
   * @param {QueryParameter[]} model Current model for the query parameters
   */
  [updateParserSearch](model) {
    const params = [];
    model.forEach((item) => {
      if (!item.enabled) {
        return;
      }
      params.push([item.name, item.value]);
    });
    this[parserValue].searchParams = params;
  }

  /**
   * Focuses on the last query parameter name filed
   */
  focusLastName() {
    const row = this.shadowRoot.querySelector('.params-list > :last-child');
    if (!row) {
      return;
    }
    try {
      const node = row.querySelector('.param-name');
      // @ts-ignore
      node.focus();
    } catch (e) {
      // ...
    }
  }

  /**
   * Adds a new Query Parameter to the list.
   */
  async [addParamHandler]() {
    if (this.readOnly) {
      return;
    }
    const obj = {
      name: '',
      value: '',
      enabled: true
    };
    const items = this.queryParameters || [];
    items[items.length] = obj;
    this.queryParameters = /** @type QueryParameter[] */ ([...items]);
    await this.requestUpdate();
    this.refit();
    this.notifyResize();
    this.focusLastName();
  }

  /**
   * Handler to the remove a parameter
   * @param {PointerEvent} e
   */
  async [removeParamHandler](e) {
    const node = /** @type HTMLElement */ (e.currentTarget);
    const index = Number(node.dataset.index);
    const items = this.queryParameters;
    items.splice(index, 1);
    this.queryParameters = [...items];
    this[queryModelChanged]();
    await this.requestUpdate();
    this.refit();
    this.notifyResize();
  }

  /**
   * Validates the element.
   * @return {boolean} True if the form is valid.
   */
  _getValidity() {
    const inputs = /** @type AnypointInputElement[] */ (Array.from(this.shadowRoot.querySelectorAll('.params-list anypoint-input')));
    let result = true;
    inputs.forEach((input) => {
      const vResult = input.validate();
      if (result && !vResult) {
        result = vResult;
      }
    });
    return result;
  }

  /**
   * Dispatches the `urlencode` event. The editor handles the action.
   */
  [encodeQueryParameters]() {
    this.dispatchEvent(new CustomEvent('urlencode', {
      composed: true
    }));
    setTimeout(() => this.validate(this.value));
  }

  /**
   * Dispatches the `urldecode` event. The editor handles the action.
   */
  [decodeQueryParameters]() {
    this.dispatchEvent(new CustomEvent('urldecode', {
      composed: true
    }));
    setTimeout(() => this.validate(this.value));
  }

  /**
   * @param {CustomEvent} e
   */
  [enabledHandler](e) {
    const node = /** @type AnypointCheckboxElement */ (e.target);
    const index = Number(node.dataset.index);
    const item = this.queryParameters[index];
    item.enabled = node.checked;
    this[queryModelChanged]();
  }

  /**
   * @param {CustomEvent} e
   */
  [paramInputHandler](e) {
    const node = /** @type AnypointInputElement */ (e.target);
    const { value } = node;
    const { property } = node.dataset;
    const index = Number(node.dataset.index);
    const item = this.queryParameters[index];
    const old = item[property];
    if (old === value) {
      return;
    }
    item[property] = value;
    this[queryModelChanged]();
  }

  /**
   * @param {UrlParser} parser
   * @return {string}
   */
  [getHostValue](parser) {
    const {protocol} = parser;
    let {host} = parser;
    if (host) {
      if (protocol) {
        host = `${protocol}//${host}`;
      }
    } else if (protocol) {
        host = `${protocol}//`;
      }
    return host;
  }

  /**
   * Finds a search parameter in the parser's model by given name.
   * @param {Array<string[]>} searchParams Model for search params
   * @param {string} name Name of the parameter
   * @return {string[]|undefined} Search parameter model item
   */
  [findSearchParam](searchParams, name) {
    for (let i = searchParams.length - 1; i >= 0; i--) {
      if (searchParams[i][0] === name) {
        return searchParams[i];
      }
    }
    return undefined;
  }

  /**
   * Searches for a query parameters model by given name.
   * @param {QueryParameter[]} model Query parameters model
   * @param {string} name Name of the parameter
   * @return {QueryParameter|undefined} Model item.
   */
  [findModelParam](model, name) {
    for (let i = 0, len = model.length; i < len; i++) {
      const item = model[i];
      if (!item.enabled || item.name !== name) {
        continue;
      }
      return item;
    }
    return undefined;
  }

  /**
   * @return {TemplateResult}
   */
  render() {
    return html`
    ${this[formTemplate]()}
    ${this[actionsTemplate]()}`;
  }

  /**
   * @return {TemplateResult}
   */
  [formTemplate]() {
    const items = /** @type QueryParameter[] */ (this.queryParameters || []);
    const { compatibility, readOnly } = this;
    return html`
    <label class="query-title">Query parameters</label>
    ${this[listTemplate](items)}
    <div class="query-actions">
      <anypoint-button
        emphasis="low"
        @click="${this[addParamHandler]}"
        class="add-param"
        ?compatibility="${compatibility}"
        ?disabled="${readOnly}"
      >
        <arc-icon icon="addCircleOutline"></arc-icon> Add
      </anypoint-button>
    </div>
    `;
  }

  /**
   * @param {QueryParameter[]} items List to render
   * @return {TemplateResult}
   */
  [listTemplate](items) {
    if (!Array.isArray(items) || !items.length) {
      return html`<p class="empty-list">Add a query parameter to the URL</p>`;
    }
    return html`
    <div class="table-labels">
      <span class="param-name-label">Name</span>
      <span class="param-value-label">Value</span>
    </div>
    <div class="params-list">
      ${items.map((item, index) => this[paramItemTemplate](item, index))}
    </div>
    `;
  }

  /**
   * @param {QueryParameter} item
   * @param {number} index
   * @return {TemplateResult}
   */
  [paramItemTemplate](item, index) {
    return html`
    <div class="form-row">
      ${this[paramToggleTemplate](item, index)}
      ${this[paramNameInput](item, index)}
      ${this[paramValueInput](item, index)}
      ${this[paramRemoveTemplate](index)}
    </div>`;
  }

  /**
   * @param {number} index
   * @return {TemplateResult} Template for the parameter name input
   */
  [paramRemoveTemplate](index) {
    const { compatibility, readOnly } = this;
    return html`
    <anypoint-icon-button
      data-index="${index}"
      @click="${this[removeParamHandler]}"
      title="Remove this parameter"
      aria-label="Activate to remove this item"
      ?disabled="${readOnly}"
      ?compatibility="${compatibility}"
    >
      <arc-icon icon="removeCircleOutline"></arc-icon>
    </anypoint-icon-button>
    `;
  }

  /**
   * @param {QueryParameter} item
   * @param {number} index
   * @return {TemplateResult} Template for the parameter name input
   */
  [paramToggleTemplate](item, index) {
    const { compatibility, readOnly } = this;
    return html`
    <anypoint-switch
      data-index="${index}"
      .checked="${item.enabled}"
      @checkedchange="${this[enabledHandler]}"
      title="Enable / disable parameter"
      aria-label="Activate to toggle enabled state of this item"
      class="param-switch"
      ?disabled="${readOnly}"
      ?compatibility="${compatibility}"
    ></anypoint-switch>
    `;
  }

  /**
   * @param {QueryParameter} item
   * @param {number} index
   * @return {TemplateResult} Template for the parameter name input
   */
  [paramNameInput](item, index) {
    const { compatibility, outlined, readOnly } = this;
    return html`
    <anypoint-input
      autoValidate
      .value="${item.name}"
      data-property="name"
      data-index="${index}"
      class="param-name"
      ?compatibility="${compatibility}"
      ?outlined="${outlined}"
      ?readOnly="${readOnly}"
      pattern="\\S*"
      @change="${this[paramInputHandler]}"
      noLabelFloat
    >
      <label slot="label">Parameter name</label>
    </anypoint-input>
    `;
  }

  /**
   * @param {QueryParameter} item
   * @param {number} index
   * @return {TemplateResult} Template for the parameter value input
   */
  [paramValueInput](item, index) {
    const { compatibility, outlined, readOnly } = this;
    return html`
    <anypoint-input
      autoValidate
      .value="${item.value}"
      data-property="value"
      data-index="${index}"
      class="param-value"
      ?compatibility="${compatibility}"
      ?outlined="${outlined}"
      ?readOnly="${readOnly}"
      pattern="\\S*"
      @change="${this[paramInputHandler]}"
      noLabelFloat
    >
      <label slot="label">Parameter value</label>
    </anypoint-input>
    `;
  }

  /**
   * @return {TemplateResult}
   */
  [actionsTemplate]() {
    const { compatibility, readOnly } = this;
    return html`
    <div class="dialog-actions">
      <anypoint-button
        id="encode"
        ?compatibility="${compatibility}"
        @click="${this[encodeQueryParameters]}"
        title="URL encodes parameters in the editor"
        ?disabled="${readOnly}"
      >Encode URL</anypoint-button>
      <anypoint-button
        id="decode"
        ?compatibility="${compatibility}"
        @click="${this[decodeQueryParameters]}"
        title="URL decodes parameters in the editor"
        ?disabled="${readOnly}"
      >Decode URL</anypoint-button>
      <anypoint-button
        class="close-button"
        ?compatibility="${compatibility}"
        @click="${this.close}"
        title="Closes the editor"
      >Close</anypoint-button>
    </div>`;
  }
}
