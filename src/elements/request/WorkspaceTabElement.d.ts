import { LitElement, TemplateResult } from 'lit-element';

export const pointerDownHandler: unique symbol;
export const touchStartHandler: unique symbol;

/**
 * @fires close Dispatches when close tab action is detected.
 */
export default class WorkspaceTabElement extends LitElement {
  connectedCallback(): void;
  disconnectedCallback(): void;

  /**
   * A handler for the pointer down event.
   * It dispatches the `close` event when middle button is clicked.
   */
  [pointerDownHandler](e: PointerEvent): void;

  /**
   * A handler for the touch start event.
   * It handles actions depending on the touch configuration.
   */
  [touchStartHandler](e: TouchEvent): void;

  render(): TemplateResult;
}
