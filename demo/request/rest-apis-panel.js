import { html } from 'lit-html';
import { DemoPage } from '@advanced-rest-client/arc-demo-helper';
import { ArcMock } from '@advanced-rest-client/arc-mock';
import { RestApiModel, MockedStore, ArcDataExport } from '@advanced-rest-client/idb-store'
import { ImportEvents, ArcNavigationEventTypes, ArcModelEvents } from '@advanced-rest-client/events';
import '@advanced-rest-client/arc-demo-helper/arc-interactive-demo.js';
import '@anypoint-web-components/awc/anypoint-button.js';
import '@anypoint-web-components/awc/anypoint-radio-button.js';
import '@anypoint-web-components/awc/anypoint-radio-group.js';
import '../../define/rest-apis-panel.js';

/** @typedef {import('@advanced-rest-client/events').ARCRestApiNavigationEvent} ARCRestApiNavigationEvent */

class ComponentPage extends DemoPage {
  constructor() {
    super();
    this.initObservableProperties([
      'listType',
    ]);
    this.componentName = 'REST APIs panel';
    this.generator = new ArcMock();
    this.listType = 'default';
    this.model = new RestApiModel();
    this.model.listen(window);
    this.store = new MockedStore();
    this.dataExport = new ArcDataExport(window);
    this.dataExport.listen();
    this.dataExport.appVersion = 'demo-page';
    
    this.generateRequests = this.generateRequests.bind(this);
    this.deleteData = this.deleteData.bind(this);
    this.listTypeHandler = this.listTypeHandler.bind(this);

    window.addEventListener(ArcNavigationEventTypes.navigateRestApi, this.navigateItemDetailHandler.bind(this));
  }

  async generateRequests() {
    await this.store.insertApis(100);
    ImportEvents.dataImported(document.body);
  }

  async deleteData() {
    await this.store.destroyApisAll();
    ArcModelEvents.destroyed(document.body, 'all');
  }

  /**
   * @param {ARCRestApiNavigationEvent} e
   */
  navigateItemDetailHandler(e) {
    console.log('Navigate requested', 'Version', e.version, 'id', e.api, 'Action', e.action);
  }

  listTypeHandler(e) {
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
      listType,
    } = this;
    return html`
    <section class="documentation-section">
      <h3>Interactive demo</h3>
      <p>
        This demo lets you preview the REST APIs panel with various configuration options.
      </p>
      <arc-interactive-demo
        .states="${demoStates}"
        @state-changed="${this._demoStateHandler}"
        ?dark="${darkThemeActive}"
      >
        <rest-apis-panel
        slot="content"
          ?anypoint="${anypoint}"
          .listType="${listType}"
        ></rest-apis-panel>

        <label slot="options" id="listTypeLabel">List type</label>
        <anypoint-radio-group
          slot="options"
          selectable="anypoint-radio-button"
          aria-labelledby="listTypeLabel"
        >
          <anypoint-radio-button
            @change="${this.listTypeHandler}"
            checked
            name="default"
            >Default</anypoint-radio-button
          >
          <anypoint-radio-button
            @change="${this.listTypeHandler}"
            name="comfortable"
            >Comfortable</anypoint-radio-button
          >
          <anypoint-radio-button
            @change="${this.listTypeHandler}"
            name="compact"
            >Compact</anypoint-radio-button
          >
        </anypoint-radio-group>
      </arc-interactive-demo>
    </section>
    `;
  }

  _controlsTemplate() {
    return html`
    <section class="documentation-section">
      <h3>Data control</h3>
      <p>
        This section allows you to control demo data
      </p>
      <anypoint-button @click="${this.generateRequests}">Generate 100 requests</anypoint-button>
      <anypoint-button @click="${this.deleteData}">Clear list</anypoint-button>
    </section>`;
  }

  contentTemplate() {
    return html`
      <h2>REST APIs panel</h2>
      ${this._demoTemplate()}
      ${this._controlsTemplate()}
    `;
  }
}
const instance = new ComponentPage();
instance.render();
