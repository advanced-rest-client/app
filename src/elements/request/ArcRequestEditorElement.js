/* eslint-disable class-methods-use-this */
import { LitElement, html } from 'lit-element';
import { ifDefined } from 'lit-html/directives/if-defined.js';
import { EventsTargetMixin, ResizableMixin } from '@anypoint-web-components/awc';
import { v4 } from '@advanced-rest-client/uuid';
import { TransportEvents, TelemetryEvents, RequestEventTypes } from '@advanced-rest-client/events';
import '@anypoint-web-components/awc/anypoint-dropdown.js';
import '@anypoint-web-components/awc/anypoint-listbox.js';
import '@anypoint-web-components/awc/anypoint-icon-item.js';
import '@anypoint-web-components/awc/anypoint-textarea.js';
import '@anypoint-web-components/awc/anypoint-tabs.js';
import '@anypoint-web-components/awc/anypoint-tab.js';
import '@anypoint-web-components/awc/anypoint-dialog.js';
import '@anypoint-web-components/awc/anypoint-button.js';
import '@advanced-rest-client/icons/arc-icon.js';
import '@advanced-rest-client/http-code-snippets/http-code-snippets.js';
import { HeadersParser } from '../../lib/headers/HeadersParser.js';
import elementStyles from './styles/RequestEditor.js';
import requestMenuTemplate from './templates/RequestMenu.template.js';
import authorizationTemplates from './templates/RequestAuth.template.js';
import { CurlParser } from '../../lib/CurlParser.js';
import '../../../define/url-input-editor.js';
import '../../../define/headers-editor.js';
import '../../../define/body-editor.js';
import '../../../define/arc-actions.js';
import '../../../define/arc-request-config.js';
import '../../../define/request-meta-details.js';

/** @typedef {import('lit-element').TemplateResult} TemplateResult */
/** @typedef {import('@anypoint-web-components/awc').AnypointListboxElement} AnypointListbox */
/** @typedef {import('@anypoint-web-components/awc').AnypointTabsElement} AnypointTabsElement */
/** @typedef {import('@advanced-rest-client/events').Actions.RunnableAction} RunnableAction */
/** @typedef {import('@advanced-rest-client/events').ArcRequest.RequestAuthorization} RequestAuthorization */
/** @typedef {import('@advanced-rest-client/events').ArcRequest.RequestUiMeta} RequestUiMeta */
/** @typedef {import('@advanced-rest-client/events').ArcRequest.ArcEditorRequest} ArcEditorRequest */
/** @typedef {import('@advanced-rest-client/events').ArcRequest.ArcBaseRequest} ArcBaseRequest */
/** @typedef {import('@advanced-rest-client/events').ArcRequest.RequestConfig} RequestConfig */
/** @typedef {import('@advanced-rest-client/events').RequestBody.BodyMeta} BodyMeta */
/** @typedef {import('@advanced-rest-client/events').Authorization.OAuth2Authorization} OAuth2Authorization */
/** @typedef {import('../../../').HeadersEditorElement} HeadersEditorElement */
/** @typedef {import('../../../').BodyEditorElement} BodyEditorElement */
/** @typedef {import('../../../').AuthorizationSelectorElement} AuthorizationSelectorElement */
/** @typedef {import('../../../').AuthorizationMethodElement} AuthorizationMethodElement */
/** @typedef {import('../../../').ARCActionsElement} ARCActionsElement */
/** @typedef {import('../../../').UrlInputEditorElement} UrlInputEditorElement */
/** @typedef {import('./ArcRequestConfigElement').default} ArcRequestConfigElement */

