/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable class-methods-use-this */
import { html, svg } from 'lit-html';
import { Events } from "@advanced-rest-client/events";
import '@anypoint-web-components/awc/anypoint-button.js';
import '@anypoint-web-components/awc/anypoint-radio-button.js';
import '@anypoint-web-components/awc/anypoint-radio-group.js';
import { 
  ProjectModel, 
  RequestModel, 
  RestApiModel, 
  AuthDataModel, 
  HostRulesModel, 
  VariablesModel, 
  UrlHistoryModel, 
  HistoryDataModel, 
  ClientCertificateModel, 
  WebsocketUrlHistoryModel, 
  UrlIndexer, 
  ArcDataImport,
  ImportFactory,
  ImportNormalize,
  readFile,
} from '@advanced-rest-client/idb-store'
import { findRoute, navigate, navigatePage } from "../lib/route.js";
import { ApplicationScreen } from './ApplicationScreen.js';

/** @typedef {import('lit-html').TemplateResult} TemplateResult */
/** @typedef {import('@anypoint-web-components/awc').AnypointRadioButtonElement} AnypointRadioButtonElement */
/** @typedef {import('@anypoint-web-components/awc').AnypointRadioGroupElement} AnypointRadioGroupElement */

/**
 * A screen that is rendered in the popup menu in the Advanced REST Client.
 */
export class DataImportScreen extends ApplicationScreen {
  static get routes() {
    return [
      {
        name: "api",
        pattern: "api",
      },
      {
        name: "arc",
        pattern: "arc",
      },
      {
        name: "postman",
        pattern: "postman",
      },
      {
        name: "start",
        pattern: "*",
      },
    ];
  }

  /** 
   * IDB data import processor.
   */
  #dataImport = new ArcDataImport(window);

  requestModel = new RequestModel();

  projectModel = new ProjectModel();

  restApiModel = new RestApiModel();

  authDataModel = new AuthDataModel();

  hostRulesModel = new HostRulesModel();

  variablesModel = new VariablesModel();

  urlHistoryModel = new UrlHistoryModel();

  historyDataModel = new HistoryDataModel();

  clientCertificateModel = new ClientCertificateModel();

  websocketUrlHistoryModel = new WebsocketUrlHistoryModel();

  constructor() {
    super();

    this.initObservableProperties(
      'route', 'routeParams', 'initializing', 'startSelection'
    );
    /** @type string */
    this.startSelection = undefined;

    /** 
     * @type {boolean} Whether the project is being restored from the metadata store.
     */
    this.initializing = false;
    /** 
     * @type {string} A loading state information.
     */
    this.loadingStatus = 'Initializing import feature...';
    window.onunhandledrejection = this.unhandledRejectionHandler.bind(this);
  }

  /**
   * Runs the logic to initialize the application.
   */
  async initialize() {
    this.initModels();
    this.listen();
    await this.loadTheme();
    await this.afterInitialization();
    this.initializing = false;
  }

  /**
   * Initializes ARC datastore models.
   */
  initModels() {
    this.urlIndexer = new UrlIndexer(this.eventTarget);
    this.requestModel.listen(this.eventTarget);
    this.projectModel.listen(this.eventTarget);
    this.restApiModel.listen(this.eventTarget);
    this.authDataModel.listen(this.eventTarget);
    this.hostRulesModel.listen(this.eventTarget);
    this.variablesModel.listen(this.eventTarget);
    this.urlHistoryModel.listen(this.eventTarget);
    this.historyDataModel.listen(this.eventTarget);
    this.clientCertificateModel.listen(this.eventTarget);
    this.websocketUrlHistoryModel.listen(this.eventTarget);
    this.urlIndexer.listen();
  }

  listen() {
    this.#dataImport.listen();
  }

  /**
   * Tasks to be performed after the application is initialized.
   */
  async afterInitialization() {
    window.onpopstate = () => {
      this.onRoute();
    }
    requestAnimationFrame(() => this.onRoute());
  }

