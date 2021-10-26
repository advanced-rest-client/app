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
import { TelemetryEvents, ArcModelEvents } from '@advanced-rest-client/events';
import '@advanced-rest-client/icons/arc-icon.js';
import '@anypoint-web-components/awc/anypoint-button.js';
import '@anypoint-web-components/awc/anypoint-icon-button.js';
import '@anypoint-web-components/awc/anypoint-input.js';
import '@anypoint-web-components/awc/anypoint-masked-input.js';
import '@anypoint-web-components/awc/anypoint-switch.js';
import elementStyles from './styles/CertificateImport.js';

/** @typedef {import('lit-element').TemplateResult} TemplateResult */
/** @typedef {import('@advanced-rest-client/events').ClientCertificate.ClientCertificate} ClientCertificate */
/** @typedef {import('@advanced-rest-client/events').ClientCertificate.Certificate} Certificate */

export const startScreenTemplate = Symbol('startScreenTemplate');
export const headerTemplate = Symbol('headerTemplate');
export const certTypeButton = Symbol('certTypeButton');
export const importTypeHandler = Symbol('importTypeHandler');
export const importTypeClickHandler = Symbol('importTypeClickHandler');
export const filesFormTemplate = Symbol('filesFormTemplate');
export const inputHandler = Symbol('inputHandler');
export const passwordFiledTemplate = Symbol('passwordFiledTemplate');
export const certificateInput = Symbol('certificateInput');
export const selectCertFileHandler = Symbol('selectCertFileHandler');
export const selectKeyFileHandler = Symbol('selectKeyFileHandler');
export const keyInputTemplate = Symbol('keyInputTemplate');
export const certFileHandler = Symbol('certFileHandler');
export const keyFileHandler = Symbol('keyFileHandler');
export const clearCertHandler = Symbol('clearCertHandler');
export const clearKeyHandler = Symbol('clearKeyHandler');
export const certPasswordTemplate = Symbol('certPasswordTemplate');
export const keyInfoTemplate = Symbol('keyInfoTemplate');
export const certificateInfoTemplate = Symbol('certificateInfoTemplate');
export const importHandler = Symbol('importHandler');
export const keyPassChangeHandler = Symbol('keyPassChangeHandler');
export const certPassChangeHandler = Symbol('certPassChangeHandler');
export const keyTemplate = Symbol('keyTemplate');
export const errorTemplate = Symbol('errorTemplate');

/**
 * A view to import a client certificate into the application.
 */
export default class CertificateImportElement extends LitElement {
  static get styles() {
    return elementStyles;
  }

  static get properties() {
    return {
      /**
       * Enables outlined theme.
       */
      outlined: { type: Boolean },
      /**
       * Enables Anypoint theme.
       */
      anypoint: { type: Boolean },
      /**
       * Either `pem` or `p12`.
       */
      importType: { type: String },
      /**
       * Import name
       */
      name: { type: String },
      /**
       * True when the user clicked on the import button
       */
      loading: { type: Boolean },

      page: { type: Number },

      certificateFile: { type: Object },

      keyFile: { type: Object },

      /** 
       * The password for the certificate to use.
       */
      certificatePassword: { type: String },

      /** 
       * The password for the key certificate to use.
       */
      keyPassword: { type: String },

      /** 
       * Whether the certificate file is password protected,
       */
      certificateHasPassword: { type: Boolean },

      /** 
       * Whether the key file is password protected,
       */
      keyHasPassword: { type: Boolean },

      /** 
       * The error message to render, if any.
       */
      errorMessage: { type: String },
    };
  }

  get hasKeyImport() {
    return this.importType === 'pem';
  }

  get hasKeyPasswordInput() {
    return this.importType === 'p12';
  }

  get acceptDisabled() {
    return !!this.loading || this.importInvalid;
  }

  get importInvalid() {
    if (!this.certificateFile) {
      return true;
    }
    if (this.hasKeyImport && !this.keyFile) {
      return true;
    }
    return false;
  }

