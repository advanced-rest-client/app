import { LitElement, TemplateResult, CSSResult } from 'lit-element';
import { EventsTargetMixin, ResizableMixin } from '@anypoint-web-components/awc';
import { ArcBaseRequest, ArcEditorRequest, RequestAuthorization, RequestConfig, RequestUiMeta } from '@advanced-rest-client/events/src/request/ArcRequest';
import { RunnableAction } from '@advanced-rest-client/events/src/actions/Actions';

export declare const urlMetaTemplate: unique symbol
export declare const httpMethodSelectorTemplate: unique symbol
export declare const urlEditorTemplate: unique symbol
export declare const methodSelectorOpened: unique symbol
export declare const methodClosedHandler: unique symbol
export declare const methodActivateHandler: unique symbol
export declare const methodOptionsTemplate: unique symbol
export declare const methodSelectorClickHandler: unique symbol
export declare const methodSelectorKeydownHandler: unique symbol
export declare const urlHandler: unique symbol
export declare const requestMenuHandler: unique symbol
export declare const tabsTemplate: unique symbol
export declare const tabChangeHandler: unique symbol
export declare const currentEditorTemplate: unique symbol
export declare const headersTemplate: unique symbol
export declare const bodyTemplate: unique symbol
export declare const authorizationTemplate: unique symbol
export declare const actionsTemplate: unique symbol
export declare const actionsUiHandler: unique symbol
export declare const actionsHandler: unique symbol
export declare const configTemplate: unique symbol
export declare const snippetsTemplate: unique symbol
export declare const headersHandler: unique symbol
export declare const bodyHandler: unique symbol
export declare const authorizationHandler: unique symbol
export declare const configHandler: unique symbol
export declare const headersValue: unique symbol
export declare const uiConfigValue: unique symbol
export declare const readHeaders: unique symbol
export declare const awaitingOAuth2authorization: unique symbol
export declare const headersDialogTemplate: unique symbol
export declare const contentWarningCloseHandler: unique symbol
export declare const sendIgnoreValidation: unique symbol
export declare const internalSendHandler: unique symbol
export declare const metaDetailsTemplate: unique symbol
export declare const metaRequestEditorHandler: unique symbol
export declare const requestMetaCloseHandler: unique symbol
export declare const curlDialogTemplate: unique symbol
export declare const importCURL: unique symbol
export declare const curlCloseHandler: unique symbol

export declare const HttpMethods: string;
export declare const NonPayloadMethods: string;

/**
 * An HTTP request message editor.
 * It allows to generate the basic HTTP request fields and configuration used in Advanced REST Client.
 * 
 * @fires clear When the clear action was performed
 * @fires save When the "save" action was triggered from the request context menu
 * @fires export When the "export" action was triggered from the request context menu
 * @fires details When the "details" action was triggered from the request context menu
 * @fires close When the "close" action was triggered from the request context menu
 * @fires duplicate When the "duplicate" action was triggered from the request context menu
 * @fires saveas When the "save as" action was triggered from the request context menu
 * @fires savehar When the "save as HAR" action was triggered from the request context menu
 * @fires change When any property of the request has changed
 * @fires urlchange When the `url` property changed
 * @fires uiconfigchange When the `uiConfig` property changed
 * @fires headerschange When the `headers` property changed
 * @fires payloadchange When the `payload` property changed
 * @fires authorizationchange When the `authorization` property changed
 * @fires requestactionschange When the `requestActions` property changed
 * @fires responseactionschange When the `responseActions` property changed
 * @fires configchange When the `responseActions` property changed
 */
export default class ArcRequestEditorElement extends ResizableMixin(EventsTargetMixin(LitElement)) {
  static get styles(): CSSResult;

