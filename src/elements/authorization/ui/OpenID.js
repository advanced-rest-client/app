/* eslint-disable class-methods-use-this */
import { html } from "lit-html";
import { AuthorizationEvents, TransportEvents,  } from "@advanced-rest-client/events";
import '@github/time-elements';
import OAuth2 from './OAuth2.js';
import { inputTemplate } from '../CommonTemplates.js';
import { generateState, selectNode } from "../Utils.js";
import * as KnownGrants from '../../../lib/KnownGrants.js';

/** @typedef {import('lit-element').TemplateResult} TemplateResult */
/** @typedef {import('@anypoint-web-components/awc').AnypointListboxElement} AnypointListbox */
/** @typedef {import('@advanced-rest-client/events').Authorization.OidcAuthorization} OidcAuthorization */
/** @typedef {import('@advanced-rest-client/events').Authorization.OidcTokenInfo} OidcTokenInfo */
/** @typedef {import('@advanced-rest-client/events').Authorization.OidcTokenError} OidcTokenError */
/** @typedef {import('@advanced-rest-client/events').Authorization.Oauth2GrantType} Oauth2GrantType */
/** @typedef {import('@advanced-rest-client/events').Authorization.Oauth2ResponseType} Oauth2ResponseType */
/** @typedef {import('../types').AuthUiInit} AuthUiInit */
/** @typedef {import('../types').OpenIdProviderMetadata} OpenIdProviderMetadata */

export const GrantLabels = {
  [KnownGrants.implicit]: 'Access token',
  [KnownGrants.code]: 'Authorization code',
  refresh_token: 'Refresh token',
  [KnownGrants.password]: 'Password',
  [KnownGrants.clientCredentials]: 'Client credentials',
  [KnownGrants.deviceCode]: 'Device code',
  [KnownGrants.jwtBearer]: 'JWT Bearer',
};

export const ResponseTypeLabels = {
  token: 'Token',
  code: 'Code',
  id_token: 'ID token',
  id: 'ID token',
};

export const discoveryCache = new Map();

/**
 * @return {Oauth2GrantType[]} The default grant types for OIDC
 */
export const defaultGrantTypes = [
  {
    type: "implicit",
    label: "Access token (browser flow)",
  },
  {
    type: "authorization_code",
    label: "Authorization code (server flow)",
  },
];

export default class OpenID extends OAuth2 {
  /**
   * @returns {boolean} True when the current `grantType` can support redirect URI.
   */
  get hasRedirectUri() {
    const { grantType, discovered } = this;
    if (!discovered) {
      return false;
    }
    return [KnownGrants.implicit, KnownGrants.code].includes(grantType);
  }

  /**
   * @param {AuthUiInit} init
   */
  constructor(init) {
    super(init);
    /** @type boolean */
    this.discovered = false;
    /** @type string */
    this.issuerUri = undefined;
    /** @type {(OidcTokenInfo | OidcTokenError)[]} */
    this.tokens = undefined;
    /** @type number */
    this.tokenInUse = undefined;
    /** @type Oauth2ResponseType[][] */
    this.supportedResponses = undefined;
    /** 
     * The index of the response from the `supportedResponses`.
     * By default it selects the first one.
     * @type number 
     */
    this.selectedResponse = undefined;
    /** 
     * The list of scopes supported by the authorization server.
     * @type string[]
     */
    this.serverScopes = undefined;
    /** 
     * The response type to be used with the OAuth 2 request.
     * @type string
     */
    this.responseType = undefined;

    this._issuerUriHandler = this._issuerUriHandler.bind(this);
    this._issuerReadHandler = this._issuerReadHandler.bind(this);
    this._responseTypeSelectionHandler = this._responseTypeSelectionHandler.bind(this);
    this._selectNodeHandler = this._selectNodeHandler.bind(this);
    this._tokenInUseHandler = this._tokenInUseHandler.bind(this);
  }

