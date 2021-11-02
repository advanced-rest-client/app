/* eslint-disable class-methods-use-this */
import { EventTypes } from '@advanced-rest-client/events';
import { EventsTargetMixin } from '@anypoint-web-components/awc';
import { OAuth2Authorization } from '@advanced-rest-client/oauth';

/** @typedef {import('@advanced-rest-client/events').Authorization.TokenInfo} TokenInfo */
/** @typedef {import('@advanced-rest-client/events').Authorization.OAuth2Authorization} OAuth2Settings */
/** @typedef {import('@advanced-rest-client/events').OAuth2AuthorizeEvent} OAuth2AuthorizeEvent */
/** @typedef {import('@advanced-rest-client/oauth').ProcessingOptions} ProcessingOptions */

export const authorizeHandler = Symbol('authorizeHandler');

/**
 * An element that utilizes the `OAuth2Authorization` class in a web component.
 * It handles DOM events to perform the authorization.
 */ 
export class OAuth2AuthorizationElement extends EventsTargetMixin(HTMLElement) {
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
    node.addEventListener(EventTypes.Authorization.OAuth2.authorize, this[authorizeHandler]);
    this.setAttribute('aria-hidden', 'true');
  }

  /**
   * @param {EventTarget} node
   */
  _detachListeners(node) {
    node.removeEventListener(EventTypes.Authorization.OAuth2.authorize, this[authorizeHandler]);
  }

  /**
   * @param {OAuth2AuthorizeEvent} e
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
   * @returns {Promise<TokenInfo>}
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
    const auth = new OAuth2Authorization(settings, options);
    auth.checkConfig();
    return auth.authorize();
  }
}
