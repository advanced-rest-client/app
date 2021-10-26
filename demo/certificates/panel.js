/* eslint-disable no-param-reassign */
import { html } from 'lit-html';
import { DemoPage } from '@advanced-rest-client/arc-demo-helper';
import { ImportEvents, ArcModelEvents } from '@advanced-rest-client/events';
import { ArcMock } from '@advanced-rest-client/arc-mock';
import listenEncoding from '@advanced-rest-client/arc-demo-helper/src/EncodingHelpers.js';
import { ExportHandlerMixin } from '@advanced-rest-client/arc-demo-helper/src/ExportHandlerMixin.js';
import { ClientCertificateModel, ArcDataExport, MockedStore } from '@advanced-rest-client/idb-store';
import '@advanced-rest-client/arc-demo-helper/arc-interactive-demo.js';
import '@anypoint-web-components/awc/anypoint-button.js';
import '@anypoint-web-components/awc/anypoint-radio-button.js';
import '@anypoint-web-components/awc/anypoint-radio-group.js';
import '../../define/client-certificates-panel.js';

/** @typedef {import('@advanced-rest-client/events').ArcDecryptEvent} ArcDecryptEvent */
/** @typedef {import('@advanced-rest-client/events').ArcEncryptEvent} ArcEncryptEvent */
/** @typedef {import('@advanced-rest-client/events').ArcExportFilesystemEvent} ArcExportFilesystemEvent */
/** @typedef {import('@advanced-rest-client/events').GoogleDriveSaveEvent} GoogleDriveSaveEvent */

class ComponentPage extends ExportHandlerMixin(DemoPage) {
  constructor() {
    super();
    this.initObservableProperties([
      'outlined',
      'listType',
    ]);
    
    this.componentName = 'Client certificates panel';
    this.demoStates = ['Filles', 'Outlined', 'Anypoint'];
    this.listType = 'default';
    this.generator = new ArcMock();
    this.store = new MockedStore();
    this.model = new ClientCertificateModel();
    this.model.listen(window);
    this.exporter = new ArcDataExport(window);
    this.exporter.listen();
    this.exporter.appVersion = "demo-page";

    listenEncoding();
  }

  async generateData() {
    await this.store.insertCertificates();
    ImportEvents.dataImported(document.body);
  }

  async deleteData() {
    ArcModelEvents.destroy(document.body, ['client-certificates']);
  }

  _demoStateHandler(e) {
    const state = e.detail.value;
    this.demoState = state;
    this.outlined = state === 1;
    this.anypoint = state === 2;
    this._updateAnypoint();
  }

  _listTypeHandler(e) {
    const { name, checked } = e.target;
    if (!checked) {
      return;
    }
    this.listType = name;
  }

  _demoTemplate() {
    const {
      demoStates,
      darkThemeActive,
      anypoint,
      outlined,
    } = this;
    return html`
      <section class="documentation-section">
        <h3>Interactive demo</h3>
        <p>
          This demo lets you preview the certificates panel element with various
          configuration options.
        </p>

        <arc-interactive-demo
          .states="${demoStates}"
          @state-changed="${this._demoStateHandler}"
          ?dark="${darkThemeActive}"
          noOptions
        >

          <client-certificates-panel
            ?anypoint="${anypoint}"
            ?outlined="${outlined}"
            slot="content"
          ></client-certificates-panel>

        </arc-interactive-demo>

        <div class="data-options">
          <h3>Data options</h3>

          <anypoint-button @click="${this.generateData}">Generate data</anypoint-button>
          <anypoint-button @click="${this.deleteData}">Clear data</anypoint-button>
        </div>
      </section>
    `;
  }

  contentTemplate() {
    return html`
      <h2>Client certificates screen</h2>
      ${this._demoTemplate()}
      ${this.exportTemplate()}
    `;
  }
}

const instance = new ComponentPage();
instance.render();
