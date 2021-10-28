import { html, css, LitElement } from 'lit-element';
import { AnypointDialogMixin, AnypointDialogStyles } from '@anypoint-web-components/awc';
import '@anypoint-web-components/awc/anypoint-button.js';

export const closedHandler = Symbol('closedHandler');

export default class AlertDialogElement extends AnypointDialogMixin(LitElement) {
  static get styles() {
    return [
      AnypointDialogStyles,
      css`
      :host {
        background-color: #F44336;
      }

      :host > h2,
      :host > * {
        color: #fff !important;
      }

      .message {
        font-family: monospace;
      }

      anypoint-button {
        color: #fff;
      }
      `,
    ];
  }

  static get properties() {
    return {
      message: { type: String },
    };
  }

  constructor() {
    super();
    this.message = undefined;
    this.anypoint = false;
    this[closedHandler] = this[closedHandler].bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('overlay-closed', this[closedHandler]);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('overlay-closed', this[closedHandler]);
  }

  [closedHandler]() {
    this.parentNode.removeChild(this);
  }

  render() {
    return html`
    <h2>An error ocurred</h2>
    <p class="message">${this.message}</p>
    <div class="buttons">
      <anypoint-button data-dialog-confirm ?anypoint="${this.anypoint}">Dismiss</anypoint-button>
    </div>
    `;
  }
}
