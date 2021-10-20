/* eslint-disable class-methods-use-this */
import { html } from "lit-html";
import { AuthorizationEvents } from '@advanced-rest-client/events';
import '@anypoint-web-components/awc/anypoint-switch.js';
import '@anypoint-web-components/awc/anypoint-checkbox.js';
import '@anypoint-web-components/awc/anypoint-listbox.js';
import '@anypoint-web-components/awc/anypoint-icon-button.js';
import '@advanced-rest-client/icons/arc-icon.js';
import { passwordTemplate, inputTemplate } from '../CommonTemplates.js';
import AuthUiBase from "./AuthUiBase.js";
import '../../../../define/oauth2-scope-selector.js';
import { CUSTOM_CREDENTIALS, generateState, readUrlValue, selectNode, validateRedirectUri } from "../Utils.js";
import * as KnownGrants from '../../../lib/KnownGrants.js';


/** @typedef {import('lit-element').TemplateResult} TemplateResult */
/** @typedef {import('@advanced-rest-client/events').Authorization.OAuth2Authorization} OAuth2Authorization */
/** @typedef {import('@advanced-rest-client/events').Authorization.OAuth2DeliveryMethod} OAuth2DeliveryMethod */
/** @typedef {import('@advanced-rest-client/events').Authorization.TokenInfo} TokenInfo */
/** @typedef {import('@anypoint-web-components/awc').AnypointListboxElement} AnypointListbox */
/** @typedef {import('@anypoint-web-components/awc').AnypointCheckboxElement} AnypointCheckbox */
/** @typedef {import('@advanced-rest-client/events').Authorization.Oauth2GrantType} Oauth2GrantType */
/** @typedef {import('../types').AuthUiInit} AuthUiInit */
/** @typedef {import('../types').Oauth2Credentials} Oauth2Credentials */
/** @typedef {import('../types').CredentialsInfo} CredentialsInfo */
/** @typedef {import('../../../../').OAuth2ScopeSelectorElement} OAuth2ScopeSelectorElement */
/** @typedef {import('../OAuth2ScopeSelectorElement').AllowedScope} AllowedScope */

/**
 * List of OAuth 2.0 default response types.
 * This list can be extended by custom grants
 *
 * @return {Oauth2GrantType[]} List of objects with `type` and `label`
 * properties.
 */
export const oauth2GrantTypes = [
  {
    type: KnownGrants.implicit,
    label: "Access token (browser flow)",
  },
  {
    type: KnownGrants.code,
    label: "Authorization code (server flow)",
  },
  {
    type: KnownGrants.clientCredentials,
    label: "Client credentials",
  },
  {
    type: KnownGrants.password,
    label: "Password",
  },
  {
    type: KnownGrants.deviceCode,
    label: "Device code",
  },
  {
    type: KnownGrants.jwtBearer,
    label: "JWT Bearer",
  },
];

/**
 * A handler for `focus` event on a label that contains text and
 * should be copied to clipboard when user is interacting with it.
 *
 * @param {KeyboardEvent} e
 */
const selectFocusable = (e) => {
  const node = /** @type {HTMLElement} */ (e.target);
  selectNode(node);
};

export default class OAuth2 extends AuthUiBase {
  /**
   * @return {boolean} Computed value, true if the response type is a custom definition.
   */
  get isCustomGrantType() {
    const { grantType } = this;
    return (
      !!grantType &&
      ![
        KnownGrants.implicit,
        KnownGrants.code,
        KnownGrants.clientCredentials,
        KnownGrants.password,
        KnownGrants.jwtBearer,
        KnownGrants.deviceCode,
      ].includes(grantType)
    );
  }

  /**
   * @returns {boolean} true when the client id field is required.
   */
  get clientIdRequired() {
    const { grantType } = this;
    return ![KnownGrants.clientCredentials, KnownGrants.password, KnownGrants.deviceCode].includes(grantType);
  }

  /**
   * @returns {boolean} true when the client id field is rendered.
   */
  get hasClientId() {
    const { grantType } = this;
    return ![KnownGrants.jwtBearer].includes(grantType);
  }

  /**
   * @returns {boolean} true when the client secret field is rendered.
   */
  get hasClientSecret() {
    const { grantType, isCustomGrantType } = this;
    if (!grantType) {
      return false;
    }
    if (isCustomGrantType) {
      return isCustomGrantType;
    }
    return [
      KnownGrants.code, 
      KnownGrants.clientCredentials, 
      KnownGrants.password,
      KnownGrants.deviceCode,
    ].includes(grantType);
  }

  /**
   * @returns {boolean} true when the client secret field is required.
   */
  get clientSecretRequired() {
    const { grantType } = this;
    return [KnownGrants.code].includes(grantType);
  }

  /**
   * @returns {boolean} true when the authorization URI field is rendered.
   */
  get authorizationUriRendered() {
    const { grantType, isCustomGrantType } = this;
    return isCustomGrantType || [
      KnownGrants.implicit, 
      KnownGrants.code,
    ].includes(grantType);
  }

  /**
   * @returns {boolean} true when the token URI field is rendered.
   */
  get accessTokenUriRendered() {
    const { grantType, isCustomGrantType } = this;
    return  isCustomGrantType || [
      KnownGrants.clientCredentials, 
      KnownGrants.code, 
      KnownGrants.password,
      KnownGrants.jwtBearer,
      KnownGrants.deviceCode,
    ].includes(grantType);
  }

