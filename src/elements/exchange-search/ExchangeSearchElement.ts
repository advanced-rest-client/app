/* eslint-disable class-methods-use-this */
/* eslint-disable no-param-reassign */
/**
@license
Copyright 2018 The Advanced REST client authors <arc@mulesoft.com>
Licensed under the Apache License, Version 2.0 (the "License"); you may not
use this file except in compliance with the License. You may obtain a copy of
the License at
http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
License for the specific language governing permissions and limitations under
the License.
*/
import { LitElement, html, TemplateResult, CSSResult, PropertyValueMap } from 'lit';
import { StyleInfo, styleMap } from 'lit/directives/style-map.js';
import { classMap } from 'lit/directives/class-map.js';
import { property } from 'lit/decorators.js';
import { AnypointSignedInErrorType, AnypointSignedOutType, AnypointSignedInType, AnypointSigninElement } from '@anypoint-web-components/anypoint-signin';
import { AnypointIconButtonElement } from '@anypoint-web-components/awc';
import '@anypoint-web-components/awc/dist/define/anypoint-button.js';
import '@anypoint-web-components/awc/dist/define/anypoint-icon-button.js';
import '@anypoint-web-components/awc/dist/define/anypoint-input.js';
import '@anypoint-web-components/awc/dist/define/anypoint-icon-item.js';
import '@anypoint-web-components/awc/dist/define/anypoint-item-body.js';
import '@anypoint-web-components/awc/dist/define/star-rating.js';
import '@anypoint-web-components/anypoint-signin/anypoint-signin.js';
import { viewColumn, viewList, search, exchange } from '../icons/Icons.js';
import elementStyles from './Styles.js';
import { register, unregister, mediaResult } from './MediaQueryMatcher.js';
import { ExchangeAsset, MediaQueryResult } from './types.js';

export const exchangeBaseUri = 'https://anypoint.mulesoft.com/exchange/api/v2';
export const assetsUri = '/assets';

export const authHeaderValue = Symbol('authHeaderValue');
export const columnsValue = Symbol('columnsValue');
export const attachMediaQueries = Symbol('attachMediaQueries');
export const detachMediaQueries = Symbol('detachMediaQueries');
export const mediaQueryHandler = Symbol('mediaQueryHandler');
export const processMediaResult = Symbol('processMediaResult');
export const oauthCallback = Symbol('oauthCallback');
export const queryingValue = Symbol('queryingValue');
export const notifyQuerying = Symbol('notifyQuerying');
export const scrollHandler = Symbol('scrollHandler');
export const queryInputHandler = Symbol('queryInputHandler');
export const queryKeydownHandler = Symbol('queryKeydownHandler');
export const querySearchHandler = Symbol('querySearchHandler');
export const computeColumns = Symbol('computeColumns');
export const columnsValueLocal = Symbol('columnsValueLocal');
export const accessTokenValue = Symbol('accessTokenValue');
export const typeValue = Symbol('typeValue');
export const typeChanged = Symbol('typeChanged');
export const anypointAuthValue = Symbol('anypointAuthValue');
export const anypointAuthChanged = Symbol('anypointAuthChanged');
export const listenOauth = Symbol('listenOauth');
export const unlistenOauth = Symbol('unlistenOauth');
export const itemActionHandler = Symbol('itemActionHandler');
export const accessTokenChanged = Symbol('accessTokenChanged');
export const setupAuthHeaders = Symbol('setupAuthHeaders');
export const notifyTokenExpired = Symbol('notifyTokenExpired');
export const exchangeResponseError = Symbol('exchangeResponseError');
export const exchangeResponse = Symbol('exchangeResponse');
export const enableGrid = Symbol('enableGrid');
export const enableList = Symbol('enableList');
export const signedInHandler = Symbol('signedInHandler');
export const accessTokenHandler = Symbol('accessTokenHandler');
export const authButtonTemplate = Symbol('authButtonTemplate');
export const headerTemplate = Symbol('headerTemplate');
export const searchTemplate = Symbol('searchTemplate');
export const busyTemplate = Symbol('busyTemplate');
export const listTemplate = Symbol('listTemplate');
export const emptyTemplate = Symbol('emptyTemplate');
export const renderItem = Symbol('renderItem');
export const renderGridItem = Symbol('renderGridItem');
export const renderListItem = Symbol('renderListItem');
export const ratingTemplate = Symbol('ratingTemplate');
export const itemIconTemplate = Symbol('itemIconTemplate');
export const actionButtonTemplate = Symbol('actionButtonTemplate');
export const handleUnauthorized = Symbol('handleUnauthorized');

