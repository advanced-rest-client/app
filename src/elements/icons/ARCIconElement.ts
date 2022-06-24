import { html, css, CSSResult, TemplateResult, LitElement, SVGTemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import * as Icons from './Icons.js';
import { IconType } from './Icons.js';

/**
 * An element to render a 24x24 icon.
 * By default it inherits current color. The fill color can be changed by setting
 * the CSS' color property.
 */
export default class ARCIconElement extends LitElement {
  get styles(): CSSResult {
    return css`
      :host {
        display: inline-block;
        width: 24px;
        height: 24px;
        fill: currentColor;
      }
    `;
  }

  private _icon: IconType | undefined;

  private _hasIcon = false;

  private _iconValue: SVGTemplateResult | undefined;

  /**
   * An icon to be rendered from the ApiIcons library.
   * When incorrect icon is referenced nothing is rendered.
   */
  @property()
  get icon(): IconType | undefined {
    return this._icon;
  }

  set icon(value: IconType | undefined) {
    const old = this._icon;
    if (old === value) {
      return;
    }
    this._icon = value;
    this._updateIcon(value);
    // don't request update here
  }

  /**
   * @returns True when the icon was found and is rendered.
   */
  get hasIcon(): boolean {
    return this._hasIcon;
  }

  /**
   * Maps icon name to it's definition and sets `hasIcon` value.
   *
   * @param name Icon name
   */
  protected _updateIcon(name: IconType | undefined): void {
    const icon = Icons[name as IconType] as SVGTemplateResult | undefined;
    this._hasIcon = !!icon;
    this._iconValue = icon;
    this.requestUpdate();
  }

  /**
   * @return Template result for an icon
   */
  render(): TemplateResult {
    const { hasIcon, _iconValue } = this;
    if (!hasIcon) {
      return html`<slot></slot>`;
    }
    return html`${_iconValue}`;
  }
}
