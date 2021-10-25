import { LitElement, html } from 'lit-element';
import { SavedListMixin } from '../../index.js';
import * as internals from '../../src/elements/request/internals.js';
import ListStyles from '../../src/elements/request/ListStyles.js';

export class SavedScreenElement extends SavedListMixin(LitElement) {
  static get styles() {
    return ListStyles;
  }

  render() {
    const { requests } = this;
    if (!requests || !requests.length) {
      return html`<p>No requests on the list</p>`;
    }
    return html`
    <div class="list" @scroll="${this[internals.listScrollHandler]}">
      ${this[internals.listTemplate]()}
    </div>
    `;
  }
}

window.customElements.define('saved-screen', SavedScreenElement);
