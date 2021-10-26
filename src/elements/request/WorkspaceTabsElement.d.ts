import { LitElement, TemplateResult } from 'lit-element';
import { SelectableMixin } from '@anypoint-web-components/awc';

export declare const itemsChangeHandler: unique symbol;
export declare const keyDownHandler: unique symbol;

export default class WorkspaceTabsElement extends SelectableMixin(LitElement) {
  constructor();

  connectedCallback(): void;

  disconnectedCallback(): void;

  _applySelection(item: HTMLElement, isSelected: boolean): void;

  [itemsChangeHandler](): void;

  [keyDownHandler](e: KeyboardEvent): void;

  render(): TemplateResult;
}
