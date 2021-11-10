/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable class-methods-use-this */
import { html } from "lit-html";
import { EventTypes, Events, ProjectActions } from "@advanced-rest-client/events";
import { ProjectModel, RequestModel, RestApiModel, AuthDataModel, HostRulesModel, VariablesModel, UrlHistoryModel, HistoryDataModel, ClientCertificateModel, WebsocketUrlHistoryModel, UrlIndexer, ArcDataExport, ArcDataImport } from '@advanced-rest-client/idb-store'
import { set } from 'idb-keyval';
import { v4 } from '@advanced-rest-client/uuid';
import { Utils, ModulesRegistry, RequestCookies, ArcContextMenu, ArcContextMenuCommands } from "@advanced-rest-client/base";
import '@anypoint-web-components/awc/bottom-sheet.js';
import '@anypoint-web-components/awc/anypoint-button.js';
import '@anypoint-web-components/awc/anypoint-icon-button.js';
import '@advanced-rest-client/icons/arc-icon.js';
import '@advanced-rest-client/anypoint/define/exchange-search.js';
import '@advanced-rest-client/base/define/arc-request-workspace.js';
import '@advanced-rest-client/base/define/arc-menu.js';
import '@advanced-rest-client/base/define/project-screen.js';
import '@advanced-rest-client/base/define/host-rules-editor.js';
import '@advanced-rest-client/base/define/request-meta-editor.js';
import '@advanced-rest-client/base/define/request-meta-details.js';
import '@advanced-rest-client/base/define/arc-settings.js';
import '@advanced-rest-client/base/define/cookie-manager.js';
import '@advanced-rest-client/base/define/arc-export-form.js';
import '@advanced-rest-client/base/define/client-certificates-panel.js';
import '@advanced-rest-client/base/define/saved-panel.js';
import '@advanced-rest-client/base/define/history-panel.js';
import '@advanced-rest-client/base/define/variables-overlay.js';
import { ApplicationScreen } from "./ApplicationScreen.js";
import { findRoute, navigate, navigatePage } from "../lib/route.js";

/** @typedef {import('lit-element').TemplateResult} TemplateResult */
/** @typedef {import('@advanced-rest-client/events').Config.ARCConfig} ARCConfig */
/** @typedef {import('@advanced-rest-client/events').ArcState.ARCState} ARCState */
/** @typedef {import('@advanced-rest-client/events').ARCRequestNavigationEvent} ARCRequestNavigationEvent */
/** @typedef {import('@advanced-rest-client/events').ARCProjectNavigationEvent} ARCProjectNavigationEvent */
/** @typedef {import('@advanced-rest-client/events').ARCRestApiNavigationEvent} ARCRestApiNavigationEvent */
/** @typedef {import('@advanced-rest-client/events').ARCMenuPopupEvent} ARCMenuPopupEvent */
/** @typedef {import('@advanced-rest-client/events').ARCNavigationEvent} ARCNavigationEvent */
/** @typedef {import('@advanced-rest-client/events').ConfigStateUpdateEvent} ConfigStateUpdateEvent */
/** @typedef {import('@advanced-rest-client/events').WorkspaceAppendRequestEvent} WorkspaceAppendRequestEvent */
/** @typedef {import('@advanced-rest-client/events').WorkspaceAppendExportEvent} WorkspaceAppendExportEvent */
/** @typedef {import('@advanced-rest-client/events').ARCEnvironmentStateSelectEvent} ARCEnvironmentStateSelectEvent */
/** @typedef {import('@advanced-rest-client/events').Application.AppVersionInfo} AppVersionInfo */
/** @typedef {import('@advanced-rest-client/base').ArcRequestWorkspaceElement} ArcRequestWorkspaceElement */
/** @typedef {import('@advanced-rest-client/base').ArcMenuElement} ArcMenuElement */
/** @typedef {import('@advanced-rest-client/anypoint/src/types').ExchangeAsset} ExchangeAsset */
/** @typedef {import('../types').ArcAppInitOptions} ArcAppInitOptions */

/**
 * Advanced REST CLient - the API Client screen.
 */
export class ArcScreen extends ApplicationScreen {
  static get routes() {
    return [
      {
        name: "workspace",
        pattern: "workspace/",
      },
      {
        name: "rest-projects",
        pattern: "rest-projects",
      },
      {
        name: "exchange-search",
        pattern: "exchange-search",
      },
      {
        name: "history",
        pattern: "history",
      },
      {
        name: "saved",
        pattern: "saved",
      },
      {
        name: "client-certificates",
        pattern: "client-certificates",
      },
      {
        name: "data-export",
        pattern: "data-export",
      },
      {
        name: "cookie-manager",
        pattern: "cookie-manager",
      },
      {
        name: "settings",
        pattern: "settings",
      },
      {
        name: "hosts",
        pattern: "hosts",
      },
      {
        name: "project",
        pattern: "project/(?<pid>[^/]*)/(?<action>.*)",
      },
      // {
      //   name: 'model',
      //   pattern: 'project/(?<pid>[^/]*)/module(?<mid>/.*)/model/(?<dmId>.*)'
      // }, {
      //   name: 'module',
      //   pattern: 'project/(?<pid>[^/]*)/module(?<mid>/.*)'
      // },
      {
        name: "workspace",
        pattern: "*",
      },
    ];
  }

