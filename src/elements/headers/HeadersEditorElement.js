/* eslint-disable arrow-body-style */
/* eslint-disable no-param-reassign */
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
import { html, LitElement } from 'lit-element';
import '@anypoint-web-components/awc/anypoint-icon-button.js';
import '@anypoint-web-components/awc/anypoint-button.js';
import '@anypoint-web-components/awc/anypoint-input.js';
import '@anypoint-web-components/awc/anypoint-switch.js';
import '@advanced-rest-client/icons/arc-icon.js';
import '@anypoint-web-components/awc/anypoint-autocomplete.js';
import { EventsTargetMixin } from '@anypoint-web-components/awc';
import { TelemetryEvents, RequestEventTypes } from '@advanced-rest-client/events';
import { queryRequestHeaders } from './ArcDefinitionsElement.js';
import { HeadersParser } from '../../lib/headers/HeadersParser.js';
import {
  valueValue,
  createViewModel,
  viewModel,
  valueFromModel,
  notifyValueChange,
  valueChangeEventName,
  sourceTemplate,
  formTemplate,
  formHeaderTemplate,
  addTemplate,
  emptyTemplate,
  contentActionsTemplate,
  headerItemTemplate,
  headerToggleTemplate,
  headerRemoveTemplate,
  headerNameInput,
  headerValueInput,
  removeHeaderHandler,
  enabledHandler,
  headerInputHandler,
  propagateModelChange,
  addHeaderHandler,
  autocompleteTemplate,
  inputFocusHandler,
  autocompleteRef,
  copyHandler,
  resetCopyState,
  sourceModeHandler,
  rawValueHandler,
  focusLastName,
  contentTypeHandler,
  copyActionButtonTemplate,
  editorSwitchTemplate,
} from './internals.js';
import elementStyles from '../styles/HeadersEditor.styles.js';

/** @typedef {import('lit-element').TemplateResult} TemplateResult */
/** @typedef {import('@advanced-rest-client/events').FormTypes.FormItem} FormItem */
/** @typedef {import('@anypoint-web-components/awc').AnypointInputElement} AnypointInput */
/** @typedef {import('@anypoint-web-components/awc').AnypointAutocompleteElement} AnypointAutocomplete */
/** @typedef {import('@anypoint-web-components/awc').AnypointSwitchElement} AnypointSwitchElement */
/** @typedef {import('@advanced-rest-client/events').RequestChangeEvent} RequestChangeEvent */

export default class HeadersEditorElement extends EventsTargetMixin(LitElement) {
  static get styles() {
    return elementStyles;
  }
  
  static get properties() {
    return {
      /**
       * Headers value.
       */
      value: { type: String },
      /**  
       * The view model to use to render the values.
       * Note, the `model` property is immediately updated when the `value` is set.
       * When the hosting application uses both values make sure to only set the `model` property.
       * 
       * Also note, there's no dedicated event for the model change. When value change then
       * the model changed as well.
       */
      model: { type: Array },
      /**  
       * When enabled it renders source mode (code mirror editor with headers support)
       */    
      source: { type: Boolean },
      /**
       * When set the editor is in read only mode.
       */
      readOnly: { type: Boolean },
      /**
       * Enables Anypoint theme.
       */
      anypoint: { type: Boolean },
      /**
       * Enables Material Design outlined style
       */
      outlined: { type: Boolean },
    }
  }

  /**
   * @returns {string}
   */
  get value() {
    return this[valueValue];
  }

  /**
   * @param {string} value
   */
  set value(value) {
    const old = this[valueValue];
    /* istanbul ignore if */
    if (old === value) {
      return;
    }
    this[valueValue] = value;
    this[viewModel] = this[createViewModel](value);
    this.requestUpdate();
  }

  /**
   * @returns {FormItem[]}
   */
  get model() {
    return this[viewModel];
  }

  /**
   * @param {FormItem[]} value
   */
  set model(value) {
    const old = this[viewModel];
    /* istanbul ignore if */
    if (old === value || !Array.isArray(value)) {
      return;
    }
    this[viewModel] = /** @type FormItem[] */ (value);
    this[valueValue] = this[valueFromModel](value);
    this.requestUpdate();
  }

  /**
   * @return {AnypointAutocomplete}
   */
  get [autocompleteRef]() {
    return this.shadowRoot.querySelector('anypoint-autocomplete');
  }

  get hasHeaders() {
    return Boolean(this.model && this.model.length)
  }

