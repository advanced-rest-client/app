/* eslint-disable lit-a11y/click-events-have-key-events */
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
import { LitElement, html } from 'lit-element';
import { classMap } from 'lit-html/directives/class-map.js';
import '@advanced-rest-client/icons/arc-icon.js';
import '@anypoint-web-components/awc/anypoint-menu-button.js';
import '@anypoint-web-components/awc/anypoint-listbox.js';
import '@anypoint-web-components/awc/anypoint-item.js';
import '@anypoint-web-components/awc/anypoint-icon-item.js';
import '@anypoint-web-components/awc/anypoint-icon-button.js';
import '@anypoint-web-components/awc/anypoint-button.js';
import { ExportEvents, WorkspaceEvents } from '@advanced-rest-client/events';
import { HarTransformer } from '../../lib/har/HarTransformer.js';
import elementStyles from '../styles/ResponseView.styles.js';
import { bytesToSize, readContentType, readBodyString } from './Utils.js';
import { MimeTypes } from '../../lib/MimeTypes.js';
import '../../../define/headers-list.js';
import '../../../define/request-timings-panel.js';
import '../../../define/response-body.js';
import '../../../define/response-error.js';
import {
  emptyResponseScreenTemplate,
  responseTabsTemplate,
  openedTabs,
  selectedTab,
  tabItem,
  tabMenu,
  tabSelectHandler,
  tabClickHandler,
  tabCloseHandler,
  clearResponseTemplate,
  clearResponseHandler,
  tabContentTemplate,
  tabTemplate,
  responseTemplate,
  responseMetaTemplate,
  responsePrefixTemplate,
  detailsTemplate,
  unknownTemplate,
  timingsTemplate,
  statusLabel,
  computeStatusClasses,
  loadingTimeTemplate,
  responseSizeTemplate,
  responseOptionsTemplate,
  responseOptionsItemsTemplate,
  responseBodyTemplate,
  errorResponse,
  requestHeadersTemplate,
  responseHeadersTemplate,
  redirectsTemplate,
  urlStatusTemplate,
  redirectItemTemplate,
  computeRedirectLocation,
  contentActionHandler,
  saveResponseFile,
  saveResponseHar,
  copyResponseClipboard,
  redirectLinkHandler,
  tabsKeyDownHandler,
  responseValue,
  responseChanged,
  responseSizeValue,
  computeResponseSize,
  computeResponseLimits,
  sizeWarningLimitTriggered,
  sizeRawLimitTriggered,
  sizeWarningTemplate,
  clearSizeWarning,
  rawTemplate,
  typesValue,
  computeEffectiveTypes,
  effectiveTypesValue,
} from './internals.js';

/** @typedef {import('lit-element').TemplateResult} TemplateResult */
/** @typedef {import('@anypoint-web-components/awc').AnypointListboxElement} AnypointListbox */
/** @typedef {import('@anypoint-web-components/awc').AnypointMenuButtonElement} AnypointMenuButton */
/** @typedef {import('@advanced-rest-client/events').ArcRequest.ArcBaseRequest} ArcBaseRequest */
/** @typedef {import('@advanced-rest-client/events').ArcResponse.Response} Response */
/** @typedef {import('@advanced-rest-client/events').ArcResponse.ErrorResponse} ErrorResponse */
/** @typedef {import('@advanced-rest-client/events').ArcResponse.RequestsSize} RequestsSize */
/** @typedef {import('@advanced-rest-client/events').ArcRequest.TransportRequest} TransportRequest */
/** @typedef {import('@advanced-rest-client/events').ArcResponse.ResponseRedirect} ResponseRedirect */
/** @typedef {import('@advanced-rest-client/events/src/request/ArcResponse').TransformedPayload} TransformedPayload */
/** @typedef {import('./ResponseViewElement').ResponsePanel} ResponsePanel */

/** 
 * @type {ResponsePanel[]}
 */
export const availableTabs = [
  {
    id: 'response',
    label: 'Response',
  },
  {
    id: 'timings',
    label: 'Timings',
  },
  {
    id: 'headers',
    label: 'Headers',
  },
  {
    id: 'redirects',
    label: 'Redirects',
  },
  {
    id: 'raw',
    label: 'Raw',
  },
];

