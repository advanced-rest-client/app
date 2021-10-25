import { LitElement, TemplateResult, CSSResult } from 'lit-element';
import { OverlayMixin } from '@anypoint-web-components/awc';
import { VariablesConsumerMixin } from './VariablesConsumerMixin.js';
import { Variable } from '@advanced-rest-client/events';

export const environmentTemplate: unique symbol;
export const systemTemplate: unique symbol;
export const variablesTemplate: unique symbol;
export const variableTemplate: unique symbol;
export const inputElement: unique symbol;
export const inputChanged: unique symbol;
export const inputKeydownHandler: unique symbol;
export const suggestionHandler: unique symbol;
export const inputMeta: unique symbol;
export const setInputMeta: unique symbol;
export const restoreInputMeta: unique symbol;

/**
 * An element that is an overlay that renders a list of variables for the current environment
 * and allows to select a variable to be inserted into a text field.
 * 
 * @fires select Custom event dispatched when `preferEvent` is set. The detail is the variable name.
 */
export default class VariablesSuggestionsElement extends VariablesConsumerMixin(OverlayMixin(LitElement)) {
  static get styles(): CSSResult[];

  /**
   * Enables Anypoint theme
   * @attribute
   */
  anypoint: boolean;
  /** 
   * The id to be set on the list element.
   * This can be used to manually set the id on the list element.
   * @attribute
   */
  listId: string;
  /** 
   * When set it dispatches the `select` event instead of updating the input value.
   * This is assumed as to be true when the `input` is not set.
   * @attribute
   */
  preferEvent: boolean;

  /**
   * The input element that is related to this autocomplete.
   */
  input: HTMLInputElement

  constructor();

  connectedCallback(): void;

  disconnectedCallback(): void;
  /**
   * @param value The new input set on this element
   * @param old The previously set input.
   */
  [inputChanged](value: HTMLInputElement, old: HTMLInputElement): void;

  /**
   * Caches original aria attributes and sets own aria attributes to the input.
   */
  [setInputMeta](input: HTMLElement): void;

  /**
   * Restores the original ARIA values on the input.
   */
  [restoreInputMeta](input: HTMLElement): void;

  _openedChanged(value: boolean): void;

  [inputKeydownHandler](e: KeyboardEvent): void;

  [suggestionHandler](e: Event): void;

  /**
   * Refreshes the current environment and list of available environments
   */
  reset(): Promise<void>;

  /**
   * @returns The main template.
   */
  render(): TemplateResult;

  /**
   * @returns The template for environment variables list items
   */
  [environmentTemplate](): TemplateResult;

  /**
   * @returns {TemplateResult|string} The template for system variables list items
   */
  [systemTemplate](): TemplateResult | string;

  /**
   * @param items The variables to render. This should only by enabled variables.
   * @returns The templates for each variable item.
   */
  [variablesTemplate](items: Variable.ARCVariable[]): TemplateResult[];

  /**
   * @param item The variable to render.
   * @returns The template for the variable.
   */
  [variableTemplate](item: Variable.ARCVariable): TemplateResult;
}
