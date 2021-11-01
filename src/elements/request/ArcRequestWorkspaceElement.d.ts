import { LitElement, TemplateResult } from 'lit-element';
import { EventsTargetMixin, ResizableMixin } from '@anypoint-web-components/awc';
import WorkspaceTabElement from './WorkspaceTabElement';
import ArcRequestPanelElement from './ArcRequestPanelElement';
import { WorkspaceTab, AddRequestOptions, WorkspaceRequest, WorkspaceHttpRequest, WorkspaceWebsocketRequest } from '../../types';
import { ApiTransportEvent, ArcRequest } from '@advanced-rest-client/events';
import { DomainWorkspace, WorkspaceRequestUnion } from '@advanced-rest-client/events/src/domain/Workspace';
import { ArcExportObject } from '@advanced-rest-client/events/src/dataexport/DataExport';
import ArcWebsocketPanelElement from '../ws/ArcWebsocketPanelElement';

export declare const addTab: unique symbol;
export declare const createTab: unique symbol;
export declare const updateTab: unique symbol;
export declare const tabsValue: unique symbol;
export declare const requestsValue: unique symbol;
export declare const tabsTemplate: unique symbol;
export declare const tabTemplate: unique symbol;
export declare const panelsTemplate: unique symbol;
export declare const panelTemplate: unique symbol;
export declare const httpPanelTemplate: unique symbol;
export declare const wsPanelTemplate: unique symbol;
export declare const closeRequestHandler: unique symbol;
export declare const tabsSelectionHandler: unique symbol;
export declare const requestChangeHandler: unique symbol;
export declare const tabDragStartHandler: unique symbol;
export declare const tabDragEndHandler: unique symbol;
export declare const tabCloseHandler: unique symbol;
export declare const reorderInfo: unique symbol;
export declare const workspaceValue: unique symbol;
export declare const restoreRequests: unique symbol;
export declare const readTabLabel: unique symbol;
export declare const storeWorkspace: unique symbol;
export declare const storeTimeoutValue: unique symbol;
export declare const syncWorkspaceRequests: unique symbol;
export declare const addNewHandler: unique symbol;
export declare const panelCloseHandler: unique symbol;
export declare const panelDuplicateHandler: unique symbol;
export declare const tabsDragOverHandler: unique symbol;
export declare const tabsDragLeaveHandler: unique symbol;
export declare const tabsDropHandler: unique symbol;
export declare const resetReorderState: unique symbol;
export declare const rearrangeReorder: unique symbol;
export declare const reorderDragover: unique symbol;
export declare const getReorderDdx: unique symbol;
export declare const getReorderedItem: unique symbol;
export declare const updateTabsReorder: unique symbol;
export declare const createDropPointer: unique symbol;
export declare const removeDropPointer: unique symbol;
export declare const dropPointerReference: unique symbol;
export declare const dropPointer: unique symbol;
export declare const newTabDragover: unique symbol;
export declare const resetReorderChildren: unique symbol;
export declare const computeDropOrder: unique symbol;
export declare const transportHandler: unique symbol;
export declare const tabTypeSelector: unique symbol;
export declare const addButtonRef: unique symbol;
export declare const addButtonTimeout: unique symbol;
export declare const addButtonCallback: unique symbol;
export declare const addButtonMousedownHandler: unique symbol;
export declare const addButtonMouseupHandler: unique symbol;
export declare const addButtonSelectorOpened: unique symbol;
export declare const addButtonSelectorSelectedHandler: unique symbol;
export declare const addButtonSelectorClosedHandler: unique symbol;
export declare const webUrlTemplate: unique symbol;
export declare const sessionUrlInputHandler: unique symbol;
export declare const workspaceMetaCloseHandler: unique symbol;
export declare const workspaceDetailTemplate: unique symbol;
export declare const workspaceMetaTemplate: unique symbol;
export declare const sheetClosedHandler: unique symbol;
export declare const storeWorkspaceMeta: unique symbol;

export default class ArcRequestWorkspaceElement extends ResizableMixin(EventsTargetMixin(LitElement)) {
  [workspaceValue]: DomainWorkspace;

