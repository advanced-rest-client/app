import Element from '../elements/icons/ARCIconElement.js';

window.customElements.define('arc-icon', Element);

declare global {
  interface HTMLElementTagNameMap {
    "arc-icon": Element;
  }
}
