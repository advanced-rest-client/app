import { OAuth1AuthorizationElement } from '../src/elements/authorization/OAuth1AuthorizationElement';

declare global {
  interface HTMLElementTagNameMap {
    "oauth1-authorization": OAuth1AuthorizationElement;
  }
}