  /**
   * @returns {boolean} true when the username and password fields are rendered.
   */
  get passwordRendered() {
    const { grantType, isCustomGrantType } = this;
    return isCustomGrantType || [KnownGrants.password].includes(grantType);
  }

  /**
   * @returns {boolean} True when the current `grantType` can support redirect URI.
   */
  get hasRedirectUri() {
    const { grantType } = this;
    return [KnownGrants.implicit, KnownGrants.code].includes(grantType);
  }

  /**
   * @param {AuthUiInit} init
   */
  constructor(init) {
    super(init);
    /**
     * Selected authorization grand type.
     * @type {string}
     */
    this.grantType = undefined;
    /**
     * The client ID for the auth token.
     * @type {string}
     */
    this.clientId = undefined;
    /**
     * The client secret. It to be used when selected server flow.
     * @type {string}
     */
    this.clientSecret = undefined;
    /**
     * List of user selected scopes.
     * It can be pre-populated with list of scopes (array of strings).
     * @type {string[]}
     */
    this.scopes = undefined;
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
    /**
     * Authorization redirect URI
     *
     * @type {string}
     */
    this.redirectUri = undefined;
    /**
     * List of pre-defined scopes to choose from. It will be passed to the `oauth2-scope-selector`
     * element.
     * @type {string[] | AllowedScope[]}
     */
    this.allowedScopes = undefined;
    /**
     * If true then the `oauth2-scope-selector` will disallow to add a scope that is not
     * in the `allowedScopes` list. Has no effect if the `allowedScopes` is not set.
     * @type {boolean}
     */
    this.preventCustomScopes = undefined;
    /**
     * When the user authorized the app it should be set to the token value.
     * This element do not perform authorization. Other elements must intercept
     * the token request event and perform the authorization.
     * @type {string}
     */
    this.accessToken = undefined;
    /**
     * By default it is "bearer" as the only one defined in OAuth 2.0 spec.
     * If the token response contains `tokenType` property then this value is updated.
     * @type {string}
     */
    this.tokenType = undefined;
    /**
     * Currently available grant types.
     * @type {Oauth2GrantType[]}
     */
    this.grantTypes = [];
    /**
     * When set it renders authorization url, token url and scopes as the advanced options
     * which are then invisible by default. User can oen setting using the UI.
     * @type {boolean}
     */
    this.advanced = undefined;
    /**
     * If true then the advanced options are opened.
     * @type {boolean}
     */
    this.advancedOpened = undefined;
    /**
     * If set, the response type selector is hidden from the UI.
     * @type {boolean}
     */
    this.noGrantType = undefined;
    /**
     * Informs about what filed of the authenticated request the token property should be set.
     * By default the value is `header` which corresponds to the `authorization` by default,
     * but it is configured by the `deliveryName` property.
     *
     * This can be used by the AMF model when the API spec defines where the access token should be
     * put in the authenticated request.
     *
     * @default header
     * @type {OAuth2DeliveryMethod}
     */
    this.oauthDeliveryMethod = undefined;
    /**
     * The client credentials delivery method.
     * @default body
     * @type {OAuth2DeliveryMethod}
     */
    this.ccDeliveryMethod = 'body';
    /**
     * The name of the authenticated request property that carries the token.
     * By default it is `authorization` which corresponds to `header` value of the `deliveryMethod` property.
     *
     * By setting both `deliveryMethod` and `deliveryName` you instruct the application (assuming it reads this values)
     * where to put the authorization token.
     *
     * @default authorization
     * @type {string}
     */
    this.oauthDeliveryName = undefined;
    /**
     * The base URI to use to construct the correct URLs to the authorization endpoints.
     *
     * When the paths are relative then base URI is added to the path.
     * Relative paths must start with '/'.
     *
     * Note, URL processing is happening internally in the component. The produced authorize event
     * will have base URI already applied.
     * @type {string}
     */
    this.baseUri = undefined;
    /**
     * The error message returned by the authorization library.
     * It renders error dialog when an error ocurred.
     * It is automatically cleared when the user request the token again.
     * @type {string}
     */
    this.lastErrorMessage = undefined;
    /**
     * When this property is set then the PKCE option is not rendered for the
     * `authorization_code`. This is mainly meant to be used by the `api-authorization-method`
     * to keep this control disabled and override generated settings when the API spec
     * says that the PKCE is supported.
     * @type {boolean}
     */
    this.noPkce = undefined;
    /**
     * Whether or not the PKCE extension is enabled for this authorization configuration.
     * Note, PKCE, per the spec, is only available for `authorization_code` grantType.
     * @type {boolean}
     */
    this.pkce = undefined;
    /**
     * The definition of client credentials to be rendered for a given grant type.
     * When set on the editor it renders a drop down where the user can choose from predefined
     * credentials (client id & secret).
     * @type {Oauth2Credentials[]}
     */
    this.credentialsSource = undefined;
    /**
     * Selected credential source
     * @type {string}
     */
    this.credentialSource = undefined;
    /**
     * When set it allows to edit the redirect URI by the user.
     * @type {boolean}
     */
    this.allowRedirectUriChange = undefined;
    /** 
     * The value of the username filed.
     * @type {string}
     */
    this.password = undefined;
    /** 
     * The value of the password filed.
     * @type {string}
     */
    this.username = undefined;
    this.credentialsDisabled = this.disabled;
    /** 
     * The assertion parameter for the JWT token authorization.
     * @type {string}
     * @link https://datatracker.ietf.org/doc/html/rfc7523#section-2.1
     */
    this.assertion = '';
    /** 
     * The device_code parameter for the device code authorization.
     * @type {string}
     * @link https://datatracker.ietf.org/doc/html/rfc8628#section-3.4
     */
    this.deviceCode = '';
    /** 
     * A flag describing that the redirect URL editor is rendered.
     * @type {boolean}
     */
    this.editingRedirectUri = false;

    this._advHandler = this._advHandler.bind(this);
    this._clickCopyAction = this._clickCopyAction.bind(this);
    this._copyKeydownHandler = this._copyKeydownHandler.bind(this);
    this._scopesChanged = this._scopesChanged.bind(this);
    this._pkceChangeHandler = this._pkceChangeHandler.bind(this);
    this._editRedirectUriHandler = this._editRedirectUriHandler.bind(this);
    this._redirectInputKeydown = this._redirectInputKeydown.bind(this);
    this._redirectInputBlur = this._redirectInputBlur.bind(this);
    this._grantTypeSelectionHandler = this._grantTypeSelectionHandler.bind(this);
    this._credentialSourceHandler = this._credentialSourceHandler.bind(this);
  }

