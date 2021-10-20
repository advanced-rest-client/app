import { html } from 'lit-html';
import { inputTemplate, passwordTemplate } from '../CommonTemplates.js';
import AuthUiBase from './AuthUiBase.js';

/** @typedef {import('../types').AuthUiInit} AuthUiInit */
/** @typedef {import('@advanced-rest-client/events').Authorization.NtlmAuthorization} NtlmAuthorization */

export default class Ntlm extends AuthUiBase {
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
    /** 
     * The NT domain.
     */
    this.domain = '';
  }

  /**
   * Restores previously serialized Basic authentication values.
   * @param {NtlmAuthorization} state Previously serialized values
   */
  restore(state) {
    this.password = state.password;
    this.username = state.username;
    this.domain = state.domain;
    this.notifyChange();
  }

  /**
   * Serialized input values
   * @return {NtlmAuthorization} An object with user input
   */
  serialize() {
    return {
      password: this.password || '',
      username: this.username || '',
      domain: this.domain || '',
    };
  }

  reset() {
    this.password = '';
    this.username = '';
    this.domain = '';
    this.notifyChange();
  }

  render() {
    const ctx = this;
    const {
      username,
      password,
      domain,
      outlined,
      anypoint,
      readOnly,
      disabled,
    } = this;
    const base = {
      classes: { block: true },
      outlined,
      anypoint,
      readOnly,
      disabled,
    };
    const uName = inputTemplate('username', username, 'User name', ctx.changeHandler, {
      ...base,
      required: true,
      autoValidate: true,
      invalidLabel: 'Username is required',
    });
    const passwd = passwordTemplate('password', password, 'Password', ctx.changeHandler, base);
    const dm = inputTemplate('domain', domain, 'NT domain', ctx.changeHandler, base);
    return html` 
    <form autocomplete="on" class="ntlm-auth">
      ${uName}
      ${passwd}
      ${dm}
    </form>`;
  }
}
