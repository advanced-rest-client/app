import { TemplateResult } from 'lit-html';
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
} from '@advanced-rest-client/idb-store'
import { Route } from "../lib/route.js";
import { ApplicationScreen } from './ApplicationScreen.js';

/**
 * A screen that is rendered in the popup menu in the Advanced REST Client.
 */
export class DataImportScreen extends ApplicationScreen {
  static get routes(): Route[];
  /** 
   * IDB data import processor.
   */
  #dataImport: ArcDataImport;
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
  route: string;
  routeParams: Record<string, string|string[]>;
  /** 
   * @type Whether the project is being restored from the metadata store.
   */
  initializing: boolean;
  startSelection: string;
  constructor();
  /**
   * Runs the logic to initialize the application.
   */
  initialize(): Promise<void>;
  /**
   * Initializes ARC datastore models.
   */
  initModels(): void;
  listen(): void;
  /**
   * Tasks to be performed after the application is initialized.
   */
  afterInitialization(): Promise<void>;
  unhandledRejectionHandler(e: PromiseRejectionEvent): void;
  /**
   * Called when route change
   */
  onRoute(): void;
  /**
   * Reads the Google Drive file and processes the result.
   * This dispatched a DOM event to the bindings to read the drive file.
   * 
   * @param fileId The Google Drive file id.
   */
  readDriveFile(fileId: string): Promise<void>;
  /**
   * Processes read form Google Drive file content.
   */
  processGoogleDriveData(data: unknown): Promise<void>;
  /**
   * Returns to the main application page.
   */
  quitHandler(): void;
  flowSelectHandler(e: Event): void;
  /**
   * Changes the app route based on the current flow selection.
   */
  selectFlowHandler(): void;
  /**
   * Selects an API file.
   * Most likely it is a zip file with an API spec.
   * In electron it can be a path to an API project.
   */
  selectApiHandler(): Promise<void>;
  /**
   * Selects ARC exported file.
   */
  selectArcHandler(): Promise<void>;
  /**
   * Selects Postman exported file.
   */
  selectPostmanHandler(): Promise<void>;
  /**
   * Processes the ARC import data and renders the inspector, when needed.
   */
  processArcData(contents: File|Buffer): Promise<void>;
  /**
   * Processes the Postman import data and renders the inspector, when needed.
   */
  processPostmanData(contents: File|Buffer): Promise<void>;
  /**
   * Starts a flow of importing an API file to the application.
   * This process is different depending on the platform so this has no 
   * particular implementation of it.
   */
  processApiData(info: unknown): Promise<void>;

  /**
   * Processes incoming data and if encryption is detected then id processes
   * the file for decryption.
   *
   * @param content File content
   * @return The content of the file.
   */
  decryptIfNeeded(content: string): Promise<string>;

  /**
   * A handler for an event dispatched by the data inspector to import data.
   */
  inspectorImportDataHandler(e: CustomEvent): Promise<void>;

  backHandler(): void;
  appTemplate(): TemplateResult;

  /**
   * @param route The current route
   * @returns The template for the page content
   */
  pageTemplate(route: string): TemplateResult|string;

  /**
   * @param route The current route
   * @returns The template for the start screen
   */
  startTemplate(route: string): TemplateResult|string;

  /**
   * @param route The current route
   * @returns The template for the start screen
   */
  importApiTemplate(route: string): TemplateResult|string;

  /**
   * @returns The template for any additional info to be rendered depending on the platform.
   */
  importApiAdditionalInfo(): TemplateResult|string;

  /**
   * @param route The current route
   * @returns The template for the import ARC data screen.
   */
  importArcTemplate(route: string): TemplateResult|string;

  /**
   * @param route The current route
   * @returns The template for the import ARC data screen.
   */
  importPostmanTemplate(route: string): TemplateResult|string;

  /**
   * @param route The current route
   * @returns The template for the ARC data inspector table.
   */
  inspectorTemplate(route: string): TemplateResult|string;

  /**
   * @returns The template for the header
   */
  headerTemplate(): TemplateResult|string;

  /**
   * @param route The current route
   * @returns The template for the drive file loading info.
   */
  driveProcessingTemplate(route: string): TemplateResult|string;
}
