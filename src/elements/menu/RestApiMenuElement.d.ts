import { LitElement, TemplateResult } from 'lit-element';
import { RestApiListMixin } from '../request/RestApiListMixin';

/**
 * A list of REST APIs in the ARC main menu.
 */
export default class RestApiMenuElement extends RestApiListMixin(LitElement) {
  render(): TemplateResult;
}
