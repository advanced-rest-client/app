
import { html } from 'lit-html';
import { DemoPage } from '@advanced-rest-client/arc-demo-helper';
import { ExportHandlerMixin } from '@advanced-rest-client/arc-demo-helper/src/ExportHandlerMixin.js';
import * as EncodingHelpers from '@advanced-rest-client/arc-demo-helper/src/EncodingHelpers.js';
import { ArcMock } from '@advanced-rest-client/arc-mock';
import { MonacoLoader } from '@advanced-rest-client/monaco-support';
import { RequestModel, UrlIndexer, ProjectModel, MockedStore, ArcDataExport } from '@advanced-rest-client/idb-store';
import '@advanced-rest-client/arc-demo-helper/arc-interactive-demo.js';
import '@anypoint-web-components/awc/anypoint-button.js';
import '@anypoint-web-components/awc/anypoint-checkbox.js';
import '@anypoint-web-components/awc/anypoint-radio-button.js';
import '@anypoint-web-components/awc/anypoint-radio-group.js';
import { ImportEvents, ArcNavigationEventTypes, ArcModelEvents } from '@advanced-rest-client/events';
import '../../define/projects-menu.js';
import '../../define/history-menu.js';
import '../../define/saved-menu.js';
import '../../define/project-screen.js';

class ComponentPage extends ExportHandlerMixin(DemoPage) {
  constructor() {
    super();
    this.initObservableProperties([
      'listType', 'initialized', 'projectId',
      'draggableEnabled', 'dropValue',
    ]);
    this.componentName = 'Project screen';
    this.demoStates = ['Filled', 'Outlined', 'Anypoint'];
    this.generator = new ArcMock();
    this.listType = 'default';
    this.renderViewControls = true;

    this.store = new MockedStore();
    this.requestModel = new RequestModel();
    this.projectModel = new ProjectModel();
    this.indexer = new UrlIndexer(window);
    this.requestModel.listen(window);
    this.projectModel.listen(window);
    this.exporter = new ArcDataExport(window);
    this.exporter.listen();

    /**
     * @type {string}
     */
    this.projectId = undefined;
    this.draggableEnabled = false;
    this.dropValue = undefined;
    this.initialized = false;

    this.generateRequests = this.generateRequests.bind(this);
    this.clearRequests = this.clearRequests.bind(this);
    this.listItemDetailHandler = this.listItemDetailHandler.bind(this);
    this.listTypeHandler = this.listTypeHandler.bind(this);
    this.selectHandler = this.selectHandler.bind(this);
    
    this.dragoverHandler = this.dragoverHandler.bind(this);
    this.dragleaveHandler = this.dragleaveHandler.bind(this);
    this.dragEnterHandler = this.dragEnterHandler.bind(this);
    this.dropHandler = this.dropHandler.bind(this);

    EncodingHelpers.default();
    window.addEventListener(ArcNavigationEventTypes.navigateProject, this.projectNavigateHandler.bind(this));
    window.addEventListener(ArcNavigationEventTypes.navigateRequest, this.navigateItemDetailHandler.bind(this));

    this.initEditors();
  }

  async initEditors() {
    await this.loadMonaco();
    this.initialized = true;
  }

  _demoStateHandler(e) {
    const state = e.detail.value;
    this.outlined = state === 1;
    this.anypoint = state === 2;
    this._updateAnypoint();
  }

  projectNavigateHandler(e) {
    const { id, action } = e;
    if (action === 'open') {
      this.projectId = id;
    }
  }

  async loadMonaco() {
    const base = `../../node_modules/monaco-editor/`;
    MonacoLoader.createEnvironment(base);
    await MonacoLoader.loadMonaco(base);
    await MonacoLoader.monacoReady();
  }

  async generateRequests() {
    const projects = await this.store.insertProjects();
    await this.store.insertSaved(100, projects.length, {
      projects,
      forceProject: true,
    }, {
      autoRequestId: true,
    });
    ImportEvents.dataImported(document.body);
  }

  async clearRequests() {
    await this.store.destroySaved();
    ImportEvents.dataImported(document.body);
  }

  listItemDetailHandler(e) {
    console.log('Details requested', e.detail);
  }

  navigateItemDetailHandler(e) {
    console.log('Navigate requested', e.requestId, e.requestType, e.route, e.action);
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
    let type = e.dataTransfer.getData('arc/type');
    if (type === 'project') {
      type = 'saved';
    }
    const request = await ArcModelEvents.Request.read(document.body, type, id);
    
    this.dropValue = `Event data: 
${JSON.stringify(props, null, 2)}

Read request: 
${JSON.stringify(request, null, 2)}
`;
    console.log(request);
  }

  _demoTemplate() {
    if (!this.initialized) {
      return html`<progress></progress>`;
    }
    const {
      demoStates,
      darkThemeActive,
      anypoint,
      listType,
      projectId,
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
          ${this._projectMenuTemplate()}
          <project-screen
            .projectId="${projectId}"
            ?anypoint="${anypoint}"
            .listType="${listType}"
            ?draggableEnabled="${draggableEnabled}"
            @details="${this.listItemDetailHandler}"
            @select="${this.selectHandler}"
          ></project-screen>
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

  _projectMenuTemplate() {
    return html`
    <projects-menu
      class="app-menu"
      ?anypoint="${this.anypoint}"
      .listType="${this.listType}"
      draggableEnabled
  ></projects-menu>`;
  }

  _controlsTemplate() {
    return html`
    <section class="documentation-section">
      <h3>Data control</h3>
      <p>
        This section allows you to control demo data
      </p>
      <anypoint-button @click="${this.generateRequests}">Generate projects</anypoint-button>
      <anypoint-button @click="${this.clearRequests}">Clear data</anypoint-button>
    </section>`;
  }

  contentTemplate() {
    return html`
      <h2>Project screen</h2>
      ${this._demoTemplate()}
      ${this._controlsTemplate()}
      ${this.exportTemplate()}
    `;
  }
}
const instance = new ComponentPage();
instance.render();
