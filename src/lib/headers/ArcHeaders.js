/* eslint-disable no-restricted-syntax */
/* eslint-disable no-param-reassign */
/* eslint-disable consistent-return */
/* eslint-disable no-continue */
/* eslint-disable no-plusplus */
/**
 * Normalizes name of a header.
 * @param {String} name
 * @return {String} Normalized name
 */
function normalizeName(name) {
  if (typeof name !== 'string') {
    name = String(name);
  }
  return name.toLowerCase();
}

/**
 * Normalizes value of a header.
 * @param {String} value
 * @return {String} Normalized name
 */
function normalizeValue(value) {
  if (typeof value !== 'string') {
    value = String(value);
  }
  return value;
}

/**
 * A generator for list of headers from a string.
 *
 * ```javascript
 * for (let [name, value] of headersStringToList('a:b')) {
 *  ...
 * }
 * ```
 * @param {string} string Headers string to parse
 * @return {Generator}
 */
function* headersStringToList(string) {
  if (!string || string.trim() === '') {
    return [];
  }
  const headers = string.split(/\n(?=[^ \t]+)/gim);
  for (let i = 0, len = headers.length; i < len; i++) {
    const line = headers[i].trim();
    if (line === '') {
      continue;
    }
    const sepPosition = line.indexOf(':');
    if (sepPosition === -1) {
      yield [line, ''];
    } else {
      const name = line.substr(0, sepPosition);
      const value = line.substr(sepPosition + 1).trim();
      yield [name, value];
    }
  }
}

/**
 * ARC version of headers interface.
 * It supports ARC API.
 */
export class ArcHeaders {
  /**
   * @param {ArcHeaders|Headers|string|string[]|Object=} headers
   */
  constructor(headers) {
    this.map = {};
    if (
      headers instanceof ArcHeaders ||
      // @ts-ignore
      (typeof Headers !== 'undefined' && headers instanceof Headers)
    ) {
      headers.forEach((value, name) => this.append(name, value));
    } else if (Array.isArray(headers)) {
      headers.forEach((header) => this.append(header[0], header[1]));
    } else if (typeof headers === 'string') {
      const iterator = headersStringToList(headers);
      let result = iterator.next();
      while (!result.done) {
        this.append(result.value[0], result.value[1]);
        result = iterator.next();
      }
    } else if (headers) {
      Object.keys(headers).forEach((name) => this.append(name, headers[name]));
    }
  }

  /**
   * Adds value to existing header or creates new header
   * @param {string} name
   * @param {string} value
   */
  append(name, value) {
    const normalizedName = normalizeName(name);
    value = normalizeValue(value);
    let item = this.map[normalizedName];
    if (item) {
      const oldValue = item.value;
      item.value = oldValue ? `${oldValue},${value}` : value;
    } else {
      item = {
        name,
        value,
      };
    }
    this.map[normalizedName] = item;
  }

  /**
   * Removes a header from the list of headers.
   * @param {string} name Header name
   */
  delete(name) {
    delete this.map[normalizeName(name)];
  }

  /**
   * Returns current value of the header
   * @param {string} name Header name
   * @return {string|undefined}
   */
  get(name) {
    name = normalizeName(name);
    return this.has(name) ? this.map[name].value : undefined;
  }

  /**
   * Checks if header exists.
   * @param {string} name
   * @return {boolean}
   */
  has(name) {
    return Object.prototype.hasOwnProperty.call(this.map, normalizeName(name));
  }

  /**
   * Creates new header. If header existed it replaces it's value.
   * @param {string} name
   * @param {string} value
   */
  set(name, value) {
    const normalizedName = normalizeName(name);
    this.map[normalizedName] = {
      value: normalizeValue(value),
      name,
    };
  }

  /**
   * @param {Function} callback
   * @param {Object=} thisArg
   */
  forEach(callback, thisArg) {
    for (const name in this.map) {
      if (Object.prototype.hasOwnProperty.call(this.map, name)) {
        callback.call(thisArg, this.map[name].value, this.map[name].name, this);
      }
    }
  }

  /**
   * @return {string} Headers HTTP string
   */
  toString() {
    const result = [];
    this.forEach((value, name) => {
      let tmp = `${name}: `;
      if (value) {
        tmp += value;
      }
      result.push(tmp);
    });
    return result.join('\n');
  }

  /**
   * Iterates over keys.
   */
  *keys() {
    for (const name in this.map) {
      if (Object.prototype.hasOwnProperty.call(this.map, name)) {
        yield this.map[name].name;
      }
    }
  }

  /**
   * Iterates over values.
   */
  *values() {
    for (const name in this.map) {
      if (Object.prototype.hasOwnProperty.call(this.map, name)) {
        yield this.map[name].value;
      }
    }
  }

  /**
   * Iterates over headers.
   */
  *entries() {
    for (const name in this.map) {
      if (Object.prototype.hasOwnProperty.call(this.map, name)) {
        yield [this.map[name].name, this.map[name].value];
      }
    }
  }

  /**
   * Iterates over headers.
   */
  *[Symbol.iterator]() {
    for (const name in this.map) {
      if (Object.prototype.hasOwnProperty.call(this.map, name)) {
        yield [this.map[name].name, this.map[name].value];
      }
    }
  }
}
