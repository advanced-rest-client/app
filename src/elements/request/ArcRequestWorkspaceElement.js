/* eslint-disable no-param-reassign */
/* eslint-disable class-methods-use-this */
import { LitElement, html } from 'lit-element';
import { classMap } from 'lit-html/directives/class-map.js';
import { EventsTargetMixin, ResizableMixin } from '@anypoint-web-components/awc';
import { v4 } from '@advanced-rest-client/uuid';
import { Events, EventTypes } from '@advanced-rest-client/events';
import { BodyProcessor } from '@advanced-rest-client/libs';
import '@anypoint-web-components/awc/anypoint-icon-button.js';
import '@anypoint-web-components/awc/anypoint-listbox.js';
import '@anypoint-web-components/awc/anypoint-dropdown.js';
import '@anypoint-web-components/awc/anypoint-item.js';
import '@anypoint-web-components/awc/bottom-sheet.js';
import '@advanced-rest-client/icons/arc-icon.js';
import elementStyles from './styles/Workspace.js';
import '../../../define/arc-websocket-panel.js';
import '../../../define/web-url-input.js';
import '../../../define/arc-request-panel.js';
import '../../../define/workspace-tab.js';
import '../../../define/workspace-tabs.js';
import '../../../define/workspace-details.js';
import '../../../define/workspace-editor.js';

/** @typedef {import('lit-element').TemplateResult} TemplateResult */
/** @typedef {import('@advanced-rest-client/events').ArcRequest.ArcBaseRequest} ArcBaseRequest */
/** @typedef {import('@advanced-rest-client/events').ArcRequest.ARCSavedRequest} ARCSavedRequest */
/** @typedef {import('@advanced-rest-client/events').ArcRequest.ARCHistoryRequest} ARCHistoryRequest */
/** @typedef {import('@advanced-rest-client/events').ArcRequest.RequestConfig} RequestConfig */
/** @typedef {import('@advanced-rest-client/events').WebSocket.WebsocketRequest} WebsocketRequest */
/** @typedef {import('@advanced-rest-client/events').WebSocket.WebsocketStoredRequest} WebsocketStoredRequest */
/** @typedef {import('@advanced-rest-client/events').Workspace.DomainWorkspace} DomainWorkspace */
/** @typedef {import('@advanced-rest-client/events').Workspace.WorkspaceRequestUnion} WorkspaceRequestUnion */
/** @typedef {import('@advanced-rest-client/events').DataExport.ArcExportObject} ArcExportObject */
/** @typedef {import('@advanced-rest-client/events').ApiTransportEvent} ApiTransportEvent */
/** @typedef {import('@anypoint-web-components/awc').AnypointIconButtonElement} AnypointIconButton */
/** @typedef {import('@anypoint-web-components/awc').AnypointListboxElement} AnypointListbox */
/** @typedef {import('../ws/ArcWebsocketPanelElement').default} ArcWebsocketPanelElement */
/** @typedef {import('../../types').WorkspaceTab} WorkspaceTab */
/** @typedef {import('../../types').AddRequestOptions} AddRequestOptions */
/** @typedef {import('../../types').WorkspaceRequest} WorkspaceRequest */
/** @typedef {import('../../types').WorkspaceHttpRequest} WorkspaceHttpRequest */
/** @typedef {import('../../types').WorkspaceWebsocketRequest} WorkspaceWebsocketRequest */
/** @typedef {import('./ArcRequestPanelElement').default} ArcRequestPanelElement */
/** @typedef {import('./WorkspaceTabsElement').default} WorkspaceTabsElement */
/** @typedef {import('./WorkspaceTabElement').default} WorkspaceTabElement */

export const addTab = Symbol('addTab');
export const createTab = Symbol('createTab');
export const updateTab = Symbol('updateTab');
export const tabsValue = Symbol('tabsValue');
export const requestsValue = Symbol('requestsValue');
export const tabsTemplate = Symbol('tabsTemplate');
export const tabTemplate = Symbol('tabTemplate');
export const panelsTemplate = Symbol('panelsTemplate');
export const panelTemplate = Symbol('panelTemplate');
export const httpPanelTemplate = Symbol('httpPanelTemplate');
export const wsPanelTemplate = Symbol('wsPanelTemplate');
export const closeRequestHandler = Symbol('closeRequestHandler');
export const tabsSelectionHandler = Symbol('tabsSelectionHandler');
export const requestChangeHandler = Symbol('requestChangeHandler');
export const tabDragStartHandler = Symbol('tabDragStartHandler');
export const tabDragEndHandler = Symbol('tabDragEndHandler');
export const tabCloseHandler = Symbol('tabCloseHandler');
export const reorderInfo = Symbol('reorderInfo');
export const workspaceValue = Symbol('workspaceValue');
export const restoreRequests = Symbol('restoreRequests');
export const readTabLabel = Symbol('readTabLabel');
export const storeWorkspace = Symbol('storeWorkspace');
export const storeTimeoutValue = Symbol('storeTimeoutValue');
export const syncWorkspaceRequests = Symbol('syncWorkspaceRequests');
export const panelCloseHandler = Symbol('panelCloseHandler');
export const panelDuplicateHandler = Symbol('panelDuplicateHandler');
export const tabsDragOverHandler = Symbol('tabsDragOverHandler');
export const tabsDragLeaveHandler = Symbol('tabsDragLeaveHandler');
export const tabsDropHandler = Symbol('tabsDropHandler');
export const resetReorderState = Symbol('resetReorderState');
export const rearrangeReorder = Symbol('rearrangeReorder');
export const reorderDragover = Symbol('reorderDragover');
export const getReorderDdx = Symbol('getReorderDdx');
export const getReorderedItem = Symbol('getReorderedItem');
export const updateTabsReorder = Symbol('updateTabsReorder');
export const createDropPointer = Symbol('createDropPointer');
export const removeDropPointer = Symbol('removeDropPointer');
export const dropPointerReference = Symbol('dropPointerReference');
export const dropPointer = Symbol('dropPointer');
export const newTabDragover = Symbol('newTabDragover');
export const resetReorderChildren = Symbol('resetReorderChildren');
export const computeDropOrder = Symbol('computeDropOrder');
export const transportHandler = Symbol('transportHandler');
export const tabTypeSelector = Symbol('tabTypeSelector');
export const addButtonRef = Symbol('addButtonRef');
export const addButtonTimeout = Symbol('addButtonTimeout');
export const addButtonCallback = Symbol('addButtonCallback');
export const addButtonMousedownHandler = Symbol('addButtonMousedownHandler');
export const addButtonMouseupHandler = Symbol('addButtonMouseupHandler');
export const addButtonSelectorOpened = Symbol('addButtonSelectorOpened');
export const addButtonSelectorSelectedHandler = Symbol('addButtonSelectorSelectedHandler');
export const addButtonSelectorClosedHandler = Symbol('addButtonSelectorClosedHandler');
export const webUrlTemplate = Symbol('webUrlTemplate');
export const sessionUrlInputHandler = Symbol('sessionUrlInputHandler');
export const workspaceMetaCloseHandler = Symbol('workspaceMetaCloseHandler');
export const workspaceDetailTemplate = Symbol('workspaceDetailTemplate');
export const workspaceMetaTemplate = Symbol('workspaceMetaTemplate');
export const sheetClosedHandler = Symbol('sheetClosedHandler');
export const storeWorkspaceMeta = Symbol('storeWorkspaceMeta');
export const triggerWriteHandler = Symbol('triggerWriteHandler');

