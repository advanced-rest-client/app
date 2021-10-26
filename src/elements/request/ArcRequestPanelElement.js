/* eslint-disable class-methods-use-this */
import { LitElement, html } from 'lit-element';
import { classMap } from 'lit-html/directives/class-map.js';
import { styleMap } from 'lit-html/directives/style-map.js';
import { EventsTargetMixin, ResizableMixin } from '@anypoint-web-components/awc';
import { ExportEvents, TelemetryEvents, TransportEventTypes, ArcModelEvents, ArcModelEventTypes } from '@advanced-rest-client/events';
import '@anypoint-web-components/awc/bottom-sheet.js';
import '@advanced-rest-client/icons/arc-icon.js';
import { HarTransformer } from '../../lib/har/HarTransformer.js';
import '../../../define/response-view.js';
import '../../../define/export-options.js';
import elementStyles from './styles/Panel.js';
import '../../../define/arc-request-editor.js';
import '../../../define/request-meta-details.js';
import '../../../define/request-meta-editor.js';

/** @typedef {import('@advanced-rest-client/events').ArcRequest.ArcEditorRequest} ArcEditorRequest */
/** @typedef {import('@advanced-rest-client/events').ArcRequest.TransportRequest} TransportRequest */
/** @typedef {import('@advanced-rest-client/events').ArcRequest.ArcBaseRequest} ArcBaseRequest */
/** @typedef {import('@advanced-rest-client/events').ArcRequest.ARCSavedRequest} ARCSavedRequest */
/** @typedef {import('@advanced-rest-client/events').ArcResponse.Response} ArcResponse */
/** @typedef {import('@advanced-rest-client/events').ArcResponse.ErrorResponse} ErrorResponse */
/** @typedef {import('@advanced-rest-client/events').DataExport.ArcNativeDataExport} ArcNativeDataExport */
/** @typedef {import('@advanced-rest-client/events').ApiRequestEvent} ApiRequestEvent */
/** @typedef {import('@advanced-rest-client/events').ApiResponseEvent} ApiResponseEvent */
/** @typedef {import('@advanced-rest-client/events').ARCRequestDeletedEvent} ARCRequestDeletedEvent */
/** @typedef {import('../http/ResponseViewElement').default} ResponseViewElement */
/** @typedef {import('lit-element').TemplateResult} TemplateResult */
/** @typedef {import('@advanced-rest-client/events').DataExport.ProviderOptions} ProviderOptions */
/** @typedef {import('@advanced-rest-client/events').DataExport.ExportOptions} ExportOptions */
/** @typedef {import('./ArcRequestEditorElement').default} ArcRequestEditorElement */
/** @typedef {import('./RequestMetaEditorElement').default} RequestMetaEditorElement */

export const requestEditorTemplate = Symbol('requestEditorTemplate');
export const responseTemplate = Symbol('requestEditorTemplate');
export const loaderTemplate = Symbol('loaderTemplate');
export const resizeTemplate = Symbol('resizeTemplate');
export const requestTransportHandler = Symbol('requestTransportHandler');
export const responseTransportHandler = Symbol('responseTransportHandler');
export const responseClearHandler = Symbol('responseClearHandler');
export const requestChangeHandler = Symbol('requestChangeHandler');
export const requestClearHandler = Symbol('requestClearHandler');
export const selectedResponsePanelHandler = Symbol('selectedResponsePanelHandler');
export const activeResponsePanelsHandler = Symbol('activeResponsePanelsHandler');
export const keydownHandler = Symbol('keydownHandler');
export const notifyChange = Symbol('notifyChange');
export const exportTemplate = Symbol('exportTemplate');
export const sheetClosedHandler = Symbol('sheetClosedHandler');
export const acceptExportOptions = Symbol('acceptExportOptions');
export const cancelExportOptions = Symbol('cancelExportOptions');
export const exportRequestHandler = Symbol('exportRequestHandler');
export const requestDetailTemplate = Symbol('requestDetailTemplate');
export const detailRequestHandler = Symbol('detailRequestHandler');
export const requestMetaTemplate = Symbol('requestMetaTemplate');
export const metaRequestHandler = Symbol('metaRequestHandler');
export const requestDeletedHandler = Symbol('requestDeletedHandler');
export const requestMetaCloseHandler = Symbol('requestMetaCloseHandler');
export const metaUpdateHandler = Symbol('metaUpdateHandler');
export const storeRequestHandler = Symbol('storeRequestHandler');
export const storeAsRequestHandler = Symbol('storeAsRequestHandler');
export const storeRequestHarHandler = Symbol('storeRequestHarHandler');
export const boundEventsValue = Symbol('boundEventsValue');
export const retargetEvent = Symbol('retargetEvent');
export const transportStatusHandler = Symbol('transportStatusHandler');
export const resizerMouseDown = Symbol('resizerMouseDown');
export const resizerMouseUp = Symbol('resizerMouseUp');
export const resizerMouseMove = Symbol('resizerMouseMove');
export const isResizing = Symbol('isResizing');
export const boxSize = Symbol('boxSize');
export const innerAbortHandler = Symbol('innerAbortHandler');

