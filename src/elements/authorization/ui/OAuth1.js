/* eslint-disable no-plusplus */
import { html } from "lit-html";
import { cached } from '@advanced-rest-client/icons/ArcIcons.js';
import '@anypoint-web-components/awc/anypoint-icon-button.js';
import '@anypoint-web-components/awc/anypoint-input.js';
import { inputTemplate, passwordTemplate } from "../CommonTemplates.js";
import AuthUiBase from "./AuthUiBase.js";

/** @typedef {import('../types').AuthUiInit} AuthUiInit */
/** @typedef {import('@advanced-rest-client/events').Authorization.OAuth1Authorization} OAuth1Authorization */

export const defaultSignatureMethods = ["HMAC-SHA1", "RSA-SHA1", "PLAINTEXT"];

export default class OAuth1 extends AuthUiBase {
  /**
   * @param {AuthUiInit} init
   */
  constructor(init) {
    super(init);
    /**
     * Client ID aka consumer key
     *
     * @type {string}
     */
    this.consumerKey = undefined;
    /**
     * The client secret aka consumer secret
     *
     * @type {string}
     */
    this.consumerSecret = undefined;
    /**
     * Oauth 1 token secret (from the oauth console).
     *
     * @type {string}
     */
    this.tokenSecret = undefined;
    /**
     * Token request timestamp
     *
     * @type {number}
     */
    this.timestamp = undefined;
    /**
     * The nonce generated for this request
     *
     * @type {string}
     */
    this.nonce = undefined;
    /**
     * Optional parameter, realm.
     *
     * @type {string}
     */
    this.realm = undefined;
    /**
     * Signature method. Enum {`HMAC-SHA256`, `HMAC-SHA1`, `PLAINTEXT`}
     *
     * @type {string}
     */
    this.signatureMethod = undefined;
    /**
     * OAuth1 endpoint to obtain request token to request user authorization.
     *
     * @type {string}
     */
    this.requestTokenUri = undefined;
    /**
     * HTTP method to obtain authorization header.
     * Spec recommends POST
     *
     * @type {string}
     */
    this.authTokenMethod = undefined;
    /**
     * A location of the OAuth 1 authorization parameters.
     * It can be either in the URL as a query string (`querystring` value)
     * or in the authorization header (`authorization`) value.
     *
     * @type {string}
     */
    this.authParamsLocation = undefined;
    /**
     * List of currently support signature methods.
     *
     * @type {string[]}
     */
    this.signatureMethods = undefined;
    /**
     * Authorization redirect URI
     *
     * @type {string}
     */
    this.redirectUri = undefined;
    /**
     * An URI of authentication endpoint where the user should be redirected
     * to authorize the app. This endpoint initialized OAuth flow.
     *
     * @type {string}
     */
    this.authorizationUri = undefined;
    /**
     * Endpoint to authorize the token (OAuth 1) or exchange code for token (OAuth 2).
     *
     * @type {string}
     */
    this.accessTokenUri = undefined;
    this.oauth1tokenResponseHandler = this.oauth1tokenResponseHandler.bind(this);
    this.nonceHandler = this.nonceHandler.bind(this);
    this.timestampHandler = this.timestampHandler.bind(this);
  }

  /**
   * Restores previously serialized values.
   * @param {OAuth1Authorization} state Previously serialized values
   */
  restore(state) {
    this.consumerKey = state.consumerKey;
    this.consumerSecret = state.consumerSecret;
    this.token = state.token;
    this.tokenSecret = state.tokenSecret;
    this.timestamp = /** @type number */ (state.timestamp);
    this.nonce = state.nonce;
    this.realm = state.realm;
    this.signatureMethod = state.signatureMethod;
    this.requestTokenUri = state.requestTokenUri;
    this.accessTokenUri = state.accessTokenUri;
    this.redirectUri = state.redirectUri;
    this.authTokenMethod = state.authTokenMethod;
    this.authParamsLocation = state.authParamsLocation;
    this.authorizationUri = state.authorizationUri;
  }

