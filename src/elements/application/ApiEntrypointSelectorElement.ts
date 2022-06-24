import { html, css, CSSResult, TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import { AnypointDialogElement, AnypointDialogStylesInternal, AnypointListboxElement } from '@anypoint-web-components/awc';
import '@anypoint-web-components/awc/dist/define/anypoint-button.js';
import '@anypoint-web-components/awc/dist/define/anypoint-listbox.js';
import '@anypoint-web-components/awc/dist/define/anypoint-item.js';

/** @typedef {import('@anypoint-web-components/awc').AnypointListboxElement} AnypointListboxElement */

export const closedHandler = Symbol('closedHandler');
export const selectedHandler = Symbol('selectedHandler');

export default class ApiEntrypointSelectorElement extends AnypointDialogElement {
  static get styles(): CSSResult[] {
    return [
      AnypointDialogStylesInternal,
      css`
      :host {
        min-width: 360px;
      }
      `,
    ]
  }

  @property({ type: Array }) files?: string[];

  @property({ type: String, reflect: true }) selected?: string;

  constructor() {
    super();
    this.addEventListener('closed', this[closedHandler].bind(this));
  }

  [closedHandler](): void {
    const { parentNode } = this;
    if (parentNode) {
      parentNode.removeChild(this);
    }
  }

  [selectedHandler](e: Event): void {
    const list = e.target as AnypointListboxElement;
    this.selected = list.selected as string;
  }

  render(): TemplateResult {
    const { files=[], selected } = this;
    return html`
    <h2>Select API main file</h2>
    <div class="content">
      <anypoint-listbox attrForSelected="data-value" .selected="${selected}" @selected="${this[selectedHandler]}">
        ${files.map(item => html`<anypoint-item data-value="${item}">${item}</anypoint-item>`)}
      </anypoint-listbox>
    </div>
    <div class="buttons">
      <anypoint-button data-dialog-dismiss ?anypoint="${this.anypoint}">Cancel</anypoint-button>
      <anypoint-button data-dialog-confirm ?anypoint="${this.anypoint}" ?disabled="${!selected}">Confirm</anypoint-button>
    </div>
    `;
  }
}
