import { html } from 'lit-html';
import { DemoPage } from '@advanced-rest-client/arc-demo-helper';
import '@anypoint-web-components/awc/anypoint-checkbox.js';
import '@anypoint-web-components/awc/anypoint-radio-button.js';
import '@anypoint-web-components/awc/anypoint-radio-group.js';
import '@anypoint-web-components/awc/anypoint-button.js';
import '@advanced-rest-client/arc-demo-helper/arc-interactive-demo.js';
import { ArcNavigationEvents, ImportEvents, ArcModelEvents, ArcNavigationEventTypes } from '@advanced-rest-client/events';
import { RequestModel, UrlIndexer, ProjectModel, RestApiModel, MockedStore, ArcDataExport } from  '@advanced-rest-client/idb-store';
import { ArcMock } from '@advanced-rest-client/arc-mock';
import listenEncoding from '@advanced-rest-client/arc-demo-helper/src/EncodingHelpers.js';
import { ExportHandlerMixin } from '@advanced-rest-client/arc-demo-helper/src/ExportHandlerMixin.js';
import '@anypoint-web-components/awc/colors.js';
import '../../define/arc-menu.js';

/** @typedef {import('@advanced-rest-client/events').ARCProjectNavigationEvent} ARCProjectNavigationEvent */
/** @typedef {import('@advanced-rest-client/events').ARCRequestNavigationEvent} ARCRequestNavigationEvent */
/** @typedef {import('@advanced-rest-client/events').ARCRestApiNavigationEvent} ARCRestApiNavigationEvent */
/** @typedef {import('@advanced-rest-client/events').ARCNavigationEvent} ARCNavigationEvent */
/** @typedef {import('@advanced-rest-client/events').ARCMenuPopupEvent} ARCMenuPopupEvent */
/** @typedef {import('@advanced-rest-client/events').ArcExportFilesystemEvent} ArcExportFilesystemEvent */
/** @typedef {import('@advanced-rest-client/events').ARCHelpTopicEvent} ARCHelpTopicEvent */

class ComponentDemoPage extends ExportHandlerMixin(DemoPage) {
  constructor() {
    super();
    this.initObservableProperties([
      'listType',
      'historyEnabled',
      'hideHistory',
      'hideSaved',
      'hideProjects',
      'hideApis',
      'hideSearch',
      'allowPopup',
      'draggableEnabled',
      'dropValue',
      'exportSheetOpened', 'exportFile', 'exportData',
    ]);
    this.componentName = 'arc-menu';
    this.demoStates = ['Material', 'Anypoint'];
    this.historyEnabled = true;
    this.hideHistory = false;
    this.hideSaved = false;
    this.hideProjects = false;
    this.hideApis = false;
    this.hideSearch = false;
    this.allowPopup = true;
    this.draggableEnabled = true;
    this.renderViewControls = true;

    this.generator = new ArcMock();
    this.store = new MockedStore();
    this.requestModel = new RequestModel();
    this.requestModel.listen(window);
    this.projectModel = new ProjectModel();
    this.projectModel.listen(window);
    this.apisModel = new RestApiModel();
    this.apisModel.listen(window);
    this.indexer = new UrlIndexer(window);
    this.indexer.listen();
    this.exporter = new ArcDataExport(window);
    this.exporter.appVersion = 'Demo page';
    this.exporter.listen();

    const darkPreferences = window.matchMedia('(prefers-color-scheme: dark)');
    if (darkPreferences.matches) {
      this.darkThemeActive = true;
    }
    darkPreferences.addEventListener('change', (event) => {
      this.darkThemeActive = event.matches;
    });

    this.openedPopups = [];

    this._listTypeHandler = this._listTypeHandler.bind(this);
    this.generateData = this.generateData.bind(this);
    this.deleteData = this.deleteData.bind(this);
    this._dragoverHandler = this._dragoverHandler.bind(this);
    this._dragleaveHandler = this._dragleaveHandler.bind(this);
    this._dropHandler = this._dropHandler.bind(this);
    this._exportOpenedChanged = this._exportOpenedChanged.bind(this);

    window.addEventListener(ArcNavigationEventTypes.navigateProject, this.navigateProjectHandler.bind(this));
    window.addEventListener(ArcNavigationEventTypes.navigateRequest, this.navigateRequestHandler.bind(this));
    window.addEventListener(ArcNavigationEventTypes.navigateRestApi, this.navigateRestApiHandler.bind(this));
    window.addEventListener(ArcNavigationEventTypes.navigate, this.navigateHandler.bind(this));
    window.addEventListener(ArcNavigationEventTypes.popupMenu, this.popupHandler.bind(this));
    window.addEventListener(ArcNavigationEventTypes.helpTopic, this.helpHandler.bind(this));

    window.onbeforeunload = () => {
      this.openedPopups.forEach((item) => item.ref.close());
    };
    window.addEventListener('message', this._messageHandler.bind(this));

    listenEncoding();
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
    console.log('Project navigation', e.id, e.route, e.action);
  } 

