import { html } from 'lit-html';
import { DemoPage } from '@advanced-rest-client/arc-demo-helper';
import '@advanced-rest-client/arc-demo-helper/arc-interactive-demo.js';
import '@anypoint-web-components/awc/anypoint-switch.js';
import { DataExportEventTypes, UiEventTypes } from '@advanced-rest-client/events';
import { ArcMock } from '@advanced-rest-client/arc-mock';
import { HeadersParser } from '../../src/lib/headers/HeadersParser.js';
import '../../define/response-view.js';

/** @typedef {import('@advanced-rest-client/events').ArcResponse.Response} Response */
/** @typedef {import('@advanced-rest-client/events').ArcResponse.ErrorResponse} ErrorResponse */
/** @typedef {import('@advanced-rest-client/events').ArcRequest.ArcBaseRequest} ArcBaseRequest */
/** @typedef {import('@advanced-rest-client/events').ArcRequest.TransportRequest} TransportRequest */
/** @typedef {import('@advanced-rest-client/events').ArcResponse.ResponseRedirect} ResponseRedirect */
/** @typedef {import('@advanced-rest-client/events').ArcExportFilesystemEvent} ArcExportFilesystemEvent */

const selectedPanelKey = 'demo.responseView.selectedPanel';
const activePanelsKey = 'demo.responseView.activePanels';

class ComponentPage extends DemoPage {
  constructor() {
    super();
    this.initObservableProperties(['request', 'forceRawSize', 'warningResponseMaxSize']);
    this.componentName = 'response-view';
    this.demoStates = ['Regular'];
    this.renderViewControls = true;
    /** 
     * @type {ArcBaseRequest}
     */
    this.request = undefined;
    this.panels = undefined;
    this.selected = undefined;
    this.forceRawSize = 4096;
    this.warningResponseMaxSize = 2048;
    this.generator = new ArcMock();

    this.restoreLocal();

    this.urlKeyHandler = this.urlKeyHandler.bind(this);
    this.selectedPanelHandler = this.selectedPanelHandler.bind(this);
    this.activePanelsHandler = this.activePanelsHandler.bind(this);
    this.generateRequest = this.generateRequest.bind(this);
    this.panelClear = this.panelClear.bind(this);

    this.url = '';
    // this.url = window.location.href;
    // this.url = 'https://xd.adobe.com/view/46b6a75a-0dfd-44ff-87c1-e1b843d03911-13e5/';
    // this.url = 'https://httpbin.org/brotli';
    // this.url = 'json.json';
    window.addEventListener(DataExportEventTypes.fileSave, this.fileSaveHandler.bind(this));
    window.addEventListener(UiEventTypes.contextMenu, this.contextMenuHandler.bind(this));
    this.limitHandler = this.limitHandler.bind(this);
  }

