/* eslint-disable class-methods-use-this */
import { LitElement, html } from 'lit-element';
import {classMap} from 'lit-html/directives/class-map.js';
import {styleMap} from 'lit-html/directives/style-map.js';
import { ifDefined } from 'lit-html/directives/if-defined.js';
import { EventsTargetMixin, ResizableMixin } from '@anypoint-web-components/awc';
import { ArcModelEvents, RequestEventTypes, TransportEvents } from '@advanced-rest-client/events';
import { v4 } from '@advanced-rest-client/uuid';
import '@anypoint-web-components/awc/anypoint-tabs.js';
import '@anypoint-web-components/awc/anypoint-tab.js';
import '@anypoint-web-components/awc/anypoint-button.js';
import '@anypoint-web-components/awc/anypoint-icon-button.js';
import '@anypoint-web-components/awc/anypoint-input.js';
import '@anypoint-web-components/awc/anypoint-autocomplete.js';
import '@advanced-rest-client/icons/arc-icon.js';
import elementStyles from './styles/WebsocketEditor.js';
import { cancelEvent } from '../../lib/Utils.js';
import '../../../define/body-editor.js';

/** @typedef {import('lit-element').TemplateResult} TemplateResult */
/** @typedef {import('@anypoint-web-components/awc').AnypointAutocompleteElement} AnypointAutocomplete */
/** @typedef {import('../body/BodyEditorElement').default} BodyEditorElement */
/** @typedef {import('@advanced-rest-client/events').WebSocket.WebsocketEditorRequest} WebsocketEditorRequest */
/** @typedef {import('@advanced-rest-client/events').WebSocket.WebsocketRequest} WebsocketRequest */
/** @typedef {import('@advanced-rest-client/events').ArcResponse.TransformedPayload} TransformedPayload */

export const internalConnectHandler = Symbol('internalConnectHandler');
export const urlAreaTemplate = Symbol('urlAreaTemplate');
export const urlEditorTemplate = Symbol('urlEditorTemplate');
export const connectTemplate = Symbol('connectTemplate');
export const tabsTemplate = Symbol('tabsTemplate');
export const bodyTemplate = Symbol('bodyTemplate');
export const urlAutocompleteTemplate = Symbol('urlAutocompleteTemplate');
export const autocompleteResizeHandler = Symbol('autocompleteResizeHandler');
export const autocompleteRef = Symbol('autocompleteResizeHandler');
export const setShadowHeight = Symbol('setShadowHeight');
export const shadowContainerHeight = Symbol('shadowContainerHeight');
export const shadowContainerOpened = Symbol('shadowContainerOpened');
export const mainFocusBlurHandler = Symbol('mainFocusBlurHandler');
export const focusedValue = Symbol('focusedValue');
export const suggestionsOpenedHandler = Symbol('suggestionsOpenedHandler');
export const autocompleteOpened = Symbol('autocompleteOpened');
export const urlInputHandler = Symbol('urlInputHandler');
export const autocompleteQuery = Symbol('autocompleteQuery');
export const readAutocomplete = Symbol('readAutocomplete');
export const shadowTemplate = Symbol('shadowTemplate');
export const positionTargetValue = Symbol('positionTargetValue');
export const currentEditorTemplate = Symbol('currentEditorTemplate');
export const internalSendHandler = Symbol('internalSendHandler');
export const bodyChangeHandler = Symbol('bodyChangeHandler');
export const editorMimeHandler = Symbol('editorMimeHandler');
export const sendTemplate = Symbol('sendTemplate');
export const keydownHandler = Symbol('keydownHandler');

export default class ArcWebsocketEditorElement extends ResizableMixin(EventsTargetMixin(LitElement)) {
  static get styles() {
    return [elementStyles];
  }

  /**
   * @return {AnypointAutocomplete}
   */
  get [autocompleteRef]() {
    return this.shadowRoot.querySelector('anypoint-autocomplete');
  }

