import { ApiTypes } from '@advanced-rest-client/events';

/**
 * Returns a string where all characters that are not valid for a URL
 * component have been escaped. The escaping of a character is done by
 * converting it into its UTF-8 encoding and then encoding each of the
 * resulting bytes as a %xx hexadecimal escape sequence.
 *
 * Note: this method will convert any space character into its escape
 * short form, '+' rather than %20. It should therefore only be used for
 * query-string parts.
 *
 * The following character sets are **not** escaped by this method:
 * - ASCII digits or letters
 * - ASCII punctuation characters: ```- _ . ! ~ * ' ( )</pre>```
 *
 * Notice that this method <em>does</em> encode the URL component delimiter
 * characters:<blockquote>
 *
 * ```
 * ; / ? : & = + $ , #
 * ```
 *
 * @param str A string containing invalid URL characters
 * @return a string with all invalid URL characters escaped
 */
export function encodeQueryString(str: string): string;

/**
 * Returns a string where all URL component escape sequences have been
 * converted back to their original character representations.
 *
 * Note: this method will convert the space character escape short form, '+',
 * into a space. It should therefore only be used for query-string parts.
 *
 * @param str string containing encoded URL component sequences
 * @return string with no encoded URL component encoded sequences
 */
export function decodeQueryString(str: string): string;

/**
 * Appends form data parameter to an array.
 * If the parameter already exists on the array it creates an array for
 * the value instead of appending the same parameter.
 *
 * @param array An array to append the parameter
 * @param name Name of the form data parameter
 * @param value Value of the form data parameter
 * @return Updated array
 */
export function appendArrayResult(array: ApiTypes.ApiType[], name: string, value: string): ApiTypes.ApiType[];

/**
 * Converts a string to an array with objects containing name and value keys
 * 
 * @param input An input string
 * @return An array of params with `name` and `value` keys.
 */
export function createParamsArray(input: string): ApiTypes.ApiType[];

/**
 * Parse input string to array of x-www-form-urlencoded form parameters.
 *
 * This function will not url-decode names and values. Please, use
 * `decodeUrlEncoded(createViewModel(str))` to create an array of decoded parameters.
 *
 * @param input A string of HTTP x-www-form-urlencoded parameters
 * @return An array of params with `name` and `value` keys.
 */
export function createViewModel(input: string): ApiTypes.ApiType[];

/**
 * URL encodes a value.
 *
 * @param value Value to encode. Either string or array of strings.
 * @return Encoded value. The same type as the input.
 */
export function encodeValue(value: string|string[]): string|string[];

/**
 * Parse input string as a payload param key or value.
 *
 * @param input An input to parse.
 */
export function paramValue(input: string): string

/**
 * Creates a form data string for a single item.
 * @param model The model with `name` and `value` properties.
 * @return Generated value string for x-www-form-urlencoded form.
 */
export function modelItemToFormDataString(model: ApiTypes.ApiType): string|undefined;

/**
 * Parse input array to string x-www-form-urlencoded.
 *
 * Note that this function doesn't encodes the name and value. Use
 * `formArrayToString(encodeUrlEncoded(arr))`
 * to create a encoded string from the array.
 *
 * @param arr Input array. Each element must contain an
 * object with `name` and `value` keys.
 * @return A parsed string of `name`=`value` pairs of the input objects.
 */
export function formArrayToString(arr: ApiTypes.ApiType[]): string

/**
 * Encode payload to x-www-form-urlencoded string.
 *
 * @param input An input data.
 */
export function encodeUrlEncoded(input: ApiTypes.ApiType[]|string): ApiTypes.ApiType[]|string

/**
 * URL decodes a value.
 *
 * @param value Value to decode. Either string or array of strings.
 * @return Decoded value. The same type as the input.
 */
export function decodeValue(value: ApiTypes.ApiType[]|string): ApiTypes.ApiType[]|string

/**
 * Decode x-www-form-urlencoded data.
 *
 * @param input An input data.
 */
export function decodeUrlEncoded(input: ApiTypes.ApiType[]|string): ApiTypes.ApiType[]|string;
