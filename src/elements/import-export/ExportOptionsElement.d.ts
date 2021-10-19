import { CSSResult, TemplateResult } from 'lit-element';
import { ExportPanelBase } from './ExportPanelBase.js'

declare const acceptHandlerValue: unique symbol;
declare const cancelHandlerValue: unique symbol;
declare const resizeHandlerValue: unique symbol;

/**
 * `export-options`
 *
 * Export options dialog for ARC.
 * 
 * @fires accept When the user confirms the dialog
 * @fires cancel When the user cancels the dialog
 */
export declare class ExportOptionsElement extends ExportPanelBase {
  static get styles(): CSSResult;

  /**
   * The `accept` event handler
   */
  onaccept: EventListener;

  /**
   * The `cancel` event handler
   */
  oncancel: EventListener;

  /**
   * The `resize` event handler
   */
  onresize: EventListener;

  confirm(): void;

  cancel(): void;

  render(): TemplateResult;

  [acceptHandlerValue]: EventListener;
  [cancelHandlerValue]: EventListener;
  [resizeHandlerValue]: EventListener;
}
