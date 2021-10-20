/* eslint-disable class-methods-use-this */

import { html, LitElement } from "lit-element";
import { EventsTargetMixin } from "@anypoint-web-components/awc";
import "@anypoint-web-components/awc/anypoint-input.js";
import "@anypoint-web-components/awc/anypoint-masked-input.js";
import "@anypoint-web-components/awc/anypoint-dropdown-menu.js";
import "@anypoint-web-components/awc/anypoint-listbox.js";
import "@anypoint-web-components/awc/anypoint-item.js";
import "@anypoint-web-components/awc/anypoint-button.js";
import authStyles from "../styles/CommonAuthStyles.js";
import { validateForm } from "./Validation.js";
import {
  normalizeType,
  METHOD_BASIC,
  METHOD_BEARER,
  METHOD_NTLM,
  METHOD_DIGEST,
  METHOD_OAUTH1,
  METHOD_OAUTH2,
  METHOD_OIDC,
} from "./Utils.js";
import { UiDataHelper } from "./ui/UiDataHelper.js";

/** @typedef {import('@advanced-rest-client/events').Authorization.OAuth2DeliveryMethod} OAuth2DeliveryMethod */
/** @typedef {import('@advanced-rest-client/events').Authorization.OidcTokenInfo} OidcTokenInfo */
/** @typedef {import('@advanced-rest-client/events').Authorization.OidcTokenError} OidcTokenError */
/** @typedef {import('@advanced-rest-client/events').Authorization.Oauth2GrantType} Oauth2GrantType */
/** @typedef {import('@advanced-rest-client/events').Authorization.Oauth2ResponseType} Oauth2ResponseType */
/** @typedef {import('./ui/AuthUiBase').default} AuthUiBase */
/** @typedef {import('./ui/HttpBasic').default} HttpBasic */
/** @typedef {import('./ui/HttpBearer').default} HttpBearer */
/** @typedef {import('./ui/Ntlm').default} Ntlm */
/** @typedef {import('./ui/Digest').default} Digest */
/** @typedef {import('./ui/OAuth1').default} OAuth1 */
/** @typedef {import('./ui/OAuth2').default} OAuth2 */
/** @typedef {import('./ui/OpenID').default} OpenID */
/** @typedef {import('./types').AuthUiInit} AuthUiInit */
/** @typedef {import('./types').Oauth2Credentials} Oauth2Credentials */
/** @typedef {import('./OAuth2ScopeSelectorElement').AllowedScope} AllowedScope */

export const typeChangedSymbol = Symbol("typeChangedSymbol");
export const typeValue = Symbol("typeValue");
export const factory = Symbol("factory");
export const renderCallback = Symbol("renderCallback");
export const changeCallback = Symbol("changeCallback");
export const oauth1tokenResponseHandler = Symbol("oauth1tokenResponseHandler");
export const oauth1ErrorHandler = Symbol("oauth1ErrorHandler");
export const propagateChanges = Symbol("propagateChanges");

const ignoredProperties = ["type", "_authorizing", 'anypoint'];

/**
 * An element that renders various authorization methods.
 *
 * ## Development
 *
 * The element mixes in multiple mixins from `src/` directory.
 * Each mixin support an authorization method. When selection change (the `type`
 * property) a render function from corresponding mixin is called.
 */
export default class AuthorizationMethodElement extends EventsTargetMixin(LitElement) {
  get styles() {
    return authStyles;
  }

