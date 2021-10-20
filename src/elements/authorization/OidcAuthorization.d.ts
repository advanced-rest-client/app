import { OidcTokenError, OidcTokenInfo } from '@advanced-rest-client/events/src/authorization/Authorization';
import { OAuth2Authorization } from './OAuth2Authorization.js';

export declare class OidcAuthorization extends OAuth2Authorization {
  /**
   * @returns The parameters to build popup URL.
   */
  buildPopupUrlParams(): Promise<URL>;

  /**
   * @param params The instance of search params with the response from the auth dialog.
   * @returns true when the params qualify as an authorization popup redirect response.
   */
  validateTokenResponse(params: URLSearchParams): boolean;

  /**
   * Processes the response returned by the popup or the iframe.
   */
  processTokenResponse(params: URLSearchParams): Promise<void>;

  /**
   * Creates a token info object for each requested response type. These are created from the params received from the 
   * redirect URI. This means that it might not be complete (for code response type).
   * 
   * @param time Timestamp when the tokens were created
   */
  prepareTokens(params: URLSearchParams, time: number): OidcTokenInfo[];

  /**
   * Finishes the authorization.
   */
  finish(tokens: (OidcTokenInfo|OidcTokenError)[]): void;

  authorize(): Promise<(OidcTokenInfo|OidcTokenError)[]>;
}
