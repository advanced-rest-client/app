/* eslint-disable no-plusplus */
/* eslint-disable class-methods-use-this */
import { LitElement, html } from 'lit-element';
import { classMap } from 'lit-html/directives/class-map.js';
import { styleMap } from 'lit-html/directives/style-map.js';
import { ifDefined } from 'lit-html/directives/if-defined.js';
import '@anypoint-web-components/awc/anypoint-collapse.js';
import '@anypoint-web-components/awc/anypoint-listbox.js';
import '@anypoint-web-components/awc/anypoint-icon-item.js';
import '@anypoint-web-components/awc/anypoint-item-body.js';
import '@anypoint-web-components/awc/anypoint-tabs.js';
import '@anypoint-web-components/awc/anypoint-tab.js';
import { HeadersParser } from '../../lib/headers/HeadersParser.js';
import * as DataSize from '../../lib/DataSize.js';
import elementStyles from '../styles/HarViewer.js';

/** @typedef {import('har-format').Har} Har */
/** @typedef {import('har-format').Page} Page */
/** @typedef {import('har-format').Entry} Entry */
/** @typedef {import('har-format').Cache} Cache */
/** @typedef {import('har-format').Request} Request */
/** @typedef {import('har-format').Response} Response */
/** @typedef {import('har-format').Header} Header */
/** @typedef {import('har-format').PostData} PostData */
/** @typedef {import('har-format').Content} Content */
/** @typedef {import('har-format').QueryString} QueryString */
/** @typedef {import('har-format').Cookie} Cookie */
/** @typedef {import('har-format').Timings} Timings */
/** @typedef {import('lit-element').TemplateResult} TemplateResult */
/** @typedef {import('@anypoint-web-components/awc').AnypointListboxElement} AnypointListbox */
/** @typedef {import('@anypoint-web-components/awc').AnypointTabsElement} AnypointTabs */
/** @typedef {import('../../types').RenderedPage} RenderedPage */
/** @typedef {import('../../types').RenderedEntry} RenderedEntry */
/** @typedef {import('../../types').RenderedEntryTimings} RenderedEntryTimings */
/** @typedef {import('../../types').SortableEntry} SortableEntry */
/** @typedef {import('../../types').EntrySizing} EntrySizing */

export const harValue = Symbol('harValue');
export const ignorePagesValue = Symbol('ignorePagesValue');
export const processHar = Symbol('processHar');
export const computeEntriesOnly = Symbol('computeEntriesOnly');
export const computePages = Symbol('computePages');
export const pagesValue = Symbol('pagesValue');
export const entriesValue = Symbol('entriesValue');
export const renderPages = Symbol('renderPages');
export const renderEntries = Symbol('renderEntries');
export const pageTemplate = Symbol('pageTemplate');
export const pageHeaderTemplate = Symbol('pageHeaderTemplate');
export const entriesTemplate = Symbol('entriesTemplate');
export const entryTemplate = Symbol('entryTemplate');
export const openedPagesValue = Symbol('openedPagesValue');
export const openedEntriesValue = Symbol('openedEntriesValue');
export const computeRenderedEntries = Symbol('computeRenderedEntries');
export const computeStatusClasses = Symbol('computeStatusClasses');
export const statusLabel = Symbol('statusLabel');
export const loadingTimeTemplate = Symbol('loadingTimeTemplate');
export const responseSizeTemplate = Symbol('responseSizeTemplate');
export const togglePage = Symbol('togglePage');
export const pageClickHandler = Symbol('pageClickHandler');
export const pageKeydownHandler = Symbol('pageKeydownHandler');
export const computeTotalTime = Symbol('computeTotalTime');
export const computeVisualTimes = Symbol('computeVisualTimes');
export const sumTimings = Symbol('sumTimings');
export const timingsTemplate = Symbol('timingsTemplate');
export const timingTemplate = Symbol('timingTemplate');
export const sortEntires = Symbol('sortEntires');
export const entrySelectionHandler = Symbol('entrySelectionHandler');
export const entryDetails = Symbol('entryDetails');
export const entryDetailsTabsTemplate = Symbol('entryDetailsTabsTemplate');
export const selectedTabsValue = Symbol('selectedTabsValue');
export const detailsTabSelectionHandler = Symbol('detailsTabSelectionHandler');
export const entryDetailsContentTemplate = Symbol('entryDetailsContentTemplate');
export const entryDetailsRequestTemplate = Symbol('entryDetailsRequestTemplate');
export const entryDetailsResponseTemplate = Symbol('entryDetailsResponseTemplate');
export const definitionTemplate = Symbol('definitionTemplate');
export const headersTemplate = Symbol('headersTemplate');
export const queryParamsTemplate = Symbol('queryParamsTemplate');
export const computeEntrySizeInfo = Symbol('computeEntrySizeInfo');
export const sizesTemplate = Symbol('sizesTemplate');
export const entryDetailsRequestBodyTemplate = Symbol('entryDetailsRequestBodyTemplate');
export const entryDetailsResponseBodyTemplate = Symbol('entryDetailsResponseBodyTemplate');
export const entryDetailsCookiesTemplate = Symbol('entryDetailsCookiesTemplate');

