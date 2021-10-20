import { html } from 'lit-html';
import { passwordTemplate } from '../CommonTemplates.js';
import AuthUiBase from './AuthUiBase.js';

/** @typedef {import('../types').AuthUiInit} AuthUiInit */
/** @typedef {import('@advanced-rest-client/events').Authorization.BearerAuthorization} BearerAuthorization */

export default class HttpBearer extends AuthUiBase {
  /**
   * @param {AuthUiInit} init
   */
  constructor(init) {
    super(init);
    /** 
     * The token to use with the authorization process.
     */
    this.token = '';
  }

  /**
   * Restores previously serialized Basic authentication values.
   * @param {BearerAuthorization} state Previously serialized values
   */
  restore(state) {
    this.token = state.token;
    this.notifyChange();
  }

  /**
   * Serialized input values
   * @return {BearerAuthorization} An object with user input
   */
  serialize() {
    return {
      token: this.token || '',
    };
  }

  reset() {
    this.token = '';
    this.notifyChange();
  }

  render() {
    const ctx = this;
    const { token, outlined, anypoint, readOnly, disabled } = this;
    const tokenConfig = {
      required: true,
      autoValidate: true,
      invalidLabel: 'Token is required',
      classes: { block: true },
      outlined,
      anypoint,
      readOnly,
      disabled,
    };
    return html` <form autocomplete="on" class="bearer-auth">
      ${passwordTemplate(
        'token',
        token,
        'Token',
        ctx.changeHandler,
        tokenConfig
      )}
    </form>`;
  }
}
