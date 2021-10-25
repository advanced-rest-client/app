/* eslint-disable class-methods-use-this */
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
/* eslint-disable no-plusplus */
import { LitElement, html } from 'lit-element';
import { classMap } from 'lit-html/directives/class-map.js';
import '@anypoint-web-components/awc/anypoint-button.js';
import '@anypoint-web-components/awc/anypoint-icon-button.js';
import '@advanced-rest-client/icons/arc-icon.js';
import '@anypoint-web-components/awc/anypoint-menu-button.js';
import '@anypoint-web-components/awc/anypoint-listbox.js';
import '@anypoint-web-components/awc/anypoint-icon-item.js';
import '@anypoint-web-components/awc/anypoint-dialog.js';
import '@anypoint-web-components/awc/bottom-sheet.js';
import { ArcModelEvents, ArcNavigationEvents, ExportEvents, TelemetryEvents } from '@advanced-rest-client/events';
import '../../../define/export-options.js';
import '../../../define/saved-menu.js';
import '../../../define/history-menu.js';
import '../../../define/rest-api-menu.js';
import '../../../define/projects-menu.js';
import '../../../define/search-menu.js';
import menuStyles from './styles/ArcMenu.js';

/** @typedef {import('@anypoint-web-components/awc').AnypointListboxElement} AnypointListbox */
/** @typedef {import('@anypoint-web-components/awc').AnypointIconButtonElement} AnypointIconButton */
/** @typedef {import('@advanced-rest-client/events').DataExport.ProviderOptions} ProviderOptions */
/** @typedef {import('@advanced-rest-client/events').DataExport.ExportOptions} ExportOptions */
/** @typedef {import('./HistoryMenuElement').default} HistoryMenuElement */
/** @typedef {import('lit-element').TemplateResult} TemplateResult */

export const historyValue = Symbol('historyValue');
export const historyChanged = Symbol('historyChanged');
export const hideHistoryValue = Symbol('hideHistoryValue');
export const hideHistoryChanged = Symbol('hideHistoryChanged');
export const hideSavedValue = Symbol('hideSavedValue');
export const hideSavedChanged = Symbol('hideSavedChanged');
export const hideProjectsValue = Symbol('hideProjectsValue');
export const hideProjectsChanged = Symbol('hideProjectsChanged');
export const hideApisValue = Symbol('hideApisValue');
export const hideApisChanged = Symbol('hideApisChanged');
export const refreshList = Symbol('refreshList');
export const selectFirstAvailable = Symbol('selectFirstAvailable');
export const updateSelectionIfNeeded = Symbol('updateSelectionIfNeeded');
export const dragoverHandler = Symbol('dragoverHandler');
export const dragleaveHandler = Symbol('dragleaveHandler');
export const dragTypeCallbackValue = Symbol('dragTypeCallbackValue');
export const dragOverTimeoutValue = Symbol('dragOverTimeoutValue');
export const cancelDragTimeout = Symbol('cancelDragTimeout');
export const openMenuDragOver = Symbol('openMenuDragOver');
export const historyTemplate = Symbol('historyTemplate');
export const savedTemplate = Symbol('savedTemplate');
export const projectsTemplate = Symbol('projectsTemplate');
export const apisTemplate = Symbol('apisTemplate');
export const searchMenuTemplate = Symbol('searchMenuTemplate');
export const openedValue = Symbol('openedValue');
export const effectiveSelected = Symbol('effectiveSelected');
export const railTemplate = Symbol('railTemplate');
export const panelsTemplate = Symbol('panelsTemplate');
export const railClickHandler = Symbol('railClickHandler');
export const contextMenuSelectedHandler = Symbol('contextMenuSelectedHandler');
export const runHistoryAction = Symbol('runHistoryAction');
export const runSavedAction = Symbol('runSavedAction');
export const runProjectAction = Symbol('runProjectAction');
export const runRestApiAction = Symbol('runRestApiAction');
export const acceptExportOptions = Symbol('acceptExportOptions');
export const cancelExportOptions = Symbol('cancelExportOptions');
export const exportRequestHandler = Symbol('exportRequestHandler');
export const exportTemplate = Symbol('exportTemplate');
export const sheetClosedHandler = Symbol('sheetClosedHandler');
export const exportTypeValue = Symbol('exportTypeValue');
export const deleteAllTemplate = Symbol('deleteAllTemplate');
export const deleteDialogCloseHandler = Symbol('deleteDialogCloseHandler');
export const deleteAllHandler = Symbol('deleteAllHandler');
export const deleteTypeValue = Symbol('deleteTypeValue');
export const notifyMinimized = Symbol('notifyMinimized');
export const hideSearchValue = Symbol('hideSearchValue');
export const hideSearchChanged = Symbol('hideSearchChanged');
export const runSearchAction = Symbol('runSearchAction');
export const notifySelection = Symbol('notifySelection');

const telemetryCategory = 'ARC menu';

/**
 * Finds menu item element in event path.
 * @param {Event} e Event with `path` or `composedPath()`
 * @return {AnypointIconButton|undefined}
 */
export function findTab(e) {
  const path = e.composedPath();
  for (let i = 0, len = path.length; i < len; i++) {
    const target = /** @type HTMLElement */ (path[i]);
    if (target.matches && target.matches('.rail .menu-item')) {
      return /** @type AnypointIconButton */ (target);
    }
  }
  return undefined;
}

/**
 * A list of types of the menu elements.
 */
