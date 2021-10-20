import { Cookie } from './Cookie.js';
import {
  getPath,
  matchesDomain,
  matchesPath,
  fillCookieAttributes,
} from './CookieUtils.js';
/** @typedef {import('./Cookie').CookieOptions} CookieOptions */

/**
 * A library to handle Cookie parsing.
 */
export class Cookies {
  /**
   * Constructs an object.
   *
   * @param {string} cookie A HTTP cookie string to parse.
   * @param {string=} url A request url for this cookie. If empty some
   * cookie computations (like checking if cookies matches) will be omitted.
   */
  constructor(cookie = '', url) {
    /**
     * A base URL for this object.
     *
     * @type {string}
     */
    this.url = url;

    /**
     * A list of parsed cookies.
     *
     * @type {Cookie[]}
     */
    this.cookies = Cookies.parse(cookie);
    fillCookieAttributes(this.uri, url, this.cookies);
  }

  /**
   * Set's the URL and parses it setting `uri` property.
   * @param {string} url Cookie URL
   */
  set url(url) {
    if (url) {
      this._url = url;
      this.uri = new URL(this.url);
    } else {
      this._url = undefined;
      this.uri = undefined;
    }
  }

  /**
   * @return {string} Cookie URL
   */
  get url() {
    return this._url;
  }

  /**
   * Parses a cookie string to a list of Cookie objects.
   *
   * @param {string} cookies A HTTP cookie string
   * @return {Cookie[]} List of parsed cookies.
   */
  static parse(cookies) {
    const cookieParts = [
      'path',
      'domain',
      'max-age',
      'expires',
      'secure',
      'httponly',
    ];
    const list = [];
    if (!cookies || !cookies.trim()) {
      return list;
    }
    cookies.split(/;/).forEach((cookie) => {
      const parts = cookie.split(/=/, 2);
      if (parts.length === 0) {
        return;
      }
      const name = decodeURIComponent(parts[0].trim());
      if (!name) {
        return;
      }
      const lowerName = name.toLowerCase();
      let value;
      if (parts.length > 1) {
        try {
          value = decodeURIComponent(parts[1].trim());
        } catch (e) {
          // eslint-disable-next-line prefer-destructuring
          value = parts[1];
        }
      } else {
        value = null;
      }
      // if this is an attribute of previous cookie, set it for last
      // added cookie.
      if (cookieParts.indexOf(lowerName) !== -1) {
        if (list.length - 1 >= 0) {
          list[list.length - 1][lowerName] = value;
        }
      } else {
        try {
          list.push(new Cookie(name, value));
        } catch (e) {
          // ..
        }
      }
    });
    return list;
  }

  /**
   * Get a cookie by name.
   *
   * @param {string} name Cookie name
   * @return {Cookie} A Cookie object or null.
   */
  get(name) {
    const { cookies } = this;
    // eslint-disable-next-line no-plusplus
    for (let i = 0, len = cookies.length; i < len; i++) {
      if (cookies[i].name === name) {
        return cookies[i];
      }
    }
    return null;
  }

  /**
   * Adds a cookie to the list of cookies.
   *
   * @param {string} name Name of the cookie.
   * @param {string=} value Value of the cookie.
   * @param {CookieOptions=} opts Other cookie options to set.
   */
  set(name, value, opts) {
    const cookie = new Cookie(name, value, opts);
    const cookies = this.cookies.filter((c) => c.name !== name);
    cookies.push(cookie);
    this.cookies = cookies;
  }

  /**
   * Returns a string that can be used in a HTTP header value for Cookie.
   * The structure of the cookie string depends on if you want to send a
   * cookie from the server to client or other way around.
   * When you want to send the `Cookie` header to server set
   * `toServer` argument to true. Then it will produce only `name=value;`
   * string. Otherwise it will be the `Set-Cookie` header value
   * containing all other cookies properties.
   *
   * @param {boolean=} toServer True if produced string is to be used with
   * `Cookie` header
   * @return {string} HTTP header string value for all cookies.
   */
  toString(toServer = false) {
    const parts = [];
    this.cookies.forEach((cookie) => {
      parts.push(toServer ? cookie.toString() : cookie.toHeader());
    });
    return parts.join('; ');
  }