  constructor() {
    super();
    this.outlined = false;
    this.anypoint = false;
    this.readOnly = false;
    this.source = false;
    this[viewModel] = /** @type FormItem[] */ ([]);
    this[valueValue] = '';
    this[contentTypeHandler] = this[contentTypeHandler].bind(this);
  }

  /**
   * @param {EventTarget} node
   */
  _attachListeners(node) {
    node.addEventListener(RequestEventTypes.State.contentTypeChange, this[contentTypeHandler]);
  }

  /**
   * @param {EventTarget} node
   */
  _detachListeners(node) {
    node.removeEventListener(RequestEventTypes.State.contentTypeChange, this[contentTypeHandler]);
  }

  /**
   * Updates header value. If the header does not exist in the editor it will be created.
   * @param {string} name Header name
   * @param {string} value Header value
   */
  updateHeader(name, value) {
    const lowerName = name.toLowerCase();
    const model = /** @type FormItem[] */ (this[viewModel]);
    const index = model.findIndex((item) => (item.name || '').toLocaleLowerCase() === lowerName);
    if (index === -1) {
      model.push({
        name,
        value,
        enabled: true,
      });
    } else {
      model[index].value = value;
    }
    this[propagateModelChange]();
    this.requestUpdate();
  }

  /**
   * Removes header from the editor by its name.
   * @param {string} name Header name
   */
  removeHeader(name) {
    const lowerName = name.toLowerCase();
    const model = /** @type FormItem[] */ (this[viewModel]);
    const index = model.findIndex((item) => (item.name || '').toLocaleLowerCase() === lowerName);
    if (index === -1) {
      return;
    }
    model.splice(index, 1);
    this[propagateModelChange]();
    this.requestUpdate();
  }

  /**
   * Adds a header to the list of headers
   */
  add() {
    this[viewModel].push({
      name: '',
      value: '',
      enabled: true,
    });
    // the value hasn't actually changed here so no events
    this.requestUpdate();
  }

  /**
   * @param {RequestChangeEvent} e
   */
  [contentTypeHandler](e) {
    const { changedProperty, changedValue } = e;
    if (changedProperty !== 'content-type') {
      return;
    }
    this.updateHeader('content-type', changedValue);
  }

  /**
   * Parses headers string to a view model.
   * @param {string} input
   * @returns {FormItem[]} View model for the headers.
   */
  [createViewModel](input) {
    if (!input || typeof input !== 'string') {
      return [];
    }
    const parsed = HeadersParser.toJSON(input);
    return parsed.map((item) => {
      return {
        ...item,
        enabled: true,
      };
    });
  }

  /**
   * @param {FormItem[]} model
   * @returns {string}
   */
  [valueFromModel](model) {
    if (!Array.isArray(model) || !model.length) {
      return '';
    }
    return HeadersParser.toString(model);
  }

  /**
   * Dispatches `change` event to notify about the value change
   */
  [notifyValueChange]() {
    this.dispatchEvent(new CustomEvent(valueChangeEventName))
  }

  /**
   * Updates the `value` from the current model and dispatches the value change event
   */
  [propagateModelChange]() {
    this[valueValue] = this[valueFromModel](this.model);
    this[notifyValueChange]();
  }

  /**
   * @param {CustomEvent} e
   */
  [enabledHandler](e) {
    const node = /** @type AnypointSwitchElement */ (e.target);
    const index = Number(node.dataset.index);
    const item = this[viewModel][index];
    item.enabled = node.checked;
    this[propagateModelChange]();
  }

  /**
   * @param {CustomEvent} e
   */
  [headerInputHandler](e) {
    const node = /** @type AnypointInput */ (e.target);
    const { value } = node;
    const { property } = node.dataset;
    const index = Number(node.dataset.index);
    const item = this[viewModel][index];
    const old = item[property];
    if (old === value) {
      return;
    }
    item[property] = value;
    this[propagateModelChange]();
  }

  /**
   * Handler to the remove a header
   * @param {PointerEvent} e
   */
  [removeHeaderHandler](e) {
    const node = /** @type HTMLElement */ (e.currentTarget);
    const index = Number(node.dataset.index);
    this[viewModel].splice(index, 1);
    this[propagateModelChange]();
    this.requestUpdate();
  }

  /**
   * A handler for the add header click.
   */
  async [addHeaderHandler]() {
    this.add();
    await this.updateComplete;
    setTimeout(() => this[focusLastName]());
  }

