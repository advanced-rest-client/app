import {LitElement} from 'lit-element';

declare interface AuthSettings {
  valid: boolean;
  type: string;
  settings: any;
}

/**
 * @deprecated This element is no longer maintained and will be removed
 */
export declare class OAuth1AuthorizationElement extends LitElement {
  lastIssuedToken: any;

  /**
   * Returns a list of characters that can be used to build nonce.
   */
  readonly nonceChars: Array<String|null>|null;
  constructor();
  connectedCallback(): void;
  _attachListeners(node: any): void;
  _detachListeners(node: any): void;

  /**
   * Handles the difference between the old and new API where the `auth` object
   * of the request is an array.
   *
   * @param auth Authorization to process.
   * @returns OAuth 1 settings or undefined.
   */
  _getAuthSettings(auth: Array<object|null>|object|null|undefined): object|null|undefined;

  /**
   * The `before-request` handler. Creates an authorization header if needed.
   * Normally `before-request` expects to set a promise on the `detail.promises`
   * object. But because this task is sync it skips the promise and manipulate
   * request object directly.
   */
  _handleRequest(e: CustomEvent|null): void;

  /**
   * This is similar to `signRequestObject()` fut it accepts the request object
   * and authorization settings separately and it uses OAuth configuration
   * from the auth object.
   *
   * @param request ARC/API Console request object
   * @param auth Authorization object
   * @returns Signed request object.
   */
  signRequest(request: object|null, auth: AuthSettings|Array<AuthSettings|null>|null): object|null;

  /**
   * Applies OAuth1 authorization header with generated signature for this
   * request.
   *
   * This method expects the `auth` object to be set on the request. The object
   * is full configuration for the OAuth1 authorization as described in
   * `auth-methods/oauth1.html` element.
   *
   * @param request ARC request object
   * @param auth Token request auth object
   */
  _applyBeforeRequestSignature(request: object|null, auth: String|null): void;

  /**
   * A handler for the `oauth1-token-requested` event.
   * Performs OAuth1 authorization for given settings.
   *
   * The detail object of the event contains OAuth1 configuration as described
   * in `auth-methods/oauth1.html`element.
   */
  _tokenRequestedHandler(e: CustomEvent|null): void;

  /**
   * Performs a request to authorization server.
   *
   * @param settings Oauth1 configuration. See description for more
   * details or `auth-methods/oauth1.html` element that collects configuration
   * from the user.
   */
  authorize(settings: object|null): void;

  /**
   * Sets a configuration properties on this element from passed settings.
   *
   * @param params See description for more
   * details or `auth-methods/oauth1.html` element that collects configuration
   * from the user.
   */
  _prepareOauth(params: object|null): void;

  /**
   * List of default headers to send with auth request.
   *
   * @returns Map of default headers.
   */
  _defaultHeaders(): object|null;

  /**
   * Returns current timestamp.
   *
   * @returns Current timestamp
   */
  getTimestamp(): Number|null;

  /**
   * URL encodes the string.
   *
   * @param toEncode A string to encode.
   * @returns Encoded string
   */
  encodeData(toEncode: String|null): String|null;

  /**
   * Normalizes url encoded values as defined in the OAuth 1 spec.
   *
   * @param url URI encoded params.
   * @returns Normalized params.
   */
  _finishEncodeParams(url: String|null): String|null;

  /**
   * URL decodes data.
   * Also replaces `+` with ` ` (space).
   *
   * @param toDecode String to decode.
   * @returns Decoded string
   */
  decodeData(toDecode: String|null): String|null;

  /**
   * Computes signature for the request.
   *
   * @param signatureMethod Method to use to generate the signature.
   * Supported are: `PLAINTEXT`, `HMAC-SHA1`, `RSA-SHA1`. It throws an error if
   * value of this property is other than listed here.
   * @param requestMethod Request HTTP method.
   * @param url Request full URL.
   * @param oauthParameters Map of oauth parameters.
   * @param tokenSecret Optional, token secret.
   * @param body Body used with the request. Note: this parameter
   * can only be set if the request's content-type header equals
   * `application/x-www-form-urlencoded`.
   * @returns Generated OAuth1 signature for given `signatureMethod`
   */
  getSignature(signatureMethod: String|null, requestMethod: String|null, url: String|null, oauthParameters: object|null, tokenSecret: String|null, body: String|null): String|null;