  constructor() {
    super();
    this.anypoint = false;
    this.outlined = false;
    this.noAutoQueryCertificates = true;
    this.page = 0;

    /** 
     * @type {string}
     */
    this.certificatePassword = undefined;
    /** 
     * @type {string}
     */
    this.keyPassword = undefined;
    /** 
     * @type {File}
     */
    this.certificateFile = undefined;
    /** 
     * @type {File}
     */
    this.keyFile = undefined;
    /** 
     * @type {string}
     */
    this.name = undefined;
  }

  /**
   * @param {TransitionEvent} e 
   */
  [importTypeHandler](e) {
    const { propertyName, target } = e;
    if (propertyName !== undefined) {
      // material-ripple dispatches `transitionend` as a custom event
      // which has no propertyName on it.
      return;
    }
    const node = /** @type HTMLElement */ (target);
    this.importType = node.dataset.type;
    this.page = 1;
    TelemetryEvents.view(this, `import-certificate-${this.importType}`);
  }

  [importTypeClickHandler](e) {
    if (this.anypoint) {
      this[importTypeHandler](e);
    }
  }

  /**
   * Dispatches `close` custom event (non-bubbling) to
   * inform that the parent component should hide the UI.
   */
  cancel() {
    this.dispatchEvent(new CustomEvent('close'));
    this.page = 0;
  }

  /**
   * Accepts current user input and imports a certificate if form is valid.
   * When ready it dispatches `close` event.
   * When error occurs it dispatches `error` event with Error object on the detail.
   * @return {Promise}
   */
  async accept() {
    if (this.importInvalid) {
      return;
    }
    TelemetryEvents.event(this, {
      category: 'Certificates',
      action: 'import',
      label: this.importType,
    });
    this.errorMessage = undefined;
    this.loading = true;
    try {
      const value = await this.getConfig();
      const record = await ArcModelEvents.ClientCertificate.insert(this, value);
      if (!record) {
        throw new Error('Certificates model did not handle the event.');
      }
      this.cancel();
    } catch (e) {
      TelemetryEvents.exception(this, e.message, false);
      this.errorMessage = e.message || 'Unknown error';
    }
    this.loading = false;
  }

  /* istanbul ignore next */
  [selectCertFileHandler]() {
    const input = /** @type HTMLInputElement */ (this.shadowRoot.querySelector('#cf'));
    input.click();
  }

  /* istanbul ignore next */
  [selectKeyFileHandler]() {
    const input = /** @type HTMLInputElement */ (this.shadowRoot.querySelector('#kf'));
    input.click();
  }

  [certFileHandler](e) {
    const [file] = e.target.files;
    this.certificateFile = file;
  }

  [keyFileHandler](e) {
    const [file] = e.target.files;
    this.keyFile = file;
  }

  [clearCertHandler]() {
    this.certificateFile = null;
  }

  [clearKeyHandler]() {
    this.keyFile = null;
  }

  [certPassChangeHandler](e) {
    const { checked } = e.target;
    this.certificateHasPassword = checked;
  }

  [keyPassChangeHandler](e) {
    const { checked } = e.target;
    this.keyHasPassword = checked;
  }

  /**
   * Handler for the input field change event.
   * @param {Event} e 
   */
  [inputHandler](e) {
    const input = /** @type HTMLInputElement */ (e.target);
    const { name, value } = input;
    this[name] = value;
  }

  [importHandler]() {
    this.accept();
  }

  /**
   * @returns {Promise<ClientCertificate>}
   */
  async getConfig() {
    const forceBuffer = this.importType === 'p12';
    const certData = forceBuffer ? await this.fileToBuffer(this.certificateFile) : await this.fileToString(this.certificateFile);
    const cert = /** @type Certificate */ ({
      data: certData,
    });
    if (this.certificateHasPassword) {
      // can be an empty password
      cert.passphrase = this.certificatePassword || '';
    }
    const result = /** @type ClientCertificate */ ({
      cert,
      name: this.name || '',
      type: this.importType,
      created: Date.now(),
    });
    if (this.hasKeyImport) {
      // key can only be when `pem` and this type is always string
      const keyData = await this.fileToString(this.keyFile);
      const key = /** @type Certificate */ ({
        data: keyData,
      });
      if (this.keyHasPassword) {
        key.passphrase = this.keyPassword || '';
      }
      result.key = key;
    }
    return result;
  }

