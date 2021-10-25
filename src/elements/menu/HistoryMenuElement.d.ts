import { LitElement, TemplateResult } from 'lit-element';
import { HistoryListMixin } from '../request/HistoryListMixin.js';

/**
 * Advanced REST Client's history menu element.
 */
export default class HistoryMenuElement extends HistoryListMixin(LitElement) {
  render(): TemplateResult;
}