  /**
   * @param {PromiseRejectionEvent} e
   */
  unhandledRejectionHandler(e) {
    /* eslint-disable-next-line no-console */
    console.error(e);
    this.reportCriticalError(e.reason);
  }

  /**
   * Called when route change
   */
  onRoute() {
    const url = new URL(window.location.href);
    const path = url.hash.replace('#', '');
    // @ts-ignore
    const { routes } = this.constructor;
    const result = findRoute(routes, path);
    if (!result) {
      return;
    }
    const { name } = result.route;
    this.route = name;
    this.routeParams = result.params;
    Events.Telemetry.view(this.eventTarget, name);
  }

  /**
   * Returns to the main application page.
   */
  quitHandler() {
    navigatePage('app.html');
  }

  /**
   * @param {Event} e
   */
  flowSelectHandler(e) {
    const group = /** @type AnypointRadioGroupElement */ (e.target);
    const item = /** @type AnypointRadioButtonElement */ (group.selectedItem);
    if (!item) {
      return;
    }
    this.startSelection = item.value;
  }

  /**
   * Changes the app route based on the current flow selection.
   */
  selectFlowHandler() {
    const { startSelection } = this;
    if (!startSelection) {
      this.reportCriticalError('No selection has been made.');
      return;
    }
    navigate(startSelection);
  }

  /**
   * Selects API file.
   * Most likely it is a zip file with an API spec.
   * In electron it can be a path to an API project.
   */
  async selectApiHandler() {
    throw new Error(`Not yet implemented`);
  }

  /**
   * Selects ARC exported file.
   */
  async selectArcHandler() {
    throw new Error(`Not yet implemented`);
  }

  /**
   * Selects Postman exported file.
   */
  async selectPostmanHandler() {
    throw new Error(`Not yet implemented`);
  }

  /**
   * Processes the ARC import data and renders the inspector, when needed.
   * @param {File|Buffer} contents
   */
  async processArcData(contents) {
    const id = new Date().toISOString();
    Events.Process.loadingstart(this.eventTarget, id, 'Processing file data');

    const typedFile = /** @type File */ (contents);
    const isFile = !(contents instanceof Uint8Array);
    let content;
    if (!isFile) {
      content = contents.toString();
    } else {
      content = await readFile(typedFile);
    }
    content = content.trim();
    content = await this.decryptIfNeeded(content);

    try {
      const processor = new ImportNormalize();
      const importData = await processor.normalize(content);
      this.inspectorData = importData;
      this.route = 'inspect';
    } catch (e) {
      this.reportCriticalError('Unknown file format');
    }
    Events.Process.loadingstop(this.eventTarget, id);
  }

  /**
   * Processes the Postman import data and renders the inspector, when needed.
   * @param {File|Buffer} contents
   */
  async processPostmanData(contents) {
    return this.processArcData(contents);
  }

  /**
   * Processes incoming data and if encryption is detected then id processes
   * the file for decryption.
   *
   * @param {string} content File content
   * @return {Promise<string>} The content of the file.
   */
  async decryptIfNeeded(content) {
    const headerIndex = content.indexOf('\n');
    const header = content.substr(0, headerIndex).trim();
    if (header === 'aes') {
      const data = content.substr(headerIndex + 1);
      // eslint-disable-next-line no-param-reassign
      content = await Events.Encryption.decrypt(this.eventTarget, data, undefined, 'aes');
      // content = await this.encryption.decode('aes', data);
    }
    return content;
  }

  /**
   * A handler for an event dispatched by the data inspector to import data.
   * @param {CustomEvent} e
   */
  async inspectorImportDataHandler(e) {
    const { detail } = e;
    const store = new ImportFactory();
    await store.importData(detail);
    const { savedIndexes=[], historyIndexes=[] } = store;

    await this.urlIndexer.index(savedIndexes);
    await this.urlIndexer.index(historyIndexes);
        
    Events.DataImport.dataImported(document.body);
    navigatePage('app.html');
  }

