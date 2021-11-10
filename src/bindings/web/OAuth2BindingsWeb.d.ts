import { Authorization } from '@advanced-rest-client/events';
import { OAuth2Bindings } from '../base/OAuth2Bindings.js';

/** @typedef {import('@advanced-rest-client/events').Authorization.OAuth2Authorization} OAuth2Settings */
/** @typedef {import('@advanced-rest-client/events').Authorization.OidcAuthorization} OidcSettings */
/** @typedef {import('@advanced-rest-client/events').Authorization.TokenInfo} TokenInfo */
/** @typedef {import('@advanced-rest-client/events').Authorization.OidcTokenInfo} OidcTokenInfo */
/** @typedef {import('@advanced-rest-client/events').Authorization.OidcTokenError} OidcTokenError */

export class OAuth2BindingsWeb extends OAuth2Bindings {
  get redirectUri(): string;
  /**
   * Performs OAuth2 authorization.
   */
  oauth2Authorize(config: Authorization.OAuth2Authorization): Promise<Authorization.TokenInfo>;
  /**
   * Performs OAuth2 Open ID Connect authorization.
   */
   oidcAuthorize(config: Authorization.OAuth2Authorization): Promise<(Authorization.OidcTokenInfo | Authorization.OidcTokenError)[]>;
}