/** @type {number} used when generating keys for entires */
let nextId = 0;

export default class HarViewerElement extends LitElement {
  static get styles() {
    return elementStyles;
  }

  static get properties() {
    return {
      /** 
       * The HAR object to render.
       */
      har: { type: Object },
      /** 
       * When set it ignores pages matching and renders all requests in a single table.
       */
      ignorePages: { type: Boolean },
    };
  }

  /** 
   * @type {Har}
   */
  get har() {
    return this[harValue];
  }

  /** 
   * @param {Har} value
   */
  set har(value) {
    const old = this[harValue];
    if (old === value) {
      return;
    }
    this[harValue] = value;
    this[processHar]();
  }

  /** 
   * @type {boolean}
   */
   get ignorePages() {
    return this[ignorePagesValue];
  }

  /** 
   * @param {boolean} value
   */
  set ignorePages(value) {
    const old = this[ignorePagesValue];
    if (old === value) {
      return;
    }
    this[ignorePagesValue] = value;
    this[processHar]();
  }

  constructor() {
    super();
    /** 
     * @type {RenderedEntry[]}
     */
    this[entriesValue] = undefined;
    /** 
     * @type {RenderedPage[]}
     */
    this[pagesValue] = undefined;
    /** 
     * @type {string[]}
     */
    this[openedPagesValue] = [];
    /** 
     * @type {string[]}
     */
    this[openedEntriesValue] = [];

    this[selectedTabsValue] = {};
  }

  /**
   * Called when the `har` or `ignorePages` changed.
   */
  [processHar]() {
    this[entriesValue] = undefined;
    this[pagesValue] = undefined;
    const { har, ignorePages } = this;
    if (!har || !har.log) {
      this.requestUpdate();
      return;
    }
    const { log } = har;
    const { pages, entries, } = log;
    if (!entries || !entries.length) {
      this.requestUpdate();
      return;
    }
    const items = this[sortEntires](entries);
    if (ignorePages || !pages || !pages.length) {
      this[computeEntriesOnly](items);
    } else {
      this[computePages](pages, items);
    }
  }

  /**
   * @param {Entry[]} entries
   * @returns {SortableEntry[]} Copy of the entires array with a shallow copy of each entry.
   */
  [sortEntires](entries) {
    const cp = entries.map((entry) => {
      const d = new Date(entry.startedDateTime);
      return /** @type SortableEntry */ ({
        ...entry,
        timestamp: d.getTime(),
      });
    });
    cp.sort((a, b) => a.timestamp - b.timestamp);
    return cp;
  }

