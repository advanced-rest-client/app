/**
@license
Copyright 2020 The Advanced REST client authors <arc@mulesoft.com>
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
/* eslint-disable class-methods-use-this */
import { LitElement, html } from 'lit-element';
import { cache } from 'lit-html/directives/cache.js';
import { SessionCookieEventTypes, SessionCookieEvents, ExportEvents, TelemetryEvents } from '@advanced-rest-client/events';
import '@advanced-rest-client/icons/arc-icon.js';
import '@anypoint-web-components/awc/anypoint-button.js';
import '@anypoint-web-components/awc/anypoint-icon-button.js';
import '@anypoint-web-components/awc/anypoint-icon-item.js';
import '@anypoint-web-components/awc/anypoint-item-body.js';
import '@anypoint-web-components/awc/bottom-sheet.js';
import '@anypoint-web-components/awc/anypoint-dialog.js';
import '@anypoint-web-components/awc/anypoint-selector.js';
import '../../../define/export-options.js';
import '../../../define/cookie-editor.js';
import '../../../define/cookie-details.js';
import elementStyles from '../styles/CookieManagerStyles.js';
import { filterItems, compareCookies, computeHasTwoLines, applyListStyles } from '../../lib/CookieUtils.js';

/** @typedef {import('@advanced-rest-client/events').SessionCookieDeletedEvent} SessionCookieDeletedEvent */
/** @typedef {import('@advanced-rest-client/events').SessionCookieUpdatedEvent} SessionCookieUpdatedEvent */
/** @typedef {import('@advanced-rest-client/events').Cookies.ARCCookie} ARCCookie */
/** @typedef {import('@advanced-rest-client/events').DataExport.ProviderOptions} ProviderOptions */
/** @typedef {import('@advanced-rest-client/events').DataExport.ExportOptions} ExportOptions */
/** @typedef {import('@anypoint-web-components/awc').AnypointDialogElement} AnypointDialog */
/** @typedef {import('@anypoint-web-components/awc').AnypointButtonElement} AnypointButton */
/** @typedef {import('@anypoint-web-components/awc').AnypointInputElement} AnypointInput */
/** @typedef {import('@anypoint-web-components/awc').AnypointSelectorElement} AnypointSelector */
/** @typedef {import('@anypoint-web-components/awc').BottomSheetElement} BottomSheetElement */

export const cookieDeleteHandler = Symbol('cookieDeleteHandler');
export const cookieUpdateHandler = Symbol('cookieUpdateHandler');
export const handleException = Symbol('handleException');
export const resetSearch = Symbol('resetSearch');
export const beforeQueryItemsValue = Symbol('beforeQueryItemsValue');
export const headerTemplate = Symbol('headerTemplate');
export const busyTemplate = Symbol('busyTemplate');
export const unavailableTemplate = Symbol('unavailableTemplate');
export const searchBarTemplate = Symbol('searchBarTemplate');
export const searchEmptyTemplate = Symbol('searchEmptyTemplate');
export const selectorTemplate = Symbol('selectorTemplate');
export const cookieDetailsTemplate = Symbol('cookieDetailsTemplate');
export const cookieEditorTemplate = Symbol('cookieEditorTemplate');
export const exportOptionsTemplate = Symbol('exportOptionsTemplate');
export const clearDialogTemplate = Symbol('clearDialogTemplate');
export const cookieActionsTemplate = Symbol('cookieActionsTemplate');
export const refreshHandler = Symbol('refreshHandler');
export const exportAllHandler = Symbol('exportAllHandler');
export const exportHandler = Symbol('exportHandler');
export const deleteAllHandler = Symbol('deleteAllHandler');
export const deleteHandler = Symbol('deleteHandler');
export const searchHandler = Symbol('searchHandler');
export const listSelectionHandler = Symbol('listSelectionHandler');
export const queryingValue = Symbol('deleteHandler');
export const listTemplate = Symbol('listTemplate');
export const listItemTemplate = Symbol('listItemTemplate');
export const openDetailsHandler = Symbol('openDetailsHandler');
export const editDetailsHandler = Symbol('openDetailsHandler');
export const actionCookieValue = Symbol('actionCookieValue');
export const resizeSheetHandler = Symbol('resizeSheetHandler');
export const closeSheetHandler = Symbol('closeSheetHandler');
export const cancelCookieEdit = Symbol('cancelCookieEdit');
export const saveCookieEdit = Symbol('saveCookieEdit');
export const clearDialogResultHandler = Symbol('clearDialogResultHandler');
export const listTypeValue = Symbol('listTypeValue');
export const twoLinesValue = Symbol('twoLinesValue');
export const updateListStyles = Symbol('updateListStyles');
export const getCookieIndex = Symbol('getCookieIndex');
export const queryValue = Symbol('queryValue');
export const nextInsertAtPositionValue = Symbol('nextInsertAtPositionValue');
export const deleteCookies = Symbol('deleteCookies');
export const exportItemsValue = Symbol('exportItemsValue');
export const acceptExportHandler = Symbol('acceptExportHandler');
export const cancelExportHandler = Symbol('cancelExportHandler');
export const doExportItems = Symbol('doExportItems');