export const MenuTypes = {
  history: 'history',
  saved: 'saved',
  projects: 'projects',
  apiDocs: 'apiDocs',
  search: 'search',
};

export const popupAriaLabels = {
  [MenuTypes.history]: 'Popup history menu',
  [MenuTypes.saved]: 'Popup saved menu',
  [MenuTypes.projects]: 'Popup projects menu',
  [MenuTypes.apiDocs]: 'Popup API docs menu',
  [MenuTypes.search]: 'Popup search menu',
};
export const popupButtonTitles = {
  [MenuTypes.history]: 'Opens history menu in a new window',
  [MenuTypes.saved]: 'Opens saved menu in a new window',
  [MenuTypes.projects]: 'Opens projects menu in a new window',
  [MenuTypes.apiDocs]: 'Opens API docs menu in a new window',
  [MenuTypes.search]: 'Opens search menu in a new window',
};


export default class ArcMenuElement extends LitElement {
  static get styles() {
    return menuStyles;
  }

  static get properties() {
    return {
      /**
       * Currently selected menu tab
       */
      selected: { type: Number, reflect: true },
      /**
       * Changes information density of list items.
       * By default it uses material's list item with two lines (72px height)
       * Possible values are:
       *
       * - `default` or empty - regular list view
       * - `comfortable` - enables MD single line list item vie (52px height)
       * - `compact` - enables list that has 40px height (touch recommended)
       */
      listType: { type: String, reflect: true },
      /**
       * Enables Anypoint theme
       */
      anypoint: { type: Boolean, reflect: true },
      /**
       * If set the history menu is rendered. This comes from the application
       * settings and is different from `noHistory` which is intended to
       * temporarily remove the history from the view (for menu popup option)
       */
      history: { type: Boolean, reflect: true },
      /**
       * When set it hides history from the view
       */
      hideHistory: { type: Boolean, reflect: true },
      /**
       * When set it hides saved list from the view
       */
      hideSaved: { type: Boolean, reflect: true },
      /**
       * When set it hides projects from the view
       */
      hideProjects: { type: Boolean, reflect: true },
      /**
       * When set it hides APIs list from the view
       */
      hideApis: { type: Boolean, reflect: true },
      /**
       * When set it hides search from the view
       */
      hideSearch: { type: Boolean, reflect: true },
      /**
       * Renders popup menu buttons when this property is set.
       */
      popup: { type: Boolean, reflect: true },
      /**
       * Adds draggable property to the request list item element.
       * The `dataTransfer` object has `arc/request-object` mime type with
       * serialized JSON with request model.
       */
      dataTransfer: { type: Boolean, reflect: true },
      /**
       * A timeout after which the project item is opened when dragging a
       * request over.
       */
      dragOpenTimeout: { type: Number },

      /**
       * Indicates that the export options panel is currently rendered.
       */
      exportOptionsOpened: { type: Boolean },
      /**
       * Indicates that the delete all data dialog is currently rendered.
       */
      deleteAllDialogOpened: { type: Boolean },
      /**
       * When set only the navigation rail is rendered.
       */
      minimized: { type: Boolean },
    };
  }

  get history() {
    return this[historyValue];
  }

  set history(value) {
    const old = this[historyValue];
    /* istanbul ignore if */
    if (old === value) {
      return;
    }
    this[historyValue] = value;
    this.requestUpdate('history', old);
    this[historyChanged](value, old);
  }

  get hideHistory() {
    return this[hideHistoryValue];
  }

  set hideHistory(value) {
    const old = this[hideHistoryValue];
    /* istanbul ignore if */
    if (old === value) {
      return;
    }
    this[hideHistoryValue] = value;
    this.requestUpdate('hideHistory', old);
    this[hideHistoryChanged](value);
  }

  get hideSaved() {
    return this[hideSavedValue];
  }

  set hideSaved(value) {
    const old = this[hideSavedValue];
    /* istanbul ignore if */
    if (old === value) {
      return;
    }
    this[hideSavedValue] = value;
    this.requestUpdate('hideSaved', old);
    this[hideSavedChanged](value);
  }

  get hideProjects() {
    return this[hideProjectsValue];
  }

  set hideProjects(value) {
    const old = this[hideProjectsValue];
    /* istanbul ignore if */
    if (old === value) {
      return;
    }
    this[hideProjectsValue] = value;
    this.requestUpdate('hideProjects', old);
    this[hideProjectsChanged](value);
  }

  get hideApis() {
    return this[hideApisValue];
  }

  set hideApis(value) {
    const old = this[hideApisValue];
    /* istanbul ignore if */
    if (old === value) {
      return;
    }
    this[hideApisValue] = value;
    this.requestUpdate('hideApis', old);
    this[hideApisChanged](value);
  }

  get hideSearch() {
    return this[hideSearchValue];
  }

  set hideSearch(value) {
    const old = this[hideSearchValue];
    /* istanbul ignore if */
    if (old === value) {
      return;
    }
    this[hideSearchValue] = value;
    this.requestUpdate('hideSearch', old);
    this[hideSearchChanged](value);
  }

  /**
   * @return {number} The value of selected item, accounting for history item that toggles
   */
  get [effectiveSelected]() {
    const { selected, history } = this;
    return history ? selected : selected + 1;
  }

