import { LitElement, TemplateResult } from 'lit-element';
import { EventsTargetMixin, ResizableMixin } from '@anypoint-web-components/awc';
import { WebsocketConnectionResult, WebsocketEditorRequest } from '@advanced-rest-client/events/src/request/WebSocket';
import ArcWebsocketEditorElement from './ArcWebsocketEditorElement';
import { WebsocketRequestEvent } from '@advanced-rest-client/events';

export declare const boundEventsValue: unique symbol;
export declare const notifyChange: unique symbol;
export declare const sheetClosedHandler: unique symbol;
export declare const acceptExportOptions: unique symbol;
export declare const cancelExportOptions: unique symbol;
export declare const exportRequestHandler: unique symbol;
export declare const resizerMouseDown: unique symbol;
export declare const isResizing: unique symbol;
export declare const boxSize: unique symbol;
export declare const resizerMouseUp: unique symbol;
export declare const resizerMouseMove: unique symbol;
export declare const requestEditorTemplate: unique symbol;
export declare const loaderTemplate: unique symbol;
export declare const resizeTemplate: unique symbol;
export declare const responseTemplate: unique symbol;
export declare const exportTemplate: unique symbol;
export declare const connectedValue: unique symbol;
export declare const requestChangeHandler: unique symbol;
export declare const connectionValue: unique symbol;
export declare const connect: unique symbol;
export declare const connectHandler: unique symbol;
export declare const disconnectHandler: unique symbol;
export declare const sendHandler: unique symbol;
export declare const connectionOpened: unique symbol;
export declare const connectionClosed: unique symbol;
export declare const connectionMessage: unique symbol;
export declare const connectionError: unique symbol;
export declare const createConnectionResult: unique symbol;
export declare const appendMessage: unique symbol;
export declare const resultClearHandler: unique symbol;

export default class ArcWebsocketPanelElement extends ResizableMixin(EventsTargetMixin(LitElement)) {

  /** 
   * The ARC request object
   */
  editorRequest: WebsocketEditorRequest;
  /** 
   * The connection result log
   */
  result: WebsocketConnectionResult;
  /**
   * Computed value. If true then the request is loading.
   * This resets each time the request status changes.
   * @attribute
   */
  loading: boolean;
  /**
   * Enables Anypoint theme
   * @attribute
   */
  anypoint: boolean;
  /**
   * Enables material's outlined theme for inputs.
   * @attribute
   */
  outlined: boolean;
  /**
   * Indicates that the export options panel is currently rendered.
   * @attribute
   */
  exportOptionsOpened: boolean;
  /**
   * When set it sets `eventsTarget` to itself and all editor event
   * listeners starts listening on this node.
   * This prohibits editors from getting data from the outside ot this
   * component.
   * @attribute
   */
  boundEvents: boolean;
  /** 
   * This value is set after resizing the panels in the UI. Once set it removes 
   * flex value from the editor and sets its height to this value.
   * @attribute
   */
  editorHeight: number;

  /**
   * Reference to ArcWebsocketEditorElement element.
   */
  get editor(): ArcWebsocketEditorElement;

  /**
   * True when the connection is made and it is possible to send a message.
   */
  get connected(): boolean;
  [connectedValue]: boolean;

  constructor();

  _attachListeners(node: EventTarget): void;

  _detachListeners(node: EventTarget): void;

  /**
   * Sends the data from the editor.
   */
  send(): void;

  /**
   * Initializes the connection.
   */
  connect(): void;

  /**
   * Closes the connection.
   */
  disconnect(): void;

  /**
   * Calls `reset()` method of the editor
   */
  clear(): void;

  [notifyChange](): void;

  /**
   * A handler for the request property change in the request editor. It updates the `editorRequest` property.
   */
  [requestChangeHandler](e: Event): void;

  [sheetClosedHandler](e: Event): void;

  /**
   * Handler for `accept` event dispatched by export options element.
   */
  [acceptExportOptions](e: CustomEvent): Promise<void>;

  [cancelExportOptions](): void;

  [exportRequestHandler](): void;

  [resizerMouseDown](e: MouseEvent): void;

  [resizerMouseUp](e: MouseEvent): void;

  [resizerMouseMove](e: MouseEvent): void;

  [sendHandler](e: WebsocketRequestEvent): void;

  [connectHandler](e: WebsocketRequestEvent): void;

  [disconnectHandler](): void;

  [connect](url: string): void;

  [connectionOpened](): void;

  [connectionClosed](): void;

  [connectionMessage](e: MessageEvent): void;

  [connectionError](): void;

  [createConnectionResult](): void;

  /**
   * Appends a message to the current result.
   */
  [appendMessage](dir: 'in'|'out', message: string | Blob | File | ArrayBuffer): void;

  [resultClearHandler](): void;

  render(): TemplateResult;

  /**
   * @returns The template for the request editor view
   */
  [requestEditorTemplate](): TemplateResult;

  /**
   * @returns The template for the response view
   */
  [responseTemplate](): TemplateResult;

  /**
   * @returns The template for the request loader
   */
  [loaderTemplate](): TemplateResult|string;

  [resizeTemplate](): TemplateResult;

  [exportTemplate](): TemplateResult;
}
