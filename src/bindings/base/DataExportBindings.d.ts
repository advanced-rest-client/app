import { ArcExportFilesystemEvent, DataExport } from '@advanced-rest-client/events';
import { PlatformBindings } from './PlatformBindings.js';

/**
 * General bindings for the data export logic.
 * Data export is exporting any kind of data (string, object, binary) to a file.
 */
export class DataExportBindings extends PlatformBindings {
  initialize(): Promise<void>;
  /**
   * @param {ArcExportFilesystemEvent} e
   */
  fileSaveHandler(e: ArcExportFilesystemEvent): void;
  /**
   * Requests a save file dialog and saves the data to selected path if not cancelled.
   * This does nothing when dialog is canceled.
   *
   * @param content Data to write
   * @param options Export provider options
   */
  exportFileData(content: string|Buffer, options: DataExport.ProviderOptions): Promise<DataExport.ArcExportResult>;
  prepareData(data: any, mime: string): string;
}
