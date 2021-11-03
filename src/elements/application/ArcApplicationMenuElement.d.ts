import { LitElement, TemplateResult, CSSResult } from 'lit-element';
import { ContextMenuCommand, MenuItem } from '@api-client/context-menu';
import { MenubarMixin } from '@anypoint-web-components/awc';

export default class ArcApplicationMenuElement extends MenubarMixin(LitElement) {
  static get styles(): CSSResult;

  clickHandler(e: Event): void;

  /**
   * Triggers a menu
   */
  trigger(node: HTMLElement): void;

  /**
   * Removes the currently rendered menu.
   */
  destroy(): void;

  menuClosedHandler(): void;

  /**
   * Handler for the `trigger` event dispatched by the menu
   */
  menuTriggerHandler(e: CustomEvent): void;

  getCommands(trigger: string): MenuItem[];

  render(): TemplateResult;
}