  /**
   * @type {ArcRequestWorkspaceElement}
   */
  #workspace = undefined;

  #contextMenu = new ArcContextMenu(document.body, { cancelNativeWhenHandled: true });

  /** 
   * IDB data export processor.
   */
  #dataExport = new ArcDataExport(window); 

  /** 
   * IDB data import processor.
   */
  #dataImport = new ArcDataImport(window);

  /**
   * @type {ARCConfig}
   */
  config = undefined

  /**
   * A list of detached menu panels.
   * @type {string[]}
   */
  menuPopup = [];

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

  /**
   * @returns {ArcRequestWorkspaceElement}
   */
  get workspaceElement() {
    if (!this.#workspace) {
      this.#workspace = document.querySelector('arc-request-workspace');
    }
    return this.#workspace;
  }

  /**
   * @returns {boolean} whether the history capturing is enabled in the application.
   */
  get historyEnabled() {
    const { config={} } = this;
    const { history={} } = config;
    if (typeof history.enabled === 'boolean') {
      return history.enabled;
    }
    // default
    return true;
  }

  /**
   * @returns {boolean} whether the history / saved search should perform slower but more detailed search
   */
  get detailedSearch() {
    const { config={} } = this;
    const { history={} } = config;
    if (typeof history.fastSearch === 'boolean') {
      return history.fastSearch;
    }
    // default
    return false;
  }

  /** 
   * @returns {string} The current setting for the list types view.
   */
  get listType() {
    const { config={} } = this;
    const { view={} } = config;
    if (typeof view.listType === 'string') {
      return view.listType;
    }
    // default
    return 'default';
  }

  /** 
   * @returns {boolean} Whether the application menu can be detached to a new window.
   */
  get popupMenuEnabled() {
    const { config={} } = this;
    const { view={} } = config;
    if (typeof view.popupMenu === 'boolean') {
      return view.popupMenu;
    }
    // default
    return true;
  }

  /** 
   * @returns {boolean} Whether the application support request object drag and drop
   */
  get draggableEnabled() {
    const { config={} } = this;
    const { view={} } = config;
    if (typeof view.draggableEnabled === 'boolean') {
      return view.draggableEnabled;
    }
    // default
    return true;
  }

  /** 
   * @returns {boolean} Whether the application should process system variables.
   */
  get systemVariablesEnabled() {
    const { config={} } = this;
    const { request={} } = config;
    if (typeof request.useSystemVariables === 'boolean') {
      return request.useSystemVariables;
    }
    // default
    return true;
  }

  /** 
   * @returns {boolean} Whether the application variables are enabled.
   */
  get variablesEnabled() {
    const { config={} } = this;
    const { request={} } = config;
    if (typeof request.useAppVariables === 'boolean') {
      return request.useAppVariables;
    }
    // default
    return true;
  }

  /**
   * @returns {string} The default OAuth2 redirect URI.
   */
  get oauth2RedirectUri() {
    const { config={} } = this;
    const { request={} } = config;
    if (request.oauth2redirectUri) {
      return request.oauth2redirectUri;
    }
    return 'http://auth.advancedrestclient.com/arc.html';
  }

  /**
   * @returns {boolean} Whether the http editor should render the "send" button.
   */
  get workspaceSendButton() {
    const { config={} } = this;
    const { requestEditor={} } = config;
    if (typeof requestEditor.sendButton === 'boolean') {
      return requestEditor.sendButton;
    }
    return true;
  }

  /**
   * @returns {boolean} Whether the http editor should render the progress information when sending a request.
   */
  get workspaceProgressInfo() {
    const { config={} } = this;
    const { requestEditor={} } = config;
    if (typeof requestEditor.progressInfo === 'boolean') {
      return requestEditor.progressInfo;
    }
    return true;
  }

  /**
   * @returns {boolean} Whether the http editor should automatically encode parameters.
   */
  get workspaceAutoEncode() {
    const { config={} } = this;
    const { requestEditor={} } = config;
    if (typeof requestEditor.autoEncode === 'boolean') {
      return requestEditor.autoEncode;
    }
    return false;
  }

