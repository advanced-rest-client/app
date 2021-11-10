import { OAuth2AuthorizeEvent, OAuth2RemoveTokenEvent, OidcAuthorizeEvent, OidcRemoveTokensEvent, Authorization } from '@advanced-rest-client/events';
import { PlatformBindings } from './PlatformBindings.js';

/**
 * The base bindings for OAuth2.
 */
export class OAuth2Bindings extends PlatformBindings {
  initialize(): Promise<void>;
  oauth2AuthorizeHandler(e: OAuth2AuthorizeEvent): void;
  oauth2removeTokenHandler(e: OAuth2RemoveTokenEvent): void;
  oidcAuthorizeHandler(e: OidcAuthorizeEvent): void;
  oidcRemoveTokensHandler(e: OidcRemoveTokensEvent): void;
  /**
   * Performs OAuth2 authorization.
   */
  oauth2Authorize(config: Authorization.OAuth2Authorization): Promise<Authorization.TokenInfo>;
  /**
   * Removes OAuth 2 tokens from the app store.
   */
  oauth2RemoveToken(config: Authorization.TokenRemoveOptions): Promise<void>;
  /**
   * Performs OAuth2 Open ID Connect authorization.
   */
  oidcAuthorize(config: Authorization.OAuth2Authorization): Promise<(Authorization.OidcTokenInfo | Authorization.OidcTokenError)[]>
  /**
   * Removes Open ID Connect tokens from the app store.
   */
  oidcRemoveTokens(config: Authorization.TokenRemoveOptions): Promise<void>;
}
