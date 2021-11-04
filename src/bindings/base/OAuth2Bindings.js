/* eslint-disable no-unused-vars */
/* eslint-disable class-methods-use-this */
import { EventTypes } from '@advanced-rest-client/events';
import { PlatformBindings } from './PlatformBindings.js';

/** @typedef {import('@advanced-rest-client/events').Authorization.OAuth2Authorization} OAuth2Authorization */
/** @typedef {import('@advanced-rest-client/events').Authorization.OidcAuthorization} OidcAuthorization */
/** @typedef {import('@advanced-rest-client/events').Authorization.TokenRemoveOptions} TokenRemoveOptions */
/** @typedef {import('@advanced-rest-client/events').Authorization.TokenInfo} TokenInfo */
/** @typedef {import('@advanced-rest-client/events').Authorization.OidcTokenInfo} OidcTokenInfo */
/** @typedef {import('@advanced-rest-client/events').Authorization.OidcTokenError} OidcTokenError */
/** @typedef {import('@advanced-rest-client/events').OidcAuthorizeEvent} OidcAuthorizeEvent */
/** @typedef {import('@advanced-rest-client/events').OidcRemoveTokensEvent} OidcRemoveTokensEvent */
/** @typedef {import('@advanced-rest-client/events').OAuth2AuthorizeEvent} OAuth2AuthorizeEvent */
/** @typedef {import('@advanced-rest-client/events').OAuth2RemoveTokenEvent} OAuth2RemoveTokenEvent */

/**
 * The base bindings for OAuth2.
 */
export class OAuth2Bindings extends PlatformBindings {
  async initialize() {
    window.addEventListener(EventTypes.Authorization.OAuth2.authorize, this.oauth2AuthorizeHandler.bind(this));
    window.addEventListener(EventTypes.Authorization.OAuth2.removeToken, this.oauth2removeTokenHandler.bind(this));
    window.addEventListener(EventTypes.Authorization.Oidc.authorize, this.oidcAuthorizeHandler.bind(this));
    window.addEventListener(EventTypes.Authorization.Oidc.removeTokens, this.oidcRemoveTokensHandler.bind(this));
  }

  /**
   * @param {OAuth2AuthorizeEvent} e
   */
  oauth2AuthorizeHandler(e) {
    if (e.defaultPrevented) {
      return;
    }
    e.preventDefault();
    const config = /** @type OAuth2Authorization */ ({ ...e.detail });
    e.detail.result = this.oauth2Authorize(config);
  }

  /**
   * @param {OAuth2RemoveTokenEvent} e
   */
  oauth2removeTokenHandler(e) {
    if (e.defaultPrevented) {
      return;
    }
    e.preventDefault();
    const config = /** @type TokenRemoveOptions */ ({ ...e.detail });
    e.detail.result = this.oauth2RemoveToken(config);
  }

  /**
   * @param {OidcAuthorizeEvent} e
   */
  oidcAuthorizeHandler(e) {
    if (e.defaultPrevented) {
      return;
    }
    e.preventDefault();
    const config = /** @type OAuth2Authorization */ ({ ...e.detail });
    e.detail.result = this.oidcAuthorize(config);
  }

  /**
   * @param {OidcRemoveTokensEvent} e
   */
  oidcRemoveTokensHandler(e) {
    if (e.defaultPrevented) {
      return;
    }
    e.preventDefault();
    const config = /** @type TokenRemoveOptions */ ({ ...e.detail });
    e.detail.result = this.oidcRemoveTokens(config);
  }

  /**
   * Performs OAuth2 authorization.
   * @param {OAuth2Authorization} config
   * @returns {Promise<TokenInfo>}
   */
  async oauth2Authorize(config) {
    throw new Error('Not yet implemented');
  }

  /**
   * Removes OAuth 2 tokens from the app store.
   * @param {TokenRemoveOptions} config
   * @returns {Promise<void>}
   */
  async oauth2RemoveToken(config) {
    throw new Error('Not yet implemented');
  }

  /**
   * Performs OAuth2 Open ID Connect authorization.
   * @param {OAuth2Authorization} config
   * @returns {Promise<(OidcTokenInfo | OidcTokenError)[]>}
   */
  async oidcAuthorize(config) {
    throw new Error('Not yet implemented');
  }

  /**
   * Removes Open ID Connect tokens from the app store.
   * @param {TokenRemoveOptions} config
   * @returns {Promise<void>}
   */
  async oidcRemoveTokens(config) {
    throw new Error('Not yet implemented');
  }
}