  /**
   * Serialized input values
   * @return {OAuth1Authorization} An object with user input
   */
  serialize() {
    return {
      consumerKey: this.consumerKey,
      consumerSecret: this.consumerSecret,
      token: this.token,
      tokenSecret: this.tokenSecret,
      timestamp: this.timestamp,
      nonce: this.nonce,
      realm: this.realm,
      signatureMethod: this.signatureMethod,
      requestTokenUri: this.requestTokenUri,
      accessTokenUri: this.accessTokenUri,
      redirectUri: this.redirectUri,
      authTokenMethod: this.authTokenMethod,
      authParamsLocation: this.authParamsLocation,
      authorizationUri: this.authorizationUri,
      type: "oauth1",
    };
  }

  defaults() {
    let changed = false;
    if (!this.signatureMethod) {
      this.signatureMethod = "HMAC-SHA1";
      changed = true;
    }
    if (!this.authTokenMethod) {
      this.authTokenMethod = "POST";
      changed = true;
    }
    if (!this.authParamsLocation) {
      this.authParamsLocation = "authorization";
      changed = true;
    }
    if (!this.signatureMethods) {
      this.signatureMethods = defaultSignatureMethods;
      changed = true;
    }
    if (!this.timestamp) {
      this.genTimestamp();
      changed = true;
    }
    if (!this.nonce) {
      this.genNonce();
      changed = true;
    }
    if (changed) {
      this.notifyChange();
    }
  }

  /**
   * Sends the `oauth1-token-requested` event.
   * @return {Promise<boolean>} True if event was sent. Can be false if event is not
   * handled or when the form is invalid.
   */
  async authorize() {
    if (!this.target.validate()) {
      return false;
    }
    this.target._authorizing = true;
    const detail = {};
    /* istanbul ignore else */
    if (this.consumerKey) {
      detail.consumerKey = this.consumerKey;
    }
    /* istanbul ignore else */
    if (this.consumerSecret) {
      detail.consumerSecret = this.consumerSecret;
    }
    /* istanbul ignore else */
    if (this.token) {
      detail.token = this.token;
    }
    /* istanbul ignore else */
    if (this.tokenSecret) {
      detail.tokenSecret = this.tokenSecret;
    }
    /* istanbul ignore else */
    if (this.timestamp) {
      detail.timestamp = this.timestamp;
    }
    /* istanbul ignore else */
    if (this.nonce) {
      detail.nonce = this.nonce;
    }
    /* istanbul ignore else */
    if (this.realm) {
      detail.realm = this.realm;
    }
    /* istanbul ignore else */
    if (this.signatureMethod) {
      detail.signatureMethod = this.signatureMethod;
    }
    /* istanbul ignore else */
    if (this.requestTokenUri) {
      detail.requestTokenUri = this.requestTokenUri;
    }
    /* istanbul ignore else */
    if (this.accessTokenUri) {
      detail.accessTokenUri = this.accessTokenUri;
    }
    /* istanbul ignore else */
    if (this.redirectUri) {
      detail.redirectUri = this.redirectUri;
    }
    /* istanbul ignore else */
    if (this.authParamsLocation) {
      detail.authParamsLocation = this.authParamsLocation;
    }
    /* istanbul ignore else */
    if (this.authTokenMethod) {
      detail.authTokenMethod = this.authTokenMethod;
    }
    /* istanbul ignore else */
    if (this.authorizationUri) {
      detail.authorizationUri = this.authorizationUri;
    }
    detail.type = 'oauth1';
    this.target.dispatchEvent(
      new CustomEvent('oauth1-token-requested', {
        detail,
        bubbles: true,
        composed: true,
        cancelable: true,
      })
    );
    return true;
  }

  /**
   * Sets timestamp in seconds
   */
  genTimestamp() {
    const t = Math.floor(Date.now() / 1000);
    this.timestamp = t;
  }

  timestampHandler() {
    this.genTimestamp();
    this.notifyChange();
    this.requestUpdate();
  }

  /**
   * Sets autogenerated nonce
   */
  genNonce() {
    const result = [];
    const chars =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const charsLength = chars.length;
    const length = 32;
    for (let i = 0; i < length; i++) {
      result[result.length] = chars[Math.floor(Math.random() * charsLength)];
    }
    this.nonce = result.join("");
  }

  nonceHandler() {
    this.genNonce();
    this.notifyChange();
    this.requestUpdate();
  }

  /**
   * Handler for the `oauth1-token-response` custom event.
   * Sets `token` and `tokenSecret` properties from the event.
   *
   * @param {CustomEvent} e
   */
  oauth1tokenResponseHandler(e) {
    this.token = e.detail.oauth_token;
    this.tokenSecret = e.detail.oauth_token_secret;
    this.notifyChange();
  }

