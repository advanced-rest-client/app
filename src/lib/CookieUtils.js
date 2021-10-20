/** @typedef {import('./Cookie').Cookie} Cookie */
/** @typedef {import('@advanced-rest-client/events').Cookies.ARCCookie} ARCCookie */

/**
 * Query filter function for cookies
 * @param {ARCCookie[]} items The cookies
 * @param {string} query The query term
 * @return {ARCCookie[]} Filtered cookies
 */
 export function filterItems(items, query) {
  return items.filter((item) => {
    if (item.name) {
      if (item.name.toLowerCase().indexOf(query) !== -1) {
        return true;
      }
    }
    if (item.domain) {
      if (item.domain.toLowerCase().indexOf(query) !== -1) {
        return true;
      }
    }
    if (item.value) {
      if (item.value.toLowerCase().indexOf(query) !== -1) {
        return true;
      }
    }
    if (item.path) {
      if (item.path.toLowerCase().indexOf(query) !== -1) {
        return true;
      }
    }
    return false;
  });
}

/**
 * Compares two cookies.
 * Cookies are the same if `domain`, `path` and `name` matches.
 *
 * @param {ARCCookie} a A cookie to compare
 * @param {ARCCookie} b Other cookie to compare
 * @return {Boolean} True if the two cookies are the same.
 */
export function compareCookies(a, b) {
  if (a.domain !== b.domain) {
    return false;
  }
  if (a.path !== b.path) {
    return false;
  }
  if (a.name !== b.name) {
    return false;
  }
  return true;
}

/**
 * Computes value for `twoLines` property.
 * @param {string=} listType Selected list type.
 * @return {boolean}
 */
export function computeHasTwoLines(listType) {
  if (!listType || listType === 'default') {
    return true;
  }
  return false;
}

/**
 * Applies `--anypoint-item-icon-width` variable.
 *
 * @param {number} size Icon width in pixels.
 * @param {HTMLElement} target The target to apply the styling
 */
export function applyListStyles(size, target) {
  const value = `${size}px`;
  target.style.setProperty('--anypoint-item-icon-width', value);
  // @ts-ignore
  if (target.notifyResize) {
    // @ts-ignore
    target.notifyResize();
  }
}

/**
 * Generates file name for the export options panel.
 * @return {string}
 */
export function generateExportFileName() {
  const d = new Date();
  const year = d.getFullYear();
  let month = d.getMonth() + 1;
  let day = d.getDate();
  if (month < 10) {
    // @ts-ignore
    month = `0${month}`;
  }
  if (day < 10) {
    // @ts-ignore
    day = `0${day}`;
  }
  return `arc-cookies-export-${year}-${month}-${day}.arc`;
}

/**
 * Gets the path for a domain as defined in
 * https://tools.ietf.org/html/rfc6265#section-5.1.4
 *
 * @param {string} urlValue A url to extract path from.
 * @return {string}
 */
export function getPath(urlValue) {
  let url = urlValue;
  const defaultValue = '/';
  if (!url) {
    return defaultValue;
  }
  let index = url.indexOf('/', 8); // after `http(s)://` string
  if (index === -1) {
    return defaultValue;
  }
  url = url.substr(index);
  if (!url || url[0] !== '/') {
    return defaultValue;
  }
  // removed query string
  index = url.indexOf('?');
  if (index !== -1) {
    url = url.substr(0, index);
  }
  // removes hash string
  index = url.indexOf('#');
  if (index !== -1) {
    url = url.substr(0, index);
  }
  index = url.indexOf('/', 1);
  if (index === -1) {
    return defaultValue;
  }
  index = url.lastIndexOf('/');
  if (index !== 0) {
    url = url.substr(0, index);
  }
  return url;
}

/**
 * Checks if `domain` of the request url (defined as `this.url`)
 * matches domain defined in a cookie.
 * This follows algorithm defined in https://tools.ietf.org/html/rfc6265#section-5.1.3
 *
 * Note: If `cookieDomain` is not set it returns false, while
 * (according to the spec) it should be set to `domain` and pass the test.
 * Because this function only check if domains matches it will not
 * override domain.
 * Cookie domain should be filled before calling this function.
 *
 * Note: This function will return false if the `this.url` was not set.
 *
 * @param {string} cookieDomain A domain received in the cookie.
 * @param {URL} uri
 * @return {boolean} True if domains matches.
 */
export function matchesDomain(cookieDomain, uri) {
  if (!uri) {
    return false;
  }
  let domain = uri.hostname;
  domain = domain && domain.toLowerCase && domain.toLowerCase();
  // eslint-disable-next-line no-param-reassign
  cookieDomain =
    cookieDomain && cookieDomain.toLowerCase && cookieDomain.toLowerCase();
  if (!cookieDomain) {
    return false;
  }
  if (domain === cookieDomain) {
    return true;
  }
  if (cookieDomain[0] === '.') {
    const parts = domain.split('.');
    if (parts.length > 1) {
      parts.shift();
      domain = parts.join('.');
    }
  }
  const index = cookieDomain.indexOf(domain);
  if (index === -1) {
    return false;
  }
  if (cookieDomain.substr(index - 1, index) !== '.') {
    return false;
  }
  return true;
}

/**
 * Checks if paths mach as defined in
 * https://tools.ietf.org/html/rfc6265#section-5.1.4
 *
 * Note: This function will return false if the `this.url` was not set.
 *
 * @param {string} cookiePath Path from the cookie.
 * @param {URL} uri
 * @param {string} url
 * @return {boolean} True when paths matches.
 */
export function matchesPath(cookiePath, uri, url) {
  if (!uri) {
    return false;
  }
  if (!cookiePath) {
    return true;
  }
  const hostPath = getPath(url);
  if (hostPath === cookiePath) {
    return true;
  }
  // const index = cookiePath.indexOf(hostPath);
  const index = hostPath.indexOf(cookiePath);
  if (index === 0 && cookiePath[cookiePath.length - 1] === '/') {
    return true;
  }
  if (index === 0 && cookiePath.indexOf('/', 1) === -1) {
    return true;
  }

  if (index === 0) {
    // eslint-disable-next-line no-plusplus
    for (let i = 0, len = hostPath.length; i < len; i++) {
      if (cookiePath.indexOf(hostPath[i]) === -1 && hostPath[i] === '/') {
        return true;
      }
    }
  }
  return false;
}

/**
 * Clients must fill `path` and `domain` attribute if not set by the
 * server to match current request url.
 *
 * @param {URL} uri HTTP request url parsed by the URL class.
 * @param {string} url The HTTP request url.
 * @param {Cookie[]} cookies Parsed cookies
 */
export function fillCookieAttributes(uri, url, cookies) {
  if (!uri) {
    return;
  }
  let domain = uri.hostname;
  if (!domain) {
    return;
  }
  domain = domain.toLowerCase();
  const path = getPath(url);
  cookies.forEach((cookie) => {
    if (!cookie.path) {
      // eslint-disable-next-line no-param-reassign
      cookie.path = path;
    }
    const cDomain = cookie.domain;
    if (!cDomain) {
      // eslint-disable-next-line no-param-reassign
      cookie.domain = domain;
      // point 6. of https://tools.ietf.org/html/rfc6265#section-5.3
      // eslint-disable-next-line no-param-reassign
      cookie.hostOnly = true;
    }
    return cookie;
  });
}
