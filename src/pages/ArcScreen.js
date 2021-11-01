/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable class-methods-use-this */
import { html } from "lit-html";
import { classMap } from "lit-html/directives/class-map.js";
import { styleMap } from "lit-html/directives/style-map.js";
import { EventTypes, Events, ProjectActions } from "@advanced-rest-client/events";
import { ProjectModel, RequestModel, RestApiModel, AuthDataModel, HostRulesModel, VariablesModel, UrlHistoryModel, HistoryDataModel, ClientCertificateModel, WebsocketUrlHistoryModel, UrlIndexer, ArcDataExport, ArcDataImport } from '@advanced-rest-client/idb-store'
import '@anypoint-web-components/awc/bottom-sheet.js';

import { ApplicationScreen } from "./ApplicationScreen.js";
import { findRoute, navigate, navigatePage } from "../lib/route.js";
import { ModulesRegistry } from "../request-modules/ModulesRegistry.js";
import * as RequestCookies from "../request-modules/RequestCookies.js";
import { ArcContextMenu } from "../context-menu/ArcContextMenu.js";
import ContextMenuCommands from "../context-menu/ArcContextMenuCommands.js";
import { getTabClickIndex } from '../lib/Utils.js';
import * as Constants from '../Constants.js';
import '../../define/arc-request-workspace.js';
import '../../define/arc-menu.js';
import '../../define/project-screen.js';
import '../../define/host-rules-editor.js';
import '../../define/request-meta-editor.js';
import '../../define/request-meta-details.js';
import '../../define/arc-settings.js';
import '../../define/cookie-manager.js';
import '../../define/arc-export-form.js';

/** @typedef {import('lit-element').TemplateResult} TemplateResult */
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
/** @typedef {import('@advanced-rest-client/events').Application.AppVersionInfo} AppVersionInfo */
/** @typedef {import('../../').ArcRequestWorkspaceElement} ArcRequestWorkspaceElement */
/** @typedef {import('../../').ArcMenuElement} ArcMenuElement */
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
export class ArcScreen extends ApplicationScreen {
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
    this.initializing = false;
    /** 
     * @type {string} A loading state information.
     */
    this.loadingStatus = 'Initializing application...';
    /**
     * The default OAuth2 redirect URI.
     * @type string
     */
    this.oauth2RedirectUri = 'http://auth.advancedrestclient.com/arc.html';
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
     * Whether application update is available.
     */
    this.hasAppUpdate = false;

    /** 
     * Set whe an update is available but it has to be triggered manually.
     */
    this.manualUpdateAvailable = false;
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

    /** @type string */
    this.metaRequestId = undefined;
    
    /** @type string */
    this.metaRequestType = undefined;

    /** @type string */
    this.updateVersion = undefined;

    /** 
     * The current setting for the list types view.
     */
    this.listType = 'default';

    /** 
     * Whether the history / saved search should perform slower but more detailed search
     */
    this.detailedSearch = false;

    window.onunhandledrejection = this[unhandledRejectionHandler].bind(this);
    
    // todo: do the below when the application is already initialized.
    // this[navigationHandler] = this[navigationHandler].bind(this);
    // window.addEventListener(ModelingEventTypes.State.Navigation.change, this[navigationHandler]);