  static get properties() {
    return {
      /**
       * Authorization method type.
       *
       * Supported types are (case insensitive, spaces sensitive):
       *
       * - Basic
       * - Client certificate
       * - Digest
       * - NTLM
       * - OAuth 1
       * - OAuth 2
       * - Bearer
       *
       * Depending on selected type different properties are used.
       * For example Basic type only uses `username` and `password` properties,
       * while NTLM also uses `domain` property.
       *
       * See readme file for detailed list of properties depending on selected type.
       */
      type: { type: String, reflect: true },
      /**
       * When set the editor is in read only mode.
       */
      readOnly: { type: Boolean },
      /**
       * When set the inputs are disabled
       */
      disabled: { type: Boolean },
      /**
       * Enables Anypoint theme
       */
      anypoint: { type: Boolean },
      /**
       * Enables Material Design outlined style
       */
      outlined: { type: Boolean },
      /**
       * Current password.
       *
       * Used in the following types:
       * - Basic
       * - NTLM
       * - Digest
       * - OAuth 2
       */
      password: { type: String },
      /**
       * Current username.
       *
       * Used in the following types:
       * - Basic
       * - NTLM
       * - Digest
       * - OAuth 2
       */
      username: { type: String },
      /**
       * Authorization redirect URI
       *
       * Used in the following types:
       * - OAuth 1
       * - OAuth 2
       */
      redirectUri: { type: String },
      /**
       * Endpoint to authorize the token (OAuth 1) or exchange code for token (OAuth 2).
       *
       * Used in the following types:
       * - OAuth 1
       * - OAuth 2
       */
      accessTokenUri: { type: String },
      /**
       * An URI of authentication endpoint where the user should be redirected
       * to authorize the app. This endpoint initialized OAuth flow.
       *
       * Used in the following types:
       * - OAuth 1
       * - OAuth 2
       */
      authorizationUri: { type: String },
      /**
       * True when currently authorizing the user.
       *
       * Used in the following types:
       * - OAuth 1
       * - OAuth 2
       */
      _authorizing: { type: Boolean },
      /**
       * Oauth 1 or Bearer token (from the oauth console or received from auth server)
       *
       * Used in the following types:
       * - OAuth 1
       * - bearer
       */
      token: { type: String },
      /**
       * The authorization domain.
       */
      domain: { type: String },
      /**
       * Server issued realm for Digest authorization.
       *
       * Used in the following types:
       * - Digest
       * - OAuth 1
       */
      realm: { type: String },
      /**
       * Server issued nonce for Digest authorization.
       *
       * Used in the following types:
       * - Digest
       * - OAuth 1
       */
      nonce: { type: String },
      /**
       * The algorithm used to hash the response for Digest authorization.
       *
       * It can be either `MD5` or `MD5-sess`.
       *
       * Used in the following types:
       * - Digest
       */
      algorithm: { type: String },
      /**
       * The quality of protection value for the digest response.
       * Either '', 'auth' or 'auth-int'
       *
       * Used in the following types:
       * - Digest
       */
      qop: { type: String },
      /**
       * Nonce count - increments with each request used with the same nonce
       *
       * Used in the following types:
       * - Digest
       */
      nc: { type: Number },
      /**
       * Client nonce
       *
       * Used in the following types:
       * - Digest
       */
      cnonce: { type: String },
      /**
       * A string of data specified by the server
       *
       * Used in the following types:
       * - Digest
       */
      opaque: { type: String },
      /**
       * Hashed response to server challenge
       *
       * Used in the following types:
       * - Digest
       */
      response: { type: String },
      /**
       * Request HTTP method
       *
       * Used in the following types:
       * - Digest
       */
      httpMethod: { type: String },
      /**
       * Current request URL.
       *
       * Used in the following types:
       * - Digest
       */
      requestUrl: { type: String },
      /**
       * Current request body.
       *
       * Used in the following types:
       * - Digest
       */
      requestBody: { type: String },

      /**
       * Client ID aka consumer key
       *
       * Used in the following types:
       * - OAuth 1
       */
      consumerKey: { type: String },
      /**
       * The client secret aka consumer secret
       *
       * Used in the following types:
       * - OAuth 1
       */
      consumerSecret: { type: String },
      /**
       * Oauth 1 token secret (from the oauth console).
       *
       * Used in the following types:
       * - OAuth 1
       */
      tokenSecret: { type: String },
      /**
       * Token request timestamp
       *
       * Used in the following types:
       * - OAuth 1
       */
      timestamp: { type: Number },
      /**
       * Signature method. Enum {`HMAC-SHA256`, `HMAC-SHA1`, `PLAINTEXT`}
       *
       * Used in the following types:
       * - OAuth 1
       */
      signatureMethod: { type: String },
      /**
       * OAuth1 endpoint to obtain request token to request user authorization.
       *
       * Used in the following types:
       * - OAuth 1
       */
      requestTokenUri: { type: String },
      /**
       * HTTP method to obtain authorization header.
       * Spec recommends POST
       *
       * Used in the following types:
       * - OAuth 1
       */
      authTokenMethod: { type: String },
      /**
       * A location of the OAuth 1 authorization parameters.
       * It can be either in the URL as a query string (`querystring` value)
       * or in the authorization header (`authorization`) value.
       *
       * Used in the following types:
       * - OAuth 1
       */
      authParamsLocation: { type: String },
      /**
       * List of currently support signature methods.
       * This can be updated when `amfSettings` property is set.
       *
       * Used in the following types:
       * - OAuth 1
       */
      signatureMethods: { type: Array },
      /**
       * Selected authorization grand type.
       */
      grantType: { type: String },
      /**
       * The client ID for the auth token.
       */
      clientId: { type: String },
      /**
       * The client secret. It to be used when selected server flow.
       */
      clientSecret: { type: String },
      /**
       * List of user selected scopes.
       * It can be pre-populated with list of scopes (array of strings).
       */
      scopes: { type: Array },

      /**
       * List of pre-defined scopes to choose from. It will be passed to the `oauth2-scope-selector`
       * element.
       */
      allowedScopes: { type: Array },
      /**
       * If true then the `oauth2-scope-selector` will disallow to add a scope that is not
       * in the `allowedScopes` list. Has no effect if the `allowedScopes` is not set.
       */
      preventCustomScopes: { type: Boolean },
      /**
       * When the user authorized the app it should be set to the token value.
       * This element do not perform authorization. Other elements must intercept
       * the token request event and perform the authorization.
       */
      accessToken: { type: String },
      /**
       * By default it is "bearer" as the only one defined in OAuth 2.0 spec.
       * If the token response contains `tokenType` property then this value is updated.
       */
      tokenType: { type: String },
      /**
       * Currently available grant types.
       */
      grantTypes: { type: Array },
      /**
       * If set it renders authorization url, token url and scopes as advanced options
       * which are then invisible by default. User can oen setting using the UI.
       */
      advanced: { type: Boolean },
      /**
       * If true then the advanced options are opened.
       */
      advancedOpened: { type: Boolean },
      /**
       * If set, the response type selector is hidden from the UI.
       */
      noGrantType: { type: Boolean },
      /**
       * Informs about what filed of the authenticated request the token property should be set.
       * By default the value is `header` which corresponds to the `authorization` by default,
       * but it is configured by the `deliveryName` property.
       *
       * This can be used by the AMF model when the API spec defines where the access token should be
       * put in the authenticated request.
       *
       * @default header
       */
      oauthDeliveryMethod: { type: String },
      /**
       * The client credentials delivery method.
       * @default body
       */
      ccDeliveryMethod: { type: String },
      /**
       * The name of the authenticated request property that carries the token.
       * By default it is `authorization` which corresponds to `header` value of the `deliveryMethod` property.
       *
       * By setting both `deliveryMethod` and `deliveryName` you instruct the application (assuming it reads this values)
       * where to put the authorization token.
       *
       * @default authorization
       */
      oauthDeliveryName: { type: String },
      /**
       * The base URI to use to construct the correct URLs to the authorization endpoints.
       *
       * When the paths are relative then base URI is added to the path.
       * Relative paths must start with '/'.
       *
       * Note, URL processing is happening internally in the component. The produced authorize event
       * will have base URI already applied.
       */
      baseUri: { type: String },
      /**
       * The error message returned by the authorization library.
       * It renders error dialog when an error ocurred.
       * It is automatically cleared when the user request the token again.
       */
      lastErrorMessage: { type: String },
      /**
       * When this property is set then the PKCE option is not rendered for the
       * `authorization_code`. This is mainly meant to be used by the `api-authorization-method`
       * to keep this control disabled and override generated settings when the API spec
       * says that the PKCE is supported.
       */
      noPkce: { type: Boolean },
      /**
       * Whether or not the PKCE extension is enabled for this authorization configuration.
       * Note, PKCE, per the spec, is only available for `authorization_code` grantType.
       */
      pkce: { type: Boolean },
      /**
       * The definition of client credentials to be rendered for a given grant type.
       * When set on the editor it renders a drop down where the user can choose from predefined
       * credentials (client id & secret).
       */
      credentialsSource: { type: Array },
      /**
       * Selected credential source
       */
      credentialSource: { type: String },
      /**
       * When set it allows to edit the redirect URI by the user.
       */
      allowRedirectUriChange: { type: Boolean },
      /** 
       * The OpenID discovery URI.
       */
      issuerUri: { type: String },
      /** 
       * The assertion parameter for the JWT token authorization.
       * 
       * @link https://datatracker.ietf.org/doc/html/rfc7523#section-2.1
       */
      assertion: { type: String },
      /** 
       * The device_code parameter for the device code authorization.
       * 
       * @link https://datatracker.ietf.org/doc/html/rfc8628#section-3.4
       */
      deviceCode: { type: String },
      /** 
       * In OIDC configuration, the list of mist recent tokens requested from the auth server.
       */
      tokens: { type: Array },
      /** 
       * In OIDC configuration, the array index of the token to be used with HTTP request.
       */
      tokenInUse: { type: Number },
      /** 
       * In OIDC configuration, the list of response types supported by the authorization server.
       */
      supportedResponses: { type: Array },
      /** 
       * In OIDC configuration, the list of scopes supported by the authorization server.
       */
      serverScopes: { type: Array },
      /** 
       * In OIDC configuration, the response type to be used with the OAuth 2 request.
       */
      responseType: { type: String },
    };
  }