  /** 
   * The index of the selected panel. This is the index of the tab to be selected.
   * @attribute
   */
  selected: number;
  /** 
   * Enables Anypoint theme.
   * @attribute
  */
  anypoint: boolean;
  /**
   * Redirect URL for the OAuth2 authorization.
   * If can be also set by dispatching `oauth2-redirect-url-changed`
   * with `value` property on the `detail` object.
   * @attribute
   */
  oauth2RedirectUri: string;
  /** 
   * When set it requests workspace state read when connected to the DOM.
   * @attribute
   */
  autoRead: boolean;
  /** 
   * A timeout after which the actual store workspace event is dispatched.
   * Default to 500 (ms).
   * @attribute
   */
  storeTimeout: number;
  /** 
   * When set it renders the send request button on the request editor
   * @attribute
   */
  renderSend: boolean;
  /** 
   * Whether to render the request progress status in the request panel.
   * This works with the events dispatched by the transport library. Custom libraries may not support this.
   * @attribute
   */
  progressInfo: boolean;
  /** 
   * When set the request editor does not allow to send the request if one is already loading.
   * @attribute
   */
  noSendOnLoading: boolean;
  /**
   * Mote, tabs are in sync with workspace requests array
   */
  [tabsValue]: WorkspaceTab[];
  [requestsValue]: WorkspaceRequest[];

  /**
   * An URL to be present in the session URL input when opened.
   * The input can be opened by calling `openWebUrlInput()`
   */
  webSessionUrl?: string;

  /**
   * Indicates that the workspace details dialog is opened
   * @attribute
   */
  workspaceDetailsOpened?: boolean;
  /**
   * Indicates that the workspace meta editor is opened
   * @attribute
   */
  workspaceMetaOpened?: boolean;

  constructor();

  connectedCallback(): void;

  disconnectedCallback(): void;

  firstUpdated(args: Map<string | number | symbol, unknown>): void;

  /**
   * A handler for the request transport event.
   * It updates request configuration to add configuration from the workspace.
   */
  [transportHandler](e: ApiTransportEvent): void;

  /**
   * Dispatches the workspace restore event and sets the workspace data.
   * If the event does not return workspace an empty workspace is created.
   */
  restore(): Promise<void>;

  /**
   * Dispatches an event to store the current workspace.
   */
  store(): Promise<void>;

  [storeWorkspace](): Promise<void>;

  /**
   * A function that updates workspace requests array to reflect the current order and properties of the panels.
   */
  [syncWorkspaceRequests](): void;

  /**
   * Updates local properties from the workspace state file.
   */
  setWorkspace(workspace: DomainWorkspace): void;

  [restoreRequests](requests: WorkspaceRequestUnion[]): void;

  /**
   * Adds new request to the workspace.
   * @param request
   * @param [options={}] Append options
   * @returns The index at which the request was inserted.
   */
  add(request: WorkspaceRequestUnion, options?: AddRequestOptions): number;

  /**
   * Adds an empty HTTP request to the workspace.
   * @returns The index at which the request was inserted.
   */
  addHttpRequest(): number;

  /**
   * Adds an empty web socket request to the workspace.
   * @returns The index at which the request was inserted.
   */
  addWsRequest(): number;

  /**
   * Adds a request at specific position moving the request at the position to the right.
   * If the position is out of `activeRequests` bounds.
   * 
   * @param index The position of the tab where to put the request
   * @param request Request object to put.
   * @param options Add request options
   * 
   * @returns The position at which the tab was inserted. It might be different than requested when the index is out of bounds.
   */
  addAt(index: number, request: WorkspaceRequestUnion, options?: AddRequestOptions): number;

  /**
   * Adds a request at specific position moving the request at the position to the right.
   * If the position is out of `activeRequests` bounds.
   * 
   * @param index The position of the tab where to put the request
   * @param type The request type
   * @param id The request data store id
   * @param options Add request options
   * 
   * @returns The position at which the tab was inserted. It might be different than requested when the index is out of bounds.
   */
  addAtByRequestId(index: number, type: string, id: string, options?: AddRequestOptions): Promise<number>;

  /**
   * Appends request by its datastore id.
   * @param type Request type: `saved` or `history`.
   * @param id The data store id
   * @returns The position at which the request has been added.
   */
  addByRequestId(type: string, id: string): Promise<number>;

  /**
   * Appends requests by their datastore id.
   * @param type Request type: `saved` or `history`.
   * @param ids The data store id
   * @returns The position at which the last request has been added.
   */
  addByRequestIds(type: string, ids: string[]): Promise<number>;

  /**
   * Replaces current workspace with the request passed in the argument.
   * @param type A request type. `history` or `saved`
   * @param id Request id 
   */
  replaceByRequestId(type: string, id: string): Promise<number>;

  /**
   * Replaces current workspace with requests passed in the argument.
   * @param type A request type. `history` or `saved`
   * @param ids Request ids 
   */
  replaceByRequestIds(type: string, ids: string[]): Promise<number>;

  /**
   * @param id The project id to append
   * @param index The position at which to start appending the projects
   * @returns the index of the last inserted item or -1 if none inserted.
   */
  appendByProjectId(id: string, index?: number): Promise<number>;