  /** 
   * @param {ArcExportFilesystemEvent} e
   */
  fileSaveHandler(e) {
    const { data, providerOptions  } = e;
    const a = document.createElement('a');
    const blob = new Blob([data], { type: providerOptions.contentType });
    const url = URL.createObjectURL(blob);
    a.href = url;
    a.download = providerOptions.file;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);  
    }, 0); 
  }

  contextMenuHandler(e) {
    console.log(e.detail);
  }

  /**
   * @param {KeyboardEvent} e
   */
  urlKeyHandler(e) {
    if (!['Enter', 'NumpadEnter'].includes(e.code)) {
      return;
    }
    const {value} = /** @type HTMLInputElement */ (e.target);
    this.makeRequest(value);
  }

  /**
   * @param {string} url
   */
  async makeRequest(url) {
    this.request = undefined;
    const startTime = Date.now();
    const request = /** @type ArcBaseRequest */ ({
      url,
      method: 'GET',
    });
    const transportRequest = /** @type TransportRequest */ ({
      ...request,
      startTime,
      endTime: 0,
      httpMessage: 'Not available',
    });
    request.transportRequest = transportRequest;
    try {
      const response = await fetch(url, {
        redirect: "manual",
      });
      const end = Date.now();
      const result = /** @type Response */ ({
        startTime,
        loadingTime: end - startTime,
        status: response.status,
        statusText: response.statusText,
        headers: HeadersParser.toString(response.headers),
        payload: undefined,
      });
      const body = await response.arrayBuffer();
      result.size = {
        request: 10,
        response: body.byteLength,
      };
      result.payload = body;
      request.response = result;
      this.request = request;
    } catch (e) {
      const end = Date.now();
      const result = /** @type ErrorResponse */({
        error: e,
        status: 0,
        startTime,
        loadingTime: end - startTime,
        headers: '',
        payload: undefined,
      });
      request.response = result;
    }
    this.request = request;
  }

  selectedPanelHandler(e) {
    const { selected } = e.target;
    this.selected = selected;
    localStorage.setItem(selectedPanelKey, selected);
  }

  activePanelsHandler(e) {
    const { active } = e.target;
    this.panels = active;
    localStorage.setItem(activePanelsKey, JSON.stringify(active));
  }

  restoreLocal() {
    const activeValue = localStorage.getItem(activePanelsKey);
    if (activeValue) {
      try {
        this.panels = JSON.parse(activeValue);
      } catch (e) {
        // ..
      }
    }
    this.selected = localStorage.getItem(selectedPanelKey) || undefined;
  }

  generateRequest() {
    const r = this.generator.http.history();
    const tr = /** @type TransportRequest */ ({
      url: r.url,
      method: r.method,
      startTime: Date.now() - 1000,
      endTime: Date.now(),
      httpMessage: 'Not available',
      headers: this.generator.http.headers.headers('request'),
    });
    const response = this.generator.http.response.arcResponse({ timings: true, ssl: true, redirects: true });
    r.transportRequest = tr;
    r.response = response;
    this.request = r;
  }

  panelClear() {
    console.log('clearing');
    this.request = undefined;
    this.render();
  }

  /**
   * @param {Event} e 
   */
  limitHandler(e) {
    const input = /** @type HTMLInputElement */ (e.target);
    const { name, value } = input;
    this[name] = Number(value);
  }

  _demoTemplate() {
    const {
      request,
      panels,
      selected,
      forceRawSize,
      warningResponseMaxSize,
    } = this;
    const response = request && request.response;
    return html`
    <section class="documentation-section">
      <h3>Interactive demo</h3>
      <response-view
        slot="content"
        .request="${request}"
        .response="${response}"
        .selected="${selected}"
        .active="${panels}"
        .forceRawSize="${forceRawSize}"
        .warningResponseMaxSize="${warningResponseMaxSize}"
        @selectedchange="${this.selectedPanelHandler}"
        @activechange="${this.activePanelsHandler}"
        @clear="${this.panelClear}"
        class="scrolling-region"
      ></response-view>
    </section>
    `;
  }

  demoRequest() {
    return html`
    <section class="documentation-section">
      <h3>Demo request</h3>
      <input 
        type="url" 
        .value="${this.url}" 
        @keydown="${this.urlKeyHandler}" 
        class="url-input"
        list="inputOptions"
        aria-label="Enter the URL value"
      />
      <datalist id="inputOptions">
        <option value="json.json"></option>
        <option value="jsonnp.json"></option>
        <option value="api.zip"></option>
        <option value="issue-181.json"></option>
        <option value="https://xd.adobe.com/view/46b6a75a-0dfd-44ff-87c1-e1b843d03911-13e5/"></option>
        <option value="${window.location.href}"></option>
        <option value="https://httpbin.org/brotli"></option>
        <option value="https://httpbin.org/bytes/1000"></option>
        <option value="https://httpbin.org/image/svg"></option>
        <option value="https://httpbin.org/status/404"></option>
      </datalist>
    </section>
    `;
  }

  generatorOptionsTemplate() {
    return html`
    <section class="documentation-section">
      <h3>Generate request</h3>
      <anypoint-button @click="${this.generateRequest}">Generate</anypoint-button>
    </section>
    `;
  }

  limitsTemplate() {
    return html`
    <section class="documentation-section">
      <h3>Response limits</h3>
      <div class="input-row">
        <label for="forceRawSize">Raw view only size limit</label>
        <input id="forceRawSize" name="forceRawSize" type="number" .value="${String(this.forceRawSize)}" @change="${this.limitHandler}"/>
      </div>
      <div class="input-row">
        <label for="warningResponseMaxSize">Size warning limit</label>
        <input id="warningResponseMaxSize" name="warningResponseMaxSize" type="number" .value="${String(this.warningResponseMaxSize)}" @change="${this.limitHandler}"/>
      </div>
    </section>
    `;
  }

  contentTemplate() {
    return html`
      <h2>ARC response view</h2>
      ${this._demoTemplate()}
      ${this.demoRequest()}
      ${this.generatorOptionsTemplate()}
      ${this.limitsTemplate()}
    `;
  }
}

const instance = new ComponentPage();
instance.render();
