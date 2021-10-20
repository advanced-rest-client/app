/* eslint-disable class-methods-use-this */
 
/**
@license
Copyright 2020 The Advanced REST client authors <arc@mulesoft.com>
Licensed under the Apache License, Version 2.0 (the "License"); you may not
use this file except in compliance with the License. You may obtain a copy of
the License at
http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
License for the specific language governing permissions and limitations under
the License.
*/
import { html, css } from 'lit-element';
import { AnypointDialogElement } from '@anypoint-web-components/awc';
import styles from '@anypoint-web-components/awc/src/styles/AnypointDialogInternalStyles.js';
import '@anypoint-web-components/awc/anypoint-button.js';

export const inputHandler = Symbol('inputHandler');

export class AuthDialogElement extends AnypointDialogElement {
  static get styles() {
    return [
      styles,
      css`
      anypoint-input,
      anypoint-masked-input {
        width: auto;
      }
      `
    ];
  }

  static get properties() {
    return {
      /** 
       * Enables MD outlined theme
       */
      outlined: { type: Boolean },
    };
  }

  constructor() {
    super();
    this.outlined = false;
  }

  /**
   * Handler for value change of an input.
   * @param {CustomEvent} e
   */
  [inputHandler](e) {
    const input = /** @type HTMLInputElement */ (e.target);
    const { name, value } = input;
    this[name] = value;
  }

  /**
   * To be overridden by the child classes to create a single configuration object for the current method. 
   */
  serialize() {
    return {};
  }

  render() {
    return html`
      <h2 class="title">Authentication required</h2>
      <p>The endpoint requires user credentials.</p>
      ${this.authFormTemplate()}
      <div class="buttons">
        <anypoint-button data-dialog-dismiss>Cancel</anypoint-button>
        <anypoint-button data-dialog-confirm>OK</anypoint-button>
      </div>
    `;
  }

  /**
   * To be overridden by the child classes to provide authorization method specific form.
   */
  authFormTemplate() {
    return html``;
  }
}
