/* eslint-disable class-methods-use-this */
import { html } from "lit-html";
import { classMap } from "lit-html/directives/class-map.js";
import { styleMap } from "lit-html/directives/style-map.js";
import { EventTypes, Events, ProjectActions } from "@advanced-rest-client/events";
import { ProjectModel, RequestModel, RestApiModel, AuthDataModel, HostRulesModel, VariablesModel, UrlHistoryModel, HistoryDataModel, ClientCertificateModel, WebsocketUrlHistoryModel, UrlIndexer } from '@advanced-rest-client/idb-store'
import { MonacoLoader } from "@advanced-rest-client/monaco-support";
import { ApplicationScreen } from "./ApplicationScreen.js";
import { findRoute, navigate, navigatePage } from "../lib/route.js";
import { ModulesRegistry } from "../request-modules/ModulesRegistry.js";
import RequestCookies from "../request-modules/RequestCookies.js";
import { ArcContextMenu } from "../context-menu/ArcContextMenu.js";
import ContextMenuCommands from "../context-menu/ArcContextMenuCommands.js";
import { getTabClickIndex } from '../lib/Utils.js';

/** @typedef {import('@advanced-rest-client/events').Authorization.OAuth2Authorization} OAuth2Authorization */
/** @typedef {import('@advanced-rest-client/events').Config.ARCConfig} ARCConfig */
/** @typedef {import('@advanced-rest-client/events').ArcState.ARCState} ARCState */
/** @typedef {import('@advanced-rest-client/events').ARCRequestNavigationEvent} ARCRequestNavigationEvent */
/** @typedef {import('@advanced-rest-client/events').ARCProjectNavigationEvent} ARCProjectNavigationEvent */
/** @typedef {import('@advanced-rest-client/events').ARCRestApiNavigationEvent} ARCRestApiNavigationEvent */
/** @typedef {import('@advanced-rest-client/events').ARCMenuPopupEvent} ARCMenuPopupEvent */
/** @typedef {import('@advanced-rest-client/events').ARCNavigationEvent} ARCNavigationEvent */
/** @typedef {import('@advanced-rest-client/events').ARCExternalNavigationEvent} ARCExternalNavigationEvent */
/** @typedef {import('@advanced-rest-client/events').ARCHelpTopicEvent} ARCHelpTopicEvent */
/** @typedef {import('@advanced-rest-client/events').ConfigStateUpdateEvent} ConfigStateUpdateEvent */
/** @typedef {import('@advanced-rest-client/events').ArcImportInspectEvent} ArcImportInspectEvent */
/** @typedef {import('@advanced-rest-client/events').WorkspaceAppendRequestEvent} WorkspaceAppendRequestEvent */
/** @typedef {import('@advanced-rest-client/events').WorkspaceAppendExportEvent} WorkspaceAppendExportEvent */
/** @typedef {import('@advanced-rest-client/events').RestApiProcessFileEvent} RestApiProcessFileEvent */
/** @typedef {import('@advanced-rest-client/events').ARCEnvironmentStateSelectEvent} ARCEnvironmentStateSelectEvent */
/** @typedef {import('@advanced-rest-client/events').Indexer.IndexableRequest} IndexableRequest */
/** @typedef {import('../../').ArcRequestWorkspaceElement} ArcRequestWorkspaceElement */
/** @typedef {import('../types').ArcAppInitOptions} ArcAppInitOptions */

