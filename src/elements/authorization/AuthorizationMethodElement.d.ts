import { LitElement, CSSResult, TemplateResult } from 'lit-element';
import { EventsTargetMixin } from '@anypoint-web-components/awc';
import { Oauth2Credentials } from './types';
import { AllowedScope } from './OAuth2ScopeSelectorElement';
import { OAuth2DeliveryMethod, OidcTokenError, OidcTokenInfo, Oauth2GrantType, Oauth2ResponseType } from '@advanced-rest-client/events/src/authorization/Authorization';

export const typeChangedSymbol: unique symbol;
export const typeValue: unique symbol;
export const factory: unique symbol;
export const renderCallback: unique symbol;
export const changeCallback: unique symbol;
export const oauth1tokenResponseHandler: unique symbol;
export const oauth1ErrorHandler: unique symbol;
export const propagateChanges: unique symbol;

/**
 * An element that renders various authorization methods.
 *
 * ## Development
 *
 * The element mixes in multiple mixins from `src/` directory.
 * Each mixin support an authorization method. When selection change (the `type`
 * property) a render function from corresponding mixin is called.
 * 
 * @fires change When authorization state change
 */
export default class AuthorizationMethod extends EventsTargetMixin(LitElement) {
  get styles(): CSSResult;

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
   *
   * Depending on selected type different properties are used.
   * For example Basic type only uses `username` and `password` properties,
   * while NTLM also uses `domain` property.
   *
   * See readme file for detailed list of properties depending on selected type.
   * @attribute
   */
  type: string;
  // [typeValue]: string;
  /**
   * When set the editor is in read only mode.
   * @attribute
   */
  readOnly: boolean;
  /**
   * When set the inputs are disabled
   * @attribute
   */
  disabled: boolean;
  /**
   * Enables Anypoint theme.
   * @attribute
   */
  anypoint: boolean;
  /**
   * Enables Material Design outlined style
   * @attribute
   */
  outlined: boolean;

  /**
   * Used in the following types:
   * - OAuth 1
   * - OAuth 2
   */
  get authorizing(): boolean | undefined;
  _authorizing: boolean | undefined;
  /**
   * Current username.
   *
   * Used in the following types:
   * - Basic
   * - NTLM
   * - Digest
   * - OAuth 2
   * @attribute
   */
  username: string;
  /**
   * Current password.
   *
   * Used in the following types:
   * - Basic
   * - NTLM
   * - Digest
   * - OAuth 2
   * @attribute
   */
  password: string;
  /**
   * Authorization redirect URI
   *
   * Used in the following types:
   * - OAuth 1
   * - OAuth 2
   * @attribute
   */
  redirectUri: string;
  /**
   * Endpoint to authorize the token (OAuth 1) or exchange code for token (OAuth 2).
   *
   * Used in the following types:
   * - OAuth 1
   * - OAuth 2
   * @attribute
   */
  accessTokenUri: string;
  /**
   * An URI of authentication endpoint where the user should be redirected
   * to authorize the app. This endpoint initialized OAuth flow.
   *
   * Used in the following types:
   * - OAuth 1
   * - OAuth 2
   * @attribute
   */
  authorizationUri: string;
  /**
   * Oauth 1 or Bearer token (from the oauth console or received from auth server)
   *
   * Used in the following types:
   * - OAuth 1
   * - Bearer
   * 
   * @attribute
   */
  token: string;
  /**
   * Authorization domain
   *
   * Used in the following types:
   * - NTLM
   * @attribute
   */
  domain?: string;
  /**
   * Server issued realm for Digest authorization.
   *
   * Used in the following types:
   * - Digest
   * 
   * @attribute
   */
  realm: string;

  /**
   * Server issued nonce for Digest authorization.
   *
   * Used in the following types:
   * - Digest
   * - OAuth 1
   * 
   * @attribute
   */
  nonce: string;

  /**
   * The algorithm used to hash the response for Digest authorization.
   *
   * It can be either `MD5` or `MD5-sess`.
   *
   * Used in the following types:
   * - Digest
   * 
   * @attribute
   */
  algorithm: string;

  /**
   * The quality of protection value for the digest response.
   * Either '', 'auth' or 'auth-int'
   *
   * Used in the following types:
   * - Digest
   * 
   * @attribute
   */
  qop: string;

  /**
   * Nonce count - increments with each request used with the same nonce
   *
   * Used in the following types:
   * - Digest
   * 
   * @attribute
   */
  nc: number;

  /**
   * Client nonce
   *
   * Used in the following types:
   * - Digest
   * 
   * @attribute
   */
  cnonce: string;