export const urlMetaTemplate = Symbol('urlMetaTemplate');
export const httpMethodSelectorTemplate = Symbol('httpMethodSelectorTemplate');
export const urlEditorTemplate = Symbol('urlEditorTemplate');
export const methodSelectorOpened = Symbol('methodSelectorOpened');
export const methodClosedHandler = Symbol('methodClosedHandler');
export const methodActivateHandler = Symbol('methodActivateHandler');
export const methodOptionsTemplate = Symbol('methodOptionsTemplate');
export const methodSelectorClickHandler = Symbol('methodSelectorClickHandler');
export const methodSelectorKeydownHandler = Symbol('methodSelectorKeydownHandler');
export const urlHandler = Symbol('urlHandler');
export const requestMenuHandler = Symbol('requestMenuHandler');
export const tabsTemplate = Symbol('tabsTemplate');
export const tabChangeHandler = Symbol('tabChangeHandler');
export const currentEditorTemplate = Symbol('currentEditorTemplate');
export const headersTemplate = Symbol('headersTemplate');
export const bodyTemplate = Symbol('bodyTemplate');
export const authorizationTemplate = Symbol('authorizationTemplate');
export const actionsTemplate = Symbol('actionsTemplate');
export const actionsUiHandler = Symbol('actionsUiHandler');
export const actionsHandler = Symbol('actionsHandler');
export const configTemplate = Symbol('configTemplate');
export const snippetsTemplate = Symbol('snippetsTemplate');
export const headersHandler = Symbol('headersHandler');
export const bodyHandler = Symbol('bodyHandler');
export const authorizationHandler = Symbol('authorizationHandler');
export const configHandler = Symbol('configHandler');
export const headersValue = Symbol('headersValue');
export const uiConfigValue = Symbol('uiConfigValue');
export const readHeaders = Symbol('readHeaders');
export const awaitingOAuth2authorization = Symbol('awaitingOAuth2authorization');
export const headersDialogTemplate = Symbol('headersDialogTemplate');
export const contentWarningCloseHandler = Symbol('contentWarningCloseHandler');
export const sendIgnoreValidation = Symbol('sendIgnoreValidation');
export const internalSendHandler = Symbol('internalSendHandler');
export const metaDetailsTemplate = Symbol('metaDetailsTemplate');
export const metaRequestEditorHandler = Symbol('metaRequestEditorHandler');
export const requestMetaCloseHandler = Symbol('requestMetaCloseHandler');
export const curlDialogTemplate = Symbol('curlDialogTemplate');
export const importCURL = Symbol('importCURL');
export const curlCloseHandler = Symbol('curlCloseHandler');
export const sendButtonTemplate = Symbol('sendButtonTemplate');

export const HttpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'CONNECT', 'OPTIONS', 'TRACE'];
export const NonPayloadMethods = ['GET', 'HEAD'];

/**
 * An HTTP request message editor.
 * It allows to generate the basic HTTP request fields and configuration used in Advanced REST Client.
 */
export default class ArcRequestEditorElement extends ResizableMixin(EventsTargetMixin(LitElement)) {
  static get styles() {
    return [elementStyles];
  }

  static get properties() {
    return { 
      /**
       * Request headers.
       */
      headers: { type: String },
      /** 
       * The Current content type value.
       */
      contentType: { type: String },
      /**
       * Body for the request.
       */
      payload: { type: String },
      /**
       * Current request URL
       */
      url: { type: String },
      /**
       * Current HTTP method
       */
      method: { type: String },
      /**
       * List of request actions to be performed when the response is received
       */
      responseActions: { type: Array },
      /**
       * List of request actions to be performed before request is send
       */
      requestActions: { type: Array },
      /**
       * Redirect URL for the OAuth2 authorization.
       * If can be also set by dispatching `oauth2-redirect-url-changed`
       * with `value` property on the `detail` object.
       */
      oauth2RedirectUri: { type: String },
      /**
       * Generated request ID when the request is sent. This value is reported
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
       * A value to be passed to the OAuth 2 `authorizationUri` property in case
       * if current configuration has no value.
       * This is to be used as a default value.
       */
      oauth2AuthorizationUri: { type: String },
      /**
       * A value to be passed to the OAuth 2 `accessTokenUri` property in case
       * if current configuration has no value.
       * This is to be used as a default value.
       */
      oauth2AccessTokenUri: { type: String },
      /**
       * An index of currently opened tab.
       * @default 0
       */
      selectedTab: { type: Number },
      /** 
       * The authorization configuration for the current request.
       * May be null.
       */
      authorization: { type: Array },
      /** 
       * The editors configuration meta data
       */
      uiConfig: { type: Object },
      /** 
       * The request configuration that overrides application and workspace configuration.
       */
      config: { type: Object },
      /**
       * When set it ignores all `content-*` headers when the request method is `GET`.
       * When not set or `false` it renders a warning message.
       */
      ignoreContentOnGet: { type: Boolean },
      /** 
       * When set the `content-` headers warning dialog is rendered.
       */
      contentHeadersDialogOpened: { type: Boolean },

      /** 
       * When set the cURL import dialog is rendered.
       */
      curlDialogOpened: { type: Boolean },

      /**
       * When the request is stored in the data store this is the id of the stored request
       */
      storedId: { type: String },
      /**
       * When the request is stored in the data store this is the type of the stored request
       */
      storedType: { type: String },
      /**
       * When set then it renders metadata editor.
       */
      metaEditorEnabled: { type: Boolean },
      /** 
       * When set it renders the send request button.
       */
      renderSend: { type: Boolean },
      /**
       * To be set when the request is being transported.
       */
      loading: { type: Boolean },
      /** 
       * When set the editor does not allow to send the request if one is already loading.
       */
      noSendOnLoading: { type: Boolean },
    };
  }

  /**
   * @returns {boolean} True when the request cannot have the payload on the message.
   */
  get isPayload() {
    return !NonPayloadMethods.includes(this.method);
  }