/**
 * An element that displays an UI to search Anypoint Exchange for RAML (REST API) resources.
 *
 * It handles queries to the exchange server, displays list of results, handles user query
 * and informs the application when the user request asset details.
 *
 * It dispatches `process-exchange-asset-data` custom event when user requested
 * an action to be performed on the asset. Default label for an action is
 * `Download` but it can be changed by setting `actionLabel` property.
 *
 * ### Example
 *
 * ```html
 * <exchange-search
 *  @selected="_getAssetDetails"
 *  actionLabel="Details"></exchange-search>
 * ```
 */
export default class ExchangeSearchElement extends LitElement {
  static get styles(): CSSResult[] {
    return [elementStyles];
  }

  [queryingValue] = false;

  /**
   * @returns `true` when the element is querying the API for the data.
   */
  get querying(): boolean {
    return this[queryingValue];
  }

  /**
   * @returns `true` if the `items` property has values.
   */
  get hasItems(): boolean {
    const { items } = this;
    return !!(items && items.length);
  }

  /**
   * @returns `true` if query ended and there's no results.
   */
  get dataUnavailable(): boolean {
    const { hasItems, querying } = this;
    return !hasItems && !querying;
  }

  get queryParams(): Record<string, string | string[]> {
    const { exchangeLimit, exchangeOffset, query, types } = this;
    const params: Record<string, string | string[]> = {};
    if (types.length) {
      params.types = types;
    }
    if (Number.isInteger(exchangeLimit)) {
      params.limit = String(exchangeLimit);
    }
    if (Number.isInteger(exchangeOffset)) {
      params.offset = String(exchangeOffset);
    }
    if (query) {
      params.search = query;
    }
    return params;
  }

  /**
   * Parses list of types to an array of types.
   * If the argument is array then it returns the same array.
   *
   * Note, this always returns array, even if the argument is empty.
   * @returns List of asset types.
   */
  get types(): string[] {
    const { type } = this;
    if (!type) {
      return [];
    }
    if (Array.isArray(type)) {
      return type;
    }
    if (type.indexOf(',') !== -1) {
      return type.split(',').map((item) => item.trim());
    }
    return [type];
  }

  get effectivePanelTitle(): string {
    const { panelTitle, type } = this;
    if (panelTitle) {
      return panelTitle;
    }
    const prefix = 'Explore ';
    let content;
    switch (type) {
      case 'rest-api': content = 'REST APIs'; break;
      case 'connector': content = 'connectors'; break;
      case 'template': content = 'templates'; break;
      case 'example': content = 'examples'; break;
      case 'soap-api': content = 'SOAP APIs'; break;
      case 'raml-fragment': content = 'API fragments'; break;
      case 'custom': content = 'custom assets'; break;
      default: content = 'Exchange assets';
    }
    return prefix + content;
  }

  /**
   * if true then it renders "load more" button below the list
   */
  get renderLoadMore(): boolean {
    const { querying, noMoreResults } = this;
    return !querying && !noMoreResults;
  }

  [typeValue]?: string;

  /**
   * Exchange's asset type to search.
   * Note that this also determines the title of panel unless you set
   * `panelTitle` property.
   */
  @property()
  get type(): string | undefined {
    return this[typeValue];
  }

  set type(value: string | undefined) {
    const old = this[typeValue];
    if (old === value) {
      return;
    }
    this[typeValue] = value;
    this[typeChanged](old);
  }

  [anypointAuthValue]?: boolean;

  /**
   * If true it renders the authorize button.
   * See `@anypoint-web-components/anypoint-signin` element for
   * more info.
   */
  @property({ type: Boolean })
  get anypointAuth(): boolean | undefined {
    return this[anypointAuthValue];
  }

