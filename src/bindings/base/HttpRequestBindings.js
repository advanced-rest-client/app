/* eslint-disable no-unused-vars */
/* eslint-disable class-methods-use-this */
import { EventTypes, Events } from '@advanced-rest-client/events';
import { ApiEventTypes, ApiEvents } from '@api-components/amf-components';
import { RequestFactory } from '@advanced-rest-client/base';
import { PlatformBindings } from './PlatformBindings.js';

/** @typedef {import('@advanced-rest-client/events').ApiTransportEvent} ApiTransportEvent */
/** @typedef {import('@advanced-rest-client/events').ConfigStateUpdateEvent} ConfigStateUpdateEvent */
/** @typedef {import('@advanced-rest-client/events').ArcRequest.ArcEditorRequest} ArcEditorRequest */
/** @typedef {import('@advanced-rest-client/events').ArcRequest.ArcBaseRequest} ArcBaseRequest */
/** @typedef {import('@advanced-rest-client/events').ArcRequest.TransportRequest} TransportRequest */
/** @typedef {import('@advanced-rest-client/events').ArcResponse.TransformedPayload} TransformedPayload */
/** @typedef {import('@advanced-rest-client/events').ArcRequest.RequestConfig} RequestConfig */
/** @typedef {import('@advanced-rest-client/events').ArcResponse.Response} Response */
/** @typedef {import('@advanced-rest-client/events').ArcResponse.ErrorResponse} ErrorResponse */
/** @typedef {import('@advanced-rest-client/events').HostRule.HostRule} HostRule */
/** @typedef {import('@advanced-rest-client/events').Config.ARCConfig} ARCConfig */
/** @typedef {import('@advanced-rest-client/events').TransportRequestSource} TransportRequestSource */
/** @typedef {import('@api-components/amf-components').ApiRequestEvent} ApiRequestEvent */
/** @typedef {import('@api-components/amf-components').AbortRequestEvent} AbortRequestEvent */
/** @typedef {import('@api-components/amf-components').ApiConsoleRequest} ApiConsoleRequest */
/** @typedef {import('@api-components/amf-components').AbortRequestEventDetail} AbortRequestEventDetail */
/** @typedef {import('@api-components/amf-components').ApiConsoleResponse} ApiConsoleResponse */
/** @typedef {import('./HttpRequestBindings').ConnectionInfo} ConnectionInfo */

/**
 * Base bindings for handling HTTP request for ARC and API Console.
 */
export class HttpRequestBindings extends PlatformBindings {
  /** 
   * @returns {boolean} Whether the application variables are enabled.
   */
  get variablesEnabled() {
    const { config={} } = this;
    const { request={} } = config;
    if (typeof request.useAppVariables === 'boolean') {
      return request.useAppVariables;
    }
    // default
    return true;
  }

  /** 
   * @returns {boolean} Whether the application should process system variables.
   */
  get systemVariablesEnabled() {
    const { config={} } = this;
    const { request={} } = config;
    if (typeof request.useSystemVariables === 'boolean') {
      return request.useSystemVariables;
    }
    // default
    return true;
  }

  /** 
   * @returns {boolean} Whether to validate SSL certificates.
   */
  get validateCertificates() {
    const { config={} } = this;
    const { request={} } = config;
    if (typeof request.validateCertificates === 'boolean') {
      return request.validateCertificates;
    }
    // default
    return false;
  }

  /** 
   * @returns {boolean} Whether the request should follow redirects.
   */
  get followRedirects() {
    const { config={} } = this;
    const { request={} } = config;
    if (typeof request.followRedirects === 'boolean') {
      return request.followRedirects;
    }
    // default
    return true;
  }

  /** 
   * @returns {boolean} Whether to use NodeJS' HTTP transport
   */
  get nativeTransport() {
    const { config={} } = this;
    const { request={} } = config;
    if (typeof request.nativeTransport === 'boolean') {
      return request.nativeTransport;
    }
    // default
    return false;
  }

  /** 
   * @returns {boolean} Whether to read OS' hosts file.
   */
  get readOsHosts() {
    const { config={} } = this;
    const { request={} } = config;
    if (typeof request.readOsHosts === 'boolean') {
      return request.readOsHosts;
    }
    // default
    return false;
  }

  /** 
   * @returns {boolean} Whether to add the "default" headers.
   */
  get defaultHeaders() {
    const { config={} } = this;
    const { request={} } = config;
    if (typeof request.defaultHeaders === 'boolean') {
      return request.defaultHeaders;
    }
    // default
    return false;
  }

  /** 
   * @returns {boolean} Whether proxy is enabled.
   */
  get proxyEnabled() {
    const { config={} } = this;
    const { proxy={} } = config;
    if (typeof proxy.enabled === 'boolean') {
      return proxy.enabled;
    }
    // default
    return false;
  }