  /**
   * @returns {number} The number of currently enabled authorization methods.
   */
  get enabledAuthLength() {
    const { authorization=[] } = this;
    let cnt = 0;
    authorization.forEach((method) => {
      if (method.enabled) {
        cnt += 1;
      }
    });
    return cnt;
  }

  /**
   * @returns {number} The number of configured actions.
   */
  get actionsLength() {
    const { requestActions, responseActions } = this;
    let result = 0;
    if (Array.isArray(requestActions)) {
      result += requestActions.length;
    }
    if (Array.isArray(responseActions)) {
      result += responseActions.length;
    }
    return result;
  }

  get headers() {
    return this[headersValue];
  }

  set headers(value) {
    const old = this[headersValue];
    if (old === value) {
      return;
    }
    this[headersValue] = value;
    this.contentType = HeadersParser.contentType(value);
    this.requestUpdate();
  }

  /**
   * @returns {RequestUiMeta}
   */
  get uiConfig() {
    return this[uiConfigValue];
  }

  /**
   * @param {RequestUiMeta} value
   */
  set uiConfig(value) {
    const old = this[uiConfigValue];
    if (old === value) {
      return;
    }
    this[uiConfigValue] = value;
    this.requestUpdate();
    if (value && typeof value.selectedEditor === 'number') {
      this.selectedTab = value.selectedEditor;
    }
  }

  /**
   * @returns {boolean} Indicates that the current request is a "saved" request.
   */
  get isSaved() {
    const { storedId, storedType } = this;
    return !!storedId && storedType === 'saved';
  }

  /**
   * @returns {boolean} Indicates that the current request is stored in the data store.
   */
  get isStored() {
    const { storedId, storedType } = this;
    return !!storedId && !!storedType;
  }

  constructor() {
    super();
    this.reset();
    this.selectedTab = 0;
    this.renderSend = false;
    this.loading = false;
    this.noSendOnLoading = false;
    this[methodSelectorOpened] = false;
    this[internalSendHandler] = this[internalSendHandler].bind(this);
  }

  /**
   * @param {EventTarget} node
   */
  _attachListeners(node) {
    super._attachListeners(node);
    node.addEventListener(RequestEventTypes.send, this[internalSendHandler]);
  }

  /**
   * @param {EventTarget} node
   */
  _detachListeners(node) {
    super._attachListeners(node);
    node.addEventListener(RequestEventTypes.send, this[internalSendHandler]);
  }

  /**
   * Resets the current state actively generating new EditorRequest object
   */
  reset() {
    /**
     * @type {string}
     */
    this.url = '';
    /**
     * @type {string}
     */
    this.method = 'GET';
    /**
     * @type {string | FormData | File | Blob | ArrayBuffer | Buffer}
     */
    this.payload = '';
    /**
     * @type {string}
     */
    this.headers = '';
    /** 
     * @type {RunnableAction[]}
     */
    this.responseActions = undefined;
    /** 
     * @type {RunnableAction[]}
     */
    this.requestActions = undefined;
    this.readOnly = false;
    this.anypoint = false;
    this.outlined = false;
    /**
     * @type {string}
     */
    this.oauth2RedirectUri = undefined;
    /**
     * @type {string}
     */
    this.requestId = v4();
    /**
     * @type {string}
     */
    this.oauth2AuthorizationUri = undefined;
    /**
     * @type {string}
     */
    this.oauth2AccessTokenUri = undefined;
    /**
     * @type {RequestAuthorization[]}
     */
    this.authorization = undefined;
    /**
     * @type {RequestUiMeta}
     */
    this.uiConfig = undefined;
    /**
     * @type {RequestConfig}
     */
    this.config = undefined;
    this.ignoreContentOnGet = false;
    /**
     * This is set by the internal logic. When `ignoreContentOnGet` is set and the headers have `content-` headers
     * a dialog is rendered when trying to send the request. When the user chooses to ignore the warning this
     * flag makes sure that `send()` does not check headers.
     * 
     * @todo(pawel): This should be done in the request logic module plugin.
     * Plugins can stop request indefinitely or cancel it.
     */
    this.ignoreValidationOnGet = false;
    this.contentHeadersDialogOpened = false;
    this.curlDialogOpened = false;
    this.storedId = '';
    this.storedType = '';
    this.metaEditorEnabled = false;
    this.dispatchEvent(new CustomEvent('clear'));
  }

  /**
   * Reads the headers value and applies the `ignoreContentOnGet` application setting.
   */
  [readHeaders]() {
    const { method = '' } = this;
    let { headers = '' } = this;
    if (this.ignoreContentOnGet && method.toLowerCase() === 'get') {
      const reg = /^content-\S+(\s+)?:.*\n?/gim;
      headers = headers.replace(reg, '');
    }
    return headers.trim();
  }

