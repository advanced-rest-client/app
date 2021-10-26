import { TemplateResult, CSSResult } from 'lit-element';
import { WebsocketConnectionResult, WebsocketLog } from '@advanced-rest-client/events/src/request/WebSocket';
import ResponseViewElement from '../http/ResponseViewElement';
import { ViewConnectionResult, ViewWebsocketLog } from '../../types';

export declare const connectionResultValue: unique symbol;
export declare const logsTemplate: unique symbol;
export declare const logTemplate: unique symbol;
export declare const logItemClickHandler: unique symbol;
export declare const selectedLog: unique symbol;
export declare const selectedIndex: unique symbol;
export declare const selectedTemplate: unique symbol;
export declare const logsTableHeader: unique symbol;
export declare const logItemKeydownHandler: unique symbol;
export declare const processViewResult: unique symbol;
export declare const viewModel: unique symbol;

/**
 * An element that renders results panel of the web socket connection.
 */
export default class ArcWebsocketLogsElement extends ResponseViewElement {
  [viewModel]: ViewConnectionResult;

  /**
   * @returns {boolean} Tests whether the response is set
   */
  get hasResponse(): boolean;

  /** 
   * The web socket connection result.
   */
  connectionResult: WebsocketConnectionResult;
  [connectionResultValue]: WebsocketConnectionResult;
  [selectedIndex]: number;
  [selectedLog]: ViewWebsocketLog;

  constructor();

  /**
   * This function is called when the `connectionResult` change. It performs computations for the view
   * like size label computation so it won't be performed each time the view is rendered.
   */
  [processViewResult](value: WebsocketConnectionResult): void;

  [logItemKeydownHandler](e: KeyboardEvent): void;

  [logItemClickHandler](e: Event): void;

  /**
   * @param logs The logs of executed messages in the connection
   * @returns The template for list of log messages
   */
  [logsTemplate](logs: ViewWebsocketLog[]): TemplateResult;

  [logsTableHeader](): TemplateResult;

  /**
   * @param log The log to render
   * @param index Index of the element in the array.
   * @returns The template for a single log message
   */
  [logTemplate](log: ViewWebsocketLog, index: number): TemplateResult;

  /**
   * @param log The log to render
   * @returns The template for the selected log preview
   */
  [selectedTemplate](log: WebsocketLog): TemplateResult;
}
