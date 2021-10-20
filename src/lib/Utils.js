/** @typedef {import('@advanced-rest-client/events').UrlHistory.ARCUrlHistory} ARCUrlHistory */

/**
 * Generates default export name value.
 * @return {string}
 */
export function generateFileName() {
  const date = new Date();
  const day = date.getDate();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  return `arc-data-export-${day}-${month}-${year}.json`;
}

/**
 * Returns a string where all characters that are not valid for a URL
 * component have been escaped. The escaping of a character is done by
 * converting it into its UTF-8 encoding and then encoding each of the
 * resulting bytes as a %xx hexadecimal escape sequence.
 * <p>
 * Note: this method will convert any the space character into its escape
 * short form, '+' rather than %20. It should therefore only be used for
 * query-string parts.
 *
 * <p>
 * The following character sets are <em>not</em> escaped by this method:
 * <ul>
 * <li>ASCII digits or letters</li>
 * <li>ASCII punctuation characters:
 *
 * <pre>- _ . ! ~ * ' ( )</pre>
 * </li>
 * </ul>
 * </p>
 *
 * <p>
 * Notice that this method <em>does</em> encode the URL component delimiter
 * characters:<blockquote>
 *
 * <pre>
 * ; / ? : &amp; = + $ , #
 * </pre>
 *
 * </blockquote>
 * </p>
 *
 * @param {string} str A string containing invalid URL characters
 * @param {boolean} replacePlus When set it replaces `%20` with `+`.
 * @return {string} a string with all invalid URL characters escaped
 */
export function encodeQueryString(str, replacePlus) {
  if (!str) {
    return str;
  }
  // normalize
  let result = str.toString().replace(/\r?\n/g, "\r\n");
  // encode
  result = encodeURIComponent(result);
  if (replacePlus) {
    // replace "%20" with "+" when needed
    result = result.replace(/%20/g, "+");
  }
  return result;
}

/**
 * Returns a string where all URL component escape sequences have been
 * converted back to their original character representations.
 *
 * Note: this method will convert the space character escape short form, '+',
 * into a space. It should therefore only be used for query-string parts.
 *
 * @param {string} str string containing encoded URL component sequences
 * @param {boolean} replacePlus When set it replaces `+` with `%20`.
 * @return {string} string with no encoded URL component encoded sequences
 */
export function decodeQueryString(str, replacePlus) {
  if (!str) {
    return str;
  }
  let result = str;
  if (replacePlus) {
    result = str.replace(/\+/g, "%20");
  }
  return decodeURIComponent(result);
}

/**
 * @param {Event} e
 */
export function cancelEvent(e) {
  e.preventDefault();
  e.stopImmediatePropagation();
  e.stopPropagation();
}

/**
 * Lists the suggestions lists before rendering.
 * @param {ARCUrlHistory[]} list
 * @param {string} query
 */
export function sortUrls(list, query) {
  list.sort((a, b) => {
    const lowerA = a.url.toLowerCase();
    const lowerB = b.url.toLowerCase();
    const aIndex = lowerA.indexOf(query);
    const bIndex = lowerB.indexOf(query);
    if (aIndex === bIndex) {
      return a.url.localeCompare(b.url);
    }
    if (aIndex === 0 && bIndex !== 0) {
      return -1;
    }
    if (bIndex === 0 && aIndex !== 0) {
      return 1;
    }
    if (a.url > b.url) {
      return 1;
    }
    if (a.url < b.url) {
      return -1;
    }
    return a.url.localeCompare(b.url);
  });
}
