import { UrlValueParser } from './UrlValueParser.js';
/** @typedef {import('./UrlValueParser').UrlValueParserOptions} UrlValueParserOptions */

/**
 * A class to parse URL string.
 */
export class UrlParser extends UrlValueParser {
  /**
   * @constructor
   * @param {String} value URL value
   * @param {UrlValueParserOptions=} opts
   */
  constructor(value, opts) {
    super(opts);
    this.value = value;
  }

  /**
   * Returns protocol value in format `protocol` + ':'
   *
   * @return {String|undefined} Value of the protocol or undefined if
   * value not set
   */
  get protocol() {
    return this.__data.protocol;
  }

  /**
   * Sets value of the `protocol`
   *
   * @param {String} value Protocol value.
   */
  set protocol(value) {
    this.__data.protocol = value;
  }

  /**
   * It reads the authority part of the URL value. It doesn't parses it
   * to host, port and credentials parts.
   *
   * @return {String|undefined} Value of the host or undefined if
   * value not set
   */
  get host() {
    return this.__data.host;
  }

  /**
   * Sets value of the `host`
   *
   * @param {String} value Host value.
   */
  set host(value) {
    this.__data.host = value;
  }

  /**
   * Returns path part of the URL.
   *
   * @return {String|undefined} Value of the path or undefined if
   * value not set
   */
  get path() {
    return this.__data.path || '/';
  }

  /**
   * Sets value of the `path`
   *
   * @param {String} value Path value.
   */
  set path(value) {
    this.__data.path = value;
  }

  /**
   * Returns anchor part of the URL.
   *
   * @return {String|undefined} Value of the anchor or undefined if
   * value not set
   */
  get anchor() {
    return this.__data.anchor;
  }

  /**
   * Sets value of the `anchor`
   *
   * @param {String} value Anchor value.
   */
  set anchor(value) {
    this.__data.anchor = value;
  }

  /**
   * Returns search part of the URL.
   *
   * @return {String|undefined} Value of the search or undefined if
   * value not set
   */
  get search() {
    return this.__data.search;
  }

  /**
   * Sets value of the `search`
   *
   * @param {String} value Search value.
   */
  set search(value) {
    this.__data.search = value;
  }

  /**
   * The URL value. It is the same as calling `toString()`.
   *
   * @return {String} URL value for current configuration.
   */
  get value() {
    return this.toString();
  }

  /**
   * Sets value of the URL.
   * It parses the url and sets properties.
   *
   * @param {string} value URL value.
   */
  set value(value) {
    this.protocol = this._parseProtocol(value);
    this.host = this._parseHost(value);
    this.path = this._parsePath(value);
    this.anchor = this._parseAnchor(value);
    this.search = this._parseSearch(value);
  }

  /**
   * Returns an array of search params.
   *
   * @return {Array<string[]>} List of search params. Each item contains an
   * array when first item is name of the parameter and second item is the
   * value.
   */
  get searchParams() {
    return this._parseSearchParams(this.search);
  }

  /**
   * Sets the value of `search` and `searchParams`.
   *
   * @param {Array<string[]>} value Search params list.
   */
  set searchParams(value) {
    if (!value || !value.length) {
      this.search = undefined;
      return;
    }
    this.search = value.map((item) => {
      if (!item[0] && !item[1]) {
        return '';
      }
      const itemValue = item[1] || '';
      return `${item[0]}=${itemValue}`;
    })
    .join(this.opts.queryDelimiter);
  }

  /**
   * Returns the URL for current settings.
   *
   * @return {string} URL value.
   */
  toString() {
    let result = '';
    if (this.protocol) {
      result += this.protocol;
      result += '//';
    }
    if (this.host) {
      result += this.host;
    }
    if (this.path) {
      if (this.path === '/' && !this.host && !this.search && !this.anchor) {
        // ???
      } else {
        if (this.path[0] !== '/') {
          result += '/';
        }
        result += this.path;
      }
    } else if (this.search || this.anchor) {
        result += '/';
      }
    if (this.search) {
      const p = this.searchParams;
      this.searchParams = p;
      result += `?${this.search}`;
    }
    if (this.anchor) {
      result += `#${this.anchor}`;
    }
    return result;
  }
}
