import { html } from 'lit-html';
import { DemoPage } from '@advanced-rest-client/arc-demo-helper';
import '@anypoint-web-components/awc/anypoint-checkbox.js';
import '@anypoint-web-components/awc/anypoint-radio-button.js';
import '@anypoint-web-components/awc/anypoint-radio-group.js';
import '@anypoint-web-components/awc/anypoint-button.js';
import '@advanced-rest-client/arc-demo-helper/arc-interactive-demo.js';
import { ImportEvents, ArcModelEvents } from '@advanced-rest-client/events';
import { RequestModel, UrlIndexer, MockedStore } from  '@advanced-rest-client/idb-store';
import { ArcMock } from '@advanced-rest-client/arc-mock';
import '../../define/history-menu.js';
import '../../define/saved-menu.js';

class ComponentDemoPage extends DemoPage {
  constructor() {
    super();
    this.initObservableProperties([
      'draggableEnabled', 'listType', 'dropValue',
    ]);
    this.componentName = 'saved-menu';
    this.demoStates = ['Material design', 'Anypoint'];
    this.generator = new ArcMock();
    this.store = new MockedStore();
    this.model = new RequestModel();
    this.model.listen(window);
    this.indexer = new UrlIndexer(window);
    this.indexer.listen();
    this.anypoint = false;
    this.draggableEnabled = false;
    this.listType = 'default';
    this.dropValue = undefined;
    
    this.generateRequests = this.generateRequests.bind(this);
    this.navigateItemDetailHandler = this.navigateItemDetailHandler.bind(this);
    this.listTypeHandler = this.listTypeHandler.bind(this);
    this.dragoverHandler = this.dragoverHandler.bind(this);
    this.dragleaveHandler = this.dragleaveHandler.bind(this);
    this.dragEnterHandler = this.dragEnterHandler.bind(this);
    this.dropHandler = this.dropHandler.bind(this);
  }

  async generateRequests() {
    await this.store.insertSaved(100);
    ImportEvents.dataImported(document.body);
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
      draggableEnabled,
      anypoint,
      listType,
    } = this;
    return html`
      <section class="documentation-section">
        <h3>Interactive demo</h3>
        <p>
          This demo lets you preview the saved menu element with various
          configuration options.
        </p>

        <arc-interactive-demo
          .states="${demoStates}"
          @state-changed="${this._demoStateHandler}"
          ?dark="${darkThemeActive}"
        >
          <div class="menus" slot="content">
            ${this._historyTemplate()}
            <saved-menu
              ?draggableEnabled="${draggableEnabled}"
              ?anypoint="${anypoint}"
              .listType="${listType}"
              @arcnavigaterequest="${this.navigateItemDetailHandler}"
            ></saved-menu>
          </div>
          

          <label slot="options" id="mainOptionsLabel">Options</label>
          <anypoint-checkbox
            aria-describedby="mainOptionsLabel"
            slot="options"
            name="draggableEnabled"
            @change="${this._toggleMainOption}"
          >Draggable</anypoint-checkbox>

          <label slot="options" id="listTypeLabel">List type</label>
          <anypoint-radio-group
            slot="options"
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

  _historyTemplate() {
    if (!this.draggableEnabled) {
      return '';
    }
    return html`
    <history-menu
      draggableEnabled
      ?anypoint="${this.anypoint}"
      .listType="${this.listType}"
    ></history-menu>
    `;
  }

  _dropTargetTemplate() {
    if (!this.draggableEnabled) {
      return '';
    }
    const { dropValue } = this;
    return html`
    <section
      class="drop-area"
      @dragover="${this.dragoverHandler}"
      @dragleave="${this.dragleaveHandler}"
      @dragenter="${this.dragEnterHandler}"
      @drop="${this.dropHandler}"
    >
      Drop request here
      ${dropValue ? html`<output>${dropValue}</output>` : ''}
    </section>`;
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
      <h2>Saved menu</h2>
      ${this._demoTemplate()}
      ${this._controlsTemplate()}
    `;
  }
}

const instance = new ComponentDemoPage();
instance.render();