  /**
   * Serializes the request to the EditorRequest object with the `ArcBaseRequest` request on it.
   * @returns {ArcEditorRequest}
   */
  serialize() {
    const { requestId, url, method, payload, requestActions, responseActions, authorization, uiConfig, config, } = this;
    const headers = this[readHeaders]();
    const request = /** @type ArcBaseRequest */ ({
      url,
      method, 
      headers, 
      payload,
      actions: {
        request: requestActions,
        response: responseActions,
      },
      authorization,
      ui: uiConfig,
      config,
    });
    const result = /** @type ArcEditorRequest */ ({
      id: requestId,
      request,
    });

    return result;
  }

  /**
   * Validates state of the URL.
   * @return {Boolean} True if the URL has a structure that looks like
   * an URL which means scheme + something
   */
  validateUrl() {
    const panel = this.shadowRoot.querySelector('url-input-editor');
    if (!panel) {
      return true;
    }
    return panel.validate(panel.value);
  }

  /**
   * Checks if current request requires calling `authorize()` on the OAuth2 method.
   *
   * @return {boolean} This returns `true` only for valid OAuth 2 method that has no access token.
   */
  requiresAuthorization() {
    const { authorization=[] } = this;
    const oauth = authorization.find((method) => method.enabled && method.type === 'oauth 2');
    if (!oauth) {
      return false;
    }
    const authMethod = /** @type AuthorizationMethodElement */ (this.shadowRoot.querySelector('authorization-method[type="oauth 2"]'));
    const cnf = /** @type OAuth2Authorization */ (oauth.config);
    if (authMethod.validate() && !cnf.accessToken) {
      return true;
    }
    return false;
  }

  /**
   * Validates headers for `Content-*` entries against current method.
   * @param {ArcBaseRequest} request The request object
   * @return {boolean} True if headers are invalid.
   */
  validateContentHeaders(request) {
    const method = request.method || 'get';
    if (method.toLowerCase() !== 'get') {
      return false;
    }
    if ((request.headers || '').toLowerCase().indexOf('content-') === -1) {
      return false;
    }
    return true;
  }

  /**
   * Dispatches the send request event to the ARC request engine.
   */
  send() {
    if (this.loading && this.noSendOnLoading) {
      return;
    }
    if (!this.validateUrl()) {
      return;
    }
    if (this.requiresAuthorization()) {
      const authMethod = /** @type AuthorizationMethodElement */ (this.shadowRoot.querySelector('authorization-method[type="oauth 2"]'));
      authMethod.authorize();
      this[awaitingOAuth2authorization] = true;
      return;
    }
    this.requestId = v4();
    this.notifyRequestChanged();
    const request = this.serialize();
    if (!this.ignoreValidationOnGet && this.validateContentHeaders(request.request)) {
      this.contentHeadersDialogOpened = true;
      return;
    }
    TransportEvents.request(this, request);
    TelemetryEvents.event(this, {
      category: 'Request editor',
      action: 'Send request',
    });
  }

  /**
   * Aborts the request
   */
  abort() {
    TransportEvents.abort(this, this.requestId);
  }

  /**
   * @param {Event} e
   */
  [internalSendHandler](e) {
    e.stopPropagation();
    this.send();
  }

  /**
   * @param {KeyboardEvent} e
   */
  [methodSelectorKeydownHandler](e) {
    if (['Space', 'Enter', 'NumpadEnter', 'ArrowDown'].includes(e.code)) {
      this[methodSelectorClickHandler]();
    }
  }

  async [methodSelectorClickHandler]() {
    this[methodSelectorOpened] = false;
    await this.requestUpdate();
    this[methodSelectorOpened] = true;
    await this.requestUpdate();
  }

  /**
   * The handler for the method drop down list close event.
   */
  [methodClosedHandler]() {
    this[methodSelectorOpened] = false;
  }

  /**
   * The handler for the HTTP method drop down.
   * @param {CustomEvent} e
   */
  [methodActivateHandler](e) {
    this[methodSelectorOpened] = false;
    this.requestUpdate();
    const { selected } = e.detail;
    this.method = selected;
    this.notifyRequestChanged();
    this.notifyChanged('method', selected);
    if (!this.isPayload && this.selectedTab === 1) {
      this.selectedTab = 0;
    }
    TelemetryEvents.event(this, {
      category: 'Request editor',
      action: 'Method selected',
      label: selected,
    });
  }

  /**
   * The handler for the URL editor change event
   * @param {Event} e 
   */
  [urlHandler](e) {
    const panel = /** @type UrlInputEditorElement */ (e.target);
    const { value } = panel;
    this.url = value;
    this.notifyRequestChanged();
    this.notifyChanged('url', value);
  }