const EventsCategory = 'Cookie Manager';

/**
 *
 * A manager for session cookies.
 * Renders list of cookies that can be edited.
 */
export default class CookieManagerElement extends LitElement {
  static get styles() {
    return elementStyles;
  }

  static get properties() {
    return {
      /**
       * Selected cookies.
       */
      selectedIndexes: { type: Array },
      /**
       * Changes information density of list items.
       * By default it uses material's item with two lines (72px height)
       * Possible values are:
       *
       * - `default` or empty - regular list view
       * - `comfortable` - enables MD single line list item vie (52px height)
       * - `compact` - enables list that has 40px height (touch recommended)
       */
      listType: { type: String, reflect: true, },
      /**
       * Enables outlined theme.
       */
      outlined: { type: Boolean },
      /**
       * Enables Anypoint theme.
       */
      anypoint: { type: Boolean },
      /**
       * List of cookies to render
       */
      items: { type: Array },
      /**
       * Current search query.
       */
      isSearch: { type: Boolean },
      /**
       * When true the cookie editor panel is rendered
       */
      editorOpened: { type: Boolean },
      /**
       * When true the cookie details panel is rendered
       */
      detailsOpened: { type: Boolean },
      /**
       * Indicates that the export options panel is currently rendered.
       */
      exportOptionsOpened: { type: Boolean },
    };
  }

  /**
   * @return {boolean} `true` if `items` is set and has cookies
   */
  get hasItems() {
    const { items } = this;
    return !!(items && items.length);
  }

  /**
   * @return {boolean} `true` when the lists is hidden.
   */
  get listHidden() {
    const { hasItems, isSearch } = this;
    if (isSearch) {
      return false;
    }
    return !hasItems;
  }

  /**
   * True when there's no items after refreshing the state.
   * @return {Boolean}
   */
  get dataUnavailable() {
    const { isSearch, items } = this;
    const querying = this[queryingValue];
    return !isSearch && !querying && !(items && items.length);
  }

  /**
   * Computed value. True when the query has been performed and no items
   * has been returned.
   *
   * @return {Boolean}
   */
  get searchListEmpty() {
    const { isSearch, items } = this;
    const querying = this[queryingValue];
    return !!isSearch && !querying && !(items && items.length);
  }

  get listType() {
    return this[listTypeValue];
  }

  set listType(value) {
    const old = this[listTypeValue];
    /* istanbul ignore if */
    if (old === value) {
      return;
    }
    this[listTypeValue] = value;
    this.requestUpdate('listType', old);
    this[twoLinesValue] = computeHasTwoLines(value);
    this[updateListStyles](value);
  }

  /**
   * This value is computed when the `listType` property change.
   * @return {boolean} True when the list should render two line layout
   */
  get twoLines() {
    return this[twoLinesValue] || false;
  }

  get hasSelection() {
    const items = this.selectedIndexes;
    return !!(items && items.length);
  }