  /**
   * Normalizes URL to base string URI as described in
   * https://tools.ietf.org/html/rfc5849#section-3.4.1.2
   *
   * @param url Request full URL.
   * @returns Base String URI
   */
  _normalizeUrl(url: String|null): String|null;

  /**
   * @param parameter Parameter name (key).
   * @returns True if the `parameter` is an OAuth 1 parameter.
   */
  _isParameterNameAnOAuthParameter(parameter: String|null): Boolean|null;

  /**
   * Creates an Authorization header value to transmit OAuth params in headers
   * as described in https://tools.ietf.org/html/rfc5849#section-3.5.1
   *
   * @param orderedParameters Oauth parameters that are already
   * ordered.
   * @returns The Authorization header value
   */
  _buildAuthorizationHeaders(orderedParameters: any[]|null): String|null;

  /**
   * Creates a body for www-urlencoded content type to transmit OAuth params
   * in request body as described in
   * https://tools.ietf.org/html/rfc5849#section-3.5.2
   *
   * @param orderedParameters Oauth parameters that are already
   * ordered.
   * @returns The body to send
   */
  _buildFormDataParameters(orderedParameters: any[]|null): String|null;

  /**
   * Adds query parameters with OAuth 1 parameters to the URL
   * as described in https://tools.ietf.org/html/rfc5849#section-3.5.3
   *
   * @param orderedParameters Oauth parameters that are already
   * ordered.
   * @returns URL to use with the request
   */
  _buildAuthorizationQueryString(url: String|null, orderedParameters: any[]|null): String|null;

  /**
   * of argument/value pairs.
   */
  _makeArrayOfArgumentsHash(argumentsHash: any): any;

  /**
   * Sorts the encoded key value pairs by encoded name, then encoded value
   */
  _sortRequestParams(argumentPairs: any): any;

  /**
   * Sort function to sort parameters as described in
   * https://tools.ietf.org/html/rfc5849#section-3.4.1.3.2
   */
  _sortParamsFunction(a: String|null, b: String|null): Number|null;

  /**
   * Normalizes request parameters as described in
   * https://tools.ietf.org/html/rfc5849#section-3.4.1.3.2
   *
   * @param args List of parameters to normalize. It must contain
   * a list of array items where first element of the array is parameter name
   * and second is parameter value.
   * @returns Normalized parameters to string.
   */
  _normaliseRequestParams(args: any[]|null): String|null;

  /**
   * Computes array of parameters from the request URL.
   *
   * @param url Full request URL
   * @returns Array of parameters where each item is an array with
   * first element as a name of the parameter and second element as a value.
   */
  _listQueryParameters(url: String|null): any[]|null;

  /**
   * Computes array of parameters from the entity body.
   * The body must be `application/x-www-form-urlencoded`.
   *
   * @param body Entity body of `application/x-www-form-urlencoded`
   * request
   * @returns Array of parameters where each item is an array with
   * first element as a name of the parameter and second element as a value.
   * Keys and values are percent decoded. Additionally each `+` is replaced
   * with space character.
   */
  _formUrlEncodedToParams(body: String|null): any[]|null;

  /**
   * Creates a signature base as defined in
   * https://tools.ietf.org/html/rfc5849#section-3.4.1
   *
   * @param method HTTP method used with the request
   * @param url Full URL of the request
   * @param oauthParams Key - value pairs of OAuth parameters
   * @param body Body used with the request. Note: this parameter
   * can only be set if the request's content-type header equals
   * `application/x-www-form-urlencoded`.
   * @returns A base string to be used to generate signature.
   */
  createSignatureBase(method: String|null, url: String|null, oauthParams: object|null, body: String|null): String|null;

  /**
   * Creates a signature key to compute the signature as described in
   * https://tools.ietf.org/html/rfc5849#section-3.4.2
   *
   * @param clientSecret Client secret (consumer secret).
   * @param tokenSecret Optional, token secret
   * @returns A key to be used to generate the signature.
   */
  createSignatureKey(clientSecret: String|null, tokenSecret: String|null): String|null;

  /**
   * Found at http://jsfiddle.net/ARTsinn/6XaUL/
   *
   * @param h Hexadecimal input
   * @returns Result of transforming value to string.
   */
  hex2b64(h: String|null): String|null;

  /**
   * Creates a signature for the PLAINTEXT method.
   *
   * In this case the signature is the key.
   *
   * @param key Computed signature key.
   * @returns Computed OAuth1 signature.
   */
  _createSignaturePlainText(key: String|null): String|null;

