import { html } from 'lit-html';
import { inputTemplate, passwordTemplate } from '../CommonTemplates.js';
import AuthUiBase from './AuthUiBase.js';

/** @typedef {import('../types').AuthUiInit} AuthUiInit */
/** @typedef {import('@advanced-rest-client/events').Authorization.BasicAuthorization} BasicAuthorization */

export default class HttpBasic extends AuthUiBase {
  /**
   * @param {AuthUiInit} init
   */
  constructor(init) {
    super(init);
    /** 
     * The value of the username filed.
     */
    this.password = '';
    /** 
     * The value of the password filed.
     */
    this.username = '';
  }

  /**
   * Restores previously serialized Basic authentication values.
   * @param {BasicAuthorization} state Previously serialized values
   */
  restore(state) {
    this.password = state.password;
    this.username = state.username;
  }

  /**
   * Serialized input values
   * @return {BasicAuthorization} An object with user input
   */
  serialize() {
    return {
      password: this.password || '',
      username: this.username || '',
    };
  }

  reset() {
    this.password = '';
    this.username = '';
    this.notifyChange();
  }

  render() {
    const ctx = this;
    const {
      username,
      password,
      outlined,
      anypoint,
      readOnly,
      disabled,
    } = this;
    const uConfig = {
      required: true,
      autoValidate: true,
      invalidLabel: 'Username is required',
      classes: { block: true },
      outlined,
      anypoint,
      readOnly,
      disabled,
    };
    return html`
    <form autocomplete="on" class="basic-auth">
      ${inputTemplate(
        'username',
        username,
        'User name',
        ctx.changeHandler,
        uConfig
      )}
      ${passwordTemplate(
        'password',
        password,
        'Password',
        ctx.changeHandler,
        {
          classes: { block: true },
          outlined,
          anypoint,
          readOnly,
          disabled,
        }
      )}
    </form>`;
  }
}
