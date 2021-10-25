/**
 * Processes string value tokens.
 */
declare class EvalFunctions {
  /**
   * Calls `encodeURIComponent()` function on the first item of arguments array
   * @param args List of expression arguments
   * @return Encoded value
   * @throws {Error} When input has no value.
   */
  static EncodeURIComponent(args: string[]): string;

  /**
   * Calls `decodeURIComponent()` function on the first item of arguments array
   * @param args List of expression arguments
   * @return Decoded value
   * @throws {Error} When input has no value.
   */
  static DecodeURIComponent(args: string[]): string;

  /**
   * Calls the `btoa()` function on the first item on the arguments array
   * @param args List of expression arguments
   * @return Decoded value
   * @throws When input has no value.
   */
  static Btoa(args: string[]): string;

  /**
   * Calls the `atob()` function on the first item on the arguments array
   * @param args List of expression arguments
   * @return Decoded value
   * @throws When input has no value.
   */
  static Atob(args: string[]): string;
}

export { EvalFunctions };
