/* eslint-disable class-methods-use-this */
import { html } from 'lit-html';
import { EventTypes, Events } from '@advanced-rest-client/events';
import { ApplicationScreen } from './ApplicationScreen.js';
import '@advanced-rest-client/base/define/history-menu.js';
import '@advanced-rest-client/base/define/saved-menu.js';
import '@advanced-rest-client/base/define/projects-menu.js';
import '@advanced-rest-client/base/define/rest-api-menu.js';
import '@advanced-rest-client/base/define/search-menu.js';
import '@advanced-rest-client/base/define/arc-menu.js';

/** @typedef {import('lit-html').TemplateResult} TemplateResult */
/** @typedef {import('@advanced-rest-client/events').Config.ARCConfig} ARCConfig */
/** @typedef {import('@advanced-rest-client/events').ConfigStateUpdateEvent} ConfigStateUpdateEvent */

export const configStateChangeHandler = Symbol('configStateChangeHandler');

/**
 * A screen that is rendered in the popup menu in the Advanced REST Client.
 * Note, the navigation handlers are in the PopupMenuBindings.
 */
export class MenuScreen extends ApplicationScreen {
  constructor() {
    super();
    this.initObservableProperties(
      'listType', 'type', 'historyEnabled'
    );
    this.type = '';
    this.historyEnabled = true;
    this.initModels();
  }

  async initialize() {
    this.initType();
    this.initDomEvents();
    await this.loadTheme();
    await this.initSettings();
  }

  initType() {
    const init = this.collectInitOptions();
    this.type = init.type;
  }

  async initSettings() {
    let settings = /** @type ARCConfig */ ({});
    try {
      settings = (await Events.Config.readAll(this.eventTarget)) || {};
    } catch (e) {
      this.reportCriticalError(e);
      throw e;
    }

    if (settings.view && settings.view.listType) {
      this.listType = settings.view.listType;
    }
    if (settings.history && typeof settings.history.enabled === 'boolean') {
      this.historyEnabled = settings.history.enabled;
    }
  }

  initDomEvents() {
    window.addEventListener(EventTypes.Config.State.update, this[configStateChangeHandler].bind(this));
  }

  /**
   * @returns {any} The init options of this browser process.
   */
  collectInitOptions() {
    const search = new URLSearchParams(window.location.search);
    const result = {};
    const type = search.get('type');
    if (type) {
      result.type = type;
    }
    return result;
  }

  /**
   * @param {ConfigStateUpdateEvent} e
   */
  [configStateChangeHandler](e) {
    const { key, value } = e.detail;
    if (key === 'view.listType') {
      this.listType = value;
    } if (key === 'history.enabled') {
      this.historyEnabled = value;
    }
  }

  appTemplate() {
    const { type } = this;
    switch (type) {
      case 'history-menu': return this.historyTemplate();
      case 'saved-menu': return this.savedTemplate();
      case 'projects-menu': return this.projectsTemplate();
      case 'rest-api-menu': return this.apiDocsTemplate();
      case 'search-menu': return this.searchTemplate();
      default: return this.allTemplate();
    }
  }

  historyTemplate() {
    const { listType } = this;
    return html`<history-menu .listType="${listType}" ?anypoint="${this.anypoint}"></history-menu>`;
  }

  savedTemplate() {
    const { listType } = this;
    return html`<saved-menu .listType="${listType}" ?anypoint="${this.anypoint}"></saved-menu>`;
  }

  projectsTemplate() {
    const { listType } = this;
    return html`<projects-menu .listType="${listType}" ?anypoint="${this.anypoint}"></projects-menu>`;
  }

  apiDocsTemplate() {
    const { listType } = this;
    return html`<rest-api-menu .listType="${listType}" ?anypoint="${this.anypoint}"></rest-api-menu>`;
  }

  searchTemplate() {
    const { listType } = this;
    return html`<search-menu .listType="${listType}" ?anypoint="${this.anypoint}"></search-menu>`;
  }

  allTemplate() {
    const { listType, historyEnabled } = this;
    return html`<arc-menu .listType="${listType}" ?history="${historyEnabled}" ?anypoint="${this.anypoint}"></arc-menu>`;
  }
}
