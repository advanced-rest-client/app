/* eslint-disable class-methods-use-this */
import { LitElement, html } from 'lit-element';
import {classMap} from 'lit-html/directives/class-map.js';
import {styleMap} from 'lit-html/directives/style-map.js';
import { EventsTargetMixin, ResizableMixin } from '@anypoint-web-components/awc';
import { ArcModelEvents, ExportEvents, TelemetryEvents, TransportEventTypes } from '@advanced-rest-client/events';
import '@anypoint-web-components/awc/bottom-sheet.js';
import '@advanced-rest-client/icons/arc-icon.js';
import elementStyles from './styles/Panel.js';
import '../../../define/export-options.js';
import '../../../define/arc-websocket-editor.js';
import '../../../define/arc-websocket-logs.js';

/** @typedef {import('lit-element').TemplateResult} TemplateResult */
/** @typedef {import('@advanced-rest-client/events').WebSocket.WebsocketEditorRequest} WebsocketEditorRequest */
/** @typedef {import('@advanced-rest-client/events').WebSocket.WebsocketRequest} WebsocketRequest */
/** @typedef {import('@advanced-rest-client/events').WebSocket.WebsocketConnectionResult} WebsocketConnectionResult */
/** @typedef {import('@advanced-rest-client/events').WebSocket.WebsocketLog} WebsocketLog */
/** @typedef {import('@advanced-rest-client/events').DataExport.ProviderOptions} ProviderOptions */
/** @typedef {import('@advanced-rest-client/events').DataExport.ExportOptions} ExportOptions */
/** @typedef {import('@advanced-rest-client/events').DataExport.ArcNativeDataExport} ArcNativeDataExport */
/** @typedef {import('@advanced-rest-client/events').WebsocketRequestEvent} WebsocketRequestEvent */
/** @typedef {import('./ArcWebsocketEditorElement').default} ArcWebsocketEditorElement */

export const boundEventsValue = Symbol('boundEventsValue');
export const notifyChange = Symbol('notifyChange');
export const sheetClosedHandler = Symbol('notifyChange');
export const acceptExportOptions = Symbol('acceptExportOptions');
export const cancelExportOptions = Symbol('cancelExportOptions');
export const exportRequestHandler = Symbol('exportRequestHandler');
export const resizerMouseDown = Symbol('resizerMouseDown');
export const isResizing = Symbol('isResizing');
export const boxSize = Symbol('boxSize');
export const resizerMouseUp = Symbol('resizerMouseUp');
export const resizerMouseMove = Symbol('resizerMouseMove');
export const requestEditorTemplate = Symbol('requestEditorTemplate');
export const loaderTemplate = Symbol('loaderTemplate');
export const resizeTemplate = Symbol('resizeTemplate');
export const responseTemplate = Symbol('responseTemplate');
export const exportTemplate = Symbol('exportTemplate');
export const connectedValue = Symbol('connectedValue');
export const requestChangeHandler = Symbol('requestChangeHandler');
export const connectionValue = Symbol('connectionValue');
export const connect = Symbol('connect');
export const connectHandler = Symbol('connectHandler');
export const disconnectHandler = Symbol('disconnectHandler');
export const sendHandler = Symbol('sendHandler');
export const connectionOpened = Symbol('connectionOpened');
export const connectionClosed = Symbol('connectionClosed');
export const connectionMessage = Symbol('connectionMessage');
export const connectionError = Symbol('connectionError');
export const createConnectionResult = Symbol('createConnectionResult');
export const appendMessage = Symbol('appendMessage');
export const resultClearHandler = Symbol('resultClearHandler');

const EventsCategory = 'Web socket panel';

export default class ArcWebsocketPanelElement extends ResizableMixin(EventsTargetMixin(LitElement)) {
  static get styles() {
    return [elementStyles];
  }

  static get properties() {
    return { 
      /** 
       * The ARC request object
       */
      editorRequest: { type: Object },
      /** 
       * The connection result log
       */
      result: { type: Object },
      /**
       * Computed value. If true then the request is loading.
       * This resets each time the request status changes.
       */
      loading: { type: Boolean },
      /**
       * Enables Anypoint theme
       */
      anypoint: { type: Boolean },
      /**
       * Enables material's outlined theme for inputs.
       */
      outlined: { type: Boolean },
      /**
       * Indicates that the export options panel is currently rendered.
       */
      exportOptionsOpened: { type: Boolean },
      /**
       * When set it sets `eventsTarget` to itself and all editor event
       * listeners starts listening on this node.
       * This prohibits editors from getting data from the outside ot this
       * component.
       */
      boundEvents: { type: Boolean },
      /** 
       * This value is set after resizing the panels in the UI. Once set it removes 
       * flex value from the editor and sets its height to this value.
       */
      editorHeight: { type: Number },
    };
  }