  /**
   * Reads file as ArrayBuffer
   * @param {Blob} blob
   * @returns {Promise<Uint8Array>}
   */
  fileToBuffer(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      // @ts-ignore
      reader.onload = (e) => { resolve(new Uint8Array(e.target.result)); };
      /* istanbul ignore next */
      reader.onerror = () => { reject(new Error('Unable to read file')); };
      reader.readAsArrayBuffer(blob);
    });
  }

  /**
   * Reads file as string
   * @param {Blob} blob
   * @returns {Promise<string>}
   */
  fileToString(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      // @ts-ignore
      reader.onload = (e) => { resolve(e.target.result); };
      /* istanbul ignore next */
      reader.onerror = () => { reject(new Error('Unable to read file')); };
      reader.readAsText(blob);
    });
  }

  render() {
    switch(this.page) {
      case 1: return this[filesFormTemplate]();
      default: return this[startScreenTemplate]();
    }
  }

  /**
   * @returns {TemplateResult} The template for the import header
   */
  [headerTemplate]() {
    const { anypoint } = this;
    return html`
    <div class="header">
      <h2>Import a certificate</h2>
      <anypoint-button
        emphasis="low"
        data-action="cancel-header"
        ?anypoint="${anypoint}"
        @click="${this.cancel}"
      >Cancel</anypoint-button>
    </div>`;
  }

  /**
   * @param {string} type The import type
   * @param {string} ico The icon name
   * @param {string} label The label to render
   * @param {string} desc The description of the button action
   * @returns {TemplateResult} A template for the type selector button.
   */
  [certTypeButton](type, ico, label, desc) {
    return html`
    <anypoint-button
      emphasis="medium"
      @transitionend="${this[importTypeHandler]}"
      @click="${this[importTypeClickHandler]}"
      data-type="${type}"
      class="cert-type-option"
      ?anypoint="${this.anypoint}"
    >
      <div class="cert-type-ico">${ico}</div>
      <div class="cert-type-wrap">
        <div class="cert-label">${label}</div>
        <div class="cert-desc">${desc}</div>
      </div>
    </anypoint-button>`;
  }

  /**
   * @returns {TemplateResult|string} The template for import type selector.
   */
  [startScreenTemplate]() {
    return html`
    ${this[headerTemplate]()}
    <p>Certificates are stored securely in the internal data store.</p>
    <div class="type-options">
      ${this[certTypeButton]('p12', 'P12', 'PKCS #12', 'Bundles private key with certificate')}
      ${this[certTypeButton]('pem', 'PEM', 'Privacy-Enhanced Mail', 'Imports key and certificate separately')}
    </div>
    `;
  }

  /**
   * @returns {TemplateResult} The template for the certificate input trigger,
   */
  [certificateInput]() {
    const { anypoint } = this;
    return html`
    <anypoint-button
      emphasis="medium"
      @click="${this[selectCertFileHandler]}"
      ?anypoint="${anypoint}"
    >
      Select the certificate file
    </anypoint-button>`;
  }

  /**
   * @param {File} file Selected certificate file
   * @returns {TemplateResult} The template for the certificate file information
   */
  [certificateInfoTemplate](file) {
    const { anypoint } = this;
    return html`
    ${file.name}
    <anypoint-icon-button
      ?anypoint="${anypoint}"
      @click="${this[clearCertHandler]}"
    >
      <arc-icon icon="deleteIcon"></arc-icon>
    </anypoint-icon-button>
    `;
  }

  /**
   * @param {string} name The input name
   * @param {string} label The label for the input
   * @returns {TemplateResult} A template for an input that has a masked value.
   */
  [passwordFiledTemplate](name, label) {
    const { anypoint, outlined } = this;
    return html`
    <anypoint-masked-input
      name="${name}"
      ?anypoint="${anypoint}"
      ?outlined="${outlined}"
      @change="${this[inputHandler]}"
    >
      <label slot="label">${label}</label>
    </anypoint-masked-input>`;
  }

  /**
   * @param {File} file Selected key file
   * @returns {TemplateResult} The template for the key file information
   */
  [keyInfoTemplate](file) {
    const { anypoint } = this;
    return html`
    ${file.name}
    <anypoint-icon-button
      ?anypoint="${anypoint}"
      @click="${this[clearKeyHandler]}"
    >
      <arc-icon icon="deleteIcon"></arc-icon>
    </anypoint-icon-button>
    `;
  }

  /**
   * @returns {TemplateResult} The template for the key input field.
   */
  [keyInputTemplate]() {
    const { anypoint } = this;
    return html`
    <anypoint-button
      emphasis="medium"
      ?anypoint="${anypoint}"
      @click="${this[selectKeyFileHandler]}"
    >
      Select the private key file
    </anypoint-button>`;
  }

  /**
   * @returns {TemplateResult|string} The template for the certificate password filed 
   */
  [certPasswordTemplate]() {
    if (!this.hasKeyPasswordInput) {
      return '';
    }
    const { anypoint } = this;
    return html`<anypoint-switch
      data-type="cert"
      ?anypoint="${anypoint}"
      @change="${this[certPassChangeHandler]}"
    >Certificate has password</anypoint-switch>
    ${this.certificateHasPassword ? this[passwordFiledTemplate]('certificatePassword', 'Certificate password') : ''}`;
  }

  /**
   * @returns {TemplateResult|string} The template for the key inputs
   */
  [keyTemplate]() {
    if (!this.hasKeyImport) {
      return '';
    }
    const {
      keyFile,
      anypoint
    } = this;
    return html`
    <div class="cert-file" data-type="key">
    ${keyFile ? this[keyInfoTemplate](keyFile) : this[keyInputTemplate]()}
    </div>
    <anypoint-switch
      data-type="key"
      ?anypoint="${anypoint}"
      @change="${this[keyPassChangeHandler]}"
    >Private key has password</anypoint-switch>
    ${this.keyHasPassword ? this[passwordFiledTemplate]('keyPassword', 'Private key password') : ''}`;
  }

  /**
   * @returns {TemplateResult} The template for the inputs form.
   */
  [filesFormTemplate]() {
    const {
      certificateFile,
      acceptDisabled,
      loading,
      anypoint,
      outlined,
      importType = '',
    } = this;
    return html`
    ${this[headerTemplate]()}
    ${this[errorTemplate]()}
    <anypoint-input
      name="name"
      ?anypoint="${anypoint}"
      ?outlined="${outlined}"
      @change="${this[inputHandler]}"
    >
      <label slot="label">${importType.toUpperCase()} certificate name</label>
    </anypoint-input>

    <div class="cert-file" data-type="cert">
    ${certificateFile ? this[certificateInfoTemplate](certificateFile) : this[certificateInput]()}
    </div>
    ${this[certPasswordTemplate]()}
    ${this[keyTemplate]()}

    <div class="action-button">
      <anypoint-button
        emphasis="high"
        data-action="accept"
        @click="${this[importHandler]}"
        ?disabled="${acceptDisabled}"
        ?anypoint="${anypoint}"
      >
        Import
      </anypoint-button>
      ${loading ? html`Working...` : ''}
    </div>

    <input type="file" hidden id="cf" @change="${this[certFileHandler]}"/>
    <input type="file" hidden id="kf" @change="${this[keyFileHandler]}"/>
    `;
  }

  /**
   * @returns {TemplateResult|string} The template for the error message, when set.
   */
  [errorTemplate]() {
    const { errorMessage } = this;
    if (!errorMessage) {
      return '';
    }
    return html`
    <div class="error-message">${errorMessage}</div>
    `;
  }
}