  /**
   * Adds autocomplete support for the currently focused header.
   * @param {Event} e
   */
  [inputFocusHandler](e) {
    const sc = this[autocompleteRef];
    const node = /** @type AnypointInput */ (e.target);
    if (sc.target === node) {
      return;
    }
    const { property } = node.dataset;
    let suggestions;
    if (property === 'name') {
      suggestions = queryRequestHeaders(undefined).map((item) => item.key);
    } else {
      const i = Number(node.dataset.index);
      const item = /** @type FormItem */ (this[viewModel][i]);
      if (item.name) {
        const items = queryRequestHeaders(item.name);
        if (items && items.length && items[0].autocomplete) {
          suggestions = items[0].autocomplete;
        }
      }
    }
    sc.source = suggestions;
    if (suggestions) {
      sc.target = node;
      sc.renderSuggestions();
    }
  }

  /**
   * Copies current response text value to clipboard.
   * @param {Event} e
   */
  async [copyHandler](e) {
    const button = /** @type HTMLButtonElement */ (e.target);
    try {
      await navigator.clipboard.writeText(this.value);
      button.innerText = 'Done';
    } catch (cause) {
      button.innerText = 'Error';
    }
    button.disabled = true;
    if ('part' in button) {
      // @ts-ignore
      button.part.add('content-action-button-disabled');
      // @ts-ignore
      button.part.add('code-content-action-button-disabled');
    }
    setTimeout(() => this[resetCopyState](button), 1000);
    TelemetryEvents.event(this, {
      category: 'Usage',
      action: 'Click',
      label: 'Headers editor clipboard copy',
    });
  }

  /**
   * @param {HTMLButtonElement} button
   */
  [resetCopyState](button) {
    button.innerText = 'Copy';
    button.disabled = false;
    if ('part' in button) {
      // @ts-ignore
      button.part.remove('content-action-button-disabled');
      // @ts-ignore
      button.part.remove('code-content-action-button-disabled');
    }
  }

  /**
   * Toggles the source view
   * @param {Event} e
   */
  async [sourceModeHandler](e) {
    const sw = /** @type AnypointSwitchElement */ (e.target);
    this.source = sw.checked;
    await this.requestUpdate();
  }

  /**
   * Handler for the CodeMirror input event.
   * @param {Event} e
   */
  [rawValueHandler](e) {
    const editor = /** @type HTMLDivElement */ (e.target);
    const { innerHTML } = editor;
    const p1 = new RegExp("<!.*>", "g");
    const p2 = new RegExp("<div>", "g");
    const p3 = new RegExp("</div>", "g");
    const p4 = new RegExp("<br>", "g");
    const value = innerHTML.replace(p2, "\n").replace(p3, "").replace(p4, "").replace(p1, "").trim();
    this[valueValue] = value;
    this[viewModel] = this[createViewModel](value);
    this[notifyValueChange]();
  }

