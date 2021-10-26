import { LitElement, html } from 'lit-element';
import { SelectableMixin } from '@anypoint-web-components/awc';
import elementStyles from './styles/Tabs.js';

export const itemsChangeHandler = Symbol('itemsChangeHandler');
export const keyDownHandler = Symbol('keyDownHandler');

export default class WorkspaceTabsElement extends SelectableMixin(LitElement) {
  static get styles() {
    return elementStyles;
  }

  constructor() {
    super();
    this.selectable = 'workspace-tab';

    this[itemsChangeHandler] = this[itemsChangeHandler].bind(this);
    this[keyDownHandler] = this[keyDownHandler].bind(this);
  }

  connectedCallback() {
    if (!this.hasAttribute('role')) {
      this.setAttribute('role', 'tablist');
    }
    if (!this.hasAttribute('aria-label')) {
      this.setAttribute('aria-label', 'Requests list');
    }
    super.connectedCallback();
    this.addEventListener('itemschange', this[itemsChangeHandler]);
    this.addEventListener('keydown', this[keyDownHandler]);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('itemschange', this[itemsChangeHandler]);
    this.removeEventListener('keydown', this[keyDownHandler]);
  }

  _applySelection(item, isSelected) {
    super._applySelection(item, isSelected);
    item.setAttribute('aria-selected', String(isSelected));
    item.setAttribute('tabindex', isSelected ? '0' : '-1');
  }

  [itemsChangeHandler]() {
    const { items, selectedItem } = this;
    items.forEach((node) => {
      node.setAttribute('aria-selected', String(node === selectedItem));
      node.setAttribute('tabindex', node === selectedItem ? '0' : '-1');
    });
  }

  /**
   * @param {KeyboardEvent} e
   */
  [keyDownHandler](e) {
    if (e.code === 'ArrowLeft') {
      this.selectPrevious();
      this.dispatchEvent(new CustomEvent('selected'));
      this.selectedItem.focus();
    } else if (e.code === 'ArrowRight') {
      this.selectNext();
      this.dispatchEvent(new CustomEvent('selected'));
      this.selectedItem.focus();
    } else if (e.code === 'Home') {
      this.selected = 0;
      this.dispatchEvent(new CustomEvent('selected'));
      this.selectedItem.focus();
    } else if (e.code === 'End') {
      this.selected = this.items.length - 1;
      this.dispatchEvent(new CustomEvent('selected'));
      this.selectedItem.focus();
    }
  }

  render() {
    return html`
    <div class="container">
      <slot></slot>
    </div>
    <slot name="suffix"></slot>
    `;
  }
}
