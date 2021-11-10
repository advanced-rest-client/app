import { DataExport } from '@advanced-rest-client/events';
import { DataExportBindings } from '../base/DataExportBindings';

/** @typedef {import('@advanced-rest-client/events').DataExport.ProviderOptions} ProviderOptions */
/** @typedef {import('@advanced-rest-client/events').DataExport.ArcExportResult} ArcExportResult */

export class DataExportBindingsWeb extends DataExportBindings {
  /**
   * Requests a save file dialog and saves the data to selected path if not cancelled.
   * This does nothing when dialog is canceled.
   *
   * @param content Data to write
   * @param options Export provider options
   */
  exportFileData(content: string|Buffer, options: DataExport.ProviderOptions): Promise<DataExport.ArcExportResult>;

  /**
   * Requests to pick a file for saving.
   * @returns {Promise<any>} The id of the picked file or undefined when cancelled.
   */
  pickFile(): Promise<any>;
}
