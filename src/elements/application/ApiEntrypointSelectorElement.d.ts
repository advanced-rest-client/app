import { LitElement, TemplateResult } from 'lit-element';
import { AnypointDialogMixin } from '@anypoint-web-components/awc';

export const closedHandler: unique symbol;
export const selectedHandler: unique symbol;

export default class ApiEntrypointSelectorElement extends AnypointDialogMixin(LitElement) {
  files: string[]
  /**
   * @attribute
   */
  anypoint: boolean;
  /**
   * @attribute
   */
  selected: string;
  constructor();
  connectedCallback(): void;
  disconnectedCallback(): void;
  [closedHandler](): void;
  [selectedHandler](e: Event): void;

  render(): TemplateResult;
}
