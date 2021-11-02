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
import { OAuth1Authorization } from '@advanced-rest-client/oauth';

/** @typedef {import('./OAuth1AuthorizationElement').AuthSettings} AuthSettings */
/** @typedef {import('@advanced-rest-client/events').Authorization.OAuth1Authorization} OAuth1AuthorizationSettings */
/** @typedef {import('@advanced-rest-client/events').ArcRequest.RequestAuthorization} RequestAuthorization */
/** @typedef {import('@advanced-rest-client/events').ArcRequest.ArcEditorRequest} ArcEditorRequest */
/** @typedef {import('@advanced-rest-client/events').ArcRequest.ArcBaseRequest} ArcBaseRequest */

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
  static get properties() {
    return {
      /**
       * If set, requests made by this element to authorization endpoint will be
       * prefixed with the proxy value.
       */
      proxy: { type: String },
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
    this._handleRequest = this._handleRequest.bind(this);
    this.ignoreBeforeRequest = false;
    this.urlEncodedType = "application/x-www-form-urlencoded";
    this.factory = new OAuth1Authorization();
    this.proxy = undefined;
  }

  connectedCallback() {
    super.connectedCallback();
    this.setAttribute('aria-hidden', 'true');
  }

  _attachListeners(node) {
    node.addEventListener('oauth1-token-requested', this._tokenRequestedHandler);
    node.addEventListener('before-request', this._handleRequest);
  }

  _detachListeners(node) {
    node.removeEventListener('oauth1-token-requested', this._tokenRequestedHandler);
    node.removeEventListener('before-request', this._handleRequest);
  }

  /**
   * Handles the difference between the old and new API where the `auth` object
   * of the request is an array.
   *
   * @param {RequestAuthorization[]} auth Authorization to process.
   * @returns {RequestAuthorization|undefined} OAuth 1 settings or undefined.
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
    const request = /** @type ArcEditorRequest */ (e.detail);
    if (!request) {
      return;
    }
    /** @type ArcBaseRequest */
    let targetRequest;
    if (request.request) {
      targetRequest = request.request;
    } else {
      targetRequest = /** @type ArcBaseRequest */ (/** @type unknown */ (request));
    }
    const { authorization } = targetRequest;
    const authSettings = this._getAuthSettings(authorization);
    if (!authSettings) {
      return;
    }
    const { config, enabled } = authSettings;
    if (!enabled) {
      return;
    }
    // @ts-ignore
    this.factory.proxy = this.proxy;
    // @ts-ignore
    this.factory.urlEncodedType = this.urlEncodedType;
    try {
      this.factory._applyBeforeRequestSignature(targetRequest, /** @type any */ (config));
    } catch(e) {
      // eslint-disable-next-line no-console
      console.warn('Unable to process OAuth 1 authorization', e);
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
  async _tokenRequestedHandler(e) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    // @ts-ignore
    this.factory.proxy = this.proxy;
    // @ts-ignore
    this.factory.urlEncodedType = this.urlEncodedType;
    const info = await this.factory.authorize(e.detail);
    this._dispatchToken(info);
  }
  
  _dispatchToken(info) {
    const e = new CustomEvent('oauth1-token-response', {
      bubbles: true,
      composed: true,
      cancelable: false,
      detail: info
    });
    this.dispatchEvent(e);
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
}
