export declare interface UrlValueParserOptions {
  /**
   * A query string delimiter to use when processing query parameters.
   */
  queryDelimiter: string;
}

declare interface DataValues {
  /**
   * A protocol value in format `protocol` + ':'
   */
  protocol?: string;
  /**
   * The authority part of the URL value
   */
  host?: string;
  /**
   * Path part of the URL.
   */
  path?: string;
  /**
   * Anchor part of the URL.
   */
  anchor?: string;
  /**
   * Search part of the URL.
   */
  search?: string;
}
/**
 * Implements logic for parsing URL string.
 */
export declare class UrlValueParser {
  opts?: UrlValueParserOptions;
  __data: DataValues;

  constructor(opts?: UrlValueParserOptions);

  /**
   * Returns protocol value in format `protocol` + ':'
   *
   * @param value URL to parse.
   * @returns Value of the protocol or undefined if
   * value not set
   */
  _parseProtocol(value: string): string|undefined;

  /**
   * Gets a host value from the url.
   * It reads the whole authority value of given `value`. It doesn't parses it
   * to host, port and
   * credentials parts. For URL panel it's enough.
   *
   * @param value The URL to parse
   * @returns Value of the host or undefined.
   */
  _parseHost(value: string): string|undefined;

  /**
   * Parses the path part of the URL.
   *
   * @param value URL value
   * @returns Path part of the URL
   */
  _parsePath(value: string): string|undefined;

  /**
   * Returns query parameters string (without the '?' sign) as a whole.
   *
   * @param value The URL to parse
   * @returns Value of the search string or undefined.
   */
  _parseSearch(value: string): string|undefined;

  /**
   * Reads a value of the anchor (or hash) parameter without the `#` sign.
   *
   * @param value The URL to parse
   * @returns Value of the anchor (hash) or undefined.
   */
  _parseAnchor(value: string): string|undefined;

  /**
   * Returns an array of items where each item is an array where first
   * item is param name and second is it's value. Both always strings.
   *
   * @param search Parsed search parameter
   * @returns Always returns an array.
   */
  _parseSearchParams(search?: string): Array<string[]>;
}
