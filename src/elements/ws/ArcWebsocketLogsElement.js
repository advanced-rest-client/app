/* eslint-disable class-methods-use-this */
import { html } from 'lit-element';
import { classMap } from 'lit-html/directives/class-map.js';
import { ExportEvents } from '@advanced-rest-client/events';
import '@anypoint-web-components/awc/anypoint-menu-button.js';
import '@anypoint-web-components/awc/anypoint-listbox.js';
import '@anypoint-web-components/awc/anypoint-icon-item.js';
import '@github/time-elements';
import elementStyles from './styles/ConnectionResult.js';
import ResponseViewElement from '../http/ResponseViewElement.js';
import { responseTemplate, responseSizeTemplate, responseOptionsTemplate, contentActionHandler, saveResponseFile } from '../http/internals.js';
import { bytesToSize } from '../http/Utils.js';
import '../../../define/response-body.js';

/** @typedef {import('lit-element').TemplateResult} TemplateResult */
/** @typedef {import('@advanced-rest-client/events').WebSocket.WebsocketEditorRequest} WebsocketEditorRequest */
/** @typedef {import('@advanced-rest-client/events').WebSocket.WebsocketRequest} WebsocketRequest */
/** @typedef {import('@advanced-rest-client/events').WebSocket.WebsocketConnectionResult} WebsocketConnectionResult */
/** @typedef {import('@advanced-rest-client/events').WebSocket.WebsocketLog} WebsocketLog */
/** @typedef {import('../../types').ViewConnectionResult} ViewConnectionResult */
/** @typedef {import('../../types').ViewWebsocketLog} ViewWebsocketLog */

export const connectionResultValue = Symbol('connectionResultValue');
export const logsTemplate = Symbol('logsTemplate');
export const logTemplate = Symbol('logTemplate');
export const logItemClickHandler = Symbol('logItemClickHandler');
export const selectedLog = Symbol('selectedLog');
export const selectedIndex = Symbol('selectedIndex');
export const selectedTemplate = Symbol('selectedTemplate');
export const logsTableHeader = Symbol('logsTableHeader');
export const logItemKeydownHandler = Symbol('logItemKeydownHandler');
export const processViewResult = Symbol('processViewResult');
export const viewModel = Symbol('viewModel');

/**
 * An element that renders results panel of the web socket connection.
 */
// @ts-ignore
export default class ArcWebsocketLogsElement extends ResponseViewElement {
  // @ts-ignore
  get styles() {
    return [
      elementStyles,
      super.styles,
    ];
  }

  /**
   * @returns {boolean} Tests whether the response is set
   */
  get hasResponse() {
    const value = this[viewModel];
    return !!value;
  }

  static get properties() {
    return { 
      /** 
       * The web socket connection result.
       */
      connectionResult: { type: Object },
    };
  }

  constructor() {
    super();
    /**
     * @type {WebsocketConnectionResult}
     */
    this.connectionResult = undefined;
  }

  get connectionResult() {
    return this[connectionResultValue];
  }

  /**
   * @param {WebsocketConnectionResult} value
   */
  set connectionResult(value) {
    // the panel passes a complex object and the element won't see this as a change.
    this[connectionResultValue] = value;
    this[processViewResult](value);
  }

  /**
   * This function is called when the `connectionResult` change. It performs computations for the view
   * like size label computation so it won't be performed each time the view is rendered.
   * @param {WebsocketConnectionResult} value
   */
  [processViewResult](value) {
    if (!value || !Array.isArray(value.logs) || !value.logs) {
      this[selectedIndex] = undefined;
      this[selectedLog] = undefined;
    }
    if (!value) {
      this[viewModel] = undefined;
      this.requestUpdate();
      return;
    }
    const totalSize = bytesToSize(value.size || 0);
    const result = /** @type ViewConnectionResult */ ({
      ...value,
      sizeLabel: totalSize,
    });
    result.logs = result.logs.map((item) => {
      const isBinary = typeof item.message !== 'string';
      const sizeLabel = bytesToSize(item.size || 0);
      const d = new Date(item.created);
      return {
        ...item,
        isBinary,
        sizeLabel,
        isoTime: d.toISOString(),
      }
    });
    this[viewModel] = result;
    this.requestUpdate();
  }

  /**
   * @param {KeyboardEvent} e
   */
  [logItemKeydownHandler](e) {
    if (e.code === 'Enter') {
      this[logItemClickHandler](e);
    }
  }

  /**
   * @param {Event} e
   */
  [logItemClickHandler](e) {
    const node = /** @type HTMLElement */ (e.currentTarget);
    const index = Number(node.dataset.index);
    if (this[selectedIndex] === index) {
      this[selectedIndex] = undefined;
      this[selectedLog] = undefined;
    } else {
      this[selectedIndex] = index;
      this[selectedLog] = this[viewModel].logs[index];
    }
    this.requestUpdate();
  }

