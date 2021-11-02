/* eslint-disable no-param-reassign */
/** @typedef {import('@advanced-rest-client/events').Authorization.OAuth2Authorization} OAuth2Settings */

/**
 * Normalizes type name to a string identifier.
 * It casts input to a string and lowercase it.
 * @param {string} type Type value
 * @return {string} Normalized value.
 */
export const normalizeType = (type) => {
  if (!type) {
    return undefined;
  }
  return String(type).toLowerCase();
};

export const METHOD_BASIC = "basic";
export const METHOD_BEARER = "bearer";
export const METHOD_NTLM = "ntlm";
export const METHOD_DIGEST = "digest";
export const METHOD_OAUTH1 = "oauth 1";
export const METHOD_OAUTH2 = "oauth 2";
export const METHOD_OIDC = "open id";
export const CUSTOM_CREDENTIALS = "Custom credentials";

export const selectionHandler = Symbol("selectionHandler");
export const inputHandler = Symbol("inputHandler");

/**
 * @param {string} value The value to validate
 * @returns {boolean} True if the redirect URI can be considered valid.
 */
export function validateRedirectUri(value) {
  let result = true;
  if (!value || typeof value !== 'string') {
    result = false;
  }
  // the redirect URI can have any value, especially for installed apps which 
  // may use custom schemes. We do vary basic sanity check for any script content 
  // validation to make sure we are not passing any script.
  // eslint-disable-next-line no-script-url
  if (result && value.includes('javascript:')) {
    result = false;
  }
  return result;
}

/**
 * Generates client nonce for Digest authorization.
 *
 * @return {string} Generated client nonce.
 */
export function generateCnonce() {
  const characters = 'abcdef0123456789';
  let token = '';
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < 16; i++) {
    const randNum = Math.round(Math.random() * characters.length);
    token += characters.substr(randNum, 1);
  }
  return token;
}

/**
 * Generates `state` parameter for the OAuth2 call.
 *
 * @return {string} Generated state string.
 */
export function generateState() {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < 6; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

/**
 * When defined and the `url` is a relative path staring with `/` then it
 * adds base URI to the path and returns concatenated value.
 *
 * @param {string} url The URL to process
 * @param {string} baseUri Base URI to use.
 * @return {string} Final URL value.
 */
export function readUrlValue(url, baseUri) {
  if (!url || !baseUri) {
    return url;
  }
  url = String(url);
  if (url[0] === '/') {
    let uri = baseUri;
    if (uri[uri.length - 1] === '/') {
      uri = uri.substr(0, uri.length - 1);
    }
    return `${uri}${url}`;
  }
  return url;
}

/**
 * @param {Element} node
 */
export function selectNode(node) {
  const { body } = document;
  // @ts-ignore
  if (body.createTextRange) {
    // @ts-ignore
    const range = body.createTextRange();
    range.moveToElementText(node);
    range.select();
  } else if (window.getSelection) {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNode(node);
    selection.removeAllRanges();
    selection.addRange(range);
  }
};
