import { html } from 'lit-html';
import { DemoPage } from '@advanced-rest-client/arc-demo-helper';
import { v4 } from '@advanced-rest-client/uuid';
import '@advanced-rest-client/arc-demo-helper/arc-interactive-demo.js';
import '@anypoint-web-components/awc/anypoint-button.js';
import '@anypoint-web-components/awc/anypoint-checkbox.js';
import '@anypoint-web-components/awc/anypoint-dialog.js';
import '@anypoint-web-components/awc/anypoint-dialog-scrollable.js';
import { ExportHandlerMixin } from '@advanced-rest-client/arc-demo-helper/src/ExportHandlerMixin.js';
import listenEncoding from '@advanced-rest-client/arc-demo-helper/src/EncodingHelpers.js';
import { ArcMock } from '@advanced-rest-client/arc-mock';
import { RequestModel, ProjectModel, MockedStore, AuthDataModel, VariablesModel, ClientCertificateModel, UrlHistoryModel, UrlIndexer } from '@advanced-rest-client/idb-store'
import { ArcModelEvents, ImportEvents, ArcNavigationEventTypes, TransportEventTypes, TransportEvents } from '@advanced-rest-client/events';
import { MonacoLoader } from '@advanced-rest-client/monaco-support';
import { RequestFactory, ModulesRegistry, RequestAuthorization, ResponseAuthorization, ArcFetchRequest } from '../../index.js';
import '../../define/certificate-import.js';
import '../../define/saved-menu.js';
import '../../define/history-menu.js';
import '../../define/arc-request-panel.js';
import '../../define/request-meta-details.js';
import '../../define/request-meta-editor.js';

/** @typedef {import('@advanced-rest-client/events').ARCRequestNavigationEvent} ARCRequestNavigationEvent */
/** @typedef {import('@advanced-rest-client/events').ARCProjectNavigationEvent} ARCProjectNavigationEvent */
/** @typedef {import('@advanced-rest-client/events').ApiTransportEvent} ApiTransportEvent */
/** @typedef {import('@advanced-rest-client/events').ARCRequestDeletedEvent} ARCRequestDeletedEvent */
/** @typedef {import('@advanced-rest-client/events').ArcRequest.ArcEditorRequest} ArcEditorRequest */
/** @typedef {import('@advanced-rest-client/events').ArcExportFilesystemEvent} ArcExportFilesystemEvent */

ModulesRegistry.register(ModulesRegistry.request, '@advanced-rest-client/request-engine/request/request-authorization', RequestAuthorization, ['storage']);
ModulesRegistry.register(ModulesRegistry.response, '@advanced-rest-client/request-engine/response/request-authorization', ResponseAuthorization, ['storage', 'events']);

// @ts-ignore
const jexl = window.Jexl;

const REQUEST_STORE_KEY = 'demo.arc-request-ui.editorRequest';