  constructor() {
    super();
    this[cookieDeleteHandler] = this[cookieDeleteHandler].bind(this);
    this[cookieUpdateHandler] = this[cookieUpdateHandler].bind(this);

    this.anypoint = false;
    this.outlined = false;

    /**
     * @type {ARCCookie[]}
     */
    this.items = undefined;
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener(SessionCookieEventTypes.State.delete, this[cookieDeleteHandler]);
    window.addEventListener(SessionCookieEventTypes.State.update, this[cookieUpdateHandler]);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener(SessionCookieEventTypes.State.delete, this[cookieDeleteHandler]);
    window.removeEventListener(SessionCookieEventTypes.State.update, this[cookieUpdateHandler]);
  }

  /**
   * Clears a cookie from the list if matching cookie is n the list.
   * @param {SessionCookieDeletedEvent} e
   */
  [cookieDeleteHandler](e) {
    if (e.cancelable) {
      return;
    }
    const cookie = e.detail;
    const index = this[getCookieIndex](cookie);
    if (index === -1) {
      return;
    }
    if (this[nextInsertAtPositionValue]) {
      this[nextInsertAtPositionValue] = false;
      this._nextInsertPosition = index;
    }
    const { items } = this;
    items.splice(index, 1);
    this.requestUpdate();
    this.clearSelection();
    if (this[actionCookieValue] && compareCookies(cookie, this[actionCookieValue])) {
      this[actionCookieValue] = undefined;
      this.editorOpened = false;
      this.detailsOpened = false;
    }
  }

  /**
   * Updates the cookie on the list or adds new one.
   * @param {SessionCookieUpdatedEvent} e
   */
  [cookieUpdateHandler](e) {
    const cookie = e.detail;
    const index = this[getCookieIndex](cookie);
    if (!this.items) {
      this.items = /** @type ARCCookie[] */ ([]);
    }
    const { items } = this;
    if (index === -1) {
      if (!this.items) {
        items.push(cookie);
      } else if (this._nextInsertPosition !== undefined) {
        items.splice(this._nextInsertPosition, 0, cookie);
        this._nextInsertPosition = undefined;
      } else {
        items.push(cookie);
      }
    } else {
      items[index] = cookie;
    }
    this.requestUpdate();
  }

  firstUpdated() {
    if (!this.items) {
      this.reset();
      this.queryCookies();
    }
  }

  reset() {
    this[queryingValue] = false;
    this.items = undefined;
  }

  /**
   * Updates icon size CSS variable and notifies resize on the list when
   * list type changes.
   * @param {string=} type
   */
  [updateListStyles](type) {
    let size;
    switch (type) {
      case 'comfortable': size = 48; break;
      case 'compact': size = 36; break;
      default: size = 72; break;
    }
    applyListStyles(size, this);
  }

  /**
   * Handles an exception by sending exception details to GA.
   * @param {String} message A message to send.
   */
  [handleException](message) {
    this.errorMessage = message;
    TelemetryEvents.exception(this, message, false);
  }

  /**
   * Queries the hosting application for the list of cookies.
   * See events documentation for more details.
   *
   * @return {Promise<void>} Resolved when cookies are available.
   */
  async queryCookies() {
    this[queryingValue] = true;
    this.requestUpdate();
    try {
      this.items = await SessionCookieEvents.listAll(this);
    } catch (cause) {
      this.items = undefined;
      this[handleException](cause.message);
    }
    this[queryingValue] = false;
    this.requestUpdate();
  }

  /**
   * Resets the state after finishing search. It restores previous items
   * without changing query options.
   */
  [resetSearch]() {
    this.items = this[beforeQueryItemsValue];
    this.isSearch = false;
    this[beforeQueryItemsValue] = undefined;
    if (!this.items || !this.items.length) {
      this.queryCookies();
    }
  }

  [refreshHandler]() {
    this.reset();
    this.queryCookies();
    TelemetryEvents.event(this, {
      category: EventsCategory,
      action: 'Refresh cookies',
    });
  }