  /** @returns {Readonly<{[key: string]: string;}>} */
  get systemVariables() {
    return this.variablesModel.systemVariables;
  }

  /** @param {Readonly<{[key: string]: string;}>} value */
  set systemVariables(value) {
    this.variablesModel.systemVariables = value;
  }

  constructor() {
    super();

    this.initObservableProperties(
      'route', 'routeParams', 'initializing', 
      'navigationDetached', 'updateState', 
      'currentEnvironment',
      'navigationSelected',
      'requestDetailsOpened', 'requestMetaOpened', 'metaRequestId', 'metaRequestType',
    );

    /** 
     * @type {boolean} Whether the project is being restored from the metadata store.
     */
    this.initializing = false;
    /** 
     * @type {string} A loading state information.
     */
    this.loadingStatus = 'Initializing application...';
    /** 
     * When set the navigation element is detached from the main application window.
     */
    this.navigationDetached = false;

    /** 
     * The current state of checking for update.
     * @type {string}
     */
    this.updateState = undefined;

    /** 
     * The name of the currently selected environment. Null for the default.
     */
    this.currentEnvironment = null;

    /** 
     * The currently selected navigation group.
     * @type {number}
     */
    this.navigationSelected = undefined;

    this.requestDetailsOpened = false;

    this.requestMetaOpened = false;

    /** @type string */
    this.metaRequestId = undefined;
    
    /** @type string */
    this.metaRequestType = undefined;
    
    /**
     * Current application version info.
     * @type {AppVersionInfo}
     */
    this.versionInfo = {
      appVersion: 'loading...',
      chrome: 'loading...',
    };
  }

  /**
   * Runs the logic to initialize the application.
   */
  async initialize() {
    this.initModels();
    this.listen();
    const init = this.collectInitOptions();
    this.initOptions = init;
    
    let settings = /** @type ARCConfig */ ({});
    try {
      settings = (await Events.Config.readAll(this.eventTarget)) || {};
    } catch (e) {
      this.reportCriticalError(e);
      throw e;
    }
    this.config = settings;
    this.setConfigVariables(settings);
    
    await this.loadTheme();
    Events.Workspace.setId(this.eventTarget, init.workspaceId);
    let state = /** @type ARCState */(null);
    try {
      state = await Events.App.readState(this.eventTarget);
    } catch (e) {
      state = {
        kind: 'ARC#AppState',
      };
    }
    this.processApplicationState(state);
    this.versionInfo = await this.loadVersionInfo();
    this.#dataExport.appVersion = this.versionInfo.appVersion;
    await this.afterInitialization();
    this.initializing = false;
  }

  listen() {
    this.#contextMenu.connect();
    this.#contextMenu.registerCommands(ArcContextMenuCommands);
    this.#contextMenu.addEventListener('execute', this.contextCommandHandler.bind(this));

    this.#dataExport.listen();
    this.#dataImport.listen();

    window.addEventListener(EventTypes.Navigation.navigateRequest, this.navigateRequestHandler.bind(this));
    window.addEventListener(EventTypes.Navigation.navigate, this.navigateHandler.bind(this));
    window.addEventListener(EventTypes.Navigation.navigateProject, this.navigateProjectHandler.bind(this));
    window.addEventListener(EventTypes.Navigation.navigateRestApi, this.navigateRestApiHandler.bind(this));
    window.addEventListener(EventTypes.Navigation.popupMenu, this.popupMenuHandler.bind(this));
    window.addEventListener(EventTypes.Workspace.appendRequest, this.workspaceAppendRequestHandler.bind(this));
    window.addEventListener(EventTypes.Workspace.appendExport, this.workspaceAppendExportHandler.bind(this));
    window.addEventListener(EventTypes.Config.State.update, this.configStateChangeHandler.bind(this));
    window.addEventListener(EventTypes.Model.Environment.State.select, this.environmentSelectedHandler.bind(this));
    window.addEventListener(EventTypes.App.command, this.commandHandler.bind(this));
    window.addEventListener(EventTypes.App.requestAction, this.requestActionHandler.bind(this));
    
  }

  /**
   * Sets local variables from the config object
   * @param {ARCConfig} cnf
   */
  setConfigVariables(cnf) {
    const ignoreCookies = !!cnf.request && cnf.request.ignoreSessionCookies === false;
    if (!ignoreCookies) {
      ModulesRegistry.register(ModulesRegistry.request, 'arc/request/cookies', RequestCookies.processRequestCookies, ['events']);
      ModulesRegistry.register(ModulesRegistry.response, 'arc/response/cookies', RequestCookies.processResponseCookies, ['events']);
    }
    if (cnf.view) {
      if (typeof cnf.view.fontSize === 'number') {
        document.body.style.fontSize = `${cnf.view.fontSize}px`;
      }
    }
  }

