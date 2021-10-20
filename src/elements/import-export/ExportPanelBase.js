import { LitElement, html } from 'lit-element';
import '@anypoint-web-components/awc/anypoint-listbox.js';
import '@anypoint-web-components/awc/anypoint-icon-item.js';
import '@anypoint-web-components/awc/anypoint-autocomplete.js';
import '@anypoint-web-components/awc/anypoint-input.js';
import '@anypoint-web-components/awc/anypoint-masked-input.js';
import '@anypoint-web-components/awc/anypoint-dropdown-menu.js';
import '@anypoint-web-components/awc/anypoint-checkbox.js';
import {
  GoogleDriveEvents,
  GoogleDriveEventTypes,
} from '@advanced-rest-client/events';
import '@advanced-rest-client/icons/arc-icon.js';

/** @typedef {import('@advanced-rest-client/events').GoogleDrive.AppFolder} AppFolder */
/** @typedef {import('@advanced-rest-client/events').DataExport.ProviderOptions} ProviderOptions */
/** @typedef {import('@advanced-rest-client/events').DataExport.ExportOptions} ExportOptions */
/** @typedef {import('@anypoint-web-components/awc').Suggestion} Suggestion */
/** @typedef {import('@anypoint-web-components/awc').AnypointInputElement} AnypointInputElement */

export const destinationTemplate = Symbol('destinationTemplate');
export const fileInputTemplate = Symbol('fileInputTemplate');
export const driveInputTemplate = Symbol('driveInputTemplate');
export const encryptionPasswordTemplate = Symbol('encryptionPasswordTemplate');
export const encryptionTemplate = Symbol('encryptionTemplate');
export const skipImportTemplate = Symbol('skipImportTemplate');
export const buildExportOptions = Symbol('buildExportOptions');
export const buildProviderOptions = Symbol('buildProviderOptions');
export const driveFoldersChanged = Symbol('driveFoldersChanged');
export const driveSuggestionsValue = Symbol('driveSuggestionsValue');
export const parentNameValue = Symbol('parentNameValue');
export const inputHandler = Symbol('inputHandler');
export const parentsInputHandler = Symbol('parentsInputHandler');
const gdrivelistHandlerValue = Symbol('gdrivelistHandlerValue');
const providerValue = Symbol('providerValue');
const isDriveChanged = Symbol('isDriveChanged');
const listDriveFolders = Symbol('listDriveFolders');
const driveFoldersValue = Symbol('driveFoldersValue');
const checkedHandler = Symbol('checkedHandler');
const destinationHandler = Symbol('destinationHandler');

/**
 * @param {Event} e
 */
function stopEvent(e) {
  e.stopPropagation();
}

export class ExportPanelBase extends LitElement {
  static get properties() {
    return {
      /**
       * Export file name.
       */
      file: { type: String },
      /**
       * The identifier of the parent. It can be a file path for local filesystem
       * or Google Drive folder name.
       */
      parentId: { type: String },
      /**
       * Export provider. By default it is `drive` or `file`.
       */
      provider: { type: String },
      /**
       * Tells the application to set configuration on the export file to
       * skip import and insert project directly into workspace.
       */
      skipImport: { type: Boolean },
      /**
       * Computed value, true when current provider is Google Drive.
       */
      isDrive: { type: Boolean },
      /**
       * List of Google Drive folders created by this application.
       */
      driveFolders: { type: Array },
      /**
       * Enables Anypoint theme
       */
      anypoint: { type: Boolean },
      /**
       * Enables outlined theme.
       */
      outlined: { type: Boolean },
      /**
       * When set the encrypt file option is enabled.
       */
      encryptFile: { type: Boolean },
      /**
       * Encryption passphrase
       */
      passphrase: { type: String },
      /**
       * When set it renders encryption options.
       */
      withEncrypt: { type: Boolean },
    };
  }

  get provider() {
    return this[providerValue];
  }

  set provider(value) {
    const old = this[providerValue];
    if (old === value) {
      return;
    }
    this[providerValue] = value;
    this.requestUpdate('provider', value);
    this.isDrive = value === 'drive';
    this[isDriveChanged]();
  }

  get driveFolders() {
    return this[driveFoldersValue];
  }

  set driveFolders(value) {
    const old = this[driveFoldersValue];
    if (old === value) {
      return;
    }
    this[driveFoldersValue] = value;
    this[driveFoldersChanged](value);
  }

