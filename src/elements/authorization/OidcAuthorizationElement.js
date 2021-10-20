/* eslint-disable class-methods-use-this */
import { AuthorizationEventTypes } from '@advanced-rest-client/events';
import { EventsTargetMixin } from '@anypoint-web-components/awc';
import { OidcAuthorization } from './OidcAuthorization.js';

/** @typedef {import('@advanced-rest-client/events').Authorization.OidcTokenInfo} OidcTokenInfo */
/** @typedef {import('@advanced-rest-client/events').Authorization.OidcTokenError} OidcTokenError */
/** @typedef {import('@advanced-rest-client/events').Authorization.OAuth2Authorization} OAuth2Settings */
/** @typedef {import('@advanced-rest-client/events').OidcAuthorizeEvent} OidcAuthorizeEvent */
/** @typedef {import('./types').ProcessingOptions} ProcessingOptions */

export const authorizeHandler = Symbol('authorizeHandler');

export default class OidcAuthorizationElement extends EventsTargetMixin(HTMLElement) {
  static get observedAttributes() {
    return ['tokenproxy', 'tokenproxyencode']; 
  }

  constructor() {
    super();
    this[authorizeHandler] = this[authorizeHandler].bind(this);
    /** 
     * When set it uses this value to prefix the call to the 
     * OAuth 2 token endpoint. This is to support use cases when 
     * the requests should be proxied through a server to avoid CORS problems.
     * @type string 
     */
    this.tokenProxy = undefined;
    /**
     * When set it encodes the token URI value before adding it to the 
     * `tokenProxy`. This is to be used when the proxy takes the target 
     * URL as a query parameter.
     * @type boolean 
     */
    this.tokenProxyEncode = undefined;
  }

  /**
   * @param {string} name
   * @param {string|null} oldValue
   * @param {string|null} newValue
   */
  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case 'tokenproxy': this.tokenProxy = newValue; break;
      case 'tokenproxyencode': this.tokenProxyEncode = newValue !== null; break;
      default:
    }
  }

  /**
   * @param {EventTarget} node
   */
  _attachListeners(node) {
    node.addEventListener(AuthorizationEventTypes.Oidc.authorize, this[authorizeHandler]);
    this.setAttribute('aria-hidden', 'true');
  }

  /**
   * @param {EventTarget} node
   */
  _detachListeners(node) {
    node.removeEventListener(AuthorizationEventTypes.Oidc.authorize, this[authorizeHandler]);
  }

  /**
   * @param {OidcAuthorizeEvent} e
   */
  [authorizeHandler](e) {
    const config = { ...e.detail };
    e.detail.result = this.authorize(config);
  }

  /**
   * Authorize the user using provided settings.
   * This is left for compatibility. Use the `OAuth2Authorization` instead.
   *
   * @param {OAuth2Settings} settings The authorization configuration.
   * @returns {Promise<(OidcTokenInfo|OidcTokenError)[]>}
   */
  async authorize(settings) {
    const { tokenProxy, tokenProxyEncode } = this;
    const options = /** @type ProcessingOptions */ ({});
    if (tokenProxy && typeof tokenProxy === 'string') {
      options.tokenProxy = tokenProxy;
    }
    if (tokenProxy && tokenProxyEncode && typeof tokenProxyEncode === 'boolean') {
      options.tokenProxyEncode = tokenProxyEncode;
    }
    const auth = new OidcAuthorization(settings, options);
    auth.checkConfig();
    return auth.authorize();
  }
}