  /**
   * Replaces the current workspace with the project
   * @param id The project id in the data store
   * @returns the index of the last inserted item or -1 if none inserted.
   */
  replaceByProjectId(id: string): Promise<number>;
  
  /**
   * Removes a request for given index in the tabs array.
   * @param index THe tab index to remove.
   * @param ignoreSelection When set it does not updates the selection state.
   */
  removeRequest(index: number, ignoreSelection?: boolean): void;

  /**
   * Finds first position where the request is empty.
   * @return Index of empty request or `-1`.
   */
  findEmptyPosition(): number;

  /**
   * Selects a tab by its id.
   * @param id Tab id.
   */
  selectByTabId(id: string): void;

  /**
   * Duplicates the tab at a position
   * @param index Yhe index of the tab to duplicate
   */
  duplicateTab(index: number): void;

  /**
   * Closes all tabs in the workspace
   * @param index The index of the request to leave in the workspace. Optional.
   */
  closeAllTabs(index?: number): void;

  /**
   * Finds requests index in the tabs array by its data store id.
   * This does not find not saved requests.
   *
   * @param requestId The data store id of the request
   * @returns Request index or -1 if not found.
   */
  findRequestIndex(requestId: string): number;

  /**
   * @param {string} tabId
   */
  findRequestByTab(tabId: string): WorkspaceRequest;

  getActivePanel(): ArcRequestPanelElement|ArcWebsocketPanelElement|undefined;

  /**
   * Runs the currently active tab.
   */
  sendCurrent(): void;
  
  /**
   * Aborts the currently selected panel
   */
  abortCurrent(): void;

  /**
   * Aborts the currently selected panel
   */
  clearCurrent(): void;

  /**
   * Aborts all running requests
   */
  abortAll(): void;

  /**
   * Appends Project/Saved/History export data directly to workspace.
   * @param detail Arc import object with normalized import structure.
   */
  appendImportRequests(detail: ArcExportObject): void;

  /**
   * Triggers the save current request flow.
   */
  saveOpened(): void;

  /**
   * Triggers the "save as..." action on the current request.
   */
  saveAsOpened(): boolean;

  /**
   * Closes currently selected tab.
   */
  closeActiveTab(): void;

  /**
   * Opens the input for opening web app to start a web session.
   */
  openWebUrlInput(): void;

  /**
   * Adds a new tab to the tabs list.
   * Note, this function does not call `requestUpdate()`.
   * @param request The request that is associated with the tab
   * @returns The id of the created tab
   */
  [addTab](request: WorkspaceRequestUnion): string;

  /**
   * Creates a definition of a tab.
   * 
   * @param request The request that is associated with the tab
   * @returns The definition of a tab.
   */
  [createTab](request: WorkspaceRequestUnion): WorkspaceTab;

  /**
   * Updates the tab value from the request.
   * Note, this function does not call `requestUpdate()`.
   * 
   * @param id The id of the tab to update
   * @param request The request that is associated with the tab
   */
  [updateTab](id: string, request: WorkspaceRequestUnion): void;

  /**
   * @param request
   * @returns The label for the tab for a given request.
   */
  [readTabLabel](request: ArcRequest.ARCSavedRequest): string;

  /**
   * Clears the workspace
   */
  clear(): void;

  /**
   * Handler for click event on the request close button.
   */
  [closeRequestHandler](e: PointerEvent): void;

  /**
   * The handler for the tabs selection change event
   */
  [tabsSelectionHandler](e: Event): Promise<void>;

  [requestChangeHandler](e: Event): void;

  [tabDragStartHandler](e: DragEvent): void;

  [tabDragEndHandler](e: DragEvent): void;

  /**
   * Resets state of the reorder info object.
   */
  [resetReorderState](): void;

  /**
   * Resets styles of anypoint-tabs that has been moved during reorder action.
   */
  [resetReorderChildren](): void;

  /**
   * Moves a tab to corresponding position when drag finishes.
   * @return Position where the request has been moved to.
   */
  [rearrangeReorder](): number|undefined;

  [tabsDragOverHandler](e: DragEvent): void;

  /**
   * The handler for `dragleave` event on this element. If the dragged item is 
   * compatible then it hides the drop message.
   */
  [tabsDragLeaveHandler](e: DragEvent): void;

  [tabsDropHandler](e: DragEvent): void;

  /**
   * Handles the `dragover` event when in reordering model flow.
   * It updates tabs position and sets variables later used to compute new tab position.
   */
  [reorderDragover](e: DragEvent): void;

  /**
   * @returns Delta of the last move compared to the previous move.
   */
  [getReorderDdx](): number;