  /**
   * Serialized input values
   * @return {OidcAuthorization} An object with user input
   */
  serialize() {
    const result = /** @type OidcAuthorization */ (super.serialize());
    delete result.accessToken;
    result.issuerUri = this.issuerUri;
    result.tokens = this.tokens;
    result.tokenInUse = this.tokenInUse;
    result.supportedResponses = this.supportedResponses;
    result.grantTypes = this.grantTypes;
    result.serverScopes = this.serverScopes;

    const { selectedResponse=0, supportedResponses=[], tokens, tokenInUse=0 } = this;
    const response = supportedResponses[selectedResponse];
    if (response) {
      result.responseType = response.map(i => i.type).join(' ');
    }
    if (Array.isArray(tokens)) {
      result.accessToken = this.readTokenValue(/** @type OidcTokenInfo */ (tokens[tokenInUse]));
    }
    if (result.responseType && !this.noPkce && result.responseType.includes('code')) {
      result.pkce = this.pkce;
    }
    return result;
  }

  async authorize() {
    this.lastErrorMessage = undefined;
    const validationResult = this.target.validate();
    if (!validationResult) {
      return null;
    }
    this.authorizing = true;
    this.requestUpdate();
    this.notifyChange();
    const detail = this.serialize();
    const state = generateState();
    detail.state = state;

    try {
      const tokens = await AuthorizationEvents.Oidc.authorize(this.target, detail);
      this.authorizing = false;
      this.notifyChange();
      this.requestUpdate();
      if (!Array.isArray(tokens) || !tokens.length) {
        return null;
      }
      this.tokens = tokens;
      this.accessToken = undefined;
      this.tokenInUse = 0;
      this.notifyChange();
      await this.requestUpdate();
    } catch (e) {
      const { message = 'Unknown error' } = e;
      this.lastErrorMessage = message;
      this.authorizing = false;
      this.notifyChange();
      await this.requestUpdate();
      throw e;
    }

    await this.requestUpdate();
    return null;
  }

  /**
   * @param {OidcAuthorization} state
   */
  restore(state) {
    super.restore(state);
    this.issuerUri = state.issuerUri;
    this.tokens = state.tokens;
    this.tokenInUse = state.tokenInUse;
    this.supportedResponses = state.supportedResponses;
    this.serverScopes = state.serverScopes;
    this.discovered = true;
  }

  /**
   * @param {Event} e
   */
  _issuerUriHandler(e) {
    const input = /** @type HTMLInputElement */ (e.target);
    this.issuerUri = input.value;
    this.notifyChange();
    this.discover();
  }

  _issuerReadHandler() {
    const { issuerUri } = this;
    if (!issuerUri) {
      this.lastErrorMessage = 'Set the issuer URI first.';
      this.requestUpdate();
      return;
    }
    this.discover();
  }

  /**
   * @param {Event} e 
   */
  _responseTypeSelectionHandler(e) {
    const { selected } = /** @type AnypointListbox */ (e.target);
    this.selectedResponse = /** @type number */ (selected);
    this.notifyChange();
  }

  /**
   * Downloads the OIDC info and pre-populates the form inputs.
   */
  async discover() {
    const { issuerUri } = this;
    if (!issuerUri) {
      const message = 'Issuer URI is not set.';
      this.lastErrorMessage = message;
      this.discovered = false;
      await this.requestUpdate();
      throw new Error(message);
    }
    this.lastErrorMessage = undefined;
    this.requestUpdate();
    let info;
    const oidcUrl = this.buildIssuerUrl(issuerUri);
    if (discoveryCache.has(oidcUrl)) {
      info = discoveryCache.get(oidcUrl);
    } else {
      try {
        info = await this.transportDiscovery(oidcUrl);
        discoveryCache.set(oidcUrl, info);
      } catch (e) {
        this.lastErrorMessage = `Unable to read the discovery information.`;
      }
    }
    if (info) {
      this.propagateOidc(info);
      this.discovered = true;
      this.notifyChange();
    } else {
      this.discovered = false;
    }
    await this.requestUpdate();
  }

  /**
   * Requests the data from the discovery endpoint.
   * First it dispatched ARC's HTTP transport event to avoid CORS issues.
   * When this fails then it tried native `fetch` API.
   * 
   * @param {string} url
   * @returns {Promise<any>} 
   */
  async transportDiscovery(url) {
    let result;
    try {
      result = await this.transportArc(url);
    } catch (e) {
      // ...
    }
    if (!result) {
      result = await this.transportNative(url);
    }
    return result;
  }

