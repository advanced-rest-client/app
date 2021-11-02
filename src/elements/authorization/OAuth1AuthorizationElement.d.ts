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
   * A handler for the `oauth1-token-requested` event.
   * Performs OAuth1 authorization for given settings.
   *
   * The detail object of the event contains OAuth1 configuration as described
   * in `auth-methods/oauth1.html`element.
   */
  _tokenRequestedHandler(e: CustomEvent|null): void;

  /**
   * Dispatches an error event that propagates through the DOM.
   */
  _dispatchError(message: String|null, code: String|null): void;
  _dispatchToken(info: any): void;
}
