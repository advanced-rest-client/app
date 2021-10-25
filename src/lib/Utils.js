/* eslint-disable no-plusplus */
/** @typedef {import('@advanced-rest-client/events').UrlHistory.ARCUrlHistory} ARCUrlHistory */
/** @typedef {import('@advanced-rest-client/events').ArcRequest.ARCSavedRequest} ARCSavedRequest */
/** @typedef {import('@advanced-rest-client/events').Project.ARCProject} ARCProject */
/** @typedef {import('../types').ListType} ListType */
/** @typedef {import('../types').ListLayout} ListLayout */

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

/**
 * Computes value for a variable label depending on value of `maskedValues`.
 *
 * @param {string} value Variable value
 * @param {boolean} maskedValues True to masks the value.
 * @return {string} When `maskedValues` is true then it returns series of `•`.
 * The input otherwise.
 */
export function variableValueLabel(value, maskedValues) {
  if (!value) {
    return '(empty)';
  }
  if (maskedValues) {
    const len = value.length;
    const arr = new Array(len);
    return arr.fill('•', 0, len).join('');
  }
  return value;
};

/**
 * Sort function used to sort projects in order.
 * @param {ARCProject} a
 * @param {ARCProject} b
 * @return {number}
 */
 export function projectsSortFn(a, b) {
  if (a.order > b.order) {
    return 1;
  }
  if (a.order < b.order) {
    return -1;
  }
  return 0;
}

/**
 * Sorts requests list by `projectOrder` property
 *
 * @param {any} a
 * @param {any} b
 * @return {number}
 */
export function projectLegacySort(a, b) {
  if (a.projectOrder > b.projectOrder) {
    return 1;
  }
  if (a.projectOrder < b.projectOrder) {
    return -1;
  }
  if (a.name > b.name) {
    return 1;
  }
  if (a.name < b.name) {
    return -1;
  }
  return 0;
}

/**
 * Sorts the query results by name
 *
 * @param {ARCSavedRequest} a
 * @param {ARCSavedRequest} b
 * @return {number}
 */
export function savedSort(a, b) {
  if (!a.name && !b.name) {
    return 0;
  }
  if (!a.name) {
    return -1;
  }
  if (!b.name) {
    return 1;
  }
  return a.name.localeCompare(b.name);
}

/**
 * Throws an error when type is not set.
 * @param {ListType} type Passed to the function type
 * @throws {Error} An error when the passed type is invalid.
 */
export function validateRequestType(type) {
  if (['project', 'history', 'saved'].indexOf(type) === -1) {
    throw new TypeError('The "type" property is not set.');
  }
}

/**
 * Tests if two arrays has the same order of ids (strings).
 * @param {Array<string>} a1 Array a
 * @param {Array<string>} a2 Array b
 * @return {Boolean} True when elements are ordered the same way.
 */
export function idsArrayEqual(a1, a2) {
  if (!a1 && !a2) {
    return true;
  }
  if (!a1 || !a2) {
    return false;
  }
  if (a1.length !== a2.length) {
    return false;
  }
  for (let i = 0, len = a1.length; i < len; i++) {
    if (a1[i] !== a2[i]) {
      return false;
    }
  }
  return true;
}


/**
 * Checks if requests is related to the project by project's id.
 * 
 * @param {ARCSavedRequest} request The request to test
 * @param {string} id Project id
 * @return {boolean}
 */
export function isProjectRequest(request, id) {
  if (!id) {
    return false;
  }
  const { projects } = request;
  if (Array.isArray(projects) && projects.includes(id)) {
    return true;
  }
  // @ts-ignore
  if (request.legacyProject === id) {
    return true;
  }
  return false;
}

 /**
  * Computes value for the `hasTwoLines` property.
  * 
  * @param {ListLayout} listType Selected list layout.
  * @return {boolean}
  */
export function hasTwoLines(listType) {
  if (!listType || listType === 'default') {
    return true;
  }
  return false;
}

/**
 * Creates a timestamp fot today, midnight
 * @return {number}
 */
export function midnightTimestamp() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now.getTime();
}

/**
 * Computes a proper key command depending on the platform.
 *
 * @param {string} key The key modifier for the command
 * @return {string} Keyboard command for the key.
 */
export function computeA11yCommand(key) {
  const isMac = navigator.platform.indexOf('Mac') !== -1;
  let cmd = '';
  if (isMac) {
    cmd += 'meta+';
  } else {
    cmd += 'ctrl+';
  }
  cmd += key;
  return cmd;
}
