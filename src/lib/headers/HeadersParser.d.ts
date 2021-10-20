import { FormTypes } from '@advanced-rest-client/events';

export declare class HeadersParser {
  /**
   * Filter array of headers and return not duplicated array of the same headers.
   * Duplicated headers should be appended to already found one using coma separator.
   *
   * @param input Headers list to filter.
   * @returns An array of filtered headers.
   */
  static unique(input: FormTypes.FormItem[]): FormTypes.FormItem[];

  /**
   * Parse HTTP headers input from string to array of objects containing `name` and `value`
   * properties.
   *
   * @param headers Raw HTTP headers input or Headers object
   * @return List of parsed headers
   */
  static toJSON(headers: string|Headers|FormTypes.FormItem[]|Object): FormTypes.FormItem[];

  /**
   * Parse headers string to array of objects.
   * See `#toJSON` for more info.
   *
   * @param headerString Headers string to process.
   * @returns List of parsed headers
   */
  static stringToJSON(headerString: string): FormTypes.FormItem[];

  /**
   * Parse Headers object to array of objects.
   * See `#toJSON` for more info.
   */
  static headersToJSON(input: Headers|object): FormTypes.FormItem[]

  /**
   * Transforms a header model item to a string.
   * Array values are supported.
   *
   * @param header Object with name and value.
   * @return Generated headers line
   */
  static itemToString(header: FormTypes.FormItem): string;

  /**
   * Parse headers array to Raw HTTP headers string.
   *
   * @param input List of `Header`s
   * @return A HTTP representation of the headers.
   */
  static toString(input: FormTypes.FormItem[]|String|Headers): string;

  /**
   * finds and returns the value of the Content-Type value header.
   *
   * @param input Either HTTP headers string or list of headers.
   * @return A content-type header value or null if not found
   */
  static contentType(input: FormTypes.FormItem[]|Headers|string): string;

  /**
   * Replace value for given header in the headers list.
   *
   * @param input A headers to process. Can be string,
   * array of internal definition of headers or an instance of the Headers object.
   * @param name Header name to be replaced.
   * @param value Header value to be repleted.
   * @returns Updated headers.
   */
  static replace(input: Headers|FormTypes.FormItem[]|string, name: string, value: string): Headers|FormTypes.FormItem[]|string;
  /**
   * Get error message for given header string.
   * @param input A headers to check.
   * @param isPayload Whether current request can have payload message.
   * @returns An error message or null if the headers are valid.
   */
  static getError(input: Headers|FormTypes.FormItem[]|string, isPayload?: boolean): string|null;
}