  /**
   * @param {ARCRestApiNavigationEvent} e 
   */
  navigateRestApiHandler(e) {
    console.log('API docs navigation', 'Version', e.version, 'id', e.api, 'Action', e.action);
  }

  /**
   * @param {ARCNavigationEvent} e 
   */
  navigateHandler(e) {
    // @ts-ignore
    console.log('General navigation', 'Route', e.route, 'base', e.base, 'opts', e.opts);
  }  

  /**
   * @param {ARCHelpTopicEvent} e 
   */
  helpHandler(e) {
    console.log('Help navigation', e.topic);
  }  
  
  /**
   * @param {ARCMenuPopupEvent} e 
   */
  popupHandler(e) {
    const url = `popup.html?type=${e.menu}`;
    const ref = window.open(url, e.menu, 'width=360,height=700,resizable');
    if (!ref) {
      return;
    }
    this.openedPopups.push({
      ref,
      type: e.menu,
    });
    switch(e.menu) {
      case 'history-menu': this.hideHistory = true; break;
      case 'saved-menu': this.hideSaved = true; break;
      case 'projects-menu': this.hideProjects = true; break;
      case 'rest-api-menu': this.hideApis = true; break;
      case 'search-menu': this.hideSearch = true; break;
      default:
    }
  }

  /**
   * 
   * @param {MessageEvent} e 
   */
  _messageHandler(e) {
    const {data} = e;
    if (!data.payload) {
      return;
    }
    if (data.payload === 'popup-closing') {
      this.popupClosed(data.type);
    } else if (data.payload === 'popup-navigate') {
      this.proxyNavigation(data);
    }
  }

  /**
   * Called when the popup window closed.
   * @param {string} type 
   */
  popupClosed(type) {
    switch(type) {
      case 'history-menu': this.hideHistory = false; break;
      case 'saved-menu': this.hideSaved = false; break;
      case 'projects-menu': this.hideProjects = false; break;
      case 'rest-api-menu': this.hideApis = false; break;
      case 'search-menu': this.hideSearch = false; break;
      default:
    }
    const index = this.openedPopups.find((item) => item.type === type);
    if (index !== -1) {
      this.openedPopups.splice(index, 1);
    }
  }

  /**
   * @param {any} data 
   */
  proxyNavigation(data) {
    switch (data.type) {
      case 'project': ArcNavigationEvents.navigateProject(document.body, data.id, data.action); break;
      case 'request': ArcNavigationEvents.navigateRequest(document.body, data.requestId, data.requestType, data.action); break;
      case 'api': ArcNavigationEvents.navigateRestApi(document.body, data.api, data.version, data.action); break;
      case 'navigate': ArcNavigationEvents.navigate(document.body, data.route, data.opts); break;
      default: 
    }
  }

  _exportOpenedChanged() {
    this.exportSheetOpened = false;
  }

  _listTypeHandler(e) {
    const { name, checked } = e.target;
    if (!checked) {
      return;
    }
    this.listType = name;
  }

  async generateData() {
    await this.store.insertApis(100, {
      versionSize: 4,
      order: 0,
    });
    await this.store.insertSaved(100, 15, {
      forceProject: true,
    });
    await this.store.insertHistory(500);
    ImportEvents.dataImported(document.body);
    this.indexer.reindex('saved');
    this.indexer.reindex('history');
  }

  async deleteData() {
    await this.store.destroyAll();
    ArcModelEvents.destroyed(document.body, 'all');
  }

  _dragoverHandler(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    e.currentTarget.classList.add('drag-over');
  }