  /**
   * Performs computations to render entries only.
   * @param {SortableEntry[]} entries The list of entries to process.
   */
  [computeEntriesOnly](entries) {
    const totalTime = this[computeTotalTime](entries[0], entries[entries.length - 1]);
    this[entriesValue] = this[computeRenderedEntries](entries, totalTime);
    this[openedEntriesValue] = /** @type string[] */ ([]);
    this.requestUpdate();
  }

  /**
   * Performs computations to render entries by page.
   * @param {Page[]} pages The list of pages to process.
   * @param {SortableEntry[]} entries The list of entries to process.
   */
  [computePages](pages, entries) {
    const result = /** @type RenderedPage[] */ ([]);
    const opened = /** @type string[] */ ([]);
    pages.forEach((page) => {
      opened.push(page.id);
      const items = entries.filter((entry) => entry.pageref === page.id);
      const totalTime = this[computeTotalTime](items[0], items[items.length - 1])
      const item = /** @type RenderedPage */ ({
        page,
        entries: this[computeRenderedEntries](items, totalTime),
        totalTime,
      });
      
      result.push(item);
    });
    this[pagesValue] = result;
    this[openedPagesValue] = opened;
    this[openedEntriesValue] = /** @type string[] */ ([]);
    this.requestUpdate();
  }

  /**
   * @param {SortableEntry[]} entries The entries to perform computations on.
   * @param {number} totalTime The total time of all entries rendered in the group
   * @returns {RenderedEntry[]}
   */
  [computeRenderedEntries](entries, totalTime) {
    const result = /** @type RenderedEntry[] */ ([]);
    if (!Array.isArray(entries) || !entries.length) {
      return result;
    }
    // This expects entires to be sorted by time (as required by the spec).
    const [startEntry] = entries;
    const startTime = startEntry.timestamp;
    entries.forEach((entry) => {
      const d = new Date(entry.timestamp);
      const visualTimings = this[computeVisualTimes](entry.timings, entry.timestamp - startTime, totalTime);
      const numType = /** @type {"numeric" | "2-digit"} */ ('numeric');
      const options = /** @type Intl.DateTimeFormatOptions */ ({
        hour: numType,
        minute: numType,
        second: numType,
        fractionalSecondDigits: 3,
      });
      const format = new Intl.DateTimeFormat(undefined, options);
      const requestTime = format.format(d);
      const format2 = new Intl.DateTimeFormat(undefined , {
        // @ts-ignore
        timeStyle: 'medium',
        dateStyle: 'medium',
      });
      const requestFormattedDate = format2.format(d);
      const requestSizes = this[computeEntrySizeInfo](entry.request);
      const responseSizes = this[computeEntrySizeInfo](entry.response);
      const item = /** @type RenderedEntry */ ({
        id: nextId++,
        requestTime,
        visualTimings,
        requestFormattedDate,
        requestSizes,
        responseSizes,
        ...entry,
      });
      result.push(item);
    });
    return result;
  }

  /**
   * @param {Request|Response} info
   * @returns {EntrySizing}
   */
  [computeEntrySizeInfo](info) {
    const result = /** @type EntrySizing */ ({
      headersComputed: false,
      bodyComputed: false,
    });

    let { headersSize=0, bodySize=0 } = info;
    const { headers } = info;
    if (headersSize < 1) {
      const hdrStr = HeadersParser.toString(headers);
      headersSize = DataSize.calculateBytes(hdrStr);
      result.headersComputed = true;
    }
    if (bodySize < 1) {
      const typedRequest = /** @type Request */ (info);
      const typedResponse = /** @type Response */ (info);
      if (typedResponse.content) {
        if (typedResponse.content.size) {
          bodySize = typedResponse.content.size;
        } else if (typedResponse.content.text) {
          bodySize = DataSize.calculateBytes(typedResponse.content.text);
          result.bodyComputed = true;
        }
      } else if (typedRequest.postData && typedRequest.postData.text) {
        bodySize = DataSize.calculateBytes(typedRequest.postData.text);
        result.bodyComputed = true;
      }
    }
    if (bodySize < 0) {
      bodySize = 0;
    }
    result.body = DataSize.bytesToSize(bodySize);
    result.headers = DataSize.bytesToSize(headersSize);
    result.sum = DataSize.bytesToSize(headersSize + bodySize);
    result.sumComputed = result.bodyComputed || result.headersComputed;
    return result;
  }