  /**
   * Performs a delete action of cookie items.
   *
   * @param {ARCCookie[]} cookies List of deleted items.
   * @return {Promise<void>}
   */
  async [deleteCookies](cookies) {
    try {
      await SessionCookieEvents.delete(this, [...cookies]);
    } catch (e) {
      this[handleException](e.message);
    }
    TelemetryEvents.event(this, {
      category: EventsCategory,
      action: 'Delete cookies',
    });
  }

  /**
   * Starts export flow for the entire datastore.
   */
  [exportAllHandler]() {
    this.exportOptionsOpened = true;
    this[exportItemsValue] = this.items;
    TelemetryEvents.event(this, {
      category: EventsCategory,
      action: 'Export all from delete dialog',
    });
  }

  /**
   * Starts the export flow depending on the selection state.
   */
  [exportHandler]() {
    const { selectedIndexes } = this;
    this.exportOptionsOpened = true;
    if (selectedIndexes && selectedIndexes.length) {
      const { items } = this;
      const cookies = selectedIndexes.map((index) => items[index]);
      this[exportItemsValue] = cookies;
    } else {
      this[exportItemsValue] = this.items;
    }
  }

  [deleteAllHandler]() {
    const dialog = /** @type AnypointDialog */ (this.shadowRoot.querySelector('#dataClearDialog'));
    // @ts-ignore
    dialog.opened = true;
  }

  [deleteHandler]() {
    const { selectedIndexes } = this;
    if (selectedIndexes && selectedIndexes.length) {
      const { items } = this;
      const cookies = selectedIndexes.map((index) => items[index]);
      this[deleteCookies](cookies);
    } else {
      this[deleteAllHandler]();
    }
  }

  /**
   * Handler for the `search` event on the search input.
   * Calls `query()` with input's value as argument.
   *
   * @param {Event} e
   */
  async [searchHandler](e) {
    const input = /** @type AnypointInput */ (e.target);
    const { value } = input;
    const old = this[queryValue];
    this[queryValue] = value;
    this.query(value);
    this.requestUpdate('queryValue', old);
  }

  [listSelectionHandler](e) {
    const value = e.detail.value || [];
    this.selectedIndexes = value;
  }

  /**
   * @param {PointerEvent} e
   */
  async [openDetailsHandler](e) {
    e.preventDefault();
    e.stopPropagation();

    this.detailsOpened = false;
    await this.updateComplete;
    this.detailsOpened = true;
    const button = /** @type AnypointButton */ (e.target);
    const { index } = button.dataset;
    const i = Number(index);
    this[actionCookieValue] = this.items[i];
    this.requestUpdate();
    TelemetryEvents.event(this, {
      category: EventsCategory,
      action: 'Opening cookie details',
    });
  }

  async [editDetailsHandler]() {
    this.detailsOpened = false;
    this.editorOpened = false;
    await this.updateComplete;
    this.editorOpened = true;

    TelemetryEvents.event(this, {
      category: EventsCategory,
      action: 'Opening cookie editor',
    });
  }

  [cancelCookieEdit]() {
    this.editorOpened = false;
    this[actionCookieValue] = undefined;
  }

  async [saveCookieEdit](e) {
    this.editorOpened = false;
    const oldCookie = this[actionCookieValue];
    this[actionCookieValue] = undefined;
    const cookie = e.detail;

    if (oldCookie && !compareCookies(oldCookie, cookie)) {
      this[nextInsertAtPositionValue] = true;
      await this[deleteCookies]([oldCookie]);
    }
    try {
      await SessionCookieEvents.update(this, cookie);
    } catch (cause) {
      this[handleException](cause.message);
    }
  }

  [resizeSheetHandler](e) {
    const sheet = /** @type BottomSheetElement */ (e.target);
    // @ts-ignore
    if (sheet && sheet.notifyResize) {
      // @ts-ignore
      sheet.notifyResize();
    }
  }

  [closeSheetHandler](e) {
    const sheet = /** @type BottomSheetElement */ (e.target);
    const prop = sheet.dataset.openProperty;
    this[prop] = e.detail.value;
  }

