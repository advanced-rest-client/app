import { html } from 'lit-html';
import { DemoPage } from '@advanced-rest-client/arc-demo-helper';
import '@anypoint-web-components/awc/anypoint-checkbox.js';
import '@anypoint-web-components/awc/anypoint-radio-button.js';
import '@anypoint-web-components/awc/anypoint-radio-group.js';
import '@anypoint-web-components/awc/anypoint-button.js';
import '@advanced-rest-client/arc-demo-helper/arc-interactive-demo.js';
import { ImportEvents, ArcModelEvents, ArcNavigationEventTypes } from '@advanced-rest-client/events';
import { RequestModel, UrlIndexer, ProjectModel, MockedStore } from  '@advanced-rest-client/idb-store';
import { ArcMock } from '@advanced-rest-client/arc-mock';
import '../../define/history-menu.js';
import '../../define/saved-menu.js';
import '../../define/projects-menu.js';


/** @typedef {import('@advanced-rest-client/events').ARCProjectNavigationEvent} ARCProjectNavigationEvent */
/** @typedef {import('@advanced-rest-client/events').ARCRequestNavigationEvent} ARCRequestNavigationEvent */

class ComponentDemoPage extends DemoPage {
  constructor() {
    super();
    this.initObservableProperties([
      'draggableEnabled', 'listType', 'dropValue',
    ]);
    this.componentName = 'projects-menu';
    this.generator = new ArcMock();
    this.store = new MockedStore();
    this.model = new RequestModel();
    this.model.listen(window);
    this.projectModel = new ProjectModel();
    this.projectModel.listen(window);
    this.indexer = new UrlIndexer(window);
    this.indexer.listen();
    this.anypoint = false;
    this.draggableEnabled = false;
    this.listType = 'default';
    this.dropValue = undefined;
    
    this.generateRequests = this.generateRequests.bind(this);
    this.generateHistoryRequests = this.generateHistoryRequests.bind(this);
    this.clearRequests = this.clearRequests.bind(this);
    this.clearHistoryRequests = this.clearHistoryRequests.bind(this);
    this.listTypeHandler = this.listTypeHandler.bind(this);
    this.dragoverHandler = this.dragoverHandler.bind(this);
    this.dragleaveHandler = this.dragleaveHandler.bind(this);
    this.dragEnterHandler = this.dragEnterHandler.bind(this);
    this.dropHandler = this.dropHandler.bind(this);

    window.addEventListener(ArcNavigationEventTypes.navigateProject, this.navigateProjectHandler.bind(this));
    window.addEventListener(ArcNavigationEventTypes.navigateRequest, this.navigateRequestHandler.bind(this));
  }

  async generateRequests() {
    await this.store.insertSaved(100, 5, { forceProject: true });
    ImportEvents.dataImported(document.body);
  }

  async generateHistoryRequests() {
    await this.store.insertHistory(100);
    ImportEvents.dataImported(document.body);
  }

  async clearRequests() {
    await this.store.destroySaved();
    ArcModelEvents.destroyed(document.body, 'saved');
    ArcModelEvents.destroyed(document.body, 'projects');
  }

  async clearHistoryRequests() {
    await this.store.destroyHistory();
    ArcModelEvents.destroyed(document.body, 'history');
  }

  /**
   * @param {ARCRequestNavigationEvent} e 
   */
  navigateRequestHandler(e) {
    console.log('Navigate request', e.requestId, e.requestType, e.route, e.action);
  }
  
  /**
   * @param {ARCProjectNavigationEvent} e 
   */
  navigateProjectHandler(e) {
    console.log('Navigate project', e.id, e.route, e.action);
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
    const props = {};
    Array.from(e.dataTransfer.items).forEach((item) => {
      props[item.type] = e.dataTransfer.getData(item.type);
    });

    /** @type HTMLElement */ (e.currentTarget).classList.remove('drag-over');
    let request;
    let project;
    const id = e.dataTransfer.getData('arc/id');
    const type = e.dataTransfer.getData('arc/type');
    if (type === 'request') {
      request = await ArcModelEvents.Request.read(document.body, type, id);
    } else if (type === 'project') {
      project = await ArcModelEvents.Project.read(document.body, id);
    }
    
    this.dropValue = `Event data: 
${JSON.stringify(props, null, 2)}

${request ? `Read request: 
${JSON.stringify(request, null, 2)}`: ''}

${project ? `Read project: 
${JSON.stringify(project, null, 2)}`: ''}
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
          This demo lets you preview the projects menu element with various
          configuration options.
        </p>

        <arc-interactive-demo
          .states="${demoStates}"
          @state-changed="${this._demoStateHandler}"
          ?dark="${darkThemeActive}"
        >
          <div class="menus" slot="content">
            ${this._historyTemplate()}
            ${this._savedTemplate()}
            <projects-menu
              ?draggableEnabled="${draggableEnabled}"
              ?anypoint="${anypoint}"
              .listType="${listType}"
            ></projects-menu>
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

  _savedTemplate() {
    if (!this.draggableEnabled) {
      return '';
    }
    return html`
    <saved-menu
      draggableEnabled
      ?anypoint="${this.anypoint}"
      .listType="${this.listType}"
    ></saved-menu>
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
      <anypoint-button @click="${this.generateHistoryRequests}">Generate 100 history requests</anypoint-button>
      <anypoint-button @click="${this.clearRequests}">Clear all saved requests</anypoint-button>
      <anypoint-button @click="${this.clearHistoryRequests}">Clear all history requests</anypoint-button>
    </section>`;
  }

  contentTemplate() {
    return html`
      <h2>Projects menu</h2>
      ${this._demoTemplate()}
      ${this._controlsTemplate()}
    `;
  }
}

const instance = new ComponentDemoPage();
instance.render();
