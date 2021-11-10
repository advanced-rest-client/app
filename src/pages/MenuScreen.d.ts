import { TemplateResult } from 'lit-html';
import { ConfigStateUpdateEvent, ARCRequestNavigationEvent, ARCProjectNavigationEvent, ARCNavigationEvent } from '@advanced-rest-client/events'
import { ProjectModel, RequestModel, RestApiModel } from '@advanced-rest-client/idb-store'
import { ApplicationScreen } from './ApplicationScreen.js';

export const configStateChangeHandler: unique symbol;
export const navigateRequestHandler: unique symbol;
export const navigateProjectHandler: unique symbol;
export const navigateHandler: unique symbol;
export const themeActivatedHandler: unique symbol;

/**
 * A screen that is rendered in the popup menu in the Advanced REST Client.
 */
export class MenuScreen extends ApplicationScreen {
  type: string;
  historyEnabled: boolean;
  requestModel: RequestModel;
  projectModel: ProjectModel;
  restApiModel: RestApiModel;

  constructor();

  initialize(): Promise<void>;

  initType(): void;

  initModels(): void;

  initSettings(): Promise<void>;

  initDomEvents(): void;

  /**
   * @returns The init options of this browser process.
   */
  collectInitOptions(): any;
  [themeActivatedHandler](e: CustomEvent): void;
  [configStateChangeHandler](e: ConfigStateUpdateEvent): void;
  [navigateRequestHandler](e: ARCRequestNavigationEvent): void;
  [navigateProjectHandler](e: ARCProjectNavigationEvent): void;
  [navigateHandler](e: ARCNavigationEvent): void;

  appTemplate(): TemplateResult;

  historyTemplate(): TemplateResult;

  savedTemplate(): TemplateResult;

  projectsTemplate(): TemplateResult;

  apiDocsTemplate(): TemplateResult;

  searchTemplate(): TemplateResult;

  allTemplate(): TemplateResult;
}