/** 
 * @type {string[]}
 */
const defaultResponsePanels = ['response'];
const defaultSelectedResponsePanel = 'response';

export default class ArcRequestPanelElement extends EventsTargetMixin(ResizableMixin(LitElement)) {
  static get styles() {
    return elementStyles;
  }

  static get properties() {
    return { 
      /** 
       * The ARC request object
       */
      editorRequest: { type: Object },
      /**
       * Computed value. If true then the request is loading.
       * This resets each time the request status changes.
       */
      loading: { type: Boolean },
      /**
       * Redirect URL for the OAuth2 authorization.
       * If can be also set by dispatching `oauth2-redirect-url-changed`
       * with `value` property on the `detail` object.
       */
      oauth2RedirectUri: { type: String },
      /**
       * When set it will ignore all `content-*` headers when the request method
       * is either `GET` or `HEAD`.
       * When not set or `false` it renders warning dialog.
       */
      ignoreContentOnGet: { type: Boolean },
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
       * Indicates that the request details is opened
       */
      requestDetailsOpened: { type: Boolean },

      /**
       * Indicates that the request meta editor is opened
       */
      requestMetaOpened: { type: Boolean },

      /**
       * When set it sets `eventsTarget` to itself and all editor event
       * listeners starts listening on this node.
       * This prohibits editors from getting data from the outside ot this
       * component.
       */
      boundEvents: { type: Boolean },
      /** 
       * When set it renders the send request button on the request editor
       */
      renderSend: { type: Boolean },
      /** 
       * Whether to render the request progress status in the request panel.
       * This works with the events dispatched by the transport library. Custom libraries may not support this.
       */
      progressInfo: { type: Boolean },
      /** 
       * When `progressInfo` is set this is the message to render in the status field.
       */
      progressMessage: { type: String },
      /** 
       * When set the request editor does not allow to send the request if one is already loading.
       */
      noSendOnLoading: { type: Boolean },

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
   * @return {ArcRequestEditorElement} Reference to ArcRequestEditorElement element.
   */
  get editor() {
    return this.shadowRoot.querySelector('arc-request-editor');
  }

  constructor() {
    super();
    /**
     * @type {ArcEditorRequest}
     */
    this.editorRequest = {
      id: undefined,
      request: {
        url: '',
        method: 'GET',
      },
    };
    this.loading = false;
    this.ignoreContentOnGet = false;
    this.anypoint = false;
    this.outlined = false;
    this.requestDetailsOpened = false;
    this.requestMetaOpened = false;
    /**
     * @type {string}
     */
    this.oauth2RedirectUri = undefined;
    this.renderSend = false;
    this.progressInfo = false;
    this.progressMessage = '';
    this.noSendOnLoading = false;
    /** 
     * @type {number|undefined}
     */
    this.editorHeight = undefined;
    
    this[requestTransportHandler] = this[requestTransportHandler].bind(this);
    this[responseTransportHandler] = this[responseTransportHandler].bind(this);
    this[keydownHandler] = this[keydownHandler].bind(this);
    this[requestDeletedHandler] = this[requestDeletedHandler].bind(this);
    this[transportStatusHandler] = this[transportStatusHandler].bind(this);
    this[resizerMouseMove] = this[resizerMouseMove].bind(this);
    this[resizerMouseUp] = this[resizerMouseUp].bind(this);
    this[innerAbortHandler] = this[innerAbortHandler].bind(this);
  }

  /**
   * @param {EventTarget} node
   */
  _attachListeners(node) {
    super._attachListeners(node);
    window.addEventListener(TransportEventTypes.request, this[requestTransportHandler]);
    window.addEventListener(TransportEventTypes.response, this[responseTransportHandler]);
    window.addEventListener(ArcModelEventTypes.Request.State.delete, this[requestDeletedHandler]);
    this.addEventListener('keydown', this[keydownHandler]);
    this.addEventListener('mousemove', this[resizerMouseMove]);
    window.addEventListener('mouseup', this[resizerMouseUp]);
    window.addEventListener('requestloadstart', this[transportStatusHandler]);
    window.addEventListener('requestfirstbytereceived', this[transportStatusHandler]);
    window.addEventListener('requestloadend', this[transportStatusHandler]);
    window.addEventListener('beforeredirect', this[transportStatusHandler]);
    window.addEventListener('headersreceived', this[transportStatusHandler]);
    this.addEventListener(TransportEventTypes.abort, this[innerAbortHandler]);
  }

  /**
   * @param {EventTarget} node
   */
  _detachListeners(node) {
    super._detachListeners(node);
    window.removeEventListener(TransportEventTypes.request, this[requestTransportHandler]);
    window.removeEventListener(TransportEventTypes.response, this[responseTransportHandler]);
    window.removeEventListener(ArcModelEventTypes.Request.State.delete, this[requestDeletedHandler]);
    this.removeEventListener('keydown', this[keydownHandler]);
    this.removeEventListener('mousemove', this[resizerMouseMove]);
    window.removeEventListener('mouseup', this[resizerMouseUp]);
    window.removeEventListener('requestloadstart', this[transportStatusHandler]);
    window.removeEventListener('requestfirstbytereceived', this[transportStatusHandler]);
    window.removeEventListener('requestloadend', this[transportStatusHandler]);
    window.removeEventListener('beforeredirect', this[transportStatusHandler]);
    window.removeEventListener('headersreceived', this[transportStatusHandler]);
    this.removeEventListener(TransportEventTypes.abort, this[innerAbortHandler]);
  }

  /**
   * Runs current request.
   * Note, it does not validate the state of the request.
   */
  send() {
    this.editor.send();
  }

  /**
   * Calls abort on the request editor.
   */
  abort() {
    this.editor.abort();
    this.loading = false;
    this.progressMessage = '';
  }

  /**
   * Calls `reset()` method of the editor
   */
  clear() {
    this.editor.reset();
  }

  /**
   * A handler for the abort event dispatched by the editor. Clears the `loading` flag.
   */
  [innerAbortHandler]() {
    this.loading = false;
  }

  /**
   * @param {KeyboardEvent} e
   */
  [keydownHandler](e) {
    if (this.loading && e.code === 'Escape') {
      this.abort();
    } else if (!this.loading && e.code === 'Enter' && (e.ctrlKey || e.metaKey)) {
      // @ts-ignore
      const isBody = e.composedPath().some((element) => element.localName === 'body-editor');
      if (!isBody) {
        this.send();
      }
    }
  }

  [notifyChange]() {
    this.dispatchEvent(new CustomEvent('change'));
  }

  /**
   * @param {ARCRequestDeletedEvent} e
   */
  [requestDeletedHandler](e) {
    const { id } = e;
    const { editorRequest } = this;
    const typed = /** @type ARCSavedRequest */ (editorRequest.request);
    if (typed._id !== id) {
      return;
    }
    const copy = { ...typed };
    delete copy._id;
    delete copy._rev;
    this.editorRequest.request = copy;
    this.requestUpdate();
    this[notifyChange]();
  }

  /**
   * A handler for the request being executed. If the request id corresponds to this requests id then it sets the `loading` property to `true`
   * A request transport event may not be initialized from within the request editor (from actions or modules, for example) so this listens on
   * all events.
   * 
   * @param {ApiRequestEvent} e
   */
  [requestTransportHandler](e) {
    const { id } = e.detail;
    const { editorRequest } = this;
    if (!editorRequest || editorRequest.id !== id) {
      return;
    }
    this.loading = true;
    this.progressMessage = 'Preparing the request...';
  }

  /**
   * A handler for the api response event dispatched by the request engine.
   * @param {ApiResponseEvent} e
   */
  [responseTransportHandler](e) {
    const { id, response, request } = e.detail;
    const { editorRequest } = this;
    if (!editorRequest || editorRequest.id !== id) {
      return;
    }
    editorRequest.request.transportRequest = request;
    editorRequest.request.response = response;
    this.loading = false;
    this.progressMessage = '';
    this.requestUpdate();
    this[notifyChange]();
  }

  [responseClearHandler]() {
    this.editorRequest.request.transportRequest = undefined;
    this.editorRequest.request.response = undefined;
    this.requestUpdate();
    this[notifyChange]();
  }

  /**
   * A handler for the request property change in the request editor. It updates the `editorRequest` property.
   * @param {Event} e
   */
  [requestChangeHandler](e) {
    const editor = /** @type ArcRequestEditorElement */ (e.target);
    const { request } = this.editorRequest;
    const serialized = editor.serialize();
    const newRequest = { ...request, ...serialized.request };
    serialized.request = newRequest;
    this.editorRequest = serialized;
    this[notifyChange]();
  }

  /**
   * A handler for the clear event dispatched by the editor.
   * Unlike the change handler it completely overrides the request.
   * @param {Event} e
   */
  [requestClearHandler](e) {
    const editor = /** @type ArcRequestEditorElement */ (e.target);
    this.editorRequest = editor.serialize();
    this[notifyChange]();
  }

  /**
   * @param {Event} e
   */
  [selectedResponsePanelHandler](e) {
    const panel = /** @type ResponseViewElement */ (e.target);
    const { selected } = panel;
    const { request } = this.editorRequest;
    if (!request.ui) {
      request.ui = {};
    }
    if (!request.ui.response) {
      request.ui.response = {};
    }
    request.ui.response.selectedPanel = selected;
    this[notifyChange]();
    // Keep this here: https://github.com/advanced-rest-client/arc-request-ui/issues/3
    this.requestUpdate();
  }

  /**
   * @param {Event} e
   */
  [activeResponsePanelsHandler](e) {
    const panel = /** @type ResponseViewElement */ (e.target);
    const { active } = panel;
    const { request } = this.editorRequest;
    if (!request.ui) {
      request.ui = {};
    }
    if (!request.ui.response) {
      request.ui.response = {};
    }
    request.ui.response.activePanels = active;
    this[notifyChange]();
    // Keep this here: https://github.com/advanced-rest-client/arc-request-ui/issues/3
    this.requestUpdate();
  }

  [sheetClosedHandler](e) {
    const prop = e.target.dataset.openProperty;
    this[prop] = e.detail.value;
  }

  /**
   * Handler for `accept` event dispatched by export options element.
   * @param {CustomEvent} e
   * @return {Promise} Result of calling `[doExportItems]()`
   */
  async [acceptExportOptions](e) {
    this.exportOptionsOpened = false;
    const { detail } = e;
    const provider = /** @type ProviderOptions */ (detail.providerOptions);
    const options = /** @type ExportOptions */ (detail.exportOptions);
    
    options.kind = 'ARC#AllDataExport';
    const data = /** @type ArcNativeDataExport */ ({
      requests: [this.editorRequest.request],
    });
    this.errorMessage = undefined;
    try {
      const result = await ExportEvents.nativeData(this, data, options, provider);
      if (!result) {
        throw new Error('Request panel: Export module not found');
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
      category: 'Request panel',
      action: 'export',
      label: options.provider,
    });
  }

  [cancelExportOptions]() {
    this.exportOptionsOpened = false;
    TelemetryEvents.event(this, {
      category: 'Request panel',
      action: 'cancel-export',
    });
  }

  [exportRequestHandler]() {
    this.exportOptionsOpened = true;
  }

  [detailRequestHandler]() {
    this.requestDetailsOpened = true;
  }

  [metaRequestHandler]() {
    this.requestMetaOpened = true;
    this.requestDetailsOpened = false;
  }

  [requestMetaCloseHandler]() {
    this.requestMetaOpened = false;
  }

  /**
   * A handler for the "save" event dispatched by the editor.
   * Depending whether the current request is already stored or not it either
   * dispatches the event to store the request or opens meta editor.
   */
  [storeRequestHandler]() {
    this.saveAction();
  }

  /**
   * Initializes the save request flow.
   * If the request is already stored in the data store then it is automatically saved.
   * Otherwise a save dialog is rendered,
   */
  saveAction() {
    const { editorRequest } = this;
    const typed = /** @type ARCSavedRequest */ (editorRequest.request);
    if (!typed._id || !typed._rev || !typed.type || typed.type === 'history') {
      this.requestMetaOpened = true;
    } else {
      ArcModelEvents.Request.store(this, typed.type, typed);
    }
  }

  [storeAsRequestHandler]() {
    this.saveAsAction();
  }

  /**
   * Triggers the UI to save the current request as a new request, regardless of the current state.
   */
  saveAsAction() {
    this.requestMetaOpened = true;
    const editor = this.shadowRoot.querySelector('request-meta-editor');
    editor.saveAs = true;
  }

  [storeRequestHarHandler]() {
    this.saveRequestHar();
  }

  /**
   * Transforms the current request to a HAR object and saves it as file.
   */
  async saveRequestHar() {
    const { editorRequest } = this;
    const { request } = editorRequest;
    const transformer = new HarTransformer();
    const result = await transformer.transform([request]);
    const data = JSON.stringify(result);
    const name = /** @type ARCSavedRequest */ (request).name || 'arc-request';
    const file = `${name}.har`;
    ExportEvents.fileSave(this, data, {
      contentType: 'application/json',
      file,
    });
  }

  /**
   * Handler for the event dispatched by the meta editor indicating that the request has changed.
   * @param {CustomEvent} e
   */
  [metaUpdateHandler](e) {
    const editor = /** @type RequestMetaEditorElement */ (e.target);
    const updated = e.detail;
    if (editor.saveAs) {
      editor.saveAs = false;
    } else {
      this.editorRequest.request = updated;
    }
    this[notifyChange]();
    this.requestUpdate();
  }

  /**
   * Retargets the event to the parent.
   * @param {Event} e 
   */
  [retargetEvent](e) {
    this.dispatchEvent(new Event(e.type));
  }

  /**
   * The handler for the various transport events informing about the status.
   * @param {CustomEvent} e
   */
  [transportStatusHandler](e) {
    const { type, detail } = e;
    const { id } = detail;
    if (this.editorRequest.id !== id) {
      return;
    }
    let message;
    switch (type) {
      case 'requestloadstart': message = 'Sending the message...'; break;
      case 'headersreceived': message = 'Received headers...'; break;
      case 'requestfirstbytereceived': message = 'Receiving data...'; break;
      case 'requestloadend': message = 'Finishing response processing...'; break;
      case 'beforeredirect': message = 'Redirecting the request...'; break;
      default:
    }
    this.progressMessage = message;
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

  render() {
    return html`
    ${this[requestEditorTemplate]()}
    ${this[loaderTemplate]()}
    ${this[resizeTemplate]()}
    ${this[responseTemplate]()}
    ${this[exportTemplate]()}
    ${this[requestDetailTemplate]()}
    ${this[requestMetaTemplate]()}
    `;
  }

  /**
   * @returns {TemplateResult} The template for the request editor view
   */
  [requestEditorTemplate]() {
    const { anypoint, oauth2RedirectUri, loading, editorHeight } = this;
    const editorRequest = /** @type ArcEditorRequest */ (this.editorRequest || {});
    const { id } = editorRequest;
    const request = /** @type ARCSavedRequest */ (editorRequest.request || {});
    const { method, ui, url, actions, payload, authorization, config, headers, _id, type } = request;

    const hasHeight = typeof editorHeight === 'number';
    const classes = {
      panel: true,
      'no-flex': hasHeight,
    };

    const styles = {
      height: undefined,
    };
    if (hasHeight) {
      styles.height = `${editorHeight}px`;
    }

    return html`
    <arc-request-editor
      ?anypoint="${anypoint}"
      .eventsTarget="${this.eventsTarget}"
      .requestId="${id}"
      .url="${url}"
      .method="${method}"
      .headers="${headers}"
      .responseActions="${actions && actions.response}"
      .requestActions="${actions && actions.request}"
      .payload="${payload}"
      .authorization="${authorization}"
      .uiConfig="${ui}"
      .config="${config}"
      .oauth2RedirectUri="${oauth2RedirectUri}"
      .storedId="${_id}"
      .storedType="${type}"
      .loading="${loading}"
      ?renderSend="${this.renderSend}"
      ?noSendOnLoading="${this.noSendOnLoading}"
      class="${classMap(classes)}"
      style="${styleMap(styles)}"
      @change="${this[requestChangeHandler]}"
      @clear="${this[requestClearHandler]}"
      @export="${this[exportRequestHandler]}"
      @details="${this[detailRequestHandler]}"
      @save="${this[storeRequestHandler]}"
      @saveas="${this[storeAsRequestHandler]}"
      @savehar="${this[storeRequestHarHandler]}"
      @close="${this[retargetEvent]}"
      @duplicate="${this[retargetEvent]}"
    ></arc-request-editor>
    `;
  }

  /**
   * @returns {TemplateResult} The template for the response view
   */
  [responseTemplate]() {
    const editorRequest = /** @type ArcEditorRequest */ (this.editorRequest || {});
    const request = /** @type ARCSavedRequest */ (editorRequest.request || {});
    const { ui={}, response } = request;
    const classes = {
      panel: true,
      'scrolling-region': this.classList.contains('stacked'),
    };
    return html`
    <response-view
      .request="${request}"
      .response="${response}"
      .selected="${ui.response && ui.response.selectedPanel || defaultSelectedResponsePanel}"
      .active="${ui.response && ui.response.activePanels || defaultResponsePanels}"
      class="${classMap(classes)}"
      @clear="${this[responseClearHandler]}"
      @selectedchange="${this[selectedResponsePanelHandler]}"
      @activechange="${this[activeResponsePanelsHandler]}"
    ></response-view>
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
    ${this.progressInfo ? html`<div class="progress-info">${this.progressMessage}</div>` : ''}
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
      <div class="${classMap(classes)}" @mousedown="${this[resizerMouseDown]}">
        <arc-icon class="resize-drag" icon="dragHandle"></arc-icon>
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
        file="arc-request.json"
        provider="file"
        @accept="${this[acceptExportOptions]}"
        @cancel="${this[cancelExportOptions]}"
      ></export-options>
    </bottom-sheet>`;
  }

  [requestDetailTemplate]() {
    const { anypoint, requestDetailsOpened } = this;
    const editorRequest = /** @type ArcEditorRequest */ (this.editorRequest || {});
    const request = /** @type ARCSavedRequest */ (editorRequest.request || {});
    const typed = /** @type ARCSavedRequest */ (request);
    let type;
    if (requestDetailsOpened && typed._id) {
      type = typed.type;
    }
    return html`
    <bottom-sheet
      class="bottom-sheet-container"
      .opened="${requestDetailsOpened}"
      data-open-property="requestDetailsOpened"
      @closed="${this[sheetClosedHandler]}"
    >
      <request-meta-details
        ?anypoint="${anypoint}"
        .request="${typed}"
        .requestId="${typed._id}"
        .requestType="${type}"
        @edit="${this[metaRequestHandler]}"
      ></request-meta-details>
    </bottom-sheet>`;
  }

  [requestMetaTemplate]() {
    const { anypoint, requestMetaOpened } = this;
    const editorRequest = /** @type ArcEditorRequest */ (this.editorRequest || {});
    const request = /** @type ARCSavedRequest */ (editorRequest.request || {});
    const typed = /** @type ARCSavedRequest */ (request);
    let type;
    if (requestMetaOpened && typed._id) {
      type = typed.type;
    }
    return html`
    <bottom-sheet
      class="bottom-sheet-container"
      .opened="${requestMetaOpened}"
      data-open-property="requestMetaOpened"
      @closed="${this[sheetClosedHandler]}"
    >
      <request-meta-editor
        ?anypoint="${anypoint}"
        .request="${typed}"
        .requestId="${typed._id}"
        .requestType="${type}"
        @close="${this[requestMetaCloseHandler]}"
        @update="${this[metaUpdateHandler]}"
      ></request-meta-editor>
    </bottom-sheet>`;
  }
}
