/* eslint-disable class-methods-use-this */
import { OAuth2Authorization, OidcAuthorization } from '@advanced-rest-client/oauth';
import { OAuth2Bindings } from '../base/OAuth2Bindings.js';

/** @typedef {import('@advanced-rest-client/events').Authorization.OAuth2Authorization} OAuth2Settings */
/** @typedef {import('@advanced-rest-client/events').Authorization.OidcAuthorization} OidcSettings */
/** @typedef {import('@advanced-rest-client/events').Authorization.TokenInfo} TokenInfo */
/** @typedef {import('@advanced-rest-client/events').Authorization.OidcTokenInfo} OidcTokenInfo */
/** @typedef {import('@advanced-rest-client/events').Authorization.OidcTokenError} OidcTokenError */

export class OAuth2BindingsWeb extends OAuth2Bindings {
  get redirectUri() {
    const url = new URL('/node_modules/@advanced-rest-client/oauth/oauth-popup.html', window.location.href);
    return url.toString();
  }

  /**
   * Performs OAuth2 authorization.
   * @param {OAuth2Settings} config
   * @returns {Promise<TokenInfo>}
   */
  async oauth2Authorize(config) {
    const settings = { ...config, redirectUri: this.redirectUri };
    const factory = new OAuth2Authorization(settings);
    factory.checkConfig();
    return factory.authorize();
  }

  /**
   * Performs OAuth2 Open ID Connect authorization.
   * @param {OidcSettings} config
   * @returns {Promise<(OidcTokenInfo | OidcTokenError)[]>}
   */
  async oidcAuthorize(config) {
    const settings = { ...config, redirectUri: this.redirectUri };
    const factory = new OidcAuthorization(settings);
    factory.checkConfig();
    return factory.authorize();
  }
}