  /**
   * Uses the ARC's internal HTTP request backend service to request the discovery data
   * without CORS restrictions. This event may not be handled when component is hosted by another application.
   * 
   * @param {string} url The URL to request.
   * @returns {Promise<any>} The processed response as JSON.
   */
  async transportArc(url) {
    const result = await TransportEvents.httpTransport(this.target, {
      method: 'GET',
      url,
    });
    if (!result) {
      throw new Error(`The ARC request is not handled`);
    }
    let { payload } = result;
    // @ts-ignore
    if (typeof payload.buffer === 'object') {
      // Node.js buffer object.
      payload = payload.toString('utf8');
    } else if (typeof payload !== 'string') {
      payload = payload.toString();
    }
    return JSON.parse(payload);
  }

  /**
   * Uses the `fetch` API as a fallback to download the discovery info.
   * This may not work due to CORS and this is secondary to ARC's backend transport.
   * 
   * @param {string} url The URL to request.
   * @returns {Promise<any>} The processed response as JSON.
   */
  async transportNative(url) {
    const rsp = await fetch(url);
    return rsp.json();
  }

  /**
   * Constructs the OIDC discovery URL.
   * @param {string} baseUri The issues URI.
   * @returns {string}
   */
  buildIssuerUrl(baseUri) {
    let url = baseUri;
    if (!url.includes('.well-known')) {
      if (!url.endsWith('/')) {
        url += '/';
      }
      url += '.well-known/openid-configuration';
    }
    return url;
  }

  /**
   * @param {OpenIdProviderMetadata} meta
   */
  propagateOidc(meta) {
    this.authorizationUri = meta.authorization_endpoint;
    this.supportedResponses = this.translateResponseCodes(meta.response_types_supported);
    if (meta.token_endpoint) {
      this.accessTokenUri = meta.token_endpoint;
    }
    if (Array.isArray(meta.grant_types_supported) && meta.grant_types_supported.length) {
      this.serverScopes = meta.grant_types_supported;
      this.grantTypes = this.translateGrantTypesMeta(meta.grant_types_supported);
    } else {
      this.grantTypes = [...defaultGrantTypes];
      this.serverScopes = undefined;
    }
    if (Array.isArray(meta.scopes_supported)) {
      this.scopes = meta.scopes_supported;
    } else {
      this.scopes = ['openid'];
    }
  }

  /**
   * Sets the `discovered` flag depending on the current configuration.
   */
  detectDiscovered() {
    const { issuerUri, authorizationUri, grantTypes, scopes } = this;
    if (!issuerUri || !authorizationUri) {
      this.discovered = false;
      return;
    }
    if (!Array.isArray(grantTypes) || !grantTypes.length) {
      this.discovered = false;
      return;
    }
    if (!Array.isArray(scopes) || !scopes.length) {
      this.discovered = false;
      return;
    }
    this.discovered = true;
  }

  /**
   * A function called from the auth element `updated` lifecycle method.
   * It tries to figure out the `selectedResponse` from the current list of 
   * `supportedResponses` and the `responseType`.
   */
  detectSelectedResponseType() {
    const { supportedResponses, selectedResponse, responseType } = this;
    if (!responseType || !Array.isArray(supportedResponses)) {
      return;
    }
    const parts = responseType.split(' ');
    const index = supportedResponses.findIndex((i) => {
      const rspTypes = i.map(e => e.type);
      const hasNotFound = parts.some(p => !rspTypes.includes(p));
      return !hasNotFound;
    });
    if (index >= 0 && selectedResponse !== index) {
      this.selectedResponse = index;
    }
  }

  /**
   * @param {string[]} types
   * @returns {Oauth2GrantType[]}
   */
  translateGrantTypesMeta(types) {
    const result = [];
    types.forEach((type) => {
      const item = {
        type,
        label: type,
      };
      if (GrantLabels[type]) {
        item.label = GrantLabels[type];
      }
      result.push(item);
    });
    return result;
  }