  /**
   * Restores previously serialized values.
   * @param {OAuth2Authorization} state Previously serialized values
   */
  restore(state) {
    const type = state.grantType;
    this.grantType = type;
    this.clientId = state.clientId;
    this.accessToken = state.accessToken;
    this.scopes = state.scopes;
    if (state.tokenType) {
      this.tokenType = state.tokenType;
    }
    switch (type) {
      case KnownGrants.implicit:
        this.authorizationUri = state.authorizationUri;
        break;
      case KnownGrants.code:
        this.authorizationUri = state.authorizationUri;
        this.clientSecret = state.clientSecret;
        this.accessTokenUri = state.accessTokenUri;
        this.pkce = state.pkce;
        break;
      case KnownGrants.clientCredentials:
        // The server flow.
        this.clientSecret = state.clientSecret;
        this.accessTokenUri = state.accessTokenUri;
        if (state.deliveryMethod) {
          this.ccDeliveryMethod = state.deliveryMethod;
        }
        break;
      case KnownGrants.password:
        // The server flow.
        this.username = state.username;
        this.password = state.password;
        this.accessTokenUri = state.accessTokenUri;
        this.clientSecret = state.clientSecret;
        break;
      case KnownGrants.deviceCode:
        this.deviceCode = state.deviceCode;
        this.accessTokenUri = state.accessTokenUri;
        this.clientSecret = state.clientSecret;
        break;
      case KnownGrants.jwtBearer:
        this.assertion = state.assertion;
        this.accessTokenUri = state.accessTokenUri;
        break;
      default:
        this.authorizationUri = state.authorizationUri;
        this.clientSecret = state.clientSecret;
        this.accessTokenUri = state.accessTokenUri;
        this.username = state.username;
        this.password = state.password;
    }
    this.requestUpdate();
  }

  /**
   * Serialized input values
   * @return {OAuth2Authorization} An object with user input
   */
  serialize() {
    const { grantType, tokenType, baseUri } = this;
    const detail = /** @type OAuth2Authorization */ ({
      grantType,
      tokenType,
      clientId: this.clientId,
      accessToken: this.accessToken || '',
      scopes: this.scopes,
      deliveryMethod: this.oauthDeliveryMethod,
      deliveryName: this.oauthDeliveryName,
    });

    switch (grantType) {
      case KnownGrants.implicit:
        // The browser flow.
        detail.authorizationUri = readUrlValue(this.authorizationUri, baseUri);
        detail.redirectUri = readUrlValue(this.redirectUri, baseUri);
        break;
      case KnownGrants.code:
        // The server flow.
        detail.authorizationUri = readUrlValue(this.authorizationUri, baseUri);
        detail.clientSecret = this.clientSecret;
        detail.accessTokenUri = readUrlValue(this.accessTokenUri, baseUri);
        detail.redirectUri = readUrlValue(this.redirectUri, baseUri);
        detail.pkce = this.pkce;
        break;
      case 'application':
      case KnownGrants.clientCredentials:
        // The server flow.
        detail.accessTokenUri = readUrlValue(this.accessTokenUri, baseUri);
        detail.clientSecret = this.clientSecret;
        if (this.ccDeliveryMethod) {
          detail.deliveryMethod = this.ccDeliveryMethod;
        } else {
          // historically it was body by default.
          detail.deliveryMethod = 'body';
        }
        break;
      case KnownGrants.password:
        // The server flow.
        detail.username = this.username;
        detail.password = this.password;
        detail.accessTokenUri = readUrlValue(this.accessTokenUri, baseUri);
        detail.clientSecret = this.clientSecret;
        break;
      case KnownGrants.jwtBearer:
        // https://datatracker.ietf.org/doc/html/rfc7523#section-2.1
        detail.assertion = this.assertion;
        detail.accessTokenUri = readUrlValue(this.accessTokenUri, baseUri);
        delete detail.clientId;
        break;
      case KnownGrants.deviceCode:
        // https://datatracker.ietf.org/doc/html/rfc8628#section-3.4
        detail.deviceCode = this.deviceCode;
        detail.accessTokenUri = readUrlValue(this.accessTokenUri, baseUri);
        detail.clientSecret = this.clientSecret;
        break;
      default:
        // Custom response type.
        detail.authorizationUri = readUrlValue(this.authorizationUri, baseUri);
        detail.clientSecret = this.clientSecret;
        detail.accessTokenUri = readUrlValue(this.accessTokenUri, baseUri);
        detail.redirectUri = readUrlValue(this.redirectUri, baseUri);
        detail.username = this.username;
        detail.password = this.password;
        break;
    }
    return detail;
  }

