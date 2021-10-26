/* eslint-disable class-methods-use-this */
import { ArcFetchRunner } from './ArcFetchRunner.js';

/** @typedef {import('@advanced-rest-client/events').ArcRequest.ArcEditorRequest} ArcEditorRequest */
/** @typedef {import('@advanced-rest-client/events').ArcResponse.Response} Response */
/** @typedef {import('@advanced-rest-client/events').ArcResponse.ErrorResponse} ErrorResponse */
/** @typedef {import('@advanced-rest-client/events').Config.ARCRequestConfig} ARCRequestConfig */

/**
 * A class that makes a HTTP request for Advanced REST Client request object.
 * This is a web platform replacement for ARC electron request module.
 * 
 * Note, before executing the request use the `RequestFactory` class to run all actions related to the request.
 */
export class ArcFetchRequest {
  constructor() {
    this.queue = {};
  }

  /**
   * @param {ArcEditorRequest} editorRequest
   * @param {ARCRequestConfig} [appRequestConfig={}]
   */
  async execute(editorRequest, appRequestConfig={}) {
    const config = { ...appRequestConfig };
    const { request, id } = editorRequest;
    if (request.config && request.config.enabled !== false) {
      if (typeof request.config.followRedirects === 'boolean') {
        config.followRedirects = request.config.followRedirects;
      }
      if (typeof request.config.ignoreSessionCookies === 'boolean') {
        config.ignoreSessionCookies = request.config.ignoreSessionCookies;
      }
      if (typeof request.config.timeout === 'number') {
        config.timeout = request.config.timeout;
      }
    }

    const runner = new ArcFetchRunner(id, request, config);
    this.queue[id] = runner;
    const result = await runner.run();
    if (runner.abortController.signal.aborted) {
      return undefined;
    }
    const transport = runner.prepareTransportRequest();
    const typedResult = /** @type Response */ (result);
    const typedError = /** @type ErrorResponse */ (result);
    if (!typedError.error && transport.httpMessage) {
      typedResult.size.request = transport.httpMessage.length;
    }
    delete this.queue[id];
    return {
      request: editorRequest,
      transport,
      response: result,
    };
  }

  /**
   * Aborts the running request
   * @param {string} id
   */
  abort(id) {
    const runner = this.queue[id];
    if (!runner) {
      return;
    }
    runner.abort();
  }
}
