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
import { LitElement, html } from 'lit-element';
import '@anypoint-web-components/awc/anypoint-input.js';
import '@anypoint-web-components/awc/anypoint-switch.js';
import elementStyles from '../styles/Formdata.styles.js';
import {
  valueValue,
  modelValue,
  valueChanged,
  notifyChange,
  formTemplate,
  actionsTemplate,
  paramItemTemplate,
  paramToggleTemplate,
  paramNameInput,
  paramValueInput,
  paramRemoveTemplate,
  paramInputHandler,
  removeParamHandler,
  enabledHandler,
  modelChanged,
  modelToValue,
  encodeParameters,
  decodeParameters,
  addParamHandler,
  addParamTemplate,
} from './internals.js';
import { 
  decodeUrlEncoded,
  encodeUrlEncoded,
  createViewModel,
  formArrayToString,
} from './UrlEncodeUtils.js';

/** @typedef {import('@advanced-rest-client/events').ApiTypes.ApiType} ApiType */
/** @typedef {import('lit-element').TemplateResult} TemplateResult */
/** @typedef {import('@anypoint-web-components/awc').AnypointInputElement} AnypointInput */
/** @typedef {import('@anypoint-web-components/awc').AnypointSwitchElement} AnypointSwitchElement */

export default class BodyFormdataEditorElement extends LitElement {
  static get styles() {
    return elementStyles;
  }

