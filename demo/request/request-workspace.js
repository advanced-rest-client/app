import { html } from 'lit-html';
import { DemoPage } from '@advanced-rest-client/arc-demo-helper';
import '@anypoint-web-components/awc/anypoint-button.js';
import '@anypoint-web-components/awc/anypoint-checkbox.js';
import '@anypoint-web-components/awc/anypoint-dialog.js';
import '@anypoint-web-components/awc/anypoint-dialog-scrollable.js';
import '@anypoint-web-components/awc/bottom-sheet.js';
import { ExportHandlerMixin } from '@advanced-rest-client/arc-demo-helper/src/ExportHandlerMixin.js';
import listenEncoding from '@advanced-rest-client/arc-demo-helper/src/EncodingHelpers.js';
import { ArcMock } from '@advanced-rest-client/arc-mock';
import { RequestModel, ProjectModel, MockedStore, AuthDataModel, VariablesModel, ClientCertificateModel, UrlHistoryModel, UrlIndexer, HistoryDataModel, WebsocketUrlHistoryModel } from '@advanced-rest-client/idb-store'
import { ArcModelEvents, ImportEvents, ArcNavigationEventTypes, TransportEventTypes, TransportEvents, WorkspaceEventTypes, ProjectActions, SessionCookieEventTypes, AuthorizationEventTypes } from '@advanced-rest-client/events';
import { MonacoLoader } from '@advanced-rest-client/monaco-support';
import { RequestFactory, ModulesRegistry, RequestAuthorization, ResponseAuthorization, ArcFetchRequest, RequestCookies, OAuth2Authorization } from '../../index.js';
import '../../define/certificate-import.js';
import '../../define/oidc-authorization.js'
import '../../define/saved-menu.js';
import '../../define/history-menu.js';
import '../../define/projects-menu.js';
import '../../define/arc-request-workspace.js';

/** @typedef {import('@advanced-rest-client/events').ARCRequestNavigationEvent} ARCRequestNavigationEvent */
/** @typedef {import('@advanced-rest-client/events').ARCProjectNavigationEvent} ARCProjectNavigationEvent */
/** @typedef {import('@advanced-rest-client/events').ApiTransportEvent} ApiTransportEvent */
/** @typedef {import('@advanced-rest-client/events').ARCRequestDeletedEvent} ARCRequestDeletedEvent */
/** @typedef {import('@advanced-rest-client/events').WorkspaceReadEvent} WorkspaceReadEvent */
/** @typedef {import('@advanced-rest-client/events').WorkspaceWriteEvent} WorkspaceWriteEvent */
/** @typedef {import('@advanced-rest-client/events').ArcRequest.ArcEditorRequest} ArcEditorRequest */
/** @typedef {import('@advanced-rest-client/events').Workspace.DomainWorkspace} DomainWorkspace */
/** @typedef {import('@advanced-rest-client/events').OAuth2AuthorizeEvent} OAuth2AuthorizeEvent */
/** @typedef {import('@advanced-rest-client/events').Authorization.TokenInfo} TokenInfo */
/** @typedef {import('@advanced-rest-client/events').Authorization.OAuth2Authorization} OAuth2Settings */

ModulesRegistry.register(ModulesRegistry.request, '@advanced-rest-client/request-engine/request/request-authorization', RequestAuthorization, ['store', 'events']);
ModulesRegistry.register(ModulesRegistry.response, '@advanced-rest-client/request-engine/response/request-authorization', ResponseAuthorization, ['store', 'events']);
ModulesRegistry.register(ModulesRegistry.request, '@advanced-rest-client/request-engine/request/cookies', RequestCookies.processRequestCookies, ['events']);
ModulesRegistry.register(ModulesRegistry.response, '@advanced-rest-client/request-engine/response/cookies', RequestCookies.processResponseCookies, ['events']);

// @ts-ignore
const jexl = window.Jexl;

// const WORKSPACE_STORE_KEY = 'demo.arc-request-ui.workspace';

class ComponentDemo extends ExportHandlerMixin(DemoPage) {
  get workspace() {
    return document.querySelector('arc-request-workspace');
  }

