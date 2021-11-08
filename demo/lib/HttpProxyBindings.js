import { Events } from '@advanced-rest-client/events';
import { ArcHeaders } from '@advanced-rest-client/base';
import { HttpRequestBindings } from "../../src/bindings/base/HttpRequestBindings.js";
import env from "../env.js";

/** @typedef {import('@advanced-rest-client/events').ArcRequest.ArcBaseRequest} ArcBaseRequest */
/** @typedef {import('@advanced-rest-client/events').ArcRequest.RequestConfig} RequestConfig */
/** @typedef {import('@advanced-rest-client/events').ArcResponse.ErrorResponse} ErrorResponse */

export class HttpProxyBindings extends HttpRequestBindings {
  /**
   * @param {ArcBaseRequest} request
   * @param {string} id
   * @param {RequestConfig=} config
   */
  async transport(request, id, config = { enabled: false }) {
    const proxyUrl = `${window.location.protocol}${env.httpProxy.base}${encodeURIComponent(request.url)}`
    const rConf = /** @type RequestConfig */ (request.config || {});
    const configInit = rConf.enabled ? rConf : /** @type RequestConfig */ ({});
    const headers = this.prepareRequestOptions(config, configInit);
    if (request.headers) {
      const arcHeaders = new ArcHeaders(request.headers);
      for (const [key, value] of arcHeaders) {
        headers[key] = value;
      }
    }
    const proxyResponse = await fetch(proxyUrl, {
      headers,
      method: request.method,
      body: request.payload,
    });
    if (!proxyResponse.ok) {
      const errorResponse = {
        error: new Error(`Unable to make the request. Proxy error.`),
        status: 0,
      };
      Events.Transport.response(document.body, id, request, undefined, errorResponse);
      return;
    }
    const body = await proxyResponse.json();
    const { response, transport } = body;
    if (response.payload) {
      response.payload = this.transformedToBuffer(response.payload);
    }
    if (transport.payload) {
      transport.payload = this.transformedToBuffer(transport.payload);
    }
    const er = {
      id,
      request,
    }
    try {
      await this.factory.processResponse(er, transport, response, {
        evaluateVariables: this.variablesEnabled,
        evaluateSystemVariables: this.systemVariablesEnabled,
      });
      Events.Transport.response(document.body, id, request, transport, response);
    } catch (e) {
      const errorResponse = /** @type ErrorResponse */ ({
        error: e,
        status: response.status,
        headers: response.headers,
        payload: response.payload,
        statusText: response.statusText,
        id: response.id,
      });
      Events.Transport.response(document.body, id, request, transport, errorResponse);
    }
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
    if (typeof config.timeout === 'number') {
      result['x-arc-proxy-timeout'] = String(config.timeout);
    } else {
      result['x-arc-proxy-timeout'] = String(this.requestTimeout);
    }
    if (typeof config.followRedirects === 'boolean') {
      result['x-arc-proxy-follow-redirects'] = String(config.followRedirects);
    } else {
      result['x-arc-proxy-follow-redirects'] = String(this.followRedirects);
    }
    if (typeof config.defaultHeaders === 'boolean') {
      result['x-arc-proxy-default-headers'] = String(config.defaultHeaders);
    } else {
      result['x-arc-proxy-default-headers'] = String(this.defaultHeaders);
    }
    if (typeof config.validateCertificates === 'boolean') {
      result['x-arc-proxy-validate-certificates'] = String(config.validateCertificates);
    } else {
      result['x-arc-proxy-validate-certificates'] = String(this.validateCertificates);
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
