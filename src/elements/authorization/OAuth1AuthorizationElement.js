/* eslint-disable no-restricted-globals */
/* eslint-disable no-bitwise */
/* eslint-disable no-else-return */
/* eslint-disable no-plusplus */
/* eslint-disable func-names */
/* eslint-disable no-shadow */
/* eslint-disable default-case */
/* eslint-disable prefer-destructuring */
/* eslint-disable object-shorthand */
/* eslint-disable prefer-template */
/* eslint-disable consistent-return */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-param-reassign */
import { LitElement } from 'lit-element';
import { EventsTargetMixin } from '@anypoint-web-components/awc';
import { HeadersParser } from '../../lib/headers/HeadersParser.js';
import hmacSha1 from '../../lib/3rd-party/HMAC-SHA1.js';

/** @typedef {import('./OAuth1AuthorizationElement').AuthSettings} AuthSettings */

if (window) {
  // @ts-ignore
  window.forceJURL = true;
}

/**
An element to perform OAuth1 authorization and to sign auth requests.

Note that the OAuth1 authorization wasn't designed for browser. Most existing
OAuth1 implementation disallow browsers to perform the authorization by
not allowing POST requests to authorization server. Therefore receiving token
may not be possible without using browser extensions to alter HTTP request to
enable CORS.
If the server disallow obtaining authorization token and secret from clients
then your application has to listen for `oauth1-token-requested` custom event
and perform authorization on the server side.

When auth token and secret is available and the user is to perform a HTTP request,
the request panel sends `before-request` custom event. This element handles the event
and applies authorization header with generated signature to the request.

## OAuth 1 configuration object

Both authorization or request signing requires detailed configuration object.
This is handled by the request panel. It sets OAuth1 configuration in the `request.auth`
property.

| Property | Type | Description |
| ----------------|-------------|---------- |
| `signatureMethod` | `String` | One of `PLAINTEXT`, `HMAC-SHA1`, `RSA-SHA1` |
| `requestTokenUri` | `String` | Token request URI. Optional for before request. Required for authorization |
| `accessTokenUri` | `String` | Access token request URI. Optional for before request. Required for authorization |
| `authorizationUri` | `String` | User dialog URL. |
| `consumerKey` | `String` | Consumer key to be used to generate the signature. Optional for before request. |
| `consumerSecret` | `String` | Consumer secret to be used to generate the signature. Optional for before request. |
| `redirectUri` | `String` | Redirect URI for the authorization. Optional for before request. |
| `authParamsLocation` | `String` | Location of the authorization parameters. Default to `authorization` header |
| `authTokenMethod` | `String` | Token request HTTP method. Default to `POST`. Optional for before request. |
| `version` | `String` | Oauth1 protocol version. Default to `1.0` |
| `nonceSize` | `Number` | Size of the nonce word to generate. Default to 32. Unused if `nonce` is set. |
| `nonce` | `String` | Nonce to be used to generate signature. |
| `timestamp` | `Number` | Request timestamp. If not set it sets current timestamp |
| `customHeaders` | `Object` | Map of custom headers to set with authorization request |
| `type` | `String` | Must be set to `oauth1` or during before-request this object will be ignored. |
| `token` | `String` | Required for signing requests. Received OAuth token |
| `tokenSecret` | `String` | Required for signing requests. Received OAuth token secret |

## Error codes

-  `params-error` Oauth1 parameters are invalid
-  `oauth1-error` OAuth popup is blocked.
-  `token-request-error` HTTP request to the authorization server failed
-  `no-response` No response recorded.

## Acknowledgements

- This element uses [jsrsasign](https://github.com/kjur/jsrsasign) library distributed
under MIT licence.
- This element uses [crypto-js](https://code.google.com/archive/p/crypto-js/) library
distributed under BSD license.

## Required dependencies

The `RSAKey` libraries are not included into the element sources.
If your project do not use this libraries already include it into your project.

This component also uses `URLSearchParams` so provide a polyfill for `URL` and `URLSearchParams`.

```
npm i jsrsasign
```

```html
<script src="../jsrsasign/lib/jsrsasign-rsa-min.js"></script>
```
@deprecated This element is no longer maintained and will be removed
*/
export class OAuth1AuthorizationElement extends EventsTargetMixin(LitElement) {
  get lastIssuedToken() {
    return this._lastIssuedToken;
  }

  set lastIssuedToken(value) {
    const old = this._lastIssuedToken;
    if (old === value) {
      return;
    }
    this._lastIssuedToken = value;
    this.dispatchEvent(
      new CustomEvent('last-issued-token-changed', {
        detail: {
          value
        }
      })
    );
  }