  reset() {
    this.consumerKey = "";
    this.consumerSecret = "";
    this.token = "";
    this.tokenSecret = "";
    this.timestamp = undefined;
    this.nonce = "";
    this.realm = "";
    this.signatureMethod = "";
    this.requestTokenUri = "";
    this.accessTokenUri = "";
    this.authTokenMethod = "";
    this.authParamsLocation = "";
    this.authorizationUri = "";
    this.defaults();
  }

  render() {
    const ctx = this;
    const {
      consumerKey,
      consumerSecret,
      token,
      tokenSecret,
      requestTokenUri,
      accessTokenUri,
      authorizationUri,
      redirectUri,
      realm,
      signatureMethods,
      outlined,
      anypoint,
      readOnly,
      disabled,
    } = this;
    const hasSignatureMethods = !!(
      signatureMethods && signatureMethods.length
    );
    return html`
    <form autocomplete="on" class="oauth1-auth">
      ${this.oauth1TokenMethodTemplate()}
      ${this.oauth1ParamLocationTemplate()}
      ${passwordTemplate(
        'consumerKey',
        consumerKey,
        'Consumer key',
        ctx.changeHandler,
        {
          outlined,
          anypoint,
          readOnly,
          disabled,
          required: true,
          autoValidate: true,
          invalidLabel: 'Consumer key is required',
        }
      )}
      ${passwordTemplate(
        'consumerSecret',
        consumerSecret,
        'Consumer secret',
        ctx.changeHandler,
        {
          outlined,
          anypoint,
          readOnly,
          disabled,
        }
      )}
      ${passwordTemplate('token', token, 'Token', ctx.changeHandler, {
        outlined,
        anypoint,
        readOnly,
        disabled,
      })}
      ${passwordTemplate(
        'tokenSecret',
        tokenSecret,
        'Token secret',
        ctx.changeHandler,
        {
          outlined,
          anypoint,
          readOnly,
          disabled,
        }
      )}
      ${inputTemplate(
        'requestTokenUri',
        requestTokenUri,
        'Request token URI',
        ctx.changeHandler,
        {
          outlined,
          anypoint,
          readOnly,
          disabled,
        }
      )}
      ${inputTemplate(
        'accessTokenUri',
        accessTokenUri,
        'Token Authorization URI',
        ctx.changeHandler,
        {
          type: 'url',
          outlined,
          anypoint,
          readOnly,
          disabled,
        }
      )}
      ${inputTemplate(
        'authorizationUri',
        authorizationUri,
        'User authorization dialog URI',
        ctx.changeHandler,
        {
          type: 'url',
          outlined,
          anypoint,
          readOnly,
          disabled,
        }
      )}
      ${inputTemplate(
        'redirectUri',
        redirectUri,
        'Redirect URI',
        ctx.changeHandler,
        {
          type: 'url',
          outlined,
          anypoint,
          readOnly,
          disabled,
        }
      )}
      ${this.oauth1TimestampTemplate()} 
      ${this.oauth1NonceTemplate()}
      ${passwordTemplate('realm', realm, 'Realm', ctx.changeHandler, {
        outlined,
        anypoint,
        readOnly,
        disabled,
      })}
      ${hasSignatureMethods ? this.oauth1SignatureMethodsTemplate() : ''}
    </form>
    <div class="authorize-actions">
      <anypoint-button
        ?disabled="${this.target.authorizing}"
        class="auth-button"
        @click="${this.authorize}"
        >Authorize</anypoint-button
      >
      ${this.target._authorizing ? html`<progress></progress>` : ''}
    </div>`;
  }

  oauth1TokenMethodTemplate() {
    const {
      outlined,
      anypoint,
      readOnly,
      disabled,
      authTokenMethod,
    } = this;
    const ctx = this;
    return html`<anypoint-dropdown-menu
      name="authTokenMethod"
      required
      ?outlined="${outlined}"
      ?anypoint="${anypoint}"
      ?disabled="${disabled||readOnly}"
    >
      <label slot="label">Authorization token method</label>
      <anypoint-listbox
        slot="dropdown-content"
        .selected="${authTokenMethod}"
        @selectedchange="${ctx.selectHandler}"
        data-name="authTokenMethod"
        ?anypoint="${anypoint}"
        ?disabled="${disabled||readOnly}"
        attrforselected="data-value"
      >
        <anypoint-item ?anypoint="${anypoint}" data-value="GET"
          >GET</anypoint-item
        >
        <anypoint-item ?anypoint="${anypoint}" data-value="POST"
          >POST</anypoint-item
        >
      </anypoint-listbox>
    </anypoint-dropdown-menu>`;
  }

