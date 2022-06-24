import { ApiType, RawBody, Entity, TransformedPayload } from "@api-client/core/build/legacy.js";

export declare interface WebsocketRequest {
  kind: 'ARC#WebsocketRequest';
  /**
   * The socket URL
   */
  url?: string;
  /**
   * The data to be send.
   * Note, when the event carrying this data is the connect event this property may be discarded
   */
  payload?: string | Blob | File | ArrayBuffer | TransformedPayload;
  /**
   * The editor metadata
   */
  ui?: WebsocketRequestUiMeta;
  /**
   * When a file is the request payload then in the data store it is transformed into a 
   * string and the payload is removed. This is used internally by the data store
   * to restore the original format.
   */
  blob?: string;
}

export declare interface WebsocketRequestUiMeta {
  /**
   * Body editor meta
   */
  body?: WebsocketBodyUiMeta;
}

/**
 * The websocket body editor may produce multiple view models
 * for the UI. Each editor can store it's data in here
 * to restore it after opening a request,
 */
export declare interface BodyMetaModel {
  /**
   * The id of the editor. Each editor in ARC has own id.
   */
  type: string;
  /**
   * Generated view model.
   */
  viewModel: (ApiType | RawBody)[];
}

export declare interface WebsocketBodyUiMeta {
  /**
   * The selected editor
   */
  selected?: string;
}

export declare interface WebsocketStoredRequest extends WebsocketRequest, Entity {
  /**
   * Timestamp when the request was last updated.
   */
  updated?: number;
  /**
   * Timestamp when the request was created.
   */
  created?: number;
  /**
   * The name of the websocket request
   */
  name?: string;
}

export declare interface WebsocketEditorRequest {
  /**
   * The auto generated ID of the request in the editor.
   */
  id: string;
  /**
   * The ARC websocket request object
   */
  request: WebsocketRequest | WebsocketStoredRequest;
}

export declare interface WebsocketLog {
  /**
   * The direction the message went to.
   */
  direction: 'in' | 'out';
  /**
   * The message transmitted over the socket.
   */
  message: string | Blob | File | ArrayBuffer | TransformedPayload;
  /**
   * The size of the message in bytes
   */
  size: number;
  /**
   * The timestamp when the message was created.
   */
  created: number;
  /**
   * When a non-string log message then in the data store it is transformed into a 
   * string and the payload is removed. This is used internally by the data store
   * to restore the original format.
   */
  blob?: string;
}

export declare interface WebsocketConnectionResult {
  /**
   * The total size of the transmitted data in both directions in this connection
   */
  size: number;
  /**
   * The communication logs
   */
  logs: WebsocketLog[];
  /**
   * The timestamp when the connection was made
   */
  created: number;
  /**
   * The timestamp when the connection was last used. Meaning when a message was sent or received.
   */
  updated?: number;
  /**
   * The timestamp when the connection was closed.
   */
  closed?: number;
}
