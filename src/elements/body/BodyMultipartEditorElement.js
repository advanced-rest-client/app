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
import '@anypoint-web-components/awc/anypoint-button.js';
import { BodyProcessor } from '@advanced-rest-client/libs';
import elementStyles from '../styles/Multipart.styles.js';
import {
  valueValue,
  modelValue,
  valueChanged,
  notifyChange,
  modelToValue,
  modelChanged,
  addFile,
  addText,
  formTemplate,
  addParamTemplate,
  filePartTemplate,
  textPartTemplate,
  paramItemTemplate,
  paramToggleTemplate,
  paramRemoveTemplate,
  removeParamHandler,
  enabledHandler,
  filePartNameHandler,
  filePartValueHandler,
  pickFileHandler,
  textPartNameHandler,
  textPartValueHandler,
  internalModel,
  internalFromModel,
  setFormValue,
} from './internals.js';

/** @typedef {import('@advanced-rest-client/events').RequestBody.MultipartBody} MultipartBody */
/** @typedef {import('lit-element').TemplateResult} TemplateResult */
/** @typedef {import('@anypoint-web-components/awc').AnypointInputElement} AnypointInput */
/** @typedef {import('@anypoint-web-components/awc').AnypointSwitchElement} AnypointSwitchElement */

let hasSupport;
try {
  const fd = new FormData();
  fd.append('test', new Blob(['.'], {type: 'image/jpg'}), 'test.jpg');
  hasSupport = ('entries' in fd);
} catch (e) {
  /* istanbul ignore next  */
  hasSupport = false;
}
export const hasFormDataSupport = hasSupport;


/**
 * Converts blob data to base64 string.
 *
 * @param {Blob} blob File or blob object to be translated to string
 * @return {Promise<string>} Promise resolved to a base64 string data from the file.
 */
function blobToString(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = (e) => {
      resolve(String(e.target.result));
    };
    reader.onerror = () => {
      reject(new Error('Unable to convert blob to string.'));
    };
    reader.readAsText(blob);
  });
}

/**
 * Multipart payload editor for ARC/API Console body editor.
 *
 * On supported browsers (full support for FormData, Iterator and ArrayBuffer) it will render a
 * UI controls to generate payload message preview.
 *
 * It produces a FormData object that can be used in XHR / Fetch or transformed to ArrayBuffer to be
 * used in socket connection.
 */
export default class BodyMultipartEditorElement extends LitElement {
  static get styles() {
    return elementStyles;
  }

  static get properties() {
    return {
      /**
       * Value of this form
       */
      value: { type: Object },
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
       * When set it ignores the content type processing.
       * This disables option "current header value", in raw editor, and disabled information about 
       * content-type header update.
       */
      ignoreContentType: { type: Boolean },
    }
  }

  /**
   * @returns {FormData}
   */
  get value() {
    return this[valueValue];
  }

  /**
   * @param {FormData} value
   */
  set value(value) {
    const old = this[valueValue];
    if (old === value || !(value instanceof FormData)) {
      return;
    }
    this[valueValue] = value;
    this.requestUpdate('value', old);
    this[valueChanged](value);
    // Note, never set `value` property internally in the element
    // as this will regenerate the entire view model which is 
    // not very efficient. Instead set the private value and 
    // request for the update.
  }

  /**
   * @returns {MultipartBody[]}
   */
  get model() {
    return this[modelValue];
  }

  /**
   * @param {MultipartBody[]} value
   */
  set model(value) {
    const old = this[modelValue];
    if (old === value) {
      return;
    }
    this[modelValue] = value;
    this[modelChanged](value);
    // Note, never set `model` property internally in the element
    // as this will regenerate the entire `value` which is 
    // not very efficient. Instead set the private value and 
    // request for the update.
  }

  constructor() {
    super();
    /** 
     * The model used by the external application
     * @type {MultipartBody[]}
     */
    this[modelValue] = [];
    /** 
     * Internal model that is in sync with the external model but keeps used input
     * rather than transformed data..
     * @type {MultipartBody[]}
     */
    this[internalModel] = [];
    /** 
     * @type {FormData}
     */
    this[valueValue] = new FormData();

    this.anypoint = false;
    this.outlined = false;
    this.readOnly = false;
    this.disabled = false;
    this.autoEncode = false;
    this.ignoreContentType = false;
  }

