/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable class-methods-use-this */
import { html } from 'lit-html';
import { EventTypes, Events } from '@advanced-rest-client/events'
import { ProjectModel, RequestModel, RestApiModel } from '@advanced-rest-client/idb-store'
import * as Constants from '@advanced-rest-client/base/src/Constants.js';
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
/** @typedef {import('@advanced-rest-client/events').ARCRequestNavigationEvent} ARCRequestNavigationEvent */
/** @typedef {import('@advanced-rest-client/events').ARCProjectNavigationEvent} ARCProjectNavigationEvent */
/** @typedef {import('@advanced-rest-client/events').ARCNavigationEvent} ARCNavigationEvent */
/** @typedef {import('@advanced-rest-client/events').ARCRestApiNavigationEvent} ARCRestApiNavigationEvent */

export const configStateChangeHandler = Symbol('configStateChangeHandler');
export const navigateRequestHandler = Symbol('navigateRequestHandler');
export const navigateProjectHandler = Symbol('navigateProjectHandler');
export const navigateHandler = Symbol('navigateHandler');
export const themeActivatedHandler = Symbol('themeActivatedHandler');
export const navigateRestApiHandler = Symbol('navigateRestApiHandler');

/**
 * A screen that is rendered in the popup menu in the Advanced REST Client.
 */
export class MenuScreen extends ApplicationScreen {
  constructor() {
    super();
    this.initObservableProperties(
      'listType', 'type', 'historyEnabled'
    );
    this.type = '';
    this.historyEnabled = true;
    this.requestModel = new RequestModel();
    this.projectModel = new ProjectModel();
    this.restApiModel = new RestApiModel();
  }

  async initialize() {
    this.initModels();
    this.initType();
    this.initDomEvents();
    await this.loadTheme();
    await this.initSettings();
  }

  initType() {
    const init = this.collectInitOptions();
    this.type = init.type;
  }

  initModels() {
    this.requestModel.listen(this.eventTarget);
    this.projectModel.listen(this.eventTarget);
    this.restApiModel.listen(this.eventTarget);
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
    window.addEventListener(EventTypes.Theme.State.activated, this[themeActivatedHandler].bind(this));
    window.addEventListener(EventTypes.Config.State.update, this[configStateChangeHandler].bind(this));
    window.addEventListener(EventTypes.Navigation.navigateRequest, this[navigateRequestHandler].bind(this));
    window.addEventListener(EventTypes.Navigation.navigateProject, this[navigateProjectHandler].bind(this));
    window.addEventListener(EventTypes.Navigation.navigate, this[navigateHandler].bind(this));
    window.addEventListener(EventTypes.Navigation.navigateRestApi, this[navigateRestApiHandler].bind(this));
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
   * @param {CustomEvent} e 
   */
  [themeActivatedHandler](e) {
    this.anypoint = e.detail.id === Constants.anypointTheme;
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

  /**
   * @param {ARCRequestNavigationEvent} e 
   */
  [navigateRequestHandler](e) {
    const { requestId, requestType, action } = e;
    Events.Menu.navigate(this.eventTarget, 'request', requestId, requestType, action);
  }

  /**
   * @param {ARCProjectNavigationEvent} e
   */
  [navigateProjectHandler](e) {
    const { id, action, route } = e;
    Events.Menu.navigate(this.eventTarget, 'project', id, action, route);
  }

  /**
   * @param {ARCNavigationEvent} e
   */
  [navigateHandler](e) {
    const allowed = [
      'exchange-search',
      'history',
      'saved',
    ];
    if (allowed.includes(e.route)) {
      Events.Menu.navigate(this.eventTarget, 'navigate', e.route);
    }
  }

  /**
   * @param {ARCRestApiNavigationEvent} e 
   */
  [navigateRestApiHandler](e) {
    const { api, action, version } = e;
    Events.Menu.navigate(this.eventTarget, 'api', api, version, action);
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