const unhandledRejectionHandler = Symbol("unhandledRejectionHandler");
const headerTemplate = Symbol("headerTemplate");
const pageTemplate = Symbol("pageTemplate");
const workspaceTemplate = Symbol("workspaceTemplate");
const navigationTemplate = Symbol("navigationTemplate");
const navigateRequestHandler = Symbol("navigateRequestHandler");
const navigateHandler = Symbol("navigateHandler");
const navigateProjectHandler = Symbol("navigateProjectHandler");
const navigateRestApiHandler = Symbol("navigateRestApiHandler");
const popupMenuHandler = Symbol("popupMenuHandler");
const mainBackHandler = Symbol("mainBackHandler");
const historyPanelTemplate = Symbol("historyPanelTemplate");
const savedPanelTemplate = Symbol("savedPanelTemplate");
const clientCertScreenTemplate = Symbol("clientCertScreenTemplate");
const commandHandler = Symbol("commandHandler");
const requestActionHandler = Symbol("requestActionHandler");
const configStateChangeHandler = Symbol("configStateChangeHandler");
const popupMenuOpenedHandler = Symbol("popupMenuOpenedHandler");
const popupMenuClosedHandler = Symbol("popupMenuClosedHandler");
const environmentTemplate = Symbol("environmentTemplate");
const environmentSelectorHandler = Symbol("environmentSelectorHandler");
const environmentSelectorKeyHandler = Symbol("environmentSelectorKeyHandler");
const dataImportScreenTemplate = Symbol("dataImportScreenTemplate");
const dataExportScreenTemplate = Symbol("dataExportScreenTemplate");
const cookieManagerScreenTemplate = Symbol("cookieManagerScreenTemplate");
const settingsScreenTemplate = Symbol("settingsScreenTemplate");
const fileImportHandler = Symbol("fileImportHandler");
const importInspectorTemplate = Symbol("importInspectorTemplate");
const dataInspectHandler = Symbol("dataInspectHandler");
const inspectDataValue = Symbol("inspectDataValue");
const importDataHandler = Symbol("importDataHandler");
const notifyIndexer = Symbol("notifyIndexer");
const workspaceAppendRequestHandler = Symbol("workspaceAppendRequestHandler");
const workspaceAppendExportHandler = Symbol("workspaceAppendExportHandler");
const environmentSelectedHandler = Symbol("environmentSelectedHandler");
const navMinimizedHandler = Symbol("navMinimizedHandler");
const menuRailSelected = Symbol("menuRailSelected");
const navResizeMousedown = Symbol("navResizeMousedown");
const resizeMouseUp = Symbol("resizeMouseUp");
const resizeMouseMove = Symbol("resizeMouseMove");
const isResizing = Symbol("isResizing");
const mainNavigateHandler = Symbol("mainNavigateHandler");
const requestDetailTemplate = Symbol("requestDetailTemplate");
const requestMetaTemplate = Symbol("requestMetaTemplate");
const sheetClosedHandler = Symbol("sheetClosedHandler");
const metaRequestHandler = Symbol("metaRequestHandler");
const requestMetaCloseHandler = Symbol("requestMetaCloseHandler");
const externalNavigationHandler = Symbol("externalNavigationHandler");
const helpNavigationHandler = Symbol("helpNavigationHandler");
const contextCommandHandler = Symbol("contextCommandHandler");
const hostRulesTemplate = Symbol("hostRulesTemplate");
const processApplicationState = Symbol("processApplicationState");
const drivePickHandler = Symbol("drivePickHandler");
const processApiFileHandler = Symbol("processApiFileHandler");
const arcNavigationTemplate = Symbol("arcNavigationTemplate");
const exchangeSearchTemplate = Symbol("exchangeSearchTemplate");
const exchangeSelectionHandler = Symbol("exchangeSelectionHandler");
const themeActivateHandler = Symbol("themeActivateHandler");
const arcLegacyProjectTemplate = Symbol("arcLegacyProjectTemplate");
const updateIndicatorTemplate = Symbol("updateIndicatorTemplate");
const updateClickHandler = Symbol("updateClickHandler");

/**
 * Advanced REST CLient - the API Client screen.
 */
export class SearchBar extends ApplicationScreen {
  /**
   * @returns {OAuth2Authorization}
   */
  get oauthConfig() {
    return {
      clientId:
        "1076318174169-u4a5d3j2v0tbie1jnjgsluqk1ti7ged3.apps.googleusercontent.com",
      authorizationUri: "https://accounts.google.com/o/oauth2/v2/auth",
      redirectUri: "https://auth.advancedrestclient.com/oauth2",
      scopes: [
        "https://www.googleapis.com/auth/drive.file",
        "https://www.googleapis.com/auth/drive.install",
      ],
    };
  }

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
        name: "data-import",
        pattern: "data-import",
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
   * @returns {ArcRequestWorkspaceElement}
   */
  get workspaceElement() {
    if (!this.#workspace) {
      this.#workspace = document.querySelector('arc-request-workspace');
    }
    return this.#workspace;
  }

