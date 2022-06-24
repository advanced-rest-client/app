import { ContextEvent, ContextReadEvent } from "@api-client/core/build/browser.js";
import { ArcExportResult, ProviderOptions } from "@api-client/core/build/legacy.js";
import { AppFolder } from "../models/GDrive.js";
import { EventTypes } from "./EventTypes.js";

export class GoogleDriveEvents {
  /**
   * Dispatches an event handled by the Google Drive provider to store data on the drive.
   * 
   * @param data The data to export
   * @param options Options passed to the export provider
   * @param target Optional events target
   * @returns Promise resolved to the export result
   */
  static async save(data: unknown, options: ProviderOptions, target: EventTarget = window): Promise<ArcExportResult | undefined> {
    const e = new ContextEvent<{ data: unknown, options: ProviderOptions }, ArcExportResult>(EventTypes.GoogleDrive.save, {
      data, options,
    });
    target.dispatchEvent(e);
    return e.detail.result;
  }

  /**
   * Dispatches an event handled by the Google Drive provider to list created by the app files.
   *
   * @param target A node on which to dispatch the event.
   * @returns Promise resolved to the list of folders
   */
  static async listAppFolders(target: EventTarget = window): Promise<AppFolder[] | undefined> {
    const e = new ContextEvent<Record<string, unknown>, AppFolder[]>(EventTypes.GoogleDrive.listAppFolders, {});
    target.dispatchEvent(e);
    return e.detail.result;
  }

  /**
   * Dispatches an event handled by the Google Drive provider to list created by the app files.
   *
   * @param id The id of the file to read.
   * @param target A node on which to dispatch the event.
   * @returns Promise resolved to the list of folders
   */
  static async read(id: string, target: EventTarget = window): Promise<string | undefined> {
    const e = new ContextReadEvent<string>(EventTypes.GoogleDrive.read, id);
    target.dispatchEvent(e);
    return e.detail.result;
  }

  /** 
   * Notifies application's main process that a Google Drive file has been picked
   * by the user. The application should take action when needed.
   * 
   * @param id The Google Drive file id
   * @param target The node on which to dispatch the event.
   */
  static notifyFilePicked(id: string, target: EventTarget = window): void {
    const e = new CustomEvent(EventTypes.GoogleDrive.notifyFilePicked, {
      composed: true,
      cancelable: true,
      bubbles: true,
      detail: {
        id,
      }
    });
    target.dispatchEvent(e);
  }
}
