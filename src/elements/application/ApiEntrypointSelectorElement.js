import { LitElement, html, css } from 'lit-element';
import { AnypointDialogMixin, AnypointDialogStylesInternal } from '@anypoint-web-components/awc';
import '@anypoint-web-components/awc/anypoint-button.js';
import '@anypoint-web-components/awc/anypoint-listbox.js';
import '@anypoint-web-components/awc/anypoint-item.js';

/** @typedef {import('@anypoint-web-components/awc').AnypointListboxElement} AnypointListboxElement */

export const closedHandler = Symbol('closedHandler');
export const selectedHandler = Symbol('selectedHandler');

export default class ApiEntrypointSelectorElement extends AnypointDialogMixin(LitElement) {
  static get styles() {
    return [
      AnypointDialogStylesInternal,
      css`
      :host {
        min-width: 360px;
      }
      `,
    ]
  }

  static get properties() {
    return {
      files: { type: String },
      selected: { type: String, reflect: true },
    };
  }

  constructor() {
    super();
    /** @type string[] */
    this.files = undefined;
    /** @type boolean */
    this.anypoint = undefined;
    /** @type string */
    this.selected = undefined;
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('closed', this[closedHandler]);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('closed', this[closedHandler]);
  }

  [closedHandler]() {
    this.parentNode.removeChild(this);
  }

  /**
   * @param {Event} e
   */
  [selectedHandler](e) {
    const list = /** @type AnypointListboxElement */ (e.target);
    this.selected = /** @type string */ (list.selected);
  }

  render() {
    const { files=[], selected } = this;
    return html`
    <h2>Select API main file</h2>
    <div class="content">
      <anypoint-listbox attrForSelected="data-value" .selected="${selected}" @selected="${this[selectedHandler]}">
        ${files.map(item => html`<anypoint-item data-value="${item}">${item}</anypoint-item>`)}
      </anypoint-listbox>
    </div>
    <div class="buttons">
      <anypoint-button data-dialog-dismiss ?anypoint="${this.anypoint}">Cancel</anypoint-button>
      <anypoint-button data-dialog-confirm ?anypoint="${this.anypoint}" ?disabled="${!selected}">Confirm</anypoint-button>
    </div>
    `;
  }
}
