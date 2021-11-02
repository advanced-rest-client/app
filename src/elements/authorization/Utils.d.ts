import { Authorization } from '@advanced-rest-client/events';

export const METHOD_OAUTH2: string;
export const METHOD_OAUTH1: string;
export const METHOD_BASIC: string;
export const METHOD_BEARER: string;
export const METHOD_NTLM: string;
export const METHOD_DIGEST: string;
export const METHOD_OIDC: string;
export const CUSTOM_CREDENTIALS: string;

export const selectionHandler: symbol;
export const inputHandler: symbol;

/**
 * Normalizes type name to a string identifier.
 * It casts input to a string and lowercase it.
 *
 * @returns Normalized value.
 */
export declare function normalizeType(type: String): String;

/**
 * Gets credentials from sources if defined
 * @param clientIdValue
 * @param clientSecretValue
 * @param disabled
 * @param credentialsSource
 * @param selectedSource
 * @param grantType
 */
export declare function clientCredentials(clientIdValue: String, clientSecretValue: String, disabled: Boolean, credentialsSource: Array<Object>, selectedSource: String, grantType: String): {clientId: String, clientSecret: String, editable: Boolean}

/**
 * @param value The value to validate
 * @returns True if the redirect URI can be considered valid.
 */
export function validateRedirectUri(value: string): boolean;

/**
 * Generates client nonce.
 *
 * @return Generated nonce.
 */
export function generateCnonce(): string;
/**
 * Generates `state` parameter for the OAuth2 call.
 *
 * @return Generated state string.
 */
export function generateState(): string;
/**
 * When defined and the `url` is a relative path staring with `/` then it
 * adds base URI to the path and returns concatenated value.
 *
 * @param url The URL to process
 * @param baseUri Base URI to use.
 * @return The final URL value.
 */
export function readUrlValue(url: string, baseUri: string): string;

/**
 * Generates cryptographically significant random string.
 * @param size The size of the generated nonce.
 * @returns A nonce (number used once).
 */
export function nonceGenerator(size?: number): string;

export function selectNode(node: Element): void;
