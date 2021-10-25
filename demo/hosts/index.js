import { html } from 'lit-html';
import { DemoPage } from '@advanced-rest-client/arc-demo-helper';
import '@anypoint-web-components/awc/anypoint-button.js';
import '@advanced-rest-client/arc-demo-helper/arc-interactive-demo.js';
import { HostRulesModel, ArcDataExport, MockedStore } from '@advanced-rest-client/idb-store';
import { ArcMock } from '@advanced-rest-client/arc-mock';
import listenEncoding from '@advanced-rest-client/arc-demo-helper/src/EncodingHelpers.js';
import { ExportHandlerMixin } from '@advanced-rest-client/arc-demo-helper/src/ExportHandlerMixin.js';
import { ImportEvents, ArcModelEvents } from '@advanced-rest-client/events';
import '../../define/host-rules-editor.js';

class ComponentDemoPage extends ExportHandlerMixin(DemoPage) {
  constructor() {
    super();
    this.initObservableProperties([
      'outlined',
    ]);
    this.componentName = 'host-rules-editor';
    this.demoStates = ['Filles', 'Outlined', 'Anypoint'];
    this.generator = new ArcMock();
    this.renderViewControls = true;
    this.model = new HostRulesModel();
    this.model.listen(window);
    this.dataExport = new ArcDataExport(window);
    this.store = new MockedStore();

    this.generateData = this.generateData.bind(this);

    listenEncoding();
  }

  _demoStateHandler(e) {
    const state = e.detail.value;
    this.outlined = state === 1;
    this.anypoint = state === 2;
    this._updateAnypoint();
  }

  async generateData() {
    await this.store.insertHostRules(25);
    ImportEvents.dataImported(document.body);
  }

  async deleteData() {
    await ArcModelEvents.destroy(document.body, ['host-rules']);
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
          This demo lets you preview the cookies manager element with various
          configuration options.
        </p>

        <arc-interactive-demo
          .states="${demoStates}"
          @state-changed="${this._demoStateHandler}"
          ?dark="${darkThemeActive}"
        >

          <host-rules-editor
            ?anypoint="${anypoint}"
            ?outlined="${outlined}"
            slot="content"></host-rules-editor>
        </arc-interactive-demo>

        <div class="data-options">
          <h3>Data options</h3>
          <anypoint-button @click="${this.generateData}">Generate 25 rules</anypoint-button>
          <anypoint-button @click="${this.deleteData}">Clear list</anypoint-button>
        </div>
      </section>
    `;
  }

  contentTemplate() {
    return html`
      <h2>ARC host rules editor screen</h2>
      ${this._demoTemplate()}
      ${this.exportTemplate()}
    `;
  }
}

const instance = new ComponentDemoPage();
instance.render();
