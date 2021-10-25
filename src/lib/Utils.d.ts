import { UrlHistory } from '@advanced-rest-client/events';

/**
 * Generates default export name value.
 * @return {string}
 */
export declare function generateFileName(): string;

/**
 * Returns a string where all characters that are not valid for a URL
 * component have been escaped. The escaping of a character is done by
 * converting it into its UTF-8 encoding and then encoding each of the
 * resulting bytes as a %xx hexadecimal escape sequence.
 * <p>
 * Note: this method will convert any the space character into its escape
 * short form, '+' rather than %20. It should therefore only be used for
 * query-string parts.
 *
 * <p>
 * The following character sets are <em>not</em> escaped by this method:
 * <ul>
 * <li>ASCII digits or letters</li>
 * <li>ASCII punctuation characters:
 *
 * <pre>- _ . ! ~ * ' ( )</pre>
 * </li>
 * </ul>
 * </p>
 *
 * <p>
 * Notice that this method <em>does</em> encode the URL component delimiter
 * characters:<blockquote>
 *
 * <pre>
 * ; / ? : &amp; = + $ , #
 * </pre>
 *
 * </blockquote>
 * </p>
 *
 * @param str A string containing invalid URL characters
 * @param replacePlus When set it replaces `%20` with `+`.
 * @return a string with all invalid URL characters escaped
 */
export function encodeQueryString(str: string, replacePlus: boolean): string;

/**
 * Returns a string where all URL component escape sequences have been
 * converted back to their original character representations.
 *
 * Note: this method will convert the space character escape short form, '+',
 * into a space. It should therefore only be used for query-string parts.
 *
 * @param str string containing encoded URL component sequences
 * @param replacePlus When set it replaces `+` with `%20`.
 * @return string with no encoded URL component encoded sequences
 */
export function decodeQueryString(str: string, replacePlus: boolean): string;

/**
 * Cancels an event
 */
export declare function cancelEvent(e: Event): void;

/**
 * Lists the suggestions lists before rendering.
 */
export declare function sortUrls(list: UrlHistory.ARCUrlHistory[], query: string): void;

/**
 * Computes value for a variable label depending on value of `maskedValues`.
 *
 * @param value Variable value
 * @param maskedValues True to masks the value.
 * @return When `maskedValues` is true then it returns series of `•`.
 * The input otherwise.
 */
export function variableValueLabel(value: string, maskedValues: boolean): string;