  constructor() {
    super();
    this.initObservableProperties([
      'withMenu', 'initialized', 'importingCertificate',
      'workspaceId', 'renderSend', 'progressInfo', 'noSendOnLoading',
    ]);
    this.componentName = 'ARC request workspace';
    this.renderViewControls = true;
    this.withMenu = false;
    this.initialized = false;
    this.importingCertificate = false;
    this.renderSend = false;
    this.progressInfo = false;
    this.noSendOnLoading = false;
    this.workspaceId = 'default';
    
    this.generator = new ArcMock();
    this.store = new MockedStore();
    this.requestModel = new RequestModel();
    this.projectModel = new ProjectModel();
    this.authDataModel = new AuthDataModel();
    this.variablesModel = new VariablesModel();
    this.clientCertificateModel = new ClientCertificateModel();
    this.urlHistoryModel = new UrlHistoryModel();
    this.historyDataModel = new HistoryDataModel();
    this.websocketUrlHistoryModel = new WebsocketUrlHistoryModel();
    this.urlIndexer = new UrlIndexer(window);
    this.requestModel.listen(window);
    this.projectModel.listen(window);
    this.authDataModel.listen(window);
    this.variablesModel.listen(window);
    this.clientCertificateModel.listen(window);
    this.urlHistoryModel.listen(window);
    this.historyDataModel.listen(window);
    this.websocketUrlHistoryModel.listen(window);
    this.urlIndexer.listen();

    this.oauth2RedirectUri = 'https://auth.advancedrestclient.com/arc.html';
    
    this.generateData = this.generateData.bind(this);
    this.deleteData = this.deleteData.bind(this);
    this.factory = new RequestFactory(window, jexl);
    this.requestRunner = new ArcFetchRequest();
    this._closeImportHandler = this._closeImportHandler.bind(this);
    this.openMetaDetailsHandler = this.openMetaDetailsHandler.bind(this);
    this.openMetaEditorHandler = this.openMetaEditorHandler.bind(this);
    window.addEventListener(ArcNavigationEventTypes.navigateRequest, this.navigateRequestHandler.bind(this));
    window.addEventListener(ArcNavigationEventTypes.navigate, this.navigateHandler.bind(this));
    window.addEventListener(ArcNavigationEventTypes.navigateProject, this.navigateProjectHandler.bind(this));
    window.addEventListener(TransportEventTypes.request, this.makeRequest.bind(this));
    window.addEventListener(TransportEventTypes.abort, this.abortRequest.bind(this));
    window.addEventListener(TransportEventTypes.transport, this.transportRequest.bind(this));
    window.addEventListener(WorkspaceEventTypes.read, this._workspaceReadHandler.bind(this));
    window.addEventListener(WorkspaceEventTypes.write, this._workspaceWriteHandler.bind(this));
    window.addEventListener(AuthorizationEventTypes.OAuth2.authorize, this._oauth2AuthorizeHandler.bind(this));
    window.addEventListener(SessionCookieEventTypes.update, (e) => {
      // @ts-ignore
      console.log('Cookie update', e.cookie);
    });
    
    this.initEditors();
    listenEncoding();
  }

  async initEditors() {
    await this.loadMonaco();
    this.initialized = true;
  }

  async generateData() {
    await this.store.insertSaved(100, 5, { forceProject: true, forceDescription: true });
    await this.store.insertHistory(100);
    ImportEvents.dataImported(document.body);
  }

  async deleteData() {
    await this.store.destroySaved();
    await this.store.destroyHistory();
    ArcModelEvents.destroyed(document.body, 'all');
  }

  /**
   * @param {WorkspaceReadEvent} e 
   */
  _workspaceReadHandler(e) {
    const { id } = e.detail;
    e.detail.result = this.readWorkspaceState(id);
  }

  /**
   * @param {WorkspaceWriteEvent} e 
   */
  _workspaceWriteHandler(e) {
    const { id, contents } = e.detail;
    e.detail.result = this.writeWorkspaceState(contents, id);
  }

  getWorkspaceKey(id) {
    return ['demo', 'arc-request-ui', 'workspace', id].join('.');
  }

  /**
   * Mimics ARC's reading workspace file.
   * @param {string} [id='default'] The id of the workspace
   * @returns {Promise<DomainWorkspace>}
   */
  async readWorkspaceState(id='default') {
    const key = this.getWorkspaceKey(id);
    const raw = localStorage.getItem(key);
    let result = /** @type DomainWorkspace */ (null);
    try {
      const data = JSON.parse(raw);
      console.log(data);
      if (data && data.kind === 'ARC#DomainWorkspace') {
        result = data;
      }
    } catch (e) {
      // ...
    }
    return result;
  }

  /**
   * Writes workspace data to the store.
   * @param {DomainWorkspace} data
   * @param {string} [id='default']
   * @returns {Promise<void>}
   */
  async writeWorkspaceState(data, id='default') {
    const key = this.getWorkspaceKey(id);
    const raw = JSON.stringify(data);
    localStorage.setItem(key, raw);
  }