/**
 * @fires activechange When a list of active panels change
 * @fires selectedchange When a list of active panels change
 */
export default class ResponseViewElement extends LitElement {
  get styles() {
    return elementStyles;
  }

  static get properties() {
    return {
      /** 
       * ARC HTTP request object
       */
      request: { type: Object },
      /** 
       * The received response object for the current request.
       * Event though the `response` is part of the `request` it needs to be set separately
       * to properly process the values in the request panel.
       */
      response: { type: Object },
      /** 
       * A list of active panels (in order) rendered in the tabs.
       */
      active: { type: Array },
      /** 
       * The currently selected panel
       * @attribute
       */
      selected: { type: String },
      /**
       * Enables Anypoint theme
       */
      anypoint: { type: Boolean },
      /**
       * The size of a response that triggers "raw" view by default.
       */
      forceRawSize: { type: Number },
      /**
       * The size of a response, in KB, that triggers warning message instead of showing the response.
       */
      warningResponseMaxSize: { type: Number },
      /** 
       * The list of coma separated names of the editors to enable.
       * This must be the list of `id` values from the available editors.
       * Possible values: `response,timings,headers,redirects,raw`
       */
      types: { type: String, reflect: true },
    };
  }

  /**
   * @returns {boolean} Tests whether the response is set
   */
  get hasResponse() {
    const { request, response } = this;
    if (!request) {
      return false;
    }
    return !!response;
  }

  /**
   * @returns {string[]} A list of currently active panels
   */
  get active() {
    return this[openedTabs];
  }

  /**
   * @param {string[]} value The list of active panels.
   */
  set active(value) {
    const old = this[openedTabs];
    if (old === value || !Array.isArray(value) && value !== null && value !== undefined) {
      return;
    }
    const tabs = this.effectivePanels;
    this[openedTabs] = (value || []).filter((item) => tabs.some((tab) => tab.id === item));
    this.requestUpdate();
  }

  /**
   * @returns {string} The currently selected panel
   */
  get selected() {
    return this[selectedTab];
  }

  /**
   * @param {string} value The panel id to select.
   */
  set selected(value) {
    const old = this[selectedTab];
    if (old === value) {
      return;
    }
    const valid = this.effectivePanels.some((tab) => tab.id === value);
    if (!valid) {
      return;
    }
    this[selectedTab] = value;
  }

  /**
   * @returns {Response | ErrorResponse}
   */
  get response() {
    return this[responseValue];
  }

  /**
   * @param {Response | ErrorResponse} value
   */
  set response(value) {
    const old = this[responseValue];
    if (old === value) {
      return;
    }
    this[responseValue] = value;
    this[responseChanged](value);
  }

  get types() {
    return this[typesValue];
  }

  set types(value) {
    const old = this[typesValue];
    if (old === value) {
      return;
    }
    this[typesValue] = value;
    this[effectiveTypesValue] = this[computeEffectiveTypes](value);
    this.requestUpdate('types', old);
  }

  /**
   * @returns {ResponsePanel[]} The final list of panels to render.
   */
  get effectivePanels() {
    return this[effectiveTypesValue] || availableTabs;
  }

  constructor() {
    super();
    /**
     * The id of the currently rendered tab
     * @type {string}
     */
    this[selectedTab] = 'response';
    /**
     * A list of tabs that are opened by the user (rendered in the DOM)
     * @type {string[]}
     */
    this[openedTabs] = ['response'];

    this.anypoint = false;
    /**
     * @type {number}
     */
    this.forceRawSize = undefined;
    /**
     * @type {number}
     */
    this.warningResponseMaxSize = undefined;

    // /** 
    //  * The ARC's base request object with the response data.
    //  * @type {ArcBaseRequest}
    //  */
    // this.request = undefined;
    /**  
     * @type {Response | ErrorResponse}
     */
    this[responseValue] = undefined;
  }