  constructor() {
    super();

    this.initObservableProperties(
      'route', 'routeParams', 'initializing', 'loadingStatus',
      'oauth2RedirectUri',
      'navigationDetached', 'updateState', 'hasAppUpdate', 'manualUpdateAvailable', 'updateVersion',
      'popupMenuEnabled', 'draggableEnabled', 'historyEnabled',
      'listType', 'detailedSearch', 'currentEnvironment',
      'workspaceSendButton', 'workspaceProgressInfo', 'workspaceAutoEncode',
      'navigationWidth', 'navigationSelected',
      'requestDetailsOpened', 'requestMetaOpened', 'metaRequestId', 'metaRequestType',
      'systemVariablesEnabled', 'variablesEnabled',
    );

    /** 
     * @type {boolean} Whether the project is being restored from the metadata store.
     */
    this.initializing = true;

    /**
     * @type {ARCConfig}
     */
    this.config = undefined;

    /** 
     * @type {string} A loading state information.
     */
    this.loadingStatus = 'Initializing application...';


    window.onunhandledrejection = this[unhandledRejectionHandler].bind(this);
    
    // todo: do the below when the application is already initialized.
    
    // this[navigationHandler] = this[navigationHandler].bind(this);
    
    // window.addEventListener(ModelingEventTypes.State.Navigation.change, this[navigationHandler]);
    
    this.oauth2RedirectUri = 'http://auth.advancedrestclient.com/arc.html';
    
    /**
     * A list of detached menu panels.
     * @type {string[]}
     */
    this.menuPopup = [];
    /** 
     * When set the navigation element is detached from the main application window.
     */
    this.navigationDetached = false;

    /** 
     * Whether application update is available.
     */
    this.hasAppUpdate = false;
    /** 
     * Set whe an update is available but it has to be triggered manually.
     */
    this.manualUpdateAvailable = false;
    /** 
     * The current state of checking for update.
     * @type {string}
     */
    this.updateState = undefined;
    
    /** 
     * Whether the application menu can be detached to a new window.
     */
    this.popupMenuEnabled = true;
    /** 
     * Whether the application support request object drag and drop
     */
    this.draggableEnabled = true;

    /** 
     * Whether the requests history is enabled.
     */
    this.historyEnabled = true;

    /** 
     * The current setting for the list types view.
     */
    this.listType = 'default';

    /** 
     * Whether the history / saved search should perform slower but more detailed search
     */
    this.detailedSearch = false;

    /** 
     * The name of the currently selected environment. Null for the default.
     */
    this.currentEnvironment = null;

    /** 
     * Whether the application should process system variables.
     */
    this.systemVariablesEnabled = true;
    /** 
     * Enables variables processor.
     */
    this.variablesEnabled = true;

    /** 
     * The currently selected navigation group.
     * @type {number}
     */
    this.navigationSelected = undefined;

    this.workspaceSendButton = true;
    this.workspaceProgressInfo = true;
    this.workspaceAutoEncode = false;

    this.requestDetailsOpened = false;
    this.requestMetaOpened = false;
    this.metaRequestId = undefined;
    this.metaRequestType = undefined;

    this.monacoBase = `../../node_modules/monaco-editor/`;
  }