  /**
   * @param {ARCRequestNavigationEvent} e 
   */
  navigateRequestHandler(e) {
    const { requestId, requestType, action } = e;
    if (action !== 'open') {
      return;
    }
    this.workspace.addByRequestId(requestType, requestId);
  }

  /**
   * @param {ARCProjectNavigationEvent} e
   */
  navigateProjectHandler(e) {
    const { id, action, route } = e;
    if (route !== 'project') {
      return;
    }
    if (action === ProjectActions.addWorkspace) {
      this.workspace.appendByProjectId(id);
    } else if (action === ProjectActions.replaceWorkspace) {
      this.workspace.replaceByProjectId(id);
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

  async makeRequest(e) {
    const transportRequest = e.detail;
    try {
      const request = await this.factory.processRequest(transportRequest);
      TransportEvents.transport(document.body, request.id, request.request);
    } catch (ex) {
      TransportEvents.response(document.body, transportRequest.id, transportRequest.request, null, {
        error: ex,
        loadingTime: 0,
        status: 0,
      });
    }
  }

  /**
   * @param {ApiTransportEvent} e
   */
  async transportRequest(e) {
    const transportRequest = e.detail;
    const result = await this.requestRunner.execute(e.detail, e.detail.config);
    if (!result) {
      // the request has been aborted.
      TransportEvents.response(document.body, transportRequest.id, transportRequest.request, null, {
        error: new Error('Request timeout'),
        loadingTime: 0,
        status: 0,
      });
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

  openMetaDetailsHandler() {
    this.workspace.openWorkspaceDetails();
  }

  openMetaEditorHandler() {
    this.workspace.openWorkspaceEditor();
  }

  /**
   * @param {OAuth2AuthorizeEvent} e
   */
  _oauth2AuthorizeHandler(e) {
    const config = { ...e.detail };
    e.detail.result = this.authorize(config);
  }

  /**
   * Authorize the user using provided settings.
   * This is left for anypoint. Use the `OAuth2Authorization` instead.
   *
   * @param {OAuth2Settings} settings The authorization configuration.
   * @returns {Promise<TokenInfo>}
   */
  async authorize(settings) {
    const auth = new OAuth2Authorization(settings);
    auth.checkConfig();
    return auth.authorize();
  }

  _demoTemplate() {
    if (!this.initialized) {
      return html`<progress></progress>`;
    }
    const {
      anypoint,
      withMenu,
      oauth2RedirectUri,
      workspaceId,
      renderSend,
      progressInfo,
      noSendOnLoading,
    } = this;
    return html`
    <section class="documentation-section">
      <div class="demo-app">
        ${withMenu ? html`<nav>
          <saved-menu ?anypoint="${anypoint}" draggableEnabled></saved-menu>
          <history-menu ?anypoint="${anypoint}" draggableEnabled></history-menu>
          <projects-menu ?anypoint="${anypoint}" draggableEnabled></projects-menu>
        </nav>` : ''}
        
        <arc-request-workspace
          ?anypoint="${anypoint}"
          ?renderSend="${renderSend}"
          ?progressInfo="${progressInfo}"
          ?noSendOnLoading="${noSendOnLoading}"
          .oauth2RedirectUri="${oauth2RedirectUri}"
          backendId="${workspaceId}"
          autoRead
        ></arc-request-workspace>
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
      <anypoint-checkbox
        aria-describedby="mainOptionsLabel"
        slot="options"
        name="renderSend"
        @change="${this._toggleMainOption}"
        title="Renders the send button on the request editor"
      >
        Render send button
      </anypoint-checkbox>
      <anypoint-checkbox
        aria-describedby="mainOptionsLabel"
        slot="options"
        name="progressInfo"
        @change="${this._toggleMainOption}"
        title="Renders the status when sending the request"
      >
        Render transport info
      </anypoint-checkbox>
      <anypoint-checkbox
        aria-describedby="mainOptionsLabel"
        slot="options"
        name="noSendOnLoading"
        @change="${this._toggleMainOption}"
        title="Disables sending a request when already loading one"
      >
        No sending on loading
      </anypoint-checkbox>
      <br/>
      <anypoint-button @click="${this.openMetaDetailsHandler}">Open metadata details</anypoint-button>
      <anypoint-button @click="${this.openMetaEditorHandler}">Open metadata editor</anypoint-button>
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
      <oidc-authorization></oidc-authorization>
      ${this._demoTemplate()}
      ${this._dataControlsTemplate()}
      ${this._certImportTemplate()}
      ${this.exportTemplate()}
    `;
  }
}

const instance = new ComponentDemo();
instance.render();
