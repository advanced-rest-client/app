import { html, css, LitElement } from 'lit-element';

class CustomAuthMethodDemo extends LitElement {
  static get properties() {
    return {
      type: { type: String }
    };
  }

  static get styles() {
    return css`:host { display: block; }`;
  }

  /** @returns {HTMLInputElement} */
  get checkbox() {
    return this.shadowRoot.querySelector('#checkbox');
  }

  serialize() {
    const { checkbox } = this;
    return {
      checked: checkbox.checked
    };
  }

  validate() {
    const { checkbox } = this;
    return checkbox.checked;
  }

  _changeHandler() {
    this.dispatchEvent(new CustomEvent('change'));
  }

  render() {
    return html`
      <p>This is a custom method.</p>
      <p>It is only valid if you select the checkbox below.</p>
      <input type="checkbox" id="checkbox" @change="${this._changeHandler}"/>
    `;
  }
}
window.customElements.define('custom-auth-method-demo', CustomAuthMethodDemo);
