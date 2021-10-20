/* eslint-disable no-plusplus */
/** @typedef {import('@advanced-rest-client/events/src/request/ArcResponse').TransformedPayload} TransformedPayload */
/**
 * Computes size in the nearest units
 * @param {number} bytes
 * @returns {string}
 */
export function bytesToSize(bytes, decimals = 2) {
  if (bytes === 0) {
    return '0 Bytes';
  }

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const result = parseFloat((bytes / k**i).toFixed(dm));
  return `${result} ${sizes[i]}`;
}

/**
 * @param {string|Buffer|ArrayBuffer|TransformedPayload} body The body 
 * @param {string=} charset The optional charset to use with the text decoder.
 * @returns {string}
 */
export function readBodyString(body, charset) {
  const type = typeof body;
  if (['string', 'boolean', 'undefined'].includes(type)) {
    return /** @type string */ (body);
  }
  let typed = /** @type Buffer|ArrayBuffer */(body);
  // don't remember. I think it's either Node's or ARC's property.
  // @ts-ignore
  if (typed && typed.type === 'Buffer') {
    // @ts-ignore
    typed = new Uint8Array(typed.data);
  }
  const decoder = new TextDecoder(charset);
  try {
    return decoder.decode(typed);
  } catch (e) {
    return '';
  }
}

/**
 * Computes charset value from the `content-type` header.
 * @param {string} contentType Content type header string
 * @return {string|undefined}
 */
export function computeCharset(contentType) {
  if (!contentType || typeof contentType !== 'string') {
    return undefined;
  }
  if (contentType.indexOf('charset') === -1) {
    return undefined;
  }
  const parts = contentType.split(';');
  for (let i = 0, len = parts.length; i < len; i++) {
    const part = parts[i].trim();
    const _tmp = part.split('=');
    if (_tmp[0] === 'charset') {
      return _tmp[1].trim();
    }
  }
  return undefined;
}

/**
 * Reads content-type header from the response headers.
 *
 * @param {string} headers Headers received from the server
 * @return {string[]} When present an array where first item is
 * the content type and second is charset value. Otherwise empty array.
 */
export function readContentType(headers) {
  if (!headers || typeof headers !== 'string') {
    return [];
  }
  const ctMatches = headers.match(/^\s*content-type\s*:\s*(.*)$/im);
  if (!ctMatches) {
    return [];
  }
  let mime = ctMatches[1];
  const charset = computeCharset(mime);
  const index = mime.indexOf(';');
  if (index !== -1) {
    mime = mime.substr(0, index);
  }
  return [mime, charset];
}
