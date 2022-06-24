import { HttpRequestBindings } from "../../src/bindings/base/HttpRequestBindings.js";

/** @typedef {import('@advanced-rest-client/events').ArcRequest.ArcBaseRequest} ArcBaseRequest */
/** @typedef {import('@advanced-rest-client/events').ArcRequest.RequestConfig} RequestConfig */
/** @typedef {import('@advanced-rest-client/events').ArcResponse.ErrorResponse} ErrorResponse */
/** @typedef {import('@advanced-rest-client/events').TransportRequestSource} TransportRequestSource */
/** @typedef {import('@advanced-rest-client/events').ArcRequest.ArcEditorRequest} ArcEditorRequest */
/** @typedef {import('@api-components/amf-components').ApiConsoleRequest} ApiConsoleRequest */
/** @typedef {import('@api-components/amf-components').ApiConsoleResponse} ApiConsoleResponse */

export class HttpProxyBindings extends HttpRequestBindings {
  constructor() {
    super();
  }

  /**
   * @param {ArcBaseRequest} request
   * @param {string} id
   * @param {RequestConfig=} config
   * @param {TransportRequestSource=} source
   */
  async transport(request, id, config = { enabled: false }, source) {
    const rConf = /** @type RequestConfig */ (request.config || {});
    const configInit = rConf.enabled ? rConf : /** @type RequestConfig */ ({});
    const finalConfig = this.prepareRequestOptions(config, configInit);

    const ctrl = new AbortController();
    this.connections.set(id, {
      connection: ctrl,
      request,
      aborted: false,
      source,
    });
    const body = JSON.stringify({
      request,
      config: finalConfig,
    });
    const rsp = await fetch('/proxy/v1/proxy', {
      body,
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      signal: ctrl.signal,
    });
    const info = await rsp.json();
    const { response, transport } = info;
    if (response.payload) {
      const array = new Uint8Array(response.payload.data);
      response.payload = array.buffer;
    }
    if (transport.httpMessage) {
      const array = new Uint8Array(transport.httpMessage.data);
      const enc = new TextDecoder("utf-8");
      transport.httpMessage = enc.decode(array);
    }
    const arcTransport = {
      url: request.url,
      method: request.method,
      headers: request.headers,
      payload: request.payload,
      ...transport 
    };
    this.loadHandler(id, response, arcTransport);
  }

  /**
   * @param {RequestConfig} primary
   * @param {RequestConfig} secondary
   * @returns {Record<string, string>}
   */
  prepareRequestOptions(primary, secondary) {
    const config = /** @type RequestConfig */ (/** @type unknown */ ({
      ...secondary,
      ...primary,
    }));
    const result = /** @type Record<string, string> */ ({});
    if (typeof config.timeout !== 'number') {
      config.timeout = this.requestTimeout;
    }
    if (typeof config.followRedirects !== 'boolean') {
      config.followRedirects = this.followRedirects;
    }
    if (typeof config.defaultHeaders !== 'boolean') {
      // @ts-ignore
      config.defaultHeaders = this.defaultHeaders;
    }
    if (typeof config.validateCertificates !== 'boolean') {
      config.validateCertificates = this.validateCertificates;
    }
    return result;
  }

  /**
   * @param {any} info
   * @returns {ArrayBuffer}
   */
  transformedToBuffer(info) {
    if (info && info.data) {
      const { buffer } = new Uint8Array(info.data);
      return buffer;
    }
    return undefined;
  }
}