  /**
   * A string of data specified by the server
   *
   * Used in the following types:
   * - Digest
   * 
   * @attribute
   */
  opaque: string;

  /**
   * Hashed response to server challenge
   *
   * Used in the following types:
   * - Digest
   * 
   * @attribute
   */
  response: string;

  /**
   * Request HTTP method
   *
   * Used in the following types:
   * - Digest
   * 
   * @attribute
   */
  httpMethod: string;

  /**
   * Current request URL.
   *
   * Used in the following types:
   * - Digest
   * 
   * @attribute
   */
  requestUrl: string;

  /**
   * Current request body.
   *
   * Used in the following types:
   * - Digest
   * 
   * @attribute
   */
  requestBody: any;
  /**
   * Client ID aka consumer key
   * 
   * Used by OAuth 1
   * @attribute
   */
  consumerKey: string;
  /**
   * The client secret aka consumer secret
   * 
   * Used by OAuth 1
   * @attribute
   */
  consumerSecret: string;
  /**
   * Oauth 1 token secret (from the oauth console).
   * 
   * Used by OAuth 1
   * @attribute
   */
  tokenSecret: string;
  /**
   * Token request timestamp
   * 
   * Used by OAuth 1
   * @attribute
   */
  timestamp: number;
  /**
   * Signature method. Enum {`HMAC-SHA256`, `HMAC-SHA1`, `PLAINTEXT`}
   * 
   * Used by OAuth 1
   * @attribute
   */
  signatureMethod: string;
  /**
   * OAuth1 endpoint to obtain request token to request user authorization.
   * 
   * Used by OAuth 1
   * @attribute
   */
  requestTokenUri: string;
  /**
   * HTTP method to obtain authorization header.
   * Spec recommends POST
   * 
   * Used by OAuth 1
   * @attribute
   */
  authTokenMethod: string;
  /**
   * A location of the OAuth 1 authorization parameters.
   * It can be either in the URL as a query string (`querystring` value)
   * or in the authorization header (`authorization`) value.
   *
   * Used in the following types:
   * - OAuth 1
   * @attribute
   */
  authParamsLocation: string;
  /**
   * List of currently support signature methods.
   * 
   * Used by OAuth 1
   */
  signatureMethods: string[];
  /**
   * Selected authorization grand type.
   * @attribute
   */
  grantType: string;
  /**
   * The client ID for the auth token.
   * @attribute
   */
  clientId: string;
  /**
   * The client secret. It to be used when selected server flow.
   * @attribute
   */
  clientSecret: string;
  /**
   * List of user selected scopes.
   * It can be pre-populated with list of scopes (array of strings).
   */
  scopes: string[];

