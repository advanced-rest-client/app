/* eslint-disable class-methods-use-this */
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
import elementStyles from '../styles/RequestTimingsPanel.styles.js';
import '../../../define/request-timings.js';
import { readTimingValue, computeHarTime, computeRequestTime, redirectsTableTemplate, timingsTemplate, timingItemTemplate } from './internals.js';

/** @typedef {import('@advanced-rest-client/events').ArcResponse.RequestTime} RequestTime */
/** @typedef {import('@advanced-rest-client/events').ArcResponse.ResponseRedirect} ResponseRedirect */
/** @typedef {import('lit-element').TemplateResult} TemplateResult */

/**
 * An element to render a set of ARC HAR timings.
 */
export default class RequestTimingsPanelElement extends LitElement {
  get styles() {
    return elementStyles;
  }

  static get properties() {
    return {
      /**
       * The ARC's `ResponseRedirect` object
       */
      redirects: { type: Array },
      /** 
       * The main request HAR timings.
       */
      timings: { type: Object },
      /**
       * When set it renders mobile friendly view
       */
      narrow: { type: Boolean, reflect: true },
      /** 
       * The request general start time
       */
      startTime: { type: Number }
    };
  }

  /**
   * @returns {boolean} Tests whether redirects list has been set
   */
  get hasRedirects() {
    const { redirects } = this;
    return Array.isArray(redirects) && !!redirects.length;
  }

  constructor() {
    super();
    this.redirects = /** @type ResponseRedirect[] */ (undefined);
    this.timings = /** @type RequestTime */ (undefined);
    this.narrow = false;
    this.startTime = /** @type number */ (undefined);
  }

  /**
   * @param {ResponseRedirect[]} redirects The timings of the redirects
   * @param {RequestTime} timings The timings of the final request
   * @returns {number} The total request time
   */
  [computeRequestTime](redirects, timings) {
    let time = 0;
    if (Array.isArray(redirects)) {
      redirects.forEach((redirect) => { time += this[computeHarTime](redirect.timings); });
    }
    const add = this[computeHarTime](timings);
    if (add) {
      time += add;
    }
    time = Math.round(time * 10000) / 10000;
    return time;
  }

  /**
   * Reads a numeric value
   * @param {number} value The input value
   * @param {number=} defValue The default value to return when the input is an invalid number.
   * @returns {number} A positive integer value
   */
  [readTimingValue](value, defValue=0) {
    const parsed = Number(value);
    if (Number.isNaN(parsed) || parsed < 0) {
      return defValue;
    }
    return parsed;
  }

  /**
   * @param {RequestTime} har The timings object
   * @returns {number} The total request time
   */
  [computeHarTime](har) {
    if (!har) {
      return 0;
    }
    const connect = this[readTimingValue](har.connect);
    const receive = this[readTimingValue](har.receive);
    const send = this[readTimingValue](har.send);
    const wait = this[readTimingValue](har.wait);
    const blocked = this[readTimingValue](har.blocked);
    const dns = this[readTimingValue](har.dns);
    const ssl = this[readTimingValue](har.ssl);
    return connect + receive + send + wait + dns + blocked + ssl;
  }

  render() {
    return html`
    <style>${this.styles}</style>
    ${this.hasRedirects ? this[redirectsTableTemplate]() : this[timingsTemplate]()}
    `;
  }

  /**
   * @returns {TemplateResult} A template for the timings without redirects.
   */
  [timingsTemplate]() {
    const { timings, narrow } = this;
    return html`
    <request-timings .timings="${timings}" ?narrow="${narrow}"></request-timings>
    `;
  }

  /**
   * @returns {TemplateResult} A template for the timings with redirects.
   */
  [redirectsTableTemplate]() {
    const { redirects, timings, narrow } = this;
    const requestTotalTime = this[computeRequestTime](redirects, timings);
    return html`
    <section class="redirects">
      <h3 class="sub-title">Redirects</h3>
      ${redirects.map((item, index) => this[timingItemTemplate](item.timings, item.startTime, index))}
      <h3 class="sub-title">Final request</h3>
      <div class="timings-row">
        <div class="redirect-value">
          <request-timings .timings="${timings}" .startTime="${this.startTime}" ?narrow="${narrow}"></request-timings>
        </div>
      </div>
      <div class="status-row">
        <div class="flex"></div>
        <span class="timing-value total text">Total: ${requestTotalTime} ms</span>
      </div>
    </section>
    `;
  }

  /**
   * @param {RequestTime} item A redirect timings
   * @param {number} startTime The request start timestamp
   * @param {number} index The index in the redirects array
   * @returns {TemplateResult} A template for a single table
   */
  [timingItemTemplate](item, startTime, index) {
    const { narrow } = this;
    return html`
    <div class="timings-row">
      <div class="status-label text">#<span>${index + 1}</span></div>
      <div class="redirect-value">
        <request-timings .timings="${item}" .startTime="${startTime}" ?narrow="${narrow}"></request-timings>
      </div>
    </div>
    `;
  }
}