  _dragleaveHandler(e) {
    e.currentTarget.classList.remove('drag-over');
  }

  _dragEnterHandler(e) {
    e.currentTarget.classList.add('drag-over');
  }

  /**
   * @param {DragEvent} e
   */
  async _dropHandler(e) {
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
${JSON.stringify(request, null, 2)}` : ''}

${project ? `Read project: 
${JSON.stringify(project, null, 2)}` : ''}
`;
  }

  _demoTemplate() {
    const {
      demoStates,
      darkThemeActive,
      anypoint,
      listType,
      historyEnabled,
      hideHistory,
      hideSaved,
      hideProjects,
      hideApis,
      hideSearch,
      allowPopup,
      draggableEnabled,
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
          <arc-menu
            ?anypoint="${anypoint}"
            .listType="${listType}"
            ?history="${historyEnabled}"
            ?hideHistory="${hideHistory}"
            ?hideSaved="${hideSaved}"
            ?hideProjects="${hideProjects}"
            ?hideApis="${hideApis}"
            ?hideSearch="${hideSearch}"
            ?popup="${allowPopup}"
            ?dataTransfer="${draggableEnabled}"
            slot="content"
          ></arc-menu>

          <label slot="options" id="mainOptionsLabel">Options</label>
          <anypoint-checkbox
            aria-describedby="mainOptionsLabel"
            slot="options"
            name="historyEnabled"
            checked
            @change="${this._toggleMainOption}"
          >
            History enabled
          </anypoint-checkbox>
          <anypoint-checkbox
            aria-describedby="mainOptionsLabel"
            slot="options"
            name="draggableEnabled"
            .checked="${draggableEnabled}"
            @change="${this._toggleMainOption}"
          >
            Draggable
          </anypoint-checkbox>
          <anypoint-checkbox
            aria-describedby="mainOptionsLabel"
            slot="options"
            name="hideHistory"
            .checked="${hideHistory}"
            @change="${this._toggleMainOption}"
          >
            Hide history
          </anypoint-checkbox>
          <anypoint-checkbox
            aria-describedby="mainOptionsLabel"
            slot="options"
            name="hideSaved"
            .checked="${hideSaved}"
            @change="${this._toggleMainOption}"
          >
            Hide saved
          </anypoint-checkbox>
          <anypoint-checkbox
            aria-describedby="mainOptionsLabel"
            slot="options"
            name="hideProjects"
            .checked="${hideProjects}"
            @change="${this._toggleMainOption}"
          >
            Hide projects
          </anypoint-checkbox>
          <anypoint-checkbox
            aria-describedby="mainOptionsLabel"
            slot="options"
            name="hideApis"
            .checked="${hideApis}"
            @change="${this._toggleMainOption}"
          >
            Hide APIs
          </anypoint-checkbox>
          <anypoint-checkbox
            aria-describedby="mainOptionsLabel"
            slot="options"
            name="allowPopup"
            .checked="${allowPopup}"
            @change="${this._toggleMainOption}"
          >
            Allow popup
          </anypoint-checkbox>

          <label slot="options" id="listTypeLabel">List type</label>
          <anypoint-radio-group
            slot="options"
            selectable="anypoint-radio-button"
            aria-labelledby="listTypeLabel"
          >
            <anypoint-radio-button
              @change="${this._listTypeHandler}"
              checked
              name="default"
              >Default</anypoint-radio-button
            >
            <anypoint-radio-button
              @change="${this._listTypeHandler}"
              name="comfortable"
              >Comfortable</anypoint-radio-button
            >
            <anypoint-radio-button
              @change="${this._listTypeHandler}"
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
      @dragover="${this._dragoverHandler}"
      @dragleave="${this._dragleaveHandler}"
      @dragenter="${this._dragEnterHandler}"
      @drop="${this._dropHandler}">
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
      <anypoint-button @click="${this.generateData}">Generate data</anypoint-button>
      <anypoint-button @click="${this.deleteData}">Clear list</anypoint-button>
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
    <h2>ARC menu element</h2>
    ${this._demoTemplate()}
    ${this._controlsTemplate()}
    ${this._introductionTemplate()}
    ${this._usageTemplate()}
    ${this.exportTemplate()}
    `;
  }
}

const instance = new ComponentDemoPage();
instance.render();