  set anypointAuth(value: boolean | undefined) {
    const old = this[anypointAuthValue];
    /* istanbul ignore if */
    if (old === value) {
      return;
    }
    this[anypointAuthValue] = value;
    this[anypointAuthChanged](value);
  }

  [accessTokenValue]?: string;

  /**
   * User access token to authorize the requests in the exchange
   */
  @property({ type: String })
  get accessToken(): string | undefined {
    return this[accessTokenValue];
  }

  set accessToken(value: string | undefined) {
    const old = this[accessTokenValue];
    if (old === value) {
      return;
    }
    this[accessTokenValue] = value;
    this[accessTokenChanged](value, old);
  }

  [columnsValue]?: number;

  [columnsValueLocal]: number | string | undefined;

  /**
   * Number of columns to render in "grid" view.
   * Set to `auto` to use media queries to determine pre set number of colum
   * depending on the screen size. It won't checks for element size so
   * do not use `auto` when embedding the element not as whole width
   * view.
   */
  @property({ type: String })
  get columns(): number | string | undefined {
    return this[columnsValueLocal];
  }

  set columns(value) {
    const old = this[columnsValueLocal];
    if (old === value) {
      return;
    }
    // 0 is no value.
    if (value) {
      const typedNumber = Number(value);
      if (Number.isNaN(typedNumber)) {
        this[columnsValueLocal] = value;
      } else {
        this[columnsValueLocal] = typedNumber;
      }
    } else {
      this[columnsValueLocal] = undefined
    }
    this[computeColumns]();
    this.requestUpdate('columns', old);
  }

  /**
   * Saved items restored from the datastore.
   */
  @property({ type: Array })
  items?: ExchangeAsset[];

  /**
   * Search query for the list.
   */
  @property({ type: String })
  query?: string;

  /**
   * True if the Grid view is active
   */
  @property({ type: Boolean })
  listView?: boolean;
  
  /**
   * Enables Anypoint theme
   */
  @property({ type: Boolean })
  anypoint?: boolean;

  /**
   * Enables material's outlined theme for inputs.
   */
  @property({ type: Boolean })
  outlined?: boolean;

  /**
   * Rows offset in the Exchange's query.
   */
  @property({ type: Number })
  exchangeOffset?: number;

  /**
   * Limit of the results in single query to the Exchange's API.
   */
  @property({ type: Number })
  exchangeLimit?: number;

  /**
   * Use this to set panel title value. By default is uses `type`
   * property to determine the title. When this property is set the title
   * will always be as the value defined in this property regardless the value
   * of `type`.
   */
  @property({ type: String })
  panelTitle?: string;

  /**
   * Padding in pixels that will trigger query to the Exchange server
   * when the user scrolls the list.
   */
  @property({ type: Number })
  listOffsetTrigger?: number;

  /**
   * Set when no more results are available for current offset - limit
   * values.
   */
  @property({ type: Boolean })
  noMoreResults?: boolean;

  /**
   * The `redirect_uri` parameter of the OAuth2 request.
   * It must be set when `anypointAuth` is true or otherwise it will throw an
   * error when trying to request the token.
   */
  @property({ type: String })
  exchangeRedirectUri?: string;

  /**
   * Registered within the exchange client id for OAuth2 calls.
   * It must be set when `anypointAuth` is true or otherwise it will throw an
   * error when trying to request the token.
   */
  @property({ type: String })
  exchangeClientId?: string;

  /**
   * Computed value, true when access token is set.
   */
  @property({ type: Boolean })
  signedIn?: boolean;

  /**
   * Forces `anypoint-signin` element to use ARC's OAuth events.
   */
  @property({ type: Boolean })
  forceOauthEvents?: boolean;

  /**
   * Flag indicating the authorization process has been initialized
   */
  @property({ type: Boolean })
  authInitialized?: boolean;

  /**
   * Label to display in main action button of a list item.
   * Default is `Download`.
   */
  @property({ type: String })
  actionLabel?: string;

  /**
   * When set the component will not query the Exchange for assets when
   * attached to DOM or when authentication state change.
   */
  @property({ type: Boolean })
  noAuto?: boolean;