  /**
   * @param {number} code The status code to test for classes.
   * @returns {object} List of classes to be set on the status code
   */
  [computeStatusClasses](code) {
    const classes = {
      'status-code': true,
      error: code >= 500 || code === 0,
      warning: code >= 400 && code < 500,
      info: code >= 300 && code < 400,
    };
    return classes;
  }

  /**
   * Computes the total time of page requests.
   * @param {Entry} first The earliest entry in the range
   * @param {Entry} last The latest entry in the range
   * @returns {number} The total time of the page. Used to build the timeline.
   */
  [computeTotalTime](first, last) {
    if (first === last) {
      return this[sumTimings](last.timings);
    }
    const startTime = new Date(first.startedDateTime).getTime();
    const endTime = new Date(last.startedDateTime).getTime();
    const lastDuration = this[sumTimings](last.timings);
    return endTime - startTime + lastDuration;
  }

  /**
   * @param {Timings} timings The entry's timings object.
   * @param {number} delay The timestamp when the first request started.
   * @param {number} total The number of milliseconds all entries took.
   * @returns {RenderedEntryTimings|undefined}
   */
  [computeVisualTimes](timings, delay, total) {
    if (!timings) {
      return undefined;
    }
    const timingsSum = this[sumTimings](timings);
    const totalPercent = timingsSum / total * 100;
    const result = /** @type RenderedEntryTimings */ ({
      total: totalPercent,
      totalValue: timingsSum,
    });
    if (delay) {
      result.delay = delay / total * 100;
    }
    if (typeof timings.blocked === 'number' && timings.blocked > 0) {
      result.blocked = timings.blocked / timingsSum * 100;
    }
    if (typeof timings.connect === 'number' && timings.connect > 0) {
      result.connect = timings.connect / timingsSum * 100;
    }
    if (typeof timings.dns === 'number' && timings.dns > 0) {
      result.dns = timings.dns / timingsSum * 100;
    }
    if (typeof timings.receive === 'number' && timings.receive > 0) {
      result.receive = timings.receive / timingsSum * 100;
    }
    if (typeof timings.send === 'number' && timings.send > 0) {
      result.send = timings.send / timingsSum * 100;
    }
    if (typeof timings.ssl === 'number' && timings.ssl > 0) {
      result.ssl = timings.ssl / timingsSum * 100;
    }
    if (typeof timings.wait === 'number' && timings.wait > 0) {
      result.wait = timings.wait / timingsSum * 100;
    }
    return result;
  }

  /**
   * Sums all timing values.
   * @param {Timings} timings The timings object to compute
   * @returns {number} The total time, excluding -1s
   */
  [sumTimings](timings) {
    let result = 0;
    if (!timings) {
      return result;
    }
    if (typeof timings.blocked === 'number' && timings.blocked > 0) {
      result += timings.blocked;
    }
    if (typeof timings.connect === 'number' && timings.connect > 0) {
      result += timings.connect;
    }
    if (typeof timings.dns === 'number' && timings.dns > 0) {
      result += timings.dns;
    }
    if (typeof timings.receive === 'number' && timings.receive > 0) {
      result += timings.receive;
    }
    if (typeof timings.send === 'number' && timings.send > 0) {
      result += timings.send;
    }
    if (typeof timings.ssl === 'number' && timings.ssl > 0) {
      result += timings.ssl;
    }
    if (typeof timings.wait === 'number' && timings.wait > 0) {
      result += timings.wait;
    }
    return result;
  }

