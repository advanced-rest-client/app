/**
@license
Copyright 2018 The Advanced REST client authors
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

import { requestHeaders, responseHeaders, statusCodes } from '../../lib/headers/HeadersData.js';

/* eslint-disable class-methods-use-this */

/**
 * @typedef {Object} HeaderDefinition
 * @property {string} key The header name
 * @property {string} desc Header description
 * @property {string} example Example value of the header
 */

/**
 * @typedef {Object} StatusCodeDefinition
 * @property {number} key The status code
 * @property {string} label Status code message
 * @property {string} desc Description of the status code
 */

/**
 * Stops an events.
 * @param {CustomEvent} e
 */
function stopEvent(e) {
  e.stopImmediatePropagation();
  e.preventDefault();
}

/**
 * Queries for headers containing a `query`. If query is not set
 * (value is falsy) then it returns all headers definitions array.
 *
 * @param {string} query A query to search for in the `key` field of the
 * headers array.
 * @param {string} type If this equals `request` then it will look in the
 * request headers array. Is the response headers list otherwise.
 * @return {HeaderDefinition[]} Array of the headers of selected `type`
 * matched a `query` in a header's `key` field.
 */
export function queryHeaders(query, type) {
  const headers = type === 'request' ? requestHeaders : responseHeaders;
  if (!query) {
    return headers;
  }
  const lowerQuery = query.trim().toLowerCase();
  return headers.filter(
    (item) => item.key.toLowerCase().indexOf(lowerQuery) !== -1
  );
}

/**
 * Queries for request headers that contains a `query`. If query is
 * not set (value is falsy) then it returns all headers definitions array.
 *
 * @param {string} name A header name to look for. It will match a header
 * where the header name contains the `name` param.
 * @return {HeaderDefinition[]} Array of the request headers matched `name` in
 * the header's `key` field.
 */
export function queryRequestHeaders(name) {
  return queryHeaders(name, 'request');
}

/**
 * Queries for response headers that contains a `query`. If query is
 * not set (value is falsy) then it returns all headers definitions array.
 *
 * @param {string} name A header name to look for. It will match a header where the header
 * name contains the `name` param.
 * @return {HeaderDefinition[]} Array of the response headers matched `name`
 * in the header's `key` field.
 */
export function queryResponseHeaders(name) {
  return queryHeaders(name, 'response');
}

/**
 * Convenient function to look for a status code in the array.
 *
 * @param {number} codeArg The status code to look for.
 * @return {StatusCodeDefinition|StatusCodeDefinition[]|null} Status code definition or null if not found.
 */
export function getStatusCode(codeArg) {
  if (!codeArg) {
    return statusCodes;
  }
  const code = Number(codeArg);
  if (Number.isNaN(code)) {
    return null;
  }
  const res = statusCodes.filter((item) => item.key === code);
  if (!res.length) {
    return null;
  }
  return res[0];
}

/**
 * Request / response headers and status codes definitions database used in Advanced REST Client and API Console.
 */
export default class ArcDefinitionsElement extends HTMLElement {
  /**
   * A list of request headers.
   *
   * Each object contains a `key`, `desc` and `example` property. `key` is a header name,
   * `desc` is a description of the header and `example` is an example of usage.
   *
   * ### Example
   * ```
   * [{
   *  "key": "Accept",
   *  "desc": "Content-Types that are acceptable.",
   *  "example": "Accept: text/plain"
   * }],
   * ```
   *
   * @type {HeaderDefinition[]}
   */
  get requestHeaders() {
    return requestHeaders;
  }

  /**
   * A list of response headers.
   *
   * Each object contains a `key`, `desc` and `example` property. `key` is a header name,
   * `desc` is a description of the header and `example` is an example of usage.
   *
   * ### Example
   * ```
   * [{
   *  "key": "Age",
   *  "desc": "The age the object has been in a proxy cache in seconds",
   *  "example": "Age: 12"
   * }],
   * ```
   *
   * @type {HeaderDefinition[]}
   */
  get responseHeaders() {
    return responseHeaders;
  }