const AddTypeSelectorDelay = 700;

export default class ArcRequestWorkspaceElement extends ResizableMixin(EventsTargetMixin(LitElement)) {
  static get styles() {
    return elementStyles;
  }

  static get properties() {
    return { 
      /** 
       * The index of the selected panel. This is the index of the tab to be selected.
       */
      selected: { type: Number, reflect: true },
      /** 
       * Enables Anypoint theme.
      */
      anypoint: { type: Boolean },
      /**
       * Redirect URL for the OAuth2 authorization.
       * If can be also set by dispatching `oauth2-redirect-url-changed`
       * with `value` property on the `detail` object.
       */
      oauth2RedirectUri: { type: String },
      /** 
       * When set it requests workspace state read when connected to the DOM.
       */
      autoRead: { type: Boolean },
      /** 
       * A timeout after which the actual store workspace event is dispatched.
       * Default to 500 (ms).
       */
      storeTimeout: { type: Number },
      /** 
       * When set it renders the send request button on the request editor
       */
      renderSend: { type: Boolean },
      /** 
       * Whether to render the request progress status in the request panel.
       * This works with the events dispatched by the transport library. Custom libraries may not support this.
       */
      progressInfo: { type: Boolean },
      /** 
       * When set the request editor does not allow to send the request if one is already loading.
       */
      noSendOnLoading: { type: Boolean },
      /**
       * An URL to be present in the session URL input when opened.
       * The input can be opened by calling `openWebUrlInput()`
       */
      webSessionUrl: { type: String },
      /**
       * Indicates that the workspace details dialog is opened
       */
      workspaceDetailsOpened: { type: Boolean },
      /**
       * Indicates that the workspace meta editor is opened
       */
      workspaceMetaOpened: { type: Boolean },
    };
  }

  constructor() {
    super();
    /**  
     * Note, tabs are in sync with workspace requests array
     * 
     * @type {WorkspaceTab[]}
     */
    this[tabsValue] = [];
    /** 
     * @type {WorkspaceRequest[]}
     */
    this[requestsValue] = [];

    this.anypoint = false;
    /** 
     * @type {number}
     */
    this.selected = undefined;
    /** 
     * @type {string}
     */
    this.oauth2RedirectUri = undefined;
    /** 
     * @type {string}
     */
    this.webSessionUrl = undefined;
    this.noSendOnLoading = false;
    /** 
     * @type {DomainWorkspace}
     */
    this[workspaceValue] = /** @type DomainWorkspace */ ({
      kind: 'ARC#DomainWorkspace',
      id: v4(),
    });
    this.autoRead = false;
    this.storeTimeout = 500;
    this.renderSend = false;
    this.progressInfo = false;
    this.workspaceDetailsOpened = false;
    this.workspaceMetaOpened = false;
    this[addButtonSelectorOpened] = false;

    this[transportHandler] = this[transportHandler].bind(this);
    this[addButtonCallback] = this[addButtonCallback].bind(this);
    this[triggerWriteHandler] = this[triggerWriteHandler].bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    if (this.autoRead) {
      this.restore();
    }

    this.addEventListener(EventTypes.Transport.request, this[transportHandler]);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener(EventTypes.Transport.request, this[transportHandler]);
  }

  /**
   * @param {EventTarget} node 
   */
  _attachListeners(node) {
    super._attachListeners(node);
    node.addEventListener(EventTypes.Workspace.triggerWrite, this[triggerWriteHandler]);
  }

  /**
   * @param {EventTarget} node 
   */
   _detachListeners(node) {
    super._detachListeners(node);
    node.removeEventListener(EventTypes.Workspace.triggerWrite, this[triggerWriteHandler]);
  }

  /**
   * @param {Map<string | number | symbol, unknown>} args
   */
  firstUpdated(args) {
    super.firstUpdated(args);
    this[addButtonRef] = /** @type AnypointIconButton */ (this.shadowRoot.querySelector('.add-request-button'))
  }

  [triggerWriteHandler]() {
    this.store();
  }

  /**
   * A handler for the request transport event.
   * It updates request configuration to add configuration from the workspace.
   * @param {ApiTransportEvent} e
   */
  [transportHandler](e) {
    let rConfig = e.detail.request.config;
    if (!rConfig || (rConfig && rConfig.enabled === false)) {
      rConfig = {
        enabled: true,
      };
    }
    const wConfig = this[workspaceValue].config;
    const enabled = rConfig.enabled || !!wConfig;
    const result = /** @type RequestConfig */ ({
      ...(wConfig || {}),
      ...(rConfig || {}),
      enabled,
    });
    if (result.timeout && typeof result.timeout === 'string') {
      result.timeout = Number(result.timeout);
    }
    e.detail.request.config = result;
  }

  /**
   * Dispatches the workspace restore event and sets the workspace data.
   * If the event does not return workspace an empty workspace is created.
   */
  async restore() {
    this.clear();
    const result = await Events.Workspace.read(this);
    /** @type DomainWorkspace */
    let value;
    if (result) {
      if (!result.id) {
        result.id = v4();
      }
      if (Array.isArray(result.requests)) {
        result.requests = result.requests.map((request) => BodyProcessor.restoreRequest(request));
      }
      value = result;
    } else {
      value = /** @type DomainWorkspace */ ({
        kind: 'ARC#DomainWorkspace',
        id: v4(),
      });
    }
    this.setWorkspace(value);
    await this.requestUpdate();
    this.notifyResize();
  }

  /**
   * Dispatches an event to store the current workspace.
   */
  async store() {
    if (this[storeTimeoutValue]) {
      clearTimeout(this[storeTimeoutValue]);
    }
    this[storeTimeoutValue] = setTimeout(() => this[storeWorkspace](), this.storeTimeout);
  }

  async [storeWorkspace]() {
    this[storeTimeoutValue] = undefined;
    this[syncWorkspaceRequests]();
    const workspace = this[workspaceValue];
    const ps = workspace.requests.map((request) => BodyProcessor.stringifyRequest(request));
    const requests = await Promise.all(ps);
    workspace.requests = requests;
    await Events.Workspace.write(this, workspace);
  }

  /**
   * A function that updates workspace requests array to reflect the current order and properties of the panels.
   */
  [syncWorkspaceRequests]() {
    const result = [];
    const tabs = this[tabsValue];
    const requests = this[requestsValue];
    tabs.forEach((tab) => {
      const request = requests.find((item) => item.tab === tab.id);
      if (request) {
        result.push(request.request)
      }
    });
    this[workspaceValue].requests = result;
  }

