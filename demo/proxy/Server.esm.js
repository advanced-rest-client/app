import http from 'http';
import { ElectronRequest } from '@advanced-rest-client/electron/request/ElectronRequest.js';
import { SocketRequest } from '@advanced-rest-client/electron/request/SocketRequest.js';
import { ArcHeaders } from '@advanced-rest-client/base/src/lib/headers/ArcHeaders.js';
import v4 from '@advanced-rest-client/uuid/src/v4.js';

/** @typedef {import('@advanced-rest-client/electron/request/RequestOptions').Options} RequestOptions */
/** @typedef {import('@advanced-rest-client/events').ArcRequest.ArcBaseRequest} ArcBaseRequest */
/** @typedef {import('@advanced-rest-client/events').ArcResponse.Response} Response */
/** @typedef {import('@advanced-rest-client/events').ArcResponse.ErrorResponse} ErrorResponse */
/** @typedef {import('@advanced-rest-client/events').ArcRequest.TransportRequest} TransportRequest */

/** 
 * @typedef HttpProxy
 * @property {ElectronRequest|SocketRequest=} connection
 * @property {ArcBaseRequest=} request
 * @property {boolean} aborted
 * @property {(reason?: any) => void} rejecter
 * @property {(result: ProxyResult) => void} resolver
 */
/** 
 * @typedef ProxyResult
 * @property {ArcBaseRequest} request
 * @property {TransportRequest} transport
 * @property {Response | ErrorResponse} response
 */

/**
 * A server that proxies HTTP request for Advanced REST Client.
 * 
 * Append the URL to the `/proxy?u=...` endpoint.
 * The target URL must be URL encoded.
 * 
 * Example:
 * 
 * ```
 * http://localhost:8082/proxy?u=https....
 * ```
 */
export class ProxyServer {
  constructor() {
    /** @type http.RequestListener */
    this._requestListener = this._requestListener.bind(this);
    /** @type http.IncomingMessage[] */
    this.connections = [];

    /** 
     * @type {Map<string, HttpProxy>}
     */
    this.clients = new Map();

    this.loadHandler = this.loadHandler.bind(this);
    this.errorHandler = this.errorHandler.bind(this);
  }

  /**
   * @param {number} port Starts the proxy
   * @returns {Promise<void>}
   */
  async start(port) {
    const server = http.createServer(this._requestListener);
    return new Promise((resolve) => {
      server.listen(port, () => {
        this.server = server;
        resolve();
      });
    });
  }

  /**
   * @returns {Promise<void>}
   */
  async stop() {
    if (!this.server) {
      return undefined;
    }
    return new Promise((resolve) => {
      if (this.connections.length) {
        console.log(`Stopping ${this.connections.length} connections.`)
      }
      this.connections.forEach((client) => {
        if (!client.destroyed) {
          client.destroy();
        }
      });
      this.connections = [];
      console.log('Stopping OAuth 2 proxy...');
      this.server.close(() => {
        resolve();
      });
    });
  }

  /**
   * @param {http.IncomingMessage} req
   * @param {http.ServerResponse} res
   */
  async _requestListener(req, res) {
    const { url='', method, headers } = req;
    if (method === 'OPTIONS') {
      this._sendCors(req, res);
      return;
    }
    if (!url.startsWith('/proxy?u=')) {
      this._sendError(req, res, 'not found (url)', 404);
      return;
    }

    const proxied = decodeURIComponent(url.replace('/proxy?u=', ''));
    if (!proxied) {
      this._sendError(req, res, 'no token url');
      return;
    }

    if (!proxied.startsWith('https://') && !proxied.startsWith('http://')) {
      this._sendError(req, res, `token url must use http(s): scheme. "${proxied}" given.`);
      return;
    }

    this.connections.push(req);
    req.on('end', () => {
      const index = this.connections.indexOf(req);
      if (index >= 0) {
        this.connections.splice(index, 1);
      }
    });
    const { origin } = headers;
    try {
      const result = await this._proxy(req, proxied);
      const { request, response, transport } = result;
      const corsHeaders = this._getCors(origin);
      res.writeHead(200, corsHeaders);
      if (request.payload) {
        request.payload = this.bufferToTransformed(/** @type Buffer */ (request.payload));
      }
      if (response.payload) {
        response.payload = this.bufferToTransformed(/** @type Buffer */ (response.payload));
      }
      if (transport.payload) {
        transport.payload = this.bufferToTransformed(/** @type Buffer */ (transport.payload));
      }
      const proxyResponse = {
        request, response, transport,
      };
      res.end(JSON.stringify(proxyResponse));
    } catch (e) {
      console.error(e);
      this._sendError(req, res, e.message);
    }
    const index = this.connections.indexOf(req);
    if (index >= 0) {
      this.connections.splice(index, 1);
    }
  }