  /**
   * @param {ARCState} state
   */
  processApplicationState(state) {
    if (state.environment) {
      if (state.environment.variablesEnvironment) {
        // this.currentEnvironment = state.environment.variablesEnvironment;
        Events.Model.Environment.select(document.body, state.environment.variablesEnvironment);
      }
    }
    if (state.navigation) {
      if (typeof state.navigation.selected === 'number') {
        this.navigationSelected = state.navigation.selected;
      }
    }
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

  /**
   * @returns {ArcAppInitOptions} The init options of this browser process.
   */
  collectInitOptions() {
    const search = new URLSearchParams(window.location.search);
    const result = /** @type ArcAppInitOptions */ ({});
    const wId = search.get('workspaceId');
    if (wId) {
      result.workspaceId = wId;
    }
    const proxy = search.get('proxy');
    if (proxy) {
      result.proxy = proxy;
    }
    const proxyUsername = search.get('proxyUsername');
    if (proxyUsername) {
      result.proxyUsername = proxyUsername;
    }
    const proxyPassword = search.get('proxyPassword');
    if (proxyPassword) {
      result.proxyPassword = proxyPassword;
    }
    return result;
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
   * Closes a tab in the request workspace at the specified position
   * @param {number} index 
   */
  closeWorkspaceTab(index) {
    this.workspaceElement.removeRequest(index);
  }

  /**
   * Closes all tabs in the request workspace
   */
  closeAllWorkspaceTabs() {
    this.workspaceElement.clear();
  }

  /**
   * Closes all tabs in the request workspace except for the given index.
   * @param {number} index 
   */
  closeOtherWorkspaceTabs(index) {
    this.workspaceElement.closeAllTabs(index);
  }

  /**
   * Duplicates a tab at the given index.
   * @param {number} index 
   */
  duplicateWorkspaceTab(index) {
    this.workspaceElement.duplicateTab(index);
  }

  /**
   * @param {ARCRequestNavigationEvent} e 
   */
  navigateRequestHandler(e) {
    const { requestId, requestType, action } = e;
    if (action === 'open') {
      this.workspaceElement.addByRequestId(requestType, requestId);
      if (this.route !== 'workspace') {
        navigate('workspace');
      }
      return;
    }
    if (action === 'detail') {
      this.requestMetaOpened = false;
      this.requestDetailsOpened = true;
      this.metaRequestId = requestId;
      this.metaRequestType = requestType;
      return;
    }
    if (action === 'edit') {
      this.requestDetailsOpened = false;
      this.requestMetaOpened = true;
      this.metaRequestId = requestId;
      this.metaRequestType = requestType;
    }
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
      this.workspaceElement.appendByProjectId(id);
    } else if (action === ProjectActions.replaceWorkspace) {
      this.workspaceElement.replaceByProjectId(id);
    } else if (action === 'open') {
      navigate(route, id, action);
    } else {
      // eslint-disable-next-line no-console
      console.warn('Unhandled project event', id, action, route);
    }
  }

  /**
   * @param {ARCRestApiNavigationEvent} e
   */
  navigateRestApiHandler(e) {
    const { api, version } = e;
    navigatePage('api-console.html', 'open', 'db', api, version);
  }

  /**
   * @param {ARCMenuPopupEvent} e
   */
  popupMenuHandler(e) {
    const { menu } = e;
    const element = document.querySelector('arc-menu');
    const rect = element.getBoundingClientRect();
    const sizing = {
      height: rect.height,
      width: rect.width
    };
    Events.Menu.popup(this.eventTarget, menu, sizing);
  }

  /**
   * @param {ARCNavigationEvent} e
   */
  navigateHandler(e) {
    const allowed = [
      'rest-projects',
      'exchange-search',
      'history',
      'saved',
    ];
    if (e.route === 'client-certificate-import') {
      navigate('client-certificates');
    } else if (allowed.includes(e.route)) {
      navigate(e.route);
    } else {
      // eslint-disable-next-line no-console
      console.warn('Unhandled navigate event', e);
    }
  }

  /**
   * A handler for the main toolbar arrow back click.
   * Always navigates to the workspace.
   */
  mainBackHandler() {
    navigate('workspace');
  }

  /**
   * Handler for application command.
   *
   * @param {CustomEvent} e 
   */
  commandHandler(e) {
    const { action } = e.detail;
    switch (action) {
      case 'open-saved': navigate('saved'); break;
      case 'open-history': navigate('history'); break;
      case 'open-cookie-manager': navigate('cookie-manager'); break;
      case 'open-hosts-editor': navigate('hosts'); break;
      case 'open-client-certificates': navigate('client-certificates'); break;
      case 'open-requests-workspace': navigate('workspace'); break;
      case 'open-web-socket': this.workspaceElement.addWsRequest(); break;
      case 'import-data': navigatePage('data-import.html'); break;
      case 'export-data': navigate('data-export'); break;
      case 'show-settings': navigate('settings'); break;
      case 'popup-menu': this.navigationDetached = !this.navigationDetached; break;
      // this is moved to the platform bindings.
      // case 'export-workspace': this.exportWorkspace(); break;
      case 'login-external-webservice': this.workspaceElement.openWebUrlInput(); break;
      case 'open-workspace-details': this.workspaceElement.openWorkspaceDetails(); break;
      default:
        // eslint-disable-next-line no-console
        console.warn(`Unhandled IO command ${action}`);
    }
  }

  /**
   * Handles action performed in main thread (menu action) related to a request.
   *
   * @param {CustomEvent} e
   */
  requestActionHandler(e) {
    const { action, /* args */ } = e.detail;
    if (this.route !== 'workspace') {
      navigate('workspace');
    }
    switch (action) {
      case 'save':
        this.workspaceElement.saveOpened();
        break;
      case 'save-as':
        this.workspaceElement.saveAsOpened();
        break;
      case 'new-http-tab':
        this.workspaceElement.addHttpRequest();
        break;
      case 'new-websocket-tab':
        this.workspaceElement.addWsRequest();
        break;
      case 'send-current':
        this.workspaceElement.sendCurrent();
        break;
      case 'close-tab':
        this.workspaceElement.closeActiveTab();
        break;
      default:
        // eslint-disable-next-line no-console
        console.warn(`Unhandled IO request command ${action}`);
    }
  }

  /**
   * @param {CustomEvent} e
   */
  contextCommandHandler(e) {
    const { detail } = e;
    const { target, id } = detail;
    switch (id) {
      case 'close-tab': this.workspaceElement.removeRequest(Utils.getTabClickIndex(target)); break;
      case 'close-other-tabs': this.workspaceElement.closeAllTabs(Utils.getTabClickIndex(target)); break;
      case 'close-all-tabs': this.workspaceElement.closeAllTabs(); break;
      case 'duplicate-tab': this.workspaceElement.duplicateTab(Utils.getTabClickIndex(target)); break;
      default:
    }
  }

  /**
   * @param {ConfigStateUpdateEvent} e
   */
  configStateChangeHandler(e) {
    const { key, value } = e.detail;
    const { config={} } = this;
    Utils.updateDeepValue(config, key, value);
    this.render();
    if (key === 'request.ignoreSessionCookies') {
      if (value) {
        ModulesRegistry.register(ModulesRegistry.request, 'arc/request/cookies', RequestCookies.processRequestCookies, ['events']);
        ModulesRegistry.register(ModulesRegistry.response, 'arc/response/cookies', RequestCookies.processResponseCookies, ['events']);
      } else {
        ModulesRegistry.unregister(ModulesRegistry.request, 'arc/request/cookies');
        ModulesRegistry.unregister(ModulesRegistry.response, 'arc/response/cookies');
      }
      return;
    }
    if (key === 'view.fontSize') {
      document.body.style.fontSize = `${value}px`;
    }
  }

  popupMenuOpenedHandler(e, type) {
    this.menuToggleOption(type, true);
  }

  popupMenuClosedHandler(e, type) {
    this.menuToggleOption(type, false);
  }

  /**
   * @param {string} type The menu name
   * @param {boolean} value Whether the menu is rendered in an external window.
   */
  menuToggleOption(type, value) {
    if (type === '*') {
      this.navigationDetached = value;
      return;
    }
    const { menuPopup } = this;
    if (value && !menuPopup.includes(type)) {
      menuPopup.push(type);
      this.render();
    } else if (!value && menuPopup.includes(type)) {
      const index = menuPopup.indexOf(type);
      menuPopup.splice(index, 1);
      this.render();
    }
  }

  /**
   * @param {*} e
   * @param {string} type
   * @param {string[]} args
   */
  mainNavigateHandler(e, type, args) {
    switch (type) {
      // @ts-ignore
      case 'request': Events.Navigation.navigateRequest(document.body, ...args); break;
      // @ts-ignore
      case 'project': Events.Navigation.navigateProject(document.body, ...args); break;
      // @ts-ignore
      case 'navigate': Events.Navigation.navigate(document.body, ...args); break;
      default:
    }
  }

  /**
   * @param {Event} e
   */
  environmentSelectorHandler(e) {
    const overlay = document.querySelector('variables-overlay');
    overlay.positionTarget = /** @type HTMLElement */ (e.target);
    overlay.opened = true;
  }

  /**
   * @param {KeyboardEvent} e
   */
  environmentSelectorKeyHandler(e) {
    if (['Space', 'Enter', 'ArrowDown'].includes(e.code)) {
      this.environmentSelectorHandler(e);
    }
  }

  /**
   * @param {WorkspaceAppendRequestEvent} e
   */
  workspaceAppendRequestHandler(e) {
    const { request } = e.detail;
    this.workspaceElement.add(request);
    navigate('workspace');
  }

  /**
   * @param {WorkspaceAppendExportEvent} e
   */
  workspaceAppendExportHandler(e) {
    const { requests, history } = e.detail.data;
    const { workspaceElement } = this;
    (requests || []).forEach((request) => workspaceElement.add(request));
    (history || []).forEach((request) => workspaceElement.add(request));
    navigate('workspace');
  }

  /**
   * @param {ARCEnvironmentStateSelectEvent} e
   */
  environmentSelectedHandler(e) {
    const { environment } = e.detail;
    if (environment) {
      this.currentEnvironment = environment.name;
      Events.App.updateStateProperty(this.eventTarget, 'environment.variablesEnvironment', environment._id);
    } else {
      this.currentEnvironment = null;
      Events.App.updateStateProperty(this.eventTarget, 'environment.variablesEnvironment', null);
    }
  }

  /**
   * @param {Event} e
   */
  navMinimizedHandler(e) {
    const menu = /** @type ArcMenuElement */ (e.target);
    if (menu.minimized) {
      menu.parentElement.classList.add('minimized');
    } else {
      menu.parentElement.classList.remove('minimized');
    }
  }

  /**
   * @param {Event} e
   */
  async menuRailSelected(e) {
    const menu = /** @type ArcMenuElement */ (e.target);
    this.navigationSelected = menu.selected;
    await Events.App.updateStateProperty(this.eventTarget, 'navigation.selected', menu.selected);
  }

  /**
   * @param {ResizeEvent} e
   */
  navigationResizeHandler(e) {
    const { width } = e;
    if (width < 180) {
      e.preventDefault();
    }
  }

  metaRequestHandler() {
    this.requestMetaOpened = true;
    this.requestDetailsOpened = false;
  }

  requestMetaCloseHandler() {
    this.requestMetaOpened = false;
  }

  sheetClosedHandler(e) {
    const prop = e.target.dataset.openProperty;
    this[prop] = e.detail.value;
  }

  /**
   * @param {CustomEvent} e
   */
  async exchangeSelectionHandler(e) {
    const asset = /** @type ExchangeAsset */ (e.detail);
    const types = ['fat-raml', 'raml', 'oas'];
    const file = asset.files.find((item) => types.includes(item.classifier));
    if (!file || !file.externalLink) {
      this.reportCriticalError('API data not found in the asset.');
      return;
    }
    const { externalLink, mainFile, md5, packaging } = file;
    try {
      const result = await Events.Amf.processApiLink(this.eventTarget, externalLink, mainFile, md5, packaging);
      if (!result) {
        throw new Error('The API parser is not correctly initialized.');
      }
      const key = v4();
      await set(key, result);
      navigatePage('api-console.html', 'open', 'file', key);
    } catch (cause) {
      this.reportCriticalError(cause.message);
    }
  }

  appTemplate() {
    const { initializing } = this;
    if (initializing) {
      return this.loaderTemplate();
    }
    return html`
    ${this.applicationMenuTemplate()}
    <div class="content">
      ${this.navigationTemplate()}
      ${this.pageTemplate(this.route)}
    </div>
    ${this.applicationUtilitiesTemplate()}
    `;
  }

  /**
   * @returns {TemplateResult|string} The template for the application menu, when needed.
   */
  applicationMenuTemplate() {
    return '';
  }

  /**
   * @returns {TemplateResult|string} The template for any code to be added to the application.
   */
  applicationUtilitiesTemplate() {
    return '';
  }

  /**
   * @returns {TemplateResult} The template for the header
   */
  headerTemplate() {
    const { route } = this;
    const isWorkspace = route === 'workspace';
    return html`
    <header>
      ${isWorkspace ? '' : 
      html`
      <anypoint-icon-button title="Back to the request workspace" @click="${this.mainBackHandler}"  class="header-action-button">
        <arc-icon icon="arrowBack"></arc-icon>
      </anypoint-icon-button>`}
      API Client
      <span class="spacer"></span>
      ${this.toolbarActionsTemplate()}
      ${this.environmentTemplate()}
    </header>`;
  }

  /**
   * @returns {TemplateResult|string} The template for the toolbar actions.
   */
  toolbarActionsTemplate() {
    return '';
  }

  /**
   * @returns {TemplateResult|string} The template for the environment selector and the overlay.
   */
  environmentTemplate() {
    const { anypoint, variablesEnabled } = this;
    if (!variablesEnabled) {
      return '';
    }
    let { currentEnvironment } = this;
    if (!currentEnvironment) {
      // this can be `null` so default values won't work
      currentEnvironment = 'Default';
    }
    return html`
    <div 
      class="environment-selector" 
      title="The current environment" 
      aria-label="Activate to select an environment"
      tabindex="0"
      @click="${this.environmentSelectorHandler}"
      @keydown="${this.environmentSelectorKeyHandler}"
    >
      Environment: ${currentEnvironment}
      <arc-icon icon="chevronRight" class="env-dropdown"></arc-icon>
    </div>

    <variables-overlay 
      id="overlay" 
      verticalAlign="top" 
      withBackdrop 
      horizontalAlign="right"
      noCancelOnOutsideClick
      ?anypoint="${anypoint}"
      ?systemVariablesEnabled="${this.systemVariablesEnabled}"
    ></variables-overlay>
    `;
  }

  /**
   * @returns {TemplateResult|string} The template for the application main navigation area
   */
  navigationTemplate() {
    if (this.navigationDetached) {
      return '';
    }
    return html`
    <nav
      resize="east"
      @resize="${this.navigationResizeHandler}"
    >
      ${this.arcNavigationTemplate()}
    </nav>
    `;
  }

  /**
   * @returns {TemplateResult} The template for the ARC navigation
   */
  arcNavigationTemplate() {
    const { anypoint, menuPopup, listType, historyEnabled, popupMenuEnabled, draggableEnabled, navigationSelected } = this;
    const hideHistory = menuPopup.includes('history-menu');
    const hideSaved = menuPopup.includes('saved-menu');
    const hideProjects = menuPopup.includes('projects-menu');
    const hideApis = menuPopup.includes('rest-api-menu');
    const hideSearch = menuPopup.includes('search-menu');
    return html`
    <arc-menu
      .selected="${navigationSelected}"
      ?anypoint="${anypoint}"
      .listType="${listType}"
      ?history="${historyEnabled}"
      ?hideHistory="${hideHistory}"
      ?hideSaved="${hideSaved}"
      ?hideProjects="${hideProjects}"
      ?hideApis="${hideApis}"
      ?hideSearch="${hideSearch}"
      ?popup="${popupMenuEnabled}"
      ?dataTransfer="${draggableEnabled}"
      @minimized="${this.navMinimizedHandler}"
      @selected="${this.menuRailSelected}"
    ></arc-menu>
    `;
  }

  /**
   * @param {string} route The current route
   * @returns {TemplateResult} The template for the page content
   */
  pageTemplate(route) {
    return html`
    <main id="main">
      ${this.headerTemplate()}
      ${this.workspaceTemplate(route === 'workspace')}
      ${this.historyPanelTemplate(route)}
      ${this.savedPanelTemplate(route)}
      ${this.clientCertScreenTemplate(route)}
      ${this.dataExportScreenTemplate(route)}
      ${this.cookieManagerScreenTemplate(route)}
      ${this.settingsScreenTemplate(route)}
      ${this.hostRulesTemplate(route)}
      ${this.exchangeSearchTemplate(route)}
      ${this.arcLegacyProjectTemplate(route)}
      ${this.requestDetailTemplate()}
      ${this.requestMetaTemplate()}
    </main>
    `;
  }

  /**
   * @param {boolean} visible Whether the workspace is rendered in the view
   * @returns
   */
  workspaceTemplate(visible) {
    const { oauth2RedirectUri, anypoint, workspaceSendButton, workspaceProgressInfo } = this;
    // if (typeof cnf.requestEditor.autoEncode === 'boolean') {
    //   this.workspaceAutoEncode = cnf.requestEditor.autoEncode;
    // }
    return html`
    <arc-request-workspace
      ?hidden="${!visible}"
      ?anypoint="${anypoint}"
      ?renderSend="${workspaceSendButton}"
      ?progressInfo="${workspaceProgressInfo}"
      .oauth2RedirectUri="${oauth2RedirectUri}"
      autoRead
      class="screen"
    ></arc-request-workspace>
    `;
  }

  /**
   * @param {string} route The current route
   * @returns {TemplateResult|string} The template for the history screen
   */
  historyPanelTemplate(route) {
    if (route !== 'history') {
      return '';
    }
    const { anypoint } = this;
    if (!this.historyEnabled) {
      return '';
    }
    return html`
    <history-panel 
      listActions
      selectable
      ?detailedSearch="${this.detailedSearch}"
      ?anypoint="${anypoint}"
      .listType="${this.listType}"
      draggableEnabled
      class="screen"
    ></history-panel>
    `;
  }

  /**
   * @param {string} route The current route
   * @returns {TemplateResult|string} The template for the history screen
   */
  savedPanelTemplate(route) {
    if (route !== 'saved') {
      return '';
    }
    const { anypoint } = this;
    return html`
    <saved-panel 
      listActions
      selectable
      ?detailedSearch="${this.detailedSearch}"
      ?anypoint="${anypoint}"
      .listType="${this.listType}"
      draggableEnabled
      class="screen"
    ></saved-panel>
    `;
  }

  /**
   * @param {string} route The current route
   * @returns {TemplateResult|string} The template for client certificates screen
   */
  clientCertScreenTemplate(route) {
    if (route !== 'client-certificates') {
      return '';
    }
    const { anypoint } = this;
    return html`
    <client-certificates-panel
      ?anypoint="${anypoint}"
      class="screen"
    ></client-certificates-panel>`;
  }

  /**
   * @param {string} route The current route
   * @returns {TemplateResult|string} The template for the data export screen
   */
  dataExportScreenTemplate(route) {
    if (route !== 'data-export') {
      return '';
    }
    const { anypoint } = this;
    return html`
    <arc-export-form
      withEncrypt
      ?anypoint="${anypoint}"
      class="screen"
    ></arc-export-form>
    `;
  }

  /**
   * @param {string} route The current route
   * @returns {TemplateResult|string} The template for the cookie manager
   */
  cookieManagerScreenTemplate(route) {
    if (route !== 'cookie-manager') {
      return '';
    }
    const { anypoint } = this;
    return html`
    <cookie-manager
      ?anypoint="${anypoint}"
      class="screen"
    ></cookie-manager>
    `;
  }

  /**
   * @param {string} route The current route
   * @returns {TemplateResult|string} The template for the application settings
   */
  settingsScreenTemplate(route) {
    if (route !== 'settings') {
      return '';
    }
    const { anypoint } = this;
    return html`
    <arc-settings
      ?anypoint="${anypoint}"
      class="screen scroll"
    ></arc-settings>
    `;
  }

  /**
   * @returns {TemplateResult} The template for the request metadata info dialog
   */
  requestDetailTemplate() {
    const { anypoint, requestDetailsOpened, metaRequestId, metaRequestType } = this;
    return html`
    <bottom-sheet
      class="bottom-sheet-container"
      .opened="${requestDetailsOpened}"
      data-open-property="requestDetailsOpened"
      @closed="${this.sheetClosedHandler}"
    >
      <request-meta-details
        ?anypoint="${anypoint}"
        .requestId="${metaRequestId}"
        .requestType="${metaRequestType}"
        @edit="${this.metaRequestHandler}"
      ></request-meta-details>
    </bottom-sheet>`;
  }

  /**
   * @returns {TemplateResult} The template for the request metadata editor dialog
   */
  requestMetaTemplate() {
    const { anypoint, requestMetaOpened, metaRequestId, metaRequestType } = this;
    return html`
    <bottom-sheet
      class="bottom-sheet-container"
      .opened="${requestMetaOpened}"
      data-open-property="requestMetaOpened"
      @closed="${this.sheetClosedHandler}"
    >
      <request-meta-editor
        ?anypoint="${anypoint}"
        .requestId="${metaRequestId}"
        .requestType="${metaRequestType}"
        @close="${this.requestMetaCloseHandler}"
      ></request-meta-editor>
    </bottom-sheet>`;
  }

  /**
   * @param {string} route The current route
   * @returns {TemplateResult|string} The template for the host rules mapping element
   */
  hostRulesTemplate(route) {
    if (route !== 'hosts') {
      return '';
    }
    const { anypoint } = this;
    return html`
    <host-rules-editor
      ?anypoint="${anypoint}"
      class="screen scroll"
    ></host-rules-editor>
    `;
  }

  /**
   * @param {string} route The current route
   * @returns {TemplateResult|string} The template for the host rules mapping element
   */
  exchangeSearchTemplate(route) {
    if (route !== 'exchange-search') {
      return '';
    }
    const { anypoint } = this;
    return html`
    <exchange-search
      ?anypoint="${anypoint}"
      anypointAuth
      columns="auto"
      exchangeRedirectUri="https://auth.advancedrestclient.com/"
      exchangeClientId="2dc40927457042b5862864c3c97737d7"
      forceOauthEvents
      @selected="${this.exchangeSelectionHandler}"
      class="screen scroll"
    ></exchange-search>
    `;
  }

  /**
   * @param {string} route The current route
   * @returns {TemplateResult|string} The template for the ARC legacy projects.
   */
  arcLegacyProjectTemplate(route) {
    if (route !== 'project') {
      return '';
    }
    const { routeParams={}, anypoint } = this;
    return html`
    <project-screen 
      .projectId="${/** @type string */(routeParams.pid)}"
      ?anypoint="${anypoint}"
      class="screen scroll"
    ></project-screen>
    `;
  }
}
