/**
 * Cookie creation options.
 */
export interface CookieOptions {
  'max-age'?: number;
  /**
   * When the cookie expires.
   * Note that this value is parsed to a timestamp in the Cookie class.
   */
  expires?: Date|number|string;
  /**
   * A string representing the domain the cookie belongs to
   * (e.g. "www.google.com", "example.com")
   */
  domain?: string;
  /**
   * Cookie path
   */
  path?: string;
  /**
   * A boolean, `true` if the cookie is marked as secure
   * (i.e. its scope is limited to secure channels, typically HTTPS),
   * or `false` otherwise.
   */
  secure?: boolean;
  /**
   * A boolean, `true` if the cookie is marked as HttpOnly
   * (i.e. the cookie is inaccessible to client-side scripts),
   * or `false` otherwise.
   */
  httpOnly?: boolean;
  /**
   * A boolean, `true` if the cookie is a `host-only` cookie
   * (i.e. the request's host must exactly match the domain of the cookie),
   * or `false` otherwise.
   */
  hostOnly?: boolean;
}

/**
 * A class that represents a cookie object.
 */
export class Cookie {
  /**
   * A link to `maxAge` for convenience.
   */
  'max-age'?: number;
  /**
   * The max age value
   */
  maxAge?: number;
  /**
   * Cookie name
   */
  name: string;
  /**
   * Cookie value
   */
  value?: string;
  /**
   * A string representing the domain the cookie belongs to
   * (e.g. "www.google.com", "example.com")
   */
  domain: string;
  /**
   * Cookie path
   */
  path: string;
  /**
   * A boolean, `true` if the cookie is a `host-only` cookie
   * (i.e. the request's host must exactly match the domain of the cookie),
   * or `false` otherwise.
   */
  hostOnly: boolean;
  /**
   * A boolean, `true` if the cookie is marked as secure
   * (i.e. its scope is limited to secure channels, typically HTTPS),
   * or `false` otherwise.
   */
  secure: boolean;
  /**
   * A boolean, `true` if the cookie is marked as HttpOnly
   * (i.e. the cookie is inaccessible to client-side scripts),
   * or `false` otherwise.
   */
  httpOnly: boolean;
  /**
   * Date when the cookie was created
   */
  created: Date;
  /**
   * Date when the cookie expires
   */
  expires: number;
  /**
   * Date when the cookie was accessed the last time
   */
  lastAccess: Date;
  /**
   * Whether or not the cookie is persistent.
   */
  persistent: boolean;

  /**
   * Constructs a new cookie.
   *
   * @param name Cookie name
   * @param value Cookie value
   * @param opts Additional cookie attributes.
   */
  constructor(name: string, value?: string, opts?: CookieOptions);

  /**
   * @returns Cookie's `name=value` string.
   */
  toString(): string;

  /**
   * Creates a HTTP header string from the cookie.
   * @return {string} Cookie string as a HTTP header value
   */
  toHeader(): string;

  /**
   * Override toJSON behavior so it will eliminate
   * all _* properties and replace it with a proper ones.
   *
   * @returns A copy of the object.
   */
  toJSON(): object;

  /**
   * Sets value for `expires` property from other types.
   * @param expires The value for `expires`
   */
  setExpires(expires: Date|string|number): void;
}
