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
import '../../define/arc-websocket-editor.js';
import env from './env.js';

/** @typedef {import('@advanced-rest-client/events').WebSocket.WebsocketEditorRequest} WebsocketEditorRequest */
/** @typedef {import('@advanced-rest-client/events').ArcExportFilesystemEvent} ArcExportFilesystemEvent */
/** @typedef {import('@advanced-rest-client/events').GoogleDriveSaveEvent} GoogleDriveSaveEvent */


const REQUEST_STORE_KEY = 'demo.arc-websocket-ui.editorRequest';

class ComponentDemo extends ExportHandlerMixin(DemoPage) {
  constructor() {
    super();
    this.initObservableProperties([
      'editorRequest', 'withMenu', 'initialized',
    ]);
    this.componentName = 'ARC websocket editor';
    this.anypoint = false;
    this.withMenu = false;
    this.initialized = false;

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
    this.generator = new ArcMock();
    
    this.generateData = this.generateData.bind(this);
    this.deleteData = this.deleteData.bind(this);
    
    this.initEditors();
    this.restoreRequest();

    this.renderViewControls = true;

    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      this.darkThemeActive = true;
    }

    encodingHelper();
    this._requestChangeHandler = this._requestChangeHandler.bind(this);
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
    let data;
    try {
      data = JSON.parse(valueRaw);
    } catch (e) {
      return;
    }
    if (data.request) {
      data.request = BodyProcessor.restoreRequest(data.request);
    }
    console.log('restored', data);
    this.editorRequest = data;
  }

  _requestChangeHandler() {
    const editor = document.querySelector('arc-websocket-editor');
    const object = editor.serialize();
    console.log('storing request data', object);
    this.storeValue(object);    
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

  _demoTemplate() {
    if (!this.initialized) {
      return html`<progress></progress>`;
    }
    const {
      demoStates,
      darkThemeActive,
      anypoint,
      editorRequest,
    } = this;
    const { request } = editorRequest;
    const { url, payload, ui } = request;

    return html`
      <section class="documentation-section">
        <h3>Interactive demo</h3>
        <p>
          This demo lets you preview the web socket request editor element with various configuration options.
        </p>
        <p>
          Demo web socket server is running: <b>ws://localhost:${env.port}</b>
        </p>

        <arc-interactive-demo
          .states="${demoStates}"
          @state-changed="${this._demoStateHandler}"
          ?dark="${darkThemeActive}"
          noOptions
        >
          <arc-websocket-editor
            slot="content"
            .url="${url}"
            .payload="${payload}"
            .uiConfig="${ui}"
            ?anypoint="${anypoint}"
            @change="${this._requestChangeHandler}"
          ></arc-websocket-editor>
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
