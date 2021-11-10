import { TemplateResult } from 'lit-html';
import { ApplicationScreen } from './ApplicationScreen.js';

export class AnalyticsConsentScreen extends ApplicationScreen {
  selected: number;
  constructor();
  initialize(): Promise<void>;
  selectionHandler(e: Event): void;
  saveState(): Promise<void>;
  appTemplate(): TemplateResult;
  /**
   * @returns The template for the header
   */
  headerTemplate(): TemplateResult;
}