  /**
   * Updates local properties from the workspace state file.
   * @param {DomainWorkspace} workspace
   */
  setWorkspace(workspace) {
    this[workspaceValue] = workspace;
    this[restoreRequests](workspace.requests);
    if (typeof workspace.selected === 'number') {
      this.selected = workspace.selected;
    } else {
      this.selected = 0;
    }
    if (workspace.webSession && workspace.webSession.webSessionUrl) {
      this.webSessionUrl = workspace.webSession.webSessionUrl;
    }
  }

  /**
   * @param {WorkspaceRequestUnion[]} requests
   */
  [restoreRequests](requests) {
    if (!Array.isArray(requests) || !requests.length) {
      this.addHttpRequest();
      return;
    }
    requests.forEach((request) => this.add(request, { noAutoSelect: true, skipPositionCheck: true, skipUpdate: true, skipStore: true,}));
  }

  /**
   * Adds new request to the workspace.
   * @param {WorkspaceRequestUnion} request
   * @param {AddRequestOptions} [options={}] Append options
   * @returns {number} The index at which the request was inserted.
   */
  add(request, options={}) {
    let index = options.skipPositionCheck ? -1 : this.findEmptyPosition();
    let tab;
    if (index !== -1) {
      this[requestsValue][index].request = request;
      this[requestsValue][index] = { ...this[requestsValue][index] };
      tab = this[requestsValue][index].tab;
      this[updateTab](tab, request);
    } else {
      tab = this[addTab](request);
      const info = /** @type WorkspaceRequest */ ({
        id: v4(),
        request,
        tab,
      });
      const length = this[requestsValue].push(info);
      index = length - 1;
    }
    
    if (!options.noAutoSelect) {
      this.selectByTabId(tab);
    }
    if (!options.skipUpdate) {
      this.requestUpdate();
    }
    if (!options.skipStore) {
      this.store();
    }
    return index;
  }

  /**
   * Adds an empty HTTP request to the workspace.
   * @returns {number} The index at which the request was inserted.
   */
  addHttpRequest() {
    return this.add({
      kind: 'ARC#HttpRequest',
      method: 'GET',
      url: 'http://'
    });
  }

  /**
   * Adds an empty web socket request to the workspace.
   * @returns {number} The index at which the request was inserted.
   */
  addWsRequest() {
    return this.add({
      kind: 'ARC#WebsocketRequest',
      url: 'ws://'
    });
  }

  /**
   * Adds a request at specific position moving the request at the position to the right.
   * If the position is out of `activeRequests` bounds.
   * 
   * @param {number} index The position of the tab where to put the request
   * @param {WorkspaceRequestUnion} request Request object to put.
   * @param {AddRequestOptions=} options Add request options
   * 
   * @returns {number} The position at which the tab was inserted. It might be different than requested when the index is out of bounds.
   */
  addAt(index, request, options={}) {
    const tabs = this[tabsValue];
    if (index >= tabs.length) {
      return this.add(request, options);
    }
    const tab = this[createTab](request);
    tabs.splice(index, 0, tab);
    const info = /** @type WorkspaceRequest */ ({
      id: v4(),
      request,
      tab: tab.id,
    });
    const length = this[requestsValue].push(info);
    this.requestUpdate();
    if (!options.noAutoSelect) {
      this.selectByTabId(tab.id);
    }
    if (!options.skipStore) {
      this.store();
    }
    return length - 1;
  }

  /**
   * Adds a request at specific position moving the request at the position to the right.
   * If the position is out of `activeRequests` bounds.
   * 
   * @param {number} index The position of the tab where to put the request
   * @param {string} type The request type
   * @param {string} id The request data store id
   * @param {AddRequestOptions=} options Add request options
   * 
   * @returns {Promise<number>} The position at which the tab was inserted. It might be different than requested when the index is out of bounds.
   */
  async addAtByRequestId(index, type, id, options) {
    const request = await Events.Model.Request.read(this, type, id);
    return this.addAt(index, request, options);
  }

  /**
   * Appends request by its datastore id.
   * @param {string} type Request type: `saved` or `history`.
   * @param {string} id The data store id
   * @returns {Promise<number>} The position at which the request has been added.
   */
  async addByRequestId(type, id) {
    const request = await Events.Model.Request.read(this, type, id);
    const index = this.findRequestIndex(request._id);
    if (index === -1) {
      return this.add(request);
    }
    const tab = this[tabsValue][index];
    const existing = this[requestsValue].find((item) => item.tab === tab.id);
    existing.request = request;
    const typed = /** @type ARCSavedRequest */ (request);
    tab.label = this[readTabLabel](typed);
    this.selected = index;
    this[workspaceValue].selected = index;
    this.requestUpdate();
    this.store();
    return index;
  }

  /**
   * Appends requests by their datastore id.
   * @param {string} type Request type: `saved` or `history`.
   * @param {string[]} ids The data store id
   * @returns {Promise<number>} The position at which the last request has been added.
   */
  async addByRequestIds(type, ids) {
    const requests = await Events.Model.Request.readBulk(this, type, ids);
    let result = -1;
    requests.forEach((request) => {
      const index = this.findRequestIndex(request._id);
      if (index === -1) {
        result = this.add(request, { noAutoSelect: true, skipPositionCheck: true, skipStore: true, skipUpdate: true });
      } else {
        const tab = this[tabsValue][index];
        const existing = this[requestsValue].find((item) => item.tab === tab.id);
        existing.request = request;
        const typed = /** @type ARCSavedRequest */ (request);
        tab.label = this[readTabLabel](typed);
        result = index;
      }
    });
    
    this.selected = result;
    this[workspaceValue].selected = this.selected;
    this.requestUpdate();
    this.store();
    return result;
  }

  /**
   * Replaces current workspace with the request passed in the argument.
   * @param {string} type A request type. `history` or `saved`
   * @param {string} id Request id 
   * @return {Promise<number>}
   */
  replaceByRequestId(type, id) {
    this.clear();
    return this.addByRequestId(type, id);
  }

  /**
   * Replaces current workspace with requests passed in the argument.
   * @param {string} type A request type. `history` or `saved`
   * @param {string[]} ids Request ids 
   * @return {Promise<number>}
   */
  replaceByRequestIds(type, ids) {
    this.clear();
    return this.addByRequestIds(type, ids);
  }

  /**
   * @param {string} id The project id to append
   * @param {number=} index The position at which to start appending the projects
   * @returns {Promise<number>} the index of the last inserted item or -1 if none inserted.
   */
  async appendByProjectId(id, index) {
    const project = await Events.Model.Project.read(this, id);
    if (!Array.isArray(project.requests) || !project.requests.length) {
      return -1;
    }
    const requests = await Events.Model.Request.readBulk(this, 'saved', project.requests, {
      preserveOrder: true,
    });
    let lastIndex;
    let hasIndex = typeof index === 'number';
    const tabs = this[tabsValue];
    if (hasIndex && index >= tabs.length) {
      hasIndex = false;
    }
    const opts = {
      skipPositionCheck: true,
      noAutoSelect: true,
      skipStore: true, 
      skipUpdate: true,
    };
    requests.forEach((request, i) => {
      if (!request) {
        // request does not exist in the store anymore
        return;
      }
      if (hasIndex) {
        lastIndex = index + i;
        this.addAt(lastIndex, request, opts);
      } else {
        lastIndex = this.add(request, opts);
      }
    });

    this.selected = lastIndex;
    this[workspaceValue].selected = this.selected;
    this.requestUpdate();
    this.store();
    return lastIndex;
  }

