/** @typedef {import('@advanced-rest-client/events').FormTypes.FormItem} FormItem */

const ERROR_MESSAGES = {
  CONTENT_TYPE_MISSING: 'Content-Type header is not defined',
  HEADER_NAME_EMPTY: "Header name can't be empty",
  HEADER_NAME_WHITESPACE: 'Header name should not contain white spaces',
  HEADER_VALUE_EMPTY: 'Header value should not be empty',
};

export class HeadersParser {
  /**
   * Filter array of headers and return not duplicated array of the same headers.
   * Duplicated headers should be appended to already found one using coma separator.
   *
   * @param {FormItem[]} input Headers list to filter.
   * @return {FormItem[]} An array of filtered headers.
   */
  static unique(input) {
    const _tmp = {};
    input.forEach((header) => {
      if (header.enabled === false) {
        return;
      }
      if (!(header.name in _tmp)) {
        _tmp[header.name] = { ...header };
        return;
      }
      if (header.value) {
        _tmp[header.name].value += `, ${header.value}`;
      }
    });
    return Object.keys(_tmp).map((key) => _tmp[key]);
  }

  /**
   * Parse HTTP headers input from string to array of objects containing `name` and `value`
   * properties.
   *
   * @param {string|Headers|FormItem[]|Object} headers Raw HTTP headers input or Headers object
   * @return {FormItem[]} List of parsed headers
   */
  static toJSON(headers) {
    if (typeof headers === 'string') {
      return HeadersParser.stringToJSON(headers);
    }
    return HeadersParser.headersToJSON(headers);
  }
  
  /**
   * Parse headers string to array of objects.
   * See `#toJSON` for more info.
   *
   * @param {string} headerString Headers string to process.
   * @return {FormItem[]} List of parsed headers
   */
  static stringToJSON(headerString) {
    const result = [];
    if (!headerString) {
      return result;
    }
    if (typeof headerString !== 'string') {
      throw new Error('The headerString argument must be a String.');
    }
    if (headerString.trim() === '') {
      return result;
    }
    const headers = headerString.split(/\n(?=[^ \t]+)/gim);
    headers.forEach((item) => {
      const line = item.trim();
      if (!line) {
        return;
      }
      const sepPosition = line.indexOf(':');
      if (sepPosition === -1) {
        result[result.length] = {
          name: line,
          value: '',
          enabled: true,
        };
        return;
      }
      const name = line.substr(0, sepPosition);
      const value = line.substr(sepPosition + 1).trim();
      const obj = {
        name,
        value,
        enabled: true,
      };
      result.push(obj);
    });
    return result;
  }

  /**
   * Parse Headers object to array of objects.
   * See `#toJSON` for more info.
   *
   * @param {Headers|object} input
   * @return {FormItem[]}
   */
  static headersToJSON(input) {
    const result = [];
    if (!input) {
      return result;
    }
    const headers = new Headers(input);
    const _tmp = {};
    headers.forEach((value, name) => {
      if (_tmp[name]) {
        _tmp[name] += `, ${value}`;
      } else {
        _tmp[name] = value;
      }
    });
    return Object.keys(_tmp).map((name) => {
      let value = /** @type String */ (_tmp[name]);
      if (value && value.indexOf(',') !== -1) {
        value = value.split(',').map((part) => part.trim()).join(', ');
      }
      return {
        name,
        value,
      };
    });
  }

  /**
   * Transforms a header model item to a string.
   * Array values are supported.
   *
   * @param {FormItem} header Object with name and value.
   * @return {string} Generated headers line
   */
  static itemToString(header) {
    const key = header.name;
    let value;
    if (Array.isArray(header.value)) {
      value = header.value.join(',');
    } else {
      value = header.value;
    }
    let result = '';
    if (key && key.trim() !== '') {
      result += `${key}: `;
      if (typeof value !== 'undefined') {
        value = value.split('\n').join(' ');
        result += value;
      }
    }
    return result;
  }

