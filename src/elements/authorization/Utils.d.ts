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
 * Checks if the URL has valid scheme for OAuth flow.
 *
 * @param url The url value to test
 * @throws {TypeError} When passed value is not set, empty, or not a string
 * @throws {Error} When passed value is not a valid URL for OAuth 2 flow
 */
export function checkUrl(url: string): void;

/**
 * Checks if basic configuration of the OAuth 2 request is valid an can proceed
 * with authentication.
 * @param settings authorization settings
 */
export function sanityCheck(settings: Authorization.OAuth2Authorization): void;

/**
 * Generates a random string of characters.
 *
 * @returns A random string.
 */
export function randomString(): string;

/**
 * Replaces `-` or `_` with camel case.
 * @param name The string to process
 * @return Camel cased string or `undefined` if not transformed.
 */
export function camel(name: string): string|undefined;

/**
 * Computes the SHA256 hash ogf the given input.
 * @param value The value to encode.
 */
export function sha256(value: string): Promise<ArrayBuffer>;

/**
 * Encoded the array buffer to a base64 string value.
 */
export function base64Buffer(buffer: ArrayBuffer): string;

/**
 * Generates code challenge for the PKCE extension to the OAuth2 specification.
 * @param verifier The generated code verifier.
 * @returns The code challenge string
 */
export function generateCodeChallenge(verifier: string): Promise<string>;

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