  constructor() {
    super();
    this.selected = 0;
    this.dragOpenTimeout = 700;
    this.popup = false;
    this.anypoint = false;
    this.history = false;
    this.hideHistory = false;
    this.hideSaved = false;
    this.hideProjects = false;
    this.hideApis = false;
    this.hideSearch = false;
    this.dataTransfer = false;
    this.deleteAllDialogOpened = false;
    this.minimized = false;
    this.listType = undefined;
    /**
     * Holds a list of once opened menus.
     * When an editor is once opened it does not disappear from the DOM
     * but is rather hidden. This list allows to differentiate the state.
     * 
     * Note, don't put all menus in the into the DOM at startup as this 
     * would make a lot of queries and DOM mutations when it's not needed.
     * 
     * @type {string[]}
     */
    this[openedValue] = [MenuTypes.history];
  }

  /**
   * Refreshes a list by it's type
   * @param {string} type
   */
  [refreshList](type) {
    const node = this.shadowRoot.querySelector(type);
    // @ts-ignore
    if (node && node.refresh) {
      // @ts-ignore
      node.refresh();
    }
  }

  /**
   * Forces to refresh history list
   */
  refreshHistory() {
    this[refreshList]('history-menu');
  }

  /**
   * Forces to refresh saved list
   */
  refreshSaved() {
    this[refreshList]('saved-menu');
  }

  /**
   * Forces to refresh projects list
   */
  refreshProjects() {
    this[refreshList]('projects-menu');
  }

  /**
   * Forces to refresh apis list
   */
  refreshApiDocs() {
    this[refreshList]('rest-api-menu');
  }

  /**
   * Requests to popup history menu.
   */
  popupHistory() {
    if (!this.popup) {
      return;
    }
    ArcNavigationEvents.popupMenu(this, 'history-menu');
  }

  /**
   * Requests to popup saved menu.
   */
  popupSaved() {
    if (!this.popup) {
      return;
    }
    ArcNavigationEvents.popupMenu(this, 'saved-menu');
  }

  /**
   * Requests to popup projects menu.
   */
  popupProjects() {
    if (!this.popup) {
      return;
    }
    ArcNavigationEvents.popupMenu(this, 'projects-menu');
  }

  /**
   * Requests to popup apis menu.
   */
  popupApiDocs() {
    if (!this.popup) {
      return;
    }
    ArcNavigationEvents.popupMenu(this, 'rest-api-menu');
  }

  /**
   * Requests to popup search menu.
   */
  popupSearch() {
    if (!this.popup) {
      return;
    }
    ArcNavigationEvents.popupMenu(this, 'search-menu');
  }

  /**
   * Selects first panel that is not hidden
   */
  async [selectFirstAvailable]() {
    const { history } = this;
    const padding = history ? 0 : -1;
    let value;
    this.selected = undefined;
    if (!this.hideHistory && history) {
      value = 0;
    } else if (!this.hideSaved) {
      value = 1 + padding;
    } else if (!this.hideProjects) {
      value = 2 + padding;
    } else if (!this.hideApis) {
      value = 3 + padding;
    } else if (!this.hideSearch) {
      value = 4 + padding;
    }
    await this.updateComplete;
    if (this.selected !== value) {
      this.selected = value;
      this[notifySelection]();
    }
  }

  /**
   * Calls `[selectFirstAvailable]()` if `panelId` is current selection.
   * @param {number} panelId
   */
  [updateSelectionIfNeeded](panelId) {
    if (panelId === this.selected) {
      this[selectFirstAvailable]();
    }
  }

  /**
   * Updates selection when history panel is removed
   * @param {Boolean} val
   */
  [hideHistoryChanged](val) {
    if (val) {
      this[updateSelectionIfNeeded](0);
    }
  }

  /**
   * Updates selection when saved panel is removed
   * @param {Boolean} val
   */
  [hideSavedChanged](val) {
    if (val) {
      this[updateSelectionIfNeeded](1);
    }
  }

  /**
   * Updates selection when projects panel is removed
   * @param {Boolean} val
   */
  [hideProjectsChanged](val) {
    if (val) {
      this[updateSelectionIfNeeded](2);
    }
  }

  /**
   * Updates selection when APIs panel is removed
   * @param {Boolean} val
   */
  [hideApisChanged](val) {
    if (val) {
      this[updateSelectionIfNeeded](3);
    }
  }

  /**
   * Updates selection when search panel is removed
   * @param {Boolean} val
   */
  [hideSearchChanged](val) {
    if (val) {
      this[updateSelectionIfNeeded](4);
    }
  }

  /**
   * Updates selection when history is disabled/enabled
   * @param {boolean} val
   * @param {boolean=} old
   */
  [historyChanged](val, old) {
    if (!val && old !== undefined) {
      this[updateSelectionIfNeeded](0);
    }
    /* else if (val && this.selected !== 0) {
      this.selected = 0;
      this[notifySelection]();
    } */
  }

  /**
   * Handler for `dragover` event on anypoint tabs.
   * Opens the tab if the dragged element can be dropped in corresponding menu.
   * @param {DragEvent} e
   */
  [dragoverHandler](e) {
    if (!this.dataTransfer) {
      return;
    }
    const types = [...e.dataTransfer.types];
    if (!types.includes('arc/request')) {
      return;
    }
    const tab = findTab(e);
    if (!tab) {
      return;
    }
    const { type } = tab.dataset;
    if (!['saved', 'projects'].includes(type)) {
      return;
    }
    e.preventDefault();
    if (this[dragTypeCallbackValue] === type) {
      return;
    }
    this[cancelDragTimeout]();
    const { selected } = this;
    if (type === 'saved' && selected === 1) {
      return;
    }
    if (type === 'projects' && selected === 2) {
      return;
    }
    this[dragTypeCallbackValue] = type;
    this[dragOverTimeoutValue] = setTimeout(() => this[openMenuDragOver](), this.dragOpenTimeout);
  }