  get type() {
    return this[typeValue];
  }

  set type(value) {
    const old = this[typeValue];
    if (old === value) {
      return;
    }
    this[typeValue] = value;
    this.requestUpdate("type", old);
    this[typeChangedSymbol](value);
  }

  /**
   * @return {EventListener} Previously registered function or undefined.
   */
  get onchange() {
    return this._onChange;
  }

  /**
   * Registers listener for the `change` event
   * @param {EventListener} value A function to be called when `change` event is
   * dispatched
   */
  set onchange(value) {
    if (this._onChange) {
      this.removeEventListener("change", this._onChange);
    }
    if (typeof value !== "function") {
      this._onChange = null;
      return;
    }
    this._onChange = value;
    this.addEventListener("change", value);
  }

  /**
   * Used in the following types:
   * - OAuth 1
   * - OAuth 2
   *
   * @return {boolean} True when currently authorizing the user.
   */
  get authorizing() {
    return this._authorizing || false;
  }

  constructor() {
    super();
    this._authorizing = false;
    /** @type string */
    this.type = undefined;
    /** @type string */
    this[typeValue] = undefined;
    /** @type boolean */
    this.readOnly = undefined;
    /** @type boolean */
    this.disabled = undefined;
    /** @type boolean */
    this.anypoint = undefined;
    /** @type boolean */
    this.outlined = undefined;
    /** @type string */
    this.grantType = undefined;
    /** @type string */
    this.clientId = undefined;
    /** @type string */
    this.clientSecret = undefined;
    /** @type string[] */
    this.scopes = undefined;
    /** @type string */
    this.authorizationUri = undefined;
    /** @type string */
    this.accessTokenUri = undefined;
    /** @type string */
    this.redirectUri = undefined;
    /** @type string[] | AllowedScope[] */
    this.allowedScopes = undefined;
    /** @type boolean */
    this.preventCustomScopes = undefined;
    /** @type string */
    this.accessToken = undefined;
    /** @type string */
    this.tokenType = undefined;
    /** @type Oauth2GrantType[] */
    this.grantTypes = undefined;
    /** @type boolean */
    this.advanced = undefined;
    /** @type boolean */
    this.advancedOpened = undefined;
    /** @type boolean */
    this.noGrantType = undefined;
    /** @type OAuth2DeliveryMethod */
    this.oauthDeliveryMethod = undefined;
    /** @type OAuth2DeliveryMethod */
    this.ccDeliveryMethod = 'body';
    /** @type string */
    this.oauthDeliveryName = undefined;
    /** @type string */
    this.baseUri = undefined;
    /** @type string */
    this.lastErrorMessage = undefined;
    /** @type boolean */
    this.noPkce = undefined;
    /** @type boolean */
    this.pkce = undefined;
    /** @type Oauth2Credentials[] */
    this.credentialsSource = undefined;
    /** @type string */
    this.credentialSource = undefined;
    /** @type boolean */
    this.allowRedirectUriChange = undefined;
    /** @type string */
    this.password = '';
    /** @type string */
    this.username = '';
    /** @type string */
    this.consumerKey = undefined;
    /** @type string */
    this.consumerSecret = undefined;
    /** @type string */
    this.token = undefined;
    /** @type string */
    this.tokenSecret = undefined;
    /** @type number */
    this.timestamp = undefined;
    /** @type string */
    this.nonce = undefined;
    /** @type string */
    this.realm = undefined;
    /** @type string */
    this.signatureMethod = undefined;
    /** @type string */
    this.requestTokenUri = undefined;
    /** @type string */
    this.authTokenMethod = undefined;
    /** @type string */
    this.authParamsLocation = undefined;
    /** @type string[] */
    this.signatureMethods = undefined;
    /** @type string */
    this.algorithm = undefined;
    /** @type string */
    this.qop = undefined;
    /** @type number */
    this.nc = undefined;
    /** @type string */
    this.cnonce = undefined;
    /** @type string */
    this.opaque = undefined;
    /** @type string */
    this.response = undefined;
    /** @type string */
    this.httpMethod = undefined;
    /** @type string */
    this.requestUrl = undefined;
    /** @type any */
    this.requestBody = undefined;
    /** @type string */
    this.issuerUri = undefined;
    /** @type {string} */
    this.assertion = undefined;
     /** @type {string} */
    this.deviceCode = undefined;
    /** @type {(OidcTokenInfo | OidcTokenError)[]} */
    this.tokens = undefined;
    /** @type number */
    this.tokenInUse = undefined;
    /** @type Oauth2ResponseType[][] */
    this.supportedResponses = undefined;
    /** @type string[] */
    this.serverScopes = undefined;
    /** @type string */
    this.responseType = undefined;

    /** @type AuthUiBase */
    this[factory] = undefined;

    this[renderCallback] = this[renderCallback].bind(this);
    this[changeCallback] = this[changeCallback].bind(this);
    this[oauth1tokenResponseHandler] = this[oauth1tokenResponseHandler].bind(this);
    this[oauth1ErrorHandler] = this[oauth1ErrorHandler].bind(this);
  }

