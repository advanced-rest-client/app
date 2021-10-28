import { LitElement, CSSResult, TemplateResult } from 'lit-element';
import { AnypointDialogMixin } from '@anypoint-web-components/awc';

export declare const closedHandler: unique symbol;

export default class AlertDialogElement extends AnypointDialogMixin(LitElement) {
  static get styles(): CSSResult[];

  /**
   * @attribute
   */
  message: string;
  /**
   * @attribute
   */
  anypoint: boolean;

  constructor();

  connectedCallback(): void;

  disconnectedCallback(): void;

  [closedHandler](): void;

  render(): TemplateResult;
}
