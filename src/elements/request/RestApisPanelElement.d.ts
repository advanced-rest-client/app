import { LitElement, TemplateResult, CSSResult } from 'lit-element';
import { RestApiListMixin } from './RestApiListMixin.js';

/**
 * The rest apis screen for Advanced REST Client
 */
export default class RestApisPanelElement extends RestApiListMixin(LitElement) {
  static readonly styles: CSSResult[];

  constructor();

  render(): TemplateResult;
}