  /** 
   * @returns {number} The request default timeout.
   */
  get requestTimeout() {
    const { config={} } = this;
    const { request={} } = config;
    const value = Number(request.timeout);
    if (typeof value === 'number' && !Number.isNaN(value)) {
      return value;
    }
    // default
    return 0;
  }

  /** 
   * @returns {string}
   */
  get proxyUsername() {
    const { config={} } = this;
    const { proxy={} } = config;
    return proxy.username;
  }

  /** 
   * @returns {string}
   */
  get proxyPassword() {
    const { config={} } = this;
    const { proxy={} } = config;
    return proxy.password;
  }

  /** 
   * @returns {string}
   */
  get proxy() {
    const { config={} } = this;
    const { proxy={} } = config;
    return proxy.url;
  }

  constructor() {
    super();
    this.factory = new RequestFactory(window);
    /** 
     * @type {Map<string, ConnectionInfo>}
     */
    this.connections = new Map();
  }

  async initialize() {
    let settings = /** @type ARCConfig */ ({});
    try {
      settings = (await Events.Config.readAll(document.body)) || {};
    } catch (e) {
      // ...
    }
    this.config = settings;
    window.addEventListener(EventTypes.Transport.request, this.makeRequestHandler.bind(this));
    window.addEventListener(EventTypes.Transport.abort, this.abortRequestHandler.bind(this));
    window.addEventListener(EventTypes.Transport.transport, this.transportRequestHandler.bind(this));
    window.addEventListener(EventTypes.Config.State.update, this.configStateChangeHandler.bind(this));
    window.addEventListener(ApiEventTypes.Request.apiRequest, this.apicRequestHandler.bind(this));
    window.addEventListener(ApiEventTypes.Request.abortApiRequest, this.apicAbortHandler.bind(this));
  }

  /**
   * @param {CustomEvent} e
   */
  async makeRequestHandler(e) {
    const transportRequest = /** @type ArcEditorRequest */ (e.detail);
    this.beforeArcTransport(transportRequest);
  }

  /**
   * @param {CustomEvent} e
   */
  abortRequestHandler(e) {
    const { id } = e.detail;
    this.abort(id);
  }

  /**
   * @param {ApiTransportEvent} e
   */
  async transportRequestHandler(e) {
    const transportRequest = e.detail;
    const { config, id, request, source } = transportRequest;
    await this.transport(request, id, config, source);
  }

  /**
   * @param {ConfigStateUpdateEvent} e
   */
  configStateChangeHandler(e) {
    const { key, value } = e.detail;
    const { config={} } = this;
    this.updateValue(config, key, value);
  }

  /**
   * The logic that runs before the request is sent to the transport.
   * This is for ARC request.
   * @param {ArcEditorRequest} transportRequest
   */
  async beforeArcTransport(transportRequest) {
    try {
      const request = await this.factory.processRequest(transportRequest, {
        evaluateVariables: this.variablesEnabled,
        evaluateSystemVariables: this.systemVariablesEnabled,
      });
      // this event is significant, even though it is handled by the same class.
      Events.Transport.transport(document.body, request.id, request.request);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      const { id, request } = transportRequest;
      Events.Transport.response(document.body, id, request, undefined, {
        error: err,
        loadingTime: 0,
        status: 0,
      });
    }
  }

  /**
   * Aborts a request
   * @param {string} id
   */
  abort(id) {
    this.factory.abort(id);
    const info = this.connections.get(id);
    if (info) {
      info.connection.abort();
    }
  }

  /**
   * @param {ArcBaseRequest} request
   * @param {string} id
   * @param {RequestConfig=} config
   * @param {TransportRequestSource=} source
   */
  async transport(request, id, config={ enabled: false }, source) {
    throw new Error('Not yet implemented');
  }

  /**
   * @param {string} id
   * @param {Response | ErrorResponse} response
   * @param {TransportRequest} transport
   */
  async loadHandler(id, response, transport) {
    const info = this.connections.get(id);
    this.connections.delete(id);
    if (!info || info.aborted) {
      return;
    }
    const typed = /** @type Response */ (response);
    if (info.source === 'api-console') {
      await this.respondApiConsole(info, id, response, transport);
    } else {
      await this.respondArc(info, id, response, transport);
    }
  }

  /**
   * Prepares response for Advanced REST Client.
   * @param {ConnectionInfo} info
   * @param {string} id
   * @param {Response | ErrorResponse} response
   * @param {TransportRequest} transport
   * @returns {Promise<void>}
   */
  async respondArc(info, id, response, transport) {
    const fr = {
      id,
      request: info.request,
    }
    try {
      await this.factory.processResponse(fr, transport, response, {
        evaluateVariables: this.variablesEnabled,
        evaluateSystemVariables: this.systemVariablesEnabled,
      });
      Events.Transport.response(document.body, id, info.request, transport, response);
    } catch (e) {
      const errorResponse = /** @type ErrorResponse */ ({
        error: e,
        status: response.status,
        headers: response.headers,
        payload: response.payload,
        statusText: response.statusText,
        id: response.id,
      });
      Events.Transport.response(document.body, id, info.request, transport, errorResponse);
    }
  }