  /**
   * Focuses on the last header name filed
   */
  [focusLastName]() {
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

  render() {
    const { source } = this;
    return html`
    <div class="editor">
      ${this[contentActionsTemplate]()}
      ${source ? this[sourceTemplate]() : this[formTemplate]()}
    </div>
    ${this[autocompleteTemplate]()}
    `;
  }

  /**
   * @returns {TemplateResult} a template for the content actions
   */
  [contentActionsTemplate]() {
    return html`
    <div class="content-actions">
      ${this[copyActionButtonTemplate]()}
      ${this[editorSwitchTemplate]()}
    </div>
    `;
  }

  /**
   * @returns {TemplateResult} The template for the copy action button
   */
  [copyActionButtonTemplate]() {
    return html`
    <anypoint-button 
      class="copy-button"
      @click="${this[copyHandler]}"
      ?disabled="${!this.hasHeaders}"

    >Copy</anypoint-button>
    `;
  }

  /**
   * @returns {TemplateResult} The template for the editor type switch
   */
  [editorSwitchTemplate]() {
    return html`
    <anypoint-switch 
      .checked="${this.source}" 
      @change="${this[sourceModeHandler]}"
      class="editor-switch"
    >Text editor</anypoint-switch>
    `;
  }

  /**
   * @returns {TemplateResult} a template for the content actions
   */
  [sourceTemplate]() {
    const { readOnly } = this;
    return html`
    <div
      ?contentEditable="${!readOnly}"
      data-headers-panel
      class="raw-editor"
      @input="${this[rawValueHandler]}"
    >${this.value}</div>`;
  }

  /**
   * @returns {TemplateResult} a template for the content actions
   */
  [formTemplate]() {
    const model = /** @type FormItem[] */ (this[viewModel]);
    if (!model.length) {
      return this[emptyTemplate]();
    }
    return html`
    ${this[formHeaderTemplate]()}
    <div class="params-list">
      ${model.map((item, index) => this[headerItemTemplate](item, index))}
    </div>
    ${this[addTemplate]()}
    `;
  }

  /**
   * @returns {TemplateResult} The template for the editor title
   */
  [formHeaderTemplate]() {
    return html`
    <div class="table-labels">
      <span class="param-name-label">Name</span>
      <span class="param-value-label">Value</span>
    </div>`;
  }

  /**
   * @returns {TemplateResult} a template for the empty list view
   */
  [emptyTemplate]() {
    return html`
      <p class="empty-list">Add a header to the HTTP request.</p>
      ${this[addTemplate]()}
    `;
  }

  /**
   * @param {FormItem} item
   * @param {number} index
   * @return {TemplateResult}
   */
  [headerItemTemplate](item, index) {
    return html`
    <div class="form-row">
      ${this[headerToggleTemplate](item, index)}
      ${this[headerNameInput](item, index)}
      ${this[headerValueInput](item, index)}
      ${this[headerRemoveTemplate](index)}
    </div>`;
  }

  /**
   * @returns {TemplateResult} a template for the content actions
   */
  [addTemplate]() {
    const { anypoint, readOnly } = this;
    return html`
    <div class="form-actions">
      <anypoint-button
        emphasis="low"
        @click="${this[addHeaderHandler]}"
        class="add-param"
        ?anypoint="${anypoint}"
        ?disabled="${readOnly}"
      >
        <arc-icon icon="addCircleOutline"></arc-icon> Add
      </anypoint-button>
    </div>
    `;
  }

  /**
   * @param {number} index
   * @return {TemplateResult} Template for the parameter name input
   */
  [headerRemoveTemplate](index) {
    const { anypoint, readOnly } = this;
    return html`
    <anypoint-icon-button
      data-index="${index}"
      @click="${this[removeHeaderHandler]}"
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
   * @param {FormItem} item
   * @param {number} index
   * @return {TemplateResult} Template for the parameter name input
   */
  [headerToggleTemplate](item, index) {
    const { anypoint, readOnly } = this;
    return html`
    <anypoint-switch
      data-index="${index}"
      .checked="${item.enabled}"
      @checkedchange="${this[enabledHandler]}"
      title="Enable / disable header"
      aria-label="Activate to toggle enabled state of this item"
      class="param-switch"
      ?disabled="${readOnly}"
      ?anypoint="${anypoint}"
    ></anypoint-switch>
    `;
  }

  /**
   * @param {FormItem} item
   * @param {number} index
   * @return {TemplateResult} Template for the parameter name input
   */
  [headerNameInput](item, index) {
    const { anypoint, outlined, readOnly } = this;
    return html`
    <anypoint-input
      autoValidate
      .value="${item.name}"
      data-property="name"
      data-index="${index}"
      class="param-name"
      ?anypoint="${anypoint}"
      ?outlined="${outlined}"
      ?readOnly="${readOnly}"
      pattern="\\S*"
      @valuechange="${this[headerInputHandler]}"
      noLabelFloat
      @focus="${this[inputFocusHandler]}"
    >
      <label slot="label">Header name</label>
    </anypoint-input>
    `;
  }

  /**
   * @param {FormItem} item
   * @param {number} index
   * @return {TemplateResult} Template for the parameter value input
   */
  [headerValueInput](item, index) {
    const { anypoint, outlined, readOnly } = this;
    return html`
    <anypoint-input
      .value="${item.value}"
      data-property="value"
      data-index="${index}"
      class="param-value"
      ?anypoint="${anypoint}"
      ?outlined="${outlined}"
      ?readOnly="${readOnly}"
      @valuechange="${this[headerInputHandler]}"
      noLabelFloat
      @focus="${this[inputFocusHandler]}"
    >
      <label slot="label">Header value</label>
    </anypoint-input>
    `;
  }

  /**
   * @returns {TemplateResult} A template for the autocomplete element
   */
  [autocompleteTemplate]() {
    const { anypoint, readOnly } = this;
    return html`
    <anypoint-autocomplete
      fitPositionTarget
      horizontalAlign="left"
      verticalAlign="top"
      verticalOffset="40"
      ?anypoint="${anypoint}"
      ?disabled="${readOnly}"
    ></anypoint-autocomplete>
    `;
  }
}
