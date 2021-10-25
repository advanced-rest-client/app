import { LitElement, TemplateResult } from 'lit-element';
import { HostRule } from '@advanced-rest-client/events';

export const evaluate: unique symbol;
export const evaluateAgainst: unique symbol;
export const createRuleRe: unique symbol;
export const keyDownHandler: unique symbol;
export const inputHandler: unique symbol;
export const resultValue: unique symbol;
export const resultTemplate: unique symbol;

/**
 * An element that tests user input against provided host rules.
 *
 * The host rules is a model received from `host-rules-editor`. However,
 * it can be any object that contains `from` and `to` properties.
 *
 * It evaluates user entered URL against provided rules and displays the
 * result of the computation.
 */
export default class HostRulesTesterElement extends LitElement {
  /**
   * Provided by the user URL
   * @attribute
   */
  url: string;

  /**
   * List of rules to use to evaluate the URL
   */
  rules?: HostRule.ARCHostRule[];

  /**
   * Enables Anypoint theme
   * @attribute
   */
  anypoint: boolean;

  /**
   * Enables material design outlined theme
   * @attribute
   */
  outlined: boolean;
  constructor();

  testUrl(): void;
  
  [evaluate](): string;

  [evaluateAgainst](url: string, rule: HostRule.ARCHostRule): string|undefined;

  [createRuleRe](input: string): RegExp;

  [keyDownHandler](e: KeyboardEvent): void;

  [inputHandler](e: Event): void;

  /**
   * @return The template for the main UI
   */
  render(): TemplateResult;

  /**
   * @return The template for the test result, if any.
   */
  [resultTemplate](): TemplateResult|string;
}