  /**
   * Handler for `dragleave` event on project node.
   * @param {DragEvent} e
   */
  [dragleaveHandler](e) {
    if (!this.dataTransfer) {
      return;
    }
    const types = [...e.dataTransfer.types];
    if (!types.includes('arc/request')) {
      return;
    }
    e.preventDefault();
    this[cancelDragTimeout]();
  }

  /**
   * Cancels the timer set in the dragover event
   */
  [cancelDragTimeout]() {
    if (this[dragOverTimeoutValue]) {
      clearTimeout(this[dragOverTimeoutValue]);
      this[dragOverTimeoutValue] = undefined;
    }
    this[dragTypeCallbackValue] = undefined;
  }

  [openMenuDragOver]() {
    if (!this.dataTransfer) {
      return;
    }
    const type = this[dragTypeCallbackValue];
    this[cancelDragTimeout]();
    let selection;
    switch (type) {
      case 'saved': selection = 1; break;
      case 'projects': selection = 2; break;
      default:
    }
    if (selection === undefined) {
      return;
    }
    this.selected = selection;
    this[notifySelection]();
  }

  /**
   * A handler for any of the panels context menu selection.
   * @param {Event} e 
   */
  [contextMenuSelectedHandler](e) {
    const node = /** @type AnypointListbox */ (e.target);
    if (!node.selectedItem) {
      return;
    }
    const { type } = node.dataset;
    const { action } = node.selectedItem.dataset;
    switch (type) {
      case MenuTypes.history: this[runHistoryAction](action); break;
      case MenuTypes.saved: this[runSavedAction](action); break;
      case MenuTypes.projects: this[runProjectAction](action); break;
      case MenuTypes.apiDocs: this[runRestApiAction](action); break;
      case MenuTypes.search: this[runSearchAction](action); break;
      default:
    }
  }

  /**
   * @param {string} action 
   */
  [runHistoryAction](action) {
    switch (action) {
      case 'refresh': this.refreshHistory(); break;
      case 'popup': this.popupHistory(); break;
      case 'open-panel': ArcNavigationEvents.navigate(this, 'history'); break;
      case 'export-all': this[exportRequestHandler]('history'); break;
      case 'delete-all': this[deleteAllHandler]('history'); break;
      case 'help': ArcNavigationEvents.helpTopic(this, 'history'); break;
      default:
    }
  }

  /**
   * @param {string} action 
   */
  [runSavedAction](action) {
    switch (action) {
      case 'refresh': this.refreshSaved(); break;
      case 'popup': this.popupSaved(); break;
      case 'open-panel': ArcNavigationEvents.navigate(this, 'saved'); break;
      case 'export-all': this[exportRequestHandler]('saved'); break;
      case 'delete-all': this[deleteAllHandler]('saved'); break;
      case 'help': ArcNavigationEvents.helpTopic(this, 'saved'); break;
      default:
    }
  }

  /**
   * @param {string} action 
   */
  [runProjectAction](action) {
    switch (action) {
      case 'refresh': this.refreshProjects(); break;
      case 'popup': this.popupProjects(); break;
      case 'help': ArcNavigationEvents.helpTopic(this, 'projects'); break;
      default:
    }
  }

  /**
   * @param {string} action 
   */
  [runRestApiAction](action) {
    switch (action) {
      case 'refresh': this.refreshApiDocs(); break;
      case 'popup': this.popupApiDocs(); break;
      case 'explore': ArcNavigationEvents.navigate(this, 'exchange-search'); break;
      case 'help': ArcNavigationEvents.helpTopic(this, 'rest-api-docs'); break;
      default:
    }
  }

  /**
   * @param {string} action 
   */
  [runSearchAction](action) {
    switch (action) {
      case 'popup': this.popupSearch(); break;
      case 'help': ArcNavigationEvents.helpTopic(this, 'search-docs'); break;
      default:
    }
  }

  /**
   * A handler for the click on the rail icon button.
   * @param {PointerEvent} e 
   */
  [railClickHandler](e) {
    const node = /** @type HTMLElement */ (e.currentTarget);
    const { type } = node.dataset;
    let selected;
    switch (type) {
      case MenuTypes.history: selected = 0; break;
      case MenuTypes.saved: selected = 1; break;
      case MenuTypes.projects: selected = 2; break;
      case MenuTypes.apiDocs: selected = 3; break;
      case MenuTypes.search: selected = 4; break;
      default:
    }
    if (!this.history) {
      selected -= 1;
    }
    if (this.selected === selected) {
      this.minimized = !this.minimized;
      this[notifyMinimized]();
      return;
    }
    this.selected = selected;
    this[notifySelection]();
    const allOpened = /** @type string[] */ (this[openedValue]);
    if (!allOpened.includes(type)) {
      allOpened.push(type);
    }
    if (this.minimized) {
      this.minimized = false;
      this[notifyMinimized]();
    }
  }

  [notifyMinimized]() {
    this.dispatchEvent(new CustomEvent('minimized'));
  }

  [notifySelection]() {
    this.dispatchEvent(new CustomEvent('selected'));
  }

