/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-param-reassign */
import { html } from 'lit-html';
import { get, del } from 'idb-keyval';
import { Events, EventTypes } from '@advanced-rest-client/events';
import { Utils } from "@advanced-rest-client/base";
import '@api-components/amf-components/define/api-documentation.js';
import '@api-components/amf-components/define/api-request.js';
import '@api-components/amf-components/define/api-navigation.js';
import '@anypoint-web-components/awc/anypoint-menu-button.js';
import '@anypoint-web-components/awc/anypoint-icon-button.js';
import '@anypoint-web-components/awc/anypoint-button.js';
import '@anypoint-web-components/awc/anypoint-listbox.js';
import '@anypoint-web-components/awc/anypoint-item.js';
import '@advanced-rest-client/icons/arc-icon.js';
import { DomEventsAmfStore, ApiEventTypes } from '@api-components/amf-components';
import { ApplicationScreen } from './ApplicationScreen.js';
import { findRoute, navigatePage, navigate } from "../lib/route.js";

/** @typedef {import('lit-html').TemplateResult} TemplateResult */
/** @typedef {import('@advanced-rest-client/events').Config.ARCConfig} ARCConfig */
/** @typedef {import('@advanced-rest-client/events').RestApi.ARCRestApiIndex} ARCRestApiIndex */
/** @typedef {import('@advanced-rest-client/events').ConfigStateUpdateEvent} ConfigStateUpdateEvent */
/** @typedef {import('@anypoint-web-components/awc').AnypointListboxElement} AnypointListboxElement */
/** @typedef {import('@api-components/amf-components').SelectionType} SelectionType */
/** @typedef {import('@api-components/amf-components').Amf.AmfDocument} AmfDocument */
/** @typedef {import('@api-components/amf-components/src/events/NavigationEvents').ApiNavigationEvent} ApiNavigationEvent */

const configStateChangeHandler = Symbol("configStateChangeHandler");
const mainBackHandler = Symbol("mainBackHandler");
const apiTitleValue = Symbol('apiTitleValue');

export class ApiConsoleScreen extends ApplicationScreen {
  static get routes() {
    return [
      {
        name: 'open',
        pattern: 'open/(?<src>[^/]*)/(?<id>[^/]*)/(?<version>[^/]*)'
      },
      {
        name: 'open',
        pattern: 'open/(?<src>[^/]*)/(?<id>[^/]*)'
      },
      {
        name: 'api',
        pattern: 'api/(?<src>[^/]*)/(?<id>[^/]*)/(?<version>[^/]*)/(?<domainType>[^/]*)/(?<domainId>[^/]*)/(?<operationId>.*)'
      }, 
      {
        name: 'api',
        pattern: 'api/(?<src>[^/]*)/(?<id>[^/]*)/(?<version>[^/]*)/(?<domainType>[^/]*)/(?<domainId>.*)'
      },
      {
        name: 'api',
        pattern: 'api/(?<src>[^/]*)/(?<id>[^/]*)(?<domainType>[^/]*)/(?<domainId>[^/]*)/(?<operationId>.*)'
      }, 
      {
        name: 'api',
        pattern: 'api/(?<src>[^/]*)/(?<id>[^/]*)(?<domainType>[^/]*)/(?<domainId>.*)'
      },
      
    ];
  }

  /**
   * @returns {string} The default OAuth2 redirect URI.
   */
  get oauth2RedirectUri() {
    const { config={} } = this;
    const { request={} } = config;
    if (request.oauth2redirectUri) {
      return request.oauth2redirectUri;
    }
    return 'http://auth.advancedrestclient.com/arc.html';
  }

  /**
   * @returns {string|undefined} The title of the currently loaded API.
   */
  get apiTitle() {
    return this[apiTitleValue];
  }

  constructor() {
    super();
    this.initObservableProperties(
      'route', 'routeParams', 'initializing', 
      'amfType', 'domainId', 'domainType', 'operationId',
      'isStored',
      'indexItem', 'apiVersion',
    );
    /**
     * The domain id of the currently selected graph object.
     * @type {string}
     */
    this.domainId = 'summary';
    /**
     * The navigation type of the currently selected graph object.
     * @type {SelectionType}
     */
    this.domainType = 'summary';
    /**
     * When the current domain type is an operation this is the selected operation domain id.
     */
    this.operationId = undefined;
    /** 
     * @type {boolean} Whether the project is being restored from the metadata store.
     */
    this.initializing = false;
    /** 
     * @type {string} A loading state information.
     */
    this.loadingStatus = 'Initializing the API...';
    /** 
     * A flag to determine whether the current API is stored in the application data store.
     * When set to true it renders controls to store the API data.
     */
    this.isStored = false;

    /**
     * @type {ARCRestApiIndex}
     */
    this.indexItem = undefined;
    /**
     * The title of the currently loaded API.
     * @type string
     */
    this[apiTitleValue] = undefined;
    this.initModels();
    this.apiStore = new DomEventsAmfStore();
  }