  /**
   * A list of status codes definitions.
   *
   * Each object contains a `key`, `label` and `desc` property. `key` is a status code (as
   * a number), `label` is a status code message and `desc` is description for the status
   * code.
   *
   * ### Example
   * ```
   * [{
   *  "key": 306,
   *  "label": "Switch Proxy",
   *  "desc": "No longer used."
   * }]
   *
   * @type {StatusCodeDefinition[]}
   */
  get statusCodes() {
    return statusCodes;
  }

  /**
   * @constructor
   */
  constructor() {
    super();
    this._queryHeadersHandler = this._queryHeadersHandler.bind(this);
    this._queryCodesHandler = this._queryCodesHandler.bind(this);
  }

  connectedCallback() {
    window.addEventListener('queryheaders', this._queryHeadersHandler);
    window.addEventListener('querystatuscodes', this._queryCodesHandler);
    if (!this.hasAttribute('aria-hidden')) {
      this.setAttribute('aria-hidden', 'true');
    }
  }

  disconnectedCallback() {
    window.removeEventListener('queryheaders', this._queryHeadersHandler);
    window.removeEventListener('querystatuscodes', this._queryCodesHandler);
  }

  /**
   * Queries for request headers that contains a `query`. If query is
   * not set (value is falsy) then it returns all headers definitions array.
   *
   * @param {string} name A header name to look for. It will match a header
   * where the header name contains the `name` param.
   * @return {HeaderDefinition[]} Array of the request headers matched `name` in
   * the header's `key` field.
   * @deprecated Please, use `queryRequestHeaders()` exported by this module instead.
   */
  queryRequestHeaders(name) {
    return queryHeaders(name, 'request');
  }

  /**
   * Queries for response headers that contains a `query`. If query is
   * not set (value is falsy) then it returns all headers definitions array.
   *
   * @param {string} name A header name to look for. It will match a header where the header
   * name contains the `name` param.
   * @return {HeaderDefinition[]} Array of the response headers matched `name`
   * in the header's `key` field.
   * @deprecated Please, use `queryResponseHeaders()` exported by this module instead.
   */
  queryResponseHeaders(name) {
    return queryHeaders(name, 'response');
  }

  /**
   * Queries for headers containing a `query`. If query is not set
   * (value is falsy) then it returns all headers definitions array.
   *
   * @param {string} query A query to search for in the `key` field of the
   * headers array.
   * @param {string} type If this equals `request` then it will look in the
   * request headers array. Is the response headers list otherwise.
   * @return {HeaderDefinition[]} Array of the headers of selected `type`
   * matched a `query` in a header's `key` field.
   * @deprecated Please, use `queryHeaders()` exported by this module instead.
   */
  queryHeaders(query, type) {
    return queryHeaders(query, type);
  }

  /**
   * Convenient function to look for a status code in the array.
   *
   * @param {number} codeArg The status code to look for.
   * @return {StatusCodeDefinition|StatusCodeDefinition[]|null} Status code definition or null if not found.
   * @deprecated Please, use `getStatusCode()` exported by this module instead.
   */
  getStatusCode(codeArg) {
    return getStatusCode(codeArg);
  }

  /**
   * A handler for the status headers query event
   *
   * @param {CustomEvent} e
   */
  _queryHeadersHandler(e) {
    if (e.defaultPrevented) {
      return;
    }
    stopEvent(e);
    const { type } = e.detail;
    if (!type) {
      e.detail.headers = [];
      return;
    }
    e.detail.headers = queryHeaders(e.detail.query, type);
  }

  /**
   * A handler for the status code query event
   *
   * @param {CustomEvent} e
   */
  _queryCodesHandler(e) {
    if (e.defaultPrevented) {
      return;
    }
    stopEvent(e);
    e.detail.statusCode = getStatusCode(e.detail.code);
  }
}