  /** 
   * The API base URI to use to construct the assets query URL.
   * This is mainly used to switch Exchange's environments.
   * When not set the public base URI is used.
   */
  @property({ type: String })
  apiBase?: string;

  [authHeaderValue]?: string;

  constructor() {
    super();
    this.exchangeOffset = 0;
    this.exchangeLimit = 20;
    this.type = 'rest-api';
    this.listOffsetTrigger = 120;
    this.columns = 4;
    this.actionLabel = 'Download';

    this[oauthCallback] = this[oauthCallback].bind(this);
    this[mediaQueryHandler] = this[mediaQueryHandler].bind(this);
  }

  protected firstUpdated(cp: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
    super.firstUpdated(cp);
    const toggle = this.shadowRoot?.querySelector('[data-action="grid-enable"]') as AnypointIconButtonElement | null;
    if (toggle) {
      toggle.active = true;
    }

    if (!this.anypointAuth) {
      this.authInitialized = true;
      if (!this.noAuto) {
        this.updateSearch();
      }
    }
  }

  connectedCallback(): void {
    super.connectedCallback();
    this[attachMediaQueries]();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this[detachMediaQueries]();
  }

  [attachMediaQueries](): void {
    register(this[mediaQueryHandler]);
  }

  [detachMediaQueries](): void {
    unregister();
  }

  [mediaQueryHandler](result: MediaQueryResult[]): void {
    const { columns } = this;
    const typedColumns = Number(columns);
    if (!Number.isNaN(typedColumns)) {
      // does not set the media query value when columns value is set
      return;
    }
    this[processMediaResult](result);
  }

  [processMediaResult](result: MediaQueryResult[]): void {
    const matched = result.find((item) => item.matches);
    const value = matched ? matched.value : 1;
    this[columnsValue] = value;
    this.requestUpdate();
  }

  [notifyQuerying](): void {
    this.dispatchEvent(new CustomEvent('queryingchange'));
  }

  /**
   * Resets element state so it re-enables querying.
   */
  reset(): void {
    this.items = /** @type ExchangeAsset[] */ ([]);
    this.exchangeOffset = 0;
    this.noMoreResults = false;
    this[queryingValue] = false;
    this[notifyQuerying]();
    this.requestUpdate();
  }

  /**
   * Handler for grid view button click
   */
  [enableGrid](): void {
    if (this.listView) {
      this.listView = false;
    }
    const toggle = this.shadowRoot?.querySelector('[data-action="list-enable"]') as AnypointIconButtonElement | null;
    if (toggle) {
      toggle.active = false;
    }
  }

  /**
   * Handler for list view button click
   */
  [enableList](): void {
    if (!this.listView) {
      this.listView = true;
    }
    const toggle = this.shadowRoot?.querySelector('[data-action="grid-enable"]') as AnypointIconButtonElement | null;
    if (toggle) {
      toggle.active = false;
    }
  }

  /**
   * Resets current list of results and makes a query to the Exchange server.
   * It will use current value of search query (which might be empty) to
   * search for an asset.
   */
  async updateSearch(): Promise<void> {
    this.reset();
    await this.updateComplete;
    this.queryCurrent();
  }

  [queryKeydownHandler](e: KeyboardEvent): void {
    if (e.key === 'Enter') {
      e.preventDefault();
      this.updateSearch();
    }
  }

  [querySearchHandler](e: Event): void {
    const input = (e.target as HTMLInputElement);
    if (!input.value) {
      this.updateSearch();
    }
  }

  /**
   * @returns The base URI of the query endpoint.
   */
  getAssetsUri(): string {
    const { apiBase=exchangeBaseUri } = this;
    let base = apiBase;
    if (base.endsWith('/')) {
      base = base.substring(0, base.length - 1);
    }
    return `${base}${assetsUri}`;
  }

