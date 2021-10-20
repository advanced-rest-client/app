import { OAuth2AuthorizeEvent, Authorization } from '@advanced-rest-client/events';
import { EventsTargetMixin } from '@anypoint-web-components/awc';

export declare const authorizeHandler: unique symbol;

/**
 * An element that utilizes the `OAuth2Authorization` class in a web component.
 * It handles DOM events to perform the authorization.
 */
export class OAuth2AuthorizationElement extends EventsTargetMixin(HTMLElement) {
  /** 
   * When set it uses this value to prefix the call to the 
   * OAuth 2 token endpoint. This is to support use cases when 
   * the requests should be proxied through a server to avoid CORS problems.
   * 
   * @attribute
   */
  tokenProxy: string;
  /** 
   * When set it encodes the token URI value before adding it to the 
   * `tokenProxy`. This is to be used when the proxy takes the target 
   * URL as a query parameter.
   * 
   * @attribute
   */
  tokenProxyEncode: boolean;
  constructor();

  _attachListeners(node: EventTarget): void;

  _detachListeners(node: EventTarget): void;

  [authorizeHandler](e: OAuth2AuthorizeEvent): void;

  /**
   * Authorize the user using provided settings.
   * This is left for compatibility. Use the `OAuth2Authorization` instead.
   *
   * @param settings The authorization configuration.
   */
  authorize(settings: Authorization.OAuth2Authorization): Promise<Authorization.TokenInfo>;
}
