import { HeaderDefinition, StatusCodeDefinition } from '../../lib/HeadersData';

export { HeaderDefinition, StatusCodeDefinition };

/**
 * Queries for request headers that contains a `query`. If query is
 * not set (value is falsy) then it returns all headers definitions array.
 *
 * @param name A header name to look for. It will match a header where the header name contains the `name` param.
 * @returns An array of request headers matched `name` in the header's `key` field.
 */
export declare function queryRequestHeaders(name: string): HeaderDefinition[];

/**
 * Queries for response headers that contains a `query`. If query is
 * not set (value is falsy) then it returns all headers definitions array.
 *
 * @param name A header name to look for. It will match a header where the header
 * name contains the `name` param.
 * @returns An array of response headers matched `name` in the header's `key` field.
 */
export declare function queryResponseHeaders(name: string): HeaderDefinition[];

/**
 * Queries for headers containing a `query`. If query is not set
 * (value is falsy) then it returns all headers definitions array.
 *
 * @param query A query to search for in the `key` field of the headers array.
 * @param type If this equals `request` then it will look in the request headers array. Is the response headers list otherwise.
 * @returns An array of headers of selected `type` matched a `query` in a header's `key` field.
 */
export declare function queryHeaders(query: string, type: string): HeaderDefinition[];

/**
 * Convenient function to look for a status code in the array.
 *
 * @param codeArg The status code to look for.
 * @returns Status code definition or null if not found.
 */
export function getStatusCode(codeArg: number): StatusCodeDefinition|StatusCodeDefinition[]|null;

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
   */
  readonly requestHeaders: HeaderDefinition[];

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
   */
  readonly responseHeaders: HeaderDefinition[];

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
   */
  readonly statusCodes: StatusCodeDefinition[];

  constructor();

  connectedCallback(): void;

  disconnectedCallback(): void;

  /**
   * Queries for request headers that contains a `query`. If query is
   * not set (value is falsy) then it returns all headers definitions array.
   *
   * @param name A header name to look for. It will match a header where the header name contains the `name` param.
   * @returns Array of the request headers matched `name` in the header's `key` field.
   * @deprecated Please, use `queryRequestHeaders()` exported by this module instead.
   */
  queryRequestHeaders(name: string): HeaderDefinition[];

  /**
   * Queries for response headers that contains a `query`. If query is
   * not set (value is falsy) then it returns all headers definitions array.
   *
   * @param name A header name to look for. It will match a header where the header
   * name contains the `name` param.
   * @returns Array of the response headers matched `name` in the header's `key` field.
   * @deprecated Please, use `queryResponseHeaders()` exported by this module instead.
   */
  queryResponseHeaders(name: string): HeaderDefinition[];

  /**
   * Queries for headers containing a `query`. If query is not set
   * (value is falsy) then it returns all headers definitions array.
   *
   * @param query A query to search for in the `key` field of the
   * headers array.
   * @param type If this equals `request` then it will look in the
   * request headers array. Is the response headers list otherwise.
   * @returns Array of the headers of selected `type`
   * matched a `query` in a header's `key` field.
   * @deprecated Please, use `queryHeaders()` exported by this module instead.
   */
  queryHeaders(query: string, type: string): HeaderDefinition[];

  /**
   * Convenient function to look for a status code in the array.
   *
   * @param code The status code to look for.
   * @returns Status code definition or null if not found.
   * @deprecated Please, use `getStatusCode()` exported by this module instead.
   */
  getStatusCode(codeArg: number): StatusCodeDefinition|StatusCodeDefinition[]|null;

  /**
   * A handler for the status headers query event
   */
  _queryHeadersHandler(e: CustomEvent): void;

  /**
   * A handler for the status code query event
   *
   * @param {CustomEvent} e
   */
  _queryCodesHandler(e: CustomEvent): void;
}
