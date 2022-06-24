import Element from '../elements/application/ApiEntrypointSelectorElement.js';

window.customElements.define('api-entrypoint-selector', Element);

declare global {
  interface HTMLElementTagNameMap {
    'api-entrypoint-selector': Element;
  }
}
