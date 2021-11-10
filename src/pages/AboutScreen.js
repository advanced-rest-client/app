/* eslint-disable class-methods-use-this */
/* eslint-disable no-param-reassign */
import { html } from 'lit-html';
import * as Constants from '@advanced-rest-client/base/src/Constants.js';
import '@anypoint-web-components/awc/anypoint-dropdown-menu.js';
import '@anypoint-web-components/awc/anypoint-listbox.js';
import '@anypoint-web-components/awc/anypoint-item.js';
import '@anypoint-web-components/awc/anypoint-item-body.js';
import '@anypoint-web-components/awc/anypoint-button.js';
import '@anypoint-web-components/awc/anypoint-switch.js';
import '@advanced-rest-client/icons/arc-icon.js';
import { Events, EventTypes } from '@advanced-rest-client/events';
import { ApplicationScreen } from './ApplicationScreen.js';

/** @typedef {import('lit-html').TemplateResult} TemplateResult */
/** @typedef {import('@advanced-rest-client/events').Config.ARCConfig} ARCConfig */
/** @typedef {import('@advanced-rest-client/events').Application.AppVersionInfo} AppVersionInfo */
/** @typedef {import('@anypoint-web-components/awc').AnypointSwitchElement} AnypointSwitch */
/** @typedef {import('@anypoint-web-components/awc').AnypointListboxElement} AnypointListboxElement */
/** @typedef {import('electron-updater').UpdateInfo} UpdateInfo */

export const checkingUpdateHandler = Symbol('checkingUpdateHandler');
export const updateAvailableHandler = Symbol('updateAvailableHandler');
export const updateNotAvailableHandler = Symbol('updateNotAvailableHandler');
export const updateErrorHandler = Symbol('updateErrorHandler');
export const downloadingHandler = Symbol('downloadingHandler');
export const downloadedHandler = Symbol('downloadedHandler');
export const themeActivatedHandler = Symbol('themeActivatedHandler');

export class AboutScreen extends ApplicationScreen {
  get updateDownloaded() {
    return this.updateStatePage === 3;
  }

  get updateProgress() {
    return [1, 2, 3].includes(this.updateStatePage);
  }

  get isError() {
    return this.updateStatePage === 4;
  }

  get updateLabel() {
    switch (this.updateStatePage) {
      case 1: return html`Checking for update...`;
      case 2: return html`Downloading update...`;
      case 3: return html`Ready to install`;
      case 4: return html`Update error`;
      default: return html`ARC is up to date <span class="heart">❤</span>`;
    }
  }

  constructor() {
    super();

    this.initObservableProperties(
      'autoUpdate', 'updateStatePage', 'errorMessage', 'releaseChannel', 'errorCode', 'upgradeInfo', 'versionInfo',
    );

    /**
     * page of the update status label
     */
    this.updateStatePage = 0;
    /** 
     * State of auto update setting.
     */
    this.autoUpdate = false;
    /** 
     * Associated message with current error code.
     * @type {string}
     */
    this.errorMessage = undefined;
    /** 
     * @type {string}
     */
    this.errorCode = undefined;
    /**
     * Current release channel.
     * @type {string}
     */
    this.releaseChannel = 'latest';
    /**
     * Current release channel.
     * @type {UpdateInfo}
     */
    this.upgradeInfo = undefined;
    /**
     * Current application version info.
     * @type {AppVersionInfo}
     */
    this.versionInfo = {
      appVersion: 'loading...',
      chrome: 'loading...',
    };
  }

  async initialize() {
    await this.loadTheme();
    let cnf = /** @type ARCConfig */ ({});
    try {
      cnf = (await Events.Config.readAll(this.eventTarget)) || {};
    } catch (e) {
      this.reportCriticalError(e);
      throw e;
    }
    const { updater={} } = cnf;
    const { auto, channel } = updater;
    this.releaseChannel = channel || 'latest';
    this.autoUpdate = auto;
    this.versionInfo = await this.loadVersionInfo();
    this.listen();
    this.render();
  }
  
