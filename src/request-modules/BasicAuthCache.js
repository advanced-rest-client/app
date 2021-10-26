import { HeadersParser } from '../lib/headers/HeadersParser.js';

/** @typedef {import('@advanced-rest-client/events').ArcRequest.ArcBaseRequest} ArcBaseRequest */
/** @typedef {import('@advanced-rest-client/events').FormTypes.FormItem} FormItem */
/** @typedef {import('@advanced-rest-client/events').Authorization.NtlmAuthorization} NtlmAuthorization */
/** @typedef {import('@advanced-rest-client/events').Authorization.BasicAuthorization} BasicAuthorization */

const cache = {};

/**
 * Removes query parameters and the fragment part from the URL
 * @param {string} url URL to process
 * @return {string} Canonical URL.
 */
export function computeUrlPath(url) {
  if (!url) {
    return '';
  }
  try {
    const u = new URL(url);
    u.hash = '';
    u.search = '';
    let result = u.toString();
    // polyfill library has some error and leaves '?#' if was set
    result = result.replace('?', '');
    result = result.replace('#', '');
    return result;
  } catch (e) {
    return url;
  }
}
/**
 * Finds an auth data for given `url`.
 *
 * @param {string} type Authorization type.
 * @param {string} url The URL of the request.
 * @return {BasicAuthorization|NtlmAuthorization|undefined} Auth data if exists in the cache.
 */
export function findCachedAuthData(type, url) {
  const key = computeUrlPath(url);
  if (!cache || !type || !key || !cache[type]) {
    return undefined;
  }
  return cache[type][key];
}

/**
 * Updates cached authorization data
 *
 * @param {string} type Authorization type.
 * @param {string} url The URL of the request.
 * @param {BasicAuthorization|NtlmAuthorization} value Auth data to set
 */
export function updateCache(type, url, value) {
  const key = computeUrlPath(url);
  if (!cache[type]) {
    cache[type] = {};
  }
  cache[type][key] = value;
}

/**
 * Applies the basic authorization data to the request.
 *
 * If the header value have changed then it fires `request-headers-changed` custom event.
 * It sets computed value of the readers to the event's detail object.
 *
 * @param {ArcBaseRequest} request The event's detail object. Changes made here will be propagated to
 * the event.
 * @param {Object} data The authorization data to apply.
 */
function applyRequestBasicAuthData(request, data) {
  let headers = HeadersParser.toJSON(request.headers || '');
  headers = /** @type FormItem[] */ (HeadersParser.replace(headers, 'authorization', `Basic ${data.hash}`));
  request.headers = HeadersParser.toString(headers);
}

/**
 * Applies the NTLM authorization data to the request.
 *
 * Because NTLM requires certain operations on a socket it's bot just about setting a headers
 * but whole NTLM configuration object.
 *
 * Applied the `auth` object to the event's `detail.auth` object.
 *
 * @param {ArcBaseRequest} request The event's detail object. Changes made here will be propagated to
 * the event.
 * @param {NtlmAuthorization} values The authorization data to apply.
 */
function applyRequestNtlmAuthData(request, values) {
  if (!Array.isArray(request.authorization)) {
    request.authorization = [];
  }
  let ntlm = request.authorization.find(((method) => method.type === 'ntlm'));
  if (!ntlm) {
    ntlm = {
      enabled: true,
      type: 'ntlm',
      config: {},
      valid: true,
    };
    request.authorization.push(ntlm);
  }
  ntlm.enabled = true;
  const cnf = /** @type NtlmAuthorization */ (ntlm.config);
  if (cnf.username) {
    return;
  }
  cnf.username = values.username;
  cnf.password = values.password;
  cnf.domain = values.domain;
}

/**
 * Adds basic authorization data to the request, when during this session basic auth was used
 * @param {ArcBaseRequest} request 
 */
export default function applyCachedBasicAuthData(request) {
  // Try to find an auth data for the URL. If has a match, apply it to the request
  let authData = findCachedAuthData('basic', request.url);
  if (authData) {
    applyRequestBasicAuthData(request, authData);
    return;
  }
  // Try NTLM
  authData = findCachedAuthData('ntlm', request.url);
  if (authData) {
    applyRequestNtlmAuthData(request, /** @type NtlmAuthorization */ (authData));
  }
}
