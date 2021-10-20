import http from 'http';
import https from 'https';

/**
 * A server that proxies oauth 2 token requests from the client to the 
 * final token request endpoint.
 * 
 * Append the token endpoint to the `/proxy?u=...` endpoint.
 * The token URL must be URL encoded.
 * 
 * Example:
 * 
 * ```
 * http://localhost:8082/proxy?u=https....
 * ```
 */
export class AuthProxy {
  constructor() {
    /** @type http.RequestListener */
    this._requestListener = this._requestListener.bind(this);
    /** @type http.IncomingMessage[] */
    this.connections = [];
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
    const { url='', method } = req;
    if (method !== 'POST') {
      this._sendError(req, res, 'not found (method)', 404);
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
    try {
      const result = await this._proxy(req, proxied);
      const { buffer, headers, code=200 } = result;
      const corsHeaders = this._getCors(headers);
      const finalHeaders = { ...headers, ...corsHeaders };
      res.writeHead(code, finalHeaders);
      res.end(buffer);
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
    const rspHeaders = this._getCors(headers);
    rspHeaders['content-type'] = 'application/json';
    res.writeHead(code, rspHeaders);
    res.end(body);
  }

  /**
   * @param {http.IncomingHttpHeaders} requestHeaders
   * @returns {http.OutgoingHttpHeaders}
   */
  _getCors(requestHeaders={}) {
    const { origin } = requestHeaders;
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
   * @returns {Promise<{ buffer: Buffer, header: http.IncomingHttpHeaders }>}
   */
  async _proxy(req, url) {
    const body = await this._readBody(req);
    return new Promise((resolve, reject) => {
      const lib = url.startsWith('https://') ? https : http;
      const client = lib.request(url, {
        headers: this._proxyHeaders(req),
        method: req.method,
      }, async (res) => {
        const buffers = [];
        for await (const chunk of res) {
          buffers.push(chunk);
        }
        resolve({
          buffer: Buffer.concat(buffers),
          headers: res.headers,
          code: res.code,
        });
      });
      client.on('error', (e) => {
        console.error(`Error making connection to ${url}`);
        reject(e);
      });
      client.write(body);
      client.end();
    });
  }

  /**
   * @param {http.IncomingMessage} req
   * @returns {http.IncomingHttpHeaders}
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
    return headers;
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
}