  defaults() {
    let changed = false;
    if (!this.oauthDeliveryName) {
      this.oauthDeliveryName = 'authorization';
      changed = true;
    }
    if (!this.oauthDeliveryMethod) {
      this.oauthDeliveryMethod = 'header';
      changed = true;
    }
    if (!Array.isArray(this.grantTypes) || !this.grantTypes.length) {
      this.grantTypes = oauth2GrantTypes;
      changed = true;
    }
    if (!this.tokenType) {
      this.tokenType = 'Bearer';
      changed = true;
    }
    this.autoHide();
    if (changed) {
      this.requestUpdate();
    }
  }

  reset() {
    this.tokenType = '';
    this.accessToken = '';
    this.grantType = '';
    this.scopes = /** @type string[] */ ([]);
    this.oauthDeliveryMethod = undefined;
    this.oauthDeliveryName = undefined;
    this.authorizationUri = '';
    this.accessTokenUri = '';
    this.clientId = '';
    this.clientSecret = '';
    this.username = '';
    this.password = '';
    this.assertion = '';
    this.deviceCode = '';
    this._autoHideSet = false;

    this.defaults();
    this.notifyChange();
    this.requestUpdate();
  }

  /**
   * Performs the authorization.
   * 
   * @returns {Promise<TokenInfo|null>} The auth token or null if couldn't be requested.
   * @throws {Error} When authorization error
   */
  async authorize() {
    if (this.lastErrorMessage) {
      this.lastErrorMessage = undefined;
    }
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
    let tokenInfo = /** @type TokenInfo */(null);
    try {
      tokenInfo = await AuthorizationEvents.OAuth2.authorize(this.target, detail);
      this.authorizing = false;
      this.requestUpdate();
      this.notifyChange();
      if (!tokenInfo) {
        return null;
      }
      if (detail.grantType === KnownGrants.implicit && tokenInfo.state !== state) {
        return null;
      }
      if (tokenInfo.accessToken && tokenInfo.accessToken !== this.accessToken) {
        if (tokenInfo.tokenType && tokenInfo.tokenType !== this.tokenType) {
          this.tokenType = tokenInfo.tokenType;
        } else if (!tokenInfo.tokenType && this.tokenType !== 'Bearer') {
          this.tokenType = 'Bearer';
        }
        this.accessToken = tokenInfo.accessToken;
        this.requestUpdate();
        this.notifyChange();
      }
    } catch (e) {
      const { message = 'Unknown error' } = e;
      this.lastErrorMessage = message;
      this.authorizing = false;
      this.requestUpdate();
      this.notifyChange();
      throw e;
    }
    return tokenInfo;
  }

  /**
   * This function hides all non-crucial fields that has been pre-filled when element has been
   * initialize (values not provided by the user). Hidden fields will be available under
   * "advanced" options.
   *
   * To prevent this behavior set `no-auto` attribute on this element.
   */
  autoHide() {
    const { grantType, scopes } = this;
    const hasScopes = !!(scopes && scopes.length);
    let advOpened;
    let changed = false;
    switch (grantType) {
      case KnownGrants.implicit:
        advOpened = !(hasScopes && !!this.authorizationUri);
        break;
      case KnownGrants.code:
      case KnownGrants.jwtBearer:
      case KnownGrants.deviceCode:
        advOpened = !(
          hasScopes &&
          !!this.authorizationUri &&
          !!this.accessTokenUri
        );
        break;
      case KnownGrants.clientCredentials:
        advOpened = !this.accessTokenUri;
        break;
      default:
        advOpened = true;
        break;
    }
    if (this.advancedOpened !== advOpened) {
      this.advancedOpened = advOpened;
      changed = true;
    }
    if (!advOpened) {
      this.advanced = true;
      changed = true;
    }
    if (changed) {
      this.requestUpdate();
      this.notifyChange();
    }
  }

  autoHideOnce() {
    if (this._autoHideSet) {
      return;
    }
    this._autoHideSet = true;
    this.autoHide();
  }

  /**
   * A handler for `focus` event on a label that contains text and
   * should be copied to clipboard when user is interacting with it.
   *
   * @param {MouseEvent} e
   */
  _clickCopyAction(e) {
    const node = /** @type {HTMLElement} */ (e.target);
    this._copyFromNode(node);
  }

  /**
   * @param {KeyboardEvent} e
   */
  _copyKeydownHandler(e) {
    if (e.code !== 'Space') {
      return;
    }
    const node = /** @type {HTMLElement} */ (e.target);
    this._copyFromNode(node);
  }

  /**
   * Copies the content of the node to clipboard.
   * @param {HTMLElement} node
   */
  async _copyFromNode(node) {
    await navigator.clipboard.writeText(node.innerText);
    selectNode(node);
  }