  /**
   * Replaces the current workspace with the project
   * @param {string} id The project id in the data store
   * @returns {Promise<number>} the index of the last inserted item or -1 if none inserted.
   */
  async replaceByProjectId(id) {
    this.clear();
    return this.appendByProjectId(id);
  }
  
  /**
   * Removes a request for given index in the tabs array.
   * @param {number} index THe tab index to remove.
   * @param {boolean=} ignoreSelection When set it does not updates the selection state.
   */
  removeRequest(index, ignoreSelection=false) {
    const tabs = this[tabsValue];
    const tab = tabs[index];
    if (!tab) {
      return;
    }
    tabs.splice(index, 1);
    const requests = this[requestsValue];
    const requestIndex = requests.findIndex((item) => item.tab === tab.id);
    if (requestIndex !== -1) {
      requests.splice(requestIndex, 1);
    }
    this.requestUpdate();
    this.store();
    if (ignoreSelection) {
      return;
    }
    let i = index;
    if (i === this.selected) {
      i -= 1;
      if (i < 0) {
        i = 0;
      }
      if (i === 0) {
        this.selected = undefined;
      }
      this.selected = i;
    } else if (this.selected > i) {
      this.selected -= 1;
    }
    if (!tabs.length) {
      requestAnimationFrame(() => this.addHttpRequest());
    }
    this[workspaceValue].selected = this.selected;
    this.store();
  }

  /**
   * Finds first position where the request is empty.
   * @return {Number} Index of empty request or `-1`.
   */
  findEmptyPosition() {
    const requests = this[requestsValue];
    let result = -1;
    if (!Array.isArray(requests) || !requests.length) {
      return result;
    }
    result = requests.findIndex((item) => {
      const { request } = item;
      if (request.kind === 'ARC#WebsocketRequest') {
        return (!request.url || request.url === 'ws://');
      }
      const typedHttp = /** @type ArcBaseRequest */ (request);
      return (!request.url || request.url === 'http://') && !typedHttp.headers && !typedHttp.payload;
    });
    return result;
  }

  /**
   * Selects a tab by its id.
   * @param {string} id Tab id.
   */
  selectByTabId(id) {
    const tabIndex = this[tabsValue].findIndex((item) => item.id === id);
    if (this.selected !== tabIndex) {
      this.selected = tabIndex;
      this[workspaceValue].selected = this.selected;
      this.store();
    }
  }

  /**
   * Duplicates the tab at a position
   * @param {number} index Yhe index of the tab to duplicate
   */
  duplicateTab(index) {
    const tabs = this[tabsValue];
    const tab = tabs[index];
    if (!tab) {
      return;
    }
    const requests = this[requestsValue];
    const request = requests.find((item) => item.tab === tab.id);
    const copy = /** @type ARCSavedRequest */ ({ ...request.request });
    delete copy._id;
    delete copy._rev;
    delete copy.name;
    delete copy.driveId;
    delete copy.projects;
    delete copy.type;
    this.add(copy, {
      skipPositionCheck: true,
    });
  }

  /**
   * Closes all tabs in the workspace
   * @param {number=} index The index of the request to leave in the workspace. Optional.
   */
  closeAllTabs(index) {
    if (typeof index === 'number') {
      const tabs = this[tabsValue];
      const tab = tabs[index];
      if (!tab) {
        return;
      }
      const request = this.findRequestByTab(tab.id);
      this.clear();
      this.add(request.request);
    } else {
      this.clear();
    }
  }

  /**
   * Finds requests index in the tabs array by its data store id.
   * This does not find not saved requests.
   *
   * @param {string} requestId The data store id of the request
   * @return {number} Request index or -1 if not found.
   */
  findRequestIndex(requestId) {
    if (!requestId) {
      return -1;
    }
    const requests = this[requestsValue];
    const item = requests.find((request) => /** @type ARCSavedRequest */ (request.request)._id === requestId);
    if (!item) {
      return -1;
    }
    return this[tabsValue].findIndex((tab) => tab.id === item.tab);
  }

  /**
   * @param {string} tabId
   * @returns {WorkspaceRequest|undefined}
   */
  findRequestByTab(tabId) {
    const requests = this[requestsValue];
    if (!Array.isArray(requests) || !requests.length) {
      return undefined;
    }
    return requests.find((item) => item.tab === tabId);
  }

  /**
   * @returns {ArcRequestPanelElement|ArcWebsocketPanelElement|undefined}
   */
  getActivePanel() {
    const tab = this[tabsValue][this.selected];
    if (!tab) {
      return undefined;
    }
    const { id } = tab
    return /** @type ArcRequestPanelElement|ArcWebsocketPanelElement */ (this.shadowRoot.querySelector(`.request-panel[data-tab="${id}"]`));
  }

  /**
   * Runs the currently active tab.
   */
  sendCurrent() {
    const panel = this.getActivePanel();
    const tab = this[tabsValue][this.selected];
    const workspaceRequest = this.findRequestByTab(tab.id);
    if (workspaceRequest.request.kind === 'ARC#WebsocketRequest') {
      const wsPanel = /** @type ArcWebsocketPanelElement */ (panel);
      if (wsPanel.connected) {
        wsPanel.send();
      } else {
        wsPanel.connect();
      }
    } else {
      panel.send();
    }
  }
  
  /**
   * Aborts the currently selected panel
   */
  abortCurrent() {
    const panel = this.getActivePanel();
    const tab = this[tabsValue][this.selected];
    const workspaceRequest = this.findRequestByTab(tab.id);
    if (workspaceRequest.request.kind === 'ARC#WebsocketRequest') {
      const wsPanel = /** @type ArcWebsocketPanelElement */ (panel);
      wsPanel.disconnect();
    } else {
      const httpPanel = /** @type ArcRequestPanelElement */ (panel);
      httpPanel.abort();
    }
  }

  /**
   * Aborts the currently selected panel
   */
  clearCurrent() {
    const panel = this.getActivePanel();
    panel.clear();
  }

  /**
   * Aborts all running requests
   */
  abortAll() {
    const nodes = /** @type {(ArcRequestPanelElement|ArcWebsocketPanelElement)[]} */ (Array.from(this.shadowRoot.querySelectorAll('arc-request-panel,arc-websocket-panel')));
    nodes.forEach((panel) => {
      if (panel.localName === 'arc-websocket-panel') {
        const wsPanel = /** @type ArcWebsocketPanelElement */ (panel);
        wsPanel.disconnect();
      } else {
        const httpPanel = /** @type ArcRequestPanelElement */ (panel);
        if (httpPanel.loading) {
          httpPanel.abort();
        }
      }
    });
  }