  static get properties() {
    return {
      /**
       * If set, requests made by this element to authorization endpoint will be
       * prefixed with the proxy value.
       */
      proxy: { type: String },
      /**
       * Latest valid token exchanged with the authorization endpoint.
       */
      lastIssuedToken: { type: Object },
      /**
       * OAuth 1 token authorization endpoint.
       */
      requestTokenUri: { type: String },
      /**
       * Oauth 1 token exchange endpoint
       */
      accessTokenUri: { type: String },
      /**
       * Oauth 1 consumer key to use with auth request
       */
      consumerKey: { type: String },
      /**
       * Oauth 1 consumer secret to be used to generate the signature.
       */
      consumerSecret: { type: String },
      /**
       * A signature generation method.
       * Once of: `PLAINTEXT`, `HMAC-SHA1` or `RSA-SHA1`
       */
      signatureMethod: { type: String },
      /**
       * Location of the OAuth authorization parameters.
       * It can be either `authorization` meaning as a header and
       * `querystring` to put OAuth parameters to the URL.
       */
      authParamsLocation: { type: String },
      _caseMap: { type: Object },
      _camelRegex: { type: Object },
      /**
       * Returns `application/x-www-form-urlencoded` content type value.
       */
      urlEncodedType: { type: String },
      /**
       * When set the `before-request` event is not handled by this element
       */
      ignoreBeforeRequest: { type: Boolean },
    };
  }

  constructor() {
    super();
    this._tokenRequestedHandler = this._tokenRequestedHandler.bind(this);
    this._listenPopup = this._listenPopup.bind(this);
    this._handleRequest = this._handleRequest.bind(this);

    this.signatureMethod = 'HMAC-SHA1';
    this.authParamsLocation = 'authorization';
    this._caseMap = {};
    this._camelRegex = /([A-Z])/g;
    this.urlEncodedType = 'application/x-www-form-urlencoded';

    this.ignoreBeforeRequest = false;
  }

  connectedCallback() {
    super.connectedCallback();
    this.setAttribute('aria-hidden', 'true');
  }

  _attachListeners(node) {
    node.addEventListener('oauth1-token-requested', this._tokenRequestedHandler);
    node.addEventListener('before-request', this._handleRequest);
    window.addEventListener('message', this._listenPopup);
  }

  _detachListeners(node) {
    node.removeEventListener('oauth1-token-requested', this._tokenRequestedHandler);
    node.removeEventListener('before-request', this._handleRequest);
    window.removeEventListener('message', this._listenPopup);
  }

  /**
   * Handles the difference between the old and new API where the `auth` object
   * of the request is an array.
   *
   * @param {Array<Object>|Object|undefined} auth Authorization to process.
   * @return {Object|undefined} OAuth 1 settings or undefined.
   */
  _getAuthSettings(auth) {
    if (!auth) {
      return;
    }
    if (!Array.isArray(auth)) {
      auth = [auth];
    }
    return auth.find((item) => item.type === 'oauth 1');
  }

  /**
   * The `before-request` handler. Creates an authorization header if needed.
   * Normally `before-request` expects to set a promise on the `detail.promises`
   * object. But because this task is sync it skips the promise and manipulate
   * request object directly.
   * @param {CustomEvent} e
   */
  _handleRequest(e) {
    if (this.ignoreBeforeRequest) {
      return;
    }
    const request = e.detail;
    const { auth } = request;
    const authSettings = this._getAuthSettings(auth);
    if (!authSettings) {
      return;
    }
    const { settings } = authSettings;
    try {
      this._applyBeforeRequestSignature(request, settings);
    } catch(e) {
      // eslint-disable-next-line no-console
      console.warn('Unable to process OAuth 1 authorization', e);
    }
  }

  /**
   * This is similar to `signRequestObject()` fut it accepts the request object
   * and authorization settings separately and it uses OAuth configuration
   * from the auth object.
   *
   * @param {Object} request ARC/API Console request object
   * @param {any} auth Authorization object
   * @return {Object} Signed request object.
   */
  signRequest(request, auth) {
    const authSettings = this._getAuthSettings(auth);
    if (!authSettings) {
      return request;
    }
    const settings = authSettings.settings || {};
    const { token, tokenSecret } = settings;
    if (!token || !tokenSecret) {
      return request;
    }
    this._applyBeforeRequestSignature(request, settings);
    return request;
  }

  /**
   * Applies OAuth1 authorization header with generated signature for this
   * request.
   *
   * This method expects the `auth` object to be set on the request. The object
   * is full configuration for the OAuth1 authorization as described in
   * `auth-methods/oauth1.html` element.
   *
   * @param {Object} request ARC request object
   * @param {String} auth Token request auth object
   */
  _applyBeforeRequestSignature(request, auth) {
    if (!request || !request.method || !request.url) {
      return;
    }
    try {
      this._prepareOauth(auth);
    } catch (_) {
      return;
    }

    // @ts-ignore
    const token = auth.token || this.lastIssuedToken.oauth_token;
    // @ts-ignore
    const tokenSecret = auth.tokenSecret || this.lastIssuedToken.oauth_token_secret;
    let method = request.method || 'GET';
    method = method.toUpperCase();

    const withPayload = ['GET', 'HEAD'].indexOf(request.method) === -1;
    let body;
    if (withPayload && request.headers && request.payload) {
      let contentType;
      try {
        contentType = HeadersParser.contentType(request.headers);
      } catch (e) {
        // ...
      }
      if (contentType && contentType.indexOf(this.urlEncodedType) === 0) {
        body = request.payload;
      }
    }
    const orderedParameters = this._prepareParameters(token, tokenSecret, method, request.url, {}, body);
    if (this.authParamsLocation === 'authorization') {
      const authorization = this._buildAuthorizationHeaders(orderedParameters);
      try {
        request.headers = HeadersParser.replace(request.headers, 'authorization', authorization);
      } catch (_) {
        // ...
      }
    } else {
      request.url = this._buildAuthorizationQueryString(request.url, orderedParameters);
    }
  }