  async initialize() {
    this.initModels();
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
    this.#workspace.id = init.workspaceId;
    // let state = /** @type ARCState */(null);
    // try {
    //   state = await this.stateProxy.read();
    // } catch (e) {
    //   state = {
    //     kind: 'ARC#AppState',
    //   };
    // }
    // this[processApplicationState](state);

    await this.afterInitialization();
    await this.loadMonaco();
    this.initializing = false;
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
    
    if (cnf.history) {
      if (typeof cnf.history.enabled === 'boolean') {
        this.historyEnabled = cnf.history.enabled;
      }
      
      if (typeof cnf.history.fastSearch === 'boolean') {
        this.detailedSearch = !cnf.history.fastSearch;
      }
    }

    if (cnf.request) {
      if (typeof cnf.request.useSystemVariables === 'boolean') {
        this.systemVariablesEnabled = cnf.request.useSystemVariables;
      }
      if (typeof cnf.request.useAppVariables === 'boolean') {
        this.variablesEnabled = cnf.request.useAppVariables;
      }
      if (cnf.request.oauth2redirectUri) {
        this.oauth2RedirectUri = cnf.request.oauth2redirectUri;
      }
    }
    
    if (cnf.view) {
      if (typeof cnf.view.fontSize === 'number') {
        document.body.style.fontSize = `${cnf.view.fontSize}px`;
      }
      if (typeof cnf.view.popupMenu === 'boolean') {
        this.popupMenuEnabled = cnf.view.popupMenu;
      }
      if (typeof cnf.view.draggableEnabled === 'boolean') {
        this.draggableEnabled = cnf.view.draggableEnabled;
      }
      if (typeof cnf.view.listType === 'string') {
        this.listType = cnf.view.listType;
      }
    }

    if (cnf.requestEditor) {
      if (typeof cnf.requestEditor.sendButton === 'boolean') {
        this.workspaceSendButton = cnf.requestEditor.sendButton;
      }
      if (typeof cnf.requestEditor.progressInfo === 'boolean') {
        this.workspaceProgressInfo = cnf.requestEditor.progressInfo;
      }
      if (typeof cnf.requestEditor.bodyEditor === 'string') {
        this.workspaceBodyEditor = cnf.requestEditor.bodyEditor;
      }
      if (typeof cnf.requestEditor.autoEncode === 'boolean') {
        this.workspaceAutoEncode = cnf.requestEditor.autoEncode;
      }
    }
  }

