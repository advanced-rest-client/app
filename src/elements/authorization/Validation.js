import {
  normalizeType,
  METHOD_BASIC,
  METHOD_BEARER,
  METHOD_NTLM,
  METHOD_DIGEST,
  METHOD_OAUTH1,
  METHOD_OAUTH2,
} from './Utils.js';
import * as KnownGrants from '../../lib/KnownGrants.js';

/** @typedef {import('./AuthorizationMethodElement').default} AuthorizationMethod */
/** @typedef {import('@anypoint-web-components/awc').AnypointInputElement} AnypointInput */

/**
 * Validates basic authorization form.
 * @param {AuthorizationMethod} element An instance of the element.
 * @return {Boolean} Validation result
 */
export const validateBasicAuth = (element) => {
  const { username } = element;
  return !!username;
};

/**
 * Validates bearer authorization form.
 * @param {AuthorizationMethod} element An instance of the element.
 * @return {Boolean} Validation result
 */
export const validateBearerAuth = (element) => {
  const { token } = element;
  return !!token;
};

/**
 * Validates NTLM authorization form.
 * @param {AuthorizationMethod} element An instance of the element.
 * @return {Boolean} Validation result
 */
export const validateNtlmAuth = (element) => {
  const { username } = element;
  return !!username;
};

/**
 * Validates digest authorization form.
 * @param {AuthorizationMethod} element An instance of the element.
 * @return {Boolean} Validation result
 */
export const validateDigestAuth = (element) => {
  const { username, realm, nonce, nc, opaque, cnonce } = element;
  return !!username && !!realm && !!nonce && !!nc && !!opaque && !!cnonce;
};

/**
 * Validates OAuth1 authorization form.
 * @param {AuthorizationMethod} element An instance of the element.
 * @return {Boolean} Validation result
 */
export const validateOauth1Auth = (element) => {
  const {
    authTokenMethod,
    authParamsLocation,
    timestamp,
    nonce,
    signatureMethod,
    consumerKey,
  } = element;
  return (
    !!authTokenMethod &&
    !!authParamsLocation &&
    !!timestamp &&
    !!nonce &&
    !!signatureMethod &&
    !!consumerKey
  );
};

/**
 * Validates OAuth2 authorization form with implicit grant type.
 * @param {AuthorizationMethod} element An instance of the element.
 * @return {Boolean} Validation result
 */
export const validateOauth2AuthImplicit = (element) => {
  const { clientId, authorizationUri } = element;
  return !!clientId && !!authorizationUri;
};

/**
 * Validates OAuth2 authorization form with authorization code grant type.
 * @param {AuthorizationMethod} element An instance of the element.
 * @return {Boolean} Validation result
 */
export const validateOauth2AuthCode = (element) => {
  const { clientId, clientSecret, authorizationUri, accessTokenUri } = element;
  return !!clientId && !!authorizationUri && !!clientSecret && !!accessTokenUri;
};

/**
 * Validates OAuth2 authorization form with client credentials grant type.
 * @param {AuthorizationMethod} element An instance of the element.
 * @return {Boolean} Validation result
 */
export const validateOauth2AuthCredentials = (element) => {
  const { accessTokenUri } = element;
  return !!accessTokenUri;
};

/**
 * Validates OAuth2 authorization form with password grant type.
 * @param {AuthorizationMethod} element An instance of the element.
 * @return {Boolean} Validation result
 */
export const validateOauth2AuthPassword = (element) => {
  const { accessTokenUri, username, password } = element;
  return !!accessTokenUri && !!password && !!username;
};

/**
 * Validates OAuth2 authorization form with password grant type.
 * @param {AuthorizationMethod} element An instance of the element.
 * @return {Boolean} Validation result
 */
export const validateOauth2JwtBearer = (element) => {
  const { accessTokenUri, assertion } = element;
  return !!accessTokenUri && !!assertion;
};

/**
 * Validates OAuth2 authorization form with password grant type.
 * @param {AuthorizationMethod} element An instance of the element.
 * @return {Boolean} Validation result
 */
export const validateOauth2DeviceCode = (element) => {
  const { accessTokenUri, deviceCode } = element;
  return !!accessTokenUri && !!deviceCode;
};

/**
 * Validates OAuth2 authorization form with custom grant type.
 * @param {AuthorizationMethod} element An instance of the element.
 * @return {Boolean} Validation result
 */
export const validateOauth2AuthCustom = (element) => {
  const { accessTokenUri } = element;
  return !!accessTokenUri;
};
/**
 * Validates the form controls instead of values. This also shows validation
 * errors.
 * Note, this uses form-associated custom elements API. At this moment (Nov 2019)
 * it is only available in CHrome 77. FF is implementing it and Edge will be soon.
 *
 * @param {HTMLFormElement} form The form to validate
 * @return {Boolean} True if the form is valid.
 */
export const validateOauth2form = (form) => {
  const invalid = /** @type {AnypointInput[]} */ (Array.from(
    form.elements
  )).some((node) => {
    if (!node.validate) {
      return true;
    }
    return !node.validate();
  });
  return !invalid;
};

/**
 * Validates OAuth2 authorization form.
 * @param {AuthorizationMethod} element An instance of the element.
 * @return {Boolean} Validation result
 */
export const validateOauth2Auth = (element) => {
  const { grantType } = element;
  if (!grantType) {
    return false;
  }
  const form = element.shadowRoot.querySelector('form');
  if (form && form.elements.length) {
    return validateOauth2form(form);
  }
  switch (grantType) {
    case KnownGrants.implicit:
      return validateOauth2AuthImplicit(element);
    case KnownGrants.code:
      return validateOauth2AuthCode(element);
    case KnownGrants.clientCredentials:
      return validateOauth2AuthCredentials(element);
    case KnownGrants.password:
      return validateOauth2AuthPassword(element);
    case KnownGrants.jwtBearer:
      return validateOauth2JwtBearer(element);
    case KnownGrants.deviceCode:
      return validateOauth2DeviceCode(element);
    default:
      return validateOauth2AuthCustom(element);
  }
};

/**
 * Validates current authorization type
 * @param {AuthorizationMethod} element An instance of the element.
 * @return {Boolean} Validation result
 */
export const validateForm = (element) => {
  const type = normalizeType(element.type);
  switch (type) {
    case METHOD_BASIC:
      return validateBasicAuth(element);
    case METHOD_BEARER:
      return validateBearerAuth(element);
    case METHOD_NTLM:
      return validateNtlmAuth(element);
    case METHOD_DIGEST:
      return validateDigestAuth(element);
    case METHOD_OAUTH1:
      return validateOauth1Auth(element);
    case METHOD_OAUTH2:
      return validateOauth2Auth(element);
    default:
      return true;
  }
};
