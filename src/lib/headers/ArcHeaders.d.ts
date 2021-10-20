/**
 * ARC version of headers interface.
 * It supports ARC API.
 */
export declare class ArcHeaders {
  /**
   * Holds the values.
   */
  map: any;
  constructor(headers?: ArcHeaders|Headers|string|string[]|Object);

  /**
   * Adds value to existing header or creates new header
   */
  append(name: string, value: string): void;

  /**
   * Removes a header from the list of headers.
   * @param name Header name
   */
  delete(name: string): void;

  /**
   * Returns current value of the header
   * @param name Header name
   */
  get(name: string): string|undefined;

  /**
   * Checks if header exists.
   */
  has(name: string): boolean;

  /**
   * Creates new header. If header existed it replaces it's value.
   */
  set(name: string, value: string): void;

  /**
   * Executes the `callback` function for each item passing the item
   * as an argument.
   */
  forEach(callback: Function, thisArg?: any): void;

  /**
   * @returns Headers HTTP string
   */
  toString(): string

  /**
   * Iterates over keys.
   */
  keys(): IterableIterator<string>;

  /**
   * Iterates over values.
   */
  values(): IterableIterator<string>;

  /**
   * Iterates over headers.
   */
  entries(): IterableIterator<string[]>;

  /**
   * Iterates over headers.
   */
  [Symbol.iterator](): IterableIterator<string[]>;
}
