import { UrlValueParser, UrlValueParserOptions } from './UrlValueParser';

/**
 * A class to parse URL string.
 */
export declare class UrlParser extends UrlValueParser {
  constructor(value: string, opts?: UrlValueParserOptions);

  /**
   * The protocol value in format `protocol` + ':' or `undefined` if
   * value not set.
   */
  protocol?: string;

  /**
   * The authority part of the URL value. It doesn't parses it to host, port and credentials parts.
   */
  host?: string;

  /**
   * The path part of the URL.
   */
  path?: string;

  /**
   * Returns anchor part of the URL.
   *
   * @return {String|undefined} Value of the anchor or undefined if
   * value not set
   */
  anchor?: string;

  /**
   * The search part of the URL.
   */
  search?: string;

  /**
   * The URL value. It is the same as calling `toString()`.
   */
  value?: string;

  /**
   * An array of search params.
   *
   * List of search params. Each item contains an
   * array when first item is name of the parameter and second item is the
   * value.
   */
  searchParams?: Array<string[]>;

  /**
   * Returns the URL for current settings.
   *
   * @returns URL value.
   */
  toString(): string;
}