  /**
   * Makes a query to the exchange server for more data.
   * It uses current `queryParams` to generate request.
   */
  async queryCurrent(): Promise<void> {
    if (this.querying) {
      return;
    }
    const { queryParams } = this;
    const authHeader = this[authHeaderValue];
    this[queryingValue] = true;
    this[notifyQuerying]();
    this.requestUpdate();
    const url = new URL(this.getAssetsUri());
    Object.keys(queryParams).forEach(key => {
      const value = queryParams[key];
      if (typeof value !== 'undefined') {
        url.searchParams.append(key, String(value))
      }
    });
    const headers: Record<string, string> = {};
    if (authHeader) {
      headers.authorization = authHeader;
    }
    try {
      const response = await fetch(url.toString(), { headers });
      if (response.status === 401) {
        this[handleUnauthorized]();
        return;
      }
      const data = await response.json() as ExchangeAsset[];
      this[exchangeResponse](data);
    } catch (e) {
      this[exchangeResponseError](e as Error);
    }
  }

  [exchangeResponse](data: ExchangeAsset[]): void {
    if (!data || !data.length) {
      this.noMoreResults = true;
      this[queryingValue] = false;
      this[notifyQuerying]();
      this.requestUpdate();
      return;
    }
    const { exchangeLimit, items=[] } = this;
    if (exchangeLimit && data.length < exchangeLimit) {
      this.noMoreResults = true;
    }
    const newValue = items.concat(data);
    if (!this.exchangeOffset) {
      this.exchangeOffset = 0;
    }
    this.exchangeOffset += data.length;
    this.items = newValue;
    this[queryingValue] = false;
    this[notifyQuerying]();
    this.requestUpdate();
  }

  /**
   * Processes the 401 status code.
   */
  [handleUnauthorized](): void {
    // token expired
    this.accessToken = undefined;
    this.signedIn = false;
    this[notifyTokenExpired]();
    this[queryingValue] = false;
    this[notifyQuerying]();
    this.requestUpdate();
  }

  [exchangeResponseError](e: Error): void {
    this[queryingValue] = false;
    this[notifyQuerying]();
    this.requestUpdate();
    // eslint-disable-next-line no-console
    console.info(e);
  }

  /**
   * Dispatches the `tokenexpired` event
   */
  [notifyTokenExpired](): void {
    this.dispatchEvent(new Event('tokenexpired'));
  }

  /**
   * Reacts to `scrollTarget` scroll event. If the scroll Y position to the
   * bottom of the list is less than `listOffsetTrigger` then it triggers
   * query function.
   *
   * Note, if `noMoreResults` flag is set it will never query for more data.
   * You have to manually clear the property.
   */
  [scrollHandler](e: Event): void {
    if (this.querying || this.noMoreResults) {
      return;
    }
    const node = e.target as HTMLDivElement;
    const padding = node.scrollHeight - (node.clientHeight + node.scrollTop);
    const { listOffsetTrigger = 0 } = this;
    if (padding <= listOffsetTrigger) {
      this.queryCurrent();
    }
  }

  /**
   * Dispatches non-bubbling `selected` event with the selected item on the detail.
   */
  [itemActionHandler](e: CustomEvent): void {
    const { items } = this;
    if (!items) {
      return;
    }
    const node = e.target as HTMLElement;
    const index = Number(node.dataset.index);
    const item = items[index];
    this.dispatchEvent(new CustomEvent('selected', {
      detail: item
    }));
  }

  [anypointAuthChanged](state?: boolean): void {
    if (state) {
      this[listenOauth]();
    } else {
      this[unlistenOauth]();
    }
  }

  [listenOauth](): void {
    this.addEventListener(AnypointSignedInErrorType, this[oauthCallback]);
    this.addEventListener(AnypointSignedOutType, this[oauthCallback]);
    this.addEventListener(AnypointSignedInType, this[oauthCallback]);
  }

  [unlistenOauth](): void {
    this.removeEventListener(AnypointSignedInErrorType, this[oauthCallback]);
    this.removeEventListener(AnypointSignedOutType, this[oauthCallback]);
    this.removeEventListener(AnypointSignedInType, this[oauthCallback]);
  }

  [oauthCallback](): void {
    if (!this.authInitialized) {
      this.authInitialized = true;
    }
    if (!this.noAuto) {
      this.updateSearch();
    }
  }

  /**
   * Calls `[setupAuthHeaders]()` function when token value change.
   */
  [accessTokenChanged](token?: string, old?: string): void {
    if (token && !this.authInitialized && !this.noAuto) {
      this.authInitialized = true;
      this.queryCurrent();
    }
    if (!old && !token) {
      return;
    }
    this[setupAuthHeaders](token);
  }

