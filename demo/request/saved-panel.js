
import { html } from 'lit-html';
import { DemoPage } from '@advanced-rest-client/arc-demo-helper';
import { ArcMock } from '@advanced-rest-client/arc-mock';
import '@advanced-rest-client/arc-demo-helper/arc-interactive-demo.js';
import { RequestModel, UrlIndexer, ProjectModel, MockedStore, ArcDataExport } from '@advanced-rest-client/idb-store'
import '@anypoint-web-components/awc/anypoint-button.js';
import '@anypoint-web-components/awc/anypoint-checkbox.js';
import '@anypoint-web-components/awc/anypoint-radio-button.js';
import '@anypoint-web-components/awc/anypoint-radio-group.js';
import listenEncoding from '@advanced-rest-client/arc-demo-helper/src/EncodingHelpers.js';
import { ExportHandlerMixin } from '@advanced-rest-client/arc-demo-helper/src/ExportHandlerMixin.js';
import { ImportEvents, ArcModelEvents } from '@advanced-rest-client/events';
import './history-screen.js';
import '../../define/saved-panel.js';

class ComponentPage extends ExportHandlerMixin(DemoPage) {
  constructor() {
    super();
    this.initObservableProperties([
      'listActions', 'selectable', 'listType',
      'draggableEnabled', 'dropValue',
    ]);
    this.componentName = 'Saved panel';
    this.generator = new ArcMock();
    this.listActions = false;
    this.selectable = false;
    this.listType = 'default';
    this.draggableEnabled = true;
    this.dropValue = undefined;
    this.requestModel = new RequestModel();
    this.projectModel = new ProjectModel();
    this.indexer = new UrlIndexer(window);
    this.requestModel.listen(window);
    this.projectModel.listen(window);
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
    this.exportOpenedChanged = this.exportOpenedChanged.bind(this);
    this.dragoverHandler = this.dragoverHandler.bind(this);
    this.dragleaveHandler = this.dragleaveHandler.bind(this);
    this.dragEnterHandler = this.dragEnterHandler.bind(this);
    this.dropHandler = this.dropHandler.bind(this);

    listenEncoding();
  }

  async generateRequests() {
    await this.store.insertSaved(100);
    ImportEvents.dataImported(document.body);
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

  exportOpenedChanged(e) {
    this.exportSheetOpened = e.detail.value;
  }

  dragoverHandler(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    e.currentTarget.classList.add('drag-over');
  }

  dragleaveHandler(e) {
    e.currentTarget.classList.remove('drag-over');
  }

  dragEnterHandler(e) {
    e.currentTarget.classList.add('drag-over');
  }

  /**
   * @param {DragEvent} e
   */
  async dropHandler(e) {
    e.preventDefault();
    if (!e.dataTransfer.getData('arc/request')) {
      return;
    }
    const props = {};
    Array.from(e.dataTransfer.items).forEach((item) => {
      props[item.type] = e.dataTransfer.getData(item.type);
    });

    /** @type HTMLElement */ (e.currentTarget).classList.remove('drag-over');
    const id = e.dataTransfer.getData('arc/id');
    const type = e.dataTransfer.getData('arc/type');
    const request = await ArcModelEvents.Request.read(document.body, type, id);
    
    this.dropValue = `Event data: 
${JSON.stringify(props, null, 2)}

Read request: 
${JSON.stringify(request, null, 2)}
`;
    console.log(request);
  }

  _demoTemplate() {
    const {
      demoStates,
      darkThemeActive,
      anypoint,
      listActions,
      selectable,
      listType,
      draggableEnabled,
    } = this;
    return html`
    <section class="documentation-section">
      <h3>Interactive demo</h3>
      <p>
        This demo lets you preview the saved panel with various configuration options.
      </p>
      <arc-interactive-demo
        .states="${demoStates}"
        @state-changed="${this._demoStateHandler}"
        ?dark="${darkThemeActive}"
      >
        <div class="panels-container" slot="content">
          ${this._historyTemplate()}
          <saved-panel 
            ?listActions="${listActions}"
            ?selectable="${selectable}"
            ?anypoint="${anypoint}"
            .listType="${listType}"
            ?draggableEnabled="${draggableEnabled}"
            @details="${this.listItemDetailHandler}"
            @arcnavigaterequest="${this.navigateItemDetailHandler}"
            @select="${this.selectHandler}"
          ></saved-panel>
        </div>
        

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
        <anypoint-checkbox
          aria-describedby="mainOptionsLabel"
          slot="options"
          name="draggableEnabled"
          @change="${this._toggleMainOption}"
        >Draggable</anypoint-checkbox>

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
      ${this._dropTargetTemplate()}
    </section>
    `;
  }

  _dropTargetTemplate() {
    if (!this.draggableEnabled) {
      return '';
    }
    const { dropValue } = this;
    return html`
    <section
      class="drop-target"
      @dragover="${this.dragoverHandler}"
      @dragleave="${this.dragleaveHandler}"
      @dragenter="${this.dragEnterHandler}"
      @drop="${this.dropHandler}"
    >
      Drop request here
      ${dropValue ? html`<output>${dropValue}</output>` : ''}
    </section>`;
  }

  _historyTemplate() {
    if (!this.draggableEnabled) {
      return '';
    }
    return html`
    <history-screen 
      class="history-menu"
      ?anypoint="${this.anypoint}"
      .listType="${this.listType}"
      draggableEnabled
  ></history-screen>`;
  }

  _controlsTemplate() {
    return html`
    <section class="documentation-section">
      <h3>Data control</h3>
      <p>
        This section allows you to control demo data
      </p>
      <anypoint-button @click="${this.generateRequests}">Generate 100 requests</anypoint-button>
    </section>`;
  }

  contentTemplate() {
    return html`
      <h2>Saved panel</h2>
      ${this._demoTemplate()}
      ${this._controlsTemplate()}
      ${this.exportTemplate()}
    `;
  }
}
const instance = new ComponentPage();
instance.render();