  static get properties() {
    return {
      /**
       * Current request URL
       */
      url: { type: String },
      /**
       * Generated request ID when the connection is being initiated. This value is reported
       * in send and abort events.
       * 
       * The `requestId` property is regenerated each time the `reset()` function is called.
       */
      requestId: { type: String, reflect: true },
      /**
       * When set the editor is in read only mode.
       */
      readOnly: { type: Boolean },
      /**
       * Enables Anypoint theme
       */
      anypoint: { type: Boolean },
      /**
       * Enables material's outlined theme for inputs.
       */
      outlined: { type: Boolean },
      /**
       * An index of currently opened tab.
       * @default 0
       */
      selectedTab: { type: Number },
      /** 
       * This is to be set to indicate that the connection has been made.
       * The internal logic does not alter this value. This is to reflect the state.
       */
      connected: { type: Boolean },
      /** 
       * This is to be set to indicate that the connection is being made.
       * The internal logic does not alter this value. This is to reflect the state.
       */
      connecting: { type: Boolean },
      /** 
       * Set upon calling `validate()`, when the request is invalid.
       */
      invalid: { type: Boolean, reflect: true },
      /** 
       * The current message to send.
       */
      payload: { type: String },
      /** 
       * The editors configuration meta data
       */
      uiConfig: { type: Object },
      /** 
       * The mime type of the body editor.
       */
      mimeType: { type: String },
    };
  }

  constructor() {
    super();
    this.reset();
    this.selectedTab = 0;
    this.connected = false;
    this.connecting = false;
    this.readOnly = false;
    this.anypoint = false;
    this.outlined = false;
    this[internalSendHandler] = this[internalSendHandler].bind(this);
    this[editorMimeHandler] = this[editorMimeHandler].bind(this);
    this[keydownHandler] = this[keydownHandler].bind(this);
  }

  /**
   * @param {EventTarget} node
   */
  _attachListeners(node) {
    super._attachListeners(node);
    this.addEventListener(RequestEventTypes.send, this[internalSendHandler]);
    this.addEventListener(RequestEventTypes.State.contentTypeChange, this[editorMimeHandler]);
    this.addEventListener('keydown', this[keydownHandler]);
  }

  /**
   * @param {EventTarget} node
   */
  _detachListeners(node) {
    super._attachListeners(node);
    this.removeEventListener(RequestEventTypes.send, this[internalSendHandler]);
    this.removeEventListener(RequestEventTypes.State.contentTypeChange, this[editorMimeHandler]);
    this.removeEventListener('keydown', this[keydownHandler]);
  }

  firstUpdated(args) {
    super.firstUpdated(args);
    this[positionTargetValue] = /** @type HTMLElement */ (this.shadowRoot.querySelector('.url-container'));
  }

  /**
   * @param {Event} e
   */
  [internalSendHandler](e) {
    e.stopPropagation();
    if (!this.connected && !this.connecting) {
      this.connect();
    } else {
      this.send();
    }
  }

  /**
   * @param {KeyboardEvent} e
   */
  [keydownHandler](e) {
    if (e.ctrlKey && e.code === 'Enter') {
      if (!this.connected && !this.connecting) {
        this.connect();
      } else {
        this.send();
      }
    }
  }

  /**
   * Resets the current state actively generating new request object
   */
  reset() {
    /**
     * @type {string}
     */
    this.mimeType = '';
    /**
     * @type {string}
     */
    this.url = '';
    /**
     * @type {string | Blob | File | ArrayBuffer | TransformedPayload}
     */
    this.payload = undefined;
    /**
     * @type {string}
     */
    this.requestId = v4();
  }

  /**
   * Serializes the request to the EditorRequest object with the `ArcBaseRequest` request on it.
   * @returns {WebsocketEditorRequest}
   */
  serialize() {
    const { requestId, url, payload, uiConfig } = this;
    const request = /** @type WebsocketRequest */ ({
      url,
      payload,
      ui: uiConfig,
    });
    const result = /** @type WebsocketEditorRequest */ ({
      id: requestId,
      request,
    });

    return result;
  }

  /**
   * @return {boolean} False when the request is invalid.
   */
  validate() {
    const { url } = this;
    let result = true;
    if (!url) {
      result = false;
    }
    if (result) {
      result = url.startsWith('ws:') || url.startsWith('wss:');
    }
    this.invalid = !result;
    return result;
  }

  /**
   * Dispatches an event with the request data to initialize the connection.
   */
  connect() {
    if (!this.validate()) {
      return;
    }
    const request = this.serialize();
    TransportEvents.connect(this, request);
  }

  /**
   * Dispatches an event to close the existing connection.
   * It does nothing when not connected.
   */
  disconnect() {
    if (!this.connected && !this.connecting) {
      return;
    }
    const request = this.serialize();
    TransportEvents.disconnect(this, request);
  }

  /**
   * Dispatches an event send the data with the current connection
   * It does nothing when not connected.
   */
  send() {
    if (!this.connected) {
      return;
    }
    const request = this.serialize();
    TransportEvents.connectionSend(this, request);
  }

