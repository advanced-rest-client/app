import Element from '../elements/application/ArcApplicationMenuElement.js';

window.customElements.define('arc-application-menu', Element);

declare global {
  interface HTMLElementTagNameMap {
    'arc-application-menu': Element;
  }
}
