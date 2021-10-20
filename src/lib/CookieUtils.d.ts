import { ARCCookie } from '@advanced-rest-client/events/src/cookies/Cookies';
import { Cookie as ArcCookie } from './Cookie';

/**
 * Query filter function for cookies
 * @param items The cookies
 * @param query The query term
 * @returns Filtered cookies
 */
export function filterItems(items: ARCCookie[], query: string): ARCCookie[];

/**
 * Compares two cookies.
 * Cookies are the same if `domain`, `path` and `name` matches.
 *
 * @param a A cookie to compare
 * @param b Other cookie to compare
 * @return True if the two cookies are the same.
 */
export function compareCookies(a: ARCCookie, b: ARCCookie): boolean;

/**
 * Computes value for `twoLines` property.
 * @param listType Selected list type.
 */
export function computeHasTwoLines(listType?: string): boolean;

/**
 * Applies `--anypoint-item-icon-width` variable.
 *
 * @param size Icon width in pixels.
 * @param target The target to apply the styling
 */
export function applyListStyles(size: number, target: HTMLElement): void;

/**
 * Generates file name for the export options panel.
 */
export function generateExportFileName(): string;

/**
 * Gets the path for a domain as defined in
 * https://tools.ietf.org/html/rfc6265#section-5.1.4
 *
 * @param urlValue A url to extract path from.
 */
export declare function getPath(urlValue: string): string;

/**
 * Checks if `domain` of the request url (defined as `this.url`)
 * matches domain defined in a cookie.
 * This follows algorithm defined in https://tools.ietf.org/html/rfc6265#section-5.1.3
 *
 * Note: If `cookieDomain` is not set it returns false, while
 * (according to the spec) it should be set to `domain` and pass the test.
 * Because this function only check if domains matches it will not
 * override domain.
 * Cookie domain should be filled before calling this function.
 *
 * Note: This function will return false if the `this.url` was not set.
 *
 * @param cookieDomain A domain received with the cookie.
 * @param uri HTTP request url parsed by the URL class.
 * @returns True if domains matches.
 */
export declare function matchesDomain(cookieDomain: string, uri: URL): boolean;

/**
 * Checks if paths mach as defined in
 * https://tools.ietf.org/html/rfc6265#section-5.1.4
 *
 * Note: This function will return false if the `this.url` was not set.
 *
 * @param cookiePath Path from the cookie.
 * @param uri HTTP request url parsed by the URL class.
 * @param url The HTTP request url.
 * @returns `true` when paths matches.
 */
export declare function matchesPath(cookiePath: string, uri: URL, url: string): boolean;

/**
 * Clients must fill `path` and `domain` attribute if not set by the
 * server to match current request url.
 *
 * @param uri HTTP request url parsed by the URL class.
 * @param url The HTTP request url.
 * @param cookies Parsed cookies
 */
export declare function fillCookieAttributes(uri: URL, url: string, cookies: ArcCookie[]): void;