  async initialize() {
    this.listen();
    let settings = /** @type ARCConfig */ ({});
    try {
      settings = (await Events.Config.readAll(this.eventTarget)) || {};
    } catch (e) {
      this.reportCriticalError(e);
      throw e;
    }
    this.config = settings;
    this.setConfigVariables(settings);
    await this.loadTheme();
    await this.afterInitialization();
    this.initializing = false;
  }

  listen() {
    this.apiStore.listen();
    window.addEventListener(ApiEventTypes.Navigation.apiNavigate, this.apiNavigationHandler.bind(this));
    window.addEventListener(EventTypes.Config.State.update, this[configStateChangeHandler].bind(this));
    // window.addEventListener('beforeunload', this.beforeunloadHandler.bind(this));
  }

  /**
   * Clears the API from the `file` source (idb) if was initialized with this API.
   */
  beforeunloadHandler() {
    const { apiSource, apiId } = this;
    if (apiSource !== 'file' || !apiId) {
      return;
    }
    del(apiId);
  }

  /**
   * @param {ApiNavigationEvent} e Dispatched navigation event
   */
  apiNavigationHandler(e) {
    const { domainId, domainType, parentId, passive } = e.detail;
    if (passive === true) {
      return;
    }
    if (domainType === 'operation') {
      if (this.apiVersion) {
        navigate('api', this.apiSource, this.apiId, this.apiVersion, domainType, parentId, domainId);
      } else {
        navigate('api', this.apiSource, this.apiId, domainType, parentId, domainId);
      }
    } else {
      // eslint-disable-next-line no-lonely-if
      if (this.apiVersion) {
        navigate('api', this.apiSource, this.apiId, this.apiVersion, domainType, domainId);
      } else {
        navigate('api', this.apiSource, this.apiId, domainType, domainId);
      }
    }
  }

  /**
   * @param {ConfigStateUpdateEvent} e
   */
  [configStateChangeHandler](e) {
    const { key, value } = e.detail;
    const { config={} } = this;
    Utils.updateDeepValue(config, key, value);
    this.render();
    if (key === 'view.fontSize') {
      document.body.style.fontSize = `${value}px`;
    }
  }

  /**
   * Sets local variables from the config object
   * @param {ARCConfig} cnf
   */
  setConfigVariables(cnf) {
    if (cnf.view) {
      if (typeof cnf.view.fontSize === 'number') {
        document.body.style.fontSize = `${cnf.view.fontSize}px`;
      }
    }
  }

  /**
   * Tasks to be performed after the application is initialized.
   */
  async afterInitialization() {
    window.onpopstate = () => {
      this.onRoute();
    }
    requestAnimationFrame(() => this.onRoute());
  }

  /**
   * Called when route change
   */
  onRoute() {
    const url = new URL(window.location.href);
    const path = url.hash.replace('#', '');
    // @ts-ignore
    const { routes } = this.constructor;
    const result = findRoute(routes, path);
    if (!result) {
      return;
    }
    const { name } = result.route;
    this.route = name;
    this.routeParams = result.params;
    Events.Telemetry.view(this.eventTarget, name);
    if (name === 'open') {
      this.openApi( /** @type string */ (result.params.src),  /** @type string */ (result.params.id),  /** @type string */ (result.params.version));
    } else if (name === 'api') {
      if (!this.apiId) {
        this.openApi( /** @type string */ (result.params.src), /** @type string */ (result.params.id),  /** @type string */ (result.params.version));
        this.apiId = /** @type string */ (result.params.id);
      }
      if (result.params.domainId) {
        this.domainId = /** @type string */ (result.params.domainId);
      }
      if (result.params.domainType) {
        this.domainType = /** @type SelectionType */ (result.params.domainType);
      }
      if (result.params.operationId) {
        this.operationId = /** @type string */ (result.params.operationId);
      }
    }
  }

