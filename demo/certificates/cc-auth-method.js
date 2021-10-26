import { html } from 'lit-element';
import { DemoPage } from '@advanced-rest-client/arc-demo-helper';
import { ArcMock } from '@advanced-rest-client/arc-mock';
import { ArcNavigationEventTypes, ImportEvents, ArcModelEvents } from '@advanced-rest-client/events';
import '@advanced-rest-client/arc-demo-helper/arc-interactive-demo.js';
import { ClientCertificateModel, ArcDataExport, MockedStore } from '@advanced-rest-client/idb-store';
import '@anypoint-web-components/awc/anypoint-button.js';
import '@anypoint-web-components/awc/anypoint-checkbox.js';
import '@anypoint-web-components/awc/anypoint-dialog.js';
import '@anypoint-web-components/awc/anypoint-dialog-scrollable.js';
import '../../define/certificate-import.js';
import '../../define/cc-authorization-method.js';

class ComponentDemo extends DemoPage {
  constructor() {
    super();
    this.initObservableProperties([
      'demoState',
      'outlined',
      'mainChangesCounter',
      'allowNone',
      'allowImportButton',
      'importOpened',
    ]);
    this.componentName = 'cc-authorization-method';
    this.demoStates = ['Filled', 'Outlined', 'Anypoint'];
    this.demoState = 0;
    this.mainChangesCounter = 0;
    this.allowNone = false;
    this.allowImportButton = false;
    
    this.generator = new ArcMock();
    this.store = new MockedStore();
    this.model = new ClientCertificateModel();
    this.model.listen(window);
    this.exporter = new ArcDataExport(window);
    this.exporter.listen();
    this.exporter.appVersion = "demo-page";

    window.addEventListener(ArcNavigationEventTypes.navigate, this._certImportHandler.bind(this));
  }

  _demoStateHandler(e) {
    const state = e.detail.value;
    this.demoState = state;
    this.outlined = state === 1;
    this.anypoint = state === 2;
    this._updateAnypoint();
  }

  _mainChangeHandler(e) {
    this.mainChangesCounter++;
    const data = e.target.serialize();
    console.log(data);
  }

  async generateData() {
    await this.store.insertCertificates();
    ImportEvents.dataImported(document.body);
  }

  async deleteData() {
    ArcModelEvents.destroy(document.body, ['client-certificates']);
  }

  _certImportHandler() {
    this.importOpened = true;
  }

  _closeImportHandler() {
    this.importOpened = false;
  }

  _demoTemplate() {
    const {
      demoStates,
      darkThemeActive,
      anypoint,
      outlined,
      mainChangesCounter,
      demoState,
      allowNone,
      allowImportButton,
    } = this;
    return html`
      <section class="documentation-section">
        <h3>Interactive demo</h3>
        <p>
          This demo lets you preview the Client certificate authorization method element with various
          configuration options.
        </p>
        <arc-interactive-demo
          .states="${demoStates}"
          .selectedState="${demoState}"
          @state-changed="${this._demoStateHandler}"
          ?dark="${darkThemeActive}"
        >

          <cc-authorization-method
            ?anypoint="${anypoint}"
            ?outlined="${outlined}"
            ?none="${allowNone}"
            ?importButton="${allowImportButton}"
            slot="content"
            @change="${this._mainChangeHandler}"
          ></cc-authorization-method>

          <label slot="options" id="textAreaOptionsLabel">Options</label>
          <anypoint-checkbox
            aria-describedby="textAreaOptionsLabel"
            slot="options"
            name="allowNone"
            @change="${this._toggleMainOption}"
          >
            Allow none
          </anypoint-checkbox>
          <anypoint-checkbox
            aria-describedby="textAreaOptionsLabel"
            slot="options"
            name="allowImportButton"
            @change="${this._toggleMainOption}"
          >
            Allow import
          </anypoint-checkbox>
        </arc-interactive-demo>

        <p>Change events counter: ${mainChangesCounter}</p>

        <div class="data-options">
          <h3>Data options</h3>
          <anypoint-button @click="${this.generateData}">Generate data</anypoint-button>
          <anypoint-button @click="${this.deleteData}">Clear data</anypoint-button>
        </div>
      </section>

      ${this._importDialog()}
    `;
  }

  _importDialog() {
    const { importOpened } = this;
    return html`
    <anypoint-dialog ?opened="${importOpened}">
      <anypoint-dialog-scrollable>
        <certificate-import @close="${this._closeImportHandler}"></certificate-import>
      </anypoint-dialog-scrollable>
    </anypoint-dialog>
    `;
  }

  contentTemplate() {
    return html`
      <h2>Client certificate authorization method</h2>
      ${this._demoTemplate()}
    `;
  }
}

const instance = new ComponentDemo();
instance.render();
