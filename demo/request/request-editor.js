import { html } from 'lit-html';
import { DemoPage } from '@advanced-rest-client/arc-demo-helper';
import '@advanced-rest-client/arc-demo-helper/arc-interactive-demo.js';
import '@anypoint-web-components/awc/anypoint-button.js';
import '@anypoint-web-components/awc/anypoint-checkbox.js';
import '@anypoint-web-components/awc/anypoint-dialog.js';
import '@anypoint-web-components/awc/anypoint-dialog-scrollable.js';
import { ExportHandlerMixin } from '@advanced-rest-client/arc-demo-helper/src/ExportHandlerMixin.js';
import listenEncoding from '@advanced-rest-client/arc-demo-helper/src/EncodingHelpers.js';
import { ArcMock } from '@advanced-rest-client/arc-mock';
import { RequestModel, ProjectModel, MockedStore, AuthDataModel, VariablesModel, ClientCertificateModel, UrlHistoryModel, UrlIndexer } from '@advanced-rest-client/idb-store'
import { ImportEvents, ArcNavigationEventTypes, TransportEventTypes, ArcModelEvents } from '@advanced-rest-client/events';
import { MonacoLoader } from '@advanced-rest-client/monaco-support';
import { v4 } from '@advanced-rest-client/uuid';
import { RequestFactory, ModulesRegistry, RequestAuthorization, ResponseAuthorization, ArcFetchRequest } from '../../index.js';
import '../../define/certificate-import.js';
import '../../define/saved-menu.js';
import '../../define/history-menu.js';
import '../../define/arc-request-editor.js';

/** @typedef {import('@advanced-rest-client/events').ARCRequestNavigationEvent} ARCRequestNavigationEvent */
/** @typedef {import('@advanced-rest-client/events').ARCProjectNavigationEvent} ARCProjectNavigationEvent */
/** @typedef {import('@advanced-rest-client/events').ARCRequestDeletedEvent} ARCRequestDeletedEvent */
/** @typedef {import('@advanced-rest-client/events').ArcRequest.ArcEditorRequest} ArcEditorRequest */

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
    ]);
    this.componentName = 'ARC request editor';
    this.anypoint = false;
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
      request: undefined,
    };
    this.requestId = undefined;
    this.requestType = undefined;
    this.oauth2RedirectUri = 'http://auth.advancedrestclient.com/arc.html';
    this.oauth2AuthorizationUri = `${window.location.protocol}//${window.location.host}${window.location.pathname}oauth-authorize.html`;

    this.factory = new RequestFactory(window, jexl);
    this._closeImportHandler = this._closeImportHandler.bind(this);
    
    window.addEventListener(ArcNavigationEventTypes.navigateRequest, this.navigateRequestHandler.bind(this));
    window.addEventListener(ArcNavigationEventTypes.navigate, this.navigateHandler.bind(this));
    window.addEventListener(TransportEventTypes.request, this.makeRequest.bind(this));
    
    
    this.initEditors();
    this.restoreRequest();

    this.renderViewControls = true;

    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      this.darkThemeActive = true;
    }

    listenEncoding();
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
    const editor = document.querySelector('arc-request-editor');
    const object = editor.serialize();
    console.log('storing request data', object);

    localStorage.setItem(REQUEST_STORE_KEY, JSON.stringify(object));
  }

  async makeRequest(e) {
    const transportRequest = e.detail;
    const request = await this.factory.processRequest(transportRequest);
    const runner = new ArcFetchRequest();
    const result = await runner.execute(request);

    await this.factory.processResponse(result.request, result.transport, result.response);
    console.log(result);
  }

  _demoTemplate() {
    if (!this.initialized) {
      return html`<progress></progress>`;
    }
    const {
      demoStates,
      darkThemeActive,
      anypoint,
      request,
      withMenu,
      oauth2AuthorizationUri,
      oauth2RedirectUri,
    } = this;

    const { id, request: baseRequest } = request;
    const { method, ui, url, actions, payload, authorization, config, headers } = (baseRequest || {});

    return html`
      <section class="documentation-section">
        <h3>Interactive demo</h3>
        <p>
          This demo lets you preview the HTTP request editor element with various configuration options.
        </p>

        <arc-interactive-demo
          .states="${demoStates}"
          @state-changed="${this._demoStateHandler}"
          ?dark="${darkThemeActive}"
        >
          <div class="demo-app" slot="content">
            ${withMenu ? html`<nav>
              <saved-menu ?anypoint="${anypoint}"></saved-menu>
              <history-menu ?anypoint="${anypoint}"></history-menu>
            </nav>` : ''}
            
            <arc-request-editor
              ?anypoint="${anypoint}"
              .requestId="${id}"
              .url="${url}"
              .method="${method}"
              .headers="${headers}"
              .responseActions="${actions && actions.response}"
              .requestActions="${actions && actions.request}"
              .payload="${payload}"
              .authorization="${authorization}"
              .uiConfig="${ui}"
              .config="${config}"
              .oauth2AuthorizationUri=${oauth2AuthorizationUri}
              .oauth2RedirectUri="${oauth2RedirectUri}"
              @change="${this._requestChangeHandler}"
            ></arc-request-editor>
          </div>

          <label slot="options" id="mainOptionsLabel">Options</label>
          <anypoint-checkbox
            aria-describedby="mainOptionsLabel"
            slot="options"
            name="withMenu"
            @change="${this._toggleMainOption}"
            title="Uses request objects instead of request ids"
          >
            Render menu
          </anypoint-checkbox>
        </arc-interactive-demo>
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

  contentTemplate() {
    return html`
      ${this._demoTemplate()}
      ${this._dataControlsTemplate()}
      ${this._certImportTemplate()}
      ${this.exportTemplate()}
    `;
  }
}

const instance = new ComponentDemo();
instance.render();