  /**
   * Called when delete datastore dialog is closed.
   * @param {CustomEvent} e
   */
  async [clearDialogResultHandler](e) {
    if (!e.detail.confirmed) {
      return;
    }
    await SessionCookieEvents.delete(this, [...this.items]);
  }

  /**
   * Handler for `accept` event dispatched by export options element.
   * @param {CustomEvent} e
   * @return {Promise} Result of calling `[doExportItems]()`
   */
  async [acceptExportHandler](e) {
    this.exportOptionsOpened = false;
    const { detail } = e;
    const provider = /** @type ProviderOptions */ (detail.providerOptions);
    const options = /** @type ExportOptions */ (detail.exportOptions);
    const cookies = this[exportItemsValue];
    this[exportItemsValue] = undefined;
    return this[doExportItems](cookies, provider, options);
  }

  [cancelExportHandler]() {
    this.exportOptionsOpened = false;
    this[exportItemsValue] = undefined;
  }

  /**
   * Calls `_dispatchExportData()` from requests lists mixin with
   * prepared arguments
   *
   * @param {ARCCookie[]} cookies List of cookies to export.
   * @param {ProviderOptions} provider Export provider configuration
   * @param {ExportOptions} options General export options
   * @return {Promise<void>}
   */
  async [doExportItems](cookies, provider, options) {
    // eslint-disable-next-line no-param-reassign
    options.kind = 'ARC#SessionCookies';
    const data = {
      cookies,
    };
    this.errorMessage = undefined;
    
    TelemetryEvents.event(this, {
      category: EventsCategory,
      action: 'export',
      label: options.provider,
    });
    try {
      const result = await ExportEvents.nativeData(this, data, options, provider);
      if (!result) {
        throw new Error('Certificates: Export module not found');
      }
      // if (detail.options.provider === 'drive') {
      //   // TODO: Render link to the folder
      // }
    } catch (err) {
      this.errorMessage = err.message;
      this[handleException](`Cookie Manager: ${err.message}`);
    }
    
  }

  /**
   * Performs a query on a list.
   *
   * @param {string} query The query to performs. Pass empty string
   * (or nothing) to reset the query.
   */
  query(query) {
    if (!query) {
      this[resetSearch]();
      return;
    }
    TelemetryEvents.event(this, {
      category: EventsCategory,
      action: 'query',
    });
    const items = this[beforeQueryItemsValue] || this.items;
    if (!items || !items.length) {
      return;
    }
    this.isSearch = true;
    if (!this[beforeQueryItemsValue]) {
      this[beforeQueryItemsValue] = this.items;
    }
    const lowerQuery = query.toLowerCase();
    const list = filterItems(items, lowerQuery);
    this.items = list;
  }

  /**
   * Returns cookie index on the `items` list.
   *
   * @param {ARCCookie} cookie A cookie object as in Electron API.
   * @return {number} Cookie index on the list or `-1` if not found.
   */
  [getCookieIndex](cookie) {
    const {items} = this;
    if (!items || !items.length) {
      return -1;
    }
    return items.findIndex((item) => compareCookies(item, cookie));
  }

  clearSelection() {
    const node = /** @type AnypointSelector */ (this.shadowRoot.querySelector('anypoint-selector'));
    if (node) {
      node.selectedValues = [];
    }
    TelemetryEvents.event(this, {
      category: EventsCategory,
      action: 'Clear selection',
    });
  }

  /**
   * Opens an empty cookie editor.
   */
  addCookie() {
    this[actionCookieValue] = undefined;
    this.editorOpened = true;
    TelemetryEvents.event(this, {
      category: EventsCategory,
      action: 'Add cookie button triggered',
    });
  }

  render() {
    return html`
    ${this[headerTemplate]()}
    ${this[busyTemplate]()}
    ${this[unavailableTemplate]()}
    ${this[searchBarTemplate]()}
    ${this[searchEmptyTemplate]()}
    ${this[selectorTemplate]()}
    ${this[cookieDetailsTemplate]()}
    ${this[cookieEditorTemplate]()}
    ${this[exportOptionsTemplate]()}
    ${this[clearDialogTemplate]()}
    `;
  }