  /**
   * A handler for the page label click to toggle the page entries.
   * @param {Event} e
   */
  [pageClickHandler](e) {
    const node = /** @type HTMLElement */ (e.currentTarget);
    const id = node.dataset.page;
    this[togglePage](id);
  }

  /**
   * A handler for the page label keydown to toggle the page entries on space key.
   * @param {KeyboardEvent} e
   */
  [pageKeydownHandler](e) {
    if (e.code !== 'Space') {
      return;
    }
    const node = /** @type HTMLElement */ (e.target);
    const id = node.dataset.page;
    this[togglePage](id);
  }

  /**
   * Toggles the visibility of the page entries.
   * @param {string} id The id of the page.
   */
  [togglePage](id) {
    const allOpened = this[openedPagesValue];
    const index = allOpened.indexOf(id);
    if (index === -1) {
      allOpened.push(id);
    } else {
      allOpened.splice(index, 1);
    }
    this.requestUpdate();
  }

  /**
   * Handler for the list item selection event.
   * @param {Event} e
   */
  [entrySelectionHandler](e) {
    const list = /** @type AnypointListbox */ (e.target);
    const items = /** @type HTMLElement[] */ (list.selectedItems);
    const ids = items.map((item) => item.dataset.entry);
    this[openedEntriesValue] = ids;
    this.requestUpdate();
  }

  /**
   * Handler for the list item selection event.
   * @param {Event} e
   */
  [detailsTabSelectionHandler](e) {
    e.stopPropagation();
    const tabs = /** @type AnypointTabs */ (e.target);
    const { selected } = tabs;
    const id = Number(tabs.dataset.entry);
    this[selectedTabsValue][id] = selected;
    this.requestUpdate();
  }

  render() {
    const pages = this[pagesValue];
    if (Array.isArray(pages) && pages.length) {
      return this[renderPages](pages);
    }
    const entries = this[entriesValue];
    if (Array.isArray(entries) && entries.length) {
      return this[renderEntries](entries);
    }
    return html``;
  }

  /**
   * @param {RenderedPage[]} pages
   * @returns {TemplateResult} Template for the pages table
   */
  [renderPages](pages) {
    return html`
    <div class="pages">
    ${pages.map((info) => this[pageTemplate](info))}
    </div>
    `;
  }

  /**
   * @param {RenderedEntry[]} entries
   * @returns {TemplateResult} Template for the entries table
   */
  [renderEntries](entries) {
    return html`
    <section class="entries-list">
    ${this[entriesTemplate](entries)}
    </section>
    `;
  }

  /**
   * @param {RenderedPage} info
   * @returns {TemplateResult} Template for a single page
   */
  [pageTemplate](info) {
    const allOpened = this[openedPagesValue];
    const opened = allOpened.includes(info.page.id);
    return html`
    <section class="page">
      ${this[pageHeaderTemplate](info.page, info.totalTime)}
      <anypoint-collapse .opened="${opened}">
        <div class="page-entries">
          ${this[entriesTemplate](info.entries)}
        </div>
      </anypoint-collapse>
    </section>
    `;
  }

  /**
   * @param {Page} page
   * @param {number} totalTime
   * @returns {TemplateResult} Template for the pages table
   */
  [pageHeaderTemplate](page, totalTime) {
    return html`
    <div class="page-header" @click="${this[pageClickHandler]}" @keydown="${this[pageKeydownHandler]}" tabindex="0" data-page="${page.id}">
      <span class="label">${page.title || 'Unknown page'}</span>
      ${this[loadingTimeTemplate](totalTime)}
    </div>
    `;
  }

  /**
   * @param {RenderedEntry[]} entries
   * @returns {TemplateResult} The template for the entries list
   */
  [entriesTemplate](entries) {
    return html`
    <anypoint-listbox 
      @selected="${this[entrySelectionHandler]}" 
      multi 
      selectable="anypoint-icon-item"
      aria-label="Select a list item to see details"
    >
      ${entries.map((item) => this[entryTemplate](item))}
    </anypoint-listbox>
    `;
  }

