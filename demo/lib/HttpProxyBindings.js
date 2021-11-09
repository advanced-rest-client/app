import { ApiEvents } from '@api-components/amf-components';
import { HttpRequestBindings } from "../../src/bindings/base/HttpRequestBindings.js";

/** @typedef {import('@advanced-rest-client/events').ArcRequest.ArcBaseRequest} ArcBaseRequest */
/** @typedef {import('@advanced-rest-client/events').ArcRequest.RequestConfig} RequestConfig */
/** @typedef {import('@advanced-rest-client/events').ArcResponse.ErrorResponse} ErrorResponse */
/** @typedef {import('@api-components/amf-components').ApiConsoleRequest} ApiConsoleRequest */
/** @typedef {import('@advanced-rest-client/events').ArcRequest.ArcEditorRequest} ArcEditorRequest */
/** @typedef {import('@api-components/amf-components').ApiConsoleResponse} ApiConsoleResponse */

export class HttpProxyBindings extends HttpRequestBindings {
  /**
   * @param {ArcBaseRequest} request
   * @param {string} id
   * @param {RequestConfig=} config
   */
  async transport(request, id, config = { enabled: false }) {
    const rConf = /** @type RequestConfig */ (request.config || {});
    const configInit = rConf.enabled ? rConf : /** @type RequestConfig */ ({});
    const finalConfig = this.prepareRequestOptions(config, configInit);

    const ctrl = new AbortController();
    this.connections.set(id, {
      connection: ctrl,
      request,
      aborted: false,
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

  /**
   * @param {string} id
   * @param {ApiConsoleRequest} sourceRequest
   * @param {ArcBaseRequest} arcRequest
   */
  async transportApiConsole(id, sourceRequest, arcRequest) {
    const ctrl = new AbortController();
    this.connections.set(id, {
      connection: ctrl,
      request: arcRequest,
      aborted: false,
    });
    const body = JSON.stringify({
      request: arcRequest,
      config: {
        timeout: 90000,
        followRedirects: true,
        validateCertificates: false,
      },
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
    const { response } = info;
    if (response.payload) {
      const array = new Uint8Array(response.payload.data);
      response.payload = array.buffer;
    }
    const apiResponse = /** @type ApiConsoleResponse */ ({
      id,
      isError: false,
      loadingTime: response.loadingTime,
      request: sourceRequest,
      response,
    });
    ApiEvents.Request.apiResponse(document.body, apiResponse);
  }
}
