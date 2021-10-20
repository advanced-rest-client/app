/* eslint-disable class-methods-use-this */
/** @typedef {import('./UrlValueParser').UrlValueParserOptions} UrlValueParserOptions */

/**
 * Implements logic for parsing URL string.
 */
export class UrlValueParser {
  /**
   * @constructor
   * @param {UrlValueParserOptions=} opts
   */
  constructor(opts) {
    this.__data = {};
    this.opts = opts;
  }

  /**
   * @return {Object} Class options.
   */
  get opts() {
    return this.__data.opts;
  }

  /**
   * Sets parser options.
   * Unknown options are ignored.
   *
   * @param {Object} opts Options to pass.
   * - queryDelimiter {String} a query string delimiter.
   */
  set opts(opts) {
    const options = opts || {};
    this.__data.opts = {
      queryDelimiter: options.queryDelimiter || '&'
    };
  }

  /**
   * Returns protocol value in format `protocol` + ':'
   *
   * @param {String} value URL to parse.
   * @return {String|undefined} Value of the protocol or undefined if
   * value not set
   */
  _parseProtocol(value) {
    if (!value) {
      return undefined;
    }
    const delimiterIndex = value.indexOf('://');
    if (delimiterIndex !== -1) {
      return value.substr(0, delimiterIndex + 1);
    }
    return undefined;
  }

  /**
   * Gets a host value from the url.
   * It reads the whole authority value of given `value`. It doesn't parses it
   * to host, port and
   * credentials parts. For URL panel it's enough.
   *
   * @param {String} value The URL to parse
   * @return {String|undefined} Value of the host or undefined.
   */
  _parseHost(value) {
    if (!value) {
      return undefined;
    }
    let result = value;
    const delimiterIndex = result.indexOf('://');
    if (delimiterIndex !== -1) {
      result = result.substr(delimiterIndex + 3);
    }
    if (!result) {
      return undefined;
    }
    // We don't need specifics here (username, password, port)
    const host = result.split('/')[0];
    return host;
  }

  /**
   * Parses the path part of the URL.
   *
   * @param {string} value URL value
   * @return {string|undefined} Path part of the URL
   */
  _parsePath(value) {
    if (!value) {
      return undefined;
    }
    let result = value;
    const isBasePath = result[0] === '/';
    if (!isBasePath) {
      const index = result.indexOf('://');
      if (index !== -1) {
        result = result.substr(index + 3);
      }
    }
    let index = result.indexOf('?');
    if (index !== -1) {
      result = result.substr(0, index);
    }
    index = result.indexOf('#');
    if (index !== -1) {
      result = result.substr(0, index);
    }
    const lastIsSlash = result[result.length - 1] === '/';
    const parts = result.split('/').filter((part) => !!part);
    if (!isBasePath) {
      parts.shift();
    }
    let path = `/${  parts.join('/')}`;
    if (lastIsSlash && parts.length > 1) {
      path += '/';
    }
    return path;
  }

  /**
   * Returns query parameters string (without the '?' sign) as a whole.
   *
   * @param {string} value The URL to parse
   * @return {string|undefined} Value of the search string or undefined.
   */
  _parseSearch(value) {
    if (!value) {
      return undefined;
    }
    let index = value.indexOf('?');
    if (index === -1) {
      return undefined;
    }
    const result = value.substr(index + 1);
    index = result.indexOf('#');
    if (index === -1) {
      return result;
    }
    return result.substr(0, index);
  }

  /**
   * Reads a value of the anchor (or hash) parameter without the `#` sign.
   *
   * @param {string} value The URL to parse
   * @return {string|undefined} Value of the anchor (hash) or undefined.
   */
  _parseAnchor(value) {
    if (!value) {
      return undefined;
    }
    const index = value.indexOf('#');
    if (index === -1) {
      return undefined;
    }
    return value.substr(index + 1);
  }

  /**
   * Returns an array of items where each item is an array where first
   * item is param name and second is it's value. Both always strings.
   *
   * @param {string=} search Parsed search parameter
   * @return {Array} Always returns an array.
   */
  _parseSearchParams(search) {
    const result = [];
    if (!search) {
      return result;
    }
    const parts = search.split(this.opts.queryDelimiter);
    parts.forEach((item) => {
      const _part = ['', ''];
      const _params = item.split('=');
      let _name = _params.shift();
      if (!_name && _name !== '') {
        return;
      }
      _name = _name.trim();
      const _value = _params.join('=').trim();
      _part[0] = _name;
      _part[1] = _value;
      result.push(_part);
    });
    return result;
  }
}
