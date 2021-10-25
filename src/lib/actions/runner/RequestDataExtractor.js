import * as DataUtils from './DataUtils.js';

/* eslint-disable no-param-reassign */

/** @typedef {import('@advanced-rest-client/events').ArcRequest.ArcBaseRequest} ArcBaseRequest */
/** @typedef {import('@advanced-rest-client/events').ArcRequest.ARCSavedRequest} ARCSavedRequest */
/** @typedef {import('@advanced-rest-client/events').ArcRequest.ARCHistoryRequest} ARCHistoryRequest */
/** @typedef {import('@advanced-rest-client/events').ArcRequest.TransportRequest} TransportRequest */
/** @typedef {import('@advanced-rest-client/events').ArcResponse.Response} Response */
/** @typedef {import('@advanced-rest-client/events').ArcResponse.ErrorResponse} ErrorResponse */
/** @typedef {import('@advanced-rest-client/events').Actions.IteratorConfiguration} IteratorConfiguration */
/** @typedef {import('@advanced-rest-client/events').Actions.DataSourceConfiguration} DataSourceConfiguration */
/** @typedef {import('../../../types').DataExtractorInit} DataExtractorInit */

/**
 * A class to extract data from JSON or XML body.
 *
 * The `request` is ARC request object as described in
 * https://github.com/advanced-rest-client/api-components-api/blob/master/docs/
 * api-request-and-response.md#api-request document.
 * It should contain at lease `url`, `method`, `headers`, and `payload`
 *
 * The `response` is a "response" property of the `api-response` custom event
 * as described in
 * https://github.com/advanced-rest-client/api-components-api/blob/master/docs/
 * api-request-and-response.md#api-response.
 * It should contain `status`, `payload`, `headers` and `url` properties.
 * The `url` property should be the final request URL after all redirects.
 *
 * Note: This element uses `URLSearchParams` class which is relatively new
 * interface in current browsers. You may need to provide a polyfill if you
 * are planning to use this component in older browsers.
 */
export class RequestDataExtractor {
  /**
   * @param {DataExtractorInit} init
   */
  constructor({ request, executedRequest, response }) {
    /**
     * ARC request object
     * @type {(ArcBaseRequest | ARCSavedRequest | ARCHistoryRequest)}
     */
    this.request = request;
    /**
     * ARC request object
     * @type {TransportRequest}
     */
    this.executedRequest = executedRequest;
    /**
     * ARC response object
     * @type {Response | ErrorResponse}
     */
    this.response = response;
  }

  /**
   * Gets the data from selected path.
   * @param {DataSourceConfiguration} config The configuration of the data source
   * @return {String|Number|URLSearchParams|Headers|undefined} Data to be processed
   */
  extract(config) {
    const { type, source, path, value, iteratorEnabled, iterator } = config;
    // @ts-ignore
    if (source === 'value') {
      return value;
    }
    const it = iteratorEnabled === false ? undefined : iterator;
    const args = path ? path.split('.') : [];
    switch (source) {
      case 'url':
        return DataUtils.getDataUrl(this.getUrl(type), args);
      case 'headers':
        return DataUtils.getDataHeaders(this.getHeaders(type), args);
      case 'status':
        return this.response.status;
      case 'method':
          return this.request.method;
      case 'body':
        return DataUtils.getDataPayload(this.getBody(type), this.getHeaders(type), args, it);
      default:
        throw new Error(`Unknown source ${source} for ${type} data`);
    }
  }

  /**
   * @param {string} source The source name 
   * @returns {string} The URL of executed request (or request to be executed)
   */
  getUrl(source) {
    if (source === 'request') {
      return this.request.url;
    }
    return this.executedRequest.url;
  }

  /**
   * @param {string} source The source name 
   * @returns {string} The headers from the request / response
   */
  getHeaders(source) {
    if (source === 'request') {
      return (this.executedRequest || this.request).headers;
    }
    return this.response.headers;
  }
  
  /**
   * @param {string} source The source name 
   * @returns {string | File | Blob | Buffer | ArrayBuffer | FormData} The headers from the request / response
   */
  getBody(source) {
    if (source === 'request') {
      return this.request.payload;
    }
    // @ts-ignore
    return this.response.payload;
  }
}
