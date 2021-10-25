import { html } from 'lit-html';
import { DemoPage } from '@advanced-rest-client/arc-demo-helper';
import '@anypoint-web-components/awc/anypoint-checkbox.js';
import '@anypoint-web-components/awc/anypoint-radio-button.js';
import '@anypoint-web-components/awc/anypoint-radio-group.js';
import '@anypoint-web-components/awc/anypoint-button.js';
import '@advanced-rest-client/arc-demo-helper/arc-interactive-demo.js';
import { RestApiModel, MockedStore } from  '@advanced-rest-client/idb-store';
import { ArcMock } from '@advanced-rest-client/arc-mock';
import { ArcModelEvents, ImportEvents, ArcNavigationEventTypes } from '@advanced-rest-client/events';
import '../../define/rest-api-menu.js';

/** @typedef {import('@advanced-rest-client/events').ARCRestApiNavigationEvent} ARCRestApiNavigationEvent */

class ComponentDemoPage extends DemoPage {
  constructor() {
    super();
    this.initObservableProperties([
      'listType',
    ]);
    this.componentName = 'rest-api-menu';
    this.generator = new ArcMock();
    this.store = new MockedStore();
    this.model = new RestApiModel();
    this.model.listen(window);
    this.anypoint = false;

    this.listTypeHandler = this.listTypeHandler.bind(this);
    this.generateData = this.generateData.bind(this);
    this.deleteData = this.deleteData.bind(this);
    this.refreshList = this.refreshList.bind(this);

    window.addEventListener(ArcNavigationEventTypes.navigateRestApi, this.navigateItemDetailHandler.bind(this))
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

  async generateData() {
    await this.store.insertApis(100, { versionSize: 3 });
    
    ImportEvents.dataImported(document.body);
  }

  async deleteData() {
    await this.store.destroyApisAll();
    ArcModelEvents.destroyed(document.body, 'all');
  }

  refreshList() {
    document.querySelector('rest-api-menu').refresh();
  }

  _demoTemplate() {
    const {
      demoStates,
      darkThemeActive,
      anypoint,
      listType
    } = this;
    return html`
      <section class="documentation-section">
        <h3>Interactive demo</h3>
        <p>
          This demo lets you preview the REST APIs menu element with various
          configuration options.
        </p>

        <arc-interactive-demo
          .states="${demoStates}"
          @state-changed="${this._demoStateHandler}"
          ?dark="${darkThemeActive}"
        >
          <rest-api-menu
            ?anypoint="${anypoint}"
            .listType="${listType}"
            slot="content"
          ></rest-api-menu>

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
      <anypoint-button @click="${this.generateData}">Generate 100 APIs</anypoint-button>
      <anypoint-button @click="${this.deleteData}">Clear list</anypoint-button>
      <anypoint-button @click="${this.refreshList}">Refresh list</anypoint-button>
    </section>`;
  }

  _introductionTemplate() {
    return html`
      <section class="documentation-section">
        <h3>Introduction</h3>
        <p>
          Advanced REST Client REST APIs menu is a part of application menu.
          It is styled for material design lists with anypoint with
          Anypoint platform.
        </p>
      </section>
    `;
  }

  _usageTemplate() {
    return html`
      <section class="documentation-section">
        <h2>Usage</h2>
        <p>REST APIs menu comes with 2 predefined styles:</p>
        <ul>
          <li><b>Material</b> - Normal state</li>
          <li>
            <b>Anypoint</b> - To provide anypoint with Anypoint design
          </li>
        </ul>
      </section>
    `;
  }

  contentTemplate() {
    return html`
    <h2>ARC REST APIs menu</h2>
    ${this._demoTemplate()}
    ${this._controlsTemplate()}
    ${this._introductionTemplate()}
    ${this._usageTemplate()}
    `;
  }
}

const instance = new ComponentDemoPage();
instance.render();
