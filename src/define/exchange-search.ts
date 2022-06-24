import Element from '../elements/exchange-search/ExchangeSearchElement.js';

window.customElements.define('exchange-search', Element);

declare global {
  interface HTMLElementTagNameMap {
    "exchange-search": Element;
  }
}
