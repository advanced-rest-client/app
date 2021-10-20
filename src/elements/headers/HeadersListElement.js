/* eslint-disable class-methods-use-this */
import { LitElement, html } from 'lit-element';
import { HeadersParser } from '../../lib/headers/HeadersParser.js';
import {
  listValue,
  headersValue,
  processHeaders,
  autoLink,
  listItemTemplate,
} from './internals.js';
import elementStyles from '../styles/HeadersList.styles.js'
/** @typedef {import('@advanced-rest-client/events').FormTypes.FormItem} FormItem */
/** @typedef {import('lit-element').TemplateResult} TemplateResult */

export const linkRegexp = /(https?:\/\/([^" >]*))/gim;

/**
 * An element that renders a list of headers.
 */
export default class HeadersListElement extends LitElement {
  static get styles() {
    return elementStyles;
  }

  static get properties() {
    return {
      /**
       * A HTTP headers to render.
       */
      headers: { type: String },
    };
  }

  /**
   * @returns {string} the current list of headers
   */
  get headers() {
    return this[headersValue];
  }

  /**
   * @param {string} value the headers to render
   */
  set headers(value) {
    const old = this[headersValue];
    if (old === value) {
      return;
    }
    this[headersValue] = value;
    this[processHeaders](value);
  }

  /**
   * @returns {boolean} Tests whether there's anything to render.
   */
  get hasHeaders() {
    const list = /** @type FormItem[] */ (this[listValue]);
    return Array.isArray(list) && !!list.length;
  }

  /**
   * @param {string} value Processes the headers value.
   */
  [processHeaders](value) {
    if (!value || typeof value !== 'string') {
      this[listValue] = undefined;
    } else {
      this[listValue] = HeadersParser.toJSON(value);
    }
    this.requestUpdate();
  }

  /**
   * Searches for links in the string and wraps it in a HTML.
   * @param {string} input The header value
   * @returns {string|TemplateResult} Parsed header
   */
  [autoLink](input) {
    if (typeof input !== 'string') {
      return input;
    }
    const matches = input.match(linkRegexp);
    if (!matches) {
      return input;
    }
    let index = input.indexOf(matches[0]);
    const start = input.substr(0, index);
    const url = matches[0];
    index += url.length;
    const end = input.substr(index);
    return html`${start}<a target="_blank" class="auto-link" href="${url}">${url}</a>${end}`;
  }

  render() {
    if (!this.hasHeaders) {
      return '';
    }
    const list = /** @type FormItem[] */ (this[listValue]);
    return html`
    <div class="container">
    ${list.map((item) => this[listItemTemplate](item))}
    </div>
    `;
  }

  /**
   * Renders a header list item
   * @param {FormItem} header
   * @returns {TemplateResult}
   */
  [listItemTemplate](header) {
    return html`
    <div class="list-item" data-name="${header.name}">
      <span class="header-name">${header.name}:</span> <span class="header-value">${this[autoLink](header.value)}</span>
    </div>
    `;
  }
}
