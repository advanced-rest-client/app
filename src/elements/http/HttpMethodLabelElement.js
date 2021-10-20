/**
@license
Copyright 2016 The Advanced REST client authors <arc@mulesoft.com>
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
import { LitElement, html, css } from 'lit-element';
import {
  hostDefaultStyles,
  labelCommon,
  labelGet,
  labelPost,
  labelPut,
  labelDelete,
  labelPatch,
  labelOptions,
  labelHead,
  labelTrace,
  labelConnect,
  labelSubscribe,
  labelPublish,
} from '../styles/HttpLabel.js';

/* eslint-disable max-len */
/* eslint-disable class-methods-use-this */

export const updateAccessibility = Symbol('updateAccessibility');

/**
 * The element displays a label for the HTTP method. If the method is one of the
 * predefined methods then it will use predefined colors to mark the method.
 *
 * ### Example
 *
 * ```html
 * <http-method-label method="GET"></http-method-label>
 * ```
 *
 * If the method is not one of the predefined methods it can be styled using regular
 * css.
 *
 * ```html
 * <style>
 * http-method-label[method="test"] {
 *    color: white;
 *    background-color: orange;
 * }
 * </style>
 * <http-method-label method="TEST"></http-method-label>
 * ```
 */
export default class HttpMethodLabelElement extends LitElement {
  get styles() {
    return css`
      :host {
        ${hostDefaultStyles}
        ${labelCommon}
      }

      :host([method='get']) {
        ${labelGet}
      }

      :host([method='post']) {
        ${labelPost}
      }

      :host([method='put']) {
        ${labelPut}
      }

      :host([method='delete']) {
        ${labelDelete}
      }

      :host([method='patch']) {
        ${labelPatch}
      }

      :host([method='options']) {
        ${labelOptions}
      }

      :host([method='head']) {
        ${labelHead}
      }

      :host([method='trace']) {
        ${labelTrace}
      }

      :host([method='connect']) {
        ${labelConnect}
      }

      :host([method='subscribe']) {
        ${labelSubscribe}
      }

      :host([method='publish']) {
        ${labelPublish}
      }
    `;
  }

  static get properties() {
    return {
      /**
       * HTTP method name to render
       */
      method: { type: String, reflect: true },
    };
  }

  set method(value) {
    const old = this._method;
    if (old === value) {
      return;
    }
    this._method = value;
    this.requestUpdate('method', old);
    this[updateAccessibility](value);
  }

  get method() {
    return this._method;
  }

  render() {
    const { styles, method } = this;
    return html`<style>${styles}</style>${method}`;
  }

  /**
   * Updates "title" and `aria-label` attributes when method changes.
   * @param {string} method Current method
   */
  [updateAccessibility](method) {
    if (!method) {
      this.removeAttribute('title');
      this.removeAttribute('aria-label');
    } else {
      this.setAttribute('title', method);
      this.setAttribute('aria-label', method);
    }
  }
}