  /**
   * Appends Project/Saved/History export data directly to workspace.
   * @param {ArcExportObject} detail Arc import object with normalized import structure.
   */
  appendImportRequests(detail) {
    let requests;
    switch (detail.kind) {
      case 'ARC#ProjectExport':
      case 'ARC#SavedExport':
        requests = detail.requests;
        break;
      case 'ARC#HistoryExport':
        requests = detail.history;
        break;
      default: 
    }
    if (!Array.isArray(requests) || !requests.length) {
      return;
    }
    requests.forEach((item) => this.add(item));
  }

  /**
   * Triggers the save current request flow.
   */
  saveOpened() {
    const panel = this.getActivePanel();
    if (panel.localName === 'arc-request-panel') {
      const httpPanel = /** @type ArcRequestPanelElement */ (panel);
      httpPanel.saveAction();
    }
  }

  /**
   * Triggers the "save as..." action on the current request.
   */
  saveAsOpened() {
    const panel = this.getActivePanel();
    if (panel.localName === 'arc-request-panel') {
      const httpPanel = /** @type ArcRequestPanelElement */ (panel);
      httpPanel.saveAsAction();
    }
  }

  /**
   * Closes currently selected tab.
   */
  closeActiveTab() {
    const panel = this.getActivePanel();
    const tabId = panel.dataset.tab;
    const index = this[tabsValue].findIndex((tab) => tab.id === tabId);
    this.removeRequest(index);
  }

  /**
   * Opens the input for opening web app to start a web session.
   */
  openWebUrlInput() {
    const input = this.shadowRoot.querySelector('web-url-input');
    input.opened = true;
  }

  /**
   * Adds a new tab to the tabs list.
   * Note, this function does not call `requestUpdate()`.
   * @param {WorkspaceRequestUnion} request The request that is associated with the tab
   * @returns {string} The id of the created tab
   */
  [addTab](request) {
    const tab = this[createTab](request);
    this[tabsValue].push(tab);
    return tab.id;
  }

  /**
   * Creates a definition of a tab.
   * 
   * @param {WorkspaceRequestUnion} request The request that is associated with the tab
   * @returns {WorkspaceTab} The definition of a tab.
   */
  [createTab](request) {
    const label = this[readTabLabel](request);
    return {
      id: v4(),
      label,
    };
  }

  /**
   * Updates the tab value from the request.
   * Note, this function does not call `requestUpdate()`.
   * 
   * @param {string} id The id of the tab to update
   * @param {WorkspaceRequestUnion} request The request that is associated with the tab
   */
  [updateTab](id, request) {
    const tab = this[tabsValue].find((item) => item.id === id);
    if (!tab) {
      return;
    }
    tab.label = this[readTabLabel](request);
  }

  /**
   * @param {WorkspaceRequestUnion} request
   * @returns {string} The label for the tab for a given request.
   */
  [readTabLabel](request) {
    if (request.kind === 'ARC#WebsocketRequest') {
      const storedWs = /** @type WebsocketStoredRequest */ (request);
      if (storedWs.name) {
        return storedWs.name;
      }
      if (request.url && request.url !== 'ws://' && request.url.length > 5) {
        return request.url;
      }
      return 'New socket';
    }
    const typedSaved = /** @type ARCSavedRequest */ (request);
    if (typedSaved.name) {
      return typedSaved.name;
    }
    if (request.url && request.url !== 'http://' && request.url.length > 6) {
      return request.url;
    }
    return 'New request';
  }

  /**
   * Clears the workspace
   */
  clear() {
    this[tabsValue] = /** @type WorkspaceTab[] */ ([]);
    this[requestsValue] = /** @type WorkspaceRequest[] */ ([]);
    this.selected = undefined;
    this[workspaceValue].selected = undefined;
    this.store();
  }

  /**
   * Handler for click event on the request close button.
   * @param {PointerEvent} e
   */
  [closeRequestHandler](e) {
    e.preventDefault();
    e.stopPropagation();
    const node = /** @type HTMLElement */ (e.currentTarget);
    const index = Number(node.dataset.index);
    if (Number.isNaN(index)) {
      return;
    }
    this.removeRequest(index);
  }

  /**
   * The handler for the tabs selection change event
   * @param {Event} e
   */
  async [tabsSelectionHandler](e) {
    const node = /** @type WorkspaceTabsElement */ (e.target);
    this.selected = Number(node.selected);
    this[workspaceValue].selected = this.selected;
    this.store();
    await this.updateComplete;
    this.notifyResize();
  }

  /**
   * @param {Event} e
   */
  [requestChangeHandler](e) {
    const panel = /** @type ArcRequestPanelElement|ArcWebsocketPanelElement */ (e.target);
    const request = panel.editorRequest;
    const tabId = panel.dataset.tab;
    const index = Number(panel.dataset.index);
    this[requestsValue][index].id = request.id;
    this[requestsValue][index].request = request.request;
    this[updateTab](tabId, request.request);
    this.requestUpdate();
    this.store();
  }

  /**
   * @param {DragEvent} e
   */
  [tabDragStartHandler](e) {
    const node = /** @type WorkspaceTabElement */ (e.currentTarget);
    const index = Number(node.dataset.index);
    if (Number.isNaN(index)) {
      return;
    }
    const tabs = this[tabsValue];
    const tab = tabs[index];
    if (!tab) {
      return;
    }
    const requests = /** @type WorkspaceRequest[] */ (this[requestsValue]);
    const requestIndex = requests.findIndex((item) => item.tab === tab.id);
    if (requestIndex === -1) {
      return;
    }
    const request = requests[requestIndex];
    const typed = /** @type ARCSavedRequest */ (request.request);
    const dt = e.dataTransfer;
    if (typed._id) {
      dt.setData('arc/id', typed._id);
      if (typed.kind === 'ARC#WebsocketRequest') {
        dt.setData('arc/type', 'websocket');
        dt.setData('arc/websocket', '1');
      } else {
        dt.setData('arc/http', '1');
        dt.setData('arc/type', typed.type);
        if (typed.type === 'history') {
          dt.setData('arc/history', '1');
        } else if (typed.type === 'saved') {
          dt.setData('arc/saved', '1');
        }
      }
    }
    dt.setData('arc/request', '1');
    dt.setData('arc/source', this.localName);
    dt.setData('arc-source/request-workspace', '1');
    dt.effectAllowed = 'copyMove';

    this[resetReorderState]()
    this[reorderInfo].type = 'track';
    this[reorderInfo].dragElement = node;
    this[reorderInfo].dragIndex = index;
    setTimeout(() => {
      node.style.visibility = 'hidden';
    });
  }

