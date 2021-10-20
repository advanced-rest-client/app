import {LitElement, TemplateResult, CSSResult} from 'lit-element';
import {ValidatableMixin, OverlayMixin, ResizableMixin} from '@anypoint-web-components/awc';
import {UrlParser} from '../../lib/UrlParser';
import {
  getHostValue,
  findSearchParam,
  findModelParam,
  valueValue,
  valueChanged,
  notifyChange,
  computeModel,
  computeSearchParams,
  queryModelChanged,
  updateParserSearch,
  parserValue,
  addParamHandler,
  removeParamHandler,
  encodeQueryParameters,
  decodeQueryParameters,
  enabledHandler,
  paramInputHandler,
  formTemplate,
  actionsTemplate,
  listTemplate,
  paramItemTemplate,
  paramRemoveTemplate,
  paramToggleTemplate,
  paramNameInput,
  paramValueInput,
} from './internals.js';

export declare interface QueryParameter {
  /**
   * The name of the parameter
   */
  name: string;
  /**
   * The value of the parameter
   */
  value: string;
  /**
   * Whether the parameter is currently enabled.
   */
  enabled: boolean;
}

export declare interface ViewModel {
  host: string;
  path: string;
  anchor: string;
}

/**
 * An element that works with the `url-input-editor` that renders an overlay
 * with query parameter values.
 * 
 * @fires change When a value change
 * @fires urlencode When requesting to encode current value
 * @fires urldecode When requesting to decode current value
 */
export default class UrlParamsEditorElement extends ValidatableMixin(OverlayMixin(ResizableMixin(LitElement))) {
  static readonly styles: CSSResult;

  /**
   * Current value of the editor.
   * @attribute
   */
  value: string;
  [valueValue]: string;

  /**
   * Enables outlined theme.
   * @attribute
   */
  outlined: boolean;

  /**
   * Enables compatibility with Anypoint components.
   * @attribute
   */
  compatibility: boolean;

  /**
   * Computed data model for the view.
   */
  model: ViewModel;

  /**
   * List of query parameters model.
   * If not set then it is computed from current URL.
   *
   * Model for query parameters is:
   * - name {String} param name
   * - value {String} param value
   * - enabled {Boolean} is param included into the `value`
   */
  queryParameters: QueryParameter[];

  /**
   * When set the editor is in read only mode.
   * @attribute
   */
  readOnly: boolean;

  [parserValue]: UrlParser;
  
  constructor();
  [notifyChange](): void;

  /**
   * A handler that is called on input
   */
  [valueChanged](value: string): void;
  [computeModel](value: string, queryModel: QueryParameter[]): void;
  [computeSearchParams](parser: UrlParser, queryModel: QueryParameter[]): void;

  [queryModelChanged](): void;

  /**
   * Updates `queryParameters` model from change record.
   *
   * @param model Current model for the query parameters
   */
  [updateParserSearch](model: QueryParameter[]): void;

  /**
   * Focuses on the last query parameter name filed
   */
  focusLastName(): void;

  /**
   * Adds a new Query Parameter to the list.
   */
  [addParamHandler](): Promise<void>;

  /**
   * Handler for the remove button click.
   */
  [removeParamHandler](e: CustomEvent): Promise<void>;

  /**
   * Validates the element.
   *
   * @returns True if the form is valid.
   */
  _getValidity(): boolean;

  /**
   * Dispatches the `url-encode` event. The editor handles the action.
   */
  [encodeQueryParameters](): void;

  /**
   * Dispatches the `url-decode` event. The editor handles the action.
   */
  [decodeQueryParameters](): void;
  [enabledHandler](e: CustomEvent): void;
  [paramInputHandler](e: CustomEvent): void;

  [getHostValue](parser: UrlParser): string;
  [findSearchParam](searchParams: Array<string[]>, name: string): string[]|undefined;
  [findModelParam](model: QueryParameter[], name: string): QueryParameter|undefined;

  render(): TemplateResult;
  [formTemplate](): TemplateResult;
  [listTemplate](items: QueryParameter): TemplateResult;
  [paramItemTemplate](item: QueryParameter, index: number): TemplateResult;
  [paramRemoveTemplate](index: number): TemplateResult;
  [paramToggleTemplate](item: QueryParameter, index: number): TemplateResult;
  [paramNameInput](item: QueryParameter, index: number): TemplateResult;
  [paramValueInput](item: QueryParameter, index: number): TemplateResult;
  [actionsTemplate](): TemplateResult;
}