  /**
   * Handler for `accept` event dispatched by export options element.
   * @param {CustomEvent} e
   * @return {Promise} Result of calling `[doExportItems]()`
   */
  async [acceptExportOptions](e) {
    this.exportOptionsOpened = false;
    if (!this[exportTypeValue]) {
      return;
    }
    const type = this[exportTypeValue];
    this[exportTypeValue] = undefined;
    const { detail } = e;
    const provider = /** @type ProviderOptions */ (detail.providerOptions);
    const options = /** @type ExportOptions */ (detail.exportOptions);
    
    options.kind = 'ARC#AllDataExport';
    const data = {};
    if (type === 'saved') {
      data.requests = true;
    } else if (type === 'history') {
      data.history = true;
    } else {
      return;
    }

    TelemetryEvents.event(this, {
      category: telemetryCategory,
      action: 'export',
      label: options.provider,
    });

    try {
      const result = await ExportEvents.nativeData(this, data, options, provider);
      if (!result) {
        throw new Error('ArcMenu: Export module not found');
      }
      // if (detail.options.provider === 'drive') {
      //   // TODO: Render link to the folder
      //   this.shadowRoot.querySelector('#driveSaved').opened = true;
      // }
    } catch (err) {
      TelemetryEvents.exception(this, err.description, false);
      throw err;
    }
  }

  /**
   * Re-sets export variables to the initial state.
   */
  [cancelExportOptions]() {
    this.exportOptionsOpened = false;
    this[exportTypeValue] = undefined;
    TelemetryEvents.event(this, {
      category: telemetryCategory,
      action: 'cancel-export',
    });
  }

  /**
   * Opens the export options dialog.
   * @param {string} type 
   */
  [exportRequestHandler](type) {
    this[exportTypeValue] = type;
    this.exportOptionsOpened = true;
  }

  /**
   * A handler for the `<bottom-sheet>` close event.
   * It sets a property defined as `data-open-property` of this class to false.
   * @param {any} e 
   */
  [sheetClosedHandler](e) {
    const prop = e.target.dataset.openProperty;
    this[prop] = e.detail.value;
  }

  /**
   * A function to be called when delete all menu option has been selected
   * @param {string} type The type of the data to delete
   */
  [deleteAllHandler](type) {
    this[deleteTypeValue] = type;
    this.deleteAllDialogOpened = true;
    TelemetryEvents.event(this, {
      category: telemetryCategory,
      action: 'delete requested',
      label: type,
    });
  }

  /**
   * A handler for the delete all dialog close event.
   * When the dialog is confirmed by the user it dispatches the event to the models to delete data.
   * 
   * @param {CustomEvent} e 
   */
  [deleteDialogCloseHandler](e) {
    this.deleteAllDialogOpened = false;
    const type = this[deleteTypeValue];
    this[deleteTypeValue] = undefined;
    if (!type || e.detail.canceled || !e.detail.confirmed) {
      return;
    }
    if (type === 'saved') {
      ArcModelEvents.destroy(this, ['saved-requests']);
    } else if (type === 'history') {
      ArcModelEvents.destroy(this, ['history-requests']);
    }
    TelemetryEvents.event(this, {
      category: telemetryCategory,
      action: 'delete',
    });
  }

  render() {
    return html`
    <div class="menu">
      ${this[railTemplate]()}
      ${this[panelsTemplate]()}
    </div>
    ${this[exportTemplate]()}
    ${this[deleteAllTemplate]()}
    `;
  }

  /**
   * @returns {TemplateResult} The template for navigation rail
   */
  [railTemplate]() {
    const { anypoint, history, hideHistory, hideSaved, hideProjects, hideApis, hideSearch } = this;
    let { selected } = this;
    if (!history) {
      selected += 1;
    }
    
    return html`
    <div 
      class="rail"
      @dragover="${this[dragoverHandler]}"
      @dragleave="${this[dragleaveHandler]}"
    >
      ${history ? html`<anypoint-icon-button
        title="Select history"
        ?anypoint="${anypoint}"
        class=${classMap({'menu-item': true, selected: selected === 0})}
        ?hidden="${hideHistory}"
        data-type="${MenuTypes.history}"
        @click="${this[railClickHandler]}"
      >
        <arc-icon icon="history"></arc-icon>
      </anypoint-icon-button>` : ''}

      <anypoint-icon-button
        title="Select saved"
        ?anypoint="${anypoint}"
        ?hidden="${hideSaved}"
        class=${classMap({'menu-item': true, selected: selected === 1})}
        data-type="${MenuTypes.saved}"
        @click="${this[railClickHandler]}"
      >
        <arc-icon icon="save"></arc-icon>
      </anypoint-icon-button>

      <anypoint-icon-button
        title="Select projects"
        ?anypoint="${anypoint}"
        ?hidden="${hideProjects}"
        class=${classMap({'menu-item': true, selected: selected === 2})}
        data-type="${MenuTypes.projects}"
        @click="${this[railClickHandler]}"
      >
        <arc-icon icon="collectionsBookmark"></arc-icon>
      </anypoint-icon-button>

      <anypoint-icon-button
        title="Select REST APIs"
        ?anypoint="${anypoint}"
        ?hidden="${hideApis}"
        class=${classMap({'menu-item': true, selected: selected === 3})}
        data-type="${MenuTypes.apiDocs}"
        @click="${this[railClickHandler]}"
      >
        <arc-icon icon="cloudOutline"></arc-icon>
      </anypoint-icon-button>

      <anypoint-icon-button
        title="Select search"
        ?anypoint="${anypoint}"
        ?hidden="${hideSearch}"
        class=${classMap({'menu-item': true, selected: selected === 4})}
        data-type="${MenuTypes.search}"
        @click="${this[railClickHandler]}"
      >
        <arc-icon icon="search"></arc-icon>
      </anypoint-icon-button>
    </div>
    `;
  }

