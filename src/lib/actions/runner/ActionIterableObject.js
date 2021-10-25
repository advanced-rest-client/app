/** @typedef {import('@advanced-rest-client/events').Actions.IteratorConfiguration} IteratorConfiguration */
/** @typedef {import('@advanced-rest-client/events').Actions.OperatorEnum} OperatorEnum */

/**
 * Validates passed options and sets `valid` flag.
 *
 * @param {IteratorConfiguration} opts Iterator options
 * @return {boolean} True when options are valid
 */
export function validate(opts) {
  if (!opts) {
    return false;
  }
  let valid = true;
  if (!opts.path) {
    valid = false;
  }
  if (valid && !opts.operator) {
    valid = false;
  }
  if (valid && !opts.condition) {
    valid = false;
  }
  if (valid) {
    const ops = /** @type OperatorEnum[] */ ([
      'equal',
      'not-equal',
      'greater-than',
      'greater-than-equal',
      'less-than',
      'less-than-equal',
      'contains',
      'regex',
    ]);
    if (!ops.includes(opts.operator)) {
      valid = false;
    }
  }
  return valid;
}

/**
 * Class responsible for extracting data from JSON values.
 */
export class ActionIterableObject {
  /**
   * @param {IteratorConfiguration} config Iterator options
   */
  constructor(config) {
    /**
     * Whether the configuration is valid or not.
     * @type {boolean}
     */
    this.valid = validate(config);
    if (!this.valid) {
      return;
    }
    const { path, operator, condition } = config;
    let src = /** @type any */ (path);
    if (typeof src === 'string') {
      src = src.split('.');
    }

    /**
     * Source of the data split by `.` character
     * @type {string[]}
     */
    this.path = src;

    /**
     * Comparison operator
     * @type {OperatorEnum}
     */
    this.operator = operator;
    /**
     * Comparison value
     * @type {string}
     */
    this.condition = condition;
  }
}