    /**
     * Current application version info.
     * @type {AppVersionInfo}
     */
    this.versionInfo = {
      appVersion: 'loading...',
      chrome: 'loading...',
    };
  }

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
    this[processApplicationState](state);
    this.versionInfo = await this.loadVersionInfo();
    this.#dataExport.appVersion = this.versionInfo.appVersion;
    await this.afterInitialization();
    this.initializing = false;
  }

  listen() {
    this.#contextMenu.connect();
    this.#contextMenu.registerCommands(ContextMenuCommands);
    this.#contextMenu.addEventListener('execute', this[contextCommandHandler].bind(this));

    this.#dataExport.listen();
    this.#dataImport.listen();

    window.addEventListener(EventTypes.Navigation.navigateRequest, this[navigateRequestHandler].bind(this));
    window.addEventListener(EventTypes.Navigation.navigate, this[navigateHandler].bind(this));
    window.addEventListener(EventTypes.Navigation.navigateProject, this[navigateProjectHandler].bind(this));
    window.addEventListener(EventTypes.Navigation.navigateRestApi, this[navigateRestApiHandler].bind(this));
    window.addEventListener(EventTypes.Navigation.popupMenu, this[popupMenuHandler].bind(this));
    window.addEventListener(EventTypes.Navigation.navigateExternal, this[externalNavigationHandler].bind(this));
    window.addEventListener(EventTypes.Navigation.helpTopic, this[helpNavigationHandler].bind(this));
    window.addEventListener(EventTypes.Workspace.appendRequest, this[workspaceAppendRequestHandler].bind(this));
    window.addEventListener(EventTypes.Workspace.appendExport, this[workspaceAppendExportHandler].bind(this));
    window.addEventListener(EventTypes.Config.State.update, this[configStateChangeHandler].bind(this));
    window.addEventListener(EventTypes.DataImport.inspect, this[dataInspectHandler].bind(this));
    window.addEventListener(EventTypes.Model.Environment.State.select, this[environmentSelectedHandler].bind(this));
    window.addEventListener(EventTypes.RestApiLegacy.processFile, this[processApiFileHandler].bind(this));
    window.addEventListener('mousemove', this[resizeMouseMove].bind(this));
    window.addEventListener('mouseup', this[resizeMouseUp].bind(this));
    window.addEventListener('themeactivated', this[themeActivateHandler].bind(this));
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

  /**
   * Initializes ARC datastore models.
   */
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
    Events.Navigation.helpTopic(this.eventTarget, topic);
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
  [requestActionHandler](e) {
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
   * @param {string} filePath
   */
  async processExternalFile(filePath) {
    const factory = new ImportFilePreProcessor(filePath);
    try {
      await factory.prepare();
      const isApiFile = await factory.isApiFile();
      if (isApiFile) {
        const result = await this.apiParser.processBuffer(factory.buffer);
        this.apiConsoleFromParser(result);
        return;
      }
      const contents = factory.readContents();
      await this.processExternalData(contents);
    } catch (cause) {
      // eslint-disable-next-line no-console
      console.error(cause);
      this.reportCriticalError(cause);
    }
  }

  /**
   * Process file contents after importing it to the application.
   * @param {string} contents
   */
  async processExternalData(contents) {
    const decrypted = await this.decryptIfNeeded(contents);
    const data = JSON.parse(decrypted);
    if (data.swagger) {
      const result = await this.apiParser.processBuffer(Buffer.from(contents));
      this.apiConsoleFromParser(result);
      return;
    }
    const processor = new ImportNormalize();
    const normalized = await processor.normalize(data);

    if (isSingleRequest(normalized)) {
      const insert = Array.isArray(normalized.requests) ? normalized.requests[0] : data;
      Events.Workspace.appendRequest(document.body, insert);
      return;
    }
    
    if (normalized.loadToWorkspace) {
      Events.Workspace.appendExport(document.body, normalized);
      return;
    }
    this.route = 'data-inspect';
    this[inspectDataValue] = normalized;
    this.render();
  }

  /**
   * @param {ApiParseResult} result
   */
  async apiConsoleFromParser(result) {
    const id = await this.fs.storeApicModelTmp(result);
    navigatePage('api-console.html', 'open', 'file', id);
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

  [popupMenuOpenedHandler](e, type) {
    this.menuToggleOption(type, true);
  }

  [popupMenuClosedHandler](e, type) {
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
  [mainNavigateHandler](e, type, args) {
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
  [environmentSelectorHandler](e) {
    const overlay = document.querySelector('variables-overlay');
    overlay.positionTarget = /** @type HTMLElement */ (e.target);
    overlay.opened = true;
  }

  /**
   * @param {KeyboardEvent} e
   */
  [environmentSelectorKeyHandler](e) {
    if (['Space', 'Enter', 'ArrowDown'].includes(e.code)) {
      this[environmentSelectorHandler](e);
    }
  }

  async [fileImportHandler]() {
    const result = await this.fs.pickFile();
    if (result.canceled) {
      return;
    }
    const [file] = result.filePaths;
    this.processExternalFile(file);
  }

  /**
   * @param {ArcImportInspectEvent} e
   */
  [dataInspectHandler](e) {
    const { data } = e.detail;
    this.route = 'data-inspect';
    this[inspectDataValue] = data;
    this.render();
  }

  /**
   * @param {CustomEvent} e
   */
  async [importDataHandler](e) {
    const { detail } = e;
    const store = new ImportFactory();
    const result = await store.importData(detail);
    
    const { savedIndexes, historyIndexes } = store;
    this[notifyIndexer](savedIndexes, historyIndexes);
    Events.DataImport.dataImported(document.body);
    this[mainBackHandler]();
  }

  /**
   * Dispatches `url-index-update` event handled by `arc-models/url-indexer`.
   * It will index URL data for search function.
   * @param {IndexableRequest[]} saved List of saved requests indexes
   * @param {IndexableRequest[]} history List of history requests indexes
   */
  [notifyIndexer](saved, history) {
    let indexes = [];
    if (saved) {
      indexes = indexes.concat(saved);
    }
    if (history) {
      indexes = indexes.concat(history);
    }
    if (!indexes.length) {
      return;
    }
    Events.Model.UrlIndexer.update(document.body, indexes);
  }

  /**
   * @param {WorkspaceAppendRequestEvent} e
   */
  [workspaceAppendRequestHandler](e) {
    const { request } = e.detail;
    this.workspaceElement.add(request);
    navigate('workspace');
  }

  /**
   * @param {WorkspaceAppendExportEvent} e
   */
  [workspaceAppendExportHandler](e) {
    const { requests, history } = e.detail.data;
    const { workspaceElement } = this;
    (requests || []).forEach((request) => workspaceElement.add(request));
    (history || []).forEach((request) => workspaceElement.add(request));
    navigate('workspace');
  }

  /**
   * @param {ARCEnvironmentStateSelectEvent} e
   */
  [environmentSelectedHandler](e) {
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
  [navMinimizedHandler](e) {
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
  async [menuRailSelected](e) {
    const menu = /** @type ArcMenuElement */ (e.target);
    this.navigationSelected = menu.selected;
    await Events.App.updateStateProperty(this.eventTarget, 'navigation.selected', menu.selected);
  }

  /**
   * @param {MouseEvent} e
   */
  [navResizeMousedown](e) {
    this[isResizing] = true;
    e.preventDefault();
  }

  /**
   * @param {MouseEvent} e
   */
  [resizeMouseUp](e) {
    if (!this[isResizing]) {
      return;
    }
    this[isResizing] = false;
    e.preventDefault();
  }

  /**
   * @param {MouseEvent} e
   */
  [resizeMouseMove](e) {
    if (!this[isResizing]) {
      return;
    }
    const { pageX } = e;
    if (pageX < 100) {
      return;
    }
    if (pageX > window.innerWidth - 100) {
      return;
    }
    this.navigationWidth = pageX;
  }

  [metaRequestHandler]() {
    this.requestMetaOpened = true;
    this.requestDetailsOpened = false;
  }

  [requestMetaCloseHandler]() {
    this.requestMetaOpened = false;
  }

  [sheetClosedHandler](e) {
    const prop = e.target.dataset.openProperty;
    this[prop] = e.detail.value;
  }

  /**
   * @param {Electron.IpcRendererEvent} e
   * @param {string} fileId
   */
  async [drivePickHandler](e, fileId) {
    try {
      const result = await Events.Google.Drive.read(this.eventTarget, fileId);
      await this.processExternalData(result);
    } catch (cause) {
      // eslint-disable-next-line no-console
      console.error(cause);
      this.reportCriticalError(cause);
    }
  }

  /**
   * @param {RestApiProcessFileEvent} e
   */
  async [processApiFileHandler](e) {
    const { file } = e;
    const result = await this.apiParser.processApiFile(file);
    if (result) {
      this.apiConsoleFromParser(result);
    }
  }

  /** 
   * @param {CustomEvent} e
   */
  async [exchangeSelectionHandler](e) {
    const asset = /** @type ExchangeAsset */ (e.detail);
    let file;
    const types = ['fat-raml', 'raml', 'oas'];
    for (let i = 0, len = asset.files.length; i < len; i++) {
      if (types.indexOf(asset.files[i].classifier) !== -1) {
        file = asset.files[i];
        break;
      }
    }
    if (!file || !file.externalLink) {
      this.reportCriticalError('RAML data not found in the asset.');
      return;
    }
    const { externalLink, mainFile, md5, packaging } = file;
    try {
      const result = await this.apiParser.processApiLink(externalLink, mainFile, md5, packaging);
      this.apiConsoleFromParser(result);
    } catch (cause) {
      this.reportCriticalError(cause.message);
    }
  }

  /**
   * @param {CustomEvent} e
   */
  [themeActivateHandler](e) {
    this.anypoint = e.detail === Constants.anypointTheme;
  }

  /**
   * A handler for the application update notification click.
   * It installs the update when manual installation is not requested.
   * If manual installation is requested then it opens the release page.
   */
  [updateClickHandler]() {
    const { manualUpdateAvailable, hasAppUpdate } = this;
    if (manualUpdateAvailable) {
      const { updateVersion } = this;
      const base = 'https://github.com/advanced-rest-client/arc-electron/releases/tag';
      const url = `${base}/v${updateVersion}`;
      Events.Navigation.navigateExternal(this.eventTarget, url);
    } else if (hasAppUpdate) {
      Events.Updater.installUpdate(this.eventTarget);
    }
  }

  appTemplate() {
    const { initializing } = this;
    if (initializing) {
      return this.loaderTemplate();
    }
    return html`
    <div class="content">
      ${this[navigationTemplate]()}
      ${this[pageTemplate](this.route)}
    </div>
    `;
  }

  /**
   * @returns {TemplateResult} A template for the loader
   */
  loaderTemplate() {
    return html`
    <div class="app-loader">
      <p class="message">Preparing something spectacular</p>
      <p class="sub-message">${this.loadingStatus}</p>
    </div>
    `;
  }

  /**
   * @returns {TemplateResult} The template for the header
   */
  [headerTemplate]() {
    const { route } = this;
    const isWorkspace = route === 'workspace';
    return html`
    <header>
      ${isWorkspace ? '' : 
      html`
      <anypoint-icon-button title="Back to the request workspace" @click="${this[mainBackHandler]}"  class="header-action-button">
        <arc-icon icon="arrowBack"></arc-icon>
      </anypoint-icon-button>`}
      API Client
      <span class="spacer"></span>
      ${this[updateIndicatorTemplate]()}
      ${this[environmentTemplate]()}
    </header>`;
  }

  /**
   * @returns {TemplateResult|string} The template for the app update indicator
   */
  [updateIndicatorTemplate]() {
    const { manualUpdateAvailable, hasAppUpdate } = this;
    if (!manualUpdateAvailable && !hasAppUpdate) {
      return '';
    }
    return html`
    <anypoint-icon-button title="Application update available" class="header-action-button" @click="${this[updateClickHandler]}">
      <arc-icon icon="cloudDownload"></arc-icon>
    </anypoint-icon-button>`;
  }

  /**
   * @returns {TemplateResult|string} The template for the environment selector and the overlay.
   */
  [environmentTemplate]() {
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
      @click="${this[environmentSelectorHandler]}"
      @keydown="${this[environmentSelectorKeyHandler]}"
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
  [navigationTemplate]() {
    if (this.navigationDetached) {
      return '';
    }
    const { navigationWidth } = this;
    const hasWidth = typeof navigationWidth === 'number';
    const classes = {
      'auto-width': hasWidth,
    };
    const styles = {
      width: '',
    };
    if (hasWidth) {
      styles.width = `${navigationWidth}px`;
    }
    return html`
    <nav
      class="${classMap(classes)}"
      style="${styleMap(styles)}"
    >
      ${this[arcNavigationTemplate]()}
      <div class="nav-resize-rail" @mousedown="${this[navResizeMousedown]}"></div>
    </nav>
    `;
  }

  /**
   * @returns {TemplateResult} The template for the ARC navigation
   */
  [arcNavigationTemplate]() {
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
      @minimized="${this[navMinimizedHandler]}"
      @selected="${this[menuRailSelected]}"
    ></arc-menu>
    `;
  }

  /**
   * @param {string} route The current route
   * @returns {TemplateResult} The template for the page content
   */
  [pageTemplate](route) {
    return html`
    <main id="main">
      ${this[headerTemplate]()}
      ${this[workspaceTemplate](route === 'workspace')}
      ${this[historyPanelTemplate](route)}
      ${this[savedPanelTemplate](route)}
      ${this[clientCertScreenTemplate](route)}
      ${this[dataImportScreenTemplate](route)}
      ${this[dataExportScreenTemplate](route)}
      ${this[cookieManagerScreenTemplate](route)}
      ${this[settingsScreenTemplate](route)}
      ${this[importInspectorTemplate](route)}
      ${this[hostRulesTemplate](route)}
      ${this[exchangeSearchTemplate](route)}
      ${this[arcLegacyProjectTemplate](route)}
      ${this[requestDetailTemplate]()}
      ${this[requestMetaTemplate]()}
    </main>
    `;
  }

  /**
   * @param {boolean} visible Whether the workspace is rendered in the view
   * @returns
   */
  [workspaceTemplate](visible) {
    const { oauth2RedirectUri, anypoint, initOptions, workspaceSendButton, workspaceProgressInfo } = this;
    // if (typeof cnf.requestEditor.bodyEditor === 'string') {
    //   this.workspaceBodyEditor = cnf.requestEditor.bodyEditor;
    // }
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
      backendId="${initOptions.workspaceId}"
      autoRead
      class="screen"
    ></arc-request-workspace>
    `;
  }

  /**
   * @param {string} route The current route
   * @returns {TemplateResult|string} The template for the history screen
   */
  [historyPanelTemplate](route) {
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
  [savedPanelTemplate](route) {
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
  [clientCertScreenTemplate](route) {
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
   * @returns {TemplateResult|string} The template for the data import screen
   */
  [dataImportScreenTemplate](route) {
    if (route !== 'data-import') {
      return '';
    }
    const { anypoint } = this;
    return html`
    <div class="screen">
      <h2>Data import</h2>
      <p>You can import ARC data from any previous version, Postman export and backup, and API specification (RAML or OAS)</p>
      <anypoint-button @click="${this[fileImportHandler]}" ?anypoint="${anypoint}">Select file</anypoint-button>
    </div>
    `;
  }

  [importInspectorTemplate](route) {
    if (route !== 'data-inspect') {
      return '';
    }
    const data = this[inspectDataValue];
    return html`
    <import-data-inspector
      .data="${data}"
      class="screen"
      @cancel="${this[mainBackHandler]}"
      @import="${this[importDataHandler]}"
    ></import-data-inspector>
    `;
  }

  /**
   * @param {string} route The current route
   * @returns {TemplateResult|string} The template for the data export screen
   */
  [dataExportScreenTemplate](route) {
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
  [cookieManagerScreenTemplate](route) {
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
  [settingsScreenTemplate](route) {
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
  [requestDetailTemplate]() {
    const { anypoint, requestDetailsOpened, metaRequestId, metaRequestType } = this;
    return html`
    <bottom-sheet
      class="bottom-sheet-container"
      .opened="${requestDetailsOpened}"
      data-open-property="requestDetailsOpened"
      @closed="${this[sheetClosedHandler]}"
    >
      <request-meta-details
        ?anypoint="${anypoint}"
        .requestId="${metaRequestId}"
        .requestType="${metaRequestType}"
        @edit="${this[metaRequestHandler]}"
      ></request-meta-details>
    </bottom-sheet>`;
  }

  /**
   * @returns {TemplateResult} The template for the request metadata editor dialog
   */
  [requestMetaTemplate]() {
    const { anypoint, requestMetaOpened, metaRequestId, metaRequestType } = this;
    return html`
    <bottom-sheet
      class="bottom-sheet-container"
      .opened="${requestMetaOpened}"
      data-open-property="requestMetaOpened"
      @closed="${this[sheetClosedHandler]}"
    >
      <request-meta-editor
        ?anypoint="${anypoint}"
        .requestId="${metaRequestId}"
        .requestType="${metaRequestType}"
        @close="${this[requestMetaCloseHandler]}"
      ></request-meta-editor>
    </bottom-sheet>`;
  }

  /**
   * @param {string} route The current route
   * @returns {TemplateResult|string} The template for the host rules mapping element
   */
  [hostRulesTemplate](route) {
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
  [exchangeSearchTemplate](route) {
    if (route !== 'exchange-search') {
      return '';
    }
    const { anypoint } = this;
    return html`
    <exchange-search-panel
      ?anypoint="${anypoint}"
      anypointAuth
      columns="auto"
      exchangeRedirectUri="https://auth.advancedrestclient.com/"
      exchangeClientId="2dc40927457042b5862864c3c97737d7"
      forceOauthEvents
      @selected="${this[exchangeSelectionHandler]}"
      class="screen scroll"
    ></exchange-search-panel>
    `;
  }

  /**
   * @param {string} route The current route
   * @returns {TemplateResult|string} The template for the ARC legacy projects.
   */
  [arcLegacyProjectTemplate](route) {
    if (route !== 'project') {
      return '';
    }
    const { routeParams={}, anypoint } = this;
    return html`
    <project-screen 
      .projectId="${routeParams.pid}"
      ?anypoint="${anypoint}"
      class="screen scroll"
    ></project-screen>
    `;
  }
}