  static get properties() {
    return {
      /**
       * A HTTP body.
       */
      value: { type: String },
      /**
       * Computed data model for the view.
       * Don't set both `value` and `model`. If the model exists then
       * set only it or otherwise the `value` setter override the model.
       */
      model: { type: Array },
      /**
       * Enables Anypoint theme
       */
      anypoint: { type: Boolean },
      /**
       * Enables Material Design outlined style
       */
      outlined: { type: Boolean },
      /**
       * When set the editor is in read only mode.
       */
      readOnly: { type: Boolean },
      /**
       * When set all controls are disabled in the form
       */
      disabled: { type: Boolean },
      /** 
       * When set it automatically encodes and decodes values.
       */
      autoEncode: { type: Boolean },
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
    this[valueChanged](value);
  }

  /**
   * @returns {ApiType[]}
   */
  get model() {
    return this[modelValue];
  }

  /**
   * @param {ApiType[]} value
   */
  set model(value) {
    const old = this[modelValue];
    if (old === value) {
      return;
    }
    this[modelValue] = value;
    this[valueValue] = this[modelToValue]();
    this.requestUpdate();
  }

  constructor() {
    super();
    this.model = /** @type ApiType[] */ ([]);

    this.anypoint = false;
    this.outlined = false;
    this.readOnly = false;
    this.disabled = false;
    this.autoEncode = false;
  }

  [notifyChange]() {
    this.dispatchEvent(new CustomEvent('change'));
  }

  [modelChanged]() {
    if (this.readOnly) {
      return;
    }
    this[valueValue] = this[modelToValue]();
    this[notifyChange]();
  }

  [modelToValue]() {
    const { model, autoEncode } = this;
    
    if (autoEncode) {
      const encoded = /** @type ApiType[] */ (encodeUrlEncoded(model))
      return formArrayToString(encoded);
    }
    return formArrayToString(this.model);
  }

  /**
   * Called when the `value` property change. It generates the view model
   * for the editor.
   *
   * @param {string} value
   */
  [valueChanged](value) {
    if (!value) {
      this.model = /** @type ApiType[] */ ([]);
      return;
    }
    const model = /** @type ApiType[] */ (createViewModel(value));
    if (this.autoEncode) {
      this[modelValue] = /** @type ApiType[] */ (decodeUrlEncoded(model));
    } else {
      this[modelValue] = model;
    }
    this.requestUpdate();
  }

  /**
   * Handler to the remove a parameter
   * @param {PointerEvent} e
   */
  [removeParamHandler](e) {
    const node = /** @type HTMLElement */ (e.currentTarget);
    const index = Number(node.dataset.index);
    const items = /** @type ApiType[] */ (this.model);
    items.splice(index, 1);
    this[modelChanged]();
    this.requestUpdate();
  }

  /**
   * @param {Event} e
   */
  [enabledHandler](e) {
    const node = /** @type AnypointSwitchElement */ (e.target);
    const index = Number(node.dataset.index);
    const items = /** @type ApiType[] */ (this.model);
    const item = items[index];
    item.enabled = node.checked;
    this[modelChanged]();
  }

  /**
   * @param {CustomEvent} e
   */
  [paramInputHandler](e) {
    e.stopPropagation();
    const node = /** @type AnypointInput */ (e.target);
    const { value } = node;
    const { property } = node.dataset;
    const index = Number(node.dataset.index);
    const item = this.model[index];
    const old = item[property];
    if (old === value) {
      return;
    }
    item[property] = value;
    this[modelChanged]();
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
   * Adds a new parameter to the list.
   */
  async [addParamHandler]() {
    if (this.readOnly || this.disabled) {
      return;
    }
    const obj = {
      name: '',
      value: '',
      enabled: true,
    };
    const items = this.model || [];
    items[items.length] = obj;
    this.model = items;
    await this.requestUpdate();
    setTimeout(() => {
      this.focusLastName();
    });
  }

  /**
   * Encodes current parameters in the model, updated the value, and notifies the change
   */
  [encodeParameters]() {
    const encoded = /** @type ApiType[] */ (encodeUrlEncoded(this.model));
    this[modelValue] = encoded;
    this[valueValue] = formArrayToString(encoded);
    this[notifyChange]();
    this.requestUpdate();
  }

  /**
   * Encodes current parameters in the model, updated the value, and notifies the change
   */
  [decodeParameters]() {
    const decoded = /** @type ApiType[] */ (decodeUrlEncoded(this.model));
    this[modelValue] = decoded;
    this[valueValue] = formArrayToString(decoded);
    this[notifyChange]();
    this.requestUpdate();
  }

  /**
   * @return {TemplateResult}
   */
  render() {
    return html`
    ${this[formTemplate]()}
    ${this[addParamTemplate]()}
    ${this[actionsTemplate]()}`;
  }

  /**
   * @return {TemplateResult}
   */
  [formTemplate]() {
    const items = /** @type ApiType[] */ (this.model || []);
    if (!Array.isArray(items) || !items.length) {
      return html`<p class="empty-list">Add a parameter to the list</p>`;
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

  [addParamTemplate]() {
    const { anypoint, readOnly, disabled } = this;
    return html`<div class="query-actions">
    <anypoint-button
      emphasis="low"
      @click="${this[addParamHandler]}"
      class="add-param"
      ?anypoint="${anypoint}"
      ?disabled="${readOnly || disabled}"
    >
      <arc-icon icon="addCircleOutline"></arc-icon> Add
    </anypoint-button>
  </div>`
  }

  /**
   * @param {ApiType} item
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
    const { anypoint, readOnly } = this;
    return html`
    <anypoint-icon-button
      data-index="${index}"
      data-action="remove"
      @click="${this[removeParamHandler]}"
      title="Remove this parameter"
      aria-label="Activate to remove this item"
      ?disabled="${readOnly}"
      ?anypoint="${anypoint}"
    >
      <arc-icon icon="removeCircleOutline"></arc-icon>
    </anypoint-icon-button>
    `;
  }

  /**
   * @param {ApiType} item
   * @param {number} index
   * @return {TemplateResult} Template for the parameter name input
   */
  [paramToggleTemplate](item, index) {
    const { anypoint, readOnly } = this;
    return html`
    <anypoint-switch
      data-index="${index}"
      .checked="${item.enabled}"
      @checkedchange="${this[enabledHandler]}"
      title="Enable / disable parameter"
      aria-label="Activate to toggle enabled state of this item"
      class="param-switch"
      ?disabled="${readOnly}"
      ?anypoint="${anypoint}"
    ></anypoint-switch>
    `;
  }

  /**
   * @param {ApiType} item
   * @param {number} index
   * @return {TemplateResult} Template for the parameter name input
   */
  [paramNameInput](item, index) {
    const { anypoint, outlined, readOnly, autoEncode } = this;
    const hasPattern = !autoEncode;
    const pattern = hasPattern ? '\\S*' : undefined;
    return html`
    <anypoint-input
      ?autoValidate="${hasPattern}"
      .value="${item.name}"
      data-property="name"
      data-index="${index}"
      class="param-name"
      ?anypoint="${anypoint}"
      ?outlined="${outlined}"
      ?readOnly="${readOnly}"
      .pattern="${pattern}"
      @change="${this[paramInputHandler]}"
      noLabelFloat
    >
      <label slot="label">Parameter name</label>
    </anypoint-input>
    `;
  }

  /**
   * @param {ApiType} item
   * @param {number} index
   * @return {TemplateResult} Template for the parameter value input
   */
  [paramValueInput](item, index) {
    const { anypoint, outlined, readOnly, autoEncode } = this;
    const hasPattern = !autoEncode;
    const pattern = hasPattern ? '\\S*' : undefined;
    return html`
    <anypoint-input
      ?autoValidate="${hasPattern}"
      .value="${item.value}"
      data-property="value"
      data-index="${index}"
      class="param-value"
      ?anypoint="${anypoint}"
      ?outlined="${outlined}"
      ?readOnly="${readOnly}"
      .pattern="${pattern}"
      @change="${this[paramInputHandler]}"
      noLabelFloat
    >
      <label slot="label">Parameter value</label>
    </anypoint-input>
    `;
  }

  /**
   * @return {TemplateResult|string}
   */
  [actionsTemplate]() {
    const { anypoint, readOnly, autoEncode } = this;
    if (autoEncode) {
      return '';
    }
    return html`
    <div class="dialog-actions">
      <anypoint-button
        id="encode"
        ?anypoint="${anypoint}"
        @click="${this[encodeParameters]}"
        title="URL encodes parameters in the editor"
        ?disabled="${readOnly}"
      >Encode values</anypoint-button>
      <anypoint-button
        id="decode"
        ?anypoint="${anypoint}"
        @click="${this[decodeParameters]}"
        title="URL decodes parameters in the editor"
        ?disabled="${readOnly}"
      >Decode values</anypoint-button>
    </div>`;
  }
}