  /**
   * @param {DragEvent} e
   */
  [tabDragEndHandler](e) {
    if (!this[reorderInfo] || this[reorderInfo].type !== 'track') {
      return;
    }
    const toIdx = this[rearrangeReorder]();
    this[resetReorderChildren]();
    if (typeof toIdx === 'number') {
      this.selected = toIdx;
      this[workspaceValue].selected = this.selected;
      this.store();
      this.notifyResize();
    }
    this[resetReorderState]();
    const tab = /** @type WorkspaceTabElement */ (e.currentTarget);
    tab.style.visibility = 'visible';
  }

  /**
   * Resets state of the reorder info object.
   */
  [resetReorderState]() {
    this[reorderInfo] = {
      type: 'start',
      dragElement: undefined,
      dragIndex: undefined,
      overIndex: undefined,
      moves: [],
      dirOffset: 0,
    };
  }

  /**
   * Resets styles of anypoint-tabs that has been moved during reorder action.
   */
  [resetReorderChildren]() {
    const children = this.shadowRoot.querySelectorAll('workspace-tab');
    Array.from(children).forEach((tab) => {
      tab.style.transform = '';
      tab.classList.remove('moving');
    });
  }

  /**
   * Moves a tab to corresponding position when drag finishes.
   * @return {number|undefined} Position where the request has been moved to.
   */
  [rearrangeReorder]() {
    const info = this[reorderInfo];
    const fromIdx = info.dragIndex;
    let toIdx;
    const items = this[tabsValue];
    if (fromIdx >= 0 && info.overIndex >= 0) {
      toIdx = info.overIndex;
      const item = items.splice(fromIdx, 1)[0];
      items.splice(toIdx, 0, item);
    }
    this[tabsValue] = /** @type WorkspaceTab[] */ (items);
    this.requestUpdate();
    return toIdx;
  }

  /**
   * @param {DragEvent} e
   */
  [tabsDragOverHandler](e) {
    const dt = e.dataTransfer;
    const types = [...dt.types];
    if (!types.includes('arc/request') && !types.includes('arc/project')) {
      return;
    }
    e.preventDefault();
    if (types.includes('arc-source/request-workspace')) {
      e.dataTransfer.dropEffect = 'move';
      this[reorderDragover](e);
    } else {
      e.dataTransfer.dropEffect = 'copy';
      this[newTabDragover](e);
    }
  }

  /**
   * The handler for `dragleave` event on this element. If the dragged item is 
   * compatible then it hides the drop message.
   * 
   * @param {DragEvent} e
   */
  [tabsDragLeaveHandler](e) {
    const dt = e.dataTransfer;
    const types = [...dt.types];
    if (!types.includes('arc/request') && !types.includes('arc/project')) {
      return;
    }
    e.preventDefault();
    this[removeDropPointer]();
    this[dropPointerReference] = undefined;
  }

  /**
   * @param {DragEvent} e
   */
  [tabsDropHandler](e) {
    if (this[reorderInfo] && this[reorderInfo].type === 'track') {
      // This is reorder drop
      return;
    }
    const dt = e.dataTransfer;
    const types = [...dt.types];
    const isRequest = types.includes('arc/request');
    const isProject = types.includes('arc/project');
    if (!isRequest && !isProject) {
      return;
    }
    e.preventDefault();
    this[removeDropPointer]();
    if (isRequest) {
      const type = dt.getData('arc/type');
      const id = dt.getData('arc/id');
      if (e.ctrlKey || e.metaKey) {
        this.clear();
        this.addByRequestId(type, id);
      } else {
        const order = this[computeDropOrder]();
        this.addAtByRequestId(order, type, id);
      }
    } else {
      const id = dt.getData('arc/id');
      if (e.ctrlKey || e.metaKey) {
        this.replaceByProjectId(id);
      } else {
        const order = this[computeDropOrder]();
        this.appendByProjectId(id, order);
      }
    }
    this[dropPointerReference] = undefined;
  }

  /**
   * Handles the `dragover` event when in reordering model flow.
   * It updates tabs position and sets variables later used to compute new tab position.
   * 
   * @param {DragEvent} e
   */
  [reorderDragover](e) {
    if (this[reorderInfo].type !== 'track') {
      return;
    }
    this[reorderInfo].moves.push({ x: e.clientX, y: e.clientY });
    const dragElement = this[getReorderedItem](e);
    if (!dragElement) {
      return;
    }
    const index = Number(dragElement.dataset.index);
    const ddx = this[getReorderDdx]();
    this[reorderInfo].dirOffset = ddx < 0 ? -1 : 0;
    const lastOverIndex = this[reorderInfo].overIndex || 0;
    const overIndex = index + this[reorderInfo].dirOffset;
    const start = Math.max(overIndex < lastOverIndex ? overIndex : lastOverIndex, 0);
    const end = index < lastOverIndex ? lastOverIndex : index;
    const draggedIndex = this[reorderInfo].dragIndex;
    this[updateTabsReorder](start, end, draggedIndex, overIndex);
    this[reorderInfo].overIndex = index;
  }

  /**
   * @returns {number} Delta of the last move compared to the previous move.
   */
  [getReorderDdx]() {
    const secondLast = this[reorderInfo].moves[this[reorderInfo].moves.length - 2];
    const lastMove = this[reorderInfo].moves[this[reorderInfo].moves.length - 1];
    let ddx = 0;
    if (secondLast) {
      ddx = lastMove.x - secondLast.x;
    }
    return ddx;
  }

  /**
   * Finds the top level item from the DOM repeater that has been marked as a draggable item.
   * The event can originate from child elements which shouldn't be dragged.
   *
   * @param {DragEvent} e
   * @return {WorkspaceTabElement|undefined} An element that is container for draggable items. Undefined if couldn't find.
   */
  [getReorderedItem](e)  {
    const elmName = 'WORKSPACE-TAB';
    const topTarget = /** @type WorkspaceTabElement */ (e.target);
    if (topTarget.nodeName === elmName) {
      return topTarget;
    }
    const path = e.composedPath();
    if (!path || !path.length) {
      return undefined;
    }
    return /** @type WorkspaceTabElement */ (path.find((node) => 
       /** @type WorkspaceTabElement */ (node).nodeName === elmName
    ));
  }

  /**
   * Updates position of the children in the `workspace-tabs` container while tracking an item.
   * 
   * @param {number} start Change start index.
   * @param {number} end Change end index.
   * @param {number} draggedIndex Index of the tab being dragged.
   * @param {number} overIndex Index of the tab being under the pointer.
   */
  [updateTabsReorder](start, end, draggedIndex, overIndex) {
    const children = this.shadowRoot.querySelectorAll('workspace-tab');
    const dragElement = children[draggedIndex];
    // eslint-disable-next-line no-plusplus
    for (let i = start; i <= end; i++) {
      const el = children[i];
      if (i !== draggedIndex) {
        let dir = 0;
        if (i > draggedIndex && i <= overIndex) {
          dir = -1;
        } else if (i > overIndex && i < draggedIndex) {
          dir = 1;
        }
        el.classList.add('moving');
        const offset = dir * dragElement.offsetWidth;
        el.style.transform = `translate3d(${offset}px, 0px, 0px)`;
      }
    }
  }