  /**
   * Opens an API from the given source
   * @param {string} source Either `file` or `db`
   * @param {string} id The id of the API to open
   * @param {string=} version The version of the API to open.
   * @returns {Promise<void>}
   */
  async openApi(source, id, version) {
    this.apiSource = source;
    this.apiVersion = version;
    this.apiId = id;

    if (source === 'file') {
      await this.restoreFromTmpFile(id);
    } else if (source === 'db') {
      await this.restoreFromDataStore(id, version);
    }
  }

  /**
   * Restores an API that has been stored in a temporary file to move the data
   * between the main application page and API Console.
   * @param {string} id The id of the generated file
   */
  async restoreFromTmpFile(id) {
    this.initializing = true;
    this.loadingStatus = 'Reading API model from a temporary file';
    this.isStored = false;
    try {
      const result = await get(id);
      if (!result) {
        throw new Error(`API not found.`)
      }
      let { model } = result
      if (typeof model === 'string') {
        model = JSON.parse(model);
      }
      this.amf = model;
      this.amfType = result.type;
      this.apiStore.amf = this.amf;
      this.postApiLoad();
      this.loadingStatus = 'Finishing up';
      this.processUnsavedModel(this.amf);
      navigate('api', this.apiSource, id, 'summary', 'summary');
    } catch (e) {
      this.reportCriticalError(e.message);
    }
    this.initializing = false;
  }

  /**
   * Restores API Console from the local data store.
   * @param {string} id The data store id of the API
   * @param {string=} version The version of the API to open.
   */
  async restoreFromDataStore(id, version) {
    this.isStored = true;
    this.canSave = false;
    this.initializing = true;
    try {
      this.loadingStatus = 'Reading data from the data store';
      this.indexItem = await Events.Model.RestApi.read(document.body, id);
      const data = await Events.Model.RestApi.dataRead(document.body, `${id}|${version}`);
      this.loadingStatus = 'Finishing up';
      this.amf = JSON.parse(data.data);
      this.apiStore.amf = this.amf;
      this.postApiLoad();
      navigate('api', this.apiSource, id, version, 'summary', 'summary');
    } catch (e) {
      this.indexItem = undefined;
      this.reportCriticalError('Unable to find the API.');
    }
    this.initializing = false;
  }

  /**
   * Operations performed after the API model is rendered.
   */
  async postApiLoad() {
    const summary = await this.apiStore.apiSummary();
    this[apiTitleValue] = summary.name;
  }

  /**
   * Computes variables used to determine whether the API can be stored in the data store.
   * @param {any} amf The resolved AMF model.
   */
  async processUnsavedModel(amf) {
    if (!amf) {
      this.baseUri = undefined;
      this.apiVersion = undefined;
      this.indexItem = undefined;
      this.canSave = false;
      return;
    }
    
    this.baseUri = await this.computeBaseUri();
    this.apiVersion = await this.apiStore.apiVersion();
    this.canSave = this.computeCanSave(this.baseUri, this.apiVersion);
    try {
      this.indexItem = await Events.Model.RestApi.read(document.body, this.baseUri);
      if (this.indexItem.versions.includes(this.apiVersion)) {
        this.isStored = true;
      }
    } catch (e) {
      this.indexItem = undefined;
    }
  }

  /**
   * Computes model's base Uri
   * 
   * @returns {Promise<string|undefined>}
   */
  async computeBaseUri() {
    const servers = await this.apiStore.queryServers();
    const protocols = await this.apiStore.apiProtocols();
    const [server] = servers;
    let base = '';
    if (server) {
      base = server.url || '';
    }
    if (!base.includes('://')) {
      const protocol = protocols && protocols[0] || 'http:';
      base = `${protocol}//${base}`;
    }
    return base;
  }

  /**
   * @param {string} baseUri
   * @param {string} apiVersion
   * @returns {boolean} True when this model can be stored in the data store.
   */
  computeCanSave(baseUri, apiVersion) {
    if (!baseUri || baseUri === 'http://' || !apiVersion) {
      return false;
    }
    return true;
  }

  /**
   * @param {ResizeEvent} e
   */
  navigationResizeHandler(e) {
    const { width } = e;
    if (width < 100) {
      e.preventDefault();
    }
  }

  [mainBackHandler]() {
    navigatePage('app.html');
  }

  saveApiHandler() {
    this.saveApi();
  }

