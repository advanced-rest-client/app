import { ContextEvent } from '@api-client/core/build/browser.js';
import { ArcNativeDataExport, ExportOptions, ProviderOptions, ArcExportResult } from '@api-client/core/build/legacy.js';
import { EventTypes } from './EventTypes.js';

export interface ICustomDataExportDetails {
  data: unknown; 
  exportOptions: ExportOptions; 
  providerOptions: ProviderOptions;
}

export interface INativeDataExportDetails {
  data: ArcNativeDataExport; 
  exportOptions: ExportOptions; 
  providerOptions: ProviderOptions;
}

export interface IFileSaveDetails {
  data: unknown;
  options: ProviderOptions;
}

export class DataExportEvents {
  /**
   * Dispatches an event handled by the export factory to export any data.
   * @param data The data to export
   * @param exportOptions Export options
   * @param providerOptions Options passed to the export provider
   * @param target Optional events target
   */
  static async customData(data: unknown, exportOptions: ExportOptions, providerOptions: ProviderOptions, target: EventTarget = window): Promise<ArcExportResult | undefined> {
    const e = new ContextEvent<ICustomDataExportDetails, ArcExportResult>(EventTypes.DataExport.customData, {
      data,
      exportOptions,
      providerOptions,
    });
    target.dispatchEvent(e);
    return e.detail.result;
  }

  /**
   * Dispatches an event handled by the export factory to export ARC's native data.
   * @param data The ARC data to export.
   * @param exportOptions Export options
   * @param providerOptions Options passed to the export provider
   * @param target Optional events target
   */
  static async nativeData(data: ArcNativeDataExport, exportOptions: ExportOptions, providerOptions: ProviderOptions, target: EventTarget = window): Promise<ArcExportResult | undefined> {
    const e = new ContextEvent<INativeDataExportDetails, ArcExportResult>(EventTypes.DataExport.nativeData, {
      data,
      exportOptions,
      providerOptions,
    });
    target.dispatchEvent(e);
    return e.detail.result;
  }

  /**
   * Dispatches an event handled by the filesystem provider to store data on user's filesystem.
   * @param data 
   * @param options Export options
   * @param target Optional events target
   */
  static async fileSave(data: unknown, options: ProviderOptions, target: EventTarget = window): Promise<ArcExportResult | undefined> {
    const e = new ContextEvent<IFileSaveDetails, ArcExportResult>(EventTypes.DataExport.fileSave, {
      data,
      options,
    });
    target.dispatchEvent(e);
    return e.detail.result;
  }
}
