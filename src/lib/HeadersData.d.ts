export interface HeaderDefinition {
  /**
   * The header name
   */
  key: string;
  /**
   * Header description
   */
  desc: string;
  /**
   * Example value of the header
   */
  example: string;
  /**
   * Autocomplete values for the header.
   */
  autocomplete?: string[];
}

export interface StatusCodeDefinition {
  /**
   * The status code
   */
  key: number;
  /**
   * Status code message
   */
  label: string;
  /**
   * Description of the status code
   */
  desc: string;
}

export declare const requestHeaders: HeaderDefinition[];
export declare const responseHeaders: HeaderDefinition[];
export declare const statusCodes: StatusCodeDefinition[];