  get boundEvents() {
    return this[boundEventsValue];
  }

  set boundEvents(value) {
    const old = this[boundEventsValue];
    /* istanbul ignore if */
    if (old === value) {
      return;
    }
    this[boundEventsValue] = value;
    if (value) {
      this.eventsTarget = this;
    } else {
      this.eventsTarget = window;
    }
  }

  /**
   * @return {ArcWebsocketEditorElement} Reference to ArcWebsocketEditorElement element.
   */
  get editor() {
    return this.shadowRoot.querySelector('arc-websocket-editor');
  }

  /**
   * @returns {boolean} True when the connection is made and it is possible to send a message.
   */
  get connected() {
    return this[connectedValue];
  }

  constructor() {
    super();
    /**
     * @type {WebsocketEditorRequest}
     */
    this.editorRequest = {
      id: undefined,
      request: {
        kind: 'ARC#WebsocketRequest',
        url: '',
      },
    };
    this.loading = false;
    this.anypoint = false;
    this.outlined = false;
    this.exportOptionsOpened = false;
    this[connectedValue] = false;
    /** 
     * @type {number|undefined}
     */
    this.editorHeight = undefined;
    /**
     * @type {WebsocketConnectionResult}
     */
    this.result = undefined;

    this[resizerMouseMove] = this[resizerMouseMove].bind(this);
    this[resizerMouseUp] = this[resizerMouseUp].bind(this);
    this[connectHandler] = this[connectHandler].bind(this);
    this[disconnectHandler] = this[disconnectHandler].bind(this);
    this[sendHandler] = this[sendHandler].bind(this);
    this[connectionOpened] = this[connectionOpened].bind(this);
    this[connectionClosed] = this[connectionClosed].bind(this);
    this[connectionMessage] = this[connectionMessage].bind(this);
    this[connectionError] = this[connectionError].bind(this);
  }

  /**
   * @param {EventTarget} node
   */
  _attachListeners(node) {
    super._attachListeners(node);
    this.addEventListener('mousemove', this[resizerMouseMove]);
    window.addEventListener('mouseup', this[resizerMouseUp]);
    this.addEventListener(TransportEventTypes.connectionSend, this[sendHandler]);
    this.addEventListener(TransportEventTypes.connect, this[connectHandler]);
    this.addEventListener(TransportEventTypes.disconnect, this[disconnectHandler]);
  }

  /**
   * @param {EventTarget} node
   */
  _detachListeners(node) {
    super._detachListeners(node);
    this.removeEventListener('mousemove', this[resizerMouseMove]);
    window.removeEventListener('mouseup', this[resizerMouseUp]);
    this.removeEventListener(TransportEventTypes.connectionSend, this[sendHandler]);
    this.removeEventListener(TransportEventTypes.connect, this[connectHandler]);
    this.removeEventListener(TransportEventTypes.disconnect, this[disconnectHandler]);
  }

  /**
   * Sends the data from the editor.
   */
  send() {
    this.editor.send();
  }

  /**
   * Initializes the connection.
   */
  connect() {
    this.editor.connect();
  }

  /**
   * Closes the connection.
   */
  disconnect() {
    this.editor.disconnect();
  }

  /**
   * Calls `reset()` method of the editor
   */
  clear() {
    this.editor.reset();
  }

  [notifyChange]() {
    this.dispatchEvent(new Event('change'));
  }

  /**
   * A handler for the request property change in the request editor. It updates the `editorRequest` property.
   * @param {Event} e
   */
  [requestChangeHandler](e) {
    const editor = /** @type ArcWebsocketEditorElement */ (e.target);
    const { request } = this.editorRequest;
    const serialized = editor.serialize();
    const newRequest = { ...request, ...serialized.request };
    serialized.request = newRequest;
    this.editorRequest = serialized;
    this[notifyChange]();
  }

  [sheetClosedHandler](e) {
    const prop = e.target.dataset.openProperty;
    this[prop] = e.detail.value;
  }