  /**
   * A handler for the tab selection. It activates a tab, if necessary.
   * @param {CustomEvent} e
   */
  async [tabSelectHandler](e) {
    const listbox = /** @type AnypointListbox */ (e.target);
    const id = e.detail.selected;
    if (!this[openedTabs].includes(String(id))) {
      this[openedTabs].push(String(id));
      this.dispatchEvent(new CustomEvent('activechange'));
    }
    if (id !== this[selectedTab]) {
      this[selectedTab] = id;
      this.dispatchEvent(new CustomEvent('selectedchange'));
    }
    await this.requestUpdate();
    listbox.selected = undefined;
  }

  /**
   * Called when the request object change. Sets up variables needed to render the view.
   * @param {Response | ErrorResponse | undefined} response
   */
  [responseChanged](response) {
    this[responseSizeValue] = 0;
    this[computeResponseLimits](0);
    if (!response) {
      this.requestUpdate();
      return;
    }
    const typedError = /** @type ErrorResponse */ (response)
    if (!typedError.error) {
      const typedResponse = /** @type Response */ (response)
      this[responseSizeValue] = this[computeResponseSize](typedResponse);
      this[computeResponseLimits](this[responseSizeValue]);
    }
    this.requestUpdate();
  }

  /**
   * A handler for the content action drop down item selection
   * @param {CustomEvent} e
   */
  async [contentActionHandler](e) {
    // const listbox = /** @type AnypointListbox */ (e.target);
    const id = e.detail.selected;
    switch (id) {
      case 'save': return this[saveResponseFile]();
      case 'copy': return this[copyResponseClipboard]();
      case 'har': return this[saveResponseHar]();
      default: return undefined;
    }
  }

  /**
   * A handler for the tab name click. Selects a tab.
   * @param {Event} e
   */
  [tabClickHandler](e) {
    const node = /** @type HTMLDivElement */ (e.currentTarget);
    const { id } = node.dataset;
    if (id !== this[selectedTab]) {
      this[selectedTab] = id;
      this.dispatchEvent(new CustomEvent('selectedchange'));
      this.requestUpdate();
    }
  }

  /**
   * A handler for the tab close icon click. Closes a tab and selects the first in the queue available.
   * @param {Event} e
   */
  [tabCloseHandler](e) {
    e.preventDefault();
    e.stopPropagation();
    const node = /** @type HTMLDivElement */ (e.currentTarget);
    const { id } = node.dataset;
    const index = this[openedTabs].indexOf(id);
    this[openedTabs].splice(index, 1);
    this.dispatchEvent(new CustomEvent('activechange'));
    if (id !== this[selectedTab]) {
      // other than the current is selected
      this.requestUpdate();
      return;
    }
    let newIndex;
    if (index === 0) {
      // select next
      newIndex = 0;
    } else {
      // select previous
      newIndex = index - 1;
    }
    let item = this[openedTabs][newIndex];
    if (!item) {
      [item] = this[openedTabs];
    }
    if (!item) {
      this[selectedTab] = '';
    } else {
      this[selectedTab] = item;
    }
    this.dispatchEvent(new CustomEvent('selectedchange'));
    this.requestUpdate();
  }

  /**
   * Adds a11y support for the tabs to move between the tabs on right - left arrow
   * @param {KeyboardEvent} e
   */
  [tabsKeyDownHandler](e) {
    const tabs = /** @type string[] */ (this[openedTabs]);
    if (tabs.length < 2) {
      return;
    }
    const current = /** @type string */ (this[selectedTab]);
    if (e.code === 'ArrowLeft') {
      const index = tabs.indexOf(current);
      let prev = index - 1;
      if (prev < 0) {
        prev = tabs.length - 1;
      }
      this[selectedTab] = tabs[prev];
      this.requestUpdate();
      this.dispatchEvent(new CustomEvent('selectedchange'));
    } else if (e.code === 'ArrowRight') {
      const index = tabs.indexOf(current);
      let next = index + 1;
      if (next >= tabs.length) {
        next = 0;
      }
      this[selectedTab] = tabs[next];
      this.requestUpdate();
      this.dispatchEvent(new CustomEvent('selectedchange'));
    }
  }

  [clearResponseHandler]() {
    this.request = undefined;
    this.dispatchEvent(new CustomEvent('clear'));
  }

