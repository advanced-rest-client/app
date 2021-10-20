import { PropertyPart, directive } from 'lit-html';

/** 
 * Ignores setting a property that is `undefined`.
 * 
 * This only works when setting properties.
 */
export const ifProperty = directive((value) => (part) => {
  if (value === undefined && part instanceof PropertyPart) {
    return;
  }
  part.setValue(value);
});