  /**
   * This generates a 2-dimensional array with the response codes 
   * supported by the authorization server. Next to the grant type 
   * it describes how token is received by the 
   * @param {string[]} codes
   * @return {Oauth2ResponseType[][]} 
   */
  translateResponseCodes(codes) {
    const result = [];
    codes.forEach((value) => {
      const items = value.split(' ');
      const response = [];
      result.push(response)
      items.forEach((responseValue) => {
        const type = {
          type: responseValue,
          label: responseValue,
        };
        if (ResponseTypeLabels[responseValue]) {
          type.label = ResponseTypeLabels[responseValue];
        }
        response.push(type);
      });
    });
    return result;
  }

  /**
   * A handler to select the contents of the node that is the event's target.
   * @param {Event} e
   */
  _selectNodeHandler(e) {
    const node = /** @type HTMLElement */ (e.target);
    selectNode(node);
  }

  /**
   * @param {Event} e
   */
  _tokenInUseHandler(e) {
    const input = /** @type HTMLInputElement */ (e.target);
    const { value } = input;
    if (!input.checked) {
      return;
    }
    this.tokenInUse = Number(value);
    this.notifyChange();
  }

  /**
   * @param {OidcTokenInfo|OidcTokenError} token
   */
  readTokenLabel(token) {
    const { responseType } = token;
    switch (responseType) {
      case 'token': return 'Access token';
      case 'code': return 'Access token from code exchange';
      case 'id_token': 
      case 'id': return 'ID token'; 
      default: return 'Unknown token';
    }
  }

  /**
   * @param {OidcTokenInfo} token
   */
  readTokenValue(token) {
    if (!token) {
      return '';
    }
    const { responseType } = token;
    switch (responseType) {
      case 'token': return token.accessToken;
      case 'code': return token.accessToken;
      case 'id_token': 
      case 'id': return token.idToken;
      default: return token.accessToken || token.refreshToken || token.idToken || '';
    }
  }

  render() {
    const {
      tokens,
      lastErrorMessage,
      discovered,
    } = this;
    return html`
    <form autocomplete="on" class="oauth2-auth">
      ${this.issuerInputTemplate()}
      ${discovered ? this.formContentTemplate() : ''}
    </form>
    ${this.oauth2RedirectTemplate()}
    ${Array.isArray(tokens) && tokens.length ? this.oauth2TokenTemplate() : this.oath2AuthorizeTemplate()}
    ${lastErrorMessage ? html`<p class="error-message">⚠ ${lastErrorMessage}</p>` : ''}
    `;
  }

  issuerInputTemplate() {
    const { readOnly, issuerUri, anypoint, outlined, disabled } = this;
    const input = inputTemplate(
      'issuerUri',
      issuerUri,
      'Issuer URI',
      this._issuerUriHandler,
      {
        outlined,
        anypoint,
        readOnly,
        disabled,
        type: 'url',
        required: true,
        autoValidate: true,
        invalidLabel: 'Issuer URI is required',
        infoLabel: 'The URI without the .well-known part.',
      }
    );
    return html`
    <div class="issuer-input">
      ${input}
      <anypoint-button 
        ?anypoint="${anypoint}"
        title="Downloads and processes the discovery info"
        @click="${this._issuerReadHandler}"
        data-type="read-discovery"
      >Read</anypoint-button>
    </div>
    `;
  }

  /**
   * @returns {(string|TemplateResult)[]} 
   */
  formContentTemplate() {
    const parts = super.formContentTemplate();
    parts.unshift(this.responsesTemplate())
    return parts;
  }

  /**
   * @returns {TemplateResult|string} The template for the response types drop down.
   */
  responsesTemplate() {
    const { supportedResponses } = this;
    if (!Array.isArray(supportedResponses) || !supportedResponses.length) {
      return '';
    }
    const {
      selectedResponse=0,
      outlined,
      anypoint,
      readOnly,
      disabled,
    } = this;
    return html`
    <anypoint-dropdown-menu
      name="responseType"
      required
      class="response-type-dropdown"
      .outlined="${outlined}"
      .anypoint="${anypoint}"
      .disabled="${disabled||readOnly}"
    >
      <label slot="label">Response type</label>
      <anypoint-listbox
        slot="dropdown-content"
        .selected="${selectedResponse}"
        @selected="${this._responseTypeSelectionHandler}"
        data-name="responseType"
        .anypoint="${anypoint}"
        .disabled="${disabled||readOnly}"
      >
        ${supportedResponses.map(item => this.responseItemTemplate(item))}
      </anypoint-listbox>
    </anypoint-dropdown-menu>`;
  }

