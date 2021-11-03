/* eslint-disable no-unused-vars */
/* eslint-disable class-methods-use-this */
import { EventTypes } from '@advanced-rest-client/events';
import { PlatformBindings } from './PlatformBindings.js';

/** @typedef {import('@advanced-rest-client/events').ArcExportFilesystemEvent} ArcExportFilesystemEvent */
/** @typedef {import('@advanced-rest-client/events').DataExport.ProviderOptions} ProviderOptions */
/** @typedef {import('@advanced-rest-client/events').DataExport.ArcExportResult} ArcExportResult */

/**
 * General bindings for the data export logic.
 * Data export is exporting any kind of data (string, object, binary) to a file.
 */
export class DataExportBindings extends PlatformBindings {
  async initialize() {
    window.addEventListener(EventTypes.DataExport.fileSave, this.fileSaveHandler.bind(this));
  }

  /**
   * @param {ArcExportFilesystemEvent} e
   */
  fileSaveHandler(e) {
    if (e.defaultPrevented) {
      return;
    }
    e.preventDefault();
    const { data, providerOptions } = e;
    e.detail.result = this.exportFileData(data, providerOptions);
  }

  /**
   * Requests a save file dialog and saves the data to selected path if not cancelled.
   * This does nothing when dialog is canceled.
   *
   * @param {string|Buffer} content Data to write
   * @param {ProviderOptions} options Export provider options
   * @return {Promise<ArcExportResult>}
   */
  async exportFileData(content, options) {
    throw new Error(`File export is not implemented`);
  }

  /**
   * @param {any} data
   * @param {string} mime
   * @return {string} 
   */
  prepareData(data, mime) {
    switch (mime) {
      case 'application/json': return JSON.stringify(data);
      default: return String(data);
    }
  }
}
