import { LitElement, TemplateResult, CSSResult } from 'lit-element';
import {
  pageTemplate,
  messageChanged,
  messageValue,
} from './internals.js'


/**
 * A view for the response error.
 *
 * The element renders predefined error message with icon and depending on the
 * `message` property it renders custom message or a predefined explanation
 * if the message is one of the Chrome's network errors (net::*).
 */
export default class ResponseErrorElement extends LitElement {
  get styles(): CSSResult;

  /**
   * Message to display.
   *
   * The message can be one of the Chrome's net::* error codes. In this
   * case the element will display predefined message.
   * @attribute
   */
  message: string;
  [messageValue]: string;
  /**
   * Opened detailed message page.
   * @attribute
   */
  detailsPage: number;
  /**
   * Enables Anypoint theme
   * @attribute
   */
  anypoint: boolean;

  connectedCallback(): void;

  /**
   * A handler to the message change
   */
  [messageChanged](msg: string): void;

  render(): TemplateResult;

  /**
   * @param {number} selected
   * @param {string} message
   * @returns {TemplateResult|string} A template for the error message for specific code.
   */ 
  [pageTemplate](selected: number, message: string): TemplateResult;
}