  /**
   * List of pre-defined scopes to choose from. It will be passed to the `oauth2-scope-selector`
   * element.
   */
  allowedScopes: string[] | AllowedScope[];
  /**
   * If true then the `oauth2-scope-selector` will disallow to add a scope that is not
   * in the `allowedScopes` list. Has no effect if the `allowedScopes` is not set.
   * @attribute
   */
  preventCustomScopes: boolean;
  /**
   * When the user authorized the app it should be set to the token value.
   * This element do not perform authorization. Other elements must intercept
   * the token request event and perform the authorization.
   * @attribute
   */
  accessToken: string;
  /**
   * By default it is "bearer" as the only one defined in OAuth 2.0 spec.
   * If the token response contains `tokenType` property then this value is updated.
   * @attribute
   */
  tokenType: string;
  /**
   * Currently available grant types.
   */
  grantTypes: Oauth2GrantType[];
  /**
   * If set it renders authorization url, token url and scopes as advanced options
   * which are then invisible by default. User can oen setting using the UI.
   * @attribute
   */
  advanced: boolean;
  /**
   * If true then the advanced options are opened.
   * @attribute
   */
  advancedOpened: boolean;
  /**
   * If set, the response type selector is hidden from the UI.
   * @attribute
   */
  noGrantType: boolean;
  /**
   * Informs about what filed of the authenticated request the token property should be set.
   * By default the value is `header` which corresponds to the `authorization` by default,
   * but it is configured by the `deliveryName` property.
   *
   * This can be used by the AMF model when the API spec defines where the access token should be
   * put in the authenticated request.
   *
   * @default header
   * @attribute
   */
  oauthDeliveryMethod: OAuth2DeliveryMethod;
  /**
   * The client credentials delivery method.
   * @default body
   * @attribute
   */
  ccDeliveryMethod: OAuth2DeliveryMethod;
  /**
   * The name of the authenticated request property that carries the token.
   * By default it is `authorization` which corresponds to `header` value of the `deliveryMethod` property.
   *
   * By setting both `deliveryMethod` and `deliveryName` you instruct the application (assuming it reads this values)
   * where to put the authorization token.
   *
   * @default authorization
   * @attribute
   */
  oauthDeliveryName: string;
  /**
   * The base URI to use to construct the correct URLs to the authorization endpoints.
   *
   * When the paths are relative then base URI is added to the path.
   * Relative paths must start with '/'.
   *
   * Note, URL processing is happening internally in the component. The produced authorize event
   * will have base URI already applied.
   * @attribute
   */
  baseUri: string;
  /**
   * The error message returned by the authorization library.
   * It renders error dialog when an error ocurred.
   * It is automatically cleared when the user request the token again.
   */
  lastErrorMessage: string;
  /**
   * When this property is set then the PKCE option is not rendered for the
   * `authorization_code`. This is mainly meant to be used by the `api-authorization-method`
   * to keep this control disabled and override generated settings when the API spec
   * says that the PKCE is supported.
   * @attribute
   */
  noPkce: boolean;
  /**
   * Whether or not the PKCE extension is enabled for this authorization configuration.
   * Note, PKCE, per the spec, is only available for `authorization_code` grantType.
   * @attribute
   */
  pkce: boolean;
  /**
   * The definition of client credentials to be rendered for a given grant type.
   * When set on the editor it renders a drop down where the user can choose from predefined
   * credentials (client id & secret).
   */
  credentialsSource: Oauth2Credentials[];
  /**
   * Selected credential source
   * @attribute
   */
  credentialSource: string;
  /**
   * When set it allows to edit the redirect URI by the user.
   * @attribute
   */
  allowRedirectUriChange: boolean;
  /** 
   * The OpenID discovery URI.
   * @attribute
   */
  issuerUri: string;
  /** 
   * The assertion parameter for the JWT token authorization.
   * 
   * @link https://datatracker.ietf.org/doc/html/rfc7523#section-2.1
   * @attribute
   */
  assertion: string;
  /** 
   * The device_code parameter for the device code authorization.
   * 
   * @link https://datatracker.ietf.org/doc/html/rfc8628#section-3.4
   * @attribute
   */
  deviceCode: string;
  /** 
   * In OIDC configuration, the list of mist recent tokens requested from the auth server.
   */
  tokens: (OidcTokenInfo | OidcTokenError)[];
  /** 
   * In OIDC configuration, the array index of the token to be used with HTTP request.
   * @attribute
   */
  tokenInUse: number;
  /** 
   * In OIDC configuration, the list of response types supported by the authorization server.
   */
  supportedResponses: Oauth2ResponseType[][];
  /** 
   * In OIDC configuration, the list of scopes supported by the authorization server.
   */
  serverScopes: string[];
  /** 
   * In OIDC configuration, the response type to be used with the OAuth 2 request.
   * @attribute
   */
  responseType: string;

  onchange: EventListener | null;

  // [factory]: AuthUiBase;

  constructor();

  _attachListeners(node: EventTarget): void;
  _detachListeners(node: EventTarget): void;

  // [renderCallback](): Promise<void>;
  // [changeCallback](): void;

  // /**
  //  * A function called when `type` changed.
  //  * Note, that other properties may not be initialized just yet.
  //  *
  //  * @param type Current value.
  //  */
  // [typeChangedSymbol](type: string): void;

  /**
   * Clears settings for current type.
   */
  clear(): void;

  /**
   * Creates a settings object with user provided data for current method.
   *
   * @returns User provided data
   */
  serialize(): any;

  /**
   * Validates current method.
   */
  validate(): boolean;

  /**
   * Restores previously serialized settings.
   * A method type must be selected before calling this function.
   *
   * @param settings Depends on current type.
   */
  restore(settings: any): void;

  /**
  * For methods with asynchronous authorization, this functions
  * calls the underlying authorize function and returns the authorization result.
  * 
  * @returns A promise resolved to the authorization result that depends on the method, or null
  * if the current method does not support async authorization. 
  * @throws {Error} When authorization error.
  */
  authorize(): Promise<any | null>;

  /**
   * When the type is `open id` it reads the discovery URL data and populates
   * the UI with them. This is equivalent to clicking on the `read` button
   * in the OpenID type authorization.
   */
  discover(): Promise<void>;

  // /**
  //  * Handler for the `oauth1-token-response` custom event.
  //  * Sets `token` and `tokenSecret` properties from the event.
  //  */
  // [oauth1tokenResponseHandler](e: CustomEvent): void;

  render(): TemplateResult;
}