  async [saveResponseFile]() {
    const { connectionResult } = this;
    if (!connectionResult) {
      return;
    }
    const file = 'websocket-logs.json';
    ExportEvents.fileSave(this, JSON.stringify(connectionResult, null, 2), {
      contentType: 'application/json',
      file,
    });
  }

  /**
   * @param {string} id The id of the panel
   * @param {boolean} opened Whether the panel is currently rendered in the view
   * @returns {TemplateResult|string} A template for the response visualization
   */
  [responseTemplate](id, opened) {
    const selected = this[selectedLog];
    return html`
    <div class="panel logs-panel" ?hidden="${!opened}" aria-hidden="${!opened ? 'true' : 'false'}" id="panel-${id}" aria-labelledby="panel-tab-${id}" role="tabpanel">
      <div class="response-meta">
          ${this[responseSizeTemplate]()}
          ${this[responseOptionsTemplate]()}
      </div>
      ${this[logsTemplate](this[viewModel].logs)}
      ${selected ? this[selectedTemplate](selected) : ''}
    </div>
    `;
  }

  /**
   * @returns {TemplateResult|string} Template for the response size
   */
  [responseSizeTemplate]() {
    const { size, sizeLabel } = this[viewModel];
    if (size === undefined) {
      return '';
    }
    return html`<span class="response-size-label">Size: ${sizeLabel}</span>`;
  }

  /**
   * @returns {TemplateResult} A template for response options drop down
   */
  [responseOptionsTemplate]() {
    return html`
    <anypoint-menu-button
      closeOnActivate
      @activate="${this[contentActionHandler]}"
      class="request-menu"
      ?anypoint="${this.anypoint}"
      horizontalAlign="right"
    >
      <anypoint-icon-button slot="dropdown-trigger" aria-label="Activate to see content options" ?anypoint="${this.anypoint}">
        <arc-icon icon="moreVert"></arc-icon>
      </anypoint-icon-button>
      <anypoint-listbox slot="dropdown-content" attrForSelected="data-id" ?anypoint="${this.anypoint}">
        <anypoint-icon-item data-id="save" ?anypoint="${this.anypoint}">
          <arc-icon icon="archive" slot="item-icon"></arc-icon> Save to file
        </anypoint-icon-item>
      </anypoint-listbox>
    </anypoint-menu-button>`;
  }

  /**
   * @param {ViewWebsocketLog[]} logs The logs of executed messages in the connection
   * @returns {TemplateResult} The template for list of log messages
   */
  [logsTemplate](logs) {
    return html`
    <div class="logs">
      <table aria-label="Connection logs">
        ${this[logsTableHeader]()}
        <tbody>
        ${Array.isArray(logs) && logs.length ? 
          logs.map((log, index) => this[logTemplate](log, index)) : 
          html`<tr><td colspan="3">Send a message to see the result</td></tr>`
        }
        </tbody>
      </table>
    </div>
    `;
  }

  [logsTableHeader]() {
    return html`
    <thead>
      <tr class="log-item header">
        <td class="message">Message</td>
        <td class="length">Size</td>
        <td class="time">Time</td>
      </tr>
    </thead>
    `;
  }

  /**
   * @param {ViewWebsocketLog} log The log to render
   * @param {number} index Index of the element in the array.
   * @returns {TemplateResult} The template for a single log message
   */
  [logTemplate](log, index) {
    const { direction, message, isoTime, sizeLabel } = log;
    const classes = {
      'log-item': true,
      selected: this[selectedIndex] === index,
    };
    return html`
    <tr class="${classMap(classes)}" @click="${this[logItemClickHandler]}" data-index="${index}" tabindex="0" @keydown="${this[logItemKeydownHandler]}">
      <td class="message">
        <span class="direction" data-direction="${direction}">${direction === 'in' ? '⇣' : '⇡'}</span>
        ${typeof message === 'string' ? message : 'Binary Message'}
      </td>
      <td class="length">${sizeLabel}</td>
      <td class="time">
        <relative-time datetime="${isoTime}"></relative-time> at
        <local-time datetime="${isoTime}" hour="numeric" minute="numeric" second="numeric"></local-time>
      </td>
    </tr>
    `;
  }

  /**
   * @param {WebsocketLog} log The log to render
   * @returns {TemplateResult} The template for the selected log preview
   */
  [selectedTemplate](log) {
    const body = /** @type {string | Buffer | ArrayBuffer} */ (log.message);
    return html`
    <response-body 
      active 
      .body="${body}"
      class="log-preview"
    ></response-body>
    `;
  }
}
