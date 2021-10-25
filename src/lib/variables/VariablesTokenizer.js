/**
 * Processes string value tokens.
 */
export class VariablesTokenizer {
  /**
   * @param {String} value The value to process
   */
  constructor(value) {
    this.value = value;
    this.index = 0;
  }

  /**
   * @return {string} The next character
   */
  next() {
    const { index } = this;
    const char = this.value[index];
    this.index = index + 1;
    return char;
  }

  /**
   * Consumes characters until specified character is encountered.
   * @param {string} char The search stop character
   * @return {string|null} The remaining value from the string or null.
   */
  nextUntil(char) {
    let result = '';
    const test = true;
    while (test) {
      const ch = this.next();
      if (ch === undefined) {
        return null;
      }
      if (ch === char) {
        return result;
      }
      result += ch;
    }
    return null;
  }

  /**
   * Reads the string from current position until the end and sets the index to the end.
   * @return {string} The string from current position until end.
   */
  eof() {
    const { index, value } = this;
    const result = value.substr(index);
    this.index = value.length;
    return result;
  }
}
