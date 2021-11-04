/* eslint-disable no-unused-vars */
/* eslint-disable class-methods-use-this */
import { EventTypes } from '@advanced-rest-client/events';
import { PlatformBindings } from './PlatformBindings.js';

/** @typedef {import('@advanced-rest-client/events').Authorization.OAuth2Authorization} OAuth2Authorization */
/** @typedef {import('@advanced-rest-client/events').GoogleDriveListFolderEvent} GoogleDriveListFolderEvent */
/** @typedef {import('@advanced-rest-client/events').GoogleDriveReadEvent} GoogleDriveReadEvent */
/** @typedef {import('@advanced-rest-client/events').GoogleDriveSaveEvent} GoogleDriveSaveEvent */
/** @typedef {import('@advanced-rest-client/events').GoogleDrive.AppFolder} AppFolder */
/** @typedef {import('@advanced-rest-client/events').DataExport.ArcExportResult} ArcExportResult */
/** @typedef {import('../../types').SaveDriveFileOptions} SaveDriveFileOptions */
/** @typedef {import('../../types').FileCreateItem} FileCreateItem */

/**
 * The base bindings for Goggle Drive connector.
 */
export class GoogleDriveBindings extends PlatformBindings {
  /**
   * @returns {OAuth2Authorization}
   */
  get oauthConfig() {
    return {
      clientId: '1076318174169-u4a5d3j2v0tbie1jnjgsluqk1ti7ged3.apps.googleusercontent.com',
      authorizationUri: 'https://accounts.google.com/o/oauth2/v2/auth',
      redirectUri: 'https://auth.advancedrestclient.com/oauth2',
      scopes: [
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/drive.install',
      ],
    }
  }

  async initialize() {
    window.addEventListener(EventTypes.Google.Drive.read, this.readHandler.bind(this));
    window.addEventListener(EventTypes.Google.Drive.save, this.saveHandler.bind(this));
    window.addEventListener(EventTypes.Google.Drive.listAppFolders, this.listAppFoldersHandler.bind(this));
    window.addEventListener(EventTypes.Google.Drive.notifyFilePicked, this.notifyFilePickedHandler.bind(this));
  }

  /**
   * @param {GoogleDriveSaveEvent} e
   */
  saveHandler(e) {
    e.preventDefault();
    const { data, providerOptions } = e;
    const { file, contentType, parent } = providerOptions;
    const meta = {
      name: file,
      mimeType: contentType,
    };
    const options = /** @type SaveDriveFileOptions */ ({
      meta,
      parent,
      auth: this.oauthConfig,
    });
    e.detail.result = this.write(data, options);
  }

  /**
   * Handler for `google-drive-list-app-folders` event.
   * Requests to get Drive folders list created by this application.
   * @param {GoogleDriveListFolderEvent} e
   */
  listAppFoldersHandler(e) {
    e.detail.result = this.listFolders();
  }

  /**
   * @param {GoogleDriveReadEvent} e
   */
  readHandler(e) {
    e.preventDefault();
    if (!e.id) {
      e.detail.result = Promise.reject(new Error('The "id" detail property is missing.'));
    } else {
      e.detail.result = this.read(e.id);
    }
  }

  /**
   * @param {CustomEvent} e
   */
  notifyFilePickedHandler(e) {
    e.preventDefault();
    const { id } = e.detail;
    if (!id) {
      return;
    }
    this.notifyFilePicked(id);
  }

  /**
   * Downloads file from Google Drive by its ID.
   * @param {string} fileId The Google Drive file ID
   * @returns {Promise<string>} The contents of the file.
   */
  async read(fileId) {
    throw new Error('Not yet implemented.');
  }

  /**
   * @param {any} data
   * @param {SaveDriveFileOptions} options
   * @returns {Promise<ArcExportResult>}
   */
  async write(data, options) {
    throw new Error('Not yet implemented.');
  }

  /**
   * @returns {Promise<AppFolder[]>}
   */
  async listFolders() {
    throw new Error('Not yet implemented.');
  }

  /**
   * This is a placeholder for an action when the user picks up a Google Drive item
   * @param {string} id The Google Drive file id.
   * @returns {Promise<void>}
   */
  async notifyFilePicked(id) {
    throw new Error('Not yet implemented.');
  }
}
