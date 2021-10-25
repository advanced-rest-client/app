/**
 * Deeply clones an object
 * https://www.measurethat.net/Benchmarks/ShowResult/25487
 * 
 * @param {any} obj 
 * @returns {object}
 */
export function recursiveDeepCopy(obj) {
  return Object.keys(obj).reduce(
    (v, d) =>
      Object.assign(v, {
        [d]: obj[d].constructor === Object ? recursiveDeepCopy(obj[d]) : obj[d],
      }),
    {}
  );
}