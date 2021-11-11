import { TemplateResult } from 'lit-html';
import { ConfigStateUpdateEvent, ARCRequestNavigationEvent, ARCProjectNavigationEvent, ARCNavigationEvent } from '@advanced-rest-client/events'
import { ApplicationScreen } from './ApplicationScreen.js';

export const configStateChangeHandler: unique symbol;

/**
 * A screen that is rendered in the popup menu in the Advanced REST Client.
 */
export class MenuScreen extends ApplicationScreen {
  type: string;
  historyEnabled: boolean;
  constructor();
  initialize(): Promise<void>;
  initType(): void;
  initSettings(): Promise<void>;

  initDomEvents(): void;

  /**
   * @returns The init options of this browser process.
   */
  collectInitOptions(): any;
  [configStateChangeHandler](e: ConfigStateUpdateEvent): void;

  appTemplate(): TemplateResult;

  historyTemplate(): TemplateResult;

  savedTemplate(): TemplateResult;

  projectsTemplate(): TemplateResult;

  apiDocsTemplate(): TemplateResult;

  searchTemplate(): TemplateResult;

  allTemplate(): TemplateResult;
}
