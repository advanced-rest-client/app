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
import { LitElement, TemplateResult } from 'lit-element';

export declare const historyValue: unique symbol;
export declare const historyChanged: unique symbol;
export declare const hideHistoryValue: unique symbol;
export declare const hideHistoryChanged: unique symbol;
export declare const hideSavedValue: unique symbol;
export declare const hideSavedChanged: unique symbol;
export declare const hideProjectsValue: unique symbol;
export declare const hideProjectsChanged: unique symbol;
export declare const hideApisValue: unique symbol;
export declare const hideApisChanged: unique symbol;
export declare const refreshList: unique symbol;
export declare const selectFirstAvailable: unique symbol;
export declare const updateSelectionIfNeeded: unique symbol;
export declare const dragoverHandler: unique symbol;
export declare const dragleaveHandler: unique symbol;
export declare const dragTypeCallbackValue: unique symbol;
export declare const dragOverTimeoutValue: unique symbol;
export declare const cancelDragTimeout: unique symbol;
export declare const openMenuDragOver: unique symbol;
export declare const historyTemplate: unique symbol;
export declare const savedTemplate: unique symbol;
export declare const projectsTemplate: unique symbol;
export declare const apisTemplate: unique symbol;
export declare const searchMenuTemplate: unique symbol;
export declare const openedValue: unique symbol;
export declare const effectiveSelected: unique symbol;
export declare const railTemplate: unique symbol;
export declare const panelsTemplate: unique symbol;
export declare const railClickHandler: unique symbol;
export declare const contextMenuSelectedHandler: unique symbol;
export declare const runHistoryAction: unique symbol;
export declare const runSavedAction: unique symbol;
export declare const runProjectAction: unique symbol;
export declare const runRestApiAction: unique symbol;
export declare const acceptExportOptions: unique symbol;
export declare const cancelExportOptions: unique symbol;
export declare const exportRequestHandler: unique symbol;
export declare const exportTemplate: unique symbol;
export declare const sheetClosedHandler: unique symbol;
export declare const exportTypeValue: unique symbol;
export declare const deleteAllTemplate: unique symbol;
export declare const deleteDialogCloseHandler: unique symbol;
export declare const deleteAllHandler: unique symbol;
export declare const deleteTypeValue: unique symbol;
export declare const notifyMinimized: unique symbol;
export declare const hideSearchValue: unique symbol;
export declare const hideSearchChanged: unique symbol;
export declare const runSearchAction: unique symbol;
export declare const notifySelection: unique symbol;

/**
 * Finds anypoint-tab element in event path.
 * @param e Event with `path` or `composedPath()`
 */
export declare function findTab(e: Event): HTMLElement|undefined;

declare interface MenuTypes {
  history: string;
  saved: string;
  projects: string;
  apiDocs: string;
  search: string;
}

/**
 * A list of types of the menu elements.
 */
export declare const MenuTypes: MenuTypes;
export declare const popupAriaLabels: MenuTypes;
export declare const popupButtonTitles: MenuTypes;

/**
 * @fires minimized When the `minimized` property change through internal interaction
 * @fires selected When the selection has been changed cause by the user interaction.
 */
export default class ArcMenuElement extends LitElement {
  /**
   * Currently selected menu tab
   * @attribute
   */
  selected: number;
  /**
   * Changes information density of list items.
   * By default it uses material's list item with two lines (72px height)
   * Possible values are:
   *
   * - `default` or empty - regular list view
   * - `comfortable` - enables MD single line list item vie (52px height)
   * - `compact` - enables list that has 40px height (touch recommended)
   * @attribute
   */
  listType: string;
  /**
   * Enables Anypoint theme
   * @attribute
   */
  anypoint: boolean;
  /**
   * If set the history menu is rendered. This comes from the application
   * settings and is different from `noHistory` which is intended to
   * temporarily remove the history from the view (for menu popup option)
   * @attribute
   */
  history: boolean;
  /**
   * When set it hides history from the view
   * @attribute
   */
  hideHistory: boolean;
  /**
   * When set it hides saved list from the view
   * @attribute
   */
  hideSaved: boolean;
  /**
   * When set it hides projects from the view
   * @attribute
   */
  hideProjects: boolean;
  /**
   * When set it hides APIs list from the view
   * @attribute
   */
  hideApis: boolean;
  /**
   * When set it hides search from the view
   * @attribute
   */
  hideSearch: boolean;
  [hideSearchValue]: boolean;
  /**
   * Renders popup menu buttons when this property is set.
   * @attribute
   */
  popup: boolean;
  /**
   * Adds draggable property to the request list item element.
   * The `dataTransfer` object has `arc/request-object` mime type with
   * serialized JSON with request model.
   * @attribute
   */
  dataTransfer: boolean;
  /**
   * A timeout after which the project item is opened when dragging a
   * request over.
   * @attribute
   */
  dragOpenTimeout: number;

  /**
   * Indicates that the export options panel is currently rendered.
   */
  exportOptionsOpened: boolean;
  /**
   * Indicates that the delete all data dialog is currently rendered.
   */
  deleteAllDialogOpened: boolean;
  /**
   * When set only the navigation rail is rendered.
   * @attribute
   */
  minimized: boolean;

