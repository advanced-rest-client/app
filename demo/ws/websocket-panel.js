import { html } from 'lit-html';
import { DemoPage } from '@advanced-rest-client/arc-demo-helper';
import '@advanced-rest-client/arc-demo-helper/arc-interactive-demo.js';
import '@anypoint-web-components/awc/anypoint-button.js';
import '@anypoint-web-components/awc/anypoint-checkbox.js';
import { WebsocketUrlHistoryModel, MockedStore } from  '@advanced-rest-client/idb-store';
import { ExportHandlerMixin } from '@advanced-rest-client/arc-demo-helper/src/ExportHandlerMixin.js';
import encodingHelper from '@advanced-rest-client/arc-demo-helper/src/EncodingHelpers.js';
import { ArcMock } from '@advanced-rest-client/arc-mock';
import { ImportEvents, ArcModelEvents } from '@advanced-rest-client/events';
import { MonacoLoader } from '@advanced-rest-client/monaco-support';
import { BodyProcessor } from '@advanced-rest-client/libs';
import { v4 } from '@advanced-rest-client/uuid';
import '../../define/arc-websocket-panel.js';
import env from './env.js';

/** @typedef {import('@advanced-rest-client/events').WebSocket.WebsocketEditorRequest} WebsocketEditorRequest */
/** @typedef {import('@advanced-rest-client/events').WebSocket.WebsocketConnectionResult} WebsocketConnectionResult */
/** @typedef {import('@advanced-rest-client/events').ArcExportFilesystemEvent} ArcExportFilesystemEvent */
/** @typedef {import('@advanced-rest-client/events').GoogleDriveSaveEvent} GoogleDriveSaveEvent */


const REQUEST_STORE_KEY = 'demo.arc-websocket-ui.editorRequest';
const RESULT_STORE_KEY = 'demo.arc-websocket-ui.connectionResult';

class ComponentDemo extends ExportHandlerMixin(DemoPage) {
  constructor() {
    super();
    this.initObservableProperties([
      'editorRequest', 'withMenu', 'initialized',
    ]);
    this.componentName = 'ARC websocket editor';
    this.withMenu = false;
    this.initialized = false;
    this.renderViewControls = true;

    this.model = new WebsocketUrlHistoryModel();
    this.model.listen(window);
    this.store = new MockedStore();
    
    /** 
     * @type {WebsocketEditorRequest}
     */
    this.editorRequest = {
      id: v4(),
      request: {
        kind: 'ARC#WebsocketRequest',
      },
    };
    /** 
     * @type {WebsocketConnectionResult}
     */
    this.connectionResult = undefined;
    this.generator = new ArcMock();
    
    this.generateData = this.generateData.bind(this);
    this.deleteData = this.deleteData.bind(this);

    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      this.darkThemeActive = true;
    }

    encodingHelper();
    this._requestChangeHandler = this._requestChangeHandler.bind(this);

    this.initEditors();
    this.restoreRequest();
    this.restoreResult();
  }

  async initEditors() {
    await this.loadMonaco();
    this.initialized = true;
  }

  async generateData() {
    await this.store.insertWebsockets();
    ImportEvents.dataImported(document.body);
  }

  async deleteData() {
    await this.store.destroyWebsockets();
    ArcModelEvents.destroyed(document.body, 'all');
  }

  async loadMonaco() {
    const base = `../../node_modules/monaco-editor/`;
    MonacoLoader.createEnvironment(base);
    await MonacoLoader.loadMonaco(base);
    await MonacoLoader.monacoReady();
  }

  restoreRequest() {
    const valueRaw = localStorage.getItem(REQUEST_STORE_KEY);
    if (!valueRaw) {
      return;
    }
    let data = /** @type WebsocketEditorRequest */(null);
    try {
      data = JSON.parse(valueRaw);
    } catch (e) {
      return;
    }
    if (!data) {
      return;
    }
    if (data.request) {
      data.request = BodyProcessor.restoreRequest(data.request);
    }
    console.log('restored request', data);
    this.editorRequest = data;
  }

  restoreResult() {
    const valueRaw = localStorage.getItem(RESULT_STORE_KEY);
    if (!valueRaw) {
      return;
    }
    let data = /** @type WebsocketConnectionResult */(null);
    try {
      data = JSON.parse(valueRaw);
    } catch (e) {
      return;
    }
    if (!data) {
      return;
    }
    if (Array.isArray(data.logs)) {
      data.logs = BodyProcessor.restoreWebsocketLogs(data.logs);
    }
    console.log('restored logs', data);
    this.connectionResult = data;
  }

  _requestChangeHandler() {
    const panel = document.querySelector('arc-websocket-panel');
    const { editorRequest, result } = panel;
    console.log('storing request data', editorRequest, result);
    this.editorRequest = editorRequest;
    this.connectionResult = result;
    this.storeValue(editorRequest);
    this.storeResult(result);
  }

  /**
   * Stores request value data in the local store
   * @param {WebsocketEditorRequest} data
   */
  async storeValue(data) {
    if (!data) {
      window.localStorage.removeItem(REQUEST_STORE_KEY);
      return;
    }
    const safeRequest = await BodyProcessor.stringifyRequest(data.request);
    localStorage.setItem(REQUEST_STORE_KEY, JSON.stringify({
      ...data,
      request: safeRequest,
    }));
  }

  /**
   * Stores request value data in the local store
   * @param {WebsocketConnectionResult} data
   */
  async storeResult(data) {
    if (!data) {
      window.localStorage.removeItem(RESULT_STORE_KEY);
      return;
    }
    const logs = await BodyProcessor.stringifyWebsocketLogs(data.logs);
    localStorage.setItem(RESULT_STORE_KEY, JSON.stringify({
      ...{...data, logs}
    }));
  }

  _demoTemplate() {
    if (!this.initialized) {
      return html`<progress></progress>`;
    }
    const {
      demoStates,
      darkThemeActive,
      anypoint,
      editorRequest,
      connectionResult,
    } = this;

    return html`
      <section class="documentation-section">
        <h3>Interactive demo</h3>
        <p>
          This demo lets you preview the web socket request panel element with various configuration options.
        </p>
        <p>
          Demo web socket server is running: <b>ws://localhost:${env.port}</b>
        </p>
        <arc-interactive-demo
          .states="${demoStates}"
          @state-changed="${this._demoStateHandler}"
          ?dark="${darkThemeActive}"
        >
          <div class="demo-app" slot="content">
            <arc-websocket-panel
              .editorRequest="${editorRequest}"
              .result="${connectionResult}"
              ?anypoint="${anypoint}"
              @change="${this._requestChangeHandler}"
              class="stacked"
            ></arc-websocket-panel>
          </div>

          <label slot="options" id="mainOptionsLabel">Options</label>
          <anypoint-checkbox
            aria-describedby="mainOptionsLabel"
            slot="options"
            name="withMenu"
            @change="${this._toggleMainOption}"
            title="Uses request objects instead of request ids"
          >
            Render menu
          </anypoint-checkbox>
        </arc-interactive-demo>
      </section>
    `;
  }

  _dataControlsTemplate() {
    return html`
    <section class="documentation-section">
      <h3>Data control</h3>
      <p>
        This section allows you to control demo data
      </p>
      <anypoint-button @click="${this.generateData}">Generate data</anypoint-button>
      <anypoint-button @click="${this.deleteData}">Clear list</anypoint-button>
    </section>`;
  }

  contentTemplate() {
    return html`
      ${this._demoTemplate()}
      ${this._dataControlsTemplate()}
      ${this.exportTemplate()}
    `;
  }
}

const instance = new ComponentDemo();
instance.render();
