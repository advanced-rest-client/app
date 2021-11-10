import { GoogleDrive, DataExport } from '@advanced-rest-client/events';
import { GoogleDriveBindings } from '../base/GoogleDriveBindings.js';
import { SaveDriveFileOptions } from '../../types';

export class GoogleDriveBindingsWeb extends GoogleDriveBindings {
  loggedIn: boolean;
  constructor();
  /**
   * Downloads file from Google Drive by its ID.
   * @param fileId The Google Drive file ID
   * @returns The contents of the file.
   */
  read(fileId: string): Promise<string>
  write(data: any, options: SaveDriveFileOptions): Promise<DataExport.ArcExportResult>;
  /**
   * The UI sets either parent id (google drive id) or a name of a new parent to create.
   * This method ensures the parent is created when needed and returns the id of the created parent.
   */
  getParentId(nameOrId: string): Promise<string>;
  listFolders(): Promise<GoogleDrive.AppFolder[]>;
  loadSdk(): Promise<void>;
  initClient(): Promise<void>;
  /**
   *  Called when the signed in status changes, to update the UI
   *  appropriately. After a sign-in, the API is called.
   */
  updateSignInStatus(isSignedIn: boolean): void;
  ensureSignIn(): Promise<void>;
  /**
   * This is a placeholder for an action when the user picks up a Google Drive item
   * @param id The Google Drive file id.
   * @returns {Promise<void>}
   */
  notifyFilePicked(idPromise: string): Promise<void>;
}
