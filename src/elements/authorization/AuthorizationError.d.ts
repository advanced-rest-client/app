/**
 * An object describing an error during the authorization process.
 */
export declare class AuthorizationError extends Error {
  code: string;
  state: string;
  interactive: boolean;

  /**
   * @param message The human readable message.
   * @param code The error code
   * @param state Used state parameter
   * @param interactive Whether the request was interactive.
   */
  constructor(message: string, code: string, state: string, interactive: boolean);
}

export declare class CodeError extends Error {
  code: string;
  /**
   * @param message The human readable message.
   * @param code The error code
   */
  constructor(message: string, code: string);
}