  /**
   * @param {RenderedEntry} entry
   * @returns {TemplateResult} The template for a single entry
   */
  [entryTemplate](entry) {
    const { request, response, timings, visualTimings, id, responseSizes } = entry;
    const allSelected = this[openedEntriesValue];
    const selected = allSelected.includes(`${id}`);
    return html`
    <anypoint-icon-item class="entry-item" data-entry="${id}">
      <div class="time" slot="item-icon">
        ${entry.requestTime}
      </div>
      <anypoint-item-body twoline class="entry-body">
        <div class="entry-detail-line">
          ${this[statusLabel](response.status, response.statusText)}
          ${this[loadingTimeTemplate](entry.time)}
          ${this[responseSizeTemplate](responseSizes)}
        </div>
        <div class="entry-location" title="${request.url}">${request.method} ${request.url}</div>
      </anypoint-item-body>
      <div class="entry-timings">
        ${this[timingsTemplate](timings, visualTimings, selected)}</div>
      </div>
    </anypoint-icon-item>
    ${selected ? this[entryDetails](entry) : ''}
    `;
  }

  /**
   * @param {number} status The response status code
   * @param {string} statusText The response reason part of the status.
   * @returns {TemplateResult} The template for the status message
   */
  [statusLabel](status, statusText='') {
    const codeClasses = this[computeStatusClasses](status);
    return html`
    <span class="${classMap(codeClasses)}">${status}</span>
    <span class="message">${statusText}</span>
    `;
  }

  /**
   * @param {number} value The response loading time
   * @returns {TemplateResult|string} Template for the loading time message
   */
  [loadingTimeTemplate](value) {
    if (Number.isNaN(value)) {
      return '';
    }
    const roundedValue = Math.round(value || 0);
    return html`<span class="loading-time-label">Time: ${roundedValue} ms</span>`;
  }

  /**
   * @param {EntrySizing} sizing
   * @returns {TemplateResult|string} Template for the response size
   */
  [responseSizeTemplate](sizing) {
    return html`<span class="response-size-label">Size: ${sizing.sum}</span>`;
  }

  /**
   * @param {Timings} timings The entry's timings
   * @param {RenderedEntryTimings} visualTimings The computed visual timings for the template
   * @param {boolean} [fullWidth=false] When set then it renders the timeline in the whole available space.
   * @returns {TemplateResult|string} The template for the timings timeline
   */
  [timingsTemplate](timings, visualTimings, fullWidth=false) {
    if (!visualTimings) {
      return '';
    }
    const { total, delay, blocked, connect, dns, receive, send, ssl, wait, } = visualTimings;
    const styles = {
      width: fullWidth ? '100%' : `${total}%`,
    };
    return html`
    ${fullWidth ? '' : this[timingTemplate](delay, 'delay')}
    <div class="entry-timings-value" style="${styleMap(styles)}">
      ${this[timingTemplate](blocked, 'blocked', 'Blocked', timings)}
      ${this[timingTemplate](dns, 'dns', 'DNS', timings)}
      ${this[timingTemplate](connect, 'connect', 'Connecting', timings)}
      ${this[timingTemplate](ssl, 'ssl', 'SSL negotiation', timings)}
      ${this[timingTemplate](send, 'send', 'Sending', timings)}
      ${this[timingTemplate](wait, 'wait', 'Waiting', timings)}
      ${this[timingTemplate](receive, 'receive', 'Receiving', timings)}
    </div>
    `;
  }