  /**
   * Removes drop pointer to shadow root.
   * @param {Element} ref A list item to be used as a reference point.
   */
  [createDropPointer](ref) {
    const rect = ref.getClientRects()[0];
    const div = document.createElement('div');
    div.className = 'drop-pointer';
    const ownRect = this.getClientRects()[0];
    let leftPosition = rect.x - ownRect.x;
    leftPosition -= 10; // some padding
    div.style.left = `${leftPosition}px`;
    this[dropPointer] = div;
    this.shadowRoot.appendChild(div);
  }

  [removeDropPointer]() {
    if (!this[dropPointer]) {
      return;
    }
    this.shadowRoot.removeChild(this[dropPointer]);
    this[dropPointer] = undefined; 
  }

  /**
   * Computes index of the drop.
   * @return {Number} Index where to drop the object.
   */
  [computeDropOrder]() {
    const dropRef = this[dropPointerReference];
    let order;
    if (dropRef) {
      order = Number(dropRef.dataset.index);
    } else {
      order = this[tabsValue].length;
    }
    return order;
  }

  /**
   * Action to handle dragover event when not in reorder mode.
   * @param {DragEvent} e
   */
  [newTabDragover](e) {
    const path = e.composedPath();
    const item = /** @type HTMLElement */ (path.find((node) => /** @type HTMLElement */ (node).nodeName === 'WORKSPACE-TAB'));
    if (!item) {
      return;
    }
    const rect = item.getClientRects()[0];
    const aboveHalf = (rect.x + rect.width/2) > e.x;
    const ref = aboveHalf ? item : item.nextElementSibling;
    if (!ref || this[dropPointerReference] === ref) {
      return;
    }
    this[removeDropPointer]();
    this[dropPointerReference] = ref;
    this[createDropPointer](ref);
  }

  /**
   * A handler for the `close` event dispatched by the editor tab. Closes a panel.
   * @param {Event} e
   */
  [tabCloseHandler](e) {
    const node = /** @type WorkspaceTabElement */ (e.currentTarget);
    const index = Number(node.dataset.index);
    if (Number.isNaN(index)) {
      return;
    }
    this.removeRequest(index);
  }

  /**
   * A handler for the `close` event dispatched by the request panel. Closes the panel.
   * @param {Event} e
   */
  [panelCloseHandler](e) {
    const node = /** @type HTMLElement */ (e.target);
    const { tab } = node.dataset;
    const tabs = this[tabsValue];
    const index = tabs.findIndex((item) => item.id === tab);
    this.removeRequest(index);
  }

  /**
   * A handler for the `duplicate` event dispatched by the request panel. 
   * @param {Event} e
   */
  [panelDuplicateHandler](e) {
    const node = /** @type HTMLElement */ (e.target);
    const { tab } = node.dataset;
    const tabs = this[tabsValue];
    const index = tabs.findIndex((item) => item.id === tab);
    this.duplicateTab(index);
  }

  /**
   * It starts a timer to render a dropdown menu with the editor type options.
   * When the user release the button in less than `AddTypeSelectorDelay` ms then
   * the callback is canceled and the HTTP request editor is added, as a default editor.
   * When the callback is called a dropdown is rendered and the user can choose the type of the editor.
   */
  [addButtonMousedownHandler]() {
    if (this[addButtonTimeout]) {
      clearTimeout(this[addButtonTimeout]);
    }
    this[addButtonTimeout] = setTimeout(this[addButtonCallback], AddTypeSelectorDelay);
  }

  /**
   * Checks whether a mouse up timer is set. If so, this is a regular `click` event and it adds the 
   * default HTTP request editor. Otherwise it does nothing.
   * @param {Event} e
   */
  [addButtonMouseupHandler](e) {
    if (!this[addButtonTimeout]) {
      return;
    }
    // meaning this is happening before the type selector was triggered.
    // clears the type selector timeout and adds HTTP request (default behavior).
    clearTimeout(this[addButtonTimeout]);
    this[addButtonTimeout] = undefined;
    this.addHttpRequest();
    /** @type HTMLElement */ (e.currentTarget).blur();
  }

  /**
   * This is called when the user long press the add tab button. 
   * It triggers the view to render the editor type dropdown menu.
   */
  [addButtonCallback]() {
    this[addButtonTimeout] = undefined;
    this[addButtonSelectorOpened] = true;
    this.requestUpdate();
  }

  /**
   * The handler for the dropdown selector for the editor type.
   * Adds a new tab with the selected type of the request.
   * 
   * @param {Event} e
   */
  [addButtonSelectorSelectedHandler](e) {
    const list = /** @type AnypointListbox */ (e.target);
    switch (list.selected) {
      case 0: this.addHttpRequest(); break;
      case 1: this.addWsRequest(); break;
      default:
    }
    list.selected = undefined;
    this[addButtonSelectorOpened] = false;
    this.requestUpdate();
  }

  [addButtonSelectorClosedHandler]() {
    this[addButtonSelectorOpened] = false;
    this.requestUpdate();
  }

  [sessionUrlInputHandler](e) {
    this.webSessionUrl = e.target.value;
    const workspace = this[workspaceValue];
    if (!workspace.webSession) {
      workspace.webSession = {};
    }
    workspace.webSession.webSessionUrl = this.webSessionUrl;
    this.store();
  }

  /**
   * Opens workspace meta details dialog.
   */
  openWorkspaceDetails() {
    this.workspaceDetailsOpened = true;
  }

  /**
   * Opens workspace meta editor dialog. Closes the details when needed.
   */
  openWorkspaceEditor() {
    this.workspaceMetaOpened = true;
    this.workspaceDetailsOpened = false;
  }

  [workspaceMetaCloseHandler]() {
    this.workspaceMetaOpened = false;
  }

  [sheetClosedHandler](e) {
    const prop = e.target.dataset.openProperty;
    this[prop] = e.detail.value;
  }

  /**
   * @param {CustomEvent} e
   */
  [storeWorkspaceMeta](e) {
    this[workspaceValue] = e.detail;
    this.store();
    this.workspaceMetaOpened = false;
  }

  render() {
    return html`
    ${this[tabsTemplate]()}
    ${this[panelsTemplate]()}
    ${this[tabTypeSelector]()}
    ${this[webUrlTemplate]()}
    ${this[workspaceDetailTemplate]()}
    ${this[workspaceMetaTemplate]()}
    `;
  }