  listen() {
    const { eventTarget } = this;
    eventTarget.addEventListener(EventTypes.Updater.State.checkingForUpdate, this[checkingUpdateHandler].bind(this));
    eventTarget.addEventListener(EventTypes.Updater.State.updateAvailable, this[updateAvailableHandler].bind(this));
    eventTarget.addEventListener(EventTypes.Updater.State.updateNotAvailable, this[updateNotAvailableHandler].bind(this));
    eventTarget.addEventListener(EventTypes.Updater.State.autoUpdateError, this[updateErrorHandler].bind(this));
    eventTarget.addEventListener(EventTypes.Updater.State.downloadProgress, this[downloadingHandler].bind(this));
    eventTarget.addEventListener(EventTypes.Updater.State.updateDownloaded, this[downloadedHandler].bind(this));
    window.addEventListener(EventTypes.Theme.State.activated, this[themeActivatedHandler].bind(this));
  }

  /**
   * @param {CustomEvent} e 
   */
  [themeActivatedHandler](e) {
    this.anypoint = e.detail.id === Constants.anypointTheme;
  }

  [checkingUpdateHandler]() {
    this.updateStatePage = 1;
  }

  /**
   * @param {CustomEvent} e
   */
  [updateAvailableHandler](e) {
    const info = /** @type UpdateInfo */ (e.detail);
    this.upgradeInfo = info;
    if (this.updateStatePage !== 2) {
      this.updateStatePage = 2;
    }
  }

  [updateNotAvailableHandler]() {
    this.updateStatePage = 0;
  }

  /**
   * @param {CustomEvent} e
   */
  [updateErrorHandler](e) {
    const err = e.detail;
    this.updateStatePage = 4;
    this.createErrorMessage(err.code, err.message);
    this.errorCode = err.code || undefined;
  }

  [downloadingHandler]() {
    if (this.updateStatePage !== 2) {
      this.updateStatePage = 2;
    }
  }

  [downloadedHandler]() {
    this.updateStatePage = 3;
  }

  /**
   * @param {string=} code
   * @param {string=} message
   */
  createErrorMessage(code, message) {
    switch (code) {
      case 'ERR_UPDATER_INVALID_RELEASE_FEED':
        message = 'Unable to parse releases feed.';
        break;
      case 'ERR_UPDATER_NO_PUBLISHED_VERSIONS':
        message = 'Unable to find published version.';
        break;
      case 'ERR_UPDATER_CHANNEL_FILE_NOT_FOUND':
        message = 'Cannot find latest release information for this platform.';
        break;
      case 'ERR_UPDATER_LATEST_VERSION_NOT_FOUND':
        message = 'Unable to find latest version on GitHub.';
        break;
      default:
        message = message || 'Unknown error ocurred.';
    }
    this.errorMessage = message;
  }

  /**
   * Requests the application to check for updates.
   */
  async updateCheck() {
    try {
      await Events.Updater.checkForUpdate(this.eventTarget);
    } catch (e) {
      this.createErrorMessage(null, e.message);
      this.updateStatePage = 4;
    }
  }

  /**
   * Triggers the update.
   */
  async updateInstall() {
    await Events.Updater.installUpdate(this.eventTarget);
  }

  /**
   * A handler for a link click.
   * Dispatches the navigation event to prevent default action which on platforms like Electron
   * can have unintended result.
   * @param {MouseEvent} e
   */
  linkHandler(e) {
    e.preventDefault();
    e.stopPropagation();
    const anchor = /** @type HTMLAnchorElement */ (e.target);
    Events.Navigation.navigateExternal(this.eventTarget, anchor.href);
  }

  /**
   * Checks if `channel` is a valid channel signature.
   * @param {string} channel
   * @returns {boolean}
   */
  isValidChannel(channel) {
    return ['beta', 'alpha', 'latest'].indexOf(channel) !== -1;
  }

  /**
   * @param {Event} e
   */
  async autoChangeHandler(e) {
    const button = /** @type AnypointSwitch */ (e.target);
    if (this.autoUpdate === undefined && button.checked === false) {
      this.autoUpdate = button.checked;
      return;
    }
    if (button.checked === this.autoUpdate) {
      return;
    }
    this.autoUpdate = button.checked;
    await Events.Config.update(this.eventTarget, 'updater.auto', button.checked);
  }

  /**
   * @param {Event} e
   */
  async releaseChannelHandler(e) {
    const list = /** @type AnypointListboxElement */ (e.target);
    const value = /** @type string */ (list.selected);
    this.releaseChannel = value;
    await Events.Config.update(this.eventTarget, 'updater.channel', value);
  }

