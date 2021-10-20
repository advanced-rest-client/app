import { html } from 'lit-html';
import { DemoPage } from '@advanced-rest-client/arc-demo-helper';
import '@advanced-rest-client/arc-demo-helper/arc-interactive-demo.js';
import '@anypoint-web-components/awc/anypoint-checkbox.js';
import '@anypoint-web-components/awc/anypoint-icon-item.js';
import { ArcDataExport } from '@advanced-rest-client/idb-store';
import {
  DataExportEventTypes,
  GoogleDriveEventTypes,
  EncryptionEventTypes,
} from '@advanced-rest-client/events';
import '../../define/arc-export-form.js';

/** @typedef {import('@advanced-rest-client/events').GoogleDriveSaveEvent} GoogleDriveSaveEvent */
/** @typedef {import('@advanced-rest-client/events').ArcExportFilesystemEvent} ArcExportFilesystemEvent */
/** @typedef {import('@advanced-rest-client/events').ArcEncryptEvent} ArcEncryptEvent */

class ComponentDemoPage extends DemoPage {
  constructor() {
    super();
    this.initObservableProperties([
      'compatibility',
      'outlined',
      'withEncrypt'
    ]);
    this.componentName = 'export-form';
    this.withEncrypt = false;
    this.demoStates = ['Filled', 'Outlined', 'Anypoint'];
    this.exportFactory = new ArcDataExport(window);
    this.exportFactory.listen();

    window.addEventListener(DataExportEventTypes.fileSave, this._fileExportHandler.bind(this));
    window.addEventListener(EncryptionEventTypes.encrypt, this._encodeHandler.bind(this));
    window.addEventListener(GoogleDriveEventTypes.save, this._driveExportHandler.bind(this));
    window.addEventListener(GoogleDriveEventTypes.listAppFolders, this._listFoldersHandler.bind(this));
  }

  _demoStateHandler(e) {
    const state = e.detail.value;
    this.outlined = state === 1;
    this.compatibility = state === 2;
    this._updateCompatibility();
  }

  /**
   * @param {ArcExportFilesystemEvent} e
   */
  _fileExportHandler(e) {
    e.preventDefault();
    e.detail.result = Promise.resolve({
      success: true,
      interrupted: false,
      parentId: e.providerOptions.parent,
      fileId: e.providerOptions.file,
    });
    console.log(e.providerOptions, e.data);
  }

  /**
   * @param {GoogleDriveSaveEvent} e
   */
  _driveExportHandler(e) {
    e.preventDefault();
    e.detail.result = Promise.resolve({
      success: true,
      interrupted: false,
      parentId: e.providerOptions.parent,
      fileId: e.providerOptions.file,
    });
    console.log(e.providerOptions, e.data);
  }

  /**
   * @param {ArcEncryptEvent} e
   */
  _encodeHandler(e) {
    e.preventDefault();
    const { data, passphrase } = e;
    e.detail.result = this.encodeAes(data, passphrase);
  }

  async encodeAes(data, passphrase) {
    // see https://gist.github.com/chrisveness/43bcda93af9f646d083fad678071b90a
    const pwUtf8 = new TextEncoder().encode(passphrase);
    const pwHash = await crypto.subtle.digest('SHA-256', pwUtf8);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const alg = { name: 'AES-GCM', iv };
    // @ts-ignore
    const key = await crypto.subtle.importKey('raw', pwHash, alg, false, ['encrypt']);
    const ptUint8 = new TextEncoder().encode(data);
    const ctBuffer = await crypto.subtle.encrypt(alg, key, ptUint8);
    const ctArray = Array.from(new Uint8Array(ctBuffer));
    const ctStr = ctArray.map(byte => String.fromCharCode(byte)).join('');
    const ctBase64 = btoa(ctStr);
    const ivHex = Array.from(iv).map(b => (`00${b.toString(16)}`).slice(-2)).join('');
    return ivHex+ctBase64;
  }

  _listFoldersHandler(e) {
    e.preventDefault();
    e.detail.result = Promise.resolve([{
      name: 'My APIs',
      id: 'folder1'
    }, {
      name: 'Company\'s APIs',
      id: 'folder2'
    }, {
      name: 'Developing',
      id: 'folder3'
    }]);
  }

  _demoTemplate() {
    const {
      demoStates,
      darkThemeActive,
      compatibility,
      outlined,
      withEncrypt
    } = this;
    return html`
      <section class="documentation-section">
        <h3>Interactive demo</h3>
        <p>
          This demo lets you preview the export panel element with various
          configuration options.
        </p>
        <arc-interactive-demo
          .states="${demoStates}"
          @state-changed="${this._demoStateHandler}"
          ?dark="${darkThemeActive}"
        >
          <arc-export-form
            ?compatibility="${compatibility}"
            ?outlined="${outlined}"
            ?withEncrypt="${withEncrypt}"
            provider="drive"
            parentId="folder3"
            slot="content"
          >
          </arc-export-form>
          <label slot="options" id="mainOptionsLabel">Options</label>
          <anypoint-checkbox
            aria-describedby="mainOptionsLabel"
            slot="options"
            name="withEncrypt"
            @change="${this._toggleMainOption}"
          >
            With encrypt
          </anypoint-checkbox>
        </arc-interactive-demo>
      </section>
    `;
  }

  _introductionTemplate() {
    return html`
      <section class="documentation-section">
        <h3>Introduction</h3>
        <p>
          Advanced REST Client data export panel.
          Contains the UI that allows the user to pick data to export
        </p>
      </section>
    `;
  }

  _usageTemplate() {
    return html`
      <section class="documentation-section">
        <h2>Usage</h2>
        <p>The export panel comes with 2 predefined styles:</p>
        <ul>
          <li><b>Material</b> - Normal state</li>
          <li>
            <b>Compatibility</b> - To provide compatibility with Anypoint design
          </li>
        </ul>
        <p>
          Export panel works with <code>arc-data-export</code> to generate
          export data. Different versions of ARC can have multiple implementation
          of this module. The communication between the components is by using
          custom events.
        </p>
      </section>
    `;
  }

  contentTemplate() {
    return html`
      <arc-data-export appversion="demo-app"></arc-data-export>
      <h2>The export panel</h2>
      ${this._demoTemplate()}
      ${this._introductionTemplate()}
      ${this._usageTemplate()}
    `;
  }
}

const instance = new ComponentDemoPage();
instance.render();