  /**
   * Refreshes payload and headers editors
   * state (code mirror) if currently selected.
   */
  async refreshEditors() {
    await this.updateComplete;
    this.notifyResize();
    // this ensures that the workspace element receives the event
    this.dispatchEvent(new Event('resize', { bubbles: true, composed: true }));
  }

  /**
   * @param {Event} e
   */
  [internalConnectHandler](e) {
    e.stopPropagation();
    this.connect();
  }

  /**
   * Sets a height on the shadow background element.
   * @param {number} height
   */
  [setShadowHeight](height) {
    this[shadowContainerHeight] = height;
    this[shadowContainerOpened] = true;
    this.requestUpdate();
  }

  /**
   * @param {Event} e
   */
  [mainFocusBlurHandler](e) {
    this[focusedValue] = e.type === 'focus';
    this.requestUpdate();
  }

  /**
   * @param {CustomEvent} e
   */
  [suggestionsOpenedHandler](e) {
    const node = /** @type AnypointAutocomplete */ (e.target);
    const { opened } = node;
    if (this[autocompleteOpened] !== opened) {
      this[autocompleteOpened] = opened;
      this.requestUpdate();
    }
    if (!opened) {
      this[shadowContainerOpened] = false;
      this[shadowContainerHeight] = 0;
      this.requestUpdate();
    } else {
      this[autocompleteResizeHandler]();
    }
  }

  [autocompleteResizeHandler]() {
    const ac = this[autocompleteRef].querySelector('anypoint-dropdown');
    const rect = ac.getBoundingClientRect();
    if (!rect.height) {
      return;
    }
    this[setShadowHeight](rect.height);
  }

  /**
   * @param {Event} e A handler for either main input or the details editor value change
   */
  [urlInputHandler](e) {
    if (this.readOnly) {
      return;
    }
    const node = /** @type HTMLInputElement */ (e.target);
    this.url = node.value;
    this.validate();
    this.notifyChanged();
  }

  /**
   * Handler for autocomplete element query event.
   * Dispatches `url-history-query` to query history model for data.
   * @param {CustomEvent} e
   * @return {Promise<void>}
   */
  async [autocompleteQuery](e) {
    e.preventDefault();
    e.stopPropagation();
    const { value } = e.detail;
    await this[readAutocomplete](value);
  }

  /**
   * Queries the data model for history data and sets the suggestions
   * @param {string} q User query from the input field
   * @return {Promise<void>}
   */
  async [readAutocomplete](q) {
    const ac = this[autocompleteRef];
    try {
      const result = await ArcModelEvents.WSUrlHistory.query(this, q);
      const suggestions = (result || []).map((item) => item.url);
      ac.source = suggestions;
      ac._filterSuggestions();
    } catch (e) {
      ac.source = [];
    }
  }

  /**
   * @param {Event} e
   */
  [bodyChangeHandler](e) {
    const editor = /** @type BodyEditorElement */ (e.target);
    const { value, model, selected } = editor;
    this.payload = /** @type string | File | Blob */ (value);
    if (!this.uiConfig) {
      this.uiConfig = {};
    }
    if (!this.uiConfig.body) {
      this.uiConfig.body = {};
    }
    this.uiConfig.body.model = model;
    this.uiConfig.body.selected = selected;
    this.notifyChanged();
  }

  /**
   * Called when a value on one of the editors change.
   * Dispatches non-bubbling `change` event.
   */
  notifyChanged() {
    this.dispatchEvent(new CustomEvent('change'));
  }

  [editorMimeHandler](e) {
    e.stopPropagation();
    this.mimeType = e.changedValue;
  }

  render() {
    return html`
    <div class="content">
      ${this[urlAreaTemplate]()}
      ${this[tabsTemplate]()}
      ${this[currentEditorTemplate]()}
    </div>
    `;
  }

  /**
   * @returns {TemplateResult} The template for the URL line.
   */
  [urlAreaTemplate]() {
    return html`
    <div class="url-meta">
      ${this[urlEditorTemplate]()}
      ${this[connectTemplate]()}
      ${this[sendTemplate]()}
    </div>
    `;
  }