  appTemplate() {
    return html`
    <main>
      ${this.titleTemplate()}
      ${this.updatesSettingsTemplate()}
      ${this.errorTemplate()}
      ${this.authorTemplate()}
    </main>
    `;
  }

  titleTemplate() {
    const { versionInfo } = this;
    return html`<section class="title-section">
      <div class="hero">
        <div class="logo-container">
          <arc-icon class="logo" icon="arcIconArrows"></arc-icon>
        </div>
        <div class="app-title">
          <h1>Advanced REST Client</h1>
        </div>
      </div>
      <div class="version-meta">
        <p class="version">Version: ${versionInfo.appVersion}</p>
        <a
          href="https://github.com/advanced-rest-client/arc-electron/releases/tag/v${versionInfo.appVersion}"
          @click="${this.linkHandler}"
        >
          Release notes
          <arc-icon class="open-external-icon" icon="openInNew" title="Open external window"></arc-icon>
        </a>
      </div>
    </section>`;
  }

  updatesSettingsTemplate() {
    const {
      updateProgress,
      updateDownloaded,
      anypoint,
      autoUpdate,
      updateLabel,
    } = this;
    return html`
    <section class="updates-section">
      <div class="update-status">
        <span class="update-message">${updateLabel}</span>
        ${updateDownloaded ?
          html`<anypoint-button
            emphasis="high"
            ?anypoint="${anypoint}"
            @click="${this.updateInstall}"
          >Restart and install</anypoint-button>` :
          html`<anypoint-button
            emphasis="high"
            ?disabled="${updateProgress}"
            ?anypoint="${anypoint}"
            @click="${this.updateCheck}"
          >Check for updates</anypoint-button>`}
      </div>
      <div class="update-settings">
        <anypoint-switch 
          .checked="${autoUpdate}"
          @change="${this.autoChangeHandler}"
        >
          Automatically download and install updates
        </anypoint-switch>
      </div>
      ${this.channelsTemplate()}
    </section>`;
  }

  channelsTemplate() {
    const {
      anypoint,
      releaseChannel
    } = this;
    return html`<div class="release-channel">
      <anypoint-dropdown-menu
        dynamicAlign
        horizontalAlign="left"
        ?anypoint="${anypoint}"
        class="channel-selector"
      >
        <label slot="label">Release channel</label>
        <anypoint-listbox
          slot="dropdown-content"
          attrForItemTitle="data-label"
          attrforselected="data-channel"
          .selected="${releaseChannel}"
          @selectedchange="${this.releaseChannelHandler}"
          ?anypoint="${anypoint}"
        >
          <anypoint-item data-channel="latest" data-label="Stable">
            <anypoint-item-body twoline>
              <div>Stable</div>
              <div data-secondary>Default channel. Tested and targeted for production environment.</div>
            </anypoint-item-body>
          </anypoint-item>
          <anypoint-item data-channel="beta" data-label="Beta">
            <anypoint-item-body twoline>
              <div>Beta</div>
              <div data-secondary>Next release. Tested but may contain bugs.</div>
            </anypoint-item-body>
          </anypoint-item>
          <anypoint-item data-channel="alpha" data-label="Unstable">
            <anypoint-item-body twoline>
              <div>Unstable</div>
              <div data-secondary>Development version. May not be fully tested and contain bugs!</div>
            </anypoint-item-body>
          </anypoint-item>
        </anypoint-listbox>
      </anypoint-dropdown-menu>
    </div>`;
  }

  errorTemplate() {
    if (!this.isError) {
      return '';
    }
    const { errorMessage, errorCode } = this;
    return html`
    <section class="error-code">
      <p>${errorMessage}</p>
      ${errorCode ? html`<p>${errorCode}</p>` : ''}
    </section>`;
  }

  authorTemplate() {
    return html`
    <section class="author-line">
      <p>Coded by <a href="https://www.linkedin.com/in/pawelpsztyc/" @click="${this.linkHandler}">Pawel Psztyc</a>.</p>
      <div class="branding">
        With great support of MuleSoft, a Salesforce company.
      </div>
    </section>
    `;
  }
}