  /**
   * Request headers.
   * @attribute
   */
  headers: string;
  /** 
   * The Current content type value.
   * @attribute
   */
  contentType: string;
  /**
   * Body for the request.
   */
  payload: string | File | Blob | FormData | Buffer | ArrayBuffer;
  /**
   * Current request URL
   * @attribute
   */
  url: string;
  /**
   * Current HTTP method
   * @attribute
   */
  method: string;
  /**
   * List of request actions to be performed when the response is received
   */
  responseActions: RunnableAction[];
  /**
   * List of request actions to be performed before request is send
   */
  requestActions: RunnableAction[];
  /**
   * Redirect URL for the OAuth2 authorization.
   * If can be also set by dispatching `oauth2-redirect-url-changed`
   * with `value` property on the `detail` object.
   * @attribute
   */
  oauth2RedirectUri: string;
  /**
   * Generated request ID when the request is sent. This value is reported
   * in send and abort events.
   * 
   * The `requestId` property is regenerated each time the `reset()` function is called.
   * @attribute
   */
  requestId: string;
  /**
   * When set the editor is in read only mode.
   * @attribute
   */
  readOnly: boolean;
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
   * A value to be passed to the OAuth 2 `authorizationUri` property in case
   * if current configuration has no value.
   * This is to be used as a default value.
   * @attribute
   */
  oauth2AuthorizationUri: string;
  /**
   * A value to be passed to the OAuth 2 `accessTokenUri` property in case
   * if current configuration has no value.
   * This is to be used as a default value.
   * @attribute
   */
  oauth2AccessTokenUri: string;
  /**
   * An index of currently opened tab.
   * @default 0
   * @attribute
   */
  selectedTab: number;
  /** 
   * The authorization configuration for the current request.
   * May be null.
   */
  authorization: RequestAuthorization[];
  /** 
   * The editors configuration meta data
   */
  uiConfig: RequestUiMeta;
  /** 
   * The request configuration that overrides application and workspace configuration.
   */
  config: RequestConfig;
  /**
   * When set it ignores all `content-*` headers when the request method is `GET`.
   * When not set or `false` it renders a warning message.
   * @attribute
   */
  ignoreContentOnGet: boolean;
  /** 
   * When set the `content-` headers warning dialog is rendered.
   * @attribute
   */
  contentHeadersDialogOpened: boolean;

  /** 
   * When set the cURL import dialog is rendered.
   * @attribute
   */
  curlDialogOpened: boolean;

  /**
   * When the request is stored in the data store this is the id of the stored request
   * @attribute
   */
  storedId: string;
  /**
   * When the request is stored in the data store this is the type of the stored request
   * @attribute
   */
  storedType: string;
  /**
   * When set then it renders metadata editor.
   * @attribute
   */
  metaEditorEnabled: boolean;

  /**
   * True when the request cannot have the payload on the message.
   */
  get isPayload(): boolean;

  /**
   * The number of currently enabled authorization methods.
   */
  get enabledAuthLength(): number;

  /**
   * The number of configured actions.
   */
  get actionsLength(): number;

  /**
   * Indicates that the current request is a "saved" request.
   */
  get isSaved(): boolean;

  /**
   * Indicates that the current request is stored in the data store.
   */
  get isStored(): boolean;

  /** 
   * When set it renders the send request button.
   * @attribute
   */
  renderSend: boolean;
  /**
   * To be set when the request is being transported.
   * @attribute
   */
  loading: boolean;
  /** 
   * When set the editor does not allow to send the request if one is already loading.
   * @attribute
   */
  noSendOnLoading: boolean;

  [methodSelectorOpened]: boolean;

  constructor();

  _attachListeners(node: EventTarget): void;

  _detachListeners(node: EventTarget): void;

  /**
   * Resets the current state actively generating new EditorRequest object
   */
  reset(): void;

  /**
   * Reads the headers value and applies the `ignoreContentOnGet` application setting.
   */
  [readHeaders](): void;

  /**
   * Serializes the request to the EditorRequest object with the `ArcBaseRequest` request on it.
   */
  serialize(): ArcEditorRequest;

  /**
   * Validates state of the URL.
   * @returns True if the URL has a structure that looks like an URL which means scheme + something
   */
  validateUrl(): boolean;

  /**
   * Checks if current request requires calling `authorize()` on the OAuth2 method.
   *
   * @returns This returns `true` only for valid OAuth 2 method that has no access token.
   */
  requiresAuthorization(): boolean;

  /**
   * Validates headers for `Content-*` entries against current method.
   * @param request The request object
   * @returns True if headers are invalid.
   */
  validateContentHeaders(request: ArcBaseRequest): boolean;

  /**
   * Dispatches the send request event to the ARC request engine.
   */
  send(): void;

  /**
   * Aborts the request
   */
  abort(): void;

