/**
 * A property decorator that converts a class property into a getter that
 * executes a querySelector on the document.
 *
 * @param selector A DOMString containing one or more selectors to match.
 * @param cache An optional boolean which when true performs the DOM query only
 *     once and caches the result.
 *
 * See: https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector
 *
 * ```ts
 * class Page {
 *   @query('#first')
 *   first;
 *
 *   render() {
 *     return html`
 *       <div id="first"></div>
 *       <div id="second"></div>
 *     `;
 *   }
 * }
 * ```
 */
export default function query(selector: string, cache?: boolean) {
  return (protoOrDescriptor: any, name: PropertyKey): any => {
    if (cache) {
      const key = typeof name === 'symbol' ? Symbol('') : `__${name}`;
      Object.defineProperty(protoOrDescriptor, name, {
        get() {
          if (!this[key]) {
            this[key] = document.querySelector(selector) ?? null;
          }
          return this[key];
        },
      });
    } else {
      Object.defineProperty(protoOrDescriptor, name, {
        get() {
          return document.querySelector(selector) ?? null;
        },
      });
    }
  };
}
