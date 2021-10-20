/* eslint-disable class-methods-use-this */
import { html } from 'lit-element';
import '@anypoint-web-components/awc/anypoint-input.js';
import '@anypoint-web-components/awc/anypoint-masked-input.js';
import { AuthDialogElement, inputHandler } from './AuthDialogElement.js';

export default class AuthDialogBasicElement extends AuthDialogElement {
  static get properties() {
    return {
      /** 
       * User login
       */
      username: { type: String },
      /** 
       * User password
       */
      password: { type: String },
    };
  }

  constructor() {
    super();
    this.username = '';
    this.password = '';
  }

  serialize() {
    return {
      username: this.username,
      password: this.password,
      hash: btoa(`${this.username}:${this.password}`),
    };
  }

  authFormTemplate() {
    const { password, username, anypoint, outlined } = this;
    return html`
    <anypoint-input
      type="text"
      name="username"
      .value="${username}"
      ?anypoint="${anypoint}"
      ?outlined="${outlined}"
      @change="${this[inputHandler]}"
    >
      <label slot="label">User Name</label>
    </anypoint-input>
    <anypoint-masked-input
      .value="${password}"
      name="password"
      ?anypoint="${anypoint}"
      ?outlined="${outlined}"
      @change="${this[inputHandler]}"
    >
      <label slot="label">Password</label>
    </anypoint-masked-input>
    `;
  }
}