  /**
   * @param {number} code The status code to test for classes.
   * @returns {object} List of classes to be set on the status code
   */
  [computeStatusClasses](code) {
    const classes = {
      code: true,
      error: code >= 500 || code === 0,
      warning: code >= 400 && code < 500,
      info: code >= 300 && code < 400,
    };
    return classes;
  }

  /**
   * Extracts the location URL form the headers.
   *
   * @param {string} headers A HTTP headers string.
   * @return {string} A value of the location header or `unknown` if not found.
   */
  [computeRedirectLocation](headers) {
    const def = 'unknown';
    if (!headers || typeof headers !== 'string') {
      return def;
    }
    const match = headers.match(/^location: (.*)$/im);
    if (!match) {
      return def;
    }
    const link = match[1];
    const value = link.match(/<(.+?)>/);
    if (value) {
      return value[1];
    }
    return '';
  }

  /**
   * Dispatches file save event with the payload.
   */
  async [saveResponseFile]() {
    const { headers, payload } = this[responseValue];
    if (!payload) {
      return;
    }
    let [contentType] = readContentType(headers);
    if (!contentType) {
      contentType = 'text/plain';
    }
    let ext = MimeTypes[contentType];
    if (!ext) {
      ext = '.txt';
    }
    const file = `response-body${ext}`;
    ExportEvents.fileSave(this, payload, {
      contentType,
      file,
    });
  }

  /**
   * Writes the current body to the clipboard
   */
  async [copyResponseClipboard]() {
    const { payload } = this[responseValue];
    const body = readBodyString(payload);
    await navigator.clipboard.writeText(body);
  }

  /**
   * Transforms the request and the response to a HAR 1.2 format and saves as file.
   */
  async [saveResponseHar]() {
    const { request } = this;
    const transformer = new HarTransformer();
    const result = await transformer.transform([request]);
    const data = JSON.stringify(result);
    const file = `response-body.har`;
    ExportEvents.fileSave(this, data, {
      contentType: 'application/json',
      file,
    });
  }