  [headerTemplate]() {
    const { anypoint } = this;
    return html`
    <div class="header">
      <anypoint-icon-button
        aria-label="Activate to refresh the list"
        ?anypoint="${anypoint}"
        title="Refresh the list"
        @click="${this[refreshHandler]}"
        data-action="refresh-list"
      >
        <arc-icon icon="refresh" class="action-icon"></arc-icon>
      </anypoint-icon-button>
      <anypoint-icon-button
        aria-label="Activate to add a cookie"
        ?anypoint="${anypoint}"
        @click="${this.addCookie}"
        title="Add new cookie"
        data-action="add-cookie"
      >
        <arc-icon icon="add" class="action-icon"></arc-icon>
      </anypoint-icon-button>
      ${this[cookieActionsTemplate]()}
    </div>`;
  }

  [cookieActionsTemplate]() {
    const { anypoint, hasItems, hasSelection } = this;
    if (!hasItems) {
      return '';
    }
    return html`
    <anypoint-icon-button
      aria-label="Activate to export the list"
      ?anypoint="${anypoint}"
      @click="${this[exportHandler]}"
      title="${hasSelection ? 'Export selected' : 'Export all'}"
    >
      <arc-icon icon="archive" class="action-icon"></arc-icon>
    </anypoint-icon-button>
    <anypoint-icon-button
      aria-label="Activate to delete all on the list"
      ?anypoint="${anypoint}"
      @click="${this[deleteHandler]}"
      title="${hasSelection ? 'Delete selected' : 'Delete all'}"
    >
      <arc-icon icon="deleteIcon" class="action-icon"></arc-icon>
    </anypoint-icon-button>
    `;
  }

  [busyTemplate]() {
    if (!this[queryingValue]) {
      return '';
    }
    return html`<progress></progress>`;
  }

  [unavailableTemplate]() {
    const { dataUnavailable } = this;
    if (!dataUnavailable) {
      return '';
    }
    return html`
    <div class="empty-screen">
      <p class="empty-info">The cookie list is empty.</p>
      <p class="empty-info">Make a request to populate the list or add a cookie manually</p>
    </div>
    `;
  }

  [searchBarTemplate]() {
    const { anypoint, hasItems, isSearch } = this;
    if (!isSearch && !hasItems) {
      return '';
    }
    return html`
    <section class="secondary-header">
      <anypoint-input
        type="search"
        nolabelfloat
        @search="${this[searchHandler]}"
        ?anypoint="${anypoint}"
        class="search-input"
        ?outlined="${!anypoint}"
      >
        <label slot="label">Search</label>
        <arc-icon icon="search" slot="prefix"></arc-icon>
      </anypoint-input>
    </section>`;
  }

  [selectorTemplate]() {
    const { listHidden } = this;

    return cache(listHidden ? '' : html`
    <anypoint-selector
      class="list"
      selectable="anypoint-icon-item"
      multi
      role="listbox"
      aria-label="Select requests from the list"
      @selectedvalues-changed="${this[listSelectionHandler]}"
    >
      ${this[listTemplate]()}
    </anypoint-selector>`);
  }

  [listTemplate]() {
    const items = this.items || [];
    return items.map((item, index) => this[listItemTemplate](item, index));
  }

  /**
   * @param {any} item
   * @param {number} index
   */
  [listItemTemplate](item, index) {
    const { anypoint, twoLines } = this;
    const selected = this.selectedIndexes || [];
    return html`
    <anypoint-icon-item
      data-index="${index}"
      class="cookie-list-item"
      tabindex="-1"
      ?anypoint="${anypoint}"
    >
      <anypoint-checkbox
        slot="item-icon"
        .checked="${selected.indexOf(index) !== -1}"
        aria-label="Select or unselect this item"
      ></anypoint-checkbox>
      <anypoint-item-body
        ?twoline="${twoLines}"
        ?anypoint="${anypoint}"
      >
        <div class="cookie-value">
          <span class="cookie-name">${item.name}:</span>${item.value}</div>
        <div data-secondary>
          ${item.domain} ${item.path}
        </div>
      </anypoint-item-body>
      <anypoint-button
        data-index="${index}"
        class="list-action-button list-secondary-action"
        data-action="item-detail"
        ?anypoint="${anypoint}"
        @click="${this[openDetailsHandler]}"
        title="Open cookie details dialog"
      >Details</anypoint-button>
    </anypoint-icon-item>`;
  }