  /**
   * Creates a signature for the RSA-SHA1 method.
   *
   * @param baseText Computed signature base text.
   * @param privateKey Client private key.
   * @returns Computed OAuth1 signature.
   */
  _createSignatureRsaSha1(baseText: String|null, privateKey: String|null): String|null;

  /**
   * Creates a signature for the HMAC-SHA1 method.
   *
   * @param baseText Computed signature base text.
   * @param key Computed signature key.
   * @returns Computed OAuth1 signature.
   */
  _createSignatureHamacSha1(baseText: String|null, key: String|null): String|null;
  _getNonce(nonceSize: any): any;
  _prepareParameters(token: any, tokenSecret: any, method: any, url: any, extraParams: any, body: any): any;

  /**
   * Encodes parameters in the map.
   */
  encodeUriParams(params: any): any;

  /**
   * Creates OAuth1 signature for a `request` object.
   * The request object must contain:
   * - `url` - String
   * - `method` - String
   * - `headers` - String
   * It also may contain the `body` property.
   *
   * It alters the request object by applying OAuth1 parameters to a set
   * location (query parameters, authorization header, body). This is
   * controlled by `this.authParamsLocation` property. By default the
   * parameters are applied to authorization header.
   *
   * @param request ARC request object.
   * @param token OAuth token to use to generate the signature.
   * If not set, then it will use a value from `this.lastIssuedToken`.
   * @param tokenSecret OAuth token secret to use to generate the
   * signature. If not set, then it will use a value from
   * `this.lastIssuedToken`.
   * @returns The same object with applied OAuth 1 parameters.
   */
  signRequestObject(request: object|null, token: String|null, tokenSecret: String|null): object|null;
  _performRequest(token: any, tokenSecret: any, method: any, url: any, extraParams: any, body: any, contentType: any): any;

  /**
   * Exchanges temporary authorization token for authorized token.
   * When ready this function fires `oauth1-token-response`
   */
  getOAuthAccessToken(token: String|null, secret: String|null, verifier: String|null): Promise<any>|null;

  /**
   * Clears variables set for current request after signature has been
   * generated and token obtained.
   */
  clearRequestVariables(): void;

  /**
   * Requests the authorization server for temporary authorization token.
   * This token should be passed to `authorizationUri` as a `oauth_token`
   * parameter.
   *
   * @param extraParams List of extra parameters to include in the
   * request.
   * @returns A promise resolved to a map of OAuth 1 parameters:
   * `oauth_token`, `oauth_token_secret`, `oauth_verifier` and
   * `oauth_callback_confirmed` (for 1.0a version).
   */
  getOAuthRequestToken(extraParams: object|null): Promise<any>|null;

  /**
   * Makes a HTTP request.
   * Before making the request it sends `auth-request-proxy` custom event
   * with the URL and init object in event's detail object.
   * If the event is cancelled then it will use detail's `result` value to
   * return from this function. The `result` must be a Promise that will
   * resolve to a `Response` object.
   * Otherwise it will use internal `fetch` implementation.
   *
   * @param url An URL to call
   * @param init Init object that will be passed to a `Request`
   * object.
   * @returns A promise that resolves to a `Response` object.
   */
  request(url: String|null, init: object|null): Promise<any>|null;

  /**
   * Performs a HTTP request.
   * 
   * @param url An URL to call
   * @param init Init object that will be passed to a `Request`
   * object.
   * @returns A promise that resolves to a `Response` object.
   */
  _fetch(url: String|null, init: object|null): Promise<any>|null;
  _listenPopup(e: any): void;

  /**
   * Observer if the popup has been closed before the data has been received.
   */
  _observePopupState(): void;
  _beforePopupUnloadHandler(): void;

  /**
   * Dispatches an error event that propagates through the DOM.
   */
  _dispatchError(message: String|null, code: String|null): void;

  /**
   * Adds camel case keys to a map of parameters.
   * It adds new keys to the object transformed from `oauth_token`
   * to `oauthToken`
   */
  parseMapKeys(obj: object|null): object|null;

  /**
   * Parses a query parameter object to produce camel case map of parameters.
   * This sets values to the `settings` object which is passed by reference.
   * No need to return value.
   *
   * @param param Key in the `settings` object.
   * @param settings Parameters.
   */
  _parseParameter(param: String|null, settings: object|null): object|null;
  _getCaseParam(param: any): any;
}