  /**
   * Adds an instance of a file to the form data
   * @param {File} file 
   */
  async addFile(file) {
    if (this.readOnly || this.disabled) {
      return;
    }
    const value = await BodyProcessor.blobToString(file);
    if (!this.model) {
      this[modelValue] = /** @type MultipartBody[] */ ([]);
    }
    if (!this[internalModel]) {
      this[internalModel] = [];
    }
    const { model } = this;
    const obj = /** @type MultipartBody */ ({
      name: file.name ||  '',
      value,
      enabled: true,
      isFile: true,
      size: file.size,
      fileName: file.name || '',
    });
    model.push(obj);
    this[internalModel].push({ ...obj, value: /** @type any */ (file) });
    const { value: form } = this;
    if (form.has(obj.name)) {
      form.delete(obj.name);
    }
    this[setFormValue](obj, file);
    this[notifyChange]();
    this.requestUpdate();
  }

  [notifyChange]() {
    this.dispatchEvent(new CustomEvent('change'));
  }

  /**
   * Updates properties when the model change externally
   * @param {MultipartBody[]} model
   * @returns {Promise<void>}
   */
  async [modelChanged](model) {
    this[valueValue] = this[modelToValue](model);
    if (Array.isArray(model)) {
      this[internalModel] = await this[internalFromModel](model);
    }
    this.requestUpdate();
  }

  /**
   * Transforms view model into the FormData object.
   *
   * @param {MultipartBody[]} model The view model
   * @return {FormData|undefined}
   */
  [modelToValue](model) {
    if (!Array.isArray(model)) {
      return new FormData();
    }
    return BodyProcessor.restoreMultipart(model);
  }

  /**
   * Called when the `value` property change. It generates the view model
   * for the editor.
   *
   * @param {FormData} value
   */
  async [valueChanged](value) {
    if (!value) {
      this[modelValue] = /** @type MultipartBody[] */ ([]);
      return;
    }
    const model = await BodyProcessor.createMultipartEntry(value);
    this[modelValue] = model;
    this[internalModel] = await this[internalFromModel](model);
    this.requestUpdate();
  }

  /**
   * Creates the internal model from the passed model
   * @param {MultipartBody[]} model
   * @returns {Promise<MultipartBody[]>}
   */
  async [internalFromModel](model) {
    const ps = model.map(async (item) => {
      const cp = { ...item };
      if (cp.isFile) {
        const blob = BodyProcessor.dataURLtoBlob(cp.value);
        // @ts-ignore
        blob.name = item.fileName;
        // @ts-ignore
        cp.value = blob;
        return cp;
      }
      if (!cp.type) {
        return cp;
      }
      // this transforms stored data URL back to the blob
      // and then back to the original string value.
      const blob = BodyProcessor.dataURLtoBlob(cp.value);
      const str = await blobToString(blob);
      cp.value = str;
      return cp;
    });
    return Promise.all(ps);
  }

  /**
   * Adds a new text part to the list.
   * It does not update the FormData as there's no value just yet.
   */
  [addText]() {
    if (this.readOnly || this.disabled) {
      return;
    }
    if (!this.model) {
      this[modelValue] = /** @type MultipartBody[] */ ([]);
    }
    if (!this[internalModel]) {
      this[internalModel] = [];
    }
    const { model } = this;
    const obj = /** @type MultipartBody */ ({
      name: '',
      value: '',
      enabled: true,
      isFile: false,
    });
    model.push(obj);
    this[internalModel].push({ ...obj });
    this.requestUpdate();
  }

  /**
   * Adds a new text part to the list.
   * It does not update the FormData as there's no value just yet.
   */
  [addFile]() {
    if (this.readOnly || this.disabled) {
      return;
    }
    if (!this.model) {
      this[modelValue] = /** @type MultipartBody[] */ ([]);
    }
    if (!this[internalModel]) {
      this[internalModel] = [];
    }
    const { model } = this;
    const obj = /** @type MultipartBody */ ({
      name: '',
      value: '',
      enabled: true,
      isFile: true,
    });
    model.push(obj);
    this[internalModel].push({ ...obj });
    this.requestUpdate();
  }

  /**
   * Handler to the remove a parameter
   * @param {PointerEvent} e
   */
  [removeParamHandler](e) {
    const node = /** @type HTMLElement */ (e.currentTarget);
    const index = Number(node.dataset.index);
    const items = /** @type MultipartBody[] */ (this.model);
    const item = items[index];
    items.splice(index, 1);
    this[internalModel].splice(index, 1);
    this.value.delete(item.name);
    this.requestUpdate();
    this[notifyChange]();
  }

