import { Part } from 'lit-html';

/** 
 * Ignores setting a property that is `undefined`.
 * 
 * This only works when setting properties.
 */
 export declare const ifProperty: (value: unknown) => (part: Part) => void;
