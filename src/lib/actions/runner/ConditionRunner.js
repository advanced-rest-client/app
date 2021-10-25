
/** @typedef {import('@advanced-rest-client/events').Actions.OperatorEnum} OperatorEnum */

/**
 * Checks if values equal.
 * @param {string|any=} value Value to compare
 * @param {string|any=} condition Comparator value
 * @return {boolean} True if objects matches.
 */
export function isEqual(value, condition) {
  if (value === condition) {
    return true;
  }
  let valueTyped = value;
  let conditionTyped = condition;
  if (typeof value !== 'undefined') {
    valueTyped = String(value);
  }
  if (typeof condition !== 'undefined') {
    conditionTyped = String(condition);
  }
  const typedConditionNumber = Number(conditionTyped);
  if (!Number.isNaN(typedConditionNumber)) {
    conditionTyped = typedConditionNumber;
    valueTyped = Number(valueTyped);
  }
  return conditionTyped === valueTyped;
}

/**
 * Opposite of `isEqual()`.
 *
 * @param {string|any} value Value to compare
 * @param {string|any} condition Comparator value
 * @return {boolean} False if objects matches.
 */
export function isNotEqual(value, condition) {
  return !isEqual(value, condition);
}

/**
 * Checks if value is less than comparator.
 *
 * @param {string|any} value Value to compare
 * @param {string|any} condition Comparator value
 * @return {boolean} True if value is less than condition.
 */
export function isLessThan(value, condition) {
  const valueNumber = Number(value);
  if (Number.isNaN(valueNumber)) {
    return false;
  }
  const conditionNumber = Number(condition);
  if (Number.isNaN(conditionNumber)) {
    return false;
  }
  return valueNumber < conditionNumber;
}

/**
 * Checks if value is less than or equal to comparator.
 *
 * @param {string|any} value Value to compare
 * @param {string|any} condition Comparator value
 * @return {boolean} True if value is less than or equal to `condition`.
 */
export function isLessThanEqual(value, condition) {
  const valueNumber = Number(value);
  if (Number.isNaN(valueNumber)) {
    return false;
  }
  const conditionNumber = Number(condition);
  if (Number.isNaN(conditionNumber)) {
    return false;
  }
  return valueNumber <= conditionNumber;
}

/**
 * Checks if value is greater than comparator.
 *
 * @param {string|any} value Value to compare
 * @param {string|any} condition Comparator value
 * @return {boolean} True if value is greater than `condition`.
 */
export function isGreaterThan(value, condition) {
  const valueNumber = Number(value);
  if (Number.isNaN(valueNumber)) {
    return false;
  }
  const conditionNumber = Number(condition);
  if (Number.isNaN(conditionNumber)) {
    return false;
  }
  return valueNumber > conditionNumber;
}

/**
 * Checks if value is greater than or equal to comparator.
 *
 * @param {string|any} value Value to compare
 * @param {string|any} condition Comparator value
 * @return {boolean} True if value is greater than or equal to `condition`.
 */
export function isGreaterThanEqual(value, condition) {
  const valueNumber = Number(value);
  if (Number.isNaN(valueNumber)) {
    return false;
  }
  const conditionNumber = Number(condition);
  if (Number.isNaN(conditionNumber)) {
    return false;
  }
  return valueNumber >= conditionNumber;
}

/**
 * Checks if value contains the `condition`.
 * It works on strings, arrays and objects.
 *
 * @param {string|any} value Value to compare
 * @param {string|any} condition Comparator value
 * @return {boolean} True if value contains the `condition`.
 */
export function contains(value, condition) {
  if (!value) {
    return false;
  }
  if (typeof value === 'string') {
    return value.indexOf(condition) !== -1;
  }
  if (Array.isArray(value)) {
    if (!Number.isNaN(condition) && typeof condition !== 'number') {
      const result = value.indexOf(Number(condition));
      if (result !== -1) {
        return true;
      }
    }
    return value.indexOf(condition) !== -1;
  }
  if (typeof value !== 'object') {
    return false;
  }
  return condition in value;
}

/**
 * Checks if `value` can be tested against regular expression.
 *
 * @param {string|any} value Value to compare
 * @param {string|any} condition Comparator value - regex string.
 * @return {boolean} Value of calling `test()` function on string.
 */
export function isRegex(value, condition) {
  let re;
  try {
    re = new RegExp(condition, 'm');
  } catch (e) {
    return false;
  }
  const result = String(value);
  return re.test(result);
}

/**
 * Checks if given condition is satisfied by both value and operator.
 *
 * @param {any} value Value read from the response / request object
 * @param {OperatorEnum} operator Comparison term.
 * @param {string|number} condition Value to compare.
 * @return {boolean} True if the condition is satisfied and false otherwise.
 */
export function checkCondition(value, operator, condition) {
  switch (operator) {
    case 'equal':
      return isEqual(value, condition);
    case 'not-equal':
      return isNotEqual(value, condition);
    case 'greater-than':
      return isGreaterThan(value, condition);
    case 'greater-than-equal':
      return isGreaterThanEqual(value, condition);
    case 'less-than':
      return isLessThan(value, condition);
    case 'less-than-equal':
      return isLessThanEqual(value, condition);
    case 'contains':
      return contains(value, condition);
    case 'regex':
      return isRegex(value, condition);
    default:
      return false;
  }
}
