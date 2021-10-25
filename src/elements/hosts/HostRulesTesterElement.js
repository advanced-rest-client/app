/* eslint-disable no-param-reassign */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-plusplus */
/**
@license
Copyright 2018 The Advanced REST client authors <arc@mulesoft.com>
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
import { LitElement, html } from 'lit-element';
import '@anypoint-web-components/awc/anypoint-button.js';
import '@anypoint-web-components/awc/anypoint-input.js';
import styles from './styles/TesterStyles.js';

/** @typedef {import('lit-element').TemplateResult} TemplateResult */
/** @typedef {import('@advanced-rest-client/events').HostRule.ARCHostRule} ARCHostRule */

export const evaluate = Symbol('evaluate');
export const evaluateAgainst = Symbol('evaluateAgainst');
export const createRuleRe = Symbol('createRuleRe');
export const keyDownHandler = Symbol('keyDownHandler');
export const inputHandler = Symbol('inputHandler');
export const resultValue = Symbol('resultValue');
export const resultTemplate = Symbol('resultTemplate');

/**
 * An element that tests user input against provided host rules.
 *
 * The host rules is a model received from `host-rules-editor`. However,
 * it can be any object that contains `from` and `to` properties.
 *
 * It evaluates user entered URL against provided rules and displays the
 * result of the computation.
 */
export default class HostRulesTesterElement extends LitElement {
  static get styles() {
    return styles;
  }

  static get properties() {
    return {
      /**
       * Provided by the user URL
       */
      url: { type: String },
      /**
       * List of rules to use to evaluate the URL
       */
      rules: { type: Array },
      /**
       * Enables Anypoint theme
       */
      anypoint: { type: Boolean },
      /**
       * Enables material design outlined theme
       */
      outlined: { type: Boolean }
    };
  }

  constructor() {
    super();
    this.anypoint = false;
    this.outlined = false;
    /**
     * @type {ARCHostRule[]}
     */
    this.rules = [];
  }

  testUrl() {
    if (!this.rules || !this.rules.length) {
      this[resultValue] = 'Define rules first.';
    } else if (!this.url) {
      this[resultValue] = 'Define the URL first.';
    } else {
      const result = this[evaluate]();
      this[resultValue] = result;
    }
    this.requestUpdate();
  }

  [evaluate]() {
    let { url } = this;
    const { rules } = this;
    for (let i = 0, len = rules.length; i < len; i++) {
      const rule = rules[i];
      const result = this[evaluateAgainst](url, rule);
      if (result) {
        url = result;
      }
    }
    return url;
  }

  /**
   * @param {string} url
   * @param {ARCHostRule} rule
   * @returns {string|undefined} 
   */
  [evaluateAgainst](url, rule) {
    if (!rule.from || rule.enabled === false) {
      return undefined;
    }
    const re = this[createRuleRe](rule.from);
    if (!re.test(url)) {
      return undefined;
    }
    return url.replace(re, rule.to);
  }

  /**
   * @param {string} input
   * @returns {RegExp} 
   */
  [createRuleRe](input) {
    input = input.replace(/\*/g, '(.*)');
    return new RegExp(input, 'gi');
  }

  /**
   * @param {KeyboardEvent} e
   */
  [keyDownHandler](e) {
    if (['Enter', 'NumpadEnter'].includes(e.code)) {
      this.testUrl();
    }
  }

  [inputHandler](e) {
    this.url = e.target.value;
  }

  /**
   * @return {TemplateResult} The template for the main UI
   */
  render() {
    const {
      url,
      anypoint,
      outlined
    } = this;
    return html`
    <div class="inputs">
      <anypoint-input
        type="url"
        class="url-input"
        ?anypoint="${anypoint}"
        ?outlined="${outlined}"
        .value="${url}"
        @input="${this[inputHandler]}"
        @keydown="${this[keyDownHandler]}"
      >
        <label slot="label">Enter URL to test</label>
      </anypoint-input>
      <anypoint-button
        @click="${this.testUrl}"
        title="Evaluate the URL"
        ?anypoint="${anypoint}"
        aria-label="Activate to evaluate the URL"
      >Test</anypoint-button>
    </div>
    ${this[resultTemplate]()}`;
  }

  /**
   * @return {TemplateResult|string} The template for the test result, if any.
   */
  [resultTemplate]() {
    const result = this[resultValue];
    return result ? html`<output>${result}</output>` : '';
  }
}
