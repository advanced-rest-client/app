export interface AmfServiceProcessingOptions {
  /**
   * When true it treats the source as a zip data. Files are unzipped to a temporary location before processing.
   */
  zip?: boolean;
  /**
   * When true it validates the API when parsing.
   * 
   * Validation is made in the `parse` phase and results (as string) are stored in the `validationResult` property of the service.
   */
  validate?: boolean;
  /**
   * The main file to use, if known
   */
  mainFile?: string;
}

export interface ApiSearchCandidate {
  /**
   * Absolute path to the file
   */
  absolute: string;
  /**
   * Relative path to the file
   */
  relative: string;
}

export interface ApiSearchTypeResult {
  /**
   * API type
   */
  type: string;
  /**
   * File media type
   */
  contentType: string;
}

export interface ApiParseResult {
  /**
   * The parsed API
   */
  model: string;
  /**
   * Api type info
   */
  type: ApiSearchTypeResult;
}
