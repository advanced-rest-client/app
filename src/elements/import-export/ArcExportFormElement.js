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
import { html } from 'lit-element';
import '@anypoint-web-components/awc/anypoint-checkbox.js';
import '@anypoint-web-components/awc/anypoint-dropdown-menu.js';
import '@anypoint-web-components/awc/anypoint-listbox.js';
import '@anypoint-web-components/awc/anypoint-item.js';
import '@anypoint-web-components/awc/anypoint-icon-item.js';
import '@anypoint-web-components/awc/anypoint-button.js';
import '@anypoint-web-components/awc/anypoint-input.js';
import '@anypoint-web-components/awc/anypoint-masked-input.js';
import {
  ExportEvents,
  DataExportEventTypes,
} from '@advanced-rest-client/events';
import elementStyles from '../styles/ExportForm.js';
import {
  ExportPanelBase,
  destinationTemplate,
  fileInputTemplate,
  driveInputTemplate,
  encryptionTemplate,
  skipImportTemplate,
  encryptionPasswordTemplate,
  buildExportOptions,
  buildProviderOptions,
} from './ExportPanelBase.js';
import { generateFileName } from '../../lib/Utils.js';

/** @typedef {import('@anypoint-web-components/awc').AnypointCheckboxElement} AnypointCheckboxElement */
/** @typedef {import('@advanced-rest-client/events').GoogleDrive.AppFolder} AppFolder */
/** @typedef {import('@advanced-rest-client/events').DataExport.ProviderOptions} ProviderOptions */
/** @typedef {import('@advanced-rest-client/events').DataExport.ExportOptions} ExportOptions */
/** @typedef {import('@advanced-rest-client/events').DataExport.ArcExportResult} ArcExportResult */
/** @typedef {import('lit-element').TemplateResult} TemplateResult */

export const loadingProperty = Symbol('loadingProperty');
export const loadingValue = Symbol('loadingValue');
export const loadingChangeHandler = Symbol('loadingChangeHandler');
export const arcnativeexportHandler = Symbol('arcnativeexportHandler');
export const notifySuccess = Symbol('notifySuccess');
export const notifyError = Symbol('notifyError');
export const prepare = Symbol('prepare');
export const successTemplate = Symbol('successTemplate');
export const errorTemplate = Symbol('errorTemplate');
export const isSuccess = Symbol('isSuccess');
export const isError = Symbol('isError');
export const errorMessage = Symbol('errorMessage');

function exportItemsTemplate() {
  return html`
  <anypoint-checkbox name="authdata" checked>Saved passwords</anypoint-checkbox>
  <anypoint-checkbox name="clientcertificates" checked>Client certificates</anypoint-checkbox>
  <anypoint-checkbox name="cookies" checked>Cookies</anypoint-checkbox>
  <anypoint-checkbox name="history" checked>Requests history</anypoint-checkbox>
  <anypoint-checkbox name="hostrules" checked>Host rules</anypoint-checkbox>
  <anypoint-checkbox name="requests" checked>Projects and saved request list</anypoint-checkbox>
  <anypoint-checkbox name="variables" checked>Variables data</anypoint-checkbox>
  <anypoint-checkbox name="websocketurlhistory" checked>Web sockets history</anypoint-checkbox>
  <anypoint-checkbox name="urlhistory" checked>URL history</anypoint-checkbox>
  `;
}
/**
 * Export data form with export flow logic.
 *
 * Provides the UI and and logic to export data from the data store to `destination`
 * export method provider. It uses events API to communicate with other elements.
 *
 * Required elements to be present in the DOM:
 *
 * -   `arc-data-export` - getting data from the datastore
 * -   element that handles `file-data-save` event
 * -   element that handles `google-drive-data-save` event

 * ### Example
 *
 * ```html
 * <arc-data-export app-version="12.0.0" electron-cookies></arc-data-export>
 * <google-drive-upload></google-drive-upload>
 * <file-save></file-save>
 *
 * <export-panel></export-panel>
 * ```
 */
export class ArcExportFormElement extends ExportPanelBase {
  static get styles() {
    return elementStyles;
  }

  get loading() {
    return this[loadingProperty];
  }

  get [loadingProperty]() {
    return this[loadingValue];
  }

  set [loadingProperty](value) {
    const old = this[loadingValue];
    if (old === value) {
      return;
    }
    this[loadingValue] = value;
    this.requestUpdate('loading', old);
    this.dispatchEvent(new CustomEvent('loadingchange'));
  }

  /**
   * @return {EventListener} Previously registered handler for `loading-changed` event
   */
  get onloadingchange() {
    return this[loadingChangeHandler];
  }

  /**
   * Registers a callback function for `loading-changed` event
   * @param {EventListener} value A callback to register. Pass `null` or `undefined`
   * to clear the listener.
   */
  set onloadingchange(value) {
    if (this[loadingChangeHandler]) {
      this.removeEventListener('loadingchange', this[loadingChangeHandler]);
    }
    if (typeof value !== 'function') {
      this[loadingChangeHandler] = null;
      return;
    }
    this[loadingChangeHandler] = value;
    this.addEventListener('loadingchange', value);
  }