  /**
   * A handler for the `oauth1-token-requested` event.
   * Performs OAuth1 authorization for given settings.
   *
   * The detail object of the event contains OAuth1 configuration as described
   * in `auth-methods/oauth1.html`element.
   *
   * @param {CustomEvent} e
   */
  _tokenRequestedHandler(e) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    this.authorize(e.detail);
  }

  /**
   * Performs a request to authorization server.
   *
   * @param {Object} settings Oauth1 configuration. See description for more
   * details or `auth-methods/oauth1.html` element that collects configuration
   * from the user.
   */
  authorize(settings) {
    try {
      this._prepareOauth(settings);
    } catch (e) {
      this._dispatchError('Unable to authorize: ' + e.message, 'params-error');
      return;
    }
    this.getOAuthRequestToken()
      .then((temporaryCredentials) => {
        this.temporaryCredentials = temporaryCredentials;
        const authorizationUri = settings.authorizationUri + '?oauth_token=' + temporaryCredentials.oauth_token;
        this.popupClosedProperly = undefined;
        this._popup = window.open(authorizationUri, 'api-console-oauth1');
        if (!this._popup) {
          // popup blocked.
          this._dispatchError('Authorization popup is blocked', 'popup-blocked');
          return;
        }
        this._next = 'exchange-token';
        this._popup.window.focus();
        this._observePopupState();
      })
      .catch((e) => {
        const msg = e.message || 'Unknown error when getting the token';
        this._dispatchError(msg, 'token-request-error');
      });
  }

  /**
   * Sets a configuration properties on this element from passed settings.
   *
   * @param {Object} params See description for more
   * details or `auth-methods/oauth1.html` element that collects configuration
   * from the user.
   */
  _prepareOauth(params) {
    if (params.signatureMethod) {
      const signMethod = params.signatureMethod;
      if (['PLAINTEXT', 'HMAC-SHA1', 'RSA-SHA1'].indexOf(signMethod) === -1) {
        throw new Error('Unsupported signature method: ' + signMethod);
      }
      if (signMethod === 'RSA-SHA1') {
        this._privateKey = params.consumerSecret;
      }
      this.signatureMethod = signMethod;
    }
    if (params.requestTokenUri) {
      this.requestTokenUri = params.requestTokenUri;
    }
    if (params.accessTokenUri) {
      this.accessTokenUri = params.accessTokenUri;
    }
    if (params.consumerKey) {
      this.consumerKey = params.consumerKey;
    }
    if (params.consumerSecret) {
      this.consumerSecret = params.consumerSecret;
    }
    if (params.redirectUri) {
      this._authorizeCallback = params.redirectUri;
    }
    if (params.authParamsLocation) {
      this.authParamsLocation = params.authParamsLocation;
    } else {
      this.authParamsLocation = 'authorization';
    }
    if (params.authTokenMethod) {
      this.authTokenMethod = params.authTokenMethod;
    } else {
      this.authTokenMethod = 'POST';
    }
    this._version = params.version || '1.0';
    this._nonceSize = params.nonceSize || 32;
    this._nonce = params.nonce;
    this._timestamp = params.timestamp;
    this._headers = params.customHeaders || this._defaultHeaders();
    this._oauthParameterSeparator = ',';
  }

  /**
   * List of default headers to send with auth request.
   *
   * @return {Object} Map of default headers.
   */
  _defaultHeaders() {
    return {
      'Accept': '*/*',
      'Connection': 'close',
      'User-Agent': 'Advanced REST Client authorization'
    };
  }

  /**
   * Returns current timestamp.
   *
   * @return {Number} Current timestamp
   */
  getTimestamp() {
    return Math.floor(new Date().getTime() / 1000);
  }

  /**
   * URL encodes the string.
   *
   * @param {String} toEncode A string to encode.
   * @return {String} Encoded string
   */
  encodeData(toEncode) {
    if (!toEncode) {
      return '';
    }
    const result = encodeURIComponent(toEncode);
    return this._finishEncodeParams(result);
  }

  /**
   * Normalizes url encoded values as defined in the OAuth 1 spec.
   *
   * @param {String} url URI encoded params.
   * @return {String} Normalized params.
   */
  _finishEncodeParams(url) {
    return url
      .replace(/!/g, '%21')
      .replace(/'/g, '%27')
      .replace(/\(/g, '%28')
      .replace(/\)/g, '%29')
      .replace(/\*/g, '%2A');
  }

  /**
   * URL decodes data.
   * Also replaces `+` with ` ` (space).
   *
   * @param {String} toDecode String to decode.
   * @return {String} Decoded string
   */
  decodeData(toDecode) {
    if (!toDecode) {
      return '';
    }
    toDecode = toDecode.replace(/\+/g, ' ');
    return decodeURIComponent(toDecode);
  }

  /**
   * Computes signature for the request.
   *
   * @param {String} signatureMethod Method to use to generate the signature.
   * Supported are: `PLAINTEXT`, `HMAC-SHA1`, `RSA-SHA1`. It throws an error if
   * value of this property is other than listed here.
   * @param {String} requestMethod Request HTTP method.
   * @param {String} url Request full URL.
   * @param {Object} oauthParameters Map of oauth parameters.
   * @param {?String} tokenSecret Optional, token secret.
   * @return {String} Generated OAuth1 signature for given `signatureMethod`
   * @param {?String} body Body used with the request. Note: this parameter
   * can only be set if the request's content-type header equals
   * `application/x-www-form-urlencoded`.
   * @throws Error when `signatureMethod` is not one of listed here.
   */
  getSignature(signatureMethod, requestMethod, url, oauthParameters, tokenSecret, body) {
    let signatureBase;
    let key;
    if (signatureMethod !== 'PLAINTEXT') {
      signatureBase = this.createSignatureBase(requestMethod, url, oauthParameters, body);
    }
    if (signatureMethod !== 'RSA-SHA1') {
      key = this.createSignatureKey(this.consumerSecret, tokenSecret);
    }

    switch (signatureMethod) {
      case 'PLAINTEXT':
        return this._createSignaturePlainText(key);
      case 'RSA-SHA1':
        return this._createSignatureRsaSha1(signatureBase, this._privateKey);
      case 'HMAC-SHA1':
        return this._createSignatureHamacSha1(signatureBase, key);
      default:
        throw new Error('Unknown signature method');
    }
  }

  /**
   * Normalizes URL to base string URI as described in
   * https://tools.ietf.org/html/rfc5849#section-3.4.1.2
   *
   * @param {String} url Request full URL.
   * @return {String} Base String URI
   */
  _normalizeUrl(url) {
    const parsedUrl = new URL(url);
    let port = '';
    if (parsedUrl.port) {
      if (
        (parsedUrl.protocol === 'http:' && parsedUrl.port !== '80') ||
        (parsedUrl.protocol === 'https:' && parsedUrl.port !== '443')
      ) {
        port = ':' + parsedUrl.port;
      }
    }
    if (!parsedUrl.pathname || parsedUrl.pathname === '') {
      parsedUrl.pathname = '/';
    }
    return parsedUrl.protocol + '//' + parsedUrl.hostname + port + parsedUrl.pathname;
  }

  /**
   * @param {String} parameter Parameter name (key).
   * @return {Boolean} True if the `parameter` is an OAuth 1 parameter.
   */
  _isParameterNameAnOAuthParameter(parameter) {
    return !!(parameter && parameter.indexOf('oauth_') === 0);
  }
  
  /**
   * Creates an Authorization header value to transmit OAuth params in headers
   * as described in https://tools.ietf.org/html/rfc5849#section-3.5.1
   *
   * @param {Array} orderedParameters Oauth parameters that are already
   * ordered.
   * @return {String} The Authorization header value
   */
  _buildAuthorizationHeaders(orderedParameters) {
    let authHeader = 'OAuth ';
    const params = [];
    orderedParameters.forEach((item) => {
      if (!this._isParameterNameAnOAuthParameter(item[0])) {
        return;
      }
      params.push(this.encodeData(item[0]) + '="' + this.encodeData(item[1]) + '"');
    });
    authHeader += params.join(this._oauthParameterSeparator + ' ');
    return authHeader;
  }

  /**
   * Creates a body for www-urlencoded content type to transmit OAuth params
   * in request body as described in
   * https://tools.ietf.org/html/rfc5849#section-3.5.2
   *
   * @param {Array} orderedParameters Oauth parameters that are already
   * ordered.
   * @return {String} The body to send
   */
  _buildFormDataParameters(orderedParameters) {
    const result = [];
    orderedParameters.forEach((item) => {
      if (!this._isParameterNameAnOAuthParameter(item[0])) {
        return;
      }
      result.push(this.encodeData(item[0]) + '=' + this.encodeData(item[1]));
    });
    return result.join('&');
  }
  
  /**
   * Adds query parameters with OAuth 1 parameters to the URL
   * as described in https://tools.ietf.org/html/rfc5849#section-3.5.3
   *
   * @param {String} url
   * @param {Array} orderedParameters Oauth parameters that are already
   * ordered.
   * @return {String} URL to use with the request
   */
  _buildAuthorizationQueryString(url, orderedParameters) {
    const parser = new URL(url);
    orderedParameters.forEach((item) => {
      parser.searchParams.append(item[0], item[1]);
    });
    return parser.toString();
  }

  // Takes an object literal that represents the arguments, and returns an array
  // of argument/value pairs.
  _makeArrayOfArgumentsHash(argumentsHash) {
    const argumentPairs = [];
    Object.keys(argumentsHash).forEach((key) => {
      const value = argumentsHash[key];
      if (Array.isArray(value)) {
        for (let i = 0, len = value.length; i < len; i++) {
          argumentPairs[argumentPairs.length] = [key, value[i]];
        }
      } else {
        argumentPairs[argumentPairs.length] = [key, value];
      }
    });
    return argumentPairs;
  }

  // Sorts the encoded key value pairs by encoded name, then encoded value
  _sortRequestParams(argumentPairs) {
    // Sort by name, then value.
    argumentPairs.sort((a, b) => {
      if (a[0] === b[0]) {
        return a[1] < b[1] ? -1 : 1;
      } else {
        return a[0] < b[0] ? -1 : 1;
      }
    });
    return argumentPairs;
  }

  /**
   * Sort function to sort parameters as described in
   * https://tools.ietf.org/html/rfc5849#section-3.4.1.3.2
   * @param {String} a
   * @param {String} b
   * @return {Number}
   */
  _sortParamsFunction(a, b) {
    if (a[0] === b[0]) {
      return String(a[1]).localeCompare(String(b[1]));
    }
    return String(a[0]).localeCompare(String(b[0]));
  }

  /**
   * Normalizes request parameters as described in
   * https://tools.ietf.org/html/rfc5849#section-3.4.1.3.2
   *
   * @param {Array} args List of parameters to normalize. It must contain
   * a list of array items where first element of the array is parameter name
   * and second is parameter value.
   * @return {String} Normalized parameters to string.
   */
  _normaliseRequestParams(args) {
    const len = args.length;
    let i = 0;
    // First encode them #3.4.1.3.2 .1
    for (; i < len; i++) {
      args[i][0] = this.encodeData(args[i][0]);
      args[i][1] = this.encodeData(args[i][1]);
    }
    // Then sort them #3.4.1.3.2 .2
    args.sort(this._sortParamsFunction);
    // Then concatenate together #3.4.1.3.2 .3 & .4
    const result = [];
    args.forEach((pair) => {
      if (pair[0] === 'oauth_signature') {
        return;
      }
      result.push(pair[0] + '=' + String(pair[1]));
    });
    return result.join('&');
  }

  /**
   * Computes array of parameters from the request URL.
   *
   * @param {String} url Full request URL
   * @return {Array} Array of parameters where each item is an array with
   * first element as a name of the parameter and second element as a value.
   */
  _listQueryParameters(url) {
    const parsedUrl = new URL(url);
    const result = [];
    parsedUrl.searchParams.forEach((value, key) => {
      result[result.length] = [this.decodeData(key), this.decodeData(value)];
    });
    return result;
  }

  /**
   * Computes array of parameters from the entity body.
   * The body must be `application/x-www-form-urlencoded`.
   *
   * @param {String} body Entity body of `application/x-www-form-urlencoded`
   * request
   * @return {Array} Array of parameters where each item is an array with
   * first element as a name of the parameter and second element as a value.
   * Keys and values are percent decoded. Additionally each `+` is replaced
   * with space character.
   */
  _formUrlEncodedToParams(body) {
    if (!body) {
      return [];
    }
    const parts = body.split('&').map((part) => {
      const pair = part.split('=');
      const key = this.decodeData(pair[0]);
      let value = '';
      if (pair[1]) {
        value = this.decodeData(pair[1]);
      }
      return [key, value];
    });
    return parts;
  }

  /**
   * Creates a signature base as defined in
   * https://tools.ietf.org/html/rfc5849#section-3.4.1
   *
   * @param {String} method HTTP method used with the request
   * @param {String} url Full URL of the request
   * @param {Object} oauthParams Key - value pairs of OAuth parameters
   * @param {?String} body Body used with the request. Note: this parameter
   * can only be set if the request's content-type header equals
   * `application/x-www-form-urlencoded`.
   * @return {String} A base string to be used to generate signature.
   */
  createSignatureBase(method, url, oauthParams, body) {
    let allParameter = [];
    const uriParameters = this._listQueryParameters(url);
    oauthParams = this._makeArrayOfArgumentsHash(oauthParams);
    allParameter = uriParameters.concat(oauthParams);
    if (body) {
      // @ts-ignore
      body = this._formUrlEncodedToParams(body);
      allParameter = allParameter.concat(body);
    }
    // @ts-ignore
    allParameter = this._normaliseRequestParams(allParameter);
    // @ts-ignore
    allParameter = this.encodeData(allParameter);
    url = this.encodeData(this._normalizeUrl(url));
    return [method.toUpperCase(), url, allParameter].join('&');
  }

  /**
   * Creates a signature key to compute the signature as described in
   * https://tools.ietf.org/html/rfc5849#section-3.4.2
   *
   * @param {String} clientSecret Client secret (consumer secret).
   * @param {?String} tokenSecret Optional, token secret
   * @return {String} A key to be used to generate the signature.
   */
  createSignatureKey(clientSecret, tokenSecret) {
    if (!tokenSecret) {
      tokenSecret = '';
    } else {
      tokenSecret = this.encodeData(tokenSecret);
    }
    clientSecret = this.encodeData(clientSecret);
    return clientSecret + '&' + tokenSecret;
  }

  /**
   * Found at http://jsfiddle.net/ARTsinn/6XaUL/
   *
   * @param {String} h Hexadecimal input
   * @return {String} Result of transforming value to string.
   */
  hex2b64(h) {
    const b64map = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    const b64pad = '=';
    let i;
    let c;
    let ret = '';
    for (i = 0; i + 3 <= h.length; i += 3) {
      c = parseInt(h.substring(i, i + 3), 16);
      ret += b64map.charAt(c >> 6) + b64map.charAt(c & 63);
    }
    if (i + 1 === h.length) {
      c = parseInt(h.substring(i, i + 1), 16);
      ret += b64map.charAt(c << 2);
    } else if (i + 2 === h.length) {
      c = parseInt(h.substring(i, i + 2), 16);
      ret += b64map.charAt(c >> 2) + b64map.charAt((c & 3) << 4);
    }
    while ((ret.length & 3) > 0) {
      ret += b64pad;
    }
    return ret;
  }

  /**
   * Creates a signature for the PLAINTEXT method.
   *
   * In this case the signature is the key.
   *
   * @param {String} key Computed signature key.
   * @return {String} Computed OAuth1 signature.
   */
  _createSignaturePlainText(key) {
    return key;
  }
  
  /**
   * Creates a signature for the RSA-SHA1 method.
   *
   * @param {String} baseText Computed signature base text.
   * @param {String} privateKey Client private key.
   * @return {String} Computed OAuth1 signature.
   */
  _createSignatureRsaSha1(baseText, privateKey) {
    /* global RSAKey */
    // @ts-ignore
    const rsa = new RSAKey();
    rsa.readPrivateKeyFromPEMString(privateKey);
    const hSig = rsa.sign(baseText, 'sha1');
    return this.hex2b64(hSig);
  }

  /**
   * Creates a signature for the HMAC-SHA1 method.
   *
   * @param {String} baseText Computed signature base text.
   * @param {String} key Computed signature key.
   * @return {String} Computed OAuth1 signature.
   */
  _createSignatureHamacSha1(baseText, key) {
    return hmacSha1(key, baseText);
  }

  /**
   * Returns a list of characters that can be used to build nonce.
   *
   * @return {Array<String>}
   */
  get nonceChars() {
    return [
      'a',
      'b',
      'c',
      'd',
      'e',
      'f',
      'g',
      'h',
      'i',
      'j',
      'k',
      'l',
      'm',
      'n',
      'o',
      'p',
      'q',
      'r',
      's',
      't',
      'u',
      'v',
      'w',
      'x',
      'y',
      'z',
      'A',
      'B',
      'C',
      'D',
      'E',
      'F',
      'G',
      'H',
      'I',
      'J',
      'K',
      'L',
      'M',
      'N',
      'O',
      'P',
      'Q',
      'R',
      'S',
      'T',
      'U',
      'V',
      'W',
      'X',
      'Y',
      'Z',
      '0',
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9'
    ];
  }

  _getNonce(nonceSize) {
    const result = [];
    const chars = this.nonceChars;
    let charPos;
    const nonceCharsLength = chars.length;

    for (let i = 0; i < nonceSize; i++) {
      charPos = Math.floor(Math.random() * nonceCharsLength);
      result[i] = chars[charPos];
    }
    return result.join('');
  }

  _prepareParameters(token, tokenSecret, method, url, extraParams, body) {
    const oauthParameters = {
      oauth_timestamp: this._timestamp || this.getTimestamp(),
      oauth_nonce: this._nonce || this._getNonce(this._nonceSize),
      oauth_version: this._version,
      oauth_signature_method: this.signatureMethod,
      oauth_consumer_key: this.consumerKey
    };
    if (token) {
      oauthParameters.oauth_token = token;
    }
    let sig;
    // @ts-ignore
    if (this._isEcho) {
      // @ts-ignore
      sig = this.getSignature(this.signatureMethod, 'GET', this._verifyCredentials, oauthParameters, tokenSecret, body);
    } else {
      if (extraParams) {
        Object.keys(extraParams).forEach((key) => {
          oauthParameters[key] = extraParams[key];
        });
      }
      sig = this.getSignature(this.signatureMethod, method, url, oauthParameters, tokenSecret, body);
    }

    const orderedParameters = this._sortRequestParams(this._makeArrayOfArgumentsHash(oauthParameters));
    orderedParameters[orderedParameters.length] = ['oauth_signature', sig];
    return orderedParameters;
  }

  // Encodes parameters in the map.
  encodeUriParams(params) {
    const result = Object.keys(params).map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(params[key]));
    return result.join('&');
  }

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
   * @param {Object} request ARC request object.
   * @param {?String} token OAuth token to use to generate the signature.
   * If not set, then it will use a value from `this.lastIssuedToken`.
   * @param {?String} tokenSecret OAuth token secret to use to generate the
   * signature. If not set, then it will use a value from
   * `this.lastIssuedToken`.
   * @return {Object} The same object with applied OAuth 1 parameters.
   */
  signRequestObject(request, token, tokenSecret) {
    if (!request || !request.method || !request.url) {
      return request;
    }
    token = token || this.lastIssuedToken.oauth_token;
    tokenSecret = tokenSecret || this.lastIssuedToken.oauth_token_secret;

    let method = request.method || 'GET';
    method = method.toUpperCase();
    const withPayload = ['GET', 'HEAD'].indexOf(request.method) === -1;
    let body;
    if (withPayload && request.headers && request.payload) {
      let contentType;
      try {
        contentType = HeadersParser.contentType(request.headers);
      } catch (_) {
        // ...
      }
      if (contentType && contentType.indexOf(this.urlEncodedType) === 0) {
        body = request.payload;
      }
    }
    const orderedParameters = this._prepareParameters(token, tokenSecret, method, request.url, {}, body);
    if (this.authParamsLocation === 'authorization') {
      const authorization = this._buildAuthorizationHeaders(orderedParameters);
      try {
        request.headers = HeadersParser.replace(request.headers, 'authorization', authorization);
      } catch (_) {
        // ...
      }
    } else {
      request.url = this._buildAuthorizationQueryString(request.url, orderedParameters);
    }
    this.clearRequestVariables();
    return request;
  }

  _performRequest(token, tokenSecret, method, url, extraParams, body, contentType) {
    const withPayload = ['POST', 'PUT'].indexOf(method) !== -1;
    const orderedParameters = this._prepareParameters(token, tokenSecret, method, url, extraParams);
    if (withPayload && !contentType) {
      contentType = this.urlEncodedType;
    }
    const headers = {};
    if (this.authParamsLocation === 'authorization') {
      const authorization = this._buildAuthorizationHeaders(orderedParameters);
      // @ts-ignore
      if (this._isEcho) {
        headers['X-Verify-Credentials-Authorization'] = authorization;
      } else {
        headers.authorization = authorization;
      }
    } else {
      url = this._buildAuthorizationQueryString(url, orderedParameters);
    }
    if (this._headers) {
      Object.keys(this._headers).forEach((key) => {
        headers[key] = this._headers[key];
      });
    }
    if (extraParams) {
      Object.keys(extraParams).forEach((key) => {
        if (this._isParameterNameAnOAuthParameter(key)) {
          delete extraParams[key];
        }
      });
    }
    if (withPayload && extraParams && !body && ['POST', 'PUT'].indexOf(method) !== -1) {
      body = this.encodeUriParams(extraParams);
      body = this._finishEncodeParams(body);
    }
    if (withPayload && !body) {
      headers['Content-length'] = '0';
    }
    const init = {
      method: method,
      headers: headers
    };
    if (withPayload && body) {
      init.payload = body;
    }
    let responseHeaders;
    return this.request(url, init)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Token request error ended with status ' + response.status);
        }
        responseHeaders = response.headers;
        return response.text();
      })
      .then((text) => ({
          response: text,
          headers: responseHeaders
        }));
  }
  
  /**
   * Exchanges temporary authorization token for authorized token.
   * When ready this function fires `oauth1-token-response`
   *
   * @param {String} token
   * @param {String} secret
   * @param {String} verifier
   * @return {Promise}
   */
  getOAuthAccessToken(token, secret, verifier) {
    const extraParams = {};
    if (verifier) {
      extraParams.oauth_verifier = verifier;
    }
    const method = this.authTokenMethod;
    return this._performRequest(token, secret, method, this.accessTokenUri, extraParams)
      .then((response) => {
        if (!response.response) {
          let message = "Couldn't exchange token. ";
          message += 'Authorization server may be down or CORS is disabled.';
          throw new Error(message);
        }
        const params = {};
        this._formUrlEncodedToParams(response.response).forEach((pair) => {
          params[pair[0]] = pair[1];
        });
        return params;
      })
      .then((tokenInfo) => {
        this.clearRequestVariables();
        this.lastIssuedToken = tokenInfo;
        const e = new CustomEvent('oauth1-token-response', {
          bubbles: true,
          composed: true,
          cancelable: false,
          detail: tokenInfo
        });
        this.dispatchEvent(e);
      });
  }
  
  /**
   * Clears variables set for current request after signature has been
   * generated and token obtained.
   */
  clearRequestVariables() {
    this.temporaryCredentials = undefined;
    this._timestamp = undefined;
    this._nonce = undefined;
  }

  /**
   * Requests the authorization server for temporary authorization token.
   * This token should be passed to `authorizationUri` as a `oauth_token`
   * parameter.
   *
   * @param {Object=} extraParams List of extra parameters to include in the
   * request.
   * @return {Promise} A promise resolved to a map of OAuth 1 parameters:
   * `oauth_token`, `oauth_token_secret`, `oauth_verifier` and
   * `oauth_callback_confirmed` (for 1.0a version).
   */
  getOAuthRequestToken(extraParams) {
    extraParams = extraParams || {};
    if (this._authorizeCallback) {
      extraParams.oauth_callback = this._authorizeCallback;
    }
    const method = this.authTokenMethod;
    return this._performRequest(null, null, method, this.requestTokenUri, extraParams).then((response) => {
      if (!response.response) {
        let message = "Couldn't request for authorization token. ";
        message += 'Authorization server may be down or CORS is disabled.';
        throw new Error(message);
      }
      const params = {};
      this._formUrlEncodedToParams(response.response).forEach((pair) => {
        params[pair[0]] = pair[1];
      });
      return params;
    });
  }

  /**
   * Makes a HTTP request.
   * Before making the request it sends `auth-request-proxy` custom event
   * with the URL and init object in event's detail object.
   * If the event is cancelled then it will use detail's `result` value to
   * return from this function. The `result` must be a Promise that will
   * resolve to a `Response` object.
   * Otherwise it will use internal `fetch` implementation.
   *
   * @param {String} url An URL to call
   * @param {Object} init Init object that will be passed to a `Request`
   * object.
   * @return {Promise} A promise that resolves to a `Response` object.
   */
  request(url, init) {
    const e = new CustomEvent('auth-request-proxy', {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail: {
        url: url,
        init: init
      }
    });
    this.dispatchEvent(e);
    // @ts-ignore
    return e.defaultPrevented ? e.detail.result : this._fetch(url, init);
  }

  /**
   * Performs a HTTP request.
   * If `proxy` is set then it will prefix the URL with the value of proxy.
   *
   * @param {String} url An URL to call
   * @param {Object} init Init object that will be passed to a `Request`
   * object.
   * @return {Promise} A promise that resolves to a `Response` object.
   */
  _fetch(url, init) {
    let proxy;
    // @ts-ignore
    if (this.proxy) {
      // @ts-ignore
      proxy = this.proxy;
    }
    if (proxy) {
      url = proxy + url;
    }
    init.mode = 'cors';
    return fetch(url, init);
  }

  _listenPopup(e) {
    if (
      !location ||
      !e.source ||
      !this._popup ||
      e.origin !== location.origin ||
      e.source.location.href !== this._popup.location.href
    ) {
      return;
    }
    const tokenInfo = e.data;
    this.popupClosedProperly = true;
    switch (this._next) {
      case 'exchange-token':
        this.getOAuthAccessToken(
          tokenInfo.oauthToken,
          this.temporaryCredentials.oauth_token_secret,
          tokenInfo.oauthVerifier
        );
        break;
    }
    this._popup.close();
  }

  // Observer if the popup has been closed before the data has been received.
  _observePopupState() {
    const popupCheckInterval = setInterval(() => {
      if (!this._popup || this._popup.closed) {
        clearInterval(popupCheckInterval);
        this._beforePopupUnloadHandler();
      }
    }, 500);
  }

  _beforePopupUnloadHandler() {
    if (this.popupClosedProperly) {
      return;
    }
    this._popup = undefined;
    this._dispatchError('No response has been recorded.', 'no-response');
  }

  /**
   * Dispatches an error event that propagates through the DOM.
   *
   * @param {String} message
   * @param {String} code
   */
  _dispatchError(message, code) {
    const e = new CustomEvent('oauth1-error', {
      bubbles: true,
      composed: true,
      detail: {
        message: message,
        code: code
      }
    });
    this.dispatchEvent(e);
  }
  
  /**
   * Adds camel case keys to a map of parameters.
   * It adds new keys to the object transformed from `oauth_token`
   * to `oauthToken`
   *
   * @param {Object} obj
   * @return {Object}
   */
  parseMapKeys(obj) {
    Object.keys(obj).forEach((key) => this._parseParameter(key, obj));
    return obj;
  }

  /**
   * Parses a query parameter object to produce camel case map of parameters.
   * This sets values to the `settings` object which is passed by reference.
   * No need to return value.
   *
   * @param {String} param Key in the `settings` object.
   * @param {Object} settings Parameters.
   * @return {Object}
   */
  _parseParameter(param, settings) {
    if (!(param in settings)) {
      return settings;
    }
    const value = settings[param];
    let oauthParam;
    if (this._caseMap[param]) {
      oauthParam = this._caseMap[param];
    } else {
      oauthParam = this._getCaseParam(param);
    }
    settings[oauthParam] = value;
  }

  _getCaseParam(param) {
    return 'oauth_' + param.replace(this._camelRegex, '_$1').toLowerCase();
  }

  /**
   * Fired when authorization is unsuccessful
   *
   * @event oauth1-error
   * @param {String} message Human readable error message
   * @param {String} code Error code associated with the error. 
   */

  /**
   * Fired when the authorization is successful and token and secret are ready.
   *
   * @event oauth1-token-response
   * @param {String} oauth_token Received OAuth1 token
   * @param {String} oauth_token_secret Received OAuth1 token secret
   */

  /**
   * Dispatched when the component requests to proxy authorization request
   * through proxy. If the application decide to proxy the request it must
   * cancel the events.
   *
   * The handler must set `event.detail.result` property to be a `Promise`
   * with call result that will be reported to the application.
   *
   * It can be used to proxy CORS requests if the application can support this
   * case.
   *
   * @event auth-request-proxy
   * @param {String} url The request URL
   * @param {Object} init The same `init` object as the one used to initialize
   * `Request` object for fetch API.
   */
}