  /**
   * @param {Buffer} buffer
   * @returns {any}
   */
  bufferToTransformed(buffer) {
    if (buffer) {
      return {
        type: 'Buffer',
        data: [...buffer],
      }
    }
    return undefined;
  }

  /**
   * @param {http.IncomingMessage} req
   * @param {http.ServerResponse} res
   * @param {string} message
   * @param {number} code
   */
  _sendError(req, res, message, code=400) {
    const { headers, } = req;
    const body = JSON.stringify({
      error: 'invalid_request',
      error_description: message,
    });
    const rspHeaders = this._getCors(headers.origin);
    rspHeaders['content-type'] = 'application/json';
    res.writeHead(code, rspHeaders);
    res.end(body);
  }

  /**
   * @param {string} origin
   * @returns {http.OutgoingHttpHeaders}
   */
   _getCors(origin) {
    const result = /** @type http.OutgoingHttpHeaders */ ({
      'access-control-allow-origin': origin || '*',
      'access-control-allow-methods': 'POST',
      'access-control-request-headers': 'Content-Type',
    });
    return result;
  }

  /**
   * @param {http.IncomingMessage} req
   * @param {string} url
   * @returns {Promise<ProxyResult>}
   */
  async _proxy(req, url) {
    return new Promise((resolve, reject) => {
      const id = v4();
      this.clients.set(id, {
        aborted: false,
        rejecter: reject,
        resolver: resolve,
      });
      this._makeProxyConnection(req, url, id);
    });
  }

  /**
   * @param {http.IncomingMessage} req
   * @param {string} url
   * @param {string} id
   * @returns {Promise<void>}
   */
  async _makeProxyConnection(req, url, id) {
    const useNative = req.headers['x-arc-proxy-use-native'] === 'true';
    const options = this.prepareRequestOptions(req.headers);
    const request = await this.prepareArcRequest(req, url);
    const info = this.clients.get(id);
    info.request = request;
    try {
      /** @type SocketRequest|ElectronRequest */
      const client = useNative ? this.prepareNativeRequest(id, request, options) : this.prepareSocketRequest(id, request, options);
      await client.send();
    } catch (e) {
      console.error(e);
      this.errorHandler(e, id);
    }
  }

  /**
   * @param {http.IncomingMessage} req
   * @returns {string}
   */
  _proxyHeaders(req) {
    const headers = { ...(req.headers || {}) };
    delete headers.host;
    delete headers.connection;
    delete headers.accept;
    delete headers.origin;
    delete headers.referer;
    delete headers['sec-ch-ua'];
    delete headers['sec-ch-ua-mobile'];
    delete headers['sec-ch-ua-platform'];
    delete headers['user-agent'];
    delete headers['sec-fetch-site'];
    delete headers['sec-fetch-mode'];
    delete headers['sec-fetch-dest'];
    const keys = Object.keys(headers);
    keys.forEach((key) => {
      if (key.startsWith('x-arc-proxy-')) {
        delete headers[key];
      }
    });
    const parser = new ArcHeaders(headers);
    return parser.toString();
  }

  /**
   * @param {http.IncomingMessage} req
   * @returns {Promise<Buffer>}
   */
  async _readBody(req) {
    const buffers = [];
    for await (const chunk of req) {
      buffers.push(chunk);
    }
    return Buffer.concat(buffers);
  }