  /**
   * Event handler for the scopes element changed state
   * @param {CustomEvent} e
   */
  _scopesChanged(e) {
    this.scopes = /** @type OAuth2ScopeSelectorElement */ (e.target).value;
    this.notifyChange();
  }

  _advHandler(e) {
    this.advancedOpened = e.target.checked;
    this.requestUpdate();
  }

  /**
   * The handler for the change event coming from the PKCE input checkbox
   * @param {Event} e
   */
  _pkceChangeHandler(e) {
    const node = /** @type AnypointCheckbox */ (e.target);
    this.pkce = node.checked;
    this.notifyChange();
  }

  /**
   * A handler for the edit redirect URI button click.
   * Sets the editing flag and requests the update.
   */
  async _editRedirectUriHandler() {
    this.editingRedirectUri = true;
    await this.requestUpdate();
    const input = /** @type HTMLElement */ (this.target.shadowRoot.querySelector('.redirect-input'));
    if (input) {
      input.focus();
    }
  }

  /**
   * Commits the redirect URI editor value on enter key or cancels on escape.
   * @param {KeyboardEvent} e
   */
  _redirectInputKeydown(e) {
    if (['Enter', 'NumpadEnter'].includes(e.code)) {
      const node = /** @type HTMLInputElement */ (e.target);
      this.commitRedirectUri(node.value);
    } else if (e.code === 'Escape') {
      this.cancelRedirectUri();
    }
  }

  /**
   * Commits the redirect URI editor value on input blur.
   * @param {Event} e
   */
  _redirectInputBlur(e) {
    const node = /** @type HTMLInputElement */ (e.target);
    this.commitRedirectUri(node.value);
  }

  /**
   * Sets the new redirect URI if the value passes validation.
   * This closes the editor.
   * @param {string} value The new value to set.
   */
  commitRedirectUri(value) {
    if (!this.editingRedirectUri) {
      // this is needed to make sure the value won't change on escape key press
      // via the blur event
      return;
    }
    const old = this.redirectUri;
    let isValid = validateRedirectUri(value);
    if (isValid && old === value) {
      isValid = false;
    }
    if (isValid) {
      this.redirectUri = value;
      this.notifyChange();
    }
    this.cancelRedirectUri();
  }

  /**
   * Resets the redirect URI edit flag and requests an update.
   */
  cancelRedirectUri() {
    this.editingRedirectUri = false;
    this.requestUpdate();
  }

  /**
   * @return {CredentialsInfo[]} The list of client credentials to render in the credentials selector.
   */
  listCredentials() {
    const { credentialsSource, grantType } =  this;
    /** @type CredentialsInfo[] */
    let credentials = [];
    if (credentialsSource && credentialsSource.length > 0) {
      const grantTypeCredentials = credentialsSource.find(s => s.grantType === grantType);
      if (grantTypeCredentials) {
        const customCredential = { name: CUSTOM_CREDENTIALS };
        credentials = [customCredential].concat(grantTypeCredentials.credentials)
      }
    }
    return credentials;
  }

