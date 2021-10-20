import { TemplateResult } from 'lit-html';
import AuthorizationMethodElement from '../AuthorizationMethodElement';
import { AuthUiInit } from '../types';

export const changeCallback: unique symbol;
export const renderCallback: unique symbol;

export default class AuthUiBase {
  target: AuthorizationMethodElement;
  readOnly: boolean;
  disabled: boolean;
  anypoint: boolean;
  outlined: boolean;
  authorizing: boolean;

  constructor(init: AuthUiInit);

  /**
   * @param state The serialized state of the UI.
   */
  restore(state: any): void;

  /**
   * @returns {any} The serialized state of the UI.
   */
  serialize(): any;

  /**
   * Resets the current state of the UI.
   */
  reset(): void;

  /**
   * The main function used to generate a template for the UI.
   */
  render(): TemplateResult;

  /**
   * Sets default values for the authorization method.
   * This is called by the authorization-method element after 
   * the type is initialized.
   */
  defaults(): void;

  /**
   * A handler for the `input` event on an input element
   * @param e Original event dispatched by the input.
   */
  changeHandler(e: Event): void;

  /**
   * A handler for the `select` event on a dropdown element
   * @param e Original event dispatched by the input.
   */
  selectHandler(e: Event): void;

  /**
   * Notifies the application that the UI state has change
   */
  notifyChange(): void;

  /**
   * Notifies the application that the UI should be rendered.
   */
  requestUpdate(): Promise<void>;

  /**
   * Performs the authorization.
   * This only applies to methods that have any authorization to perform
   * like Oauth 2.
   */
  authorize(): Promise<any>;
}