  /**
   * @returns {TemplateResult} The template for the web socket URL input
   */
  [urlEditorTemplate]() {
    const { url='', invalid } = this;
    const focused = this[focusedValue];
    const acOpened = this[autocompleteOpened];
    const classes = {
      'url-container': true,
      focused,
      autocomplete: acOpened,
      invalid,
    };
    return html`
    <div class="${classMap(classes)}">
      ${this[shadowTemplate]()}
      <div class="input-wrapper">
        <input 
          .value="${url}" 
          class="main-input"
          required
          placeholder="Web socket URL"
          id="mainInput"
          autocomplete="off"
          spellcheck="false"
          @focus="${this[mainFocusBlurHandler]}"
          @blur="${this[mainFocusBlurHandler]}"
          @input="${this[urlInputHandler]}"
          aria-label="The web socket URL value"
        />
      </div>
      ${this[urlAutocompleteTemplate]()}
    </div>
    `;
  }

  /**
   * @returns {TemplateResult} The template for the autocomplete element
   */
  [urlAutocompleteTemplate]() {
    const { anypoint } = this;
    return html`
    <anypoint-autocomplete
      fitPositionTarget
      horizontalAlign="left"
      verticalAlign="top"
      verticalOffset="44"
      ignoreDropdownStyling
      .positionTarget="${this[positionTargetValue]}"
      target="mainInput"
      ?anypoint="${anypoint}"
      @query="${this[autocompleteQuery]}"
      @opened-changed="${this[suggestionsOpenedHandler]}"
      @closed="${cancelEvent}"
      @overlay-opened="${cancelEvent}"
      @overlay-closed="${cancelEvent}"
      @iron-overlay-opened="${cancelEvent}"
      @iron-overlay-closed="${cancelEvent}"
      @resize="${this[autocompleteResizeHandler]}"
    ></anypoint-autocomplete>
    `;
  }

  /**
   * @returns {TemplateResult} The template for the background shadow below the main input and the overlays
   */
  [shadowTemplate]() {
    const opened = this[shadowContainerOpened];
    const styles = { height: `0px` };
    if (this[shadowContainerHeight] !== undefined) {
      styles.height = `${this[shadowContainerHeight] + 40}px`
    }
    const classes = {
      'content-shadow': true,
      opened,
    };
    return html`
    <div class="${classMap(classes)}" style=${styleMap(styles)}></div>
    `;
  }

  [connectTemplate]() {
    const { connected, connecting, anypoint } = this;
    if (connected || connecting) {
      return html`
      <anypoint-button aria-label="Activate to disconnect from the server" @click="${this.disconnect}" ?anypoint="${anypoint}">Disconnect</anypoint-button>
      `;
    }
    return html`
    <anypoint-button aria-label="Activate to connect to the server" @click="${this.connect}" ?anypoint="${anypoint}">Connect</anypoint-button>
    `;
  }

  /**
   * @returns {TemplateResult} The template for the request editor tabs
   */
  [tabsTemplate]() {
    const {
      anypoint,
      selectedTab,
    } = this;
    return html`
    <anypoint-tabs
      .selected="${selectedTab}"
      ?anypoint="${anypoint}"
      class="editor-tabs"
    >
      <anypoint-tab ?anypoint="${anypoint}">Body</anypoint-tab>
    </anypoint-tabs>
    `;
  }

   /**
   * @returns {TemplateResult} The template for the current editor
   */
  [currentEditorTemplate]() {
    const { selectedTab } = this;
    const bodyVisible = selectedTab === 0;
    return html`
    <div class="panel">
    ${this[bodyTemplate](bodyVisible)}
    </div>
    `;
  }

  /**
   * @param {boolean} visible Whether the panel should not be hidden
   * @returns {TemplateResult} The template for the body editor
   */
  [bodyTemplate](visible) {
    const {
      readOnly,
      anypoint,
      outlined,
      payload,
      uiConfig={},
      mimeType,
    } = this;
    const { body={} } = uiConfig;
    const { model, selected } = body;
    return html`
    <body-editor
      ?hidden="${!visible}"
      ?readOnly="${readOnly}"
      .value="${!model && payload || undefined}"
      selected="${ifDefined(selected)}" 
      .model="${model}"
      types="raw,file"
      ignoreContentType
      ?anypoint="${anypoint}"
      ?outlined="${outlined}"
      .contentType="${mimeType}"
      @change="${this[bodyChangeHandler]}"
      @select="${this[bodyChangeHandler]}"
    ></body-editor>
    `;
  }

  [sendTemplate]() {
    return html`
    <anypoint-icon-button 
      ?anypoint="${this.anypoint}" 
      title="Send the message" 
      ?disabled="${!this.connected && !this.connecting}"
      @click="${this.send}"
      emphasis="medium"
      tabindex="0"
    >
      <arc-icon icon="send"></arc-icon> 
    </anypoint-icon-button>
    `;
  }
}