  /**
   * Sets the client credentials after updating them from the credentials source selector.
   * @param {string} clientId The client id to set on the editor.
   * @param {string} clientSecret The client secret to set on the editor.
   * @param {boolean} disabled Whether the credentials input is disabled.
   */
  updateCredentials(clientId, clientSecret, disabled) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.credentialsDisabled = disabled;
    this.requestUpdate();
  }

  /**
   * This triggers change in the client id & secret of the editor after selecting 
   * a credentials source by the user.
   * 
   * @param {string} selectedSource The name of the selected credentials source to select.
   */
  updateClientCredentials(selectedSource) {
    const { credentialsSource } = this;
    if (!credentialsSource) {
      return;
    }
    if (selectedSource) {
      const credentials = this.listCredentials();
      const credential = credentials.find(c => c.name === selectedSource);
      if (credential) {
        this.updateCredentials(credential.clientId, credential.clientSecret, credential.name !== CUSTOM_CREDENTIALS)
      }
    } else {
      this.updateCredentials('', '', true);
    }
  }

  /**
   * @param {Event} e 
   */
  _grantTypeSelectionHandler(e) {
    const { selected } = /** @type AnypointListbox */ (e.target);
    const { grantType, credentialSource } = this;
    if (grantType !== selected && credentialSource) {
      this.credentialSource = undefined;
      this.credentialsDisabled = this.disabled;
    }
    this.selectHandler(e);
    this.autoHide();
    this.requestUpdate();
  }

  /**
   * @param {Event} e 
   */
  _credentialSourceHandler(e) {
    const { selected } = /** @type AnypointListbox */ (e.target);
    this.updateClientCredentials(/** @type string */(selected));
    this.selectHandler(e);
  }

  /**
   * @returns {boolean} true when a credentials source is being selected.
   */
  isSourceSelected() {
    const { credentialSource } = this;
    const credentials = this.listCredentials();
    if (credentials.length > 0) {
      if (!credentialSource) {
        return false;
      }
    }
    return true
  }

  render() {
    const {
      accessToken,
      lastErrorMessage,
    } = this;
    return html`
    <form autocomplete="on" class="oauth2-auth">
      ${this.formContentTemplate()}
    </form>
    ${this.oauth2RedirectTemplate()}
    ${accessToken ? this.oauth2TokenTemplate() : this.oath2AuthorizeTemplate()}
    ${lastErrorMessage ? html`<p class="error-message">⚠ ${lastErrorMessage}</p>` : ''}
    `;
  }

  /**
   * @return {(TemplateResult|string)[]} The template for the <form> content.
   */
  formContentTemplate() {
    const result = [
      this.oauth2GrantTypeTemplate(),
      this.credentialsSourceTemplate(),
      this.clientIdTemplate(),
      this.clientSecretTemplate(),
      this.assertionTemplate(),
      this.deviceCodeTemplate(),
      this.oauth2CustomPropertiesTemplate(),
      this.toggleAdvViewSwitchTemplate(),
      this.oauth2AdvancedTemplate(),
    ];
    return result;
  }

  /**
   * @return {TemplateResult|string} The template for API custom properties (annotations)
   */
  oauth2CustomPropertiesTemplate() {
    return '';
  }

  /**
   * @returns {TemplateResult|string} The template for the OAuth 2 response type selector
   */
  oauth2GrantTypeTemplate() {
    const ctx = this;
    const {
      grantType,
      outlined,
      anypoint,
      readOnly,
      disabled,
      noGrantType,
      isCustomGrantType,
    } = this;
    const items = this.grantTypes || [];
    return html`
    <anypoint-dropdown-menu
      name="grantType"
      ?required="${!isCustomGrantType}"
      class="grant-dropdown"
      ?hidden="${noGrantType}"
      .outlined="${outlined}"
      .anypoint="${anypoint}"
      .disabled="${disabled||readOnly}"
    >
      <label slot="label">Grant type</label>
      <anypoint-listbox
        slot="dropdown-content"
        .selected="${grantType}"
        @selectedchange="${ctx._grantTypeSelectionHandler}"
        data-name="grantType"
        .anypoint="${anypoint}"
        .disabled="${disabled||readOnly}"
        attrforselected="data-value"
      >
        ${items.map((item) => html`
        <anypoint-item
          .anypoint="${anypoint}"
          data-value="${item.type}"
        >${item.label}</anypoint-item>`)}
      </anypoint-listbox>
    </anypoint-dropdown-menu>`;
  }

  /**
   * @return {TemplateResult|string} The template for the client credentials source.
   */
  credentialsSourceTemplate() {
    const ctx = this;
    const {
      outlined,
      anypoint,
      credentialSource,
    } = this;

    const credentials = this.listCredentials();
    if (credentials.length === 0) {
      return '';
    }

    return html`
    <anypoint-dropdown-menu
      name="credentialSource"
      required
      class="credential-source-dropdown"
      .outlined="${outlined}"
      .anypoint="${anypoint}"
    >
      <label slot="label">Credentials source</label>
      <anypoint-listbox
        slot="dropdown-content"
        .selected="${credentialSource}"
        @selectedchange="${ctx._credentialSourceHandler}"
        data-name="credentialSource"
        .anypoint="${anypoint}"
        attrforselected="data-value"
      >
      ${credentials.map((item) => html`
        <anypoint-item
          .anypoint="${anypoint}"
          data-value="${item.name}"
        >${item.name}</anypoint-item>`)}
      </anypoint-listbox>
    </anypoint-dropdown-menu>
`;
  }

  /**
   * @returns {TemplateResult|string} The template for the OAuth 2 client id input.
   */
  clientIdTemplate() {
    if (!this.hasClientId) {
      return '';
    }
    const { clientId, outlined, anypoint, readOnly, credentialsDisabled, clientIdRequired } = this;
    const sourceSelected = this.isSourceSelected();
    return passwordTemplate(
      'clientId',
      clientId,
      'Client id',
      this.changeHandler,
      {
        outlined,
        anypoint,
        readOnly,
        disabled: sourceSelected ? credentialsDisabled : true,
        required: clientIdRequired,
        autoValidate: true,
        invalidLabel: 'Client ID is required for this response type',
        infoLabel: clientIdRequired
          ? undefined
          : 'Client id is optional for this response type',
      }
    );
  }

  /**
   * @returns {TemplateResult|string} The template for the OAuth 2 client secret input.
   */
  clientSecretTemplate() {
    const { hasClientSecret } = this;
    if (!hasClientSecret) {
      return '';
    }
    const { clientSecret, outlined, anypoint, readOnly, credentialsDisabled, clientSecretRequired } = this;
    const ctx = this;
    const sourceSelected = this.isSourceSelected();
    return passwordTemplate(
      'clientSecret',
      clientSecret,
      'Client secret',
      ctx.changeHandler,
      {
        outlined,
        anypoint,
        readOnly,
        disabled: sourceSelected ? credentialsDisabled : true,
        required: clientSecretRequired,
        autoValidate: true,
        invalidLabel: 'Client secret is required for this response type',
        infoLabel: clientSecretRequired
          ? undefined
          : 'Client secret is optional for this response type',
      }
    );
  }

  /**
   * @returns {TemplateResult|string} The template for the toggle advanced view switch
   */
  toggleAdvViewSwitchTemplate() {
    const { advanced } = this;
    if (!advanced) {
      return '';
    }
    const { readOnly, advancedOpened, anypoint } = this;
    return html` 
    <div class="adv-toggle">
      <anypoint-switch
        class="adv-settings-input"
        .checked="${advancedOpened}"
        @change="${this._advHandler}"
        ?disabled="${readOnly}"
        ?anypoint="${anypoint}"
      >Advanced settings</anypoint-switch>
    </div>`;
  }

  /**
   * @returns {TemplateResult|string} The template for the OAuth 2 advanced options.
   */
  oauth2AdvancedTemplate() {
    const {
      advancedOpened,
      baseUri,
    } = this;
    // When the baseUri is set then validation won't allow to provide
    // relative paths to the authorization endpoint hence this should be
    // defined as string and not "url".
    const urlType = baseUri ? 'string' : 'url';
    return html`
    <div class="advanced-section" ?hidden="${!advancedOpened}">
      ${this.authorizationUriTemplate(urlType)}
      ${this.accessTokenUriTemplate(urlType)}
      ${this.usernameTemplate()}
      ${this.passwordTemplateLocal()}
      ${this.scopesTemplate()}
      ${this.paramsLocationTemplate()}
      ${this.pkceTemplate()}
    </div>`;
  }

  /**
   * @returns {TemplateResult|string} The template for the OAuth 2 redirect URI label
   */
  oauth2RedirectTemplate() {
    const { hasRedirectUri } = this;
    if (!hasRedirectUri) {
      return '';
    }
    const editing = this.allowRedirectUriChange && this.editingRedirectUri;
    return html`
    <div class="subtitle">Redirect URI</div>
    <section>
      <div class="redirect-section">
        ${editing ? this.redirectUriInputTemplate() : this.redirectUriContentTemplate()}
      </div>
    </section>
    `;
  }

  /**
   * @returns {TemplateResult|string} The template for the OAuth 2 token value
   */
  oauth2TokenTemplate() {
    const { accessToken, anypoint, authorizing } = this;
    return html`
    <div class="current-token">
      <label class="token-label">Current token</label>
      <p class="read-only-param-field padding">
        <span class="code" @click="${this._clickCopyAction}" @keydown="${this._copyKeydownHandler}">${accessToken}</span>
      </p>
      <div class="authorize-actions">
        <anypoint-button
          ?disabled="${authorizing}"
          class="auth-button"
          ?anypoint="${anypoint}"
          emphasis="medium"
          data-type="refresh-token"
          @click="${this.authorize}"
        >Refresh access token</anypoint-button>
      </div>
    </div>`;
  }

  /**
   * @returns {TemplateResult|string} The template for the "authorize" button.
   */
  oath2AuthorizeTemplate() {
    const { authorizing, anypoint } = this;
    return html`
    <div class="authorize-actions">
      <anypoint-button
        ?disabled="${authorizing}"
        class="auth-button"
        ?anypoint="${anypoint}"
        emphasis="medium"
        data-type="get-token"
        @click="${this.authorize}"
      >Request access token</anypoint-button>
    </div>`;
  }

  /**
   * @param {string} urlType The input type to render
   * @returns {TemplateResult|string} The template for the authorization URI input
   */
  authorizationUriTemplate(urlType) {
    if (!this.authorizationUriRendered) {
      return '';
    }
    const { readOnly, authorizationUri, anypoint, outlined, disabled, isCustomGrantType } = this;
    return inputTemplate(
      'authorizationUri',
      authorizationUri,
      'Authorization URI',
      this.changeHandler,
      {
        outlined,
        anypoint,
        readOnly,
        disabled,
        type: urlType,
        required: !isCustomGrantType,
        autoValidate: true,
        invalidLabel: 'Authorization URI is required for this response type',
      }
    );
  }

  /**
   * @param {string} urlType The input type to render
   * @returns {TemplateResult|string} The template for the access token URI input
   */
  accessTokenUriTemplate(urlType) {
    if (!this.accessTokenUriRendered) {
      return '';
    }
    const { readOnly, accessTokenUri, anypoint, outlined, disabled, isCustomGrantType } = this;
    return inputTemplate(
      'accessTokenUri',
      accessTokenUri,
      'Access token URI',
      this.changeHandler,
      {
        outlined,
        anypoint,
        readOnly,
        disabled,
        type: urlType,
        required: !isCustomGrantType,
        autoValidate: true,
        invalidLabel: 'Access token URI is required for this response type',
      }
    );
  }

  /**
   * @returns {TemplateResult|string} The template for the user name input
   */
  usernameTemplate() {
    if (!this.passwordRendered) {
      return '';
    }
    const { readOnly, username, anypoint, outlined, disabled, isCustomGrantType } = this;
    return inputTemplate(
      'username',
      username,
      'Username',
      this.changeHandler,
      {
        outlined,
        anypoint,
        readOnly,
        disabled,
        required: !isCustomGrantType,
        autoValidate: true,
        invalidLabel: 'User name is required for this response type',
      }
    );
  }

  /**
   * @returns {TemplateResult|string} The template for the user password input
   */
  passwordTemplateLocal() {
    if (!this.passwordRendered) {
      return '';
    }
    const { readOnly, password, anypoint, outlined, disabled, isCustomGrantType } = this;
    return inputTemplate(
      'password',
      password,
      'Password',
      this.changeHandler,
      {
        outlined,
        anypoint,
        readOnly,
        disabled,
        required: !isCustomGrantType,
        autoValidate: true,
        invalidLabel: 'Password is required for this response type',
      }
    );
  }

  /**
   * @returns {TemplateResult} The template for the OAuth 2 scopes input
   */
  scopesTemplate() {
    const {
      allowedScopes,
      preventCustomScopes,
      outlined,
      anypoint,
      readOnly,
      disabled,
      scopes,
    } = this;
    return html`
    <oauth2-scope-selector
      .allowedScopes="${allowedScopes}"
      .preventCustomScopes="${preventCustomScopes}"
      .value="${scopes}"
      ?readOnly="${readOnly}"
      ?disabled="${disabled}"
      ?outlined="${outlined}"
      ?anypoint="${anypoint}"
      name="scopes"
      @change="${this._scopesChanged}"
    ></oauth2-scope-selector>`;
  }

  /**
   * For client_credentials grant this renders the dropdown with an option to select
   * where the credentials should be used. Current values: 
   * - authorization header
   * - message body
   * @return {TemplateResult|string} 
   */
  paramsLocationTemplate() {
    const { grantType } = this;
    if (grantType !== KnownGrants.clientCredentials) {
      return '';
    }
    const { ccDeliveryMethod, outlined, anypoint, disabled, readOnly } = this;
    return html`
    <anypoint-dropdown-menu
      name="ccDeliveryMethod"
      class="delivery-dropdown"
      .outlined="${outlined}"
      .anypoint="${anypoint}"
      .disabled="${disabled||readOnly}"
    >
      <label slot="label">Credentials location</label>
      <anypoint-listbox
        slot="dropdown-content"
        .selected="${ccDeliveryMethod}"
        @selectedchange="${this.selectHandler}"
        data-name="ccDeliveryMethod"
        .anypoint="${anypoint}"
        .disabled="${disabled||readOnly}"
        attrforselected="data-value"
      >
        <anypoint-item .anypoint="${anypoint}" data-value="header">Authorization header</anypoint-item>
        <anypoint-item .anypoint="${anypoint}" data-value="body">Message body</anypoint-item>
      </anypoint-listbox>
    </anypoint-dropdown-menu>
    `;
  }

  /**
   * @returns {TemplateResult|string} The template for the PKCE option of the OAuth 2 extension.
   */
  pkceTemplate() {
    const { grantType, noPkce, pkce } = this;
    if (noPkce || grantType !== KnownGrants.code) {
      return '';
    }
    return html`
    <anypoint-checkbox
      .checked="${pkce}"
      title="Enables PKCE extension of the OAuth 2 protocol."
      name="pkce"
      @change="${this._pkceChangeHandler}"
    >Use PKCE extension</anypoint-checkbox>
    `;
  }

  /**
   * @returns {TemplateResult} The template for the OAuth 2 redirect URI input
   */
  redirectUriInputTemplate() {
    const { redirectUri } = this;
    return html`
    <anypoint-input 
      class="redirect-input" 
      .value="${redirectUri}"
      @blur="${this._redirectInputBlur}"
      @keydown="${this._redirectInputKeydown}"
      required
      autoValidate
      type="url"
    >
      <label slot="label">Redirect URI value</label>
    </anypoint-input>
    `;
  }

  /**
   * @returns {TemplateResult} The template for the OAuth 2 redirect URI content
   */
  redirectUriContentTemplate() {
    const { redirectUri } = this;
    return html`
    <p class="read-only-param-field padding">
      <span
        class="code"
        @click="${this._clickCopyAction}"
        @keydown="${this._copyKeydownHandler}"
        @focus="${selectFocusable}"
        title="Click to copy the URI"
        tabindex="0"
      >${redirectUri}</span>
      ${this.editRedirectUriTemplate()}
    </p>
    `;
  }

  /**
   * @return {TemplateResult|string} The template for the edit redirect URI button, when enabled.
   */
  editRedirectUriTemplate() {
    const { allowRedirectUriChange } = this;
    if (!allowRedirectUriChange) {
      return '';
    }
    return html`
    <anypoint-icon-button
      title="Edit the redirect URI"
      class="edit-rdr-uri"
      @click="${this._editRedirectUriHandler}"
    >
      <arc-icon icon="edit"></arc-icon>
    </anypoint-icon-button>
    `;
  }

  /**
   * @return {TemplateResult|string} The template for the assertion (JWT) input, when needed.
   */
  assertionTemplate() {
    if (this.grantType !== KnownGrants.jwtBearer) {
      return '';
    }
    const { readOnly, assertion, anypoint, outlined, disabled } = this;
    return inputTemplate(
      'assertion',
      assertion,
      'Assertion (JWT)',
      this.changeHandler,
      {
        outlined,
        anypoint,
        readOnly,
        disabled,
        required: true,
        autoValidate: true,
        invalidLabel: 'Assertion is required for this response type',
      }
    );
  }

  /**
   * @return {TemplateResult|string} The template for the device code input, when needed.
   */
  deviceCodeTemplate() {
    if (this.grantType !== KnownGrants.deviceCode) {
      return '';
    }
    const { readOnly, deviceCode, anypoint, outlined, disabled } = this;
    return inputTemplate(
      'deviceCode',
      deviceCode,
      'Device code',
      this.changeHandler,
      {
        outlined,
        anypoint,
        readOnly,
        disabled,
        required: true,
        autoValidate: true,
        invalidLabel: 'Device code is required for this response type',
      }
    );
  }
}
