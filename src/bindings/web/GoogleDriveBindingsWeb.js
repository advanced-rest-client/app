import { GoogleDriveBindings } from '../base/GoogleDriveBindings.js';

/** @typedef {import('@advanced-rest-client/events').GoogleDrive.AppFolder} AppFolder */
/** @typedef {import('@advanced-rest-client/events').DataExport.ArcExportResult} ArcExportResult */
/** @typedef {import('../../types').SaveDriveFileOptions} SaveDriveFileOptions */

let sdkLoaded = false;

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
    throw new Error('Not yet implemented.');
  }

  /**
   * @returns {Promise<AppFolder[]>}
   */
  async listFolders() {
    await this.loadSdk();
    await this.ensureSignIn();
    // @ts-ignore
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
    let finished = false;
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => {
        if (finished) {
          return;
        }
        finished = true;
        // @ts-ignore
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
    // @ts-ignore
    const sdk = gapi;
    const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];
    await sdk.client.init({
      // apiKey: API_KEY,
      clientId: oauthConfig.clientId,
      discoveryDocs: DISCOVERY_DOCS,
      scope: oauthConfig.scopes.join(' '),
    });
    sdk.auth2.getAuthInstance().isSignedIn.listen(this.updateSignInStatus.bind(this));
    this.updateSignInStatus(sdk.auth2.getAuthInstance().isSignedIn.get());
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
    // @ts-ignore
    await gapi.auth2.getAuthInstance().signIn();
  }
}