  /**
   * Parse headers array to Raw HTTP headers string.
   *
   * @param {FormItem[]|string|Headers} input List of `Header`s
   * @return {string} A HTTP representation of the headers.
   */
  static toString(input) {
    if (typeof input === 'string') {
      return input;
    }
    let headers = input;
    if (!Array.isArray(headers)) {
      headers = HeadersParser.toJSON(headers);
    }
    if (headers.length === 0) {
      return '';
    }
    headers = HeadersParser.unique(headers);
    const parts = [];
    headers.forEach((item) => {
      if (item.enabled === false) {
        return;
      }
      if (!item.name && !item.value) {
        return;
      }
      const { schema={} } = item;
      if (!schema.required && !item.value) {
        return;
      }
      parts.push(HeadersParser.itemToString(item));
    });
    return parts.join('\n');
  }

  /**
   * Finds and returns the value of the Content-Type value header.
   *
   * @param {FormItem[]|Headers|string} input Either HTTP headers string or list of headers.
   * @return {string|null} A content-type header value or null if not found
   */
  static contentType(input) {
    let headers = input;
    if (typeof headers !== 'string') {
      headers = HeadersParser.toString(headers);
    }
    headers = headers.trim();
    if (headers === '') {
      return null;
    }
    const re = /^content-type:\s?(.*)$/im;
    const match = headers.match(re);
    if (!match) {
      return null;
    }
    let ct = match[1].trim();
    if (ct.indexOf('multipart') === -1) {
      const index = ct.indexOf('; ');
      if (index > 0) {
        ct = ct.substr(0, index);
      }
    }
    return ct;
  }

  /**
   * Replace value for given header in the headers list.
   *
   * @param {Headers|FormItem[]|string} input A headers to process. Can be string,
   * array of internal definition of headers or an instance of the Headers object.
   * @param {string} name Header name to be replaced.
   * @param {string} value Header value to be replaced.
   * @return {Headers|FormItem[]|string} Updated headers.
   */
  static replace(input, name, value) {
    let headers = /** @type FormItem[] */ (input);
    let origType = 'headers';
    if (Array.isArray(headers)) {
      origType = 'array';
    } else if (typeof headers === 'string') {
      origType = 'string';
    }
    if (origType !== 'array') {
      headers = HeadersParser.toJSON(headers);
    }
    const _name = name.toLowerCase();
    let found = false;
    headers.forEach((header) => {
      if (header.name.toLowerCase() === _name) {
        // eslint-disable-next-line no-param-reassign
        header.value = value;
        found = true;
      }
    });
    if (!found) {
      headers.push({
        name,
        value,
      });
    }
    if (origType === 'array') {
      return headers;
    }
    if (origType === 'string') {
      return HeadersParser.toString(headers);
    }
    const obj = {};
    headers.forEach((header) => {
      obj[header.name] = header.value;
    });
    // @ts-ignore
    return new Headers(obj);
  }

  /**
   * Get error message for given header string.
   * @param {Headers|FormItem[]|string} input A headers to check.
   * @param {boolean} [isPayload=false] Whether current request can have payload message.
   * @return {String|null} An error message or null if the headers are valid.
   */
  static getError(input, isPayload = false) {
    let headers = input;
    if (!headers) {
      if (isPayload) {
        return ERROR_MESSAGES.CONTENT_TYPE_MISSING;
      }
      return null;
    }
    if (!Array.isArray(headers)) {
      headers = HeadersParser.toJSON(headers);
    }
    const msg = [];
    let hasContentType = false;
    headers.forEach((item) => {
      const { name, value } = item;
      if (name.toLowerCase() === 'content-type') {
        hasContentType = true;
      }
      if (!name || !name.trim()) {
        msg[msg.length] = ERROR_MESSAGES.HEADER_NAME_EMPTY;
      } else if (/\s/.test(name)) {
        msg[msg.length] = ERROR_MESSAGES.HEADER_NAME_WHITESPACE;
      }
      if (!value || !String(value).trim()) {
        msg[msg.length] = ERROR_MESSAGES.HEADER_VALUE_EMPTY;
      }
    });
    if (isPayload && !hasContentType) {
      msg[msg.length] = ERROR_MESSAGES.CONTENT_TYPE_MISSING;
    }
    if (msg.length > 0) {
      return msg.join('\n');
    }
    return null;
  }
}
