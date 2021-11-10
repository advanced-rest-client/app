import { TemplateResult } from "lit-html";
import { ARCRequestNavigationEvent, ARCProjectNavigationEvent, ARCRestApiNavigationEvent, Config, ARCMenuPopupEvent, ArcState, Application, ARCNavigationEvent, ConfigStateUpdateEvent, WorkspaceAppendRequestEvent, WorkspaceAppendExportEvent, ARCEnvironmentStateSelectEvent } from "@advanced-rest-client/events";
import { ProjectModel, RequestModel, RestApiModel, AuthDataModel, HostRulesModel, VariablesModel, UrlHistoryModel, HistoryDataModel, ClientCertificateModel, WebsocketUrlHistoryModel, UrlIndexer, ArcDataExport, ArcDataImport } from '@advanced-rest-client/idb-store'
import { ArcContextMenu, ArcRequestWorkspaceElement } from "@advanced-rest-client/base";
import { ApplicationScreen } from "./ApplicationScreen.js";
import { Route } from "../lib/route.js";
import { ArcAppInitOptions } from '../types';

/**
 * Advanced REST CLient - the API Client screen.
 */
export class ArcScreen extends ApplicationScreen {
  static get routes(): Route[];
  #workspace: ArcRequestWorkspaceElement;
  #contextMenu: ArcContextMenu;
  /** 
   * IDB data export processor.
   */
  #dataExport: ArcDataExport;
  /** 
   * IDB data import processor.
   */
  #dataImport: ArcDataImport;
  config: Config.ARCConfig;
  /**
   * A list of detached menu panels.
   */
  menuPopup: string[];
  requestModel: RequestModel;
  projectModel: ProjectModel;
  restApiModel: RestApiModel;
  authDataModel: AuthDataModel;
  hostRulesModel: HostRulesModel;
  variablesModel: VariablesModel;
  urlHistoryModel: UrlHistoryModel;
  historyDataModel: HistoryDataModel;
  clientCertificateModel: ClientCertificateModel;
  websocketUrlHistoryModel: WebsocketUrlHistoryModel;
  urlIndexer: UrlIndexer;
  get workspaceElement(): ArcRequestWorkspaceElement;

  /**
   * @returns whether the history capturing is enabled in the application.
   */
  get historyEnabled(): boolean;

  /**
   * @returns whether the history / saved search should perform slower but more detailed search
   */
  get detailedSearch(): boolean;

  /** 
   * @returns The current setting for the list types view.
   */
  get listType(): string;

  /** 
   * @returns Whether the application menu can be detached to a new window.
   */
  get popupMenuEnabled(): boolean;

  /** 
   * @returns Whether the application support request object drag and drop
   */
  get draggableEnabled(): boolean;

  /** 
   * @returns Whether the application should process system variables.
   */
  get systemVariablesEnabled(): boolean;

  /** 
   * @returns Whether the application variables are enabled.
   */
  get variablesEnabled(): boolean;

  /**
   * @returns The default OAuth2 redirect URI.
   */
  get oauth2RedirectUri(): string;

  /**
   * @returns Whether the http editor should render the "send" button.
   */
  get workspaceSendButton(): boolean;

  /**
   * @returns Whether the http editor should render the progress information when sending a request.
   */
  get workspaceProgressInfo(): boolean;

