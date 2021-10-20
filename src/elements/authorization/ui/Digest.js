import { html } from "lit-html";
import { inputTemplate, passwordTemplate } from "../CommonTemplates.js";
import { generateCnonce } from "../Utils.js";
import md5 from "../../../lib/3rd-party/md5.js";
import AuthUiBase from "./AuthUiBase.js";

/** @typedef {import('../types').AuthUiInit} AuthUiInit */
/** @typedef {import('@advanced-rest-client/events').Authorization.DigestAuthorization} DigestAuthorization */

export default class Digest extends AuthUiBase {
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
     * Server issued realm for Digest authorization.
     *
     * @type string
     */
    this.realm = undefined;
    /**
     * Server issued nonce for Digest authorization.
     *
     * @type string
     */
    this.nonce = undefined;
    /**
     * The algorithm used to hash the response for Digest authorization.
     *
     * It can be either `MD5` or `MD5-sess`.
     *
     * @type string
     */
    this.algorithm = undefined;
    /**
     * The quality of protection value for the digest response.
     * Either '', 'auth' or 'auth-int'
     *
     * @type string
     */
    this.qop = undefined;
    /**
     * Nonce count - increments with each request used with the same nonce
     *
     * @type number
     */
    this.nc = undefined;
    /**
     * Client nonce
     *
     * @type string
     */
    this.cnonce = undefined;
    /**
     * A string of data specified by the server
     *
     * @type string
     */
    this.opaque = undefined;
    /**
     * Hashed response to server challenge
     *
     * @type string
     */
    this.response = undefined;
    /**
     * Request HTTP method
     *
     * @type string
     */
    this.httpMethod = undefined;
    /**
     * Current request URL.
     *
     * @type string
     */
    this.requestUrl = undefined;
    /** @type string */
    this._requestUri = undefined;
    /**
     * Current request body.
     *
     * @type string
     */
    this.requestBody = undefined;
  }

  get requestUrl() {
    return this._requestUrl;
  }

  set requestUrl(value) {
    const old = this._requestUrl;
    /* istanbul ignore if */
    if (old === value) {
      return;
    }
    this._requestUrl = value;
    this._processRequestUrl(value);
  }

  _processRequestUrl(value) {
    if (!value || typeof value !== 'string') {
      this._requestUri = undefined;
      this.notifyChange();
      return;
    }
    let result;
    try {
      const url = new URL(value);
      result = url.pathname;
    } catch (_) {
      result = value.trim();
    }
    this._requestUri = result;
  }

  /**
   * Restores previously serialized values.
   * @param {DigestAuthorization} state Previously serialized values
   */
  restore(state) {
    this.username = state.username;
    this.password = state.password;
    this.realm = state.realm;
    this.nonce = state.nonce;
    this.opaque = state.opaque;
    this.qop = state.qop;
    this.cnonce = state.cnonce;
    this.algorithm = state.algorithm;
    if (state.uri) {
      this._requestUri = state.uri;
    }
    if (state.nc) {
      this.nc = Number(String(state.nc).replace(/0+/, ''));
    }
  }

  /**
   * Serialized input values
   * @return {DigestAuthorization} An object with user input
   */
  serialize() {
    this.response = this._generateDigestResponse();
    const settings = {
      username: this.username || '',
      password: this.password || '',
      realm: this.realm,
      nonce: this.nonce,
      uri: this._requestUri,
      response: this.response,
      opaque: this.opaque,
      qop: this.qop,
      nc: `00000000${this.nc}`.slice(-8),
      cnonce: this.cnonce,
      algorithm: this.algorithm,
    };
    return settings;
  }

  /**
   * Generates the response header based on the parameters provided in the
   * form.
   *
   * See https://en.wikipedia.org/wiki/Digest_access_authentication#Overview
   *
   * @return {string} A response part of the authenticated digest request.
   */
  _generateDigestResponse() {
    const HA1 = this._getHA1();
    const HA2 = this._getHA2();
    const ncString = `00000000${this.nc}`.slice(-8);
    let responseStr = `${HA1}:${this.nonce}`;
    if (!this.qop) {
      responseStr += `:${HA2}`;
    } else {
      responseStr += `:${ncString}:${this.cnonce}:${this.qop}:${HA2}`;
    }
    return md5(responseStr).toString();
  }

  // Generates HA1 as defined in Digest spec.
  _getHA1() {
    const { username, realm, password } = this;
    let HA1param = `${username}:${realm}:${password}`;
    let HA1 = md5(HA1param).toString();
    if (this.algorithm === 'MD5-sess') {
      const { nonce, cnonce } = this;
      HA1param = `${HA1}:${nonce}:${cnonce}`;
      HA1 = md5(HA1param).toString();
    }
    return HA1;
  }

  // Generates HA2 as defined in Digest spec.
  _getHA2() {
    const { httpMethod, _requestUri } = this;
    let HA2param = `${httpMethod}:${_requestUri}`;
    if (this.qop === 'auth-int') {
      const v = md5(this.requestBody || '').toString();
      HA2param += `:${v}`;
    }
    return md5(HA2param).toString();
  }

  reset() {
    this.password = '';
    this.username = '';
    this.realm = '';
    this.nonce = '';
    this.opaque = '';
    this.qop = '';
    this.cnonce = '';
    this.algorithm = '';
    this.nc = undefined;
    this.response = '';
    this.defaults();
    // url, method, and body should not be controlled by this
    // component.
  }

  defaults() {
    let changed = false;
    if (!this.nc) {
      this.nc = 1;
      changed = true;
    }
    if (!this.algorithm) {
      this.algorithm = 'MD5';
      changed = true;
    }
    if (!this.cnonce) {
      this.cnonce = generateCnonce();
      changed = true;
    }
    if (changed) {
      this.notifyChange();
    }
  }

  render() {
    const ctx = this;
    const {
      username,
      password,
      realm,
      nonce,
      nc,
      opaque,
      cnonce,
      outlined,
      anypoint,
      readOnly,
      disabled,
    } = this;
    return html`
    <form autocomplete="on" class="digest-auth">
      ${inputTemplate('username', username, 'User name', ctx.changeHandler, {
        required: true,
        autoValidate: true,
        invalidLabel: 'Username is required',
        classes: { block: true },
        outlined,
        anypoint,
        readOnly,
        disabled,
      })}
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
      ${inputTemplate(
        'realm',
        realm,
        'Server issued realm',
        ctx.changeHandler,
        {
          required: true,
          autoValidate: true,
          invalidLabel: 'Realm is required',
          classes: { block: true },
          outlined,
          anypoint,
          readOnly,
          disabled,
        }
      )}
      ${inputTemplate(
        'nonce',
        nonce,
        'Server issued nonce',
        ctx.changeHandler,
        {
          required: true,
          autoValidate: true,
          invalidLabel: 'Nonce is required',
          classes: { block: true },
          outlined,
          anypoint,
          readOnly,
          disabled,
        }
      )}
      ${this._qopTemplate()}
      ${inputTemplate('nc', nc, 'Nonce count', ctx.changeHandler, {
        required: true,
        autoValidate: true,
        invalidLabel: 'Nonce count is required',
        classes: { block: true },
        type: 'number',
        outlined,
        anypoint,
        readOnly,
        disabled,
      })}
      ${this._hashAlgorithmTemplate()}
      ${inputTemplate(
        'opaque',
        opaque,
        'Server issued opaque string',
        ctx.changeHandler,
        {
          required: true,
          autoValidate: true,
          invalidLabel: 'Server issued opaque is required',
          classes: { block: true },
          outlined,
          anypoint,
          readOnly,
          disabled,
        }
      )}
      ${inputTemplate('cnonce', cnonce, 'Client nonce', ctx.changeHandler, {
        required: true,
        autoValidate: true,
        invalidLabel: 'Client nonce is required',
        classes: { block: true },
        outlined,
        anypoint,
        readOnly,
        disabled,
      })}
    </form>`;
  }

  _qopTemplate() {
    const ctx = this;
    const { outlined, anypoint, readOnly, disabled, qop } = this;
    return html`
    <anypoint-dropdown-menu
      ?outlined="${outlined}"
      ?anypoint="${anypoint}"
      ?disabled="${disabled||readOnly}"
      name="qop"
    >
      <label slot="label">Quality of protection</label>
      <anypoint-listbox
        slot="dropdown-content"
        .selected="${qop}"
        @selectedchange="${ctx.selectHandler}"
        ?anypoint="${anypoint}"
        ?disabled="${disabled||readOnly}"
        attrforselected="data-qop"
      >
        <anypoint-item ?anypoint="${anypoint}" data-qop="auth"
          >auth</anypoint-item
        >
        <anypoint-item ?anypoint="${anypoint}" data-qop="auth-int"
          >auth-int</anypoint-item
        >
      </anypoint-listbox>
    </anypoint-dropdown-menu>`;
  }

  _hashAlgorithmTemplate() {
    const ctx = this;
    const { outlined, anypoint, readOnly, disabled, algorithm } = this;
    return html`
    <anypoint-dropdown-menu
      ?outlined="${outlined}"
      ?anypoint="${anypoint}"
      ?disabled="${disabled||readOnly}"
      name="algorithm"
    >
      <label slot="label">Hash algorithm</label>
      <anypoint-listbox
        slot="dropdown-content"
        .selected="${algorithm}"
        @selectedchange="${ctx.selectHandler}"
        ?anypoint="${anypoint}"
        ?disabled="${disabled||readOnly}"
        attrforselected="data-algorithm"
      >
        <anypoint-item ?anypoint="${anypoint}" data-algorithm="MD5"
          >MD5</anypoint-item
        >
        <anypoint-item
          ?anypoint="${anypoint}"
          data-algorithm="MD5-sess"
          >MD5-sess</anypoint-item
        >
      </anypoint-listbox>
    </anypoint-dropdown-menu>`;
  }
}
