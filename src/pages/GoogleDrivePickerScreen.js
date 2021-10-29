/* eslint-disable class-methods-use-this */
import { html } from 'lit-html';
import '@advanced-rest-client/google/define/google-drive-browser.js';
import { EventTypes, Events } from '@advanced-rest-client/events'
import { ApplicationScreen } from './ApplicationScreen.js';
import { anypointTheme } from '../Constants.js';

/** @typedef {import('lit-html').TemplateResult} TemplateResult */
/** @typedef {import('@advanced-rest-client/events').Authorization.OAuth2Authorization} OAuth2Authorization */

export const themeActivatedHandler = Symbol('themeActivatedHandler');

export class GoogleDrivePickerScreen extends ApplicationScreen {
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

  constructor() {
    super();

    this.initObservableProperties(
      'initializing', 'loadingStatus', 'driveToken',
    );
    /** 
     * @type {boolean} Whether the project is being restored from the metadata store.
     */
    this.initializing = true;
    /** 
     * @type {string} A loading state information.
     */
    this.loadingStatus = 'Initializing application...';
    /**
     * @type {string}
     */
    this.driveToken = undefined;
  }

  async initialize() {
    await this.loadTheme();
    this.initDomEvents();
    this.requestGoogleDriveToken();
    this.initializing = false;
  }

  // listen() {
  //   this.themeProxy.listen();
  //   this.oauth2Proxy.listen();
  // }

  initDomEvents() {
    window.addEventListener(EventTypes.Theme.State.activated, this[themeActivatedHandler].bind(this));
  }

  /**
   * @param {CustomEvent} e 
   */
  [themeActivatedHandler](e) {
    this.anypoint = e.detail.id === anypointTheme;
  }

  async requestGoogleDriveToken() {
    const cnf = this.oauthConfig;
    cnf.interactive = true;
    const auth = await Events.Authorization.OAuth2.authorize(this.eventTarget, cnf);
    if (!auth) {
      return;
    }
    this.driveToken = auth.accessToken;
  }

  /**
   * @param {CustomEvent} e
   */ 
  drivePickHandler(e) {
    const id = e.detail;
    Events.Google.Drive.notifyFilePicked(this.eventTarget, id);
  }

  appTemplate() {
    const { initializing } = this;
    if (initializing) {
      return this.loaderTemplate();
    }
    return html`
    <div class="content">
      ${this.googleDriveTemplate()}
    </div>
    `;
  }

  /**
   * @returns {TemplateResult} A template for the loader
   */
  loaderTemplate() {
    return html`
    <div class="app-loader">
      <p class="message">Preparing Google Drive Picker</p>
      <p class="sub-message">${this.loadingStatus}</p>
    </div>
    `;
  }

  /**
   * @returns {TemplateResult|string} The template for the host rules mapping element
   */
  googleDriveTemplate() {
    const { anypoint } = this;
    // mimeType="application/restclient+data"
    return html`
    <google-drive-browser
      ?anypoint="${anypoint}"
      .accessToken="${this.driveToken}"
      @pick="${this.drivePickHandler}"
    ></google-drive-browser>
    `;  
  }
}

const page = new GoogleDrivePickerScreen();
page.initialize();