  /**
   * Creates a data store key for the API.
   * Primarily, it uses the base URI so the same API with different version can be recognized.
   * Secondly, it tries to use the API title turned into a slug.
   * What all this fails it uses the `apiId`,
   * 
   * @return {string} 
   */
  computeStoreKey() {
    const { baseUri, apiTitle, apiId } = this;
    if (baseUri && baseUri !== 'http://') {
      return baseUri;
    }
    if (apiTitle) {
      const result = this.slug(apiTitle);
      if (result) {
        return result;
      }
    }
    return apiId;
  }

  /**
   * @param {string} text
   * @returns {string} 
   */
  slug(text) {
    let str = text.replace(/^\s+|\s+$/g, '');
    str = str.toLowerCase();
    const from = "ÁÄÂÀÃÅČÇĆĎÉĚËÈÊẼĔȆÍÌÎÏŇÑÓÖÒÔÕØŘŔŠŤÚŮÜÙÛÝŸŽáäâàãåčçćďéěëèêẽĕȇíìîïňñóöòôõøðřŕšťúůüùûýÿžþÞĐđßÆa·/_,:;";
    const to   = "AAAAAACCCDEEEEEEEEIIIINNOOOOOORRSTUUUUUYYZaaaaaacccdeeeeeeeeiiiinnooooooorrstuuuuuyyzbBDdBAa------";
    // eslint-disable-next-line no-plusplus
    for (let i = 0, l = from.length; i < l; i++) {
      str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
    }
    str = str.replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-') .replace(/-+/g, '-');
    return str;
  }

  /**
   * Stores the API in the data store.
   */
  async saveApi() {
    const { apiVersion, amfType, apiTitle='Unnamed API', apiId } = this;
    const key = this.computeStoreKey();
    let { indexItem } = this;
    if (indexItem) {
      indexItem.versions.push(apiVersion);
      indexItem.latest = apiVersion;
      indexItem.title = apiTitle;
    } else {
      indexItem = {
        _id: key,
        title: apiTitle,
        order: 0,
        latest: apiVersion,
        versions: [apiVersion],
        type: amfType.type,
      }
    }
    const record = await Events.Model.RestApi.update(document.body, indexItem);
    this.indexItem = record.item;
    this.isStored = true;
    await Events.Model.RestApi.dataUpdate(document.body, {
      data: JSON.stringify(this.amf),
      indexId: key,
      version: apiVersion,
      amfVersion: '5.0.0',
    });
    
    await del(apiId);
    navigate('api', 'db', record.id, apiVersion, this.domainId || 'summary', this.domainType || 'summary');
  }

  /**
   * Changes the API version after selecting a different version of the same API.
   * @param {Event} e
   */
  async apiVersionMenuHandler(e) {
    const list = /** @type AnypointListboxElement */ (e.target);
    const { selected } = list;
    navigate('open', 'db', this.indexItem._id, String(selected));
  }

  /**
   * @param {Event} e
   */
  async apiActionMenuChanged(e) {
    const list = /** @type AnypointListboxElement */ (e.target);
    const { selected, selectedItem } = list;
    if (selected === undefined || selected === -1) {
      return;
    }
    const { action } = selectedItem.dataset;
    switch (action) {
      case 'delete': this.delete(); break;
      case 'delete-version': this.deleteVersion(); break;
      default:
    }
  }

  /**
   * Removes the API from the store.
   */
  async delete() {
    const { indexItem } = this;
    await Events.Model.RestApi.delete(document.body, indexItem._id);
    navigatePage('app.html');
  }

  /**
   * Removes a version of the API from the store.
   */
  async deleteVersion() {
    const { indexItem, apiVersion } = this;
    await Events.Model.RestApi.versionDelete(document.body, indexItem._id, apiVersion);
    navigatePage('app.html');
  }

  appTemplate() {
    const { initializing } = this;
    if (initializing) {
      return this.loaderTemplate();
    }
    return html`
    <div class="content">
      ${this.navigationTemplate()}
      ${this.pageTemplate(this.route)}
    </div>
    `;
  }

  navigationTemplate() {
    return html`
    <nav
      resize="east"
      @resize="${this.navigationResizeHandler}"
    >
      <div class="menu-title">
        API index
      </div>
      ${this.apiNavigationTemplate()}
    </nav>
    `;
  }

