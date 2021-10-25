import { ActionIterableObject } from './ActionIterableObject.js';

/* eslint-disable no-plusplus */

/**
 * Reads attribute value for current path.
 *
 * @param {Element|Document} dom DOM element object
 * @param {String} part Current part of the path.
 * @return {String|undefined} Returned value for path or undefined
 * if not found.
 */
const valueForAttr = (dom, part) => {
  if (dom.nodeType !== Node.ELEMENT_NODE) {
    return undefined;
  }
  const match = part.match(/attr\((.+)\)/);
  if (!match) {
    return undefined;
  }
  const attrName = match[1];
  const target = /** @type Element */ (dom);
  if (!target.hasAttribute(attrName)) {
    return undefined;
  }
  const attrValue = target.getAttribute(attrName);
  return attrValue;
};

/**
 * Gets a value for the XML document for given path.
 *
 * @param {Element|Document} dom DOM document.
 * @param {Array<String>} path Path to search for the value.
 * @return {String|undefined} Value for given path.
 */
function getXmlValue(dom, path) {
  const part = path.shift();
  if (!dom) {
    return undefined;
  }
  if (!part) {
    // @ts-ignore
    return (dom.innerHTML || dom.textContent).trim();
  }
  if (part.trim().indexOf('attr(') === 0) {
    return valueForAttr(dom, part);
  }
  let nextPart = /** @type any */ (path[0]);
  let selector = part;
  const typedPart = Number(nextPart);
  if (Number.isInteger(typedPart)) {
    nextPart = typedPart;
    nextPart++;
    selector += `:nth-child(${nextPart})`;
    path.shift();
  }
  return getXmlValue(dom.querySelector(selector), path);
}

/**
 * A helper class to extract data from an XML response.
 */
export class XmlExtractor {
  /**
   * @constructor
   * @param {String} xml XML string.
   * @param {Array<string>|string} path Path to the data.
   * @param {?Object} iterator Data iterator
   */
  constructor(xml, path, iterator) {
    /**
     * JS object or array.
     */
    this._data = xml;
    let tmp = path;
    if (typeof tmp === 'string') {
      tmp = /** @type string */ (path).split('.');
    }
    this._path = /** @type string[] */ (path);
    this._iterator = new ActionIterableObject(iterator);
  }

  /**
   * Gets a value of the XML type string for given path.
   *
   * @return {String|undefined} Value for given path.
   */
  extract() {
    const parser = new DOMParser();
    const dom = parser.parseFromString(this._data, 'text/xml');
    if (dom.querySelector('parsererror')) {
      return undefined;
    }
    return getXmlValue(dom, this._path);
  }
}
