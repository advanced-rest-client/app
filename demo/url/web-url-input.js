import { html } from 'lit-html';
import { DemoPage } from '@advanced-rest-client/arc-demo-helper';
import '@advanced-rest-client/arc-demo-helper/arc-interactive-demo.js';
import '@anypoint-web-components/awc/anypoint-button.js';
import { UrlHistoryModel, MockedStore } from '@advanced-rest-client/idb-store';
import { ArcMock } from '@advanced-rest-client/arc-mock';
import { ImportEvents, ArcNavigationEventTypes, ArcModelEvents } from '@advanced-rest-client/events';
import '../../define/web-url-input.js';

/** @typedef {import('@advanced-rest-client/events').ARCExternalNavigationEvent} ARCExternalNavigationEvent */

class ComponentDemo extends DemoPage {
  constructor() {
    super();
    this.initObservableProperties(['opened']);
    this.componentName = 'web-url-input';
    this.opened = false;
    this.generator = new ArcMock();

    this.generateData = this.generateData.bind(this);
    this.deleteData = this.deleteData.bind(this);
    this.openHandler = this.openHandler.bind(this);
    this.closedHandler = this.closedHandler.bind(this);
    window.addEventListener(ArcNavigationEventTypes.navigateExternal, this.navigateExternalHandler.bind(this));

    this.model = new UrlHistoryModel();
    this.model.listen(window);

    this.store = new MockedStore();
  }

  async generateData() {
    await this.store.insertUrlHistory(100);
    ImportEvents.dataImported(document.body);
  }

  async deleteData() {
    await this.store.destroyUrlHistory();
    ArcModelEvents.destroyed(document.body, 'all');
  }

  openHandler() {
    this.opened = true;
  }

  closedHandler() {
    this.opened = false;
  }

  /**
   * @param {ARCExternalNavigationEvent} e 
   */
  navigateExternalHandler(e) {
    console.log('Open external', e.url, e.detail);
  }

  _demoTemplate() {
    const {
      demoStates,
      darkThemeActive,
      anypoint,
      opened,
    } = this;
    
    return html`
      <section class="documentation-section">
        <h3>Interactive demo</h3>
        <p>
          This demo lets you preview the request meta details element with various
          configuration options.
        </p>
        <arc-interactive-demo
          .states="${demoStates}"
          @state-changed="${this._demoStateHandler}"
          ?dark="${darkThemeActive}"
        >
          <anypoint-button ?anypoint="${anypoint}" @click="${this.openHandler}" slot="content">Open</anypoint-button>
        </arc-interactive-demo>
        <web-url-input 
          .opened="${opened}" 
          @closed="${this.closedHandler}"
          purpose="demo-page"
        ></web-url-input>
      </section>
    `;
  }

  _dataControlsTemplate() {
    return html`
    <section class="documentation-section">
      <h3>Data control</h3>
      <p>
        This section allows you to control demo data
      </p>
      <anypoint-button @click="${this.generateData}">Generate data</anypoint-button>
      <anypoint-button @click="${this.deleteData}">Clear list</anypoint-button>
    </section>`;
  }

  contentTemplate() {
    return html`
      <h2>ARC web URL input</h2>
      ${this._demoTemplate()}
      ${this._dataControlsTemplate()}
    `;
  }
}

const instance = new ComponentDemo();
instance.render();
