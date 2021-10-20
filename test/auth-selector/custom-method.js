import { html, css, LitElement } from 'lit-element';

class CustomAuthMethod extends LitElement {
  static get properties() {
    return {
      type: { type: String }
    };
  }

  static get styles() {
    return css`:host { display: block; }`;
  }

  /** @type HTMLInputElement */
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

  restore(values={}) {
    const { checkbox } = this;
    checkbox.checked = values.checked;
  }

  _changeHandler() {
    this.dispatchEvent(new CustomEvent('change'));
  }

  render() {
    return html`
      <input type="checkbox" id="checkbox" @change="${this._changeHandler}"/>
    `;
  }
}
window.customElements.define('custom-auth-method', CustomAuthMethod);
