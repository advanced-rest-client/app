import { LitElement, html } from 'lit-element';
import { RestApiListMixin } from './RestApiListMixin.js';
import RestApiStyles from './RestApiStyles.js';
import ListStyles from './ListStyles.js';
import { dropTargetTemplate, busyTemplate, unavailableTemplate, listTemplate } from './internals.js';

/**
 * The rest apis screen for Advanced REST Client
 */
export default class RestApisPanelElement extends RestApiListMixin(LitElement) {
  static get styles() {
    return [ListStyles, RestApiStyles];
  }

  constructor() {
    super();
    this.listActions = true;
  }

  render() {
    return html`
    ${this[dropTargetTemplate]()}
    ${this[busyTemplate]()}
    ${this[unavailableTemplate]()}
    ${this[listTemplate]()}
    `;
  }
}
