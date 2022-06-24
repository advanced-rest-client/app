import { EventTypes } from "./EventTypes.js";

export interface ContextMenuActionDetail {
  /**
   * The property to be used to recognize which context menu action the application should render.
   */
  selector: string;
  /**
   * The original MouseEvent associated with the action.
   */
  mouseEvent: MouseEvent;
  /**
   * The element that should be considered as the target of the click.
   * Default to event target.
   */
  target?: HTMLElement|SVGElement;
  /**
   * Any argument to be passed to the context menu "execute" function.
   */
  args?: any;
}

export class UiEvents {
  /**
   * @param detail The context menu action init.
   */
  static contextMenu(detail: ContextMenuActionDetail, target: EventTarget = window): void {
    const e = new CustomEvent(EventTypes.Ui.contextMenu, {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail,
    });
    target.dispatchEvent(e);
  }
}
