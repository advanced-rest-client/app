import { Tokens } from '../../lib/Tokens.js';
import { OAuth2Authorization, grantResponseMapping, reportOAuthError, resolveFunction, rejectFunction, handleTokenInfo } from './OAuth2Authorization.js';
import { nonceGenerator } from './Utils.js';

/** @typedef {import('@advanced-rest-client/events').Authorization.OidcTokenInfo} OidcTokenInfo */
/** @typedef {import('@advanced-rest-client/events').Authorization.OidcTokenError} OidcTokenError */
/** @typedef {import('@advanced-rest-client/events').Authorization.TokenInfo} TokenInfo */

export class OidcAuthorization extends OAuth2Authorization {
  /**
   * @returns {Promise<URL>} The parameters to build popup URL.
   */
  async buildPopupUrlParams() {
    const url = await super.buildPopupUrlParams();
    const type = /** @type string */ (this.settings.responseType || grantResponseMapping[this.settings.grantType]);
    // ID token nonce
    if (type.includes('id_token')) {
      url.searchParams.set('nonce', nonceGenerator());
    }
    return url;
  }

  /**
   * @param {URLSearchParams} params The instance of search params with the response from the auth dialog.
   * @returns {boolean} true when the params qualify as an authorization popup redirect response.
   */
  validateTokenResponse(params) {
    if (params.has('id_token')) {
      return true;
    }
    return super.validateTokenResponse(params);
  }

  /**
   * Processes the response returned by the popup or the iframe.
   * @param {URLSearchParams} params
   */
  async processTokenResponse(params) {
    this.clearObservers();
    const state = params.get('state');
    if (!state) {
      this[reportOAuthError]('Server did not return the state parameter.', 'no_state');
      return;
    }
    if (state !== this.state) {
      // The authorization class (this) is created per token request so this can only have one state.
      // When the app requests for more tokens at the same time is should create multiple instances of this.
      this[reportOAuthError]('The state value returned by the authorization server is invalid.', 'invalid_state');
      return;
    }
    if (params.has('error')) {
      const info = this.createTokenResponseError(params);
      // @ts-ignore
      this[reportOAuthError](...info);
      return;
    }
    // this is the time when the tokens are received. +- a few ms.
    const time = Date.now();
    const tokens = /** @type {(OidcTokenInfo|OidcTokenError)[]} */ (this.prepareTokens(params, time));
    if (!Array.isArray(tokens) || !tokens.length) {
      this[reportOAuthError]('The authorization response has unknown response type configuration.', 'unknown_state');
      return;
    }
    const codeIndex = tokens.findIndex(i => i.responseType === 'code');
    if (codeIndex >= 0) {
      const codeToken = /** @type OidcTokenInfo */ (tokens[codeIndex]);
      try {
        const info = await this.getCodeInfo(codeToken.code);
        if (info.error) {
          tokens[codeIndex] = /** @type OidcTokenError */ {
            responseType: codeToken.responseType,
            state: codeToken.state,
            error: info.error,
            errorDescription: info.errorDescription,
          };
        } else {
          codeToken.accessToken = info.accessToken;
          codeToken.refreshToken = info.refreshToken;
          codeToken.idToken = info.idToken;
          codeToken.tokenType = info.tokenType;
          codeToken.expiresIn = info.expiresIn;
          codeToken.scope = Tokens.computeTokenInfoScopes(this.settings.scopes, info.scope);
        }
      } catch (e) {
        tokens[codeIndex] = /** @type OidcTokenError */ {
          responseType: codeToken.responseType,
          state: codeToken.state,
          error: 'unknown_state',
          errorDescription: e.message,
        };
      }
    }
    this.finish(tokens);
  }

  /**
   * Creates a token info object for each requested response type. These are created from the params received from the 
   * redirect URI. This means that it might not be complete (for code response type).
   * @param {URLSearchParams} params
   * @param {number} time Timestamp when the tokens were created
   * @returns {OidcTokenInfo[]}
   */
  prepareTokens(params, time) {
    const { grantType, responseType='', scopes } = this.settings;
    let type = responseType;
    if (!type) {
      type = grantResponseMapping[grantType];
    }
    if (!type) {
      return null;
    }
    const types = type.split(' ').map(i => i.trim()).filter(i => !!i);
    return types.map(item => Tokens.createTokenInfo(item, params, time, scopes));
  }

  /**
   * Finishes the authorization.
   * @param {(OidcTokenInfo|OidcTokenError)[]} tokens
   */
  finish(tokens) {
    if (this[resolveFunction]) {
      this[resolveFunction](tokens);
    }
    this[rejectFunction] = undefined;
    this[resolveFunction] = undefined;
  }

  /**
   * Processes token info object when it's ready.
   *
   * @param {TokenInfo} info Token info returned from the server.
   */
  [handleTokenInfo](info) {
    const { responseType } = this.settings;
    const token = Tokens.fromTokenInfo(info);
    token.responseType = responseType;
    this.finish([token]);
  }
}