  /**
   * @param {http.IncomingHttpHeaders} headers
   * @returns {RequestOptions}
   */
  prepareRequestOptions(headers) {
    const result = /** @type RequestOptions */ ({
      validateCertificates: headers['x-arc-proxy-validate-certificates'] === 'true', 
      followRedirects: headers['x-arc-proxy-follow-redirects'] === 'true', 
      defaultHeaders: headers['x-arc-proxy-default-headers'] === 'true', 
    });
    const timeout = Number(headers['x-arc-proxy-timeout']);
    if (typeof result.timeout !== 'number' && !Number.isNaN(timeout)) {
      result.timeout = timeout;
    }
    if (result.timeout) {
      result.timeout *= 1000;
    } else {
      result.timeout = 0;
    }

    const messageLimit = Number(headers['x-arc-proxy-sent-message-limit']);
    if (!Number.isNaN(messageLimit)) {
      result.sentMessageLimit = messageLimit;
    }

    const proxy = /** @type string */ (headers['x-arc-proxy-http-proxy']);
    if (proxy && typeof proxy === 'string') {
      const proxyUsername = /** @type string */ (headers['x-arc-proxy-http-proxy-username']);
      const proxyPassword = /** @type string */ (headers['x-arc-proxy-http-proxy-password']);
      result.proxy = proxy;
      if (typeof proxyUsername === 'undefined' && typeof proxyUsername === 'string') {
        result.proxyUsername = proxyUsername;
      }
      if (typeof proxyPassword === 'undefined' && typeof proxyPassword === 'string') {
        result.proxyPassword = proxyPassword;
      }
    }
    return result;
  }

  /**
   * @param {http.IncomingMessage} req
   * @param {string} url
   * @returns {Promise<ArcBaseRequest>}
   */
  async prepareArcRequest(req, url) {
    const body = await this._readBody(req);
    const headers = this._proxyHeaders(req);

    return /** @type ArcBaseRequest */ ({
      url,
      method: req.method,
      headers,
      payload: body,
      kind: 'ARC#ArcBaseRequest'
    })
  }

  /**
   * @param {string} id
   * @param {ArcBaseRequest} request
   * @param {RequestOptions} opts
   * @returns {ElectronRequest}
   */
  prepareNativeRequest(id, request, opts) {
    const conn = new ElectronRequest(request, id, opts);
    const info = this.clients.get(id);
    info.connection = conn;
    conn.on('load', this.loadHandler);
    conn.on('error', this.errorHandler);
    return conn;
  }

  /**
   * @param {string} id
   * @param {ArcBaseRequest} request
   * @param {RequestOptions} opts
   * @returns {SocketRequest}
   */
  prepareSocketRequest(id, request, opts) {
    const conn = new SocketRequest(request, id, opts);
    const info = this.clients.get(id);
    info.connection = conn;
    conn.on('load', this.loadHandler);
    conn.on('error', this.errorHandler);
    return conn;
  }

  /**
   * @param {string} id
   * @param {Response | ErrorResponse} response
   * @param {TransportRequest} transport
   */
  async loadHandler(id, response, transport) {
    const info = this.clients.get(id);
    this.clients.delete(id);
    if (!info || info.aborted) {
      return;
    }
    const result = {
      request: info.request,
      transport, 
      response,
    }
    info.resolver(result);
  }

  /**
   * @param {Error} error
   * @param {string} id
   * @param {TransportRequest=} transport
   * @param {ErrorResponse=} response
   */
  errorHandler(error, id, transport, response) {
    const info = this.clients.get(id);
    this.clients.delete(id);
    if (!info || info.aborted) {
      return;
    }
    const result = {
      request: info.request,
      transport, 
      response,
    }
    result.response = response || {
      error,
      status: 0,
    };
    info.resolver(result);
  }

  /**
   * @param {http.IncomingMessage} req
   * @param {http.ServerResponse} res
   */
  async _sendCors(req, res) {
    const headers = /** @type http.OutgoingHttpHeaders */ ({
      'access-control-allow-origin': req.headers.origin || '*',
      'access-control-allow-methods': 'POST',
    });
    const allowedHeaders = ['Content-Type'];
    Object.keys(req.headers).forEach((key) => {
      if (key.startsWith('x-arc-proxy-')) {
        allowedHeaders.push(key);
      }
    });
    const requestedHeaders = req.headers['access-control-request-headers'];
    if (requestedHeaders && typeof requestedHeaders === 'string') {
      const parts = requestedHeaders.split(',').map(i => i.trim());
      parts.forEach((requestedHeader) => {
        if (!allowedHeaders.includes(requestedHeader)) {
          allowedHeaders.push(requestedHeader);
        }
      });
    }
    headers['access-control-allow-headers'] = allowedHeaders.join(',');
    res.statusCode = 204;
    Object.keys(headers).forEach(key => res.setHeader(key, headers[key]));
    res.end();
  }
}