  /**
   * @return {EventListener} Previously registered handler for `arc-data-export` event
   */
  get onarcnativeexport() {
    return this[arcnativeexportHandler];
  }

  /**
   * Registers a callback function for `arc-data-export` event
   * @param {EventListener} value A callback to register. Pass `null` or `undefined`
   * to clear the listener.
   */
  set onarcnativeexport(value) {
    if (this[arcnativeexportHandler]) {
      this.removeEventListener(DataExportEventTypes.nativeData, this[arcnativeexportHandler]);
    }
    if (typeof value !== 'function') {
      this[arcnativeexportHandler] = null;
      return;
    }
    this[arcnativeexportHandler] = value;
    this.addEventListener(DataExportEventTypes.nativeData, value);
  }

  constructor() {
    super();
    this.file = generateFileName();
    this[isSuccess] = false;
    this[isError] = false;
    /** @type string */
    this[errorMessage] = undefined;
    this.confirmationMessageTimeout = 7000;
  }

  /**
   * Handler for click event. Calls `startExport()` function.
   */
  [prepare]() {
    this.startExport();
  }

  /**
   * Selects all items on the list.
   */
  selectAll() {
    const nodes = /** @type NodeListOf<AnypointCheckboxElement> */ (this.shadowRoot.querySelectorAll('form anypoint-checkbox[name]'));
    Array.from(nodes).forEach((node) => {
      const option = /** @type AnypointCheckboxElement */ (node);
      option.checked = true;
    })
  }

  /**
   * Uses current form data to start export flow.
   * This function is to expose public API to export data.
   *
   * @return {Promise<ArcExportResult>} A promise resolved when export finishes
   */
  async startExport() {
    const nodes = /** @type NodeListOf<AnypointCheckboxElement> */ (this.shadowRoot.querySelectorAll('form anypoint-checkbox[name]'));
    const data = {};
    Array.from(nodes).forEach((node) => {
      data[node.name] = node.checked;
    });
    const exportOptions = this[buildExportOptions]();
    const providerOptions = this[buildProviderOptions]();
    this[loadingProperty] = true;
    try {
      if (!exportOptions.provider) {
        throw new Error('Export provider is not set');
      }
      if (exportOptions.encrypt && !exportOptions.passphrase) {
        throw new Error('The passphrase is required with encryption.');
      }
      if (!providerOptions.file) {
        throw new Error('The file name is required.');
      }
      const result = await ExportEvents.nativeData(this, data, exportOptions, providerOptions);
      this[notifySuccess]();
      this[loadingProperty] = false;
      return result;
    } catch (cause) {
      this[notifyError](cause.message);
      this[loadingProperty] = false;
      throw cause;
    }
  }

  /**
   * Renders the export confirmation message for some time.
   */
  [notifySuccess]() {
    this[isSuccess] = true;
    this[isError] = false;
    this.requestUpdate();
    setTimeout(() => {
      this[isSuccess] = false;
      this.requestUpdate();
    }, this.confirmationMessageTimeout);
  }

  /**
   * @param {string} message
   */
  [notifyError](message) {
    this[isError] = true;
    this[isSuccess] = false;
    this[errorMessage] = message;
    this.requestUpdate();
  }

  render() {
    const { anypoint } = this;
    return html`
      <div class="toggle-option">
        ${this[skipImportTemplate]()}
        ${this[encryptionTemplate]()}
      </div>
      ${this[encryptionPasswordTemplate]()}
      ${this[destinationTemplate]()}
      ${this[fileInputTemplate]()}
      ${this[driveInputTemplate]()}
      <form>
        <h3>Data to export</h3>
        ${exportItemsTemplate()}
      </form>
      <div class="actions">
        <anypoint-button
          @click="${this[prepare]}"
          emphasis="high"
          ?anypoint="${anypoint}"
          ?disabled="${this[loadingProperty]}"
          class="action-button"
          data-action="export"
        >Export</anypoint-button>
        ${this[loadingProperty] ? html`Exporting data...` : ''}
      </div>
      <p class="prepare-info">Depending on the data size it may take a minute</p>
      ${this[successTemplate]()}
      ${this[errorTemplate]()}
    `;
  }

  /**
   * @returns {TemplateResult|string} The template for the export success confirmation.
   */
  [successTemplate]() {
    if (!this[isSuccess]) {
      return '';
    }
    return html`
    <div class="confirmation success">
      Export complete.
    </div>
    `;
  }

  /**
   * @returns {TemplateResult|string} The template for the export error message.
   */
  [errorTemplate]() {
    if (!this[isError]) {
      return '';
    }
    return html`
    <div class="confirmation error">
      ${this[errorMessage]}
    </div>
    `;
  }
}