  /**
   * @return {EventListener} Previously registered handler for `googledrivelistappfolders` event
   */
  get ongoogledrivelistappfolders() {
    return this[gdrivelistHandlerValue];
  }

  /**
   * Registers a callback function for `googledrivelistappfolders` event
   * @param {EventListener} value A callback to register. Pass `null` or `undefined`
   * to clear the listener.
   */
  set ongoogledrivelistappfolders(value) {
    if (this[gdrivelistHandlerValue]) {
      this.removeEventListener(GoogleDriveEventTypes.listAppFolders, this[gdrivelistHandlerValue]);
    }
    if (typeof value !== 'function') {
      this[gdrivelistHandlerValue] = null;
      return;
    }
    this[gdrivelistHandlerValue] = value;
    this.addEventListener(GoogleDriveEventTypes.listAppFolders, value);
  }

  constructor() {
    super();
    this.isDrive = false;
    this.anypoint = false;
    this.outlined = false;
    this.encryptFile = false;
    this.withEncrypt = false;
    this.skipImport = false;
    this.passphrase = undefined;
    this.file = undefined;
    this.parentId = undefined;
    this[parentNameValue] = undefined;
  }

  connectedCallback() {
    super.connectedCallback();
    setTimeout(() => {
      if (this.provider === 'drive' && !this.driveFolders) {
        this[listDriveFolders]();
      }
    });
  }

  /**
   * Checks whether the current for is valid.
   * @returns {boolean} True when the current form is valid.
   */
  validate() {
    const required = /** @type AnypointInputElement[] */ (Array.from(this.shadowRoot.querySelectorAll('[required]')));
    let valid = true;
    // iterates over all so each can re-validate.
    required.forEach((input) => {
      if (!input.validate()) {
        valid = false;
      }
    });
    return valid;
  }

  /**
   * @returns {ExportOptions}
   */
  [buildExportOptions]() {
    const exportOptions = /** @type ExportOptions */ ({
      provider: this.provider,
      skipImport: this.skipImport,
    });
    if (this.encryptFile) {
      exportOptions.encrypt = true;
      exportOptions.passphrase = this.passphrase;
    }
    return exportOptions;
  }

  /**
   * @returns {ProviderOptions}
   */
  [buildProviderOptions]() {
    const providerOptions = /** @type ProviderOptions */ ({
      file: this.file,
    });
    if (this.isDrive && this.parentId) {
      providerOptions.parent = this.parentId;
    }
    return providerOptions;
  }

  /**
   * Called automatically when `isDrive` property change.
   * Dispatches `resize` custom event so parent elements can position this element
   * in e.g dialogs.
   */
  [isDriveChanged]() {
    this.dispatchEvent(new CustomEvent('resize', {
      bubbles: true,
      composed: true
    }));
    if (this.isDrive) {
      this[listDriveFolders]();
    }
  }

  /**
   * Attempts to read application settings by dispatching `settings-read`
   * with type `google-drive`. It expects to return `appFolders` with a list
   * of folder created by the app. This value is set as a suggestions on
   * folder input.
   * @return {Promise} This function is called automatically, this returns is
   * for tests.
   */
  async [listDriveFolders]() {
    if (!this.parentElement) {
      return;
    }
    this.driveFolders = undefined;
    try {
      const folders = await GoogleDriveEvents.listAppFolders(this);
      this.driveFolders = folders && folders.length ? folders : undefined;
    } catch (_) {
      this.driveFolders = undefined;
    }
  }

  /**
   * Transforms AppFolder model into the suggestions value.
   *
   * @param {AppFolder[]} folders List of application folders.
   */
  [driveFoldersChanged](folders) {
    if (!Array.isArray(folders) || !folders.length) {
      this[driveSuggestionsValue] = undefined;
      this.requestUpdate();
      return;
    }
    const result = /** @type Suggestion[] */ ([]);
    const { parentId } = this;
    folders.forEach((folder) => {
      if (!folder || !folder.id || !folder.name) {
        return;
      }
      const suggestion = /** @type Suggestion */ ({
        value: folder.name,
      });
      result[result.length] = suggestion;
      if (parentId && parentId === folder.id) {
        this[parentNameValue] = folder.name;
      }
    });
    this[driveSuggestionsValue] = result;
    this.requestUpdate();
  }

  /**
   * @param {CustomEvent} e
   */
  [inputHandler](e) {
    const input = /** @type AnypointInputElement */ (e.target);
    const { name, value } = input;
    this[name] = value;
  }

