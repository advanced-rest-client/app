/* eslint-disable no-unused-vars */
/* eslint-disable class-methods-use-this */
import { EventTypes } from '@advanced-rest-client/events';
import { PlatformBindings } from './PlatformBindings.js';

/** @typedef {import('@advanced-rest-client/events').RestApiProcessFileEvent} RestApiProcessFileEvent */
/** @typedef {import('@advanced-rest-client/events').Amf.ApiParseResult} ApiParseResult */
/** @typedef {import('@advanced-rest-client/events').Amf.AmfServiceProcessingOptions} AmfServiceProcessingOptions */

/**
 * The base bindings for the API spec processing.
 */
export class ApiParserBindings extends PlatformBindings {
  async initialize() {
    window.addEventListener(EventTypes.Amf.processApiFile, this.processApiFileHandler.bind(this));
    window.addEventListener(EventTypes.Amf.processApiLink, this.processApiLinkHandler.bind(this));
    window.addEventListener(EventTypes.Amf.processBuffer, this.processBufferHandler.bind(this));
  }

  /**
   * @param {CustomEvent} e
   */
  processApiFileHandler(e) {
    if (e.defaultPrevented) {
      return;
    }
    e.preventDefault();
    const { file } = e.detail;
    e.detail.result = this.processApiFile(file);
  }

  /**
   * @param {CustomEvent} e
   */
  processApiLinkHandler(e) {
    if (e.defaultPrevented) {
      return;
    }
    e.preventDefault();
    const { url, mainFile, md5, packaging } = e.detail;
    e.detail.result = this.processApiLink(url, mainFile, md5, packaging);
  }

  /**
   * @param {CustomEvent} e
   */
  processBufferHandler(e) {
    if (e.defaultPrevented) {
      return;
    }
    e.preventDefault();
    const { buffer, opts, } = e.detail;
    e.detail.result = this.processBuffer(buffer, opts);
  }

  /**
   * Downloads the file and processes it as a zipped API project.
   *
   * @param {string} url API remote location.
   * @param {string=} mainFile API main file. If not set the program will try to find the best match.
   * @param {string=} md5 When set it will test data integrity with the MD5 hash
   * @param {string=} packaging Default to `zip`.
   * @return {Promise<ApiParseResult>} Promise resolved to the AMF json-ld model.
   */
  async processApiLink(url, mainFile, md5, packaging) {
    throw new Error('Not yet implemented');
  }

  /**
   * Parses API data to AMF model.
   * 
   * @param {Buffer} buffer Buffer created from API file.
   * @param {AmfServiceProcessingOptions=} opts Processing options
   * @return {Promise<ApiParseResult>} Promise resolved to the AMF json-ld model
   */
  async processBuffer(buffer, opts) {
    throw new Error('Not yet implemented');
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
    throw new Error('Not yet implemented');
  }

  /**
   * @param {string[]} candidates
   * @return {Promise<string|undefined>}
   */
  async selectApiMainFile(candidates) {
    throw new Error('Not yet implemented');
  }
}
