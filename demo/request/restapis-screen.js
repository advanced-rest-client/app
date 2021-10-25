import { LitElement, html } from 'lit-element';
import { RestApiListMixin } from '../../index.js';
import * as internals from '../../src/elements/request/internals.js';
import ListStyles from '../../src/elements/request/ListStyles.js';
import RestApiStyles from '../../src/elements/request/RestApiStyles.js';

export class RestapisScreenElement extends RestApiListMixin(LitElement) {
  static get styles() {
    return [ListStyles, RestApiStyles];
  }

  render() {
    return html`
    ${this[internals.dropTargetTemplate]()}
    ${this[internals.busyTemplate]()}
    ${this[internals.unavailableTemplate]()}
    ${this[internals.listTemplate]()}
    `;
  }
}

window.customElements.define('restapis-screen', RestapisScreenElement);
