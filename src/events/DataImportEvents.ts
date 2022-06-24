import { ContextEvent } from "@api-client/core/build/browser.js";
import { ArcExportObject, FileImportOptions } from "@api-client/core/build/legacy.js";
import { EventTypes } from "./EventTypes.js";

export class DataImportEvents {
  /**
   * Dispatches an event handled by the import factory to normalize import data to ARC export object.
   * 
   * @param data The data to normalize
   * @param target Optional events target
   * @returns Promise resolved to the export object
   */
  static async normalize(data: string | unknown, target: EventTarget = window): Promise<ArcExportObject | undefined> {
    const e = new ContextEvent<{ data: string | unknown }, ArcExportObject>(EventTypes.DataImport.normalize, {
      data,
    });
    target.dispatchEvent(e);
    return e.detail.result;
  }

  /**
   * Dispatches an event handled by the import factory to normalize import data to ARC export object.
   * 
   * @param data The data to import
   * @param target Optional events target
   * @returns Promise resolved to list of error messages, if any.
   */
  static async dataImport(data: ArcExportObject, target: EventTarget = window): Promise<string[] | undefined> {
    const e = new ContextEvent<{ data: ArcExportObject }, string[]>(EventTypes.DataImport.dataImport, {
      data,
    });
    target.dispatchEvent(e);
    return e.detail.result;
  }

  /**
   * Dispatches an event handled by the import factory to process an import file data.
   * 
   * @param file The file to import
   * @param options Optional import options.
   * @param target Optional events target
   */
  static async processFile(file: File, options?: FileImportOptions, target: EventTarget = window): Promise<void> {
    const e = new ContextEvent<{ file: File, options?: FileImportOptions }, void>(EventTypes.DataImport.processFile, {
      file, options,
    });
    target.dispatchEvent(e);
    await e.detail.result;
  }

  /**
   *  Dispatches an event handled by the import factory to process an import file data.
   * 
   * @param data The data to normalize and import
   * @param target Optional events target
   */
  static async processData(data: string | unknown, target: EventTarget = window): Promise<void> {
    const e = new ContextEvent<{ data: string | unknown }, void>(EventTypes.DataImport.processData, {
      data,
    });
    target.dispatchEvent(e);
    await e.detail.result;
  }

  /**
   * Dispatches an event handled by the application to render import data view.
   * 
   * @param data Normalized import data.
   * @param target Optional events target
   */
  static inspect(data: ArcExportObject, target: EventTarget = window): void {
    const e = new ContextEvent<{ data: ArcExportObject }, void>(EventTypes.DataImport.inspect, {
      data,
    });
    target.dispatchEvent(e);
  }

  /**
   * Dispatches an event not notify that the data has been imported.
   *
   * @param {EventTarget} target A node on which to dispatch the event.
   */
  static dataImported(target: EventTarget = window): void {
    const e = new Event(EventTypes.DataImport.dataImported, {
      bubbles: true,
      composed: true,
    });
    target.dispatchEvent(e);
  }
}
