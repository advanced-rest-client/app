/* eslint-disable class-methods-use-this */
import { DataExportBindings } from '../base/DataExportBindings.js';
import { verifyPermission } from './lib/NativeFilesystem.js';

/** @typedef {import('@advanced-rest-client/events').DataExport.ProviderOptions} ProviderOptions */
/** @typedef {import('@advanced-rest-client/events').DataExport.ArcExportResult} ArcExportResult */

export class DataExportBindingsWeb extends DataExportBindings {
  /**
   * Requests a save file dialog and saves the data to selected path if not cancelled.
   * This does nothing when dialog is canceled.
   *
   * @param {string|Buffer} contents Data to write
   * @param {ProviderOptions} options Export provider options
   * @return {Promise<ArcExportResult>}
   */
  async exportFileData(contents, options) {
    const fileRef = await this.pickFile();
    if (!fileRef) {
      return /** @type ArcExportResult */ ({
        interrupted: true,
        success: false,
      });
    }
    const granted = await verifyPermission(fileRef, true);
    if (!granted) {
      throw new Error(`No permission to write to the file.`);
    }
    const writable = await fileRef.createWritable();

    let data = contents;
    if (typeof data !== 'string' && options.contentType === 'application/json') {
      data = this.prepareData(data, options.contentType);
    }
    await writable.write(data);
    await writable.close();
    const { name } = fileRef;
    const result = /** @type ArcExportResult */ ({
      interrupted: false,
      success: true,
      fileId: name,
      parentId: undefined,
    });
    return result;
  }

  /**
   * Requests to pick a file for saving.
   * @returns {Promise<any>} The id of the picked file or undefined when cancelled.
   */
  async pickFile() {
    // @ts-ignore
    const handle = await window.showSaveFilePicker();
    if (!handle) {
      // action cancelled
      return undefined;
    }
    return handle;
  }
}
