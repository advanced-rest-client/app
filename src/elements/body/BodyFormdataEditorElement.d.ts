import { LitElement, TemplateResult, CSSResult } from 'lit-element';
import { ApiTypes } from '@advanced-rest-client/events';
import {
  valueValue,
  modelValue,
  valueChanged,
  notifyChange,
  formTemplate,
  actionsTemplate,
  paramItemTemplate,
  paramToggleTemplate,
  paramNameInput,
  paramValueInput,
  paramRemoveTemplate,
  paramInputHandler,
  removeParamHandler,
  enabledHandler,
  modelChanged,
  modelToValue,
  encodeParameters,
  decodeParameters,
  addParamHandler,
  addParamTemplate,
} from './internals.js';


export default class BodyFormdataEditorElement extends LitElement {
  static readonly styles: CSSResult;

  /**
   * A HTTP body.
   * @attribute
   */
  value: string;
  [valueValue]: string;
  /**
   * Computed data model for the view.
   * Don't set both `value` and `model`. If the model exists then
   * set only it or otherwise the `value` setter override the model.
   */
  model: ApiTypes.ApiType[];
  [modelValue]: ApiTypes.ApiType[];
  /**
   * Enables Anypoint theme
   * @attribute
   */
  anypoint: boolean;
  /**
   * Enables Material Design outlined style
   * @attribute
   */
  outlined: boolean;
  /**
   * When set the editor is in read only mode.
   * @attribute
   */
  readOnly: boolean;
  /**
   * When set all controls are disabled in the form
   * @attribute
   */
  disabled: boolean;
  /** 
   * When set it automatically encodes and decodes values.
   * @attribute
   */
  autoEncode: boolean;

  constructor();

  [notifyChange](): void;

  [modelChanged](): void;

  [modelToValue](): string;

  [valueChanged](value: string): void;

  [removeParamHandler](e: PointerEvent): void;

  [enabledHandler](e: CustomEvent): void;

  [paramInputHandler](e: CustomEvent): void;

  /**
   * Focuses on the last query parameter name filed
   */
  focusLastName(): void;

  /**
   * Adds a new parameter to the list.
   */
  [addParamHandler](): Promise<void>;

  /**
   * Encodes current parameters in the model, updated the value, and notifies the change
   */
  [encodeParameters](): void;

  /**
   * Encodes current parameters in the model, updated the value, and notifies the change
   */
  [decodeParameters](): void;

  render(): TemplateResult;

  [formTemplate](): TemplateResult;

  [addParamTemplate](): TemplateResult;

  [paramItemTemplate](item: ApiTypes.ApiType, index: number): TemplateResult;

  /**
   * @return Template for the parameter name input
   */
  [paramRemoveTemplate](index: number): TemplateResult;

  /**
   * @return Template for the parameter name input
   */
  [paramToggleTemplate](item: ApiTypes.ApiType, index: number): TemplateResult;

  /**
   * @return Template for the parameter name input
   */
  [paramNameInput](item: ApiTypes.ApiType, index: number): TemplateResult;

  /**
   * @return Template for the parameter value input
   */
  [paramValueInput](item: ApiTypes.ApiType, index: number): TemplateResult;

  [actionsTemplate](): TemplateResult|string;
}