  /**
   * @param {number} width
   * @param {string} type Added to the class name.
   * @param {string=} label The label to use in the title attribute
   * @param {Timings=} timings The entry's timings object
   * @returns {TemplateResult|string} The template for a timing timeline item
   */
  [timingTemplate](width, type, label, timings) {
    if (!width) {
      return '';
    }
    const styles = {
      width: `${width}%`,
    };
    const classes = {
      'timing-entry': true,
      [type]: true,
    };
    const time = timings && timings[type];
    const title = typeof time === 'number' ? `${label}: ${Math.round(time)}ms` : undefined;
    return html`
    <div class="${classMap(classes)}" style="${styleMap(styles)}" title="${ifDefined(title)}"></div>
    `;
  }

  /**
   * @param {RenderedEntry} entry The entry to render
   * @returns {TemplateResult} The template for an entry details.
   */
  [entryDetails](entry) {
    const { id } = entry;
    const selectedTab = this[selectedTabsValue][id] || 0;
    return html`
    <section class="entry-details">
      ${this[entryDetailsTabsTemplate](entry, selectedTab)}
      <div class="details-content" tabindex="0">
      ${this[entryDetailsContentTemplate](entry, selectedTab)}
      </div>
    </section>
    `;
  }

  /**
   * @param {RenderedEntry} entry The entry to render
   * @param {number} selected The index of the selected tab
   * @returns {TemplateResult} The template for entry details content tabs.
   */
  [entryDetailsTabsTemplate](entry, selected) {
    const { id, request, response } = entry;
    const { postData, cookies: requestCookies } = request;
    const { content, cookies: responseCookies } = response;
    const hashRequestContent = !!postData && !!postData.text;
    const hashResponseContent = !!content && !!content.text;
    const hasRequestCookies = Array.isArray(requestCookies) && !!requestCookies.length;
    const hasResponseCookies = Array.isArray(responseCookies) && !!responseCookies.length;
    const hasCookies = hasRequestCookies || hasResponseCookies;
    return html`
    <anypoint-tabs .selected="${selected}" @selected="${this[detailsTabSelectionHandler]}" data-entry="${id}">
      <anypoint-tab>Request</anypoint-tab>
      <anypoint-tab>Response</anypoint-tab>
      <anypoint-tab ?hidden="${!hashRequestContent}">Request content</anypoint-tab>
      <anypoint-tab ?hidden="${!hashResponseContent}">Response content</anypoint-tab>
      <anypoint-tab ?hidden="${!hasCookies}">Cookies</anypoint-tab>
    </anypoint-tabs>
    `;
  }

  /**
   * @param {RenderedEntry} entry The entry to render
   * @param {number} selected The index of the selected tab
   * @returns {TemplateResult|string} The template for entry details content.
   */
  [entryDetailsContentTemplate](entry, selected) {
    switch (selected) {
      case 0: return this[entryDetailsRequestTemplate](entry);
      case 1: return this[entryDetailsResponseTemplate](entry);
      case 2: return this[entryDetailsRequestBodyTemplate](entry);
      case 3: return this[entryDetailsResponseBodyTemplate](entry);
      case 4: return this[entryDetailsCookiesTemplate](entry);
      default: return '';
    }
  }

  /**
   * @param {RenderedEntry} entry The entry to render
   * @returns {TemplateResult} The template for entry's request content.
   */
  [entryDetailsRequestTemplate](entry) {
    const { request, requestFormattedDate, serverIPAddress, requestSizes } = entry;
    const { headers, url, method, httpVersion, queryString } = request;
    return html`
    <div class="entry-details-title">Request on ${requestFormattedDate}</div>
    <dl class="details-list">
      <dt>General</dt>
      <dd>
        ${this[definitionTemplate]('URL', url)}
        ${this[definitionTemplate]('HTTP version', httpVersion)}
        ${this[definitionTemplate]('Operation', method)}
        ${this[definitionTemplate]('Remote Address', serverIPAddress)}
      </dd>
      ${this[headersTemplate](headers)}
      ${this[queryParamsTemplate](queryString)}
      ${this[sizesTemplate](requestSizes)}
    </dl>
    `;
  }