  appTemplate() {
    const { initializing } = this;
    if (initializing) {
      return this.loaderTemplate();
    }
    return html`
    ${this.headerTemplate()}
    <div class="content">
      ${this.pageTemplate(this.route)}
    </div>
    `;
  }

  /**
   * @param {string} route The current route
   * @returns {TemplateResult} The template for the page content
   */
  pageTemplate(route) {
    return html`
    <main id="main">
      ${this.startTemplate(route)}
      ${this.importApiTemplate(route)}
      ${this.importArcTemplate(route)}
      ${this.importPostmanTemplate(route)}
      ${this.inspectorTemplate(route)}
    </main>
    `;
  }

  /**
   * @param {string} route The current route
   * @returns {TemplateResult|string} The template for the start screen
   */
  startTemplate(route) {
    if (route !== 'start') {
      return '';
    }
    const { startSelection } = this;
    return html`
    <div class="screen">
      <h2>Data import</h2>
      <p>Here you can import previously stored data into the application.</p>

      <p class="question" id="importTypeLabel">What are you importing?</p>
      <div class="button-options">
        <anypoint-radio-group selectable="anypoint-radio-button" attrForSelected="value" aria-labelledby="importTypeLabel" @select="${this.flowSelectHandler}">
          <anypoint-radio-button name="importType" value="arc">ARC data from any previous version</anypoint-radio-button>
          <anypoint-radio-button name="importType" value="postman">Postman's data export or a backup</anypoint-radio-button>
          <anypoint-radio-button name="importType" value="api">RAML/OAS/Async API specification</anypoint-radio-button>
        </anypoint-radio-group>
      </div>

      <div class="main-actions">
        <anypoint-button emphasis="low" @click="${this.quitHandler}">Cancel</anypoint-button>
        <anypoint-button emphasis="high" ?disabled="${!startSelection}" @click="${this.selectFlowHandler}">Next</anypoint-button>
      </div>
    </div>
    `;
  }

  /**
   * @param {string} route The current route
   * @returns {TemplateResult|string} The template for the start screen
   */
  importApiTemplate(route) {
    if (route !== 'api') {
      return '';
    }
    const { anypoint } = this;
    return html`
    <div class="screen">
      <h2>Import API specification</h2>
      <arc-icon class="api-icon" icon="ramlR"></arc-icon>
      <p>Currently we support:</p>
      <ul>
        <li>RAML 0.8</li>
        <li>RAML 1.0</li>
        <li>OAS 2.0</li>
        <li>OAS 3.0</li>
        <li>Async 2.0</li>
      </ul>
      <anypoint-button ?anypoint="${anypoint}" @click="${this.selectApiHandler}">Select file</anypoint-button>
    </div>
    `;
  }

  /**
   * @param {string} route The current route
   * @returns {TemplateResult|string} The template for the import ARC data screen.
   */
  importArcTemplate(route) {
    if (route !== 'arc') {
      return '';
    }
    const { anypoint } = this;
    return html`
    <div class="screen">
      <h2>Import ARC data</h2>
      <arc-icon class="arc-icon" icon="arcIcon"></arc-icon>
      <p>Import data from any previous version of Advanced REST Client.</p>
      <anypoint-button ?anypoint="${anypoint}" @click="${this.selectArcHandler}">Select file</anypoint-button>
    </div>
    `;
  }

