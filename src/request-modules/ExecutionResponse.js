const ExecutionResponse = {
  /**
   * The actions has executed with success
   */
  OK: 0,
  /**
   * The actions has executed with success, but the request or response must abort now.
   */
  ABORT: 1,
}

export default Object.freeze(ExecutionResponse);
