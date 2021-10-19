import { html } from 'lit-element';
import '@anypoint-web-components/awc/anypoint-button.js';
import elementStyles from '../styles/ExportOptions.js';
import {
  ExportPanelBase,
  buildExportOptions,
  buildProviderOptions,
  encryptionPasswordTemplate,
  driveInputTemplate,
  destinationTemplate,
  encryptionTemplate,
  skipImportTemplate,
  fileInputTemplate,
} from './ExportPanelBase.js'

const acceptHandlerValue = Symbol('acceptHandlerValue');
const cancelHandlerValue = Symbol('cancelHandlerValue');
const resizeHandlerValue = Symbol('resizeHandlerValue');

/** @typedef {import('@advanced-rest-client/arc-types').GoogleDrive.AppFolder} AppFolder */
/** @typedef {import('@advanced-rest-client/arc-types').DataExport.ProviderOptions} ProviderOptions */
/** @typedef {import('@advanced-rest-client/arc-types').DataExport.ExportOptions} ExportOptions */

/**
 * `export-options`
 *
 * Export options dialog for Advanced REST Client.
 */
export class ExportOptionsElement extends ExportPanelBase {
  static get styles() {
    return elementStyles;
  }

  /**
   * @return {EventListener} Previously registered handler for `accept` event
   */
  get onaccept() {
    return this[acceptHandlerValue];
  }

  /**
   * Registers a callback function for `accept` event
   * @param {EventListener} value A callback to register. Pass `null` or `undefined`
   * to clear the listener.
   */
  set onaccept(value) {
    if (this[acceptHandlerValue]) {
      this.removeEventListener('accept', this[acceptHandlerValue]);
    }
    if (typeof value !== 'function') {
      this[acceptHandlerValue] = null;
      return;
    }
    this[acceptHandlerValue] = value;
    this.addEventListener('accept', value);
  }

  /**
   * @return {EventListener} Previously registered handler for `cancel` event
   */
  get oncancel() {
    return this[cancelHandlerValue];
  }

  /**
   * Registers a callback function for `cancel` event
   * @param {EventListener} value A callback to register. Pass `null` or `undefined`
   * to clear the listener.
   */
  set oncancel(value) {
    if (this[cancelHandlerValue]) {
      this.removeEventListener('cancel', this[cancelHandlerValue]);
    }
    if (typeof value !== 'function') {
      this[cancelHandlerValue] = null;
      return;
    }
    this[cancelHandlerValue] = value;
    this.addEventListener('cancel', value);
  }

  get onresize() {
    return this[resizeHandlerValue];
  }

  /**
   * Registers a callback function for `resize` event
   * @param {EventListener} value A callback to register. Pass `null` or `undefined`
   * to clear the listener.
   */
  set onresize(value) {
    if (this[resizeHandlerValue]) {
      this.removeEventListener('resize', this[resizeHandlerValue]);
    }
    if (typeof value !== 'function') {
      this[resizeHandlerValue] = null;
      return;
    }
    this[resizeHandlerValue] = value;
    this.addEventListener('resize', value);
  }

  /**
   * Confirm the dialog
   */
  confirm() {
    if (!this.validate()) {
      return;
    }
    const exportOptions = this[buildExportOptions]();
    const providerOptions = this[buildProviderOptions]();

    this.dispatchEvent(new CustomEvent('accept', {
      detail: {
        exportOptions,
        providerOptions,
      }
    }));
  }

  /**
   * Cancels the dialog
   */
  cancel() {
    this.dispatchEvent(new CustomEvent('cancel'));
  }

  render() {
    return html`
    <h3>Export options</h3>
    <form method="POST" autocomplete="on">
      <div class="toggle-option">
        ${this[skipImportTemplate]()}
        ${this[encryptionTemplate]()}
      </div>
      ${this[encryptionPasswordTemplate]()}
      ${this[destinationTemplate]()}
      ${this[fileInputTemplate]()}
      ${this[driveInputTemplate]()}
      <div class="actions">
        <anypoint-button @click="${this.cancel}">Cancel</anypoint-button>
        <anypoint-button @click="${this.confirm}" class="action-button">Export</anypoint-button>
      </div>
    </form>`;
  }
}