  /**
   * A handler for the click event in the response panel
   * @param {CustomEvent} e
   */
  [redirectLinkHandler](e) {
    const node = /** @type HTMLAnchorElement */ (e.target);
    if (node.nodeName !== 'A') {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    const url = node.href;
    WorkspaceEvents.appendRequest(this, {
      url,
      method: 'GET',
    });
  }

  /**
   * 
   * @param {Response} response 
   * @returns {number|undefined}
   */
  [computeResponseSize](response) {
    if (!response) {
      return undefined;
    }
    const { size } = response;
    if (!size || Number.isNaN(size.response)) {
      return undefined;
    }
    return size.response;
  }

  /**
   * Computes variables responsible for rendering response size warnings.
   * @param {number} size The response size
   */
  [computeResponseLimits](size) {
    this[sizeRawLimitTriggered] = false;
    this[sizeWarningLimitTriggered] = false;
    if (!size || typeof size !== 'number') {
      return;
    }
    const { forceRawSize, warningResponseMaxSize } = this;
    if (typeof forceRawSize === 'number' && forceRawSize) {
      const limit = forceRawSize * 1024;
      this[sizeRawLimitTriggered] = size >= limit;
    }
    if (typeof warningResponseMaxSize === 'number' && warningResponseMaxSize) {
      const limit = warningResponseMaxSize * 1024;
      this[sizeWarningLimitTriggered] = size >= limit;
    }
  }

  [clearSizeWarning]() {
    this[sizeWarningLimitTriggered] = false;
    this.requestUpdate();
  }

  /**
   * Handles the change to the `enabledEditors` property and, when set, computes a list of
   * editors to enable in the view. The resulted list of a sublist of the `editorTypes` list.
   * @param {string=} list
   * @returns {ResponsePanel[]|undefined}
   */
  [computeEffectiveTypes](list) {
    if (!list || typeof list !== 'string') {
      return undefined;
    }
    const parts = list.split(',').map((item) => item.trim());
    const result = availableTabs.filter((item) => parts.includes(item.id));
    return result;
  }

  render() {
    return html`
    <style>${this.styles}</style>
    ${this[responseTabsTemplate]()}
    ${this[tabContentTemplate]()}
    `;
  }

  [responseTabsTemplate]() {
    const selected = /** @type string */ (this[selectedTab]);
    const currentList = /** @type string[] */ (this[openedTabs]);
    const toRender = [];
    const tabs = this.effectivePanels;
    currentList.forEach((id) => {
      const model = tabs.find((item) => item.id === id);
      if (model) {
        toRender.push(model);
      }
    });
    return html`
    <div class="tabs" role="tablist" id="tabs" @keydown="${this[tabsKeyDownHandler]}" tabindex="0">
      ${this[tabMenu]()}
      ${toRender.map((info) => this[tabItem](info, info.id === selected))}
      ${this[clearResponseTemplate]()}
    </div>
    `;
  }

  /**
   * Renders a tab element
   * @param {ResponsePanel} info
   * @param {boolean} selected
   * @returns {TemplateResult} A template for a tab item
   */
  [tabItem](info, selected) {
    const classes = {
      tab: true,
      selected,
    };
    const { label, id } = info;
    return html`
    <div class=${classMap(classes)} data-id="${id}" @click="${this[tabClickHandler]}" role="tab" aria-selected="${selected ? 'true' : 'false'}" aria-controls="panel-${id}" id="panel-tab-${id}">
      <span class="tab-label">${label}</span>
      <arc-icon icon="close" class="tab-close" data-id="${id}" @click="${this[tabCloseHandler]}" role="button" aria-label="Activate to close this tab"></arc-icon>
    </div>
    `;
  }

  /**
   * Renders a tab dropdown menu element
   * @returns {TemplateResult} A template for the tabs context menu with available tabs
   */
  [tabMenu]() {
    return html`
    <anypoint-menu-button
      closeOnActivate
      @activate="${this[tabSelectHandler]}"
      class="tabs-menu"
      ?anypoint="${this.anypoint}"
    >
      <anypoint-icon-button slot="dropdown-trigger" aria-label="Activate to open tabs menu" ?anypoint="${this.anypoint}">
        <arc-icon icon="moreVert"></arc-icon>
      </anypoint-icon-button>
      <anypoint-listbox slot="dropdown-content" attrForSelected="data-id" ?anypoint="${this.anypoint}">
      ${this.effectivePanels.map((item) => html`<anypoint-item data-id="${item.id}" ?anypoint="${this.anypoint}">${item.label}</anypoint-item>`)}
      </anypoint-listbox>
    </anypoint-menu-button>
    `;
  }

  /**
   * @returns {TemplateResult} A template for the empty response screen.
   */
  [emptyResponseScreenTemplate]() {
    return html`
    <div class="empty-screen">
      <b>No response recorded</b><br/>
      <p>Send a request to see the response.</p>
    </div>
    `;
  }

  [clearResponseTemplate]() {
    return html`
    <anypoint-button
      ?disabled="${!this.hasResponse}"
      @click="${this[clearResponseHandler]}"
      class="clear-button"
      title="Clear the response"
      ?anypoint="${this.anypoint}"
    >Clear</anypoint-button>
    `;
  }

  [tabContentTemplate]() {
    if (this[openedTabs].length === 0) {
      return html`<div class="empty-background"></div>`;
    }
    if (!this.hasResponse) {
      return this[emptyResponseScreenTemplate]();
    }
    const selected = this[selectedTab];
    return html`
    ${this[openedTabs].map((id) => this[tabTemplate](id, selected === id))}
    `;
  }

  /**
   * Renders a tab by given id.
   * @param {string} id The id of the tab to render
   * @param {boolean} selected Whether it's a current selected tab
   */
  [tabTemplate](id, selected) {
    switch (id) {
      case 'response': return this[responseTemplate](id, selected);
      case 'timings': return this[timingsTemplate](id, selected);
      case 'headers': return this[detailsTemplate](id, selected);
      case 'redirects': return this[redirectsTemplate](id, selected);
      case 'raw': return this[rawTemplate](id, selected);
      default: return this[unknownTemplate](selected);
    }
  }

  /**
   * @param {string} id The id of the panel
   * @param {boolean} opened Whether the panel is currently rendered in the view
   * @returns {TemplateResult|string} A template for the response visualization
   */
  [responseTemplate](id, opened) {
    const info = /** @type Response */ (this[responseValue]);
    if (!info) {
      return '';
    }
    const { payload, headers } = info;
    const typedError = /** @type ErrorResponse */ (this[responseValue]);
    const isError = !!typedError.error;
    return html`
    <div class="panel" ?hidden="${!opened}" aria-hidden="${!opened ? 'true' : 'false'}" id="panel-${id}" aria-labelledby="panel-tab-${id}" role="tabpanel">
      ${this[responseMetaTemplate]()}
      ${this[responsePrefixTemplate]()}
      ${isError && !payload ? this[errorResponse](typedError.error) : this[responseBodyTemplate](payload, headers, opened)}
    </div>`;
  }

  /**
   * @returns {TemplateResult|string} A template for the response meta data row
   */
  [responseMetaTemplate]() {
    const info = /** @type Response */ (this[responseValue]);
    if (!info) {
      return '';
    }
    const { status, statusText, loadingTime } = info;
    return html`
    <div class="response-meta">
      ${this[statusLabel](status, statusText)}
      ${this[loadingTimeTemplate](loadingTime)}
      ${this[responseSizeTemplate]()}
      ${this[responseOptionsTemplate]()}
    </div>
    `;
  }

  /**
   * @returns {TemplateResult|string} A template for child classes to insert content between the response meta row and the response view.
   */
  [responsePrefixTemplate]() {
    return '';
  }

  /**
   * @param {string} id The id of the panel
   * @param {boolean} opened Whether the panel is currently rendered in the view
   * @returns {TemplateResult|string} A template for the headers panel.
   */
  [detailsTemplate](id, opened) {
    return html`
    <div class="panel" ?hidden="${!opened}" aria-hidden="${!opened ? 'true' : 'false'}" id="panel-${id}" aria-labelledby="panel-tab-${id}" role="tabpanel">
      ${this[urlStatusTemplate]()}
      ${this[responseHeadersTemplate]()}
      ${this[requestHeadersTemplate]()}
    </div>`;
  }

  /**
   * @returns {TemplateResult|string} A template for the request headers, if any.
   */
  [requestHeadersTemplate]() {
    const info = this.request.transportRequest;
    if (!info) {
      return '';
    }
    const { httpMessage, headers } = info;
    const headersOpened = !!headers;
    return html`
    <details ?open="${headersOpened}">
      <summary>Request headers</summary>
      ${headers ? html`<headers-list class="summary-content" .headers="${headers}"></headers-list>` : html`<p class="summary-content">There are no recorded request headers</p>`}
    </details>
    ${httpMessage ? html`
    <details>
      <summary>Sent message</summary>
      <pre class="summary-content"><code>${httpMessage}</code></pre>
    </details>` : ''}
    `;
  }

  /**
   * @returns {TemplateResult|string} A template for the url info in the headers panel
   */
  [urlStatusTemplate]() {
    const info = this.request.transportRequest;
    if (!info) {
      return '';
    }
    const { method, url, } = info;
    return html`
    <div class="status-url">
      <span class="http-method">${method}</span><span class="request-url">${url}</span>
    </div>
    `;
  }

  /**
   * @returns {TemplateResult|string} A template for the response headers, if any.
   */
  [responseHeadersTemplate]() {
    const info = /** @type Response */ (this[responseValue]);
    if (!info) {
      return '';
    }
    const { headers } = info;
    const opened = !!headers;
    return html`
    <details ?open="${opened}">
      <summary>Response headers</summary>
      ${headers ? html`<headers-list class="summary-content" .headers="${headers}"></headers-list>` : html`<p class="summary-content">There are no recorded response headers</p>`}
    </details>
    `;
  }

  /**
   * @param {string} id The id of the panel
   * @param {boolean} opened Whether the panel is currently rendered in the view
   * @returns {TemplateResult|string} A detailed information about redirects
   */
  [redirectsTemplate](id, opened) {
    const info = /** @type Response */ (this[responseValue]);
    if (!info) {
      return '';
    }
    const { redirects } = info;
    const hasRedirects = Array.isArray(redirects) && !!redirects.length;
    return html`
    <div class="panel" ?hidden="${!opened}" aria-hidden="${!opened ? 'true' : 'false'}" id="panel-${id}" aria-labelledby="panel-tab-${id}" role="tabpanel">
      ${hasRedirects ? 
        redirects.map((item, i) => this[redirectItemTemplate](item, i)) : 
        html`
        <div class="empty-info">
          <p>This request has no redirect information</p>
        </div>
        `
      }
    </div>`;
  }

  /**
   * @param {string} id The id of the panel
   * @param {boolean} opened Whether the panel is currently rendered in the view
   * @returns {TemplateResult|string} A detailed information about redirects
   */
  [rawTemplate](id, opened) {
    const info = /** @type Response */ (this[responseValue]);
    if (!info) {
      return '';
    }
    const { payload, headers } = info;
    return html`
    <div class="panel" ?hidden="${!opened}" aria-hidden="${!opened ? 'true' : 'false'}" id="panel-${id}" aria-labelledby="panel-tab-${id}" role="tabpanel">
      ${this[responseMetaTemplate]()}
      ${this[responsePrefixTemplate]()}
      <response-body .body="${payload}" .headers="${headers}" .active="${opened}" rawOnly></response-body>
    </div>`;
  }

  /**
   * @param {string} id The id of the panel
   * @param {boolean} opened Whether the template is currently rendered
   * @returns {TemplateResult|string} A template for the request timings.
   */
  [timingsTemplate](id, opened) {
    const info = /** @type Response */ (this[responseValue]);
    if (!info) {
      return '';
    }
    const { redirects, timings } = info;
    if (!timings) {
      return html`
        <div class="panel" aria-hidden="${!opened ? 'true' : 'false'}" ?hidden="${!opened}" id="panel-${id}" aria-labelledby="panel-tab-${id}" role="tabpanel">
          <div class="empty-info">
            <p>This request has no timing information</p>
          </div>
        </div>
      `;
    }
    let startTime
    const requestInfo = this.request.transportRequest;
    if (requestInfo) {
      startTime = requestInfo.startTime;
    }
    return html`
    <div class="panel" ?hidden="${!opened}" aria-hidden="${!opened ? 'true' : 'false'}" id="panel-${id}" aria-labelledby="panel-tab-${id}" role="tabpanel">
      <request-timings-panel .redirects="${redirects}" .startTime="${startTime}" .timings="${timings}"></request-timings-panel>
    </div>`;
  }

  /**
   * @param {boolean} opened Whether the template is currently rendered
   * @returns {TemplateResult} A template for the "unknown" state message
   */
  [unknownTemplate](opened) {
    return html`<div class="panel" ?hidden="${!opened}">unknown</div>`;
  }

  /**
   * @param {number} status The response status code
   * @param {string} statusText The response reason part of the status.
   * @returns {TemplateResult} Template for the status message
   */
  [statusLabel](status, statusText='') {
    const codeClasses = this[computeStatusClasses](status);
    return html`
    <div class="status-line">
      <span class="${classMap(codeClasses)}">${status}</span>
      <span class="message">${statusText}</span>
    </div>`;
  }

  /**
   * @param {number} value The response loading time
   * @returns {TemplateResult|string} Template for the loading time message
   */
  [loadingTimeTemplate](value) {
    if (Number.isNaN(value)) {
      return '';
    }

    let time = value || 0
    if (!Number.isInteger(time)) {
      const [, decimal] = time.toString().split('.');
      const maxDecimalLength = Math.min(decimal.length, 5);
      time = parseFloat(time.toFixed(maxDecimalLength));
    }

    return html`<span class="loading-time-label">Time: ${time} ms</span>`;
  }

  /**
   * @returns {TemplateResult|string} Template for the response size
   */
  [responseSizeTemplate]() {
    const size = this[responseSizeValue];
    if (size === undefined) {
      return '';
    }
    return html`<span class="response-size-label">Size: ${bytesToSize(size)}</span>`;
  }

  /**
   * @returns {TemplateResult} A template for the response options drop down
   */
  [responseOptionsTemplate]() {
    return html`
    <anypoint-menu-button
      closeOnActivate
      @activate="${this[contentActionHandler]}"
      class="request-menu"
      ?anypoint="${this.anypoint}"
      horizontalAlign="right"
    >
      <anypoint-icon-button slot="dropdown-trigger" aria-label="Activate to see content options" ?anypoint="${this.anypoint}">
        <arc-icon icon="moreVert"></arc-icon>
      </anypoint-icon-button>
      <anypoint-listbox slot="dropdown-content" attrForSelected="data-id" ?anypoint="${this.anypoint}">
        ${this[responseOptionsItemsTemplate]()}
      </anypoint-listbox>
    </anypoint-menu-button>`;
  }

  /**
   * @returns {TemplateResult} A template for the response options items
   */
  [responseOptionsItemsTemplate]() {
    return html`
    <anypoint-icon-item data-id="save" ?anypoint="${this.anypoint}">
      <arc-icon icon="archive" slot="item-icon"></arc-icon> Save to file
    </anypoint-icon-item>
    <anypoint-icon-item data-id="copy" ?anypoint="${this.anypoint}">
      <arc-icon icon="contentCopy" slot="item-icon"></arc-icon> Copy to clipboard
    </anypoint-icon-item>
    <anypoint-icon-item data-id="har" ?anypoint="${this.anypoint}">
      Save as HAR 1.2
    </anypoint-icon-item>
    `;
  }

  /**
   * @param {string|Buffer|ArrayBuffer|TransformedPayload} payload The response payload
   * @param {string} headers The response headers
   * @param {boolean} opened True when the panel is currently rendered
   * @returns {TemplateResult} Template for the response preview
   */
  [responseBodyTemplate](payload, headers='', opened) {
    if (!payload) {
      return html`<p>The response contains no body.</p>`;
    }
    const rawTriggered = this[sizeRawLimitTriggered];
    const sizeTriggered = this[sizeWarningLimitTriggered];
    return html`
    <div class="response-wrapper">
    ${sizeTriggered ? 
        this[sizeWarningTemplate]() : 
        html`<response-body .body="${payload}" .headers="${headers}" .active="${opened}" .rawOnly="${rawTriggered}"></response-body>`
    }  
    </div>
    `;
  }

  [sizeWarningTemplate]() {
    const { warningResponseMaxSize } = this;
    return html`
    <div class="size-warning">
      <p>The request size exceeded <b>${bytesToSize(warningResponseMaxSize*1024)}</b> and its rendering may slow down the application or crash the process.</p>
      <anypoint-button @click="${this[clearSizeWarning]}" title="Show the response anyway">Show response</anypoint-button>
      <p class="info-message"><arc-icon icon="infoOutline"></arc-icon> You can change the limit in application settings.</p>
    </div>
    `;
  }

  /**
   * @param {Error} error
   * @returns {TemplateResult} Template for the error response
   */
  [errorResponse](error) {
    const { message } = error;
    return html`
    <div class="response-wrapper">
      <response-error .message="${message || 'unknown error'}" ?anypoint="${this.anypoint}"></response-error>
    </div>
    `;
  }

  /**
   * @param {ResponseRedirect} item
   * @param {number} index
   * @returns {TemplateResult} A template for a single redirection item
   */
  [redirectItemTemplate](item, index) {
    const { response } = item;
    const { status, statusText, headers, payload } = response;
    const codeClasses = this[computeStatusClasses](status);
    const loc = /** @type string */ (this[computeRedirectLocation](headers));
    const mime = payload ? readContentType(headers) : undefined;
    const body = payload ? readBodyString(payload) : undefined;
    return html`
    <div class="status-row">
      <div class="status-label text">#<span>${index + 1}</span></div>
      <div class="redirect-value" @click="${this[redirectLinkHandler]}">
        <div class="redirect-code">
          <span class="${classMap(codeClasses)}">${status} ${statusText}</span>
        </div>
        <div class="redirect-location">
          <a href="${loc}" class="auto-link">${loc}</a>
        </div>
        ${headers ? html`<headers-list .headers="${headers}"></headers-list>` : html`<p class="summary-content">There are no recorded response headers</p>`}
        ${body ? html`<response-highlight .code="${body}" .lang="${mime[0]}"></response-highlight>` : ''}
      </div>
    </div>
    `;
  }
}