  _attachListeners(node) {
    super._attachListeners(node);
    node.addEventListener("oauth1-token-response", this[oauth1tokenResponseHandler]);
    node.addEventListener("oauth1-error", this[oauth1ErrorHandler]);
  }

  _detachListeners(node) {
    super._detachListeners(node);
    node.removeEventListener("oauth1-token-response", this[oauth1tokenResponseHandler]);
    node.removeEventListener("oauth1-error", this[oauth1ErrorHandler]);
  }

  async [renderCallback]() {
    await this.requestUpdate();
  }

  [changeCallback]() {
    this[propagateChanges]();
    this.dispatchEvent(new CustomEvent("change"));
  }

  /**
   * Propagates values from the UI factory to this element.
   * This is to synchronize user entered values with the element's state.
   */
  [propagateChanges]() {
    switch (normalizeType(this.type)) {
      case METHOD_BASIC: UiDataHelper.populateBasic(this, /** @type HttpBasic */ (this[factory])); break;
      case METHOD_BEARER: UiDataHelper.populateBearer(this, /** @type HttpBearer */ (this[factory])); break;
      case METHOD_NTLM: UiDataHelper.populateNtlm(this, /** @type Ntlm */ (this[factory])); break;
      case METHOD_DIGEST: UiDataHelper.populateDigest(this, /** @type Digest */ (this[factory])); break;
      case METHOD_OAUTH1: UiDataHelper.populateOAuth1(this, /** @type OAuth1 */ (this[factory])); break;
      case METHOD_OAUTH2: UiDataHelper.populateOAuth2(this, /** @type OAuth2 */ (this[factory])); break;
      case METHOD_OIDC: UiDataHelper.populateOpenId(this, /** @type OpenID */ (this[factory])); break;
      default:
    }
  }