  /**
   * @param {Event} e
   */
  [enabledHandler](e) {
    const node = /** @type AnypointSwitchElement */ (e.target);
    const index = Number(node.dataset.index);
    const items = /** @type MultipartBody[] */ (this.model);
    const item = items[index];
    const { checked } = node;
    item.enabled = checked;
    this[internalModel][index].enabled = checked;
    if (!item.enabled) {
      this.value.delete(item.name);
    } else if (item.enabled && item.name) {
      const setValue = item.isFile ? this[internalModel][index].value : item.value;
      this[setFormValue](item, setValue);
    }
    this[notifyChange]();
  }

  /**
   * @param {MultipartBody} item Item definition
   * @param {File|Blob|string} value The value to set. Value in the item is ignored
   */
  [setFormValue](item, value) {
    if (!value || !item.name) {
      return;
    }
    if (item.isFile) {
      this.value.set(item.name, value);
    } else if (item.type) {
      const blob = new Blob([value || ''], { type: item.type });
      this.value.set(item.name, blob, 'blob');
    } else {
      this.value.set(item.name, value);
    }
  }

  /**
   * @param {Event} e
   */
  [filePartNameHandler](e) {
    const input = /** @type AnypointInput */ (e.target);
    const { value } = input;
    const index = Number(input.dataset.index);
    const item = this.model[index];
    const old = item.name;
    if (old === value) {
      return;
    }
    const { value: form } = this;
    item.name = value;
    this[internalModel][index].name = value;
    if (form.has(old)) {
      const current = form.get(old);
      form.delete(old);
      form.set(value, current);
    }
    this[notifyChange]();
  }

  /**
   * @param {Event} e
   */
  [pickFileHandler](e) {
    const node = /** @type HTMLElement */ (e.target);
    const input = /** @type HTMLInputElement */ (node.nextElementSibling);
    input.click();
  }

  /**
   * @param {Event} e
   */
  async [filePartValueHandler](e) {
    e.stopPropagation();
    const input = /** @type HTMLInputElement */ (e.target);
    const { files } = input;
    const file = files[0];
    const index = Number(input.dataset.index);
    const item = this.model[index];
    const { value: form } = this;
    const value = await BodyProcessor.blobToString(file);
    item.value = value;
    // @ts-ignore
    this[internalModel][index].value = file;
    item.fileName = file.name;
    item.size = file.size;
    if (form.has(item.name)) {
      form.delete(item.name);
    }
    this[setFormValue](item, file);
    this[notifyChange]();
    this.requestUpdate();
  }

  /**
   * @param {Event} e
   */
  [textPartNameHandler](e) {
    const input = /** @type AnypointInput */ (e.target);
    const { value } = input;
    const index = Number(input.dataset.index);
    const item = this.model[index];
    const old = item.name;
    if (old === value) {
      return;
    }
    const { value: form } = this;
    item.name = value;
    this[internalModel][index].name = value;
    if (form.has(old)) {
      const current = form.get(old);
      form.delete(old);
      form.set(value, current);
    }
    this[notifyChange]();
  }

  /**
   * @param {Event} e
   */
  async [textPartValueHandler](e) {
    e.stopPropagation();
    const input = /** @type AnypointInput */ (e.target);
    const { value } = input;
    const index = Number(input.dataset.index);
    const prop = input.dataset.property;
    const item = this.model[index];
    const old = item[prop];
    if (old === value) {
      return;
    }
    if (prop === 'type') {
      // when changing data type it need to read the original value
      // from the user input, not the already transformed one.
      const textValue = this[internalModel][index].value;
      item.value = textValue;
    }
    item[prop] = value;
    this[internalModel][index][prop] = value;
    if (!item.name) {
      return;
    }
    const { value: form } = this;
    if (form.has(item.name)) {
      form.delete(item.name);
    }
    this[setFormValue](item, item.value);
    if (item.type) {
      // transform only blob values
      item.value = await BodyProcessor.blobToString(/** @type Blob */ (form.get(item.name)));
    }
    this[notifyChange]();
    this.requestUpdate();
  }

  /**
   * @return {TemplateResult}
   */
  render() {
    if (!hasSupport) {
      return html`<p>This browser does not support this editor</p>`;
    }
    const { ignoreContentType } = this;
    return html`
    ${this[formTemplate]()}
    ${this[addParamTemplate]()}
    ${ignoreContentType ? '' : html`<p class="mime-info">
      <arc-icon icon="info" class="info"></arc-icon>
      The content-type header will be updated for this request when the HTTP message is generated.
    </p>`}
    `;
  }