  /**
   * @returns {TemplateResult} The template for the content panels
   */
  [panelsTemplate]() {
    return html`
    <div class="content" ?hidden="${this.minimized}">
    ${this[historyTemplate]()}
    ${this[savedTemplate]()}
    ${this[projectsTemplate]()}
    ${this[apisTemplate]()}
    ${this[searchMenuTemplate]()}
    </div>
    `;
  }

  /**
   * @returns {TemplateResult|string} Template for the history menu
   */
  [historyTemplate]() {
    if (this.hideHistory || !this.history) {
      return '';
    }
    const allOpened = /** @type string[] */ (this[openedValue]);
    const effective = this[effectiveSelected];
    const wasOpened = allOpened.includes(MenuTypes.history);
    const menuOpened = !effective;
    if (!menuOpened && !wasOpened) {
      return '';
    }
    const { listType, dataTransfer, anypoint, popup } = this;
    return html`
    <div class="menu-title" ?hidden=${!menuOpened}>
      <span class="menu-title-label">History</span>
      <anypoint-menu-button
        dynamicAlign
        closeOnActivate
        class="list-options"
        horizontalAlign="right"
        ?anypoint="${anypoint}"
      >
        <anypoint-icon-button
          class="menu-icon"
          aria-label="Activate to open context menu"
          slot="dropdown-trigger"
          ?anypoint="${anypoint}"
        >
          <arc-icon icon="moreVert" class="list-drop-icon"></arc-icon>
        </anypoint-icon-button>
        <anypoint-listbox
          slot="dropdown-content"
          ?anypoint="${anypoint}"
          selectable="anypoint-icon-item"
          class="list"
          data-type="${MenuTypes.history}"
          @selected="${this[contextMenuSelectedHandler]}"
        >
          <anypoint-icon-item
            class="context-menu-item"
            data-action="refresh"
            title="Refresh the list"
            tabindex="-1"
          >
            <arc-icon slot="item-icon" icon="refresh"></arc-icon>
            Refresh
          </anypoint-icon-item>
          ${popup ? html`<anypoint-icon-item
            class="context-menu-item"
            data-action="popup"
            title="${popupButtonTitles[MenuTypes.history]}"
            aria-label="${popupAriaLabels[MenuTypes.history]}"
            tabindex="-1"
          >
            <arc-icon slot="item-icon" icon="openInNew"></arc-icon>
            Detach
          </anypoint-icon-item>` : ''}
          <anypoint-icon-item
            class="context-menu-item"
            data-action="open-panel"
            title="Open the history screen"
            tabindex="-1"
          >
            All history
          </anypoint-icon-item>
          <div class="divider"></div>
          <anypoint-icon-item
            class="context-menu-item"
            data-action="export-all"
            title="Export all history"
            tabindex="-1"
          >
            <arc-icon slot="item-icon" icon="archiveOutline"></arc-icon>
            Export all
          </anypoint-icon-item>
          <anypoint-icon-item
            class="context-menu-item"
            data-action="delete-all"
            title="Delete all history"
            tabindex="-1"
          >
            <arc-icon slot="item-icon" icon="deleteOutline"></arc-icon>
            Delete all
          </anypoint-icon-item>
          <div class="divider"></div>
          <anypoint-icon-item
            class="context-menu-item"
            data-action="help"
            title="Opens help for history"
            tabindex="-1"
          >
            <arc-icon slot="item-icon" icon="helpOutline"></arc-icon>
            Learn more
          </anypoint-icon-item>
        </anypoint-listbox>
      </anypoint-menu-button>
    </div>
    <history-menu
      .listType="${listType}"
      ?draggableEnabled="${dataTransfer}"
      ?anypoint="${anypoint}"
      ?hidden=${!menuOpened}
    ></history-menu>
    `;
  }

