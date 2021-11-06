import { set } from 'idb-keyval';
import { v4 } from '@advanced-rest-client/uuid';
import { ApiParserBindings, Route } from '../../index.js';
import { aTimeout } from '../../src/lib/Utils.js';
import env from '../env.js';
import '../../define/api-entrypoint-selector.js';

/** @typedef {import('@advanced-rest-client/events').Amf.ApiParseResult} ApiParseResult */
/** @typedef {import('@advanced-rest-client/events').Amf.AmfServiceProcessingOptions} AmfServiceProcessingOptions */

/**
 * This is bindings class for API parsing for the demo page.
 * This process is so complex and nuanced that we can't build a single class for all.
 * 
 * ARC has its implementation in the `arc-electron` code. The other tools and apps must build own 
 * implementation.
 * 
 * Suggestion: Take a look into the https://github.com/api-components/amf-web-api project.
 * It has a library that spins off a server that parses an API project with AMF parser.
 */
export class DemoApiParserBindings extends ApiParserBindings {
  /**
   * Downloads the file and processes it as a zipped API project.
   *
   * @param {string} url API remote location.
   * @param {string=} mainFile API main file. If not set the program will try to find the best match.
   * @param {string=} hash When set it will test data integrity with the MD5 hash
   * @return {Promise<ApiParseResult>} Promise resolved to the AMF json-ld model.
   */
  async processApiLink(url, mainFile, hash) {
    try {
      const buffer = await this.downloadApiProject(url);
      this.checkIntegrity(buffer, hash);
      const result = await this.processBuffer(buffer, { mainFile });
      this.loading = false;
      return result;
    } catch (cause) {
      this.loading = false;
      throw cause;
    }
  }

  /**
   * Parses API data to AMF model.
   * 
   * @param {ArrayBuffer} buffer Buffer created from API file.
   * @param {AmfServiceProcessingOptions=} opts Processing options
   * @return {Promise<ApiParseResult>} Promise resolved to the AMF json-ld model
   */
  async processBuffer(buffer, opts) {
    const { mainFile='' } = opts;
    const base = this.getApiServiceBaseUri();
    const url = `${base}/file`;
    const response = await fetch(url, {
      body: buffer,
      method: 'POST',
      headers: {
        'Content-Type': 'application/zip',
        'x-entrypoint': mainFile,
      },
    });
    const body = await response.json();
    if (response.status !== 201) {
      throw new Error(body.message || 'Unable to communicate with the API parser service.');
    }
    const { location } = body;
    if (!location) {
      throw new Error(`The API parsing service returned unexpected value.`);
    }
    return this.readAndProcessParsingResult(location);
  }

  /**
   * Processes file data.
   * If the blob is a type of `application/zip` it processes the file as a
   * zip file. Otherwise it processes it as a file.
   *
   * @param {File|Blob} file File to process.
   * @return {Promise<ApiParseResult>} Promise resolved to the AMF json-ld model
   */
  async processApiFile(file) {
    const base = this.getApiServiceBaseUri();
    const url = `${base}/file`;
    const response = await fetch(url, {
      body: file,
      method: 'POST',
      headers: {
        'Content-Type': file.type || 'application/zip',
      },
    });
    const body = await response.json();
    if (response.status !== 201) {
      throw new Error(body.message || 'Unable to communicate with the API parser service.');
    }
    const { location } = body;
    if (!location) {
      throw new Error(`The API parsing service returned unexpected value.`);
    }
    return this.readAndProcessParsingResult(location);
  }

  /**
   * @param {string[]} candidates
   * @return {Promise<string|undefined>}
   */
  async selectApiMainFile(candidates) {
    const dialog = document.createElement('api-entrypoint-selector');
    dialog.files = candidates;
    document.body.appendChild(dialog);
    dialog.opened = true;
    dialog.modal = true;
    return new Promise((resolve) => {
      dialog.addEventListener('closed', 
        /** @param {CustomEvent} e */
        (e) => {
          if (e.detail.canceled || !e.detail.confirmed) {
            resolve(undefined);
          } else {
            resolve(dialog.selected);
          }
      });
    });
  }
  
  /**
   * Checks for Exchange file integrity, using passed md5 hash.
   * @param {ArrayBuffer} buffer File's buffer
   * @param {string} hash File's hash
   * @returns {ArrayBuffer}
   * @throws {Error} When computed md5 sum is not valid.
   */
  checkIntegrity(buffer, hash) {
    if (!hash) {
      return buffer;
    }
    // @todo: md5 the buffer and compare the hash.
    return buffer;
  }

  /**
   * @returns {string} The base URI of the API service.
   */
  getApiServiceBaseUri() {
    const { amfService } = env;
    const url = new URL(`${window.location.protocol}//${window.location.host}${amfService.path}`);
    return url.toString();
  }

  /**
   * Makes a query to the AMF service for the parsing result. When ready it either returns 
   * the value or pics the API main file.
   * 
   * This function is made to be called recursively until one of the expected status codes are returned.
   * 
   * @param {string} url The current URL to query.
   * @returns {Promise<ApiParseResult|undefined>}
   */
  async readAndProcessParsingResult(url) {
    const response = await fetch(url);
    if (response.status === 200) {
      const model = await response.json();
      const result = /** @type ApiParseResult */ ({
        model,
        type: {
          type: response.headers.get('x-api-vendor'),
          contentType: '',
        },
      });
      return result;
    }
    if (response.status === 204) {
      const location = response.headers.get('location');
      await aTimeout(250);
      return this.readAndProcessParsingResult(location);
    }
    if (response.status === 300) {
      const location = response.headers.get('location');
      const body = await response.json();
      const mainFile = await this.selectApiMainFile(body.files);
      if (!mainFile) {
        return undefined;
      }
      const updateResponse = await fetch(location, {
        method: 'PUT',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({ entrypoint: mainFile }),
      });
      if (updateResponse.status === 200) {
        return this.readAndProcessParsingResult(updateResponse.headers.get('location'));
      }
      throw new Error(`The API parsing service returned unexpected response ${updateResponse.status}`);
    }
    const body = await response.json();
    throw new Error(body.message || 'Unable to communicate with the API parser service.');
  }

  /**
   * @param {File|Blob} file File to process.
   * @returns {Promise<any>}
   */
  async legacyProcessApiFile(file) {
    const result = await this.processApiFile(file);
    const key = v4();
    await set(key, result);
    Route.navigatePage('api-console.html', 'open', 'file', key);
  }
}
