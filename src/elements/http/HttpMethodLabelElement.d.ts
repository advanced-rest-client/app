import {LitElement, TemplateResult} from 'lit-element';

export const updateAccessibility: unique symbol;

/**
 * The element displays a label for the HTTP method. If the method is one of the
 * predefined methods then it will use predefined colors to mark the method.
 *
 * ### Example
 *
 * ```html
 * <http-method-label method="GET"></http-method-label>
 * ```
 *
 * If the method is not one of the predefined methods it can be styled using regular
 * css.
 *
 * ```html
 * <style>
 * http-method-label[method="test"] {
 *    color: white;
 *    background-color: orange;
 * }
 * </style>
 * <http-method-label method="TEST"></http-method-label>
 * ```
 */
export default class HttpMethodLabelElement extends LitElement {
  /**
   * HTTP method name to display
   * @attribute
   */
  method: string|undefined;
  constructor();
  render(): TemplateResult;

  /**
   * Updates "title" and `aria-label` attributes when method changes.
   *
   * @param method Current method
   */
  [updateAccessibility](method: string): void;
}
