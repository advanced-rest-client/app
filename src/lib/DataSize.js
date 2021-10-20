/* eslint-disable no-plusplus */
/** @typedef {import('@advanced-rest-client/events').ArcResponse.TransformedPayload} TransformedPayload */

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
 * Calculates size of the string
 * @param {string} str A string to compute size from.
 * @returns {number} Size of the string.
 */
export function calculateBytes(str) {
  if (!str || !str.length || typeof str !== 'string') {
    return 0;
  }
  let s = str.length;
  for (let i = str.length - 1; i >= 0; i--) {
    const code = str.charCodeAt(i);
    if (code > 0x7f && code <= 0x7ff) {
      s++;
    } else if (code > 0x7ff && code <= 0xffff) {
      /* istanbul ignore next */
      s += 2;
    }
    /* istanbul ignore if */
    if (code >= 0xDC00 && code <= 0xDFFF) {
      i--; // trail surrogate
    }
  }
  return s;
}

/**
 * @param {FormData} data The size of the form data
 * @returns {Promise<number>} The size of the form data
 */
export async function computeFormDataSize(data) {
  const request = new Request('/', {
    method: 'POST',
    body: data,
  });
  if (!request.arrayBuffer) {
    return 0;
  }
  const buffer = await request.arrayBuffer();
  return buffer.byteLength;
}

/**
 * Computes size of the payload.
 *
 * @param {ArrayBuffer|Blob|File|String|FormData|TransformedPayload} payload The payload
 * @returns {Promise<number>} The size of the payload
 */
export async function computePayloadSize(payload) {
  if (!payload) {
    return 0;
  }
  if (payload instanceof ArrayBuffer) {
    return payload.byteLength;
  } 
  if (payload instanceof Blob) {
    return payload.size;
  }
  if (payload instanceof FormData) {
    return computeFormDataSize(payload);
  }
  return calculateBytes(String(payload));
}