  apiNavigationTemplate() {
    return html`
    <api-navigation
      summary
      endpointsOpened
      layout="tree"
    ></api-navigation>
    `;
  }

  /**
   * @param {string} route
   * @returns {TemplateResult} The template for the page content
   */
  pageTemplate(route) {
    return html`
    <main>
      ${this.headerTemplate()}
      ${this.renderPage(route)}
    </main>
    `;
  }

  /**
   * @param {string} route The current route name.
   * @returns {TemplateResult} The template for the current page.
   */
  renderPage(route) {
    switch (route) {
      case 'api': 
      case 'docs': 
      case 'open': return this.apiTemplate();
      default: return html`<p>404: Unknown route <code>/${route}</code>.</p>`;
    }
  }

  /**
   * @returns {TemplateResult} The template for the API console's main documentation.
   */
  apiTemplate() {
    return html`
    <api-documentation
      .domainId="${this.domainId}"
      .operationId="${this.operationId}"
      .domainType="${this.domainType}"
      .redirectUri="${this.oauth2RedirectUri}"
      tryItPanel
    >
    </api-documentation>
    `;
  }

  /**
   * @returns {TemplateResult} The template for the header
   */
  headerTemplate() {
    const { apiTitle='API Console by MuleSoft.' } = this;
    return html`
    <header>
      <anypoint-icon-button title="Back to the request workspace" @click="${this[mainBackHandler]}" class="header-action-button">
        <arc-icon icon="arrowBack"></arc-icon>
      </anypoint-icon-button>
      ${apiTitle}
      <span class="spacer"></span>
      ${this.saveButtonTemplate()}
      ${this.apiVersionsTemplate()}
      ${this.apiMenuTemplate()}
    </header>`;
  }

  saveButtonTemplate() {
    const { canSave, isStored } = this;
    if (!canSave || isStored) {
      return '';
    }
    const label = this.indexItem ? 'Save version' : 'Save API';
    return html`
    <anypoint-button
      class="toolbar-button"
      emphasis="high"
      @click="${this.saveApiHandler}"
      ?anypoint="${this.anypoint}"
    >${label}</anypoint-button>
    `;
  }

  apiMenuTemplate() {
    const { isStored, indexItem } = this;
    if (!isStored) {
      return '';
    }
    const hasMultiVersion = !!indexItem && Array.isArray(indexItem.versions) && !!indexItem.versions.length;
    return html`
    <anypoint-menu-button
      verticalAlign="top"
      horizontalAlign="auto"
      closeOnActivate
      class="header-action-button"
    >
      <anypoint-icon-button slot="dropdown-trigger" ?anypoint="${this.anypoint}">
        <arc-icon icon="moreVert"></arc-icon>
      </anypoint-icon-button>
      <anypoint-listbox
        slot="dropdown-content"
        @selected="${this.apiActionMenuChanged}"
        ?anypoint="${this.anypoint}"
      >
        <anypoint-item data-action="delete">Delete API</anypoint-item>
        ${hasMultiVersion ? html`<anypoint-item data-action="delete-version">Delete version</anypoint-item>` : ''}
        <!-- <anypoint-item data-action="save-oas">Save as OAS</anypoint-item>
        <anypoint-item data-action="save-raml">Save as RAML</anypoint-item> -->
        <!-- <anypoint-item data-action="upload-exchange">Upload to Exchange</anypoint-item> -->
      </anypoint-listbox>
    </anypoint-menu-button>
    `;
  }

  apiVersionsTemplate() {
    const { isStored, indexItem } = this;
    if (!isStored) {
      return '';
    }
    const hasMultiVersion = !!indexItem && Array.isArray(indexItem.versions) && !!indexItem.versions.length;
    if (!hasMultiVersion) {
      return '';
    }
    return html`
    <anypoint-dropdown-menu
      class="api-version-selector"
      ?anypoint="${this.anypoint}"
      noLabelFloat
    >
      <label slot="label">API version</label>
      <anypoint-listbox
        id="apiVersionSelector"
        slot="dropdown-content"
        .selected="${this.apiVersion}"
        attrforselected="data-version"
        @selected="${this.apiVersionMenuHandler}"
        ?anypoint="${this.anypoint}"
      >
        ${indexItem.versions.map((item) => html`
          <anypoint-item data-version="${item}" ?anypoint="${this.anypoint}">${item}</anypoint-item>
        `)}
      </anypoint-listbox>
    </anypoint-dropdown-menu>
    `;
  }
}
