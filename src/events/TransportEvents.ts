import { ContextEvent } from "@api-client/core/build/browser.js";
import { HTTPResponse, ArcBaseRequest, RequestConfig, TransportRequest, Response, ErrorResponse, ArcEditorRequest } from "@api-client/core/build/legacy.js";
import { WebsocketEditorRequest } from "../models/WebSocket.js";
import { EventTypes } from "./EventTypes.js";

export type TransportRequestSource = 'arc' | 'api-console';

export interface ApiTransportEventDetail {
  id: string;
  request: ArcBaseRequest;
  config: RequestConfig;
  source: TransportRequestSource;
}

export interface ApiAbortEventDetail {
  id: string;
}

export interface ApiResponseEventDetail {
  id: string;
  request: TransportRequest;
  response: Response | ErrorResponse;
  source: ArcBaseRequest;
}

export interface HttpTransportEventDetail {
  /**
   * The request configuration to make.
   */
  request: ArcBaseRequest;
  /**
   * When handled the event returns the response object.
   */
  result?: Promise<HTTPResponse>;
}

export class TransportEvents {
  /**
   * @param request The request configuration to transport.
   */
  static request(request: ArcEditorRequest, target: EventTarget = window): void {
    const e = new CustomEvent(EventTypes.Transport.request, {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail: request,
    });
    target.dispatchEvent(e);
  }

  /**
   * @param id The id of the request
   * @param source The source request from the request editor
   * @param request Information about the request that has been transported
   * @param response The response object
   * @param cancelable Whether the event is cancelable
   */
  static response(id: string, source: ArcBaseRequest, request: TransportRequest, response: Response | ErrorResponse, cancelable = true, target: EventTarget = window): void {
    const e = new CustomEvent(EventTypes.Transport.response, {
      bubbles: true,
      composed: true,
      cancelable,
      detail: { id, source, request, response, },
    });
    target.dispatchEvent(e);
  }

  /**
   * @param id The id of the request
   * @param request The request configuration to transport.
   * @param config The transport configuration to use. Request configuration overrides the values.
   * @param source The source of the request. Default to `arc`.
   */
  static transport(id: string, request: ArcBaseRequest, config: RequestConfig = { enabled: false }, source: TransportRequestSource = 'arc', target: EventTarget = window): void {
    const e = new CustomEvent(EventTypes.Transport.transport, {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail: { id, request, config, source, },
    });
    target.dispatchEvent(e);
  }

  /**
   * @param id The id of the request
   * @param source The source request from the request editor
   * @param request Information about the request that has been transported
   * @param response The response object
   * @param target A target on which to dispatch the event
   */
  static processResponse(id: string, source: ArcBaseRequest, request: TransportRequest, response: Response | ErrorResponse, target: EventTarget = window): void {
    const e = new CustomEvent(EventTypes.Transport.processResponse, {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail: { id, source, request, response, },
    });
    target.dispatchEvent(e);
  }

  /**
   * @param id The id of the request to abort
   */
  static abort(id: string, target: EventTarget = window): void {
    const e = new CustomEvent(EventTypes.Transport.abort, {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail: { id },
    });
    target.dispatchEvent(e);
  }

  /**
   * Dispatches an event to make a web socket connection
   * @param editorRequest The editor web socket request associated with the event
   * @param target A node on which to dispatch the event
   */
  static connect(editorRequest: WebsocketEditorRequest, target: EventTarget = window): void {
    const e = new CustomEvent(EventTypes.Transport.connect, {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail: { editorRequest },
    });
    target.dispatchEvent(e);
  }

  /**
   * Dispatches an event to close a web socket connection
   * @param editorRequest The editor web socket request associated with the event
   * @param target A node on which to dispatch the event
   */
  static disconnect(editorRequest: WebsocketEditorRequest, target: EventTarget = window): void {
    const e = new CustomEvent(EventTypes.Transport.disconnect, {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail: { editorRequest },
    });
    target.dispatchEvent(e);
  }

  /**
   * Dispatches an event to close a web socket connection
   * @param editorRequest The editor web socket request associated with the event
   * @param target A node on which to dispatch the event
   */
  static connectionSend(editorRequest: WebsocketEditorRequest, target: EventTarget = window): void {
    const e = new CustomEvent(EventTypes.Transport.connectionSend, {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail: { editorRequest },
    });
    target.dispatchEvent(e);
  }

  /**
   * Performs an HTTP request on the backend to mitigate CORS restrictions.
   * 
   * @param request The request configuration to transport.
   * @param target A target on which to dispatch the event
   */
  static async httpTransport(request: ArcBaseRequest, target: EventTarget = window): Promise<HTTPResponse | undefined> {
    const e = new ContextEvent<{ request: ArcBaseRequest }, HTTPResponse>(EventTypes.Transport.httpTransport, { request });
    target.dispatchEvent(e);
    return e.detail.result;
  }
}
