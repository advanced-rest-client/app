import { LitElement, html, css } from 'lit-element';
import { FileDropMixin } from '../../index.js';

export class TestElement extends FileDropMixin(LitElement) {
  static get styles() {
    return css`:host {
      display: block;
    }`;
  }

  render() {
    return html``;
  }
}
window.customElements.define('test-element', TestElement);