  /**
   * @returns Whether the http editor should automatically encode parameters.
   */
  get workspaceAutoEncode(): boolean;
  get systemVariables(): Readonly<{[key: string]: string;}>;
  set systemVariables(value: Readonly<{[key: string]: string;}>);
  /** 
   * @type Whether the project is being restored from the metadata store.
   */
  initializing: boolean;
  /** 
  * @type A loading state information.
  */
  loadingStatus: string;
  /** 
  * When set the navigation element is detached from the main application window.
  */
  navigationDetached: boolean;
  /** 
  * The current state of checking for update.
  */
  updateState: string;
  /** 
  * The name of the currently selected environment. Null for the default.
  */
  currentEnvironment: string;
  /** 
  * The currently selected navigation group.
  */
  navigationSelected: number;
  requestDetailsOpened: boolean;
  requestMetaOpened: boolean;
  metaRequestId: string;
  metaRequestType: string;
  /**
  * Current application version info.
  */
  versionInfo: Application.AppVersionInfo;
  constructor();
  /**
   * Runs the logic to initialize the application.
   */
  initialize(): Promise<void>;
  listen(): void;
  /**
   * Sets local variables from the config object
   */
  setConfigVariables(cnf: Config.ARCConfig): void;
  processApplicationState(state: ArcState.ARCState): void;
  /**
   * Initializes ARC datastore models.
   */
  initModels(): void;
  /**
   * @returns The init options of this browser process.
   */
  collectInitOptions(): ArcAppInitOptions;
  /**
   * Tasks to be performed after the application is initialized.
   */
  afterInitialization(): Promise<void>;
  /**
   * Called when route change
   */
  onRoute(): void;
  /**
   * Closes a tab in the request workspace at the specified position
   */
  closeWorkspaceTab(index: number): void;
  /**
   * Closes all tabs in the request workspace
   */
  closeAllWorkspaceTabs(): void;
  /**
   * Closes all tabs in the request workspace except for the given index.
   */
  closeOtherWorkspaceTabs(index: number): void;
  /**
   * Duplicates a tab at the given index.
   */
  duplicateWorkspaceTab(index: number): void;
  navigateRequestHandler(e: ARCRequestNavigationEvent): void;
  navigateProjectHandler(e: ARCProjectNavigationEvent): void;
  navigateRestApiHandler(e: ARCRestApiNavigationEvent): void;
  popupMenuHandler(e: ARCMenuPopupEvent): void;
  navigateHandler(e: ARCNavigationEvent): void;
  /**
   * A handler for the main toolbar arrow back click.
   * Always navigates to the workspace.
   */
  mainBackHandler(): void;
  /**
   * Handler for application command.
   */
  commandHandler(e: CustomEvent): void;
  /**
   * Handles action performed in main thread (menu action) related to a request.
   */
  requestActionHandler(e: CustomEvent): void;
  contextCommandHandler(e: CustomEvent): void;
  configStateChangeHandler(e: ConfigStateUpdateEvent): void;
  popupMenuOpenedHandler(e: unknown, type: string): void;
  popupMenuClosedHandler(e: unknown, type: string): void;
  /**
   * @param type The menu name
   * @param value Whether the menu is rendered in an external window.
   */
  menuToggleOption(type: string, value: boolean): void;
  mainNavigateHandler(e: unknown, type: string, args: string[]): void;
  environmentSelectorHandler(e: Event): void;
  environmentSelectorKeyHandler(e: KeyboardEvent): void;
  workspaceAppendRequestHandler(e: WorkspaceAppendRequestEvent): void;
  workspaceAppendExportHandler(e: WorkspaceAppendExportEvent): void;
  environmentSelectedHandler(e: ARCEnvironmentStateSelectEvent): void;
  navMinimizedHandler(e: Event): void;
  menuRailSelected(e: Event): Promise<void>;
  navigationResizeHandler(e: ResizeEvent): void;
  metaRequestHandler(): void;
  requestMetaCloseHandler(): void;
  sheetClosedHandler(e: Event): void;
  exchangeSelectionHandler(e: CustomEvent): Promise<void>;
  appTemplate(): TemplateResult;
  /**
   * @returns The template for the application menu, when needed.
   */
  applicationMenuTemplate(): TemplateResult|string;
  /**
   * @returns The template for any code to be added to the application.
   */
  applicationUtilitiesTemplate(): TemplateResult|string;
  /**
   * @returns The template for the header
   */
  headerTemplate(): TemplateResult|string;
  /**
   * @returns The template for the toolbar actions.
   */
  toolbarActionsTemplate(): TemplateResult|string;
  /**
   * @returns The template for the environment selector and the overlay.
   */
  environmentTemplate(): TemplateResult|string;
  /**
   * @returns The template for the application main navigation area
   */
  navigationTemplate(): TemplateResult|string;
  /**
   * @returns The template for the ARC navigation
   */
  arcNavigationTemplate(): TemplateResult|string;
  /**
   * @param route The current route
   * @returns The template for the page content
   */
  pageTemplate(route: string): TemplateResult|string;
  /**
   * @param visible Whether the workspace is rendered in the view
   */
  workspaceTemplate(visible: boolean): TemplateResult|string;
  /**
   * @param route The current route
   * @returns The template for the history screen
   */
  historyPanelTemplate(route: string): TemplateResult|string;
  /**
   * @param route The current route
   * @returns The template for the history screen
   */
  savedPanelTemplate(route: string): TemplateResult|string;
  /**
   * @param route The current route
   * @returns The template for client certificates screen
   */
  clientCertScreenTemplate(route: string): TemplateResult|string;
  /**
   * @param route The current route
   * @returns The template for the data export screen
   */
  dataExportScreenTemplate(route: string): TemplateResult|string;
  /**
   * @param route The current route
   * @returns The template for the cookie manager
   */
  cookieManagerScreenTemplate(route: string): TemplateResult|string;
  /**
   * @param route The current route
   * @returns The template for the application settings
   */
  settingsScreenTemplate(route: string): TemplateResult|string;
  /**
   * @returns The template for the request metadata info dialog
   */
  requestDetailTemplate(): TemplateResult|string;
  /**
   * @returns The template for the request metadata editor dialog
   */
  requestMetaTemplate(): TemplateResult|string;
  /**
   * @param route The current route
   * @returns The template for the host rules mapping element
   */
  hostRulesTemplate(route: string): TemplateResult|string;
  /**
   * @param route The current route
   * @returns The template for the host rules mapping element
   */
  exchangeSearchTemplate(route: string): TemplateResult|string;
  /**
   * @param route The current route
   * @returns The template for the ARC legacy projects.
   */
  arcLegacyProjectTemplate(route: string): TemplateResult|string;
}
