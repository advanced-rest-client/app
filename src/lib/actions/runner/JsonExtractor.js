/* eslint-disable class-methods-use-this */
import { ActionIterableObject } from './ActionIterableObject.js';
import * as ConditionRunner from './ConditionRunner.js';

/** @typedef {import('@advanced-rest-client/events').Actions.IteratorConfiguration} IteratorConfiguration */

/* eslint-disable no-plusplus */
/* eslint-disable no-continue */

/**
 * Class responsible for extracting data from JSON values.
 */
export class JsonExtractor {
  /**
   * @constructor
   * @param {string|object|any[]} json JSON string or object. Strings are parsed to objects.
   * @param {string[]|string} path Path to the data.
   * @param {IteratorConfiguration=} iterator Data iterator
   */
  constructor(json, path, iterator) {
    /**
     * JS object or array.
     */
    this._data = this._processJson(json);
    let pathTyped = path;
    if (typeof path === 'string') {
      pathTyped = path.split('.');
    }
    this._path = /** @type string[] */ (pathTyped);
    this._iterator = new ActionIterableObject(iterator);
  }

  /**
   * Processes input JSON data and returns Array or Object. It returns
   * `undefined` if the data are empty, falsy or a primitive (except for JSON
   * strings).
   *
   * @param {string|object|any[]} data Data to process
   * @return {any[]|object|undefined} JS object or undefined if conversion  wasn't possible.
   */
  _processJson(data) {
    if (!data) {
      return undefined;
    }

    switch (typeof data) {
      case 'number':
      case 'boolean':
        return undefined;
      case 'string':
        try {
          return JSON.parse(data);
        } catch (e) {
          return undefined;
        }
      default:
        return data;
    }
  }

  /**
   * Extracts the data for given conditions.
   *
   * @return {string|undefined} Data found for given conditions.
   */
  extract() {
    const path = Array.from(this._path);
    if (this._iterator.valid) {
      let obj;
      if (this._iterator.path.includes('*')) {
        obj = this._getValue(this._data, Array.from(this._iterator.path));
      } else {
        obj = this._getValue(this._data, path);
      }
      if (!obj) {
        return undefined;
      }
      return this._getValue(obj, path);
    }
    return this._getValue(this._data, path);
  }

  /**
   * Reads a value of an JSON object for given path.
   *
   * @param {Object|Array} json JSON value to read
   * @param {String[]} path Path to search for the value.
   * @param {ActionIterableObject=} iterableOptions Instance of ActionIterableObject
   * @return {string|undefined} Value for given path.
   */
  _getValue(json, path, iterableOptions) {
    if (!json || typeof json !== 'object') {
      return json;
    }
    if (iterableOptions) {
      return this._getIterableValue(json, path, iterableOptions);
    }
    let part = /** @type string|number */ (path.shift());
    if (!part) {
      return json;
    }
    if (part === '*') {
      const it = this._iterator;
      return this._getValue(json, path, it);
    }
    let isNumber = false;
    const typedNumber = Number(part);
    if (!Number.isNaN(typedNumber)) {
      isNumber = true;
      part = typedNumber;
    }
    if (Array.isArray(json) && !isNumber && !iterableOptions) {
      return undefined;
    }
    return this._getValue(json[part], path, iterableOptions);
  }

  // _getValueWithIterator() {

  // }

  /**
   * Searches for a value in iterable object.
   *
   * @param {Object|any[]} json Iterable object
   * @param {String[]} path Path for the value
   * @param {ActionIterableObject} iterable Instance of ActionIterableObject
   * @return {Object|undefined} Object that matches iterable condition
   * or undefined if none matches the condition.
   */
  _getIterableValue(json, path, iterable) {
    const pathCopy = Array.from(path);
    if (Array.isArray(json)) {
      if (iterable.path.includes('*')) {
        // this is the old weird system with unnatural paths
        return this._getIterableValueArray(json, pathCopy, iterable);
      }
      return this._getIterableValueArray(json, iterable.path, iterable);
    }
    if (iterable.path.includes('*')) {
      return this._getIterableValueObject(json, pathCopy, iterable);
    }
    return this._getIterableValueObject(json, iterable.path, iterable);
  }

  /**
   * Searches for a value in Array.
   *
   * @param {Object|Array} json Iterable object
   * @param {Array<String>} path Path for the value
   * @param {ActionIterableObject} iterable Instance of ActionIterableObject
   * @return {Object|undefined} Object that matches iterable condition
   * or undefined if none matches the condition.
   */
  _getIterableValueArray(json, path, iterable) {
    const { operator, condition } = iterable;
    for (let i = 0, len = json.length; i < len; i++) {
      const item = json[i];
      const copy = Array.from(path);
      const value = this._getValue(item, copy);
      if (!value) {
        continue;
      }
      if (ConditionRunner.checkCondition(value, operator, condition)) {
        return json[i];
      }
    }
    return undefined;
  }

  /**
   * Searches for a value in JS Object.
   *
   * @param {Object|any[]} json Iterable object
   * @param {string[]} path Path for the value
   * @param {ActionIterableObject} iterable Instance of ActionIterableObject
   * @return {Object|undefined} Object that matches iterable condition
   * or undefined if none matches the condition.
   */
  _getIterableValueObject(json, path, iterable) {
    const type = typeof json;
    if (!json || type === 'string' || type === 'number') {
      return undefined;
    }
    const { operator, condition } = iterable;
    const keys = Object.keys(json);
    for (let i = 0, len = keys.length; i < len; i++) {
      const copy = Array.from(path);
      const item = {};
      item[keys[i]] = json[keys[i]];
      const value = this._getValue(item, copy);
      if (!value) {
        continue;
      }
      if (ConditionRunner.checkCondition(value, operator, condition)) {
        return json;
      }
    }
    return undefined;
  }
}