  /**
   * @returns {TemplateResult|string} Template for the saved menu
   */
  [savedTemplate]() {
    if (this.hideSaved) {
      return '';
    }
    const allOpened = /** @type string[] */ (this[openedValue]);
    const effective = this[effectiveSelected];
    const wasOpened = allOpened.includes(MenuTypes.saved);
    const menuOpened = effective === 1;
    if (!menuOpened && !wasOpened) {
      return '';
    }
    const { listType, dataTransfer, anypoint, popup } = this;
    return html`
    <div class="menu-title" ?hidden=${!menuOpened}>
      <span class="menu-title-label">Saved</span>

      <anypoint-menu-button
        dynamicAlign
        closeOnActivate
        class="list-options"
        horizontalAlign="right"
        ?anypoint="${anypoint}"
      >
        <anypoint-icon-button
          class="menu-icon"
          aria-label="Activate to open context menu"
          slot="dropdown-trigger"
          ?anypoint="${anypoint}"
        >
          <arc-icon icon="moreVert" class="list-drop-icon"></arc-icon>
        </anypoint-icon-button>
        <anypoint-listbox
          slot="dropdown-content"
          ?anypoint="${anypoint}"
          selectable="anypoint-icon-item"
          class="list"
          data-type="${MenuTypes.saved}"
          @selected="${this[contextMenuSelectedHandler]}"
        >
          <anypoint-icon-item
            class="context-menu-item"
            data-action="refresh"
            title="Refresh the list"
            tabindex="-1"
          >
            <arc-icon slot="item-icon" icon="refresh"></arc-icon>
            Refresh
          </anypoint-icon-item>
          ${popup ? html`<anypoint-icon-item
            class="context-menu-item"
            data-action="popup"
            title="${popupButtonTitles[MenuTypes.saved]}"
            aria-label="${popupAriaLabels[MenuTypes.saved]}"
            tabindex="-1"
          >
            <arc-icon slot="item-icon" icon="openInNew"></arc-icon>
            Detach
          </anypoint-icon-item>`: ''}
          <anypoint-icon-item
            class="context-menu-item"
            data-action="open-panel"
            title="Open the saved requests screen"
            tabindex="-1"
          >
            All Saved
          </anypoint-icon-item>
          <div class="divider"></div>
          <anypoint-icon-item
            class="context-menu-item"
            data-action="export-all"
            title="Export all saved-requests"
            tabindex="-1"
          >
            <arc-icon slot="item-icon" icon="archiveOutline"></arc-icon>
            Export all
          </anypoint-icon-item>
          <anypoint-icon-item
            class="context-menu-item"
            data-action="delete-all"
            title="Delete all saved requests"
            tabindex="-1"
          >
            <arc-icon slot="item-icon" icon="deleteOutline"></arc-icon>
            Delete all
          </anypoint-icon-item>
          <div class="divider"></div>
          <anypoint-icon-item
            class="context-menu-item"
            data-action="help"
            title="Opens help for saved requests"
            tabindex="-1"
          >
            <arc-icon slot="item-icon" icon="helpOutline"></arc-icon>
            Learn more
          </anypoint-icon-item>
        </anypoint-listbox>
      </anypoint-menu-button>
    </div>
    <saved-menu
      .listType="${listType}"
      ?draggableEnabled="${dataTransfer}"
      ?anypoint="${anypoint}"
      ?hidden=${!menuOpened}
    ></saved-menu>
    `;
  }

  /**
   * @returns {TemplateResult|string} Template for the projects menu
   */
  [projectsTemplate]() {
    if (this.hideProjects) {
      return '';
    }
    const allOpened = /** @type string[] */ (this[openedValue]);
    const effective = this[effectiveSelected];
    const wasOpened = allOpened.includes(MenuTypes.projects);
    const menuOpened = effective === 2;
    if (!menuOpened && !wasOpened) {
      return '';
    }
    const { listType, dataTransfer, anypoint, popup } = this;
    return html`
    <div class="menu-title" ?hidden=${!menuOpened}>
      <span class="menu-title-label">Projects</span>
      <anypoint-menu-button
        dynamicAlign
        closeOnActivate
        class="list-options"
        horizontalAlign="right"
        ?anypoint="${anypoint}"
      >
        <anypoint-icon-button
          class="menu-icon"
          aria-label="Activate to open context menu"
          slot="dropdown-trigger"
          ?anypoint="${anypoint}"
        >
          <arc-icon icon="moreVert" class="list-drop-icon"></arc-icon>
        </anypoint-icon-button>
        <anypoint-listbox
          slot="dropdown-content"
          ?anypoint="${anypoint}"
          selectable="anypoint-icon-item"
          class="list"
          data-type="${MenuTypes.projects}"
          @selected="${this[contextMenuSelectedHandler]}"
        >
          <anypoint-icon-item
            class="context-menu-item"
            data-action="refresh"
            title="Refresh the list"
            tabindex="-1"
          >
            <arc-icon slot="item-icon" icon="refresh"></arc-icon>
            Refresh
          </anypoint-icon-item>
          ${popup ? html`<anypoint-icon-item
            class="context-menu-item"
            data-action="popup"
            title="${popupButtonTitles[MenuTypes.projects]}"
            aria-label="${popupAriaLabels[MenuTypes.projects]}"
            tabindex="-1"
          >
            <arc-icon slot="item-icon" icon="openInNew"></arc-icon>
            Detach
          </anypoint-icon-item>`: ''}
          <div class="divider"></div>
          <anypoint-icon-item
            class="context-menu-item"
            data-action="help"
            title="Opens help for projects"
            tabindex="-1"
          >
            <arc-icon slot="item-icon" icon="helpOutline"></arc-icon>
            Learn more
          </anypoint-icon-item>
        </anypoint-listbox>
      </anypoint-menu-button>
    </div>
    <projects-menu
      .listType="${listType}"
      ?draggableEnabled="${dataTransfer}"
      ?anypoint="${anypoint}"
      ?hidden=${!menuOpened}
    ></projects-menu>
    `;
  }

