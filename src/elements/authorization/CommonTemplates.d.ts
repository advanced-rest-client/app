import { TemplateResult } from 'lit-element';

declare interface InputConfiguration {
  /**
   * Type of the control
   */
  type?: string;
  /**
   * Invalid message
   */
  invalidLabel?: string;
  /**
   * Info message
   */
  infoLabel?: string;
  /**
   * CSS class names
   */
  classes?: object;
  autoValidate?: boolean;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  anypoint?: boolean;
  outlined?: boolean;
  /**
   * Whether `autocomplete` is on. Default to `true`.
   */
  autocomplete?: boolean;
}

/**
 * @param name Input name
 * @param value Current input value
 * @param label The label to render
 * @param inputHandler Handler for the input event.
 * @param opts Optional configuration options
 * @returns Template for an input element.
 */
export declare function inputTemplate(name: string, value: string|number, label: string, inputHandler: Function, opts?: InputConfiguration): TemplateResult;

/**
 * @param name Input name
 * @param value Current input value
 * @param label The label to render
 * @param inputHandler Handler for the input event.
 * @param opts Optional configuration options
 * @returns Template for an password input element.
 */
export declare function passwordTemplate(name: string, value: string|number, label: string, inputHandler: Function, opts?: InputConfiguration): TemplateResult;