  /**
   * Sets up the authorization header
   *
   * @param token Oauth 2 token value for Anypoint.
   */
  [setupAuthHeaders](token?: string): void {
    if (token) {
      this[authHeaderValue] = `Bearer ${token}`;
    } else {
      this[authHeaderValue] = undefined;
    }
  }

  [typeChanged](old?: string): void {
    if (old === undefined) {
      // Initialization.
      return;
    }
    this.updateSearch();
  }

  /**
   * Computes an effective value of `columns` property.
   * If first argument is a number this will be used as a number of columns.
   * Otherwise it uses media queries to determine the sate.
   */
  [computeColumns](): void {
    const { columns } = this;
    const typedColumns = Number(columns);
    if (!Number.isNaN(typedColumns)) {
      this[columnsValue] = typedColumns;
      this.requestUpdate();
    } else {
      const result = mediaResult();
      this[processMediaResult](result);
    }
  }

  [signedInHandler](e: Event): void {
    const button = e.target as AnypointSigninElement;
    this.signedIn = button.signedIn;
    if (!button.signedIn && !this.authInitialized) {
      this.authInitialized = true;
      this.queryCurrent();
    }
  }

  [accessTokenHandler](e: Event): void {
    const button = e.target as AnypointSigninElement;
    this.accessToken = button.accessToken;
  }

  [queryInputHandler](e: Event): void {
    const input = e.target as HTMLInputElement;
    this.query = input.value;
  }

  render(): TemplateResult {
    const { dataUnavailable } = this;
    return html`
    ${this[headerTemplate]()}
    ${this[searchTemplate]()}
    ${this[busyTemplate]()}
    ${dataUnavailable ? this[emptyTemplate]() : this[listTemplate]()}
    `;
  }

  /**
   * @returns The template for the element's header 
   */
  [headerTemplate](): TemplateResult {
    const {
      effectivePanelTitle,
      anypointAuth
    } = this;
    return html`<div class="header">
      <h2>${effectivePanelTitle}</h2>
      <div class="header-actions">
        ${anypointAuth ? this[authButtonTemplate]() : ''}
        <anypoint-icon-button
          data-action="grid-enable"
          toggles
          @click="${this[enableGrid]}"
          class="toggle-view"
        >
          <span class="icon">${viewColumn}</span>
        </anypoint-icon-button>
        <anypoint-icon-button
          data-action="list-enable"
          toggles
          @click="${this[enableList]}"
          class="toggle-view"
        >
          <span class="icon">${viewList}</span>
        </anypoint-icon-button>
      </div>
    </div>`;
  }

  /**
   * @returns The template for authorization button
   */
  [authButtonTemplate](): TemplateResult {
    const {
      anypoint,
      authInitialized,
      exchangeRedirectUri,
      exchangeClientId,
      forceOauthEvents
    } = this;
    const material = !anypoint;
    return html`
    <anypoint-signin
      ?material="${material}"
      ?disabled="${!authInitialized}"
      class="auth-button"
      .redirectUri="${exchangeRedirectUri || ''}"
      .clientId="${exchangeClientId || ''}"
      scopes="read:exchange"
      @signedinchange="${this[signedInHandler]}"
      @accesstokenchange="${this[accessTokenHandler]}"
      ?forceOauthEvents="${forceOauthEvents}"
      width="wide"
    ></anypoint-signin>`;
  }

  /**
   * @returns The template for the search input
   */
  [searchTemplate](): TemplateResult {
    const {
      anypoint,
      outlined,
      query
    } = this;
    return html`
    <div class="search-bar">
      <anypoint-input
        nolabelfloat
        ?anypoint="${anypoint}"
        ?outlined="${outlined}"
        type="search"
        .value="${query}"
        aria-label="Search Anypoint Exchange"
        @input="${this[queryInputHandler]}"
        @keydown="${this[queryKeydownHandler]}"
        @search="${this[querySearchHandler]}"
        label="Search Anypoint Exchange"
      >
        <anypoint-icon-button
          title="Search"
          slot="suffix"
          @click="${this.updateSearch}"
        >
          <span class="icon">${search}</span>
        </anypoint-icon-button>
      </anypoint-input>
    </div>
    `;
  }