  oauth1ParamLocationTemplate() {
    const {
      outlined,
      anypoint,
      readOnly,
      disabled,
      authParamsLocation,
    } = this;
    const ctx = this;
    return html`<anypoint-dropdown-menu
      required
      name="authParamsLocation"
      ?outlined="${outlined}"
      ?anypoint="${anypoint}"
      ?disabled="${disabled||readOnly}"
    >
      <label slot="label">Oauth parameters location</label>
      <anypoint-listbox
        slot="dropdown-content"
        .selected="${authParamsLocation}"
        @selectedchange="${ctx.selectHandler}"
        data-name="authParamsLocation"
        ?anypoint="${anypoint}"
        ?disabled="${disabled||readOnly}"
        attrforselected="data-value"
      >
        <anypoint-item
          ?anypoint="${anypoint}"
          data-value="querystring"
          >Query string</anypoint-item
        >
        <anypoint-item
          ?anypoint="${anypoint}"
          data-value="authorization"
          >Authorization header</anypoint-item
        >
      </anypoint-listbox>
    </anypoint-dropdown-menu>`;
  }

  oauth1TimestampTemplate() {
    const { outlined, anypoint, readOnly, disabled, timestamp } = this;
    const ctx = this;
    return html`<anypoint-input
      required
      autoValidate
      name="timestamp"
      .value="${timestamp}"
      @change="${ctx.changeHandler}"
      type="number"
      autocomplete="on"
      ?outlined="${outlined}"
      ?anypoint="${anypoint}"
      ?readOnly="${readOnly}"
      ?disabled="${disabled}"
      invalidMessage="Timestamp is required"
    >
      <label slot="label">Timestamp</label>
      <anypoint-icon-button
        slot="suffix"
        title="Regenerate timestamp"
        aria-label="Press to regenerate timestamp"
        @click="${ctx.timestampHandler}"
      >
        <span class="icon">${cached}</span>
      </anypoint-icon-button>
    </anypoint-input>`;
  }

  oauth1NonceTemplate() {
    const { outlined, anypoint, readOnly, disabled, nonce } = this;
    const ctx = this;
    return html`<anypoint-input
      required
      autoValidate
      name="nonce"
      .value="${nonce}"
      @change="${ctx.changeHandler}"
      type="text"
      autocomplete="on"
      ?outlined="${outlined}"
      ?anypoint="${anypoint}"
      ?readOnly="${readOnly}"
      ?disabled="${disabled}"
      invalidMessage="Nonce is required"
    >
      <label slot="label">Nonce</label>
      <anypoint-icon-button
        slot="suffix"
        title="Regenerate nonce"
        aria-label="Press to regenerate nonce"
        @click="${ctx.nonceHandler}"
      >
        <span class="icon">${cached}</span>
      </anypoint-icon-button>
    </anypoint-input>`;
  }

  oauth1SignatureMethodsTemplate() {
    const {
      outlined,
      anypoint,
      readOnly,
      disabled,
      signatureMethod,
      signatureMethods,
    } = this;
    const ctx = this;
    return html`<anypoint-dropdown-menu
      required
      name="signatureMethod"
      ?outlined="${outlined}"
      ?anypoint="${anypoint}"
      ?disabled="${disabled||readOnly}"
    >
      <label slot="label">Signature method</label>
      <anypoint-listbox
        slot="dropdown-content"
        .selected="${signatureMethod}"
        @selectedchange="${ctx.selectHandler}"
        data-name="signatureMethod"
        ?anypoint="${anypoint}"
        ?disabled="${disabled||readOnly}"
        attrforselected="data-value"
      >
        ${signatureMethods.map(
          (item) =>
            html`<anypoint-item
              ?anypoint="${anypoint}"
              data-value="${item}"
              >${item}</anypoint-item
            >`
        )}
      </anypoint-listbox>
    </anypoint-dropdown-menu>`;
  }
}