  [cookieDetailsTemplate]() {
    const { detailsOpened } = this;
    const cookie = detailsOpened ? this[actionCookieValue]: undefined;
    return html`
    <bottom-sheet
      class="bottom-sheet-container"
      data-open-property="detailsOpened"
      @opened="${this[resizeSheetHandler]}"
      @closed="${this[closeSheetHandler]}"
      .opened="${detailsOpened}"
    >
      <cookie-details
        .cookie="${cookie}"
        @edit="${this[editDetailsHandler]}"
      ></cookie-details>
    </bottom-sheet>`;
  }

  [cookieEditorTemplate]() {
    const { editorOpened, anypoint } = this;
    const cookie = editorOpened ? this[actionCookieValue]: undefined;
    return html`
    <bottom-sheet
      class="bottom-sheet-container"
      data-open-property="editorOpened"
      @opened="${this[resizeSheetHandler]}"
      @closed="${this[closeSheetHandler]}"
      .opened="${editorOpened}"
    >
      <cookie-editor
        id="requestEditor"
        .cookie="${cookie}"
        ?anypoint="${anypoint}"
        @cancel="${this[cancelCookieEdit]}"
        @save="${this[saveCookieEdit]}"
      ></cookie-editor>
    </bottom-sheet>`;
  }

  [exportOptionsTemplate]() {
    const {
      exportOptionsOpened,
      anypoint,
      outlined,
    } = this;
    return html`
    <bottom-sheet
      class="bottom-sheet-container"
      .opened="${exportOptionsOpened}"
      data-open-property="exportOptionsOpened"
      @opened="${this[resizeSheetHandler]}"
      @closed="${this[closeSheetHandler]}"
    >
      <export-options
        id="exportOptions"
        ?anypoint="${anypoint}"
        ?outlined="${outlined}"
        withEncrypt
        file="session-cookies.json"
        provider="file"
        @accept="${this[acceptExportHandler]}"
        @cancel="${this[cancelExportHandler]}"
      ></export-options>
    </bottom-sheet>`;
  }

  [clearDialogTemplate]() {
    const { anypoint } = this;
    return html`
    <anypoint-dialog
      id="dataClearDialog"
      ?anypoint="${anypoint}"
      @closed="${this[clearDialogResultHandler]}"
    >
      <h2>Remove all session cookies?</h2>
      <p>Maybe you should create a backup first?</p>
      <div class="buttons">
        <anypoint-button
          ?anypoint="${anypoint}"
          data-action="delete-export-all"
          @click="${this[exportAllHandler]}"
        >Create backup file</anypoint-button>
        <anypoint-button
          ?anypoint="${anypoint}"
          data-dialog-dismiss
        >Cancel</anypoint-button>
        <anypoint-button
          ?anypoint="${anypoint}"
          data-dialog-confirm
          class="action-button"
        >Confirm</anypoint-button>
      </div>
    </anypoint-dialog>`;
  }

  [searchEmptyTemplate]() {
    if (this.isSearch && this.searchListEmpty) {
      return html`
      <p class="empty-info">
        No cookies matching the query <b>${this[queryValue]}</b>.
      </p>
      <p class="empty-info">
        I looked in:
      </p>
      <ul class="empty-list-info">
        <li>name</li>
        <li>domain</li>
        <li>value</li>
        <li>path</li>
      </ul>
      <p class="empty-info">
        but these properties does not contain your query.
      </p>
      `;
    }
    return '';
  }
}
