import { TemplateResult, CSSResult, LitElement } from 'lit-element';
import { EventsTargetMixin, AnypointAutocompleteElement } from '@anypoint-web-components/awc';
import { RequestChangeEvent, FormTypes } from '@advanced-rest-client/events';
import {
  valueValue,
  createViewModel,
  viewModel,
  valueFromModel,
  notifyValueChange,
  sourceTemplate,
  formTemplate,
  addTemplate,
  emptyTemplate,
  contentActionsTemplate,
  headerItemTemplate,
  headerToggleTemplate,
  headerRemoveTemplate,
  headerNameInput,
  headerValueInput,
  removeHeaderHandler,
  enabledHandler,
  headerInputHandler,
  propagateModelChange,
  addHeaderHandler,
  autocompleteTemplate,
  inputFocusHandler,
  autocompleteRef,
  copyHandler,
  resetCopyState,
  sourceModeHandler,
  cmExtraKeys,
  cmKeysHandler,
  cmValueHandler,
  focusLastName,
  contentTypeHandler,
  copyActionButtonTemplate,
  editorSwitchTemplate,
} from './internals.js';

/**
 * @fires change Dispatches when a value change after the user manipulate the editor value.
 */
export default class HeadersEditorElement extends EventsTargetMixin(LitElement) {
  static readonly styles: CSSResult;
  
  /**
   * Headers value.
   * @attribute
   */
  value: string;
  [valueValue]: string;
  /**  
   * The view model to use to render the values.
   * Note, the `model` property is immediately updated when the `value` is set.
   * When the hosting application uses both values make sure to only set the `model` property.
   * 
   * Also note, there's no dedicated event for the model change. When value change then
   * the model changed as well.
   */
  model: FormTypes.FormItem[];
  [viewModel]: FormTypes.FormItem[];
  /**  
   * When enabled it renders source mode (code mirror editor with headers support)
   * @attribute
   */    
  source: boolean;
  /**
   * When set the editor is in read only mode.
   * @attribute
   */
  readOnly: boolean;
  /**
   * Enables Anypoint theme.
   * @attribute
   */
  anypoint: boolean;
  /**
   * Enables Material Design outlined style
   * @attribute
   */
  outlined: boolean;
  readonly [autocompleteRef]: AnypointAutocompleteElement;
  readonly [cmExtraKeys]: object;

  constructor();

  _attachListeners(node: EventTarget): void;
  _detachListeners(node: EventTarget): void;

  /**
   * Updates header value. If the header does not exist in the editor it will be created.
   * @param name Header name
   * @param value Header value
   */
  updateHeader(name: string, value: string): void;

  /**
   * Removes header from the editor by its name.
   * @param name Header name
   */
  removeHeader(name: string): void;

  /**
   * Adds a header to the list of headers
   */
  add(): void;
  [contentTypeHandler](e: RequestChangeEvent): void;

  /**
   * Parses headers string to a view model.
   * @returns View model for the headers.
   */
  [createViewModel](input: string): FormTypes.FormItem[];
  [valueFromModel](model: FormTypes.FormItem[]): string;

  /**
   * Dispatches `change` event to notify about the value change
   */
  [notifyValueChange](): void;

  /**
   * Updates the `value` from the current model and dispatches the value change event
   */
  [propagateModelChange](): void;
  [enabledHandler](e: CustomEvent): void;
  [headerInputHandler](e: CustomEvent): void;

  /**
   * Handler to the remove a header
   */
  [removeHeaderHandler](e: PointerEvent): void;

  /**
   * A handler for the add header click.
   */
  [addHeaderHandler](): Promise<void>;

  /**
   * Adds autocomplete support for the currently focused header.
   */
  [inputFocusHandler](e: Event): void;

  /**
   * Copies current response text value to clipboard.
   */
  [copyHandler](e: Event): void;

  [resetCopyState](button: HTMLButtonElement): void;

  /**
   * Toggles the source view
   */
  [sourceModeHandler](e: Event): Promise<void>;

  /**
   * Code mirror's ctrl+space key handler.
   * Opens headers fill support.
   *
   * @param cm Code mirror instance.
   */
  [cmKeysHandler](cm: any): void;

  /**
   * Handler for the CodeMirror input event.
   */
  [cmValueHandler](e: Event): void;

  /**
   * Focuses on the last header name filed
   */
  [focusLastName](): void;

  render(): TemplateResult;

  /**
   * @returns a template for the content actions
   */
  [contentActionsTemplate](): TemplateResult;

  /**
   * @returns The template for the copy action button
   */
  [copyActionButtonTemplate](): TemplateResult;

  /**
   * @returns The template for the editor type switch
   */
  [editorSwitchTemplate](): TemplateResult;

  /**
   * @returns a template for the content actions
   */
  [sourceTemplate](): TemplateResult;

  /**
   * @returns a template for the content actions
   */
  [formTemplate](): TemplateResult;

  /**
   * @returns a template for the empty list view
   */
  [emptyTemplate](): TemplateResult;

  [headerItemTemplate](item: FormTypes.FormItem, index: number): TemplateResult;

  /**
   * @returns a template for the content actions
   */
  [addTemplate](): TemplateResult;

  /**
   * @return Template for the parameter name input
   */
  [headerRemoveTemplate](index: number): TemplateResult;

  /**
   * @return Template for the parameter name input
   */
  [headerToggleTemplate](item: FormTypes.FormItem, index: number): TemplateResult;

  /**
   * @return Template for the parameter name input
   */
  [headerNameInput](item: FormTypes.FormItem, index: number): TemplateResult;

  /**
   * @return Template for the parameter value input
   */
  [headerValueInput](item: FormTypes.FormItem, index: number): TemplateResult;

  /**
   * @returns A template for the autocomplete element
   */
  [autocompleteTemplate](): TemplateResult;
}