  [addParamTemplate]() {
    const { anypoint, readOnly, disabled } = this;
    return html`
    <div class="form-actions">
      <anypoint-button
        emphasis="medium"
        @click="${this[addFile]}"
        class="add-param file-part"
        ?anypoint="${anypoint}"
        ?disabled="${readOnly || disabled}"
      >
        Add file part
      </anypoint-button>
      <anypoint-button
        emphasis="medium"
        @click="${this[addText]}"
        class="add-param text-part"
        ?anypoint="${anypoint}"
        ?disabled="${readOnly || disabled}"
      >
        Add text part
      </anypoint-button>
    </div>`
  }

  /**
   * @return {TemplateResult}
   */
  [formTemplate]() {
    const items = /** @type MultipartBody[] */ (this[internalModel] || []);
    if (!Array.isArray(items) || !items.length) {
      return html`<p class="empty-list">Add a part to the list</p>`;
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
   * @param {MultipartBody} part The form part
   * @param {number} index The index on the list
   * @return {TemplateResult}
   */
  [paramItemTemplate](part, index) {
    let tpl;
    if (part.isFile) {
      tpl = this[filePartTemplate](part, index);
    } else {
      tpl = this[textPartTemplate](part, index);
    }
    return html`
    <div class="form-row">
      ${this[paramToggleTemplate](part, index)}
      ${tpl}
      ${this[paramRemoveTemplate](index)}
    </div>
    `;
  }

  /**
   * @param {MultipartBody} part The form part
   * @param {number} index The index on the list
   * @return {TemplateResult} A template for the file part
   */
  [filePartTemplate](part, index) {
    const { anypoint, outlined, readOnly } = this;
    const typedValue = /** @type File */ (/** @type any */ (part.value));
    return html`
    <anypoint-input
      autoValidate
      required
      .value="${part.name}"
      data-property="name"
      data-index="${index}"
      class="param-name"
      ?anypoint="${anypoint}"
      ?outlined="${outlined}"
      ?readOnly="${readOnly}"
      noLabelFloat
      @change="${this[filePartNameHandler]}"
    >
      <label slot="label">Part name</label>
    </anypoint-input>
    <div class="param-value">
      <anypoint-button @click="${this[pickFileHandler]}">Choose file</anypoint-button>
      <input type="file" hidden data-index="${index}" @change="${this[filePartValueHandler]}"/>
      ${typedValue ? html`<span class="file-info">${typedValue.name} (${typedValue.type}), ${typedValue.size} bytes</span>` : ''}
    </div>
    `;
  }

  /**
   * @param {MultipartBody} part The form part
   * @param {number} index The index on the list
   * @return {TemplateResult} A template for the text part
   */
  [textPartTemplate](part, index) {
    const { anypoint, outlined, readOnly } = this;
    return html`
    <anypoint-input
      autoValidate
      required
      .value="${part.name}"
      data-property="name"
      data-index="${index}"
      class="param-name"
      ?anypoint="${anypoint}"
      ?outlined="${outlined}"
      ?readOnly="${readOnly}"
      noLabelFloat
      @change="${this[textPartNameHandler]}"
    >
      <label slot="label">Part name</label>
    </anypoint-input>

    <anypoint-input
      autoValidate
      required
      .value="${part.value}"
      data-property="value"
      data-index="${index}"
      class="param-value"
      ?anypoint="${anypoint}"
      ?outlined="${outlined}"
      ?readOnly="${readOnly}"
      noLabelFloat
      @change="${this[textPartValueHandler]}"
    >
      <label slot="label">Part value</label>
    </anypoint-input>
    <anypoint-input
      .value="${part.type}"
      data-property="type"
      data-index="${index}"
      class="param-type"
      ?anypoint="${anypoint}"
      ?outlined="${outlined}"
      ?readOnly="${readOnly}"
      noLabelFloat
      @change="${this[textPartValueHandler]}"
    >
      <label slot="label">Part mime (optional)</label>
    </anypoint-input>
    `;
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
      @click="${this[removeParamHandler]}"
      title="Remove this parameter"
      aria-label="Activate to remove this item"
      ?disabled="${readOnly}"
      ?anypoint="${anypoint}"
      data-action="remove"
    >
      <arc-icon icon="removeCircleOutline"></arc-icon>
    </anypoint-icon-button>
    `;
  }

  /**
   * @param {MultipartBody} item
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
}