  /**
   * Prepares response forAPI Console.
   * @param {ConnectionInfo} info
   * @param {string} id
   * @param {Response | ErrorResponse} response
   * @param {TransportRequest} transport
   * @returns {Promise<void>}
   */
  async respondApiConsole(info, id, response, transport) {
    const typed = /** @type Response */ (response);
    const apiConsoleRequest = /** @type ApiConsoleRequest */ ({
      method: info.request.method,
      url: info.request.url,
      authorization: info.request.authorization,
      headers: info.request.headers,
      id,
      payload: info.request.payload,
    });
    const apiResponse = /** @type ApiConsoleResponse */ ({
      id,
      isError: false,
      loadingTime: typed.loadingTime,
      request: apiConsoleRequest,
      response,
    });
    ApiEvents.Request.apiResponse(document.body, apiResponse);
  }

  /**
   * A handler for the request error.
   * 
   * @param {Error} error
   * @param {string} id
   * @param {TransportRequest=} transport
   * @param {ErrorResponse=} response
   */
  errorHandler(error, id, transport, response) {
    const info = this.connections.get(id);
    this.connections.delete(id);
    if (!info || info.aborted) {
      return;
    }
    if (info.source === 'api-console') {
      this.errorApiConsole(info, error, id, transport, response);
    } else {
      this.errorArc(info, error, id, transport, response);
    }
  }

  /**
   * A handler for the request error for ARC.
   * 
   * @param {ConnectionInfo} info
   * @param {Error} error
   * @param {string} id
   * @param {TransportRequest=} transport
   * @param {ErrorResponse=} response
   */
  errorArc(info, error, id, transport, response) {
    const errorResponse = response || {
      error,
      status: 0,
    };

    Events.Transport.response(document.body, id, info.request, transport, errorResponse);
  }

  /**
   * A handler for the request error for API Console.
   * 
   * @param {ConnectionInfo} info
   * @param {Error} error
   * @param {string} id
   * @param {TransportRequest=} transport
   * @param {ErrorResponse=} response
   */
  errorApiConsole(info, error, id, transport, response) {
    const request = /** @type ApiConsoleRequest */ ({
      method: info.request.method,
      url: info.request.url,
      authorization: info.request.authorization,
      headers: info.request.headers,
      id,
      payload: info.request.payload,
    });
    const errorResponse = /** @type ApiConsoleResponse */ ({
      id,
      isError: true,
      loadingTime: 0,
      request,
      response,
      error,
    });
    ApiEvents.Request.apiResponse(document.body, errorResponse);
  }

  /**
   * @param {string} type
   * @param {string} id
   */
  informStatus(type, id) {
    const info = this.connections.get(id);
    if (!info || info.aborted) {
      return;
    }
    document.body.dispatchEvent(new CustomEvent(type, {
      composed: true,
      bubbles: true,
      detail: {
        id,
      }
    }));
  }

  /**
   * @param {ApiRequestEvent} e
   */
  apicRequestHandler(e) {
    if (e.defaultPrevented) {
      return;
    }
    e.preventDefault();
    const request = /** @type ApiConsoleRequest */ (e.detail);
    this.apiConsoleRequest(request);
  }

  /**
   * @param {AbortRequestEvent} e
   */
  apicAbortHandler(e) {
    if (e.defaultPrevented) {
      return;
    }
    e.preventDefault();
    const info = /** @type AbortRequestEventDetail */ (e.detail);
    this.abort(info.id);
  }

  /**
   * @param {ApiConsoleRequest} request
   * @returns {Promise<void>}
   */
  async apiConsoleRequest(request) {
    const transportRequest = /** @type ArcEditorRequest */ ({
      id: request.id,
      request: {
        url: request.url,
        method: request.method,
        headers: request.headers,
        payload: request.payload,
        authorization: request.authorization,
      },
    });
    try {
      const processed = await this.factory.processRequest(transportRequest, {
        evaluateVariables: this.variablesEnabled,
        evaluateSystemVariables: this.systemVariablesEnabled,
      });
      Events.Transport.transport(document.body, processed.id, processed.request, undefined, 'api-console');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      const { id } = transportRequest;
      const info = /** @type ApiConsoleResponse */ ({
        id,
        isError: true,
        loadingTime: 0,
        request,
        response: undefined,
        error: err,
      });
      ApiEvents.Request.apiResponse(document.body, info);
    }
  }
}
