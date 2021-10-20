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
 * Checks if the URL has valid scheme for OAuth flow.
 * 
 * Do not use this to validate redirect URIs as they can use any protocol.
 *
 * @param {string} url The url value to test
 * @throws {TypeError} When passed value is not set, empty, or not a string
 * @throws {Error} When passed value is not a valid URL for OAuth 2 flow
 */
export function checkUrl(url) {
  if (!url) {
    throw new TypeError("the value is missing");
  }
  if (typeof url !== "string") {
    throw new TypeError("the value is not a string");
  }
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    throw new Error("the value has invalid scheme");
  }
}

/**
 * Checks if basic configuration of the OAuth 2 request is valid an can proceed
 * with authentication.
 * @param {OAuth2Settings} settings authorization settings
 * @throws {Error} When settings are not valid
 */
export function sanityCheck(settings) {
  if (["implicit", "authorization_code"].includes(settings.grantType)) {
    try {
      checkUrl(settings.authorizationUri);
    } catch (e) {
      throw new Error(`authorizationUri: ${e.message}`);
    }
    if (settings.accessTokenUri) {
      try {
        checkUrl(settings.accessTokenUri);
      } catch (e) {
        throw new Error(`accessTokenUri: ${e.message}`);
      }
    }
  } else if (settings.accessTokenUri) {
    try {
      checkUrl(settings.accessTokenUri);
    } catch (e) {
      throw new Error(`accessTokenUri: ${e.message}`);
    }
  }
}

/**
 * Generates a random string of characters.
 *
 * @returns {string} A random string.
 */
export function randomString() {
  const array = new Uint32Array(28);
  window.crypto.getRandomValues(array);
  return Array.from(array, (dec) => `0${dec.toString(16)}`.substr(-2)).join("");
}

/**
 * Replaces `-` or `_` with camel case.
 * @param {string} name The string to process
 * @return {String|undefined} Camel cased string or `undefined` if not transformed.
 */
export function camel(name) {
  let i = 0;
  let l;
  let changed = false;
  // eslint-disable-next-line no-cond-assign
  while ((l = name[i])) {
    if ((l === "_" || l === "-") && i + 1 < name.length) {
      // eslint-disable-next-line no-param-reassign
      name = name.substr(0, i) + name[i + 1].toUpperCase() + name.substr(i + 2);
      changed = true;
    }
    // eslint-disable-next-line no-plusplus
    i++;
  }
  return changed ? name : undefined;
}

/**
 * Computes the SHA256 hash ogf the given input.
 * @param {string} value The value to encode.
 * @returns {Promise<ArrayBuffer>}
 */
export async function sha256(value) {
  const encoder = new TextEncoder();
  const data = encoder.encode(value);
  return window.crypto.subtle.digest("SHA-256", data);
}

/**
 * Encoded the array buffer to a base64 string value.
 * @param {ArrayBuffer} buffer
 * @returns
 */
export function base64Buffer(buffer) {
  return btoa(String.fromCharCode.apply(null, new Uint8Array(buffer))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Generates code challenge for the PKCE extension to the OAuth2 specification.
 * @param {string} verifier The generated code verifier.
 * @returns {Promise<string>} The code challenge string
 */
export async function generateCodeChallenge(verifier) {
  const hashed = await sha256(verifier);
  return base64Buffer(hashed);
}

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
 * Generates cryptographically significant random string.
 * @param {number=} [size=20] The size of the generated nonce.
 * @returns {string} A nonce (number used once).
 */
export function nonceGenerator(size=20) {
  const validChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let array = new Uint8Array(size);
  window.crypto.getRandomValues(array);
  array = array.map(x => validChars.charCodeAt(x % validChars.length));
  return String.fromCharCode.apply(null, array);
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
