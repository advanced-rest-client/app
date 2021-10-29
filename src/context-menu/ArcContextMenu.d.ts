import { ContextMenu } from '@api-client/context-menu';

export class ArcContextMenu extends ContextMenu {
  /**
   * Finds the click target from the event
   */
  findTarget(e: MouseEvent): HTMLElement|SVGElement|undefined;

  /**
   * Maps an element to an internal target name. This should be overridden by the implementation.
   *
   * @param element The context click target
   * @returns The internal target name.
   */
  elementToTarget(element: HTMLElement|SVGElement): string|undefined;
}