  [internalSendHandler](): void;

  [methodSelectorKeydownHandler](e: KeyboardEvent): void;

  [methodSelectorClickHandler](): Promise<void>;

  /**
   * The handler for the method drop down list close event.
   */
  [methodClosedHandler](): void;

  /**
   * The handler for the HTTP method drop down.
   */
  [methodActivateHandler](e: CustomEvent): void;

  /**
   * The handler for the URL editor change event
   */
  [urlHandler](e: Event): void;

  [requestMenuHandler](e: Event): void;

  [tabChangeHandler](e: Event): void;

  /**
   * Refreshes payload and headers editors
   * state (code mirror) if currently selected.
   */
  refreshEditors(): Promise<void>;

  /**
   * The handler for the headers change event from the headers editor.
   */
  [headersHandler](e: Event): void;

  /**
   * The handler for the body editor change event
   */
  [bodyHandler](e: Event): void;

  /**
   * The handler for the authorization editor change event
   */
  [authorizationHandler](e: Event): void;

  /**
   * The handler for the actions editor change event
   */
  [actionsHandler](e: CustomEvent): void;

  /**
   * The handler for the actions editor UI state change event
   * @param {Event} e
   */
  [actionsUiHandler](e: Event): void;

  /**
   * The handler for the config editor change event
   * @param {} e
   */
  [configHandler](e: Event): void;

  /**
   * Called when a value on one of the editors change.
   * Dispatches non-bubbling `change` event.
   */
  notifyRequestChanged(): void;

  /**
   * Called to notify listeners about a particular property change
   * 
   * @param type The property that changed. The resulting event type is the combination of this value and the `change` suffix.
   * @param value The value of the changed property
   */
  notifyChanged(type: string, value: any): void;

  [contentWarningCloseHandler](): void;

  [sendIgnoreValidation](): void;

  [metaRequestEditorHandler](): void;

  [requestMetaCloseHandler](): void;

  [curlCloseHandler](e: CustomEvent): void;

  /**
   * Parses the cURL command and replaces the current request
   */
  [importCURL](value: string): void;

  render(): TemplateResult;

  /**
   * @returns The template for the top line with method selector, URL, and options.
   */
  [urlMetaTemplate](): TemplateResult;

  /**
   * @returns The template for the HTTP method selector
   */
  [httpMethodSelectorTemplate](): TemplateResult;

  /**
   * @returns {TemplateResult[]} The templates for each supported HTTP methods
   */
  [methodOptionsTemplate](): TemplateResult;

  /**
   * @returns The template for the HTTP URL editor
   */
  [urlEditorTemplate](): TemplateResult;

  /**
   * @returns The template for the request editor tabs
   */
  [tabsTemplate](): TemplateResult;

  /**
   * @returns The template for the current editor
   */
  [currentEditorTemplate](): TemplateResult;

  /**
   * @param visible Whether the panel should not be hidden
   * @returns The template for the headers editor
   */
  [headersTemplate](visible: boolean): TemplateResult;

  /**
   * @param {} visible Whether the panel should not be hidden
   * @returns The template for the body editor
   */
  [bodyTemplate](visible: boolean): TemplateResult;

  /**
   * @param visible Whether the panel should not be hidden
   * @returns The template for the authorization editor
   */
  [authorizationTemplate](visible: boolean): TemplateResult;

  /**
   * @param visible Whether the panel should be rendered
   * @returns The template for the ARC request actions editor
   */
  [actionsTemplate](visible: boolean): TemplateResult|string;

  /**
   * @param visible Whether the panel should be rendered
   * @returns The template for the ARC request config editor
   */
  [configTemplate](visible: boolean): TemplateResult|string;

  /**
   * @param visible Whether the panel should be rendered
   * @returns The template for the Code snippets
   */
  [snippetsTemplate](visible: boolean): TemplateResult|string;

  /**
   * @param visible Whether the panel should be rendered
   * @returns The template for the request meta details
   */
  [metaDetailsTemplate](visible: boolean): TemplateResult|string;

  /**
   * @returns The template for the invalid content headers dialog
   */
  [headersDialogTemplate](): TemplateResult;

  /**
   * @returns The template for the invalid content headers dialog
   */
  [curlDialogTemplate](): TemplateResult|string;
}