  /**
   * @param {Map<string | number | symbol, unknown>} changedProperties
   */
  firstUpdated(changedProperties) {
    super.firstUpdated(changedProperties);
    if (this[factory]) {
      // when setting variables in a template and these variables are `undefined` 
      // the defaults will be overwritten by the pending changes.
      // This makes sure that this won't happen during initialization.
      this[factory].defaults();
    }
  }

  /**
   * @param {Map<string | number | symbol, unknown>} changedProperties
   */
  update(changedProperties) {
    if (!this[factory]) {
      super.update(changedProperties);
      return;
    }
    for (const key of changedProperties.keys()) {
      if (!ignoredProperties.includes(String(key))) {
        this[factory][key] = this[key];
      } else if (key === '_authorizing') {
        this[factory].authorizing = this[key];
      } else if (key === 'anypoint') {
        this[factory].anypoint = this[key];
      }
    }
    const type = normalizeType(this.type);
    if (type === METHOD_OAUTH2) {
      /** @type OAuth2 */ (this[factory]).autoHideOnce();
    } else if (type === METHOD_OIDC) {
      const f = /** @type OpenID */ (this[factory]);
      f.detectDiscovered();
      if (changedProperties.has('supportedResponses')) {
        f.detectSelectedResponseType();
      }
    }
    super.update(changedProperties);
  }

