import { TemplateResult } from 'lit-html';
import { ConfigStateUpdateEvent, RestApi, Config } from '@advanced-rest-client/events';
import { RequestModel, RestApiModel, AuthDataModel, HostRulesModel, VariablesModel, UrlHistoryModel, HistoryDataModel, UrlIndexer } from '@advanced-rest-client/idb-store'
import { DomEventsAmfStore, SelectionType } from '@api-components/amf-components';
import { ApiNavigationEvent } from '@api-components/amf-components/src/events/NavigationEvents';
import { ApplicationScreen } from './ApplicationScreen.js';
import { Route } from "../lib/route.js";

declare const apiTitleValue: unique symbol;
declare const configStateChangeHandler: unique symbol;
declare const mainBackHandler: unique symbol;

export class ApiConsoleScreen extends ApplicationScreen {
  static get routes(): Route[];
  requestModel: RequestModel;
  restApiModel: RestApiModel;
  authDataModel: AuthDataModel;
  hostRulesModel: HostRulesModel;
  variablesModel: VariablesModel;
  urlHistoryModel: UrlHistoryModel;
  historyDataModel: HistoryDataModel;
  /**
   * @returns The default OAuth2 redirect URI.
   */
  get oauth2RedirectUri(): string;

  /**
   * @returns The title of the currently loaded API.
   */
  get apiTitle(): string | undefined;

  route: string;
  /**
   * The domain id of the currently selected graph object.
   */
  domainId: string;
  /**
   * The navigation type of the currently selected graph object.
   */
  domainType: SelectionType;
  /**
   * When the current domain type is an operation this is the selected operation domain id.
   */
  operationId: string;
  /** 
   * @type Whether the project is being restored from the metadata store.
   */
  initializing: boolean
  /** 
   * @type A loading state information.
   */
  loadingStatus: string;
  /** 
   * A flag to determine whether the current API is stored in the application data store.
   * When set to true it renders controls to store the API data.
   */
  isStored: boolean;
  indexItem: RestApi.ARCRestApiIndex;
  /**
   * The title of the currently loaded API.
   */
  [apiTitleValue]: string;
  apiStore: DomEventsAmfStore;
  routeParams: Record<string, string | string[]>;
  amfType: string;
  apiVersion: string;
  constructor();
  initialize(): Promise<void>;
  /**
   * Initializes ARC datastore models.
   */
  initModels(): void;
  listen(): void;
  /**
   * Clears the API from the `file` source (idb) if was initialized with this API.
   */
  beforeunloadHandler(): void;
  /**
   * @param e Dispatched navigation event
   */
  apiNavigationHandler(e: ApiNavigationEvent): void;
  [configStateChangeHandler](e: ConfigStateUpdateEvent): void;
  /**
   * Sets local variables from the config object
   */
  setConfigVariables(cnf: Config.ARCConfig): void;
  /**
   * Tasks to be performed after the application is initialized.
   */
  afterInitialization(): Promise<void>;
  /**
   * Called when route change
   */
  onRoute(): void;
  /**
   * Opens an API from the given source
   * @param source Either `file` or `db`
   * @param id The id of the API to open
   * @param version The version of the API to open.
   * @returns {Promise<void>}
   */
  openApi(source: string, id: string, version?: string): Promise<void>;
  /**
   * Restores an API that has been stored in a temporary file to move the data
   * between the main application page and API Console.
   * @param id The id of the generated file
   */
  restoreFromTmpFile(id: string): Promise<void>;
  /**
   * Restores API Console from the local data store.
   * @param id The data store id of the API
   * @param version The version of the API to open.
   */
  restoreFromDataStore(id: string, version?: string): Promise<void>;
  /**
   * Operations performed after the API model is rendered.
   */
  postApiLoad(): Promise<void>;
  /**
   * Computes variables used to determine whether the API can be stored in the data store.
   * @param amf The resolved AMF model.
   */
  processUnsavedModel(amf: any): Promise<void>;
  /**
   * Computes model's base Uri
   */
  computeBaseUri(): Promise<string | undefined>;
  /**
   * @returns True when this model can be stored in the data store.
   */
  computeCanSave(baseUri: string, apiVersion: string): boolean;
  navigationResizeHandler(e: ResizeEvent): void;
  [mainBackHandler](): void;
  saveApiHandler(): void;
  /**
   * Stores the API in the data store.
   */
  saveApi(): Promise<void>;
  /**
   * Changes the API version after selecting a different version of the same API.
   */
  apiVersionMenuHandler(e: Event): Promise<void>;
  apiActionMenuChanged(e: Event): Promise<void>;
  delete(): Promise<void>;
  deleteVersion(): Promise<void>;
  appTemplate(): TemplateResult;
  navigationTemplate(): TemplateResult;
  apiNavigationTemplate(): TemplateResult;
  /**
   * @param route
   * @returns The template for the page content
   */
  pageTemplate(route: string): TemplateResult;
  /**
   * @param route The current route name.
   * @returns The template for the current page.
   */
  renderPage(route: string): TemplateResult;
  /**
   * @returns The template for the API console's main documentation.
   */
  apiTemplate(): TemplateResult;
  /**
   * @returns The template for the header
   */
  headerTemplate(): TemplateResult;
  saveButtonTemplate(): TemplateResult | string;
  apiMenuTemplate(): TemplateResult | string;
  apiVersionsTemplate(): TemplateResult | string;
}
