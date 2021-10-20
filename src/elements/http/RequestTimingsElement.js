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
import '@anypoint-web-components/awc/anypoint-progress.js';
import '@anypoint-web-components/awc/date-time.js';
import elementStyles from '../styles/RequestTimings.styles.js';
import {
  timingsValue,
  computeTimings,
  readTimingValue,
  requestTime,
  connectTime,
  receiveTime,
  sendTime,
  waitTime,
  blockedTime,
  dnsTime,
  sslTime,
  timingRowTemplate,
  roundTime,
  startTimeTemplate,
  computeSum,
} from './internals.js';

/** @typedef {import('@advanced-rest-client/events').ArcResponse.RequestTime} RequestTime */
/** @typedef {import('lit-element').TemplateResult} TemplateResult */

/**
 * An element to render request timings data according to the HAR 1.2 spec.
 */
export default class RequestTimingsElement extends LitElement {
  get styles() {
    return elementStyles;
  }

  static get properties() {
    return {
      /**
       * A timings object as described in HAR 1.2 spec.
       */
      timings: { type: Object },
      /**
       * When set it renders mobile friendly view
       */
      narrow: { type: Boolean, reflect: true },
      /** 
       * The request start time
       */
      startTime: { type: Number },
    };
  }

  get timings() {
    return this[timingsValue];
  }

  set timings(value) {
    const old = this[timingsValue];
    if (old === value) {
      return;
    }
    this[timingsValue] = value;
    this[computeTimings](value);
  }

  constructor() {
    super();
    this.startTime = /** @type number */(undefined);
    this.timings = /** @type RequestTime */(undefined);
    this.narrow = false;
  }

  /**
   * Reads the timing value and normalizes it to a positive integer.
   * @param {any} value The value to parse
   * @param {boolean=} forceNumber When set it casts `undefined` to a number
   * @returns {number|undefined} positive integer value for the request timings.
   */
  [readTimingValue](value, forceNumber=false) {
    if (value === undefined && !forceNumber) {
      return undefined;
    }
    let typed;
    if (value === undefined) {
      typed = 0;
    } else {
      typed = Number(value);
    }
    if (Number.isNaN(typed) || typed < 0) {
      return 0;
    }
    return typed;
  }

  /**
   * Updates the view after `timings` change.
   * @param {RequestTime} timings
   */
  [computeTimings](timings) {
    let fullTime = 0;
    if (timings) {
      this[connectTime] = this[readTimingValue](timings.connect, true);
      this[receiveTime] = this[readTimingValue](timings.receive, true);
      this[sendTime] = this[readTimingValue](timings.send, true);
      this[waitTime] = this[readTimingValue](timings.wait, true);
      this[blockedTime] = this[readTimingValue](timings.blocked);
      this[dnsTime] = this[readTimingValue](timings.dns);
      this[sslTime] = this[readTimingValue](timings.ssl);
      fullTime += this[connectTime] + this[receiveTime] + this[sendTime] + this[waitTime];
      if (this[dnsTime] > 0) {
        fullTime += this[dnsTime];
      }
      if (this[blockedTime] > 0) {
        fullTime += this[blockedTime];
      }
      if (this[sslTime] > 0) {
        fullTime += this[sslTime];
      }
    }
    this[requestTime] = fullTime;
    this.requestUpdate();
  }
  
  /**
   * Round numeric value to precision defined in the `power` argument.
   *
   * @param {number} value The value to round
   * @return {string} Rounded value.
   */
  [roundTime](value) {
    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
      return 'unknown';
    }
    const factor = 10**4;
    return String(Math.round(value * factor) / factor);
  }

  /**
   * Sums two HAR times.
   * If any argument is `undefined` or `-1` then `0` is assumed.
   * @param {Number} a Time #1
   * @param {Number} b Time #2
   * @return {Number} Sum of both
   */
  [computeSum](a=0, b=0) {
    let a1 = Number(a);
    let b1 = Number(b);
    if (a1 < 0) {
      a1 = 0;
    }
    if (b1 < 0) {
      b1 = 0;
    }
    return a1 + b1;
  }

  /**
   * Renders a single timing row.
   * @param {string} label Row label
   * @param {string} ariaLabel Aria label for the progress element
   * @param {number} value The value of the progress
   * @param {number} max Max value of the progress
   * @param {number} sec Secondary progress value
   * @param {number} labelValue The time value to render
   * @param {string} type
   * @returns {string|TemplateResult}
   */
  [timingRowTemplate](label, ariaLabel, value, max, sec, labelValue, type) {
    if (typeof labelValue === 'undefined') {
      return '';
    }
    return html`
    <div class="row" data-type="${type}-time">
      <div class="timing-label label">${label}</div>
      <anypoint-progress
        aria-label="${ariaLabel}"
        .value="${value}"
        .secondaryProgress="${sec}"
        .max="${max}"
        step="0.0001"
      ></anypoint-progress>
      <span class="timing-value">${this[roundTime](labelValue)} ms</span>
    </div>
    `;
  }

  /**
   * Renders the start time row
   * @param {number} time The timestamp of the request
   * @returns {string|TemplateResult}
   */
  [startTimeTemplate](time) {
    if (typeof time !== 'number') {
      return '';
    }
    return html`
    <div class="row" data-type="start-time">
      <span class="label">Start date:</span>
      <date-time
        year="numeric"
        month="numeric"
        day="numeric"
        hour="numeric"
        minute="numeric"
        second="numeric"
        class="date-value"
        .date="${time}"
      ></date-time>
    </div>`;
  }

  render() {
    const fullTime = this[requestTime];
    const connect = this[connectTime];
    const receive = this[receiveTime];
    const send = this[sendTime];
    const wait = this[waitTime];
    const blocked = this[blockedTime];
    const dns = this[dnsTime];
    const ssl = this[sslTime];
    const time = this.startTime;

    const blockedProgressValue = this[computeSum](blocked);
    const ttcProgressValue = this[computeSum](blocked, dns);
    const sslProgressValue = this[computeSum](ttcProgressValue, connect);
    const sendProgressValue = this[computeSum](sslProgressValue, ssl);
    const ttfbProgressValue = this[computeSum](sendProgressValue, send);
    const receiveProgressValue = this[computeSum](ttfbProgressValue, wait);
    const receive2ProgressValue = this[computeSum](receiveProgressValue, receive);

    return html`
    <style>${this.styles}</style>
    ${this[startTimeTemplate](time)}
    ${this[timingRowTemplate]('Queueing:', 'Queueing time', 0, fullTime, blocked, blocked, 'blocked')}
    ${this[timingRowTemplate]('DNS Lookup:', 'DNS lookup time', blockedProgressValue, fullTime, ttcProgressValue, dns, 'dns')}
    ${this[timingRowTemplate]('Time to connect:', 'Time to connect', ttcProgressValue, fullTime, sslProgressValue, connect, 'ttc')}
    ${this[timingRowTemplate]('SSL negotiation:', 'SSL negotiation time', sslProgressValue, fullTime, sendProgressValue, ssl, 'ssl')}
    ${this[timingRowTemplate]('Send time:', 'Send time', sendProgressValue, fullTime, ttfbProgressValue, send, 'send')}
    ${this[timingRowTemplate]('Wait time:', 'Time to first byte', ttfbProgressValue, fullTime, receiveProgressValue, wait, 'ttfb')}
    ${this[timingRowTemplate]('Content download:', 'Receiving time', receiveProgressValue, fullTime, receive2ProgressValue, receive, 'receive')}
    <div class="row is-total">
      <span class="timing-value total">${this[roundTime](fullTime)} ms</span>
    </div>
    `;
  }
}
