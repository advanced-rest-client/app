import { TemplateResult } from 'lit-html';
import { Application } from '@advanced-rest-client/events';
import { ProjectModel, RequestModel, RestApiModel, AuthDataModel, HostRulesModel, VariablesModel, UrlHistoryModel, HistoryDataModel, ClientCertificateModel, WebsocketUrlHistoryModel, UrlIndexer } from '@advanced-rest-client/idb-store'
import { ReactiveMixin } from '../mixins/ReactiveMixin.js';
import { RenderableMixin } from '../mixins/RenderableMixin.js';

/**
 * A base class for pages build outside the LitElement. It uses `lit-html` 
 * as the template renderer.
 * 
 * The implementation (extending this class) should override the `appTemplate()`
 * function that returns the `TemplateResult` from the `lit-html` library.
 * 
 * To reflect the changed state call the `render()` function. The function schedules
 * a micro task (through `requestAnimationFrame`) to call the render function on the template.
 * 
 * More useful option is to use the `initObservableProperties()` function that accepts a list 
 * of properties set on the base class that once set triggers the render function. The setter checks
 * whether the a value actually changed. It works well for primitives but it won't work as expected
 * for complex types.
 */
export class ApplicationScreen extends RenderableMixin(ReactiveMixin(EventTarget)) {
  /**
   * Tells the components to turn the Anypoint theme on.
   */
  anypoint?: boolean;
  /**
   * An event target on which to dispatch DOM events.
   */
  eventTarget: EventTarget;
  /** 
   * True when the app should render mobile friendly view.
   */
  isMobile: boolean;
  /** 
   * The loading state information.
   */
  loadingStatus: string;
  requestModel?: RequestModel;
  projectModel?: ProjectModel;
  restApiModel?: RestApiModel;
  authDataModel?: AuthDataModel;
  hostRulesModel?: HostRulesModel;
  variablesModel?: VariablesModel;
  urlHistoryModel?: UrlHistoryModel;
  historyDataModel?: HistoryDataModel;
  clientCertificateModel?: ClientCertificateModel;
  websocketUrlHistoryModel?: WebsocketUrlHistoryModel;
  urlIndexer?: UrlIndexer;
  /**
   * Initializes media queries and observers.
   */
  initMediaQueries(): void;
  /**
   * Creates a modal dialog with the error details.
   * @param message The message to render
   */
  reportCriticalError(message: string): void;
  unhandledRejectionHandler(e: PromiseRejectionEvent): void;
  themeActivateHandler(e: CustomEvent): void;
  /**
   * Loads the current application theme and sets the value of `anypoint`.
   */
  loadTheme(): Promise<void>;
  /**
   * Loads and returns the versions information (chrome + electron).
   * This is a safe function. In case of error it returns a default values.
   */
  loadVersionInfo(): Promise<Application.AppVersionInfo>;
  /**
   * @returns A template for the loader
   */
  loaderTemplate(): TemplateResult;
  /**
   * Initializes all ARCs models.
   */
  initModels(): void;
}