  /**
   * Handler for `accept` event dispatched by export options element.
   * @param {CustomEvent} e
   * @return {Promise<void>}
   */
  async [acceptExportOptions](e) {
    this.exportOptionsOpened = false;
    const { detail } = e;
    const provider = /** @type ProviderOptions */ (detail.providerOptions);
    const options = /** @type ExportOptions */ (detail.exportOptions);
    
    options.kind = 'ARC#AllDataExport';
    const data = /** @type ArcNativeDataExport */ ({
      websockets: [this.editorRequest.request],
    });
    this.errorMessage = undefined;
    try {
      const result = await ExportEvents.nativeData(this, data, options, provider);
      if (!result) {
        throw new Error('Web socket: Export module not found');
      }
      // if (detail.options.provider === 'drive') {
      //   // TODO: Render link to the folder
      //   this.shadowRoot.querySelector('#driveSaved').opened = true;
      // }
    } catch (err) {
      // this[handleException](e.message);
      TelemetryEvents.exception(this, err.message, false);
    }
    TelemetryEvents.event(this, {
      category: EventsCategory,
      action: 'export',
      label: options.provider,
    });
  }

  [cancelExportOptions]() {
    this.exportOptionsOpened = false;
    TelemetryEvents.event(this, {
      category: EventsCategory,
      action: 'cancel-export',
    });
  }

  [exportRequestHandler]() {
    this.exportOptionsOpened = true;
  }

  /**
   * @param {MouseEvent} e
   */
  [resizerMouseDown](e) {
    this[isResizing] = true;
    this[boxSize] = this.getBoundingClientRect();
    e.preventDefault();
    this.requestUpdate();
  }

  /**
   * @param {MouseEvent} e
   */
  [resizerMouseUp](e) {
    if (!this[isResizing]) {
      return;
    }
    this[isResizing] = false;
    this[boxSize] = undefined;
    e.preventDefault();
    this.requestUpdate();
  }

  /**
   * @param {MouseEvent} e
   */
  [resizerMouseMove](e) {
    if (!this[isResizing]) {
      return;
    }
    const { pageY } = e;
    const { top, height } = this[boxSize];
    const relativeTop = pageY - top;
    if (relativeTop < 100) {
      return;
    }
    if (relativeTop > height - 100) {
      return;
    }
    this.editorHeight = relativeTop;
  }

  /**
   * @param {WebsocketRequestEvent} e
   */
  [sendHandler](e) {
    if (!this.connected) {
      return;
    }
    const { request } = e.detail;
    const body = /** @type string|Blob|ArrayBuffer */ (request.payload);
    this[connectionValue].send(body);
    this[appendMessage]('out', body);
    this.dispatchEvent(new Event('sent'));
  }

  /**
   * @param {WebsocketRequestEvent} e`
   */
  [connectHandler](e) {
    const { request } = e.detail;
    this.loading = true;
    try {
      this[connect](request.url);
      ArcModelEvents.WSUrlHistory.insert(this, request.url);
    } catch (cause) {
      this.loading = false;
    }
  }

  [disconnectHandler]() {
    if (!this[connectionValue] || this[connectionValue].readyState === WebSocket.CLOSED || this[connectionValue].readyState === WebSocket.CLOSING) {
      return;
    }
    this[connectionValue].close();
  }

  /**
   * @param {string} url
   */
  [connect](url) {
    const socket = new WebSocket(url);
    socket.addEventListener('open', this[connectionOpened]);
    socket.addEventListener('close', this[connectionClosed]);
    socket.addEventListener('message', this[connectionMessage]);
    socket.addEventListener('error', this[connectionError]);
    this[connectionValue] = socket;
  }

  [connectionOpened]() {
    this[connectedValue] = true;
    this.loading = false;
    this[createConnectionResult]();
    this.requestUpdate();
    this.dispatchEvent(new Event('connected'));
  }

  [connectionClosed]() {
    this.loading = false;
    this[connectedValue] = false;
    const socket = this[connectionValue];
    if (!socket) {
      this.requestUpdate();
      return;
    }
    socket.removeEventListener('open', this[connectionOpened]);
    socket.removeEventListener('close', this[connectionClosed]);
    socket.removeEventListener('message', this[connectionMessage]);
    socket.removeEventListener('error', this[connectionError]);
    this[connectionValue] = undefined;
    this.requestUpdate();
    if (this.result) {
      this.result.closed = Date.now();
    }
    this[notifyChange]();
    this.dispatchEvent(new Event('disconnected'));
  }

  /**
   * @param {MessageEvent} e
   */
  [connectionMessage](e) {
    this[appendMessage]('in', e.data);
    this.dispatchEvent(new Event('message'));
  }

