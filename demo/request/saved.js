
import { html } from 'lit-html';
import { DemoPage } from '@advanced-rest-client/arc-demo-helper';
import { ArcMock } from '@advanced-rest-client/arc-mock';
import { RequestModel, UrlIndexer, MockedStore, ArcDataExport } from '@advanced-rest-client/idb-store'
import '@advanced-rest-client/arc-demo-helper/arc-interactive-demo.js';
import '@anypoint-web-components/awc/anypoint-button.js';
import '@anypoint-web-components/awc/anypoint-checkbox.js';
import '@anypoint-web-components/awc/anypoint-radio-button.js';
import '@anypoint-web-components/awc/anypoint-radio-group.js';
import listenEncoding from '@advanced-rest-client/arc-demo-helper/src/EncodingHelpers.js';
import { ExportHandlerMixin } from '@advanced-rest-client/arc-demo-helper/src/ExportHandlerMixin.js';
import { ImportEvents, ArcModelEvents } from '@advanced-rest-client/events';
import './saved-screen.js';

class ComponentPage extends ExportHandlerMixin(DemoPage) {
  constructor() {
    super();
    this.initObservableProperties([
      'listActions', 'selectable', 'listType',
    ]);
    this.componentName = 'Saved list';
    this.generator = new ArcMock();
    this.listActions = false;
    this.selectable = false;
    this.listType = 'default';
    this.requestModel = new RequestModel();
    this.indexer = new UrlIndexer(window);
    this.requestModel.listen(window);
    this.indexer.listen();
    this.store = new MockedStore();
    this.dataExport = new ArcDataExport(window);
    this.dataExport.listen();
    this.dataExport.appVersion = 'demo-page';

    this.generateRequests = this.generateRequests.bind(this);
    this.listItemDetailHandler = this.listItemDetailHandler.bind(this);
    this.navigateItemDetailHandler = this.navigateItemDetailHandler.bind(this);
    this.listTypeHandler = this.listTypeHandler.bind(this);
    this.selectHandler = this.selectHandler.bind(this);
    this.createHistoryItem = this.createHistoryItem.bind(this);
    this.createSavedItem = this.createSavedItem.bind(this);
    this.clearRequests = this.clearRequests.bind(this);

    listenEncoding();
  }

  async generateRequests() {
    await this.store.insertSaved(100);
    ImportEvents.dataImported(document.body);
  }

  async clearRequests() {
    await ArcModelEvents.destroy(document.body, ['saved']);
  }

  async createHistoryItem() {
    const item = this.generator.http.history();
    await ArcModelEvents.Request.store(document.body, 'history', item);
  }

  async createSavedItem() {
    const item = this.generator.http.saved();
    await ArcModelEvents.Request.store(document.body, 'saved', item);
  }

  listItemDetailHandler(e) {
    console.log('Details requested', e.detail);
  }

  navigateItemDetailHandler(e) {
    console.log('Navigate requested', e.requestId, e.requestType, e.route);
  }

  listTypeHandler(e) {
    const { name, checked } = e.target;
    if (!checked) {
      return;
    }
    this.listType = name;
  }

  selectHandler(e) {
    console.log(e.target.selectedItems);
  }

  _demoTemplate() {
    const {
      demoStates,
      darkThemeActive,
      anypoint,
      listActions,
      selectable,
      listType,
    } = this;
    return html`
    <section class="documentation-section">
      <h3>Interactive demo</h3>
      <p>
        This demo lets you preview the saved list mixins and UI with various configuration options.
      </p>
      <arc-interactive-demo
        .states="${demoStates}"
        @state-changed="${this._demoStateHandler}"
        ?dark="${darkThemeActive}"
      >
        <saved-screen 
          slot="content"
          ?listActions="${listActions}"
          ?selectable="${selectable}"
          ?anypoint="${anypoint}"
          .listType="${listType}"
          @details="${this.listItemDetailHandler}"
          @arcnavigaterequest="${this.navigateItemDetailHandler}"
          @select="${this.selectHandler}"
        ></saved-screen>

        <label slot="options" id="mainOptionsLabel">Options</label>
        <anypoint-checkbox
          aria-describedby="mainOptionsLabel"
          slot="options"
          name="listActions"
          @change="${this._toggleMainOption}"
        >Add actions</anypoint-checkbox>
        <anypoint-checkbox
          aria-describedby="mainOptionsLabel"
          slot="options"
          name="selectable"
          @change="${this._toggleMainOption}"
        >Add selection</anypoint-checkbox>

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
      <anypoint-button @click="${this.clearRequests}">Clear saved</anypoint-button>
      <anypoint-button @click="${this.createHistoryItem}">Create a history item</anypoint-button>
      <anypoint-button @click="${this.createSavedItem}">Create a saved item</anypoint-button>
    </section>`;
  }

  contentTemplate() {
    return html`
      <h2>Saved list</h2>
      ${this._demoTemplate()}
      ${this._controlsTemplate()}
      ${this.exportTemplate()}
    `;
  }
}
const instance = new ComponentPage();
instance.render();