  /**
   * Finds the top level item from the DOM repeater that has been marked as a draggable item.
   * The event can originate from child elements which shouldn't be dragged.
   *
   * @returns An element that is container for draggable items. Undefined if couldn't find.
   */
  [getReorderedItem](e: DragEvent): WorkspaceTabElement|undefined;

  /**
   * Updates position of the children in the `workspace-tabs` container while tracking an item.
   * 
   * @param start Change start index.
   * @param end Change end index.
   * @param draggedIndex Index of the tab being dragged.
   * @param overIndex Index of the tab being under the pointer.
   */
  [updateTabsReorder](start: number, end: number, draggedIndex: number, overIndex: number): void;

  /**
   * Removes drop pointer to shadow root.
   * @param ref A list item to be used as a reference point.
   */
  [createDropPointer](ref: Element): void;

  [removeDropPointer](): void;

  /**
   * Computes index of the drop.
   * @returns Index where to drop the object.
   */
  [computeDropOrder](): number;

  /**
   * Action to handle dragover event when not in reorder mode.
   */
  [newTabDragover](e: DragEvent): void;

  /**
   * A handler for the `close` event dispatched by the editor tab. Closes a panel.
   */
  [tabCloseHandler](e: Event): void;

  /**
   * A handler for the `close` event dispatched by the request panel. Closes the panel.
   */
  [panelCloseHandler](e: Event): void;

  /**
   * A handler for the `duplicate` event dispatched by the request panel. 
   */
  [panelDuplicateHandler](e: Event): void;

  /**
   * It starts a timer to render a dropdown menu with the editor type options.
   * When the user release the button in less than `AddTypeSelectorDelay` ms then
   * the callback is canceled and the HTTP request editor is added, as a default editor.
   * When the callback is called a dropdown is rendered and the user can choose the type of the editor.
   */
  [addButtonMousedownHandler](): void;

  /**
   * Checks whether a mouse up timer is set. If so, this is a regular `click` event and it adds the 
   * default HTTP request editor. Otherwise it does nothing.
   */
  [addButtonMouseupHandler](e: Event): void;

  /**
   * This is called when the user long press the add tab button. 
   * It triggers the view to render the editor type dropdown menu.
   */
  [addButtonCallback](): void;

  /**
   * The handler for the dropdown selector for the editor type.
   * Adds a new tab with the selected type of the request.
   */
  [addButtonSelectorSelectedHandler](e: Event): void;

  [addButtonSelectorClosedHandler](): void;

  [sessionUrlInputHandler](e: Event): void;

  /**
   * Opens workspace meta details dialog.
   */
  openWorkspaceDetails(): void;

  /**
   * Opens workspace meta editor dialog. Closes the details when needed.
   */
  openWorkspaceEditor(): void;

  [workspaceMetaCloseHandler](): void;

  [sheetClosedHandler](e: Event): void;
  [storeWorkspaceMeta](e: CustomEvent): void;

  render(): TemplateResult;

  /**
   * @returns The template for the tabs list
   */
  [tabsTemplate](): TemplateResult;

  /**
   * @param item
   * @param index
   * @returns The template for the rendered request panel tab.
   */
  [tabTemplate](item: WorkspaceTab, index: number): TemplateResult;

  /**
   * @returns The template for all rendered panels in the workspace.
   */
  [panelsTemplate](): TemplateResult;

  /**
   * @param request The request to render
   * @param index Request index in the requests array
   * @param selectedTabId The id of the selected tab.
   * @returns The template for a request panel
   */
  [panelTemplate](request: WorkspaceRequest, index: number, selectedTabId: string): TemplateResult;

  /**
   * @param request The request to render
   * @param index Request index in the requests array
   * @param selectedTabId The id of the selected tab.
   * @returns The template for a request panel
   */
  [httpPanelTemplate](request: WorkspaceHttpRequest, index: number, selectedTabId: string): TemplateResult;

  /**
   * @param request The request to render
   * @param index Request index in the requests array
   * @param selectedTabId The id of the selected tab.
   * @returns The template for a request panel
   */
  [wsPanelTemplate](request: WorkspaceWebsocketRequest, index: number, selectedTabId: string): TemplateResult;

  /**
   * @returns The template for the drop down with add request panel type selector.
   */
  [tabTypeSelector](): TemplateResult;

  /**
   * @returns The template for the web session URL input.
   */
  [webUrlTemplate](): TemplateResult;

  /**
   * @returns The template for the workspace meta details dialog
   */
  [workspaceDetailTemplate](): TemplateResult;

  /**
   * @returns The template for the workspace meta editor dialog
   */
  [workspaceMetaTemplate](): TemplateResult;
}