  [connectionError]() {
    this.loading = false;
    this[connectedValue] = false;
    if (this.result) {
      this.result.closed = Date.now();
    }
    this[connectionValue].close();
    this.requestUpdate();
    this[notifyChange]();
    this.dispatchEvent(new Event('disconnected'));
  }

  [createConnectionResult]() {
    this.result = /** @type WebsocketConnectionResult */ ({
      created: Date.now(),
      logs: [],
      size: 0,
    });
    this[notifyChange]();
  }

  /**
   * Appends a message to the current result.
   * @param {'in'|'out'} dir
   * @param {string | Blob | File | ArrayBuffer} message
   */
  [appendMessage](dir, message) {
    let size = 0;
    if (message instanceof Blob) {
      size = message.size;
    } else if (typeof message === 'string') {
      size = message.length;
    } else if (message.byteLength) {
      size = message.byteLength;
    }
    const now = Date.now();
    const log = /** @type WebsocketLog */ ({
      created: now,
      direction: dir,
      message,
      size,
    });
    this.result.logs.push(log);
    this.result.size += size;
    this.result.updated = now;
    this.requestUpdate();
    this[notifyChange]();
  }

  [resultClearHandler]() {
    if (this.connected) {
      this.result.size = 0;
      this.result.logs = [];
      this.result.updated = Date.now();
    } else {
      this.result = undefined;
    }
    this.requestUpdate();
    this[notifyChange]();
  }

  render() {
    return html`
    ${this[requestEditorTemplate]()}
    ${this[loaderTemplate]()}
    ${this[resizeTemplate]()}
    ${this[responseTemplate]()}
    ${this[exportTemplate]()}
    `;
  }

  /**
   * @returns {TemplateResult} The template for the request editor view
   */
  [requestEditorTemplate]() {
    const { anypoint, connected, loading, editorHeight } = this;
    const editorRequest = /** @type WebsocketEditorRequest */ (this.editorRequest || {});
    const { id } = editorRequest;
    const request = /** @type WebsocketRequest */ (editorRequest.request || {});
    const { url, ui } = request;
    const body = /** @type string | Blob | File | ArrayBuffer */ request.payload;

    const hasHeight = typeof editorHeight === 'number';
    const classes = {
      panel: true,
      'no-flex': hasHeight,
    };
    const styles = {
      height: ``,
    };
    if (hasHeight) {
      styles.height = `${editorHeight}px`;
    }

    return html`
    <arc-websocket-editor
      ?anypoint="${anypoint}"
      .eventsTarget="${this.eventsTarget}"
      .requestId="${id}"
      .url="${url}"
      .uiConfig="${ui}"
      .payload="${body}"
      .connected="${connected}"
      .connecting="${loading}"
      class="${classMap(classes)}"
      style="${styleMap(styles)}"
      @change="${this[requestChangeHandler]}"
    ></arc-websocket-editor>
    `;
  }

  /**
   * @returns {TemplateResult} The template for the response view
   */
  [responseTemplate]() {
    const classes = {
      panel: true,
      'scrolling-region': this.classList.contains('stacked'),
    };
    return html`
    <arc-websocket-logs 
      class="${classMap(classes)}"
      .connectionResult="${this.result}"
      types="response"
      @clear="${this[resultClearHandler]}"
    ></arc-websocket-logs>
    `;
  }

  /**
   * @returns {TemplateResult|string} The template for the request loader
   */
  [loaderTemplate]() {
    if (!this.loading) {
      return '';
    }
    return html`
    <progress class="loading-progress"></progress>
    `;
  }

  [resizeTemplate]() {
    const active = this[isResizing];
    const classes = {
      'resize-handler': true,
      active,
    };
    return html`
    <div class="resize-handler-container">
      <div class="${classMap(classes)}">
        <arc-icon class="resize-drag" icon="dragHandle" @mousedown="${this[resizerMouseDown]}"></arc-icon>
      </div>
    </div>
    `;
  }

  [exportTemplate]() {
    const { anypoint, outlined, exportOptionsOpened } = this;
    return html`
    <bottom-sheet
      class="bottom-sheet-container"
      .opened="${exportOptionsOpened}"
      data-open-property="exportOptionsOpened"
      @closed="${this[sheetClosedHandler]}"
    >
      <export-options
        id="exportOptions"
        ?anypoint="${anypoint}"
        ?outlined="${outlined}"
        withEncrypt
        file="arc-websocket.json"
        provider="file"
        @accept="${this[acceptExportOptions]}"
        @cancel="${this[cancelExportOptions]}"
      ></export-options>
    </bottom-sheet>`;
  }
}