class ComponentDemo extends ExportHandlerMixin(DemoPage) {
  constructor() {
    super();
    this.initObservableProperties([
      'request', 'requestId', 'withMenu', 'initialized', 'importingCertificate',
      'exportSheetOpened', 'exportFile', 'exportData'
    ]);
    this.componentName = 'ARC request editor';
    this.withMenu = false;
    this.initialized = false;
    this.importingCertificate = false;

    this.generator = new ArcMock();
    this.store = new MockedStore();
    this.requestModel = new RequestModel();
    this.projectModel = new ProjectModel();
    this.authDataModel = new AuthDataModel();
    this.variablesModel = new VariablesModel();
    this.clientCertificateModel = new ClientCertificateModel();
    this.urlHistoryModel = new UrlHistoryModel();
    this.urlIndexer = new UrlIndexer(window);
    this.requestModel.listen(window);
    this.projectModel.listen(window);
    this.authDataModel.listen(window);
    this.variablesModel.listen(window);
    this.clientCertificateModel.listen(window);
    this.urlHistoryModel.listen(window);
    this.urlIndexer.listen();

    /** 
     * @type {ArcEditorRequest}
     */
    this.request = {
      id: undefined,
      request: {
        url: window.location.href,
        method: 'GET',
      },
    };
    this.requestId = undefined;
    this.requestType = undefined;
    this.generator = new ArcMock();
    this.oauth2RedirectUri = 'http://auth.advancedrestclient.com/arc.html';
    this.url = '';
    // this.url = window.location.href;
    // this.url = 'https://xd.adobe.com/view/46b6a75a-0dfd-44ff-87c1-e1b843d03911-13e5/';
    // this.url = 'https://httpbin.org/brotli';
    // this.url = 'json.json';

    this.generateData = this.generateData.bind(this);
    this.deleteData = this.deleteData.bind(this);
    this.factory = new RequestFactory(window, jexl);
    this.requestRunner = new ArcFetchRequest();
    this._closeImportHandler = this._closeImportHandler.bind(this);
    this.urlKeyHandler = this.urlKeyHandler.bind(this);
    
    window.addEventListener(ArcNavigationEventTypes.navigateRequest, this.navigateRequestHandler.bind(this));
    window.addEventListener(ArcNavigationEventTypes.navigate, this.navigateHandler.bind(this));
    window.addEventListener(TransportEventTypes.request, this.makeRequest.bind(this));
    window.addEventListener(TransportEventTypes.abort, this.abortRequest.bind(this));
    window.addEventListener(TransportEventTypes.transport, this.transportRequest.bind(this));
    
    this.initEditors();
    this.restoreRequest();
    listenEncoding();

    this.renderViewControls = true;

    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      this.darkThemeActive = true;
    }
  }

  async initEditors() {
    await this.loadMonaco();
    this.initialized = true;
  }

  async generateData() {
    await this.store.insertSaved(100);
    await this.store.insertHistory(100);
    ImportEvents.dataImported(document.body);
  }

  async deleteData() {
    await this.store.destroySaved();
    await this.store.destroyHistory();
    ArcModelEvents.destroyed(document.body, 'all');
  }

  /**
   * @param {ARCRequestNavigationEvent} e 
   */
  navigateRequestHandler(e) {
    const node = /** @type HTMLElement */ (e.target);
    if (['saved-menu', 'history-menu'].includes(node.localName)) {
      this.setRequest(e.requestId, e.requestType);
    } else {
      console.log('Navigate request', e.requestId, e.requestType, e.route, e.action);
    }
  }

  navigateHandler(e) {
    if (e.route === 'client-certificate-import') {
      this.importingCertificate = true;
    }
  }

  _closeImportHandler() {
    this.importingCertificate = false;
  }

  async loadMonaco() {
    const base = `../../node_modules/monaco-editor/`;
    MonacoLoader.createEnvironment(base);
    await MonacoLoader.loadMonaco(base);
    await MonacoLoader.monacoReady();
  }

  /**
   * Sets a request data on the details element
   * @param {string} id The request id
   * @param {string} type The request type
   */
  async setRequest(id, type) {
    // this.request = undefined;
    this.requestId = id;
    this.requestType = type;
    const request = await ArcModelEvents.Request.read(document.body, type, id);
    this.request = {
      id: v4(),
      request,
    };
  }

  restoreRequest() {
    const data = localStorage.getItem(REQUEST_STORE_KEY);
    if (!data) {
      return;
    }
    try {
      const tmp = JSON.parse(data);
      if (tmp.id && tmp.request) {
        this.request = /** @type ArcEditorRequest */ (tmp);
      }
    } catch (e) {
      // 
    }
  }

  _requestChangeHandler() {
    const panel = document.querySelector('arc-request-panel');
    console.log('storing request data', panel.editorRequest);
    this.request = panel.editorRequest;

    localStorage.setItem(REQUEST_STORE_KEY, JSON.stringify(panel.editorRequest));
  }

  async makeRequest(e) {
    const transportRequest = e.detail;
    const request = await this.factory.processRequest(transportRequest);
    TransportEvents.transport(document.body, request.id, request.request);
  }

  /**
   * @param {ApiTransportEvent} e
   */
  async transportRequest(e) {
    const transportRequest = e.detail;
    const result = await this.requestRunner.execute(e.detail, e.detail.config);
    if (!result) {
      // the request has been aborted.
      return;
    }
    await this.factory.processResponse(result.request, result.transport, result.response);
    TransportEvents.response(document.body, transportRequest.id, transportRequest.request, result.transport, result.response);

    console.log(result);
  }

  abortRequest(e) {
    const { id } = e.detail;
    this.factory.abort(id);
    this.requestRunner.abort(id);
  }

  /**
   * @param {KeyboardEvent} e
   */
  urlKeyHandler(e) {
    if (!['Enter', 'NumpadEnter'].includes(e.code)) {
      return;
    }
    const { value } = /** @type HTMLInputElement */ (e.target);
    this.request = {
      id: v4(),
      request: {
        method: 'GET',
        url: value,
      }
    };
  }

  _demoTemplate() {
    if (!this.initialized) {
      return html`<progress></progress>`;
    }
    const {
      anypoint,
      request,
      withMenu,
      oauth2RedirectUri,
    } = this;
    return html`
      <section class="documentation-section">
        <div class="demo-app">
          ${withMenu ? html`<nav>
            <saved-menu ?anypoint="${anypoint}"></saved-menu>
            <history-menu ?anypoint="${anypoint}"></history-menu>
          </nav>` : ''}
          
          <arc-request-panel
            ?anypoint="${anypoint}"
            .editorRequest="${request}"
            .oauth2RedirectUri="${oauth2RedirectUri}"
            @change="${this._requestChangeHandler}"
            class="stacked"
          ></arc-request-panel>
        </div>
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
      <anypoint-checkbox
        aria-describedby="mainOptionsLabel"
        slot="options"
        name="withMenu"
        @change="${this._toggleMainOption}"
        title="Uses request objects instead of request ids"
      >
        Render menu
      </anypoint-checkbox>
    </section>`;
  }

  _certImportTemplate() {
    const { importingCertificate } = this;
    return html`
    <anypoint-dialog ?opened="${importingCertificate}">
      <anypoint-dialog-scrollable>
        <certificate-import @close="${this._closeImportHandler}"></certificate-import>
      </anypoint-dialog-scrollable>
    </anypoint-dialog>
    `;
  }

  demoRequest() {
    const jsonUrl = new URL('json.json', window.location.href).toString();
    return html`
    <section class="documentation-section">
      <h3>Demo request</h3>
      <input 
        type="url" 
        .value="${this.url}" 
        @keydown="${this.urlKeyHandler}" 
        class="url-input"
        list="inputOptions"
        aria-label="Enter the URL value"
      />
      <datalist id="inputOptions">
        <option value="${jsonUrl}"></option>
        <option value="https://xd.adobe.com/view/46b6a75a-0dfd-44ff-87c1-e1b843d03911-13e5/"></option>
        <option value="${window.location.href}"></option>
        <option value="https://httpbin.org/brotli"></option>
        <option value="https://httpbin.org/bytes/1000"></option>
        <option value="https://httpbin.org/image/svg"></option>
        <option value="https://httpbin.org/status/404"></option>
        <option value="https://httpbin.org/delay/2"></option>
      </datalist>
    </section>
    `;
  }

  contentTemplate() {
    return html`
      ${this._demoTemplate()}
      ${this._dataControlsTemplate()}
      ${this.demoRequest()}
      ${this._certImportTemplate()}
      ${this.exportTemplate()}
    `;
  }
}

const instance = new ComponentDemo();
instance.render();