  /**
   * Removes cookies from `this.cookies` that has been set for different
   * domain and path.
   * This function has no effect if the URL is not set.
   *
   * This function follows an algorithm defined in https://tools.ietf.org/html/rfc6265 for
   * domain match.
   *
   * @return {Cookie[]} A list of removed cookies.
   */
  filter() {
    const { uri, url } = this;
    if (!uri) {
      return [];
    }
    const domain = uri.hostname.toLowerCase();
    const path = getPath(url);
    const removed = [];
    this.cookies = this.cookies.filter((cookie) => {
      if (!cookie.path) {
        // eslint-disable-next-line no-param-reassign
        cookie.path = path;
      }
      const cDomain = cookie.domain;
      if (!cDomain) {
        // eslint-disable-next-line no-param-reassign
        cookie.domain = domain;
        // point 6. of https://tools.ietf.org/html/rfc6265#section-5.3
        // eslint-disable-next-line no-param-reassign
        cookie.hostOnly = true;
        return true;
      }
      const res =
        matchesDomain(cDomain, uri) && matchesPath(cookie.path, uri, url);
      if (!res) {
        removed.push(cookie);
      }
      return res;
    });
    return removed;
  }

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
  merge(cookies, copyKeys = []) {
    if (!cookies || !cookies.cookies || cookies.cookies.length === 0) {
      return;
    }
    if (!this.cookies || this.cookies.length === 0) {
      this.cookies = cookies.cookies;
      return;
    }
    const foreignDomain = cookies.uri ? cookies.uri.hostname : null;
    const foreignPath = cookies.url ? getPath(cookies.url) : null;
    // delete cookies from this.cookies that has the same name as new ones,
    // but are domain/path match
    const newCookies = cookies.cookies;
    const nLength = newCookies.length;

    const ck = Array.isArray(copyKeys) ? copyKeys : [copyKeys];
    const { uri, url } = this;
    const copyKeysLength = ck.length;
    // eslint-disable-next-line no-plusplus
    for (let i = this.cookies.length - 1; i >= 0; i--) {
      const tName = this.cookies[i].name;
      // eslint-disable-next-line no-plusplus
      for (let j = 0; j < nLength; j++) {
        const nName = newCookies[j].name;
        if (nName !== tName) {
          // eslint-disable-next-line no-continue
          continue;
        }
        if (!foreignDomain || !matchesDomain(foreignDomain, uri)) {
          // This is cookie for a different domain. Don't override.
          // eslint-disable-next-line no-continue
          continue;
        }
        if (!foreignPath || !matchesPath(foreignPath, uri, url)) {
          // This is cookie for a different path. Don't override.
          // eslint-disable-next-line no-continue
          continue;
        }
        const removed = this.cookies.splice(i, 1);
        newCookies[j].created = removed[0].created;
        if (copyKeysLength) {
          // eslint-disable-next-line no-plusplus
          for (let k = 0; k < copyKeysLength; k++) {
            const key = ck[k];
            if (key in removed[0]) {
              newCookies[j][key] = removed[0][key];
            }
          }
        }
        break;
      }
    }
    // Do not re-set cookies that values are not set.
    // eslint-disable-next-line no-plusplus
    for (let i = nLength - 1; i >= 0; i--) {
      const nValue = newCookies[i].value;
      if (!nValue || !nValue.trim || !nValue.trim()) {
        newCookies.splice(i, 1);
      }
    }
    this.cookies = this.cookies.concat(newCookies);
  }

  /**
   * Clears cookies from `this.cookies` that already expired.
   *
   * @return {Cookie[]} List of removed (expired) cookies.
   */
  clearExpired() {
    const now = Date.now();
    const expired = [];
    const cookies = this.cookies.filter((cookie) => {
      if (!cookie.expires) {
        return true;
      }
      if (now >= cookie.expires) {
        expired.push(cookie);
        return false;
      }
      return true;
    });
    this.cookies = cookies;
    return expired;
  }
}
