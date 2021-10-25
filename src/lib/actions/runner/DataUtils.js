import { HeadersParser } from '../../headers/HeadersParser.js';
import { JsonExtractor } from './JsonExtractor.js';
import { XmlExtractor } from './XmlExtractor.js';

/** @typedef {import('@advanced-rest-client/events').Actions.IteratorConfiguration} IteratorConfiguration */

/* eslint-disable no-plusplus */

/**
 * @param {string|Buffer|ArrayBuffer|File|Blob|FormData} body The body 
 * @returns {string|undefined}
 */
export function readBodyString(body) {
  if (body instanceof File || body instanceof Blob || body instanceof FormData) {
    return undefined;
  }
  const type = typeof body;
  if (['string', 'boolean', 'undefined'].includes(type)) {
    return String(body);
  }
  let typed = /** @type Buffer|ArrayBuffer */(body);
  // don't remember. I think it's either Node's or ARC's property.
  // @ts-ignore
  if (typed && typed.type === 'Buffer') {
    // @ts-ignore
    typed = new Uint8Array(typed.data);
  }
  const decoder = new TextDecoder();
  try {
    return decoder.decode(typed);
  } catch (e) {
    return '';
  }
}


/**
 * Gets a value from a text for current path. Path is part of the
 * configuration object passed to the constructor.
 *
 * @param {string | File | Blob | Buffer | ArrayBuffer | FormData} data Payload value.
 * @param {string} ct Body content type.
 * @param {string[]} path Remaining path to follow
 * @param {IteratorConfiguration=} iterator Iterator model
 * @return {string|undefined} Value for given path.
 */
export function getPayloadValue(data, ct, path, iterator) {
  if (!data) {
    return undefined;
  }
  if (!path || !path.length) {
    return String(data);
  }
  const typedData = readBodyString(data);
  if (!typedData) {
    return typedData;
  }
  if (ct.includes('application/json')) {
    const extractor = new JsonExtractor(typedData, path, iterator);
    return extractor.extract();
  }
  if (ct.includes('/xml') || ct.includes('+xml') || ct.startsWith('text/html')) {
    const extractor = new XmlExtractor(typedData, path, iterator);
    return extractor.extract();
  }
  return undefined;
}

/**
 * Reads value of the URL query parameters.
 *
 * The `?` at the beginning of the query string is removed.
 *
 * @param {URL} url The URL object instance
 * @param {string=} param Param name to return. If not set then it returns  whole query string value.
 * @return {string} Full query string value if `param` is not set or paramter
 * value. This function does not returns `null` values.
 */
export function readUrlQueryValue(url, param) {
  if (!param) {
    let v = url.search || '';
    if (v[0] === '?') {
      v = v.substr(1);
    }
    return v;
  }
  let value = url.searchParams.get(param);
  if (!value && value !== '') {
    value = undefined;
  }
  return value;
}

/**
 * Reads value of the URL hash.
 *
 * The `#` at the beginning of the hash string is removed.
 *
 * If the `param` argument is set then it treats hahs value as a query
 * parameters string and parses it to get the value.
 *
 * @param {URL} url The URL object instance
 * @param {string=} param Param name to return. If not set then it returns whole hash string value.
 * @return {string} Hash parameter or whole hash value.
 */
export function readUrlHashValue(url, param) {
  let value = (url.hash || '').substr(1);
  if (!param) {
    return value;
  }
  const obj = new URLSearchParams(value);
  value = obj.get(param);
  if (!value && value !== '') {
    value = undefined;
  }
  return value;
}

/**
 * Returns the value for path for given source object
 *
 * @param {string} url An url to parse.
 * @param {string[]} path Path to the data
 * @return {String|URLSearchParams|Number} Value for the path.
 */
export function getDataUrl(url, path) {
  if (!path || path.length === 0 || !url) {
    return url;
  }
  const value = new URL(url);
  switch (path[0]) {
    case 'host':
      return value.host;
    case 'protocol':
      return value.protocol;
    case 'path':
      return value.pathname;
    case 'query':
      return readUrlQueryValue(value, path[1]);
    case 'hash':
      return readUrlHashValue(value, path[1]);
    default:
      throw new Error(`Unknown path in the URL: ${path}`);
  }
}

/**
 * Returns a value for the headers.
 *
 * @param {string} source HTTP headers string
 * @param {string[]} path Path to the object
 * @return {string|undefined} Value for the path.
 */
export function getDataHeaders(source, path) {
  const headers = HeadersParser.toJSON(source);
  if (!path || !path.length || !path[0] || !headers || !headers.length) {
    return source;
  }
  const lowerName = path[0].toLowerCase();
  for (let i = 0, len = headers.length; i < len; i++) {
    if (headers[i].name.toLowerCase() === lowerName) {
      return /** @type string */ (headers[i].value);
    }
  }
  return undefined;
}

/**
 * Returns a value for the payload field.
 *
 * @param {string | File | Blob | Buffer | ArrayBuffer | FormData} payload The payload in the original form
 * @param {string} headers The associated with the payload headers
 * @param {string[]} path Path to the object
 * @param {IteratorConfiguration=} iterator Iterator model. Used only with response body.
 * @return {String} Value for the path.
 */
export function getDataPayload(payload, headers, path, iterator) {
  const ct = HeadersParser.contentType(headers);
  if (!ct) {
    return undefined;
  }
  return getPayloadValue(payload, ct, path, iterator);
}
