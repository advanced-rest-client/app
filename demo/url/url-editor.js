import { html } from 'lit-html';
import { DemoPage } from '@advanced-rest-client/arc-demo-helper';
import '@advanced-rest-client/arc-demo-helper/arc-interactive-demo.js';
import { UrlHistoryModel, MockedStore } from '@advanced-rest-client/idb-store';
import { ArcMock } from '@advanced-rest-client/arc-mock';
import { ImportEvents, ArcModelEvents, RequestEventTypes } from '@advanced-rest-client/events';
import '../../define/url-input-editor.js';

/** @typedef {import('../../').UrlInputEditorElement} UrlInputEditorElement */

/* eslint-disable max-len */
class ComponentPage extends DemoPage {
  constructor() {
    super();
    this.initObservableProperties([
      'compatibility',
      'outlined',
      'value'
    ]);
    this._componentName = 'url-input-editor';
    this.demoStates = ['Material', 'Outlined', 'Anypoint'];
    this.renderViewControls = true;
    this.generator = new ArcMock();

    this.value = `${window.location.href}?token=eyJhbGRiOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiIxMTMXNDgzOTM3NzUyNjE2NTgwMDIiLCJzY29wZXMiOlsiYWxsIl0sImlhdCI6MTU0NzYwOTc4OSwiZXhwIjoxNTQ3Njk2MTg5LCJpc3MiOiJ1cm46YXJjLWNUIn0.iLHFXNtfJx-wDDMGFDN6ooM9IZQoD72ZcswbFV0x0Pk`;
    // this.value = window.location.href;
    // this.value = 'http://';

    this._valueHandler = this._valueHandler.bind(this);
    this.generateData = this.generateData.bind(this);
    this.deleteData = this.deleteData.bind(this);

    window.addEventListener(RequestEventTypes.send, this._sendHandler.bind(this));

    this.model = new UrlHistoryModel();
    this.model.listen(window);

    this.store = new MockedStore();
  }

  async generateData() {
    await this.store.insertUrlHistory(100);
    ImportEvents.dataImported(document.body);
  }

  async deleteData() {
    await this.store.destroyUrlHistory();
    ArcModelEvents.destroyed(document.body, 'all');
  }

  _demoStateHandler(e) {
    const state = e.detail.value;
    this.outlined = state === 1;
    this.anypoint = state === 2;
    this._updateAnypoint();
  }

  /**
   * @param {Event} e 
   */
  _valueHandler(e) {
    const editor = /** @type UrlInputEditorElement */ (e.target)
    const { value } = editor;
    console.log(value);
    this.value = value;
  }

  /**
   * @param {Event} e 
   */
  async _sendHandler(e) {
    const editor = /** @type UrlInputEditorElement */ (e.target)
    const { value } = editor;
    console.log('Storing URL in the history', value);
    await ArcModelEvents.UrlHistory.insert(document.body, value);
  }

  _demoTemplate() {
    const {
      demoStates,
      darkThemeActive,
      compatibility,
      outlined,
      value
    } = this;
    return html`
      <section class="documentation-section">
        <h3>Interactive demo</h3>
        <p>
          This demo lets you preview the URL editor element with various
          configuration options.
        </p>

        <arc-interactive-demo
          .states="${demoStates}"
          @state-changed="${this._demoStateHandler}"
          ?dark="${darkThemeActive}"
        >
          <url-input-editor
            ?compatibility="${compatibility}"
            ?outlined="${outlined}"
            .value="${value}"
            @change="${this._valueHandler}"
            slot="content"
          ></url-input-editor>
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
      <url-history-model></url-history-model>
      <h2>ARC URL editor screen</h2>
      ${this._demoTemplate()}
      ${this._dataControlsTemplate()}
    `;
  }
}

const instance = new ComponentPage();
instance.render();