  /**
   * @returns The template for the loader
   */
  [busyTemplate](): TemplateResult | string {
    const { querying, authInitialized } = this;
    if (!authInitialized) {
      return html`<div class="connecting-info">
        <p>Connecting to Anypoint Exchange</p>
        <progress></progress>
      </div>`;
    }
    if (querying) {
      return html`<progress></progress>`;
    }
    return '';
  }

  /**
   * @returns The template for the empty search result
   */
  [emptyTemplate](): TemplateResult {
    return html`<p class="empty-info">Couldn't find requested API.</p>`;
  }

  /**
   * @returns The template for the results list
   */
  [listTemplate](): TemplateResult {
    const { listView=false, renderLoadMore, items = [] } = this;
    const listStyles: StyleInfo = ({
      gridTemplateColumns: listView ? '' : `repeat(${this[columnsValue]}, 1fr)`,
    });
    const classes = {
      list: true,
      grid: !listView,
    }
    return html`
    <div class="list-wrapper" @scroll="${this[scrollHandler]}">
      <section class="${classMap(classes)}" style="${styleMap(listStyles)}">
      ${items.map((item, index) => this[renderItem](listView, item, index))}
      </section>
      ${renderLoadMore ? html`<div class="load-more">
        <anypoint-button
          emphasis="medium"
          class="action-button"
          @click="${this.queryCurrent}"
        >Load more</anypoint-button>
      </div>` : ''}
    </div>
    `;
  }

  [renderItem](listView: boolean, item: ExchangeAsset, index: number): TemplateResult {
    return listView ? this[renderListItem](item, index) : this[renderGridItem](item, index);
  }

  [renderListItem](item: ExchangeAsset, index: number): TemplateResult {
    return html`<anypoint-icon-item class="list-item">
      ${this[itemIconTemplate](item)}
      <anypoint-item-body twoline>
        <div class="top-line">
          <div class="name">${item.name}</div>
          ${this[ratingTemplate](item)}
        </div>
        <div data-secondary class="details">
          <p class="meta creator">by ${item.organization.name}</p>
        </div>
      </anypoint-item-body>
      ${this[actionButtonTemplate](index)}
    </anypoint-icon-item>`;
  }

  [renderGridItem](item: ExchangeAsset, index: number): TemplateResult {
    const { organization } = item;
    const orgName = organization && organization.name;
    return html`
    <div class="card grid-item">
      <section class="content">
        <div class="title">
          ${this[itemIconTemplate](item)}
          <div class="name">${item.name}</div>
        </div>
        <p class="creator">by ${orgName}</p>
        <div class="rating">
          ${this[ratingTemplate](item)}
        </div>
      </section>
      <div class="actions">
        ${this[actionButtonTemplate](index)}
      </div>
    </div>`;
  }

  /**
   * @returns Template for the rating element
   */
  [ratingTemplate](item: ExchangeAsset): TemplateResult {
    const value = item.rating || 0;
    return html`<star-rating
      .value="${item.rating}"
      readonly
      title="Api rating: ${value}/5"
      tabindex="-1"
    ></star-rating>`;
  }

  /**
   * @returns The template for the asset's icon
   */
  [itemIconTemplate](item: ExchangeAsset): TemplateResult {
    if (!item.icon) {
      return html`<span class="default-icon thumb" slot="item-icon">${exchange}</span>`; 
    }
    const map = {
      backgroundImage: `url('${item.icon}')`,
    };
    return html`<span
      class="thumb"
      slot="item-icon"
      style="${styleMap(map)}"
    ></span>`;
  }

  /**
   * @returns Template for the action button
   */
  [actionButtonTemplate](index: number): TemplateResult {
    const {
      anypoint,
      actionLabel
    } = this;
    return html`
    <anypoint-button
      ?anypoint="${anypoint}"
      data-index="${index}"
      @click="${this[itemActionHandler]}"
      class="open-button"
    >${actionLabel}</anypoint-button>`;
  }
}