  [requestMenuHandler](e) {
    const node = /** @type AnypointListbox */ (e.target);
    const { selectedItem } = node;
    if (!selectedItem) {
      return;
    }
    const { action } =  selectedItem.dataset;
    switch (action) {
      case 'clear': this.reset(); break;
      case 'save':
      case 'export':
      case 'details':
      case 'close':
      case 'duplicate':
      case 'saveas':
      case 'savehar':
        this.dispatchEvent(new CustomEvent(action));
        break;
      case 'import-curl':
        this.curlDialogOpened = true;
        break;
      default:
    }
  }

  /**
   * @param {Event} e 
   */
  async [tabChangeHandler](e) {
    const tabs = /** @type AnypointTabsElement */ (e.target);
    this.selectedTab = /** @type number */ (tabs.selected);
    this.refreshEditors();
    if (!this.uiConfig) {
      this.uiConfig = {};
    }
    this.uiConfig.selectedEditor = this.selectedTab;
    this.notifyRequestChanged();
    this.notifyChanged('uiConfig', this.uiConfig);
    const labels = ['Headers', 'Body', 'Authorization', 'Actions', 'Config', 'Code snippets'];
    TelemetryEvents.event(this, {
      category: 'Request editor',
      action: 'Editor switched',
      label: labels[this.selectedTab],
    });
    await this.updateComplete;
    this.notifyResize();
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
   * The handler for the headers change event from the headers editor.
   * @param {Event} e
   */
  [headersHandler](e) {
    const node = /** @type HeadersEditorElement */ (e.target);
    const { value, model, source } = node;
    this[headersValue] = value;
    if (!this.uiConfig) {
      this.uiConfig = {};
    }
    if (!this.uiConfig.headers) {
      this.uiConfig.headers = {};
    }
    this.uiConfig.headers.model = model;
    this.uiConfig.headers.source = source;
    this.contentType = HeadersParser.contentType(value);
    this.notifyRequestChanged();
    this.notifyChanged('headers', value);
  }

  /**
   * The handler for the body editor change event
   * @param {Event} e
   */
  [bodyHandler](e) {
    const node = /** @type BodyEditorElement */ (e.target);
    const { value, model, selected } = node;
    this.payload = value;
    if (!this.uiConfig) {
      this.uiConfig = {};
    }
    if (!this.uiConfig.body) {
      this.uiConfig.body = {};
    }
    this.uiConfig.body.model = model;
    this.uiConfig.body.selected = selected;
    this.notifyRequestChanged();
    this.notifyChanged('payload', value);
  }

  /**
   * The handler for the authorization editor change event
   * @param {Event} e
   */
  [authorizationHandler](e) {
    const selector = /** @type AuthorizationSelectorElement */ (e.target);
    const { selected, type } = selector;
    const methods = /** @type AuthorizationMethodElement[] */ (selector.items);
    const result = /** @type RequestAuthorization[] */ ([]);
    methods.forEach((authMethod) => {
      const { type: mType } = authMethod;
      const config = (authMethod && authMethod.serialize) ? authMethod.serialize() : undefined;
      const valid = (authMethod && authMethod.validate) ? authMethod.validate() : true;
      const enabled = type.includes(mType);
      result.push({
        config,
        type: mType,
        enabled,
        valid,
      });
    });
    this.authorization = result;
    if (!this.uiConfig) {
      this.uiConfig = {};
    }
    if (!this.uiConfig.authorization) {
      this.uiConfig.authorization = {};
    }
    this.uiConfig.authorization.selected = /** @type number */ (selected);
    this.notifyRequestChanged();
    this.notifyChanged('authorization', result);
    this.requestUpdate();
  }

  /**
   * The handler for the actions editor change event
   * @param {CustomEvent} e
   */
  [actionsHandler](e) {
    const panel = /** @type ARCActionsElement */ (e.target);
    const { type } = e.detail;
    const list = type === 'request' ? panel.request : panel.response;
    const prop = type === 'request' ? 'requestActions' : 'responseActions';
    this[prop] = /** @type RunnableAction[] */ (list);
    const { selected } = panel;
    if (!this.uiConfig) {
      this.uiConfig = {};
    }
    if (!this.uiConfig.actions) {
      this.uiConfig.actions = {};
    }
    this.uiConfig.actions.selected = selected;
    this.notifyRequestChanged();
    this.notifyChanged(prop, list);
    this.requestUpdate();
  }

  /**
   * The handler for the actions editor UI state change event
   * @param {Event} e
   */
  [actionsUiHandler](e) {
    const panel = /** @type ARCActionsElement */ (e.target);
    const { selected } = panel;
    if (!this.uiConfig) {
      this.uiConfig = {};
    }
    if (!this.uiConfig.actions) {
      this.uiConfig.actions = {};
    }
    this.uiConfig.actions.selected = selected;
    this.notifyRequestChanged();
    this.notifyChanged('uiConfig', this.uiConfig);
  }

  /**
   * The handler for the config editor change event
   * @param {Event} e
   */
  [configHandler](e) {
    const node = /** @type ArcRequestConfigElement */ (e.target);
    this.config = node.config;
    this.notifyRequestChanged();
    this.notifyChanged('config', this.config);
  }

  /**
   * Called when a value on one of the editors change.
   * Dispatches non-bubbling `change` event.
   */
  notifyRequestChanged() {
    this.dispatchEvent(new CustomEvent('change'));
  }

  /**
   * Called to notify listeners about a particular property change
   * 
   * @param {string} type The property that changed. The resulting event type is the combination of this value and the `change` suffix.
   * @param {any} value The value of the changed property
   */
  notifyChanged(type, value) {
    this.dispatchEvent(new CustomEvent(`${type}change`, {
      detail: {
        value
      }
    }));
  }

  [contentWarningCloseHandler]() {
    this.contentHeadersDialogOpened = false;
  }

  [sendIgnoreValidation]() {
    this.ignoreValidationOnGet = true;
    this.send();
  }

  [metaRequestEditorHandler]() {
    this.metaEditorEnabled = true;
  }

  [requestMetaCloseHandler]() {
    this.metaEditorEnabled = false;
  }

  /**
   * @param {CustomEvent} e
   */
  [curlCloseHandler](e) {
    this.curlDialogOpened = false;
    const { canceled, confirmed } = e.detail;
    if (canceled || !confirmed) {
      return;
    }
    const input = /** @type HTMLInputElement */ (this.shadowRoot.querySelector('.curl-input'));
    const { value } = input;
    this[importCURL](value);
  }

  /**
   * Parses the cURL command and replaces the current request
   * @param {string} value
   */
  [importCURL](value) {
    const parser = new CurlParser();
    const result = parser.parse(value);
    this.reset();
    this.url = result.url;
    this.method = result.method || 'GET';
    this.headers = result.headers.join('\n');
    if (result.data && result.data.ascii) {
      this.payload = result.data.ascii;
      this.selectedTab = 1;
    }
    this.notifyRequestChanged();
  }

  render() {
    return html`
    <div class="content">
      ${this[urlMetaTemplate]()}
      ${this[tabsTemplate]()}
      ${this[currentEditorTemplate]()}
      ${this[headersDialogTemplate]()}
      ${this[curlDialogTemplate]()}
    </div>
    `;
  }

  /**
   * @returns {TemplateResult} The template for the top line with method selector, URL, and options.
   */
  [urlMetaTemplate]() {
    return html`
    <div class="url-meta">
      ${this[httpMethodSelectorTemplate]()}
      ${this[urlEditorTemplate]()}
      ${this[sendButtonTemplate]()}
      ${requestMenuTemplate(this[requestMenuHandler], this.isStored, this.anypoint)}
    </div>
    `;
  }

  /**
   * @returns {TemplateResult} The template for the HTTP method selector
   */
  [httpMethodSelectorTemplate]() {
    const { method } = this;
    return html`
    <div 
      class="method-selector"
      tabindex="0"
      @click="${this[methodSelectorClickHandler]}"
      @keydown="${this[methodSelectorKeydownHandler]}"
    >
      <span class="label">${method}</span>
      <arc-icon icon="expandMore"></arc-icon>
    </div>
    <anypoint-dropdown 
      .opened="${this[methodSelectorOpened]}" 
      .positionTarget="${this}" 
      verticalAlign="top"
      @closed="${this[methodClosedHandler]}"
      @activate="${this[methodActivateHandler]}"
    >
      <anypoint-listbox 
        fallbackSelection="GET" 
        attrForSelected="data-method" 
        slot="dropdown-content" 
        selectable="anypoint-icon-item"
        class="method-list"
      >
        ${this[methodOptionsTemplate]()}
      </anypoint-listbox>
    </anypoint-dropdown>
    `;
  }

  /**
   * @returns {TemplateResult[]} The templates for each supported HTTP methods
   */
  [methodOptionsTemplate]() {
    const { anypoint } = this;
    return HttpMethods.map((method) => html`
    <anypoint-icon-item 
      ?anypoint="${anypoint}" 
      data-method="${method}"
    >
      <div slot="item-icon" data-method="${method.toLocaleLowerCase()}" class="http-label"></div>
      ${method}
    </anypoint-icon-item>`);
  }

  /**
   * @returns {TemplateResult} The template for the HTTP URL editor
   */
  [urlEditorTemplate]() {
    const { url='', outlined, anypoint, eventsTarget } = this;
    return html`
    <url-input-editor
      ?anypoint="${anypoint}"
      ?outlined="${outlined}"
      .value="${url}"
      .eventsTarget="${eventsTarget}"
      @change="${this[urlHandler]}"
    ></url-input-editor>
    `;
  }

  /**
   * @returns {TemplateResult|string} The template for the "send" or "abort" buttons.
   */
  [sendButtonTemplate]() {
    if (!this.renderSend) {
      return '';
    }
    if (this.loading) {
      return html`
      <anypoint-icon-button title="Cancel sending the request" @click="${this.abort}">
        <arc-icon icon="cancel"></arc-icon>
      </anypoint-icon-button>
      `;
    }
    return html`
    <anypoint-icon-button title="Send the request" @click="${this.send}">
      <arc-icon icon="send"></arc-icon>
    </anypoint-icon-button>
    `;
  }

  /**
   * @returns {TemplateResult} The template for the request editor tabs
   */
  [tabsTemplate]() {
    const {
      isPayload,
      anypoint,
      selectedTab,
      enabledAuthLength,
      actionsLength,
      isSaved,
    } = this;
    return html`
    <anypoint-tabs
      .selected="${selectedTab}"
      ?anypoint="${anypoint}"
      @selectedchange="${this[tabChangeHandler]}"
      class="editor-tabs"
    >
      <anypoint-tab ?anypoint="${anypoint}">Headers</anypoint-tab>
      <anypoint-tab ?anypoint="${anypoint}" ?hidden="${!isPayload}">Body</anypoint-tab>
      <anypoint-tab ?anypoint="${anypoint}">Authorization <span class="tab-counter">${enabledAuthLength}</span></anypoint-tab>
      <anypoint-tab ?anypoint="${anypoint}">Actions <span class="tab-counter">${actionsLength}</span></anypoint-tab>
      <anypoint-tab ?anypoint="${anypoint}">Config</anypoint-tab>
      <anypoint-tab ?anypoint="${anypoint}">Code snippets</anypoint-tab>
      <anypoint-tab ?anypoint="${anypoint}" ?hidden="${!isSaved}">Meta</anypoint-tab>
    </anypoint-tabs>`;
  }

  /**
   * @returns {TemplateResult} The template for the current editor
   */
  [currentEditorTemplate]() {
    const { selectedTab, isPayload } = this;
    const headersVisible = selectedTab === 0;
    const bodyVisible = isPayload && selectedTab === 1;
    const authVisible = selectedTab === 2;
    const actionsVisible = selectedTab === 3;
    const configVisible = selectedTab === 4;
    const codeVisible = selectedTab === 5;
    const metaVisible = selectedTab === 6;

    return html`
    <div class="panel">
    ${this[headersTemplate](headersVisible)}
    ${this[bodyTemplate](bodyVisible)}
    ${this[authorizationTemplate](authVisible)}
    ${this[actionsTemplate](actionsVisible)}
    ${this[configTemplate](configVisible)}
    ${this[snippetsTemplate](codeVisible)}
    ${this[metaDetailsTemplate](metaVisible)}
    </div>
    `;
  }

  /**
   * @param {boolean} visible Whether the panel should not be hidden
   * @returns {TemplateResult} The template for the headers editor
   */
  [headersTemplate](visible) {
    const {
      anypoint,
      outlined,
      eventsTarget,
      headers,
      readOnly,
    } = this;
    return html`
    <headers-editor
      ?hidden="${!visible}"
      ?anypoint="${anypoint}"
      ?outlined="${outlined}"
      .eventsTarget="${eventsTarget}"
      .value="${headers}"
      @change="${this[headersHandler]}"
      ?readonly="${readOnly}"
    ></headers-editor>`;
  }

  /**
   * @param {boolean} visible Whether the panel should not be hidden
   * @returns {TemplateResult} The template for the body editor
   */
  [bodyTemplate](visible) {
    const {
      anypoint,
      outlined,
      payload,
      readOnly,
      contentType,
      uiConfig={},
    } = this;
    const { body={} } = uiConfig;
    const { model, selected } = body;
    return html`
    <body-editor
      ?hidden="${!visible}"
      ?anypoint="${anypoint}"
      ?outlined="${outlined}"
      ?readOnly="${readOnly}"
      .value="${!model && payload || undefined}"
      selected="${ifDefined(selected)}" 
      .model="${model}"
      .contentType="${contentType}"
      @change="${this[bodyHandler]}"
      @select="${this[bodyHandler]}"
    ></body-editor>
    `;
  }

  /**
   * @param {boolean} visible Whether the panel should not be hidden
   * @returns {TemplateResult} The template for the authorization editor
   */
  [authorizationTemplate](visible) {
    const { oauth2RedirectUri, outlined, anypoint, authorization, uiConfig={} } = this;
    const { authorization: authUi={} } = uiConfig;
    const config = {
      oauth2RedirectUri,
      outlined, 
      anypoint,
      ui: authUi,
      hidden: !visible,
    };
    return authorizationTemplates(this[authorizationHandler], config, authorization);
  }

  /**
   * @param {boolean} visible Whether the panel should be rendered
   * @returns {TemplateResult|string} The template for the ARC request actions editor
   */
  [actionsTemplate](visible) {
    if (!visible) {
      return '';
    }
    const { requestActions, responseActions, outlined, anypoint } = this;
    return html`
    <arc-actions
      .request="${requestActions}"
      .response="${responseActions}"
      ?anypoint="${anypoint}"
      ?outlined="${outlined}"
      slot="content"
      @change="${this[actionsHandler]}"
      @selectedchange="${this[actionsUiHandler]}"
    ></arc-actions>
    `;
  }

  /**
   * @param {boolean} visible Whether the panel should be rendered
   * @returns {TemplateResult|string} The template for the ARC request config editor
   */
  [configTemplate](visible) {
    if (!visible) {
      return '';
    }
    const { config, outlined, anypoint, readOnly } = this;
    return html`
    <arc-request-config 
      .config="${config}"
      ?outlined="${outlined}"
      ?anypoint="${anypoint}"
      ?readOnly="${readOnly}"
      @change="${this[configHandler]}"
    ></arc-request-config>`;
  }

  /**
   * @param {boolean} visible Whether the panel should be rendered
   * @returns {TemplateResult|string} The template for the Code snippets
   */
  [snippetsTemplate](visible) {
    if (!visible) {
      return '';
    }
    const { url, method, headers, payload } = this;
    let data;
    if (typeof payload === 'string') {
      data = payload;
    }
    return html`
    <http-code-snippets
      scrollable
      .url="${url}"
      .method="${method}"
      .headers="${headers}"
      .payload="${data}"
    ></http-code-snippets>
    `;
  }

  /**
   * @param {boolean} visible Whether the panel should be rendered
   * @returns {TemplateResult|string} The template for the request meta details
   */
  [metaDetailsTemplate](visible) {
    if (!visible) {
      return '';
    }
    const { storedId, storedType, anypoint, metaEditorEnabled } = this;
    if (metaEditorEnabled) {
      return html`
      <request-meta-editor
        ?anypoint="${anypoint}"
        .requestId="${storedId}"
        .requestType="${storedType}"
        @close="${this[requestMetaCloseHandler]}"
      ></request-meta-editor>
      `;
    }
    return html`
    <request-meta-details
      ?anypoint="${anypoint}"
      .requestId="${storedId}"
      .requestType="${storedType}"
      @edit="${this[metaRequestEditorHandler]}"
    ></request-meta-details>
    `;
  }

  /**
   * @returns {TemplateResult|string} The template for the invalid content headers dialog
   */
  [headersDialogTemplate]() {
    const { anypoint, contentHeadersDialogOpened } = this;
    return html`
    <anypoint-dialog ?anypoint="${anypoint}" .opened="${contentHeadersDialogOpened}" @closed="${this[contentWarningCloseHandler]}">
      <h2>Headers are not valid</h2>
      <div>
        <p>The <b>GET</b> request should not contain <b>content-*</b> headers. It may
        cause the server to behave unexpectedly.</p>
        <p><b>Do you want to continue?</b></p>
      </div>
      <div class="buttons">
        <anypoint-button
          data-dialog-dismiss
          ?anypoint="${anypoint}"
        >Cancel request</anypoint-button>
        <anypoint-button
          data-dialog-confirm
          @click="${this[sendIgnoreValidation]}"
          ?anypoint="${anypoint}"
        >Continue</anypoint-button>
      </div>
    </anypoint-dialog>`
  }

  /**
   * @returns {TemplateResult|string} The template for the invalid content headers dialog
   */
  [curlDialogTemplate]() {
    const { anypoint, curlDialogOpened } = this;
    if (!curlDialogOpened) {
      return '';
    }
    return html`
    <anypoint-dialog ?anypoint="${anypoint}" opened @closed="${this[curlCloseHandler]}">
      <h2>Enter the cURL command</h2>
      <div>
        <anypoint-textarea class="curl-input">
          <label slot="label">Paste command here</label>
        </anypoint-textarea>
      </div>
      <div class="buttons">
        <anypoint-button
          data-dialog-dismiss
          ?anypoint="${anypoint}"
        >Cancel</anypoint-button>
        <anypoint-button
          data-dialog-confirm
          ?anypoint="${anypoint}"
        >Continue</anypoint-button>
      </div>
    </anypoint-dialog>`
  }
}