  /**
   * @param {Oauth2ResponseType[]} item The responses list to render as a single item.
   * @returns {TemplateResult|string} The template for the response types drop down item.
   */
  responseItemTemplate(item) {
    const label = item.map(i => i.label).join(', ');
    return html`
    <anypoint-item
      .anypoint="${this.anypoint}"
    >${label}</anypoint-item>
    `;
  }

  /**
   * @returns {TemplateResult|string} The template for the OAuth 2 token value
   */
  oauth2TokenTemplate() {
    const { tokens, authorizing, anypoint } = this;
    return html`
    <div class="current-tokens">
      <p class="tokens-title">Tokens</p>
      ${tokens.map((info, index) => this.tokenTemplate(info, index))}

      <div class="authorize-actions">
        <anypoint-button
          ?disabled="${authorizing}"
          class="auth-button"
          ?anypoint="${anypoint}"
          emphasis="medium"
          data-type="refresh-token"
          @click="${this.authorize}"
        >Refresh tokens</anypoint-button>
      </div>
    </div>`;
  }

  /**
   * @param {OidcTokenInfo | OidcTokenError} token 
   * @param {number} index
   * @returns 
   */
  tokenTemplate(token, index) {
    const typedError = /** @type OidcTokenError */ (token);
    if (typedError.error) {
      return this.errorTokenTemplate(typedError);
    }
    return this.infoTokenTemplate(/** @type OidcTokenInfo */ (token), index);
  }

  /**
   * @param {OidcTokenError} token
   */
  errorTokenTemplate(token) {
    const { error, errorDescription } = token;
    const label = this.readTokenLabel(token);
    return html`
    <div class="current-token">
      <label class="token-label">${label}</label>
      <p class="read-only-param-field padding">
        <span class="code">${error}: ${errorDescription}</span>
      </p>
    </div>`;
  }

  /**
   * @param {OidcTokenInfo} token
   * @param {number} index
   */
  infoTokenTemplate(token, index) {
    const { responseType } = token;
    const label = this.readTokenLabel(token);
    const value = this.readTokenValue(token);
    return html`
    <div class="token-option">
      <input 
        type="radio" 
        id="${responseType}" 
        name="tokenInUse" 
        .value="${String(index)}" 
        ?checked="${this.tokenInUse === index}"
        @change="${this._tokenInUseHandler}"
      >
      <div class="token-info">
        <label for="${responseType}" class="token-label">
          ${label}
        </label>
        ${this.tokenExpirationTemplate(token)}
        <div class="token-value code" title="${value}" @click="${this._selectNodeHandler}" @keydown="${this._copyKeydownHandler}">${value.trim()}</div>
      </div>
    </div>
    `;
  }

  /**
   * @param {OidcTokenInfo} token
   */
  tokenExpirationTemplate(token) {
    const { time, expiresIn } = token;
    if (!time || !expiresIn) {
      return '';
    }
    const d = new Date(time + (expiresIn*1000));
    const expTime = d.toISOString();
    const expired = Date.now() > d.getTime();
    const label = expired ? 'Expired' : 'Expires';
    return html`
    <div class="token-expires">
      ${label} <relative-time datetime="${expTime}"></relative-time>
    </div>
    `;
  }

  /**
   * @returns {TemplateResult|string} The template for the "authorize" button.
   */
  oath2AuthorizeTemplate() {
    const { authorizing, anypoint, discovered } = this;
    return html`
    <div class="authorize-actions">
      <anypoint-button
        ?disabled="${authorizing || !discovered}"
        class="auth-button"
        ?anypoint="${anypoint}"
        emphasis="medium"
        data-type="get-token"
        @click="${this.authorize}"
      >Request tokens</anypoint-button>
    </div>`;
  }
}
