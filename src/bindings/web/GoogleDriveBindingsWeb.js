/* eslint-disable class-methods-use-this */
import { GoogleDriveBindings } from '../base/GoogleDriveBindings.js';
import { navigatePage } from '../../lib/route.js';

/* global gapi */

/** @typedef {import('@advanced-rest-client/events').GoogleDrive.AppFolder} AppFolder */
/** @typedef {import('@advanced-rest-client/events').DataExport.ArcExportResult} ArcExportResult */
/** @typedef {import('../../types').SaveDriveFileOptions} SaveDriveFileOptions */

let sdkLoaded = false;

/** @global gapi */

export class GoogleDriveBindingsWeb extends GoogleDriveBindings {
  constructor() {
    super();
    /** @type boolean */
    this.loggedIn = undefined;
  }

  /**
   * Downloads file from Google Drive by its ID.
   * @param {string} fileId The Google Drive file ID
   * @returns {Promise<string>} The contents of the file.
   */
  async read(fileId) {
    await this.loadSdk();
    await this.ensureSignIn();
    // @ts-ignore
    const result = await gapi.client.drive.files.get({ fileId, alt: 'media' });
    return result.result;
  }

  /**
   * @param {any} data
   * @param {SaveDriveFileOptions} options
   * @returns {Promise<ArcExportResult>}
   */
  async write(data, options) {
    await this.loadSdk();
    await this.ensureSignIn();
    const { id, meta } = options;
    let parent;
    if (options.parent) {
      parent = await this.getParentId(options.parent)
    }
    let content = data;
    if (typeof content === 'object') {
      content = JSON.stringify(content);
    }
    const metadata = {
      name: meta.name,
      mimeType: meta.mimeType,
    };
    if (id) {
      metadata.id = id;
    }
    if (parent) {
      metadata.parents = [parent];
    }
    const metaString = JSON.stringify(metadata);
    const metaFile = new Blob([metaString], { type: 'application/json' });
    const dataFile = new Blob([content], { type: 'application/restclient+data' });
    const formData = new FormData();
    formData.append('metadata', metaFile);
    formData.append('file', dataFile);
    
    const token = gapi.auth.getToken().access_token;
    const headers = new Headers({'authorization': `Bearer ${token}`});
    const url = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });
    if (!response.ok) {
      throw new Error(`Unable to upload the file to the Google Drive. ${response.status}`);
    }
    const info = await response.json();
    const result = /** @type ArcExportResult */ ({
      fileId: info.id,
      interrupted: false,
      success: true,
    });
    if (parent) {
      result.parentId = parent;
    }
    return result;
  }

  /**
   * The UI sets either parent id (google drive id) or a name of a new parent to create.
   * This method ensures the parent is created when needed and returns the id of the created parent.
   * 
   * @param {string} nameOrId
   * @returns {Promise<string>}
   */
  async getParentId(nameOrId) {
    const folders = await this.listFolders();
    const folder = (folders || []).find((item) => item.id === nameOrId);
    if (folder) {
      return folder.id;
    }
    const fileMetadata = {
      name: nameOrId,
      mimeType : 'application/vnd.google-apps.folder',
    };
    const result = await gapi.client.drive.files.create({
      resource: fileMetadata,
      fields: 'id'
    });
    return result.result.id;
  }

  /**
   * @returns {Promise<AppFolder[]>}
   */
  async listFolders() {
    await this.loadSdk();
    await this.ensureSignIn();
    const result = await gapi.client.drive.files.list({
      q: 'trashed = false and mimeType="application/vnd.google-apps.folder"',
      orderBy: 'modifiedTime desc',
    });
    return result.result.files;
  }

  async loadSdk() {
    if (sdkLoaded) {
      return undefined;
    }
    sdkLoaded = true;
    let finished = false;
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => {
        if (finished) {
          return;
        }
        finished = true;
        gapi.load('client:auth2', async () => {
          try {
            await this.initClient();
            resolve();
          } catch (e) {
            console.log(e);
            const msg = e.message || e.details;
            reject(new Error(msg));
          }
        });
      };
      script.onerror = () => {
        if (!finished) {
          finished = true;
          reject(new Error('Unable to load the Google Drive sdk.'));
        }
      };
      document.head.append(script);
    });
  }

  async initClient() {
    const { oauthConfig } = this;
    const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];
    await gapi.client.init({
      // apiKey: API_KEY,
      clientId: oauthConfig.clientId,
      discoveryDocs: DISCOVERY_DOCS,
      scope: oauthConfig.scopes.join(' '),
    });
    gapi.auth2.getAuthInstance().isSignedIn.listen(this.updateSignInStatus.bind(this));
    this.updateSignInStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
  }

  /**
   *  Called when the signed in status changes, to update the UI
   *  appropriately. After a sign-in, the API is called.
   * @param {boolean} isSignedIn
   */
  updateSignInStatus(isSignedIn) {
    this.loggedIn = isSignedIn;
  }

  async ensureSignIn() {
    if (this.loggedIn) {
      return;
    }
    await gapi.auth2.getAuthInstance().signIn();
  }

  /**
   * This is a placeholder for an action when the user picks up a Google Drive item
   * @param {string} id The Google Drive file id.
   * @returns {Promise<void>}
   */
  async notifyFilePicked(id) {
    navigatePage('data-import.html', 'google-drive', id);
  }
}
