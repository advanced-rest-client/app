import { Authorization, GoogleDriveListFolderEvent, GoogleDriveReadEvent, GoogleDriveSaveEvent, GoogleDrive, DataExport } from '@advanced-rest-client/events';
import { PlatformBindings } from './PlatformBindings.js';
import { SaveDriveFileOptions } from '../../types';

/**
 * The base bindings for Goggle Drive connector.
 */
export class GoogleDriveBindings extends PlatformBindings {
  get oauthConfig(): Authorization.OAuth2Authorization;
  initialize(): Promise<void>;
  saveHandler(e: GoogleDriveSaveEvent): void;
  /**
   * Requests to get Drive folders list created by this application.
   */
  listAppFoldersHandler(e: GoogleDriveListFolderEvent): void;
  readHandler(e: GoogleDriveReadEvent): void;
  notifyFilePickedHandler(e: CustomEvent): void;
  /**
   * Downloads file from Google Drive by its ID.
   * @param fileId The Google Drive file ID
   * @returns The contents of the file.
   */
  read(fileId: string): Promise<string>
  write(data: any, options: SaveDriveFileOptions): Promise<DataExport.ArcExportResult>;
  listFolders(): Promise<GoogleDrive.AppFolder[]>;
  /**
   * This is a placeholder for an action when the user picks up a Google Drive item
   * @param id The Google Drive file id.
   * @returns {Promise<void>}
   */
  notifyFilePicked(idPromise: string): Promise<void>;
}