  /**
   * @param {ARCState} state
   */
  [processApplicationState](state) {
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

  initModels() {
    this.requestModel = new RequestModel();
    this.projectModel = new ProjectModel();
    this.restApiModel = new RestApiModel();
    this.authDataModel = new AuthDataModel();
    this.hostRulesModel = new HostRulesModel();
    this.variablesModel = new VariablesModel();
    this.urlHistoryModel = new UrlHistoryModel();
    this.historyDataModel = new HistoryDataModel();
    this.clientCertificateModel = new ClientCertificateModel();
    this.websocketUrlHistoryModel = new WebsocketUrlHistoryModel();
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
   * @param {PromiseRejectionEvent} e
   */
  [unhandledRejectionHandler](e) {
    /* eslint-disable-next-line no-console */
    console.error(e);
    this.reportCriticalError(e.reason);
  }

  async loadMonaco() {
    const { monacoBase } = this;
    MonacoLoader.createEnvironment(monacoBase);
    await MonacoLoader.loadMonaco(monacoBase);
    await MonacoLoader.monacoReady();
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
    // this.ga.screenView(name);
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
    // this.workspaceElement.removeRequest();
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
  [navigateRequestHandler](e) {
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
  [navigateProjectHandler](e) {
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
  [navigateRestApiHandler](e) {
    const { api, version } = e;
    navigatePage('api-console.html', 'open', 'db', api, version);
  }

  /**
   * @param {ARCMenuPopupEvent} e
   */
   [popupMenuHandler](e) {
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
  [navigateHandler](e) {
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
   * @param {ARCExternalNavigationEvent} e
   * @todo: Move this to the bindings!
   */
  [externalNavigationHandler](e) {
    const { url, detail } = e;
    const { purpose } = detail;
    if (!purpose) {
      Events.Navigation.navigateExternal(this.eventTarget, url);
    } else {
      Events.Navigation.openWebUrl(this.eventTarget, url, purpose);
    }
  }

  /**
   * @param {ARCHelpTopicEvent} e
   * @todo: Move this to the bindings!
   */
  [helpNavigationHandler](e) {
    const { topic } = e;
    Events.Navigation.helpTopic(this.eventTarget, topic)
  }

  /**
   * A handler for the main toolbar arrow back click.
   * Always navigates to the workspace.
   */
  [mainBackHandler]() {
    navigate('workspace');
  }

  /**
   * Handler for application command.
   *
   * @param {CustomEvent} e 
   */
  [commandHandler](e) {
    const { action, args } = e.detail;
    switch (action) {
      case 'open-saved': navigate('saved'); break;
      case 'open-history': navigate('history'); break;
      case 'open-cookie-manager': navigate('cookie-manager'); break;
      case 'open-hosts-editor': navigate('hosts'); break;
      case 'open-themes': navigate('themes'); break;
      case 'open-client-certificates': navigate('client-certificates'); break;
      case 'open-requests-workspace': navigate('workspace'); break;
      case 'open-web-socket': this.workspaceElement.addWsRequest(); break;
      case 'process-external-file': this.processExternalFile(args[0]); break;
      case 'import-data': navigate('data-import'); break;
      case 'export-data': navigate('data-export'); break;
      case 'show-settings': navigate('settings'); break;
      case 'popup-menu': this.navigationDetached = !this.navigationDetached; break;
      case 'export-workspace': this.exportWorkspace(); break;
      case 'login-external-webservice': this.workspaceElement.openWebUrlInput(); break;
      case 'open-workspace-details': this.workspaceElement.openWorkspaceDetails(); break;
      default:
        console.warn(`Unhandled IO command ${action}`);
    }
  }

  /**
   * Handles action performed in main thread (menu action) related to a request.
   *
   * @param {CustomEvent} e
   */
  [requestActionHandler](e) {
    const { action, args } = e.detail;
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
        console.warn(`Unhandled IO request command ${action}`);
    }
  }

  /**
   * @param {CustomEvent} e
   */
  [contextCommandHandler](e) {
    const { detail } = e;
    const { target, id } = detail;
    switch (id) {
      case 'close-tab': this.workspaceElement.removeRequest(getTabClickIndex(target)); break;
      case 'close-other-tabs': this.workspaceElement.closeAllTabs(getTabClickIndex(target)); break;
      case 'close-all-tabs': this.workspaceElement.closeAllTabs(); break;
      case 'duplicate-tab': this.workspaceElement.duplicateTab(getTabClickIndex(target)); break;
      default:
    }
  }

  /**
   * @param {ConfigStateUpdateEvent} e
   */
  [configStateChangeHandler](e) {
    const { key, value } = e.detail;
    if (key === 'request.ignoreSessionCookies') {
      if (value) {
        ModulesRegistry.register(ModulesRegistry.request, 'arc/request/cookies', RequestCookies.processRequestCookies, ['events']);
        ModulesRegistry.register(ModulesRegistry.response, 'arc/response/cookies', RequestCookies.processResponseCookies, ['events']);
      } else {
        ModulesRegistry.unregister(ModulesRegistry.request, 'arc/request/cookies');
        ModulesRegistry.unregister(ModulesRegistry.response, 'arc/response/cookies');
      }
    } else if (key === 'view.popupMenu') {
      this.popupMenuEnabled = value;
    } else if (key === 'view.draggableEnabled') {
      this.draggableEnabled = value;
    } else if (key === 'request.oauth2redirectUri') {
      this.oauth2RedirectUri = value;
    } else if (key === 'view.listType') {
      this.listType = value;
    } else if (key === 'history.enabled') {
      this.historyEnabled = value;
    } else if (key === 'history.fastSearch') {
      this.detailedSearch = !value;
    } else if (key === 'request.useSystemVariables') {
      this.systemVariablesEnabled = value;
    } else if (key === 'request.useAppVariables') {
      this.variablesEnabled = value;
    } else if (key === 'requestEditor.sendButton') {
      this.workspaceSendButton = value;
    } else if (key === 'requestEditor.progressInfo') {
      this.workspaceProgressInfo = value;
    } else if (key === 'requestEditor.bodyEditor') {
      this.workspaceBodyEditor = value;
    } else if (key === 'requestEditor.autoEncode') {
      this.workspaceAutoEncode = value;
    } else if (key === 'view.fontSize') {
      document.body.style.fontSize = `${value}px`;
    }
  }

  /**
   * Calls ARC app to serialize workspace data and exports it to a file.
   * @return {Promise}
   */
  async exportWorkspace() {
    // const id = await this.workspace.changeStoreLocation();
    // if (!id) {
    //   return;
    // }
    // this.initOptions.workspaceId = id;
    // this.render();
    // this.workspaceElement.store();
  }
}