  /**
   * @returns {TemplateResult|string} Template for the REST APIs menu
   */
  [apisTemplate]() {
    if (this.hideApis) {
      return '';
    }
    const allOpened = /** @type string[] */ (this[openedValue]);
    const effective = this[effectiveSelected];
    const wasOpened = allOpened.includes(MenuTypes.apiDocs);
    const menuOpened = effective === 3;
    if (!menuOpened && !wasOpened) {
      return '';
    }
    const { listType, anypoint, popup } = this;
    return html`
    <div class="menu-title" ?hidden=${!menuOpened}>
      <span class="menu-title-label">REST APIs</span>

      <anypoint-menu-button
        dynamicAlign
        closeOnActivate
        class="list-options"
        horizontalAlign="right"
        ?anypoint="${anypoint}"
      >
        <anypoint-icon-button
          class="menu-icon"
          aria-label="Activate to open context menu"
          slot="dropdown-trigger"
          ?anypoint="${anypoint}"
        >
          <arc-icon icon="moreVert" class="list-drop-icon"></arc-icon>
        </anypoint-icon-button>
        <anypoint-listbox
          slot="dropdown-content"
          ?anypoint="${anypoint}"
          selectable="anypoint-icon-item"
          class="list"
          data-type="${MenuTypes.apiDocs}"
          @selected="${this[contextMenuSelectedHandler]}"
        >
          <anypoint-icon-item
            class="context-menu-item"
            data-action="refresh"
            title="Refresh the list"
            tabindex="-1"
          >
            <arc-icon slot="item-icon" icon="refresh"></arc-icon>
            Refresh
          </anypoint-icon-item>
          ${popup ? html`<anypoint-icon-item
            class="context-menu-item"
            data-action="popup"
            title="${popupButtonTitles[MenuTypes.apiDocs]}"
            aria-label="${popupAriaLabels[MenuTypes.apiDocs]}"
            tabindex="-1"
          >
            <arc-icon slot="item-icon" icon="openInNew"></arc-icon>
            Detach
          </anypoint-icon-item>` : ''}
          <anypoint-icon-item
            class="context-menu-item"
            data-action="explore"
            title="Export APIs in Anypoint Exchange catalogue"
            tabindex="-1"
          >
            Explore
          </anypoint-icon-item>
          <div class="divider"></div>
          <anypoint-icon-item
            class="context-menu-item"
            data-action="help"
            title="Opens help for REST APIs"
            tabindex="-1"
          >
            <arc-icon slot="item-icon" icon="helpOutline"></arc-icon>
            Learn more
          </anypoint-icon-item>
        </anypoint-listbox>
      </anypoint-menu-button>
    </div>
    <rest-api-menu
      .listType="${listType}"
      ?anypoint="${anypoint}"
      ?hidden=${!menuOpened}
    ></rest-api-menu>
    `;
  }

  /**
   * @returns {TemplateResult|string} Template for the search menu
   */
  [searchMenuTemplate]() {
    if (this.hideSearch) {
      return '';
    }
    const allOpened = /** @type string[] */ (this[openedValue]);
    const effective = this[effectiveSelected];
    const wasOpened = allOpened.includes(MenuTypes.search);
    const menuOpened = effective === 4;
    if (!menuOpened && !wasOpened) {
      return '';
    }
    const { listType, anypoint, popup, dataTransfer } = this;
    return html`
    <div class="menu-title" ?hidden=${!menuOpened}>
      <span class="menu-title-label">Search</span>

      <anypoint-menu-button
        dynamicAlign
        closeOnActivate
        class="list-options"
        horizontalAlign="right"
        ?anypoint="${anypoint}"
      >
        <anypoint-icon-button
          class="menu-icon"
          aria-label="Activate to open context menu"
          slot="dropdown-trigger"
          ?anypoint="${anypoint}"
        >
          <arc-icon icon="moreVert" class="list-drop-icon"></arc-icon>
        </anypoint-icon-button>
        <anypoint-listbox
          slot="dropdown-content"
          ?anypoint="${anypoint}"
          selectable="anypoint-icon-item"
          class="list"
          data-type="${MenuTypes.search}"
          @selected="${this[contextMenuSelectedHandler]}"
        >
          ${popup ? html`<anypoint-icon-item
            class="context-menu-item"
            data-action="popup"
            title="${popupButtonTitles[MenuTypes.search]}"
            aria-label="${popupAriaLabels[MenuTypes.search]}"
            tabindex="-1"
          >
            <arc-icon slot="item-icon" icon="openInNew"></arc-icon>
            Detach
          </anypoint-icon-item>` : ''}
          <div class="divider"></div>
          <anypoint-icon-item
            class="context-menu-item"
            data-action="help"
            title="Opens help for search"
            tabindex="-1"
          >
            <arc-icon slot="item-icon" icon="helpOutline"></arc-icon>
            Learn more
          </anypoint-icon-item>
        </anypoint-listbox>
      </anypoint-menu-button>
    </div>
    <search-menu
      .listType="${listType}"
      ?anypoint="${anypoint}"
      ?draggableEnabled="${dataTransfer}"
      ?hidden=${!menuOpened}
    ></search-menu>
    `;
  }

  [exportTemplate]() {
    const { anypoint, exportOptionsOpened } = this;
    return html`
    <bottom-sheet
      class="bottom-sheet-container"
      .opened="${exportOptionsOpened}"
      data-open-property="exportOptionsOpened"
      @closed="${this[sheetClosedHandler]}"
    >
      <export-options
        id="exportOptions"
        ?anypoint="${anypoint}"
        withEncrypt
        file="arc-requests.json"
        provider="file"
        @accept="${this[acceptExportOptions]}"
        @cancel="${this[cancelExportOptions]}"
      ></export-options>
    </bottom-sheet>`;
  }

  /**
   * @returns {TemplateResult|string} Template for the delete all confirmation
   */
  [deleteAllTemplate]() {
    const { anypoint, deleteAllDialogOpened } = this;
    if (!deleteAllDialogOpened) {
      return '';
    }
    return html`
    <anypoint-dialog ?anypoint="${anypoint}" @closed="${this[deleteDialogCloseHandler]}" opened>
      <h2>Confirm delete all</h2>
      <p>This action cannot be undone. Are you sure you want to delete all data?</p>
      <div class="buttons">
        <anypoint-button data-dialog-dismiss>Cancel</anypoint-button>
        <anypoint-button data-dialog-confirm>Confirm</anypoint-button>
      </div>
    </anypoint-dialog>
    `;
  }
}