  /**
   * The value of selected item, accounting for history item that toggles
   */
  get [effectiveSelected](): number;

  /**
   * Holds a list of once opened menus.
   * When an editor is once opened it does not disappear from the DOM
   * but is rather hidden. This list allows to differentiate the state.
   * 
   * Note, don't put all menus in the into the DOM at startup as this 
   * would make a lot of queries and DOM mutations when it's not needed.
   */
  [openedValue]: string;

  constructor();

  [refreshList](type: string): void;

  /**
   * Forces to refresh history list
   */
  refreshHistory(): void;

  /**
   * Forces to refresh saved list
   */
  refreshSaved(): void;

  /**
   * Forces to refresh projects list
   */
  refreshProjects(): void;

  /**
   * Forces to refresh apis list
   */
  refreshApiDocs(): void;

  /**
   * Requests to popup history menu.
   */
  popupHistory(): void;

  /**
   * Requests to popup saved menu.
   */
  popupSaved(): void;

  /**
   * Requests to popup projects menu.
   */
  popupProjects(): void;

  /**
   * Requests to popup apis menu.
   */
  popupApiDocs(): void;

  /**
   * Requests to popup search menu.
   */
  popupSearch(): void;

  /**
   * Selects first panel that is not hidden
   */
  [selectFirstAvailable](): Promise<void>;

  /**
   * Calls `[selectFirstAvailable]()` if `panelId` is current selection.
   */
  [updateSelectionIfNeeded](panelId: number): void;

  /**
   * Updates selection when history panel is removed
   * 
   */
  [hideHistoryChanged](val: boolean): void;

  /**
   * Updates selection when saved panel is removed
   * 
   */
  [hideSavedChanged](val: boolean): void;

  /**
   * Updates selection when saved panel is removed
   * 
   */
  [hideProjectsChanged](val: boolean): void;

  /**
   * Updates selection when saved panel is removed
   * 
   */
  [hideApisChanged](val: boolean): void;

  /**
   * Updates selection when search panel is removed
   */
  [hideSearchChanged](val: boolean): void;

  /**
   * Updates selection when history is disabled/enabled
   */
  [historyChanged](val: boolean, old: boolean): void;

  /**
   * Handler for `dragover` event on anypoint tabs.
   * Opens the tab if the dragged element can be dropped in corresponding menu.
   */
  [dragoverHandler](e: DragEvent): void;

  /**
   * Handler for `dragleave` event on project node.
   */
  [dragleaveHandler](e: DragEvent): void;

  /**
   * Cancels the timer set in the dragover event
   */
  [cancelDragTimeout](): void;

  [openMenuDragOver](): void;

  
  /**
   * A handler for any of the panels context menu selection.
   */
  [contextMenuSelectedHandler](e: Event): void;

  /**
   * @param {string} action 
   */
  [runHistoryAction](action: string): void;

  [runSavedAction](action: string): void;

  [runProjectAction](action: string): void;

  [runRestApiAction](action: string): void;

  /**
   * A handler for the click on the rail icon button.
   */
  [railClickHandler](e: PointerEvent): void;

  [notifyMinimized](): void;
  
  [notifySelection](): void;

  /**
   * Handler for `accept` event dispatched by export options element.
   *
   * @returns Result of calling `[doExportItems]()`
   */
  [acceptExportOptions](e: CustomEvent): Promise<void>;

  /**
   * Re-sets export variables to the initial state.
   */
  [cancelExportOptions](): void;

  /**
   * Opens the export options dialog.
   */
  [exportRequestHandler](type: string): void;

  /**
   * A handler for the `<bottom-sheet>` close event.
   * It sets a property defined as `data-open-property` of this class to false.
   */
  [sheetClosedHandler](e: any): void;

  /**
   * A function to be called when delete all menu option has been selected
   * @param type The type of the data to delete
   */
  [deleteAllHandler](type: string): void;

  /**
   * A handler for the delete all dialog close event.
   * When the dialog is confirmed by the user it dispatches the event to the models to delete data.
   */
  [deleteDialogCloseHandler](e: CustomEvent): void;

  render(): TemplateResult;

  /**
   * @returns The template for navigation rail
   */
  [railTemplate](): TemplateResult;

  /**
   * @returns The template for the content panels
   */
  [panelsTemplate](): TemplateResult;

  /**
   * @returns Template for the history menu
   */
  [historyTemplate](): TemplateResult | string;

  /**
   * @returns Template for the saved menu
   */
  [savedTemplate](): TemplateResult|string;

  /**
   * @returns Template for the projects menu
   */
  [projectsTemplate](): TemplateResult | string;

  /**
   * @returns Template for the REST APIs menu
   */
  [apisTemplate](): TemplateResult | string;
  
  /**
   * @returns Template for the search menu
   */
  [searchMenuTemplate](): TemplateResult | string;

  [exportTemplate](): TemplateResult;

  /**
   * @returns Template for the delete all confirmation
   */
  [deleteAllTemplate](): TemplateResult|string;  
}