  /**
   * @param {CustomEvent} e
   */
  [parentsInputHandler](e) {
    const input = /** @type AnypointInputElement */ (e.target);
    let { value } = input;
    this[parentNameValue] = value;
    const folders = /** @type AppFolder[] */ (this.driveFolders || []);
    const folder = folders.find((item) => item.name === value);
    if (folder) {
      value = folder.id;
    }
    this.parentId = value;
  }

  [checkedHandler](e) {
    const { name, checked } = e.target;
    this[name] = checked;
  }

  [destinationHandler](e) {
    this.provider = e.target.selected;
  }

  [driveInputTemplate]() {
    if (!this.isDrive) {
      return '';
    }
    const {
      anypoint,
      outlined,
    } = this;
    const target = 'parentInput';
    return html`
    <div class="autocomplete-input">
      <anypoint-input
        id="parentInput"
        name="parentId"
        .value="${this[parentNameValue]}"
        @input="${this[parentsInputHandler]}"
        ?outlined="${outlined}"
        ?anypoint="${anypoint}"
      >
        <label slot="label">Google Drive folder (optional)</label>
      </anypoint-input>
      <anypoint-autocomplete
        .target="${target}"
        .source="${this[driveSuggestionsValue]}"
        ?anypoint="${anypoint}"
        @overlay-opened="${stopEvent}"
        @overlay-closed="${stopEvent}"
      ></anypoint-autocomplete>
    </div>
    `;
  }

  [destinationTemplate]() {
    const {
      provider,
      anypoint,
      outlined
    } = this;
    return html`<anypoint-dropdown-menu
      class="provider-selector"
      name="provider"
      @select="${this[destinationHandler]}"
      ?anypoint="${anypoint}"
      ?outlined="${outlined}"
    >
      <label slot="label">Destination</label>
      <anypoint-listbox
        slot="dropdown-content"
        .selected="${provider}"
        attrforselected="data-value"
        ?anypoint="${anypoint}">
        <anypoint-icon-item
          class="menu-item"
          data-value="file"
          ?anypoint="${anypoint}"
        >
          <arc-icon class="icon" icon="archive" slot="item-icon"></arc-icon>
          Export to file
        </anypoint-icon-item>
        <anypoint-icon-item
          class="menu-item"
          data-value="drive"
          ?anypoint="${anypoint}"
        >
          <arc-icon class="icon" icon="driveColor" slot="item-icon"></arc-icon>
          Export to Google Drive
        </anypoint-icon-item>
        <slot name="export-option"></slot>
      </anypoint-listbox>
    </anypoint-dropdown-menu>`;
  }

  [skipImportTemplate]() {
    const { skipImport } = this;
    return html`
    <anypoint-checkbox
      .checked="${skipImport}"
      name="skipImport"
      @checkedchange="${this[checkedHandler]}"
      title="With this option the file will be read directly to the application instead of showing the import panel."
    >
      Skip import dialog
    </anypoint-checkbox>`;
  }

  [encryptionTemplate]() {
    if (!this.withEncrypt) {
      return '';
    }
    const { encryptFile } = this;
    return html`
    <anypoint-checkbox
      .checked="${encryptFile}"
      name="encryptFile"
      @checkedchange="${this[checkedHandler]}"
      title="Encrypts the file with password so it is not store in plain text."
    >
      Encrypt file
    </anypoint-checkbox>
    `;
  }

  [encryptionPasswordTemplate]() {
    if (!this.encryptFile) {
      return '';
    }
    const {
      passphrase
    } = this;
    return html`
    <anypoint-masked-input
      name="passphrase"
      .value="${passphrase}"
      @valuechange="${this[inputHandler]}"
      required
      autoValidate
      invalidMessage="The passphrase is required"
    >
      <label slot="label">Encryption passphrase</label>
    </anypoint-masked-input>`;
  }

  [fileInputTemplate]() {
    const {
      file,
      anypoint,
      outlined
    } = this;
    return html`
    <anypoint-input
      name="file"
      autocomplete="on"
      .value="${file}"
      @input="${this[inputHandler]}"
      required
      autoValidate
      invalidMessage="File name is required"
      ?anypoint="${anypoint}"
      ?outlined="${outlined}"
    >
      <label slot="label">File name</label>
    </anypoint-input>
    `;
  }
}
