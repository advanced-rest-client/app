import AuthorizationMethod from './AuthorizationMethodElement';
export {validateBasicAuth};

/**
 * Validates basic authorization form.
 *
 * @returns Validation result
 */
declare function validateBasicAuth(element: AuthorizationMethod): boolean|null;

export {validateBearerAuth};
/**
 * Validates bearer authorization form.
 *
 * @returns Validation result
 */
declare function validateBearerAuth(element: AuthorizationMethod): boolean;

export {validateNtlmAuth};

/**
 * Validates NTLM authorization form.
 *
 * @returns Validation result
 */
declare function validateNtlmAuth(element: AuthorizationMethod): boolean|null;

export {validateDigestAuth};


/**
 * Validates digest authorization form.
 *
 * @returns Validation result
 */
declare function validateDigestAuth(element: AuthorizationMethod): boolean|null;

export {validateOauth1Auth};


/**
 * Validates OAuth1 authorization form.
 *
 * @returns Validation result
 */
declare function validateOauth1Auth(element: AuthorizationMethod): boolean|null;

export {validateOauth2AuthImplicit};


/**
 * Validates OAuth2 authorization form with implicit grant type.
 *
 * @returns Validation result
 */
declare function validateOauth2AuthImplicit(element: AuthorizationMethod): boolean|null;

export {validateOauth2AuthCode};


/**
 * Validates OAuth2 authorization form with authorization code grant type.
 *
 * @returns Validation result
 */
declare function validateOauth2AuthCode(element: AuthorizationMethod): boolean|null;

export {validateOauth2AuthCredentials};


/**
 * Validates OAuth2 authorization form with client credentials grant type.
 *
 * @returns Validation result
 */
declare function validateOauth2AuthCredentials(element: AuthorizationMethod): boolean|null;

export {validateOauth2AuthPassword};


/**
 * Validates OAuth2 authorization form with password grant type.
 *
 * @returns Validation result
 */
declare function validateOauth2AuthPassword(element: AuthorizationMethod): boolean|null;

export {validateOauth2AuthCustom};


/**
 * Validates OAuth2 authorization form with custom grant type.
 *
 * @returns Validation result
 */
declare function validateOauth2AuthCustom(element: AuthorizationMethod): boolean|null;

export {validateOauth2form};


/**
 * Validates the form controls instead of values. This also shows validation
 * errors.
 * Note, this uses form-associated custom elements API. At this moment (Nov 2019)
 * it is only available in CHrome 77. FF is implementing it and Edge will be
 * Chome soon.
 *
 * @returns True if the form is valid.
 */
declare function validateOauth2form(form: HTMLFormElement): boolean|null;

export {validateOauth2Auth};


/**
 * Validates OAuth2 authorization form.
 *
 * @returns Validation result
 */
declare function validateOauth2Auth(element: AuthorizationMethod|null): boolean|null;

export {validateForm};


/**
 * Validates current authorization type
 *
 * @returns Validation result
 */
declare function validateForm(element: AuthorizationMethod|null): boolean|null;