  /**
   * @param {string} route The current route
   * @returns {TemplateResult|string} The template for the import ARC data screen.
   */
  importPostmanTemplate(route) {
    if (route !== 'postman') {
      return '';
    }
    const { anypoint } = this;
    return html`
    <div class="screen">
      <h2>Import Postman data</h2>
      ${svg`<svg class="postman-logo" enable-background="new 0 0 751.6 300" viewBox="0 0 751.6 300" xmlns="http://www.w3.org/2000/svg"><g fill="#ff6c37"><path d="m275 166.6v-57.9c0-.7.3-1.3.8-1.8.6-.5 1.3-.8 2.1-.7h16.3c4.8-.2 9.6 1.4 13.3 4.5 3.3 3 5 7.7 5 14.1v.8c0 6.4-1.7 11.2-5.1 14.2-3.8 3.1-8.6 4.8-13.5 4.5h-11.6v22.3c0 .8-.4 1.5-1.1 1.9-1.6.9-3.5.9-5.1 0-.7-.4-1.1-1.1-1.1-1.9zm7.2-28.3h11.7c3.1.2 6.2-.9 8.4-3.1 2.2-2.5 3.3-5.8 3-9.2v-1c.3-3.3-.8-6.6-3-9.2-2.3-2.1-5.3-3.2-8.4-3h-11.6z"/><path d="m337.7 150.9v-25.9c0-6.5 1.7-11.2 5-14.2 8-6 19-6 27 0 3.4 3 5.1 7.8 5.1 14.2v25.9c0 6.5-1.7 11.2-5.1 14.2-8 6.1-19 6.1-27 0-3.3-3-5-7.7-5-14.2zm7.3 0c0 8.1 3.7 12.2 11.3 12.2 3.1.2 6.1-.9 8.4-3 2.2-2.5 3.2-5.8 3-9.2v-26c.3-3.3-.8-6.6-3-9.2-2.3-2.1-5.3-3.2-8.4-3-7.5 0-11.2 4-11.2 12.2z"/><path d="m400.4 160.3c0-1 .4-1.9 1-2.7.5-.7 1.2-1.2 2.1-1.3.8.1 1.5.5 2 1.1.8.7 1.6 1.5 2.5 2.4 1.2 1.1 2.6 1.9 4.1 2.4 2 .8 4.2 1.1 6.3 1.1 3.2.2 6.3-.8 8.8-2.7 2.2-2 3.4-5 3.2-8 .1-2.9-.9-5.6-2.9-7.7-2-2-4.4-3.5-7.1-4.5-2.8-1-5.5-2.1-8.4-3.3-2.8-1.2-5.2-3-7.1-5.4-2-2.7-3.1-6-2.9-9.4-.1-2.7.5-5.4 1.7-7.9 1-2.1 2.6-3.8 4.6-5 1.9-1.1 3.9-1.9 6-2.5 2.2-.5 4.4-.8 6.6-.8 3.5 0 6.9.5 10.2 1.5 3.2 1.1 4.9 2.5 4.9 4.2 0 .9-.3 1.8-.9 2.6-.4.8-1.3 1.4-2.2 1.4-1.3-.4-2.6-.9-3.9-1.5-2.5-1.1-5.2-1.7-8-1.6-2.9-.1-5.9.6-8.4 2.1-2.2 1.5-3.4 4.1-3.2 6.8-.1 2.5.9 4.9 2.8 6.5 2.1 1.7 4.5 3.1 7.1 3.9 2.8 1 5.6 2.1 8.4 3.4 2.8 1.4 5.2 3.5 7 6.1 2 3.2 3 6.9 2.9 10.7 0 5.9-1.7 10.4-5.2 13.4-3.8 3.2-8.7 4.8-13.7 4.5-4.5.1-9-1-12.9-3.2-3.6-2.4-5.4-4.5-5.4-6.6z"/><path d="m459.1 109.4c0-.8.2-1.6.7-2.2.4-.7 1.1-1 1.9-1h35c.8 0 1.5.3 1.9 1 .5.6.7 1.4.7 2.2s-.2 1.7-.7 2.4c-.4.7-1.1 1-1.9 1h-13.7v53.8c0 .8-.4 1.5-1.1 1.9-1.6.9-3.5.9-5.1 0-.7-.4-1.1-1.1-1.1-1.9v-53.8h-13.9c-.8 0-1.5-.3-1.9-1-.5-.7-.8-1.5-.8-2.4z"/><path d="m523.9 166.6v-56.7c-.3-1.7.9-3.3 2.6-3.6.4-.1.8-.1 1.1 0 2.3 0 4.2 1.5 5.8 4.6l13.5 25.9 13.6-25.9c1.7-3 3.6-4.6 5.8-4.6 1.7-.3 3.3.9 3.6 2.6.1.3.1.6 0 .9v56.7c0 .8-.4 1.5-1.1 1.9-1.6.9-3.5.9-5.1 0-.7-.4-1.1-1.1-1.1-1.9v-45.1l-13 24.4c-.4 1.2-1.5 2.1-2.8 2.1-1.2-.1-2.3-.9-2.7-2.1l-13-24.9v45.6c0 .8-.4 1.5-1.1 1.9-.7.5-1.6.8-2.4.8-.9 0-1.8-.2-2.5-.7-.8-.3-1.3-1.1-1.2-1.9z"/><path d="m594.6 166.2c0-.2.1-.5.2-.7l17.6-56.7c.5-1.7 2-2.5 4.4-2.5s3.9.8 4.4 2.5l17.7 57v.3.2c0 .9-.6 1.7-1.4 2.1-.9.6-2 .9-3.2.8-1.1.1-2.2-.5-2.6-1.6l-3.8-12.6h-22.6l-3.8 12.6c-.3 1.1-1.5 1.8-2.6 1.7-1 0-2-.3-2.9-.9-.9-.4-1.4-1.2-1.4-2.2zm12.5-17.2h19.3l-9.6-32.2z"/><path d="m663.8 166.6v-57.9c0-1.7 1.2-2.5 3.6-2.5 1.1 0 2.2.4 3.1 1.1 1 1 1.9 2.2 2.4 3.5l21.5 42v-44.1c0-.8.4-1.5 1.1-1.8 1.6-.9 3.5-.9 5.1 0 .7.4 1.1 1.1 1.1 1.8v57.9c0 .8-.4 1.5-1.1 1.9-.8.5-1.6.7-2.5.7-2-.1-3.8-1.4-4.5-3.3l-22.6-43.3v44c0 .8-.4 1.5-1 1.9-1.6.9-3.5.9-5.1 0-.7-.4-1.1-1.1-1.1-1.9z"/><path d="m241.7 150.7c7-54.8-31.7-104.9-86.4-111.9s-105 31.7-112 86.4 31.7 104.9 86.4 112c54.8 7 104.9-31.7 112-86.5z"/></g><path d="m178.6 102.2-42.2 42.2-11.9-11.9c41.5-41.5 45.6-37.9 54.1-30.3z" fill="#fff"/><path d="m136.4 145.4c-.3 0-.5-.1-.7-.3l-12-11.9c-.4-.4-.4-1 0-1.4 42.2-42.2 46.6-38.2 55.5-30.2.2.2.3.4.3.7s-.1.5-.3.7l-42.2 42.1c-.1.2-.4.3-.6.3zm-10.5-12.9 10.5 10.5 40.7-40.7c-7.4-6.6-12.4-8.6-51.2 30.2z" fill="#ff6c37"/><path d="m148.5 156.5-11.5-11.5 42.2-42.2c11.3 11.4-5.6 29.9-30.7 53.7z" fill="#fff"/><path d="m148.5 157.5c-.3 0-.5-.1-.7-.3l-11.5-11.5c-.2-.2-.2-.4-.2-.7s.1-.5.3-.7l42.2-42.2c.4-.4 1-.4 1.4 0 2.6 2.4 4 5.8 3.9 9.3-.2 11.1-12.8 25.2-34.6 45.8-.3.2-.6.3-.8.3zm-10.1-12.5c6.4 6.5 9.1 9.1 10.1 10.1 16.8-16 33.1-32.4 33.2-43.7.1-2.6-.9-5.2-2.6-7.2z" fill="#ff6c37"/><path d="m124.7 132.8 8.5 8.5c.2.2.2.4 0 .6-.1.1-.1.1-.2.1l-17.6 3.8c-.9.1-1.7-.5-1.9-1.4-.1-.5.1-1 .4-1.3l10.2-10.2c.2-.2.5-.3.6-.1z" fill="#fff"/><path d="m115.1 146.8c-1.5 0-2.6-1.2-2.6-2.7 0-.7.3-1.4.8-1.9l10.2-10.2c.6-.5 1.4-.5 2 0l8.5 8.5c.6.5.6 1.4 0 2-.2.2-.4.3-.7.4l-17.6 3.8c-.2 0-.4.1-.6.1zm9.3-12.9-9.8 9.8c-.2.2-.3.5-.1.8.1.3.4.4.7.3l16.5-3.6z" fill="#ff6c37"/><path d="m200.9 78.8c-6.4-6.2-16.7-6-22.9.5s-6 16.7.5 22.9c5.3 5.1 13.3 6 19.6 2.2l-11.4-11.4z" fill="#fff"/><path d="m189.7 107.7c-9.5 0-17.2-7.7-17.2-17.2s7.7-17.2 17.2-17.2c4.4 0 8.7 1.7 11.9 4.8.2.2.3.4.3.7s-.1.5-.3.7l-13.5 13.5 10.6 10.6c.4.4.4 1 0 1.4-.1.1-.1.1-.2.2-2.6 1.6-5.7 2.5-8.8 2.5zm0-32.3c-8.4 0-15.2 6.8-15.1 15.2 0 8.4 6.8 15.2 15.2 15.1 2.3 0 4.6-.5 6.7-1.6l-10.5-10.4c-.2-.2-.3-.4-.3-.7s.1-.5.3-.7l13.4-13.4c-2.7-2.3-6.1-3.5-9.7-3.5z" fill="#ff6c37"/><path d="m201.2 79.1-.2-.2-14.3 14.1 11.3 11.3c1.1-.7 2.2-1.5 3.1-2.4 6.4-6.3 6.4-16.5.1-22.8z" fill="#fff"/><path d="m198.1 105.4c-.3 0-.5-.1-.7-.3l-11.4-11.4c-.2-.2-.3-.4-.3-.7s.1-.5.3-.7l14.2-14.2c.4-.4 1-.4 1.4 0l.3.2c6.7 6.7 6.7 17.5.1 24.3-1 1-2.1 1.9-3.3 2.6-.3.1-.5.2-.6.2zm-10-12.4 10.1 10.1c.8-.5 1.6-1.2 2.2-1.8 5.7-5.7 6-15 .5-21z" fill="#ff6c37"/><path d="m180.3 104c-2.4-2.4-6.3-2.4-8.7 0l-37.7 37.7 6.3 6.3 39.9-35c2.6-2.2 2.8-6.1.6-8.7-.2-.1-.3-.2-.4-.3z" fill="#fff"/><path d="m140.1 149c-.3 0-.5-.1-.7-.3l-6.3-6.3c-.4-.4-.4-1 0-1.4l37.7-37.7c2.8-2.8 7.3-2.8 10.1 0 2.8 2.8 2.8 7.3 0 10.1-.1.1-.2.2-.3.3l-39.9 35c-.1.2-.3.3-.6.3zm-4.8-7.3 4.9 4.9 39.2-34.4c2.2-1.8 2.4-5.1.6-7.3s-5.1-2.4-7.3-.6c-.1.1-.2.2-.4.3z" fill="#ff6c37"/><path d="m105 184.6c-.4.2-.6.6-.5 1l1.7 7.2c.4 1-.2 2.2-1.3 2.5-.8.3-1.7 0-2.2-.6l-11-10.9 35.9-35.9 12.4.2 8.4 8.4c-2 1.7-14.1 13.4-43.4 28.1z" fill="#fff"/><path d="m104.2 196.3c-.8 0-1.6-.3-2.1-.9l-10.9-10.9c-.2-.2-.3-.4-.3-.7s.1-.5.3-.7l35.9-35.9c.2-.2.5-.3.7-.3l12.4.2c.3 0 .5.1.7.3l8.4 8.4c.2.2.3.5.3.8s-.1.5-.4.7l-.7.6c-10.6 9.3-25 18.6-42.9 27.5l1.7 7.1c.3 1.3-.3 2.7-1.5 3.4-.6.3-1.1.4-1.6.4zm-11-12.5 10.3 10.2c.3.5.9.7 1.4.4s.7-.9.4-1.4l-1.7-7.2c-.2-.9.2-1.7 1-2.1 17.7-8.9 32-18.1 42.5-27.2l-7.4-7.4-11.5-.2z" fill="#ff6c37"/><path d="m83.2 192.4 8.6-8.6 12.8 12.8-20.4-1.4c-.9-.1-1.5-.9-1.4-1.8 0-.4.1-.8.4-1z" fill="#fff"/><path d="m104.6 197.5-20.5-1.4c-1.5-.1-2.5-1.4-2.4-2.9.1-.6.3-1.2.8-1.6l8.6-8.6c.4-.4 1-.4 1.4 0l12.8 12.8c.3.3.4.7.2 1.1s-.5.6-.9.6zm-12.8-12.3-7.9 7.9c-.3.2-.3.7 0 .9.1.1.2.2.4.2l17.7 1.2z" fill="#ff6c37"/><path d="m124.1 152.5c-.6 0-1-.5-1-1 0-.3.1-.5.3-.7l9.7-9.7c.4-.4 1-.4 1.4 0l6.3 6.3c.3.3.4.6.3 1-.1.3-.4.6-.8.7l-16 3.4c-.1 0-.2 0-.2 0zm9.7-9.3-6.6 6.6 10.8-2.3z" fill="#ff6c37"/><path d="m140 148.1-11 2.4c-.8.2-1.6-.3-1.8-1.1-.1-.5 0-1 .4-1.4l6.1-6.1z" fill="#fff"/><path d="m128.8 151.5c-1.4 0-2.5-1.1-2.5-2.5 0-.7.3-1.3.7-1.8l6.1-6.1c.4-.4 1-.4 1.4 0l6.3 6.3c.3.3.4.6.3 1-.1.3-.4.6-.8.7l-11 2.4c-.2 0-.4 0-.5 0zm5-8.3-5.4 5.4c-.2.2-.2.4-.1.6s.3.3.6.3l9.2-2z" fill="#ff6c37"/><path d="m201.3 88.7c-.2-.6-.9-.9-1.5-.7s-.9.9-.7 1.5c0 .1.1.2.1.3.6 1.2.4 2.7-.4 3.8-.4.5-.3 1.2.1 1.6.5.4 1.2.3 1.6-.2 1.5-1.9 1.8-4.3.8-6.3z" fill="#ff6c37"/></svg>`}
      <p>You can import Postman collections and backup data.</p>
      <anypoint-button ?anypoint="${anypoint}" @click="${this.selectPostmanHandler}">Select file</anypoint-button>
    </div>
    `;
  }

  /**
   * @param {string} route The current route
   * @returns {TemplateResult|string} The template for the ARC data inspector table.
   */
  inspectorTemplate(route) {
    if (route !== 'inspect') {
      return '';
    }
    const { anypoint, inspectorData } = this;
    return html`
    <div class="screen">
      <import-data-inspector
        .data="${inspectorData}"
        class="screen"
        ?anypoint="${anypoint}"
        @cancel="${this.quitHandler}"
        @import="${this.inspectorImportDataHandler}"
      ></import-data-inspector>
    </div>
    `;
  }

  /**
   * @returns {TemplateResult|string} The template for the header
   */
  headerTemplate() {
    return html`
    <header>
      Advanced REST Client by MuleSoft.
    </header>`;
  }
}