  /**
   * A function called when `type` changed.
   * Note, that other properties may not be initialized just yet.
   *
   * @param {string} type Current value.
   */
  [typeChangedSymbol](type) {
    /** @type AuthUiBase */
    let instance;
    const init = /** @type AuthUiInit */ ({
      renderCallback: this[renderCallback],
      changeCallback: this[changeCallback],
      target: this,
      readOnly: this.readOnly,
      disabled: this.disabled,
      anypoint: this.anypoint,
      outlined: this.outlined,
      authorizing: this.authorizing,
    });
    switch (normalizeType(type)) {
      case METHOD_BASIC:
        instance = UiDataHelper.setupBasic(this, init);
        break;
      case METHOD_BEARER:
        instance = UiDataHelper.setupBearer(this, init);
        break;
      case METHOD_NTLM:
        instance = UiDataHelper.setupNtlm(this, init);
        break;
      case METHOD_DIGEST:
        instance = UiDataHelper.setupDigest(this, init);
        break;
      case METHOD_OAUTH1:
        instance = UiDataHelper.setupOauth1(this, init);
        break;
      case METHOD_OAUTH2:
        instance = UiDataHelper.setupOauth2(this, init);
        break;
      case METHOD_OIDC:
        instance = UiDataHelper.setupOidc(this, init);
        break;
      default:
        throw new Error(`Unsupported authorization type ${type}`);
    }
    this[factory] = instance;
    instance.defaults();
    this.requestUpdate();
  }

  /**
   * Clears settings for current type.
   */
  clear() {
    if (!this[factory]) {
      throw new Error(`The authorization type is not set.`);
    }
    this._authorizing = false;
    this[factory].reset();
  }

  /**
   * Creates a settings object with user provided data for current method.
   *
   * @return {any} User provided data
   */
  serialize() {
    if (!this[factory]) {
      throw new Error(`The authorization type is not set.`);
    }
    return this[factory].serialize();
  }

  /**
   * Validates current method.
   * @return {boolean} Validation state for current authorization method.
   */
  validate() {
    return validateForm(this);
  }

  /**
   * Restores previously serialized settings.
   * A method type must be selected before calling this function.
   *
   * @param {any} settings Depends on current type.
   */
  restore(settings) {
    if (!this[factory]) {
      throw new Error(`The authorization type is not set.`);
    }
    this[factory].restore(settings);
    this[propagateChanges]();
  }

  /**
   * For methods with asynchronous authorization, this functions
   * calls the underlying authorize function and returns the authorization result.
   *
   * @returns {Promise<any|null>} A promise resolved to the authorization result that depends on the method, or null
   * if the current method does not support async authorization.
   * @throws {Error} When authorization error.
   */
  async authorize() {
    if (!this[factory]) {
      throw new Error(`The authorization type is not set.`);
    }
    return this[factory].authorize();
  }

  /**
   * When the type is `open id` it reads the discovery URL data and populates
   * the UI with them. This is equivalent to clicking on the `read` button
   * in the OpenID type authorization.
   */
  async discover() {
    if (!this[factory]) {
      throw new Error(`The authorization type is not set.`);
    }
    if (normalizeType(this.type) === METHOD_OIDC) {
      await /** @type OpenID */ (this[factory]).discover();
    }
  }

  /**
   * Handler for the `oauth1-token-response` custom event.
   * Sets `token` and `tokenSecret` properties from the event.
   *
   * @param {CustomEvent} e
   */
  [oauth1tokenResponseHandler](e) {
    if (!this[factory] || normalizeType(this.type) !== METHOD_OAUTH1) {
      return;
    }
    const typed = /** @type OAuth1 */ (this[factory]);
    this._authorizing = false;
    typed.authorizing = false;
    typed.oauth1tokenResponseHandler(e);
  }

  [oauth1ErrorHandler]() {
    if (!this[factory] || normalizeType(this.type) !== METHOD_OAUTH1) {
      return;
    }
    const typed = /** @type OAuth1 */ (this[factory]);
    this._authorizing = false;
    typed.authorizing = false;
  }

  render() {
    const { styles } = this;
    let tpl;
    if (this[factory]) {
      tpl = this[factory].render();
    } else {
      tpl = "";
    }
    return html`<style>${styles}</style>${tpl}`;
  }
}
