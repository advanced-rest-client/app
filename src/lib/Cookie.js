/* eslint-disable arrow-body-style */
/** @typedef {import('./Cookie').CookieOptions} CookieOptions */

/* eslint-disable no-control-regex */
const fieldContentRegExp = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/;

/**
 * A Cookie object.
 * It is based on https://github.com/pillarjs/cookies/blob/master/lib/cookies.js
 */
export class Cookie {
  /**
   * Constructs a new cookie.
   *
   * @param {string} name Cookie name
   * @param {string=} [value=''] Cookie value
   * @param {CookieOptions=} opts Additional cookie attributes.
   */
  constructor(name, value = '', opts = {}) {
    if (!fieldContentRegExp.test(name)) {
      throw new TypeError('Argument `name` is invalid');
    }
    if (value && !fieldContentRegExp.test(value)) {
      throw new TypeError('Argument `value` is invalid');
    }
    if (opts.path && !fieldContentRegExp.test(opts.path)) {
      throw new TypeError('Option `path` is invalid');
    }
    if (opts.domain && !fieldContentRegExp.test(opts.domain)) {
      throw new TypeError('Option `domain` is invalid');
    }
    Object.defineProperty(this, 'max-age', {
      configurable: true,
      enumerable: true,
      get: () => {
        return this._maxAge;
      },
      set: (v) => {
        this.maxAge = v;
      },
    });
    this._expires = 0;
    this._domain = undefined;
    this._maxAge = undefined;
    this.name = name;
    this.value = value;
    this.created = Date.now();
    this.lastAccess = this.created;

    if ('max-age' in opts) {
      this.maxAge = opts['max-age'];
    } else if ('expires' in opts) {
      this.setExpires(opts.expires);
    } else {
      this.persistent = false;
      // see http://stackoverflow.com/a/11526569/1127848
      this._expires = new Date(8640000000000000).getTime();
    }
    if ('hostOnly' in opts) {
      this.hostOnly = opts.hostOnly;
    }
    if ('domain' in opts) {
      this.domain = opts.domain;
    } else {
      this.hostOnly = false;
    }
    if ('path' in opts) {
      this.path = opts.path;
    }
    if ('secure' in opts) {
      this.secure = opts.secure;
    }
    if ('httpOnly' in opts) {
      this.httpOnly = opts.httpOnly;
    }
  }

  /**
   * @param {number} max The max age value
   */
  set maxAge(max) {
    const typedMax = Number(max);
    if (Number.isNaN(typedMax)) {
      return;
    }
    this._maxAge = typedMax;
    if (typedMax <= 0) {
      // see http://stackoverflow.com/a/11526569/1127848
      // and https://tools.ietf.org/html/rfc6265#section-5.2.2
      this._expires = new Date(-8640000000000000).getTime();
    } else {
      let now = Date.now();
      now += max * 1000;
      this._expires = now;
    }
    this.persistent = true;
  }

  /**
   * @return {number} Returns a value of maxAge property
   */
  get maxAge() {
    return this['max-age'];
  }

  /**
   * @param {number} expires Value for expires
   */
  set expires(expires) {
    const any = /** @type any */ (expires);
    if ((expires && typeof any === 'string') || any instanceof Date) {
      this.setExpires(any);
      return;
    }
    this._expires = expires;
    this.persistent = true;
  }

  /**
   * @return {number}
   */
  get expires() {
    return this._expires;
  }

  /**
   * @param {string} domain Cookie domain
   */
  set domain(domain) {
    this._domain = domain;
    if (!domain) {
      this.hostOnly = false;
    } else {
      this.hostOnly = true;
    }
  }

  /**
   * @return {string} Cookie domain
   */
  get domain() {
    return this._domain;
  }

  /**
   * @return {string} Cookie's `name=value` string.
   */
  toString() {
    const { name, value } = this;
    return `${name}=${value}`;
  }

  /**
   * Returns a Cookie as a HTTP header string.
   * @return {String} Cookie string as a HTTP header value
   */
  toHeader() {
    let header = this.toString();
    let expires;
    if (this._expires) {
      expires = new Date(this._expires);
      if (expires.toString() === 'Invalid Date') {
        expires = new Date(0);
      }
    }
    if (expires) {
      header += `; expires=${expires.toUTCString()}`;
    }
    const { path, domain, httpOnly } = this;
    if (path) {
      header += `; path=${path}`;
    }
    if (domain) {
      header += `; domain=${domain}`;
    }
    if (httpOnly) {
      header += `; httpOnly=${httpOnly}`;
    }
    return header;
  }

  /**
   * Override toJSON behaviour so it will eliminate
   * all _* properties and replace it with a proper ones.
   *
   * @return {object}
   */
  toJSON() {
    const copy = {};
    const keys = Object.keys(this);
    keys.forEach((key) => {
      if (key.indexOf('_') === 0) {
        const realKey = key.substr(1);
        copy[realKey] = this[key];
      } else {
        copy[key] = this[key];
      }
    });
    return copy;
  }

  /**
   * Sets value for `expirers` propr from other types.
   * @param {Date|string|number} expires The value for `expires`
   */
  setExpires(expires) {
    let value;
    if (expires instanceof Date) {
      value = expires.getTime();
    } else if (typeof expires === 'string') {
      const tmp = new Date(expires);
      if (tmp.toString() === 'Invalid Date') {
        value = 0;
      } else {
        value = tmp.getTime();
      }
    } else if (typeof expires === 'number') {
      value = expires;
    }
    this.expires = value;
  }
}