  /**
   * @returns {TemplateResult} The template for the tabs list
   */
  [tabsTemplate]() {
    const { selected } = this;
    const items = this[tabsValue];
    return html`
    <workspace-tabs
      class="tabs"
      id="tabs"
      .selected="${selected}"
      @selected="${this[tabsSelectionHandler]}"
      @dragover="${this[tabsDragOverHandler]}"
      @dragleave="${this[tabsDragLeaveHandler]}"
      @drop="${this[tabsDropHandler]}"
    >
      ${items.map((item, index) => this[tabTemplate](item, index))}
      <anypoint-icon-button
        class="add-request-button"
        title="Add a new tab. Long press for options."
        aria-label="Activate to add new request. Long press for options."
        slot="suffix"
        @mousedown="${this[addButtonMousedownHandler]}"
        @mouseup="${this[addButtonMouseupHandler]}"
      >
        <arc-icon icon="add"></arc-icon>
      </anypoint-icon-button>
    </workspace-tabs>`;
  }

  /**
   * @param {WorkspaceTab} item
   * @param {number} index
   * @returns {TemplateResult} The template for the rendered request panel tab.
   */
  [tabTemplate](item, index) {
    // const { selected } = this;
    // const isSelected = selected === index;
    const classes = {
      // selected: isSelected,
      tab: true
    };
    return html`
    <workspace-tab
      data-index="${index}"
      draggable="true"
      class=${classMap(classes)}
      @dragstart="${this[tabDragStartHandler]}"
      @dragend="${this[tabDragEndHandler]}"
      @close="${this[tabCloseHandler]}"
      title="${item.label}"
    >
      <span class="tab-name">${item.label}</span>
      <arc-icon class="close-icon" data-index="${index}" icon="close" @click="${this[closeRequestHandler]}"></arc-icon>
    </workspace-tab>
    <div class="tab-divider"></div>
    `;
  }

  /**
   * @returns {TemplateResult} The template for all rendered panels in the workspace.
   */
  [panelsTemplate]() {
    const { selected } = this;
    const tab = this[tabsValue][selected];
    const requests = this[requestsValue];
    const selectedTabId = tab && tab.id;
    return html`
    <section class="workspace-panels">
    ${requests.map((request, index) => this[panelTemplate](request, index, selectedTabId))}
    </section>
    `;
  }

  /**
   * @param {WorkspaceRequest} request The request to render
   * @param {number} index Request index in the requests array
   * @param {string} selectedTabId The id of the selected tab.
   * @returns {TemplateResult} The template for a request panel
   */
  [panelTemplate](request, index, selectedTabId) {
    if (request.request.kind === 'ARC#WebsocketRequest') {
      const wsRequest = /** @type WorkspaceWebsocketRequest */ (request);
      return this[wsPanelTemplate](wsRequest, index, selectedTabId);
    }
    const httpRequest = /** @type WorkspaceHttpRequest */ (request);
    return this[httpPanelTemplate](httpRequest, index, selectedTabId);
  }

  /**
   * @param {WorkspaceHttpRequest} request The request to render
   * @param {number} index Request index in the requests array
   * @param {string} selectedTabId The id of the selected tab.
   * @returns {TemplateResult} The template for a request panel
   */
  [httpPanelTemplate](request, index, selectedTabId) {
    const visible = request.tab === selectedTabId;
    return html`
    <arc-request-panel
      ?hidden="${!visible}"
      ?anypoint="${this.anypoint}"
      ?renderSend="${this.renderSend}"
      ?progressInfo="${this.progressInfo}"
      ?noSendOnLoading="${this.noSendOnLoading}"
      .editorRequest="${request}"
      .oauth2RedirectUri="${this.oauth2RedirectUri}"
      @change="${this[requestChangeHandler]}"
      @close="${this[panelCloseHandler]}"
      @duplicate="${this[panelDuplicateHandler]}"
      class="stacked request-panel"
      data-index="${index}"
      data-tab="${request.tab}"
      boundEvents
      tabindex="0"
    ></arc-request-panel>
    `;
  }

  /**
   * @param {WorkspaceWebsocketRequest} request The request to render
   * @param {number} index Request index in the requests array
   * @param {string} selectedTabId The id of the selected tab.
   * @returns {TemplateResult} The template for a request panel
   */
  [wsPanelTemplate](request, index, selectedTabId) {
    const visible = request.tab === selectedTabId;
    return html`
    <arc-websocket-panel
      ?hidden="${!visible}"
      ?anypoint="${this.anypoint}"
      .editorRequest="${request}"
      @change="${this[requestChangeHandler]}"
      class="stacked request-panel"
      data-index="${index}"
      data-tab="${request.tab}"
      boundEvents
      tabindex="0"
    ></arc-websocket-panel>
    `;
  }

  /**
   * @returns {TemplateResult} The template for the drop down with add request panel type selector.
   */
  [tabTypeSelector]() {
    const { anypoint } = this;
    return html`
    <anypoint-dropdown 
      noCancelOnOutsideClick
      .positionTarget="${this[addButtonRef]}" 
      ?opened="${this[addButtonSelectorOpened]}"
      @closed="${this[addButtonSelectorClosedHandler]}"
      class="add-panel-type"
    >
      <anypoint-listbox slot="dropdown-content" class="add-panel-list" ?anypoint="${anypoint}" @selected="${this[addButtonSelectorSelectedHandler]}">
        <anypoint-item ?anypoint="${anypoint}">HTTP request</anypoint-item>
        <anypoint-item ?anypoint="${anypoint}">Web socket</anypoint-item>
      </anypoint-listbox>
    </anypoint-dropdown>
    `;
  }

  /**
   * @returns {TemplateResult} The template for the web session URL input.
   */
  [webUrlTemplate]() {
    const { webSessionUrl } = this;
    return html`
    <web-url-input
      id="webUrlInput"
      purpose="web-session"
      .value="${webSessionUrl}"
      @input="${this[sessionUrlInputHandler]}"
    ></web-url-input>
    `;
  }

  /**
   * @returns {TemplateResult} The template for the workspace meta details dialog
   */
  [workspaceDetailTemplate]() {
    const { anypoint, workspaceDetailsOpened } = this;
    const workspace = workspaceDetailsOpened ? this[workspaceValue] : undefined;
    return html`
    <bottom-sheet
      class="bottom-sheet-container"
      .opened="${workspaceDetailsOpened}"
      data-open-property="workspaceDetailsOpened"
      @closed="${this[sheetClosedHandler]}"
    >
      <workspace-details
        ?anypoint="${anypoint}"
        .workspace="${workspace}"
        @edit="${this.openWorkspaceEditor}"
      ></workspace-details>
    </bottom-sheet>`;
  }

  /**
   * @returns {TemplateResult} The template for the workspace meta editor dialog
   */
  [workspaceMetaTemplate]() {
    const { anypoint, workspaceMetaOpened } = this;
    const workspace = workspaceMetaOpened ? this[workspaceValue] : undefined;
    return html`
    <bottom-sheet
      class="bottom-sheet-container"
      .opened="${workspaceMetaOpened}"
      data-open-property="workspaceMetaOpened"
      @closed="${this[sheetClosedHandler]}"
    >
      <workspace-editor
        ?anypoint="${anypoint}"
        .workspace="${workspace}"
        @close="${this[workspaceMetaCloseHandler]}"
        @store="${this[storeWorkspaceMeta]}"
      ></workspace-editor>
    </bottom-sheet>`;
  }
}
