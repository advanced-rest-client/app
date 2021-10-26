import { LitElement, TemplateResult } from 'lit-element';
import { AnypointAutocompleteElement, ResizableMixin, EventsTargetMixin } from '@anypoint-web-components/awc';
import { WebSocket } from '@advanced-rest-client/events';
import { WebsocketEditorRequest } from '@advanced-rest-client/events/src/request/WebSocket';

export declare const internalConnectHandler: unique symbol;
export declare const urlAreaTemplate: unique symbol;
export declare const urlEditorTemplate: unique symbol;
export declare const connectTemplate: unique symbol;
export declare const tabsTemplate: unique symbol;
export declare const bodyTemplate: unique symbol;
export declare const urlAutocompleteTemplate: unique symbol;
export declare const autocompleteResizeHandler: unique symbol;
export declare const autocompleteRef: unique symbol;
export declare const setShadowHeight: unique symbol;
export declare const shadowContainerHeight: unique symbol;
export declare const shadowContainerOpened: unique symbol;
export declare const mainFocusBlurHandler: unique symbol;
export declare const focusedValue: unique symbol;
export declare const suggestionsOpenedHandler: unique symbol;
export declare const autocompleteOpened: unique symbol;
export declare const urlInputHandler: unique symbol;
export declare const autocompleteQuery: unique symbol;
export declare const readAutocomplete: unique symbol;
export declare const shadowTemplate: unique symbol;
export declare const positionTargetValue: unique symbol;
export declare const currentEditorTemplate: unique symbol;
export declare const internalSendHandler: unique symbol;
export declare const bodyChangeHandler: unique symbol;
export declare const editorMimeHandler: unique symbol;
export declare const sendTemplate: unique symbol;
export declare const keydownHandler: unique symbol;

export default class ArcWebsocketEditorElement extends ResizableMixin(EventsTargetMixin(LitElement)) {

  get [autocompleteRef](): AnypointAutocompleteElement;

  /**
   * Current request URL
   * @attribute
   */
  url: string;
  /**
   * Generated request ID when the connection is being initiated. This value is reported
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
   * An index of currently opened tab.
   * @default 0
   * @attribute
   */
  selectedTab: number;
  /** 
   * This is to be set to indicate that the connection has been made.
   * The internal logic does not alter this value. This is to reflect the state.
   * @attribute
   */
  connected: boolean;
  /** 
   * This is to be set to indicate that the connection is being made.
   * The internal logic does not alter this value. This is to reflect the state.
   * @attribute
   */
  connecting: boolean;
  /** 
   * Set upon calling `validate()`, when the request is invalid.
   * @attribute
   */
  invalid: boolean;
  /** 
   * The current message to send.
   */
  payload?: string|File|Blob|ArrayBuffer;
  /** 
   * The editors configuration meta data
   */
  uiConfig?: WebSocket.WebsocketRequestUiMeta;
  /** 
   * The mime type of the body editor.
   * @attribute
   */
  mimeType: string;

  constructor();

  _attachListeners(node: EventTarget): void;

  _detachListeners(node: EventTarget): void;

  [internalSendHandler](e: Event): void;

  [keydownHandler](e: KeyboardEvent): void;

  /**
   * Resets the current state actively generating new request object
   */
  reset(): void;

  /**
   * Serializes the request to the EditorRequest object with the `ArcBaseRequest` request on it.
   */
  serialize(): WebsocketEditorRequest;

  /**
   * @returns False when the request is invalid.
   */
  validate(): boolean;

  /**
   * Dispatches an event with the request data to initialize the connection.
   */
  connect(): void;

  /**
   * Dispatches an event to close the existing connection.
   * It does nothing when not connected.
   */
  disconnect(): void;

  /**
   * Dispatches an event send the data with the current connection
   * It does nothing when not connected.
   */
  send(): void;

  /**
   * Refreshes payload and headers editors
   * state (code mirror) if currently selected.
   */
  refreshEditors(): Promise<void>;

  [internalConnectHandler](e: Event): void;

  /**
   * Sets a height on the shadow background element.
   */
  [setShadowHeight](height: number): void;

  [mainFocusBlurHandler](e: Event): void;

  [suggestionsOpenedHandler](e: CustomEvent): void;

  [autocompleteResizeHandler](): void;

  /**
   * @param e A handler for either main input or the details editor value change
   */
  [urlInputHandler](e: Event): void;

  /**
   * Handler for autocomplete element query event.
   */
  [autocompleteQuery](e: CustomEvent): Promise<void>;

  /**
   * Queries the data model for history data and sets the suggestions
   * @param q User query from the input field
   */
  [readAutocomplete](q: string): Promise<void>;

  [bodyChangeHandler](e: Event): void;

  /**
   * Called when a value on one of the editors change.
   * Dispatches non-bubbling `change` event.
   */
  notifyChanged(): void;

  [editorMimeHandler](e: Event): void;

  render(): TemplateResult;

  /**
   * @returns The template for the URL line.
   */
  [urlAreaTemplate](): TemplateResult;

  /**
   * @returns The template for the web socket URL input
   */
  [urlEditorTemplate](): TemplateResult;

  /**
   * @returns The template for the autocomplete element
   */
  [urlAutocompleteTemplate](): TemplateResult;

  /**
   * @returns The template for the background shadow below the main input and the overlays
   */
  [shadowTemplate](): TemplateResult;

  [connectTemplate](): TemplateResult;

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
   * @returns The template for the body editor
   */
  [bodyTemplate](visible: boolean): TemplateResult;

  [sendTemplate](): TemplateResult;
}
