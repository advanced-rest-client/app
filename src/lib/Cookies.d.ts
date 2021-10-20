import { Cookie, CookieOptions } from './Cookie';
/**
 * A library to handle Cookie parsing.
 */
export class Cookies {
  /**
   * List of parsed cookies
   */
  cookies: Cookie[];
  /**
   * Request URL from which the cookies came from.
   */
  url?: string;
  /**
   * Parsed to `URL` class `url` property.
   */
  uri?: URL;
  /**
   * Constructs an object.
   *
   * @param cookie A HTTP cookie string to parse.
   * @param url A request url for this cookie. If empty some
   * cookie computations (like checking if cookies matches) will be omitted.
   */
  constructor(cookie: string, url?: string);

  /**
   * Parses a cookie string to a list of Cookie objects.
   *
   * @param cookies A HTTP cookie string
   * @returns List of parsed cookies.
   */
  static parse(cookies: string): Cookie[];

  /**
   * Get a cookie by name.
   *
   * @param name Cookie name
   * @returns A Cookie object or null.
   */
  get(name: string): Cookie|null;

  /**
   * Adds a cookie to the list of cookies.
   *
   * @param name Name of the cookie.
   * @param value Value of the cookie.
   * @param opts Other cookie options to set.
   */
  set(name: string, value?: string, opts?: CookieOptions): void;

  /**
   * Returns a string that can be used in a HTTP header value for Cookie.
   * The structure of the cookie string depends on if you want to send a
   * cookie from the server to client or other way around.
   * When you want to send the `Cookie` header to server set
   * `toServer` argument to true. Then it will produce only `name=value;`
   * string. Otherwise it will be the `Set-Cookie` header value
   * containing all other cookies properties.
   *
   * @param toServer True if produced string is to be used with `Cookie` header
   * @returns HTTP header string value for all cookies.
   */
  toString(toServer?: boolean): string;

  /**
   * Removes cookies from `this.cookies` that has been set for different
   * domain and path.
   * This function has no effect if the URL is not set.
   *
   * This function follows an algorithm defined in https://tools.ietf.org/html/rfc6265 for
   * domain match.
   *
   * @returns A list of removed cookies.
   */
  filter(): Cookie[];

  /**
   * Merges this cookies with another Cookies object.
   * This cookies will be overwritten by passed cookies according to
   * the HTTP spec.
   * This function is useful when you need to override cookies with
   * the response from the server
   * as defined in the https://tools.ietf.org/html/rfc6265.
   *
   * @param {Cookies} cookies An Cookies object with newest cookies.
   * @param {string|string[]?} copyKeys If set, it will try to copy values
   * for given keys from old object to the new one.
   */
  merge(cookies: Cookies, copyKeys?: string|string[]): void;

  /**
   * Clears cookies from `this.cookies` that already expired.
   *
   * @returns List of removed (expired) cookies.
   */
  clearExpired(): Cookie[];
}