  /**
   * @param {RenderedEntry} entry The entry to render
   * @returns {TemplateResult} The template for entry's response content.
   */
  [entryDetailsResponseTemplate](entry) {
    const { response, responseSizes } = entry;
    const { headers } = response;
    return html`
    <dl class="details-list">
      ${this[headersTemplate](headers)}
      ${this[sizesTemplate](responseSizes)}
    </dl>
    `;
  }

  /**
   * @param {RenderedEntry} entry The entry to render
   * @returns {TemplateResult} The template for entry's request body preview.
   */
  [entryDetailsRequestBodyTemplate](entry) {
    const { request } = entry;
    const { postData } = request;
    if (!postData || !postData.text) {
      return html`<p>No request body data.</p>`;
    }
    return html`
    <pre><code class="body-preview">${postData.text}</code></pre>
    `;
  }

  /**
   * @param {RenderedEntry} entry The entry to render
   * @returns {TemplateResult} The template for entry's response body preview.
   */
  [entryDetailsResponseBodyTemplate](entry) {
    const { response } = entry;
    const { content } = response;
    if (!content || !content.text) {
      return html`<p>No request body data.</p>`;
    }
    return html`
    <pre><code class="body-preview">${content.text}</code></pre>
    `;
  }

  /**
   * @param {RenderedEntry} entry The entry to render
   * @returns {TemplateResult} The template for entry's cookies.
   */
  [entryDetailsCookiesTemplate](entry) {
    const { request, response } = entry;
    const { cookies: requestCookies } = request;
    const { cookies: responseCookies } = response;
    const hasRequestCookies = Array.isArray(requestCookies) && !!requestCookies.length;
    const hasResponseCookies = Array.isArray(responseCookies) && !!responseCookies.length;

    return html`
    <dl class="details-list">
      <dt>Request cookies</dt>
      <dd>
        ${hasRequestCookies ? requestCookies.map((item) => this[definitionTemplate](item.name, item.value)) : 
          html`No cookies recorded.`}
      </dd>

      <dt>Response cookies</dt>
      <dd>
        ${hasResponseCookies ? responseCookies.map((item) => this[definitionTemplate](item.name, item.value)) : 
          html`No cookies recorded.`}
      </dd>
    </dl>
    `;
  }

  /**
   * @param {string} term Definition label
   * @param {string} value Definition value
   * @returns {TemplateResult|string} The template for the definition.
   */
  [definitionTemplate](term, value) {
    if (!value) {
      return '';
    }
    return html`
    <p class="definition">
      <dfn>${term}:</dfn> ${value}
    </p>
    `;
  }

  /**
   * @param {Header[]} headers
   * @returns {TemplateResult|string} The template for the list of headers.
   */
  [headersTemplate](headers) {
    return html`
    <dt>Headers</dt>
    <dd>
      ${Array.isArray(headers) && headers.length ? 
        headers.map((item) => this[definitionTemplate](item.name, item.value)) : 
        html`No headers recorded.`}
    </dd>
    `;
  }

  /**
   * @param {QueryString[]} params
   * @returns {TemplateResult|string} The template for the query parameters.
   */
  [queryParamsTemplate](params) {
    if (!Array.isArray(params) || !params.length) {
      return '';
    }
    return html`
    <dt>Query parameters</dt>
    <dd>
      ${params.map((item) => this[definitionTemplate](item.name, item.value))}
    </dd>
    `;
  }

  /**
   * @param {EntrySizing} sizes
   * @returns {TemplateResult} The template for sizes information
   */
  [sizesTemplate](sizes) {
    return html`
    <dt>Size</dt>
    <dd>
      ${this[definitionTemplate]('Headers', sizes.headers)}
      ${this[definitionTemplate]('Body', sizes.body)}
      ${this[definitionTemplate]('Total', sizes.sum)}
    </dd>`;
  }
}
