/* eslint-disable class-methods-use-this */
import { HeadersParser } from '../lib/headers/HeadersParser.js';
/** @typedef {import('@advanced-rest-client/events').ArcRequest.ArcBaseRequest} ArcBaseRequest */
/** @typedef {import('@advanced-rest-client/events').ArcRequest.TransportRequest} TransportRequest */
/** @typedef {import('@advanced-rest-client/events').ArcResponse.Response} ArcResponse */
/** @typedef {import('@advanced-rest-client/events').ArcResponse.ErrorResponse} ErrorResponse */
/** @typedef {import('@advanced-rest-client/events').Config.ARCRequestConfig} ARCRequestConfig */

export class ArcFetchRunner {
  /**
   * @param {string} id
   * @param {ArcBaseRequest} request
   * @param {ARCRequestConfig} config
   */
  constructor(id, request, config) {
    this.id = id;
    this.sourceRequest = request;
    this.config = config;
    /** 
     * @type {TransportRequest}
     */
    this.transportRequest = undefined;
    /** 
     * @type {Response}
     */
    this.response = undefined;
    this.abortController = new AbortController();
  }

  /**
   * Aborts the current request.
   */
  abort() {
    this.abortController.abort();
  }

  /**
   * Runs the current request
   */
  async run() {
    const request = this.prepareRequest();
    this.startTime = Date.now();
    let response = /** @type Response */ (null);
    let error = /** @type Error */ (null);
    this.informStatus('requestloadstart');
    this.setupTimeout();
    try {
      response = await fetch(request);
      this.informStatus('requestloadend');
      this.endTime = Date.now();
    } catch (e) {
      this.endTime = Date.now();
      this.informStatus('requestloadend');
      error = e;
    }
    if (this.requestTimeout) {
      clearTimeout(this.requestTimeout);
    }
    if (response) {
      return this.reportResponse(response);
    }
    return this.reportError(error);
  }

  setupTimeout() {
    if (typeof this.config.timeout !== 'number') {
      return;
    }
    const timeout = this.config.timeout * 1000;
    this.requestTimeout = setTimeout(() => {
      this.abort();
    }, timeout);
  }
  
  /**
   * Prepares the request object for given request configuration and options.
   * @returns {Request}
   */
  prepareRequest() {
    const { sourceRequest, config, abortController } = this;
    const { url, method, headers, payload } = sourceRequest;
    const redirect = config.followRedirects === false ? 'error' : 'follow';
    const credentials = config.ignoreSessionCookies === false ? 'omit' : 'include';
    const { signal } = abortController;
    const init = /** @type RequestInit */ ({
      method,
      headers: this.prepareHeaders(headers),
      redirect,
      credentials,
      signal,
    });
    if (payload && !['get', 'head'].includes(method.toLowerCase())) {
      init.body = payload;
    }
    return new Request(url, init);
  }

  /**
   * Parses headers string to a map of headers.
   * @param {string} [headers=''] The request headers
   * @returns {object}
   */
  prepareHeaders(headers='') {
    const list = HeadersParser.stringToJSON(headers);
    const result = {};
    list.forEach((item) => {
      const { name, value } = item;
      if ((name in result)) {
        result[name] += `, ${value}`;
      } else {
        result[name] = value;
      }
    });
    return result;
  }

  /**
   * Prepares the ARC response object from the response
   * @param {Response} response
   */
  async reportResponse(response) {
    const { status, statusText, headers } = response;
    const loadingTime = this.endTime - this.startTime;
    const payload = await this.readResponsePayload(headers, response);

    let responseSize = 0;
    if (payload) {
      if (typeof payload === 'string') {
        responseSize = payload.length;
      } else {
        responseSize = payload.byteLength;
      }
    }

    const rsp = /** @type ArcResponse */ ({
      loadingTime,
      status,
      statusText,
      payload,
      id: this.id,
      redirects: [],
      headers: HeadersParser.toString(headers),
      size: {
        request: 0,
        response: responseSize,
      }
    });
    return rsp;
  }

  /**
   * Prepares the ARC error response object from the error
   * @param {Error} error
   * @return {Promise<ErrorResponse>}
   */
  async reportError(error) {
    return /** @type ErrorResponse */ ({
      error,
      status: 0,
    });
  }

  /**
   * Mocks the  request that has been send to the endpoint.
   * 
   * @returns {TransportRequest}
   */
  prepareTransportRequest() {
    const { sourceRequest } = this;
    const { url, method, headers, payload } = sourceRequest;
    let httpMessage;
    try {
      httpMessage = this.prepareSourceMessage(url, method, headers, payload);
    } catch (e) {
      httpMessage = 'Unable to parse the URL data...';
    }

    const result = /** @type TransportRequest */ ({
      startTime: this.startTime,
      endTime: this.endTime,
      method,
      headers,
      url,
      payload,
      httpMessage,
    });

    return result;
  }

  /**
   * Mocks the  request that has been send to the endpoint.
   * 
   * @param {string} url
   * @param {string} method
   * @param {string} headers
   * @param {string | File | Blob | Buffer | ArrayBuffer | FormData} payload
   * @returns {string}
   */
  prepareSourceMessage(url, method, headers='', payload='') {
    const parser = new URL(url);
    let result = `${method} ${parser.pathname} HTTP/1.1\n`;
    if (!headers.includes('host:')) {
      result += `host: ${parser.hostname}\n`;
    }
    result += headers;
    if (!result.endsWith('\n')) {
      result += '\n';
    }
    result += '\n';
    if (typeof payload === 'string') {
      result += `${payload}\n\n`;
    }
    return result;
  }

  /**
   * @param {Headers} headers
   * @param {Response} response
   * @returns {Promise<string|ArrayBuffer|undefined>}
   */
  async readResponsePayload(headers, response) {
    const contentType = headers.get('content-type');
    if (!contentType) {
      return undefined;
    }
    if (contentType.includes('image/') || contentType.includes('/pdf') || contentType.includes('/octet-stream')) {
      return response.arrayBuffer();
    }
    return response.text();
  }

  /**
   * @param {string} type
   */
  informStatus(type) {
    document.body.dispatchEvent(new CustomEvent(type, {
      composed: true,
      bubbles: true,
      detail: {
        id: this.id,
      }
    }));
  }
}
