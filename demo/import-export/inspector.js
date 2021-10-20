import { html } from 'lit-html';
import { DemoPage } from '@advanced-rest-client/arc-demo-helper';
import { ArcMock } from '@advanced-rest-client/arc-mock';
import { ImportNormalize } from '@advanced-rest-client/idb-store';
import '../../define/import-data-inspector.js';

/** @typedef {import('@advanced-rest-client/events').DataExport.ArcExportObject} ArcExportObject */
/** @typedef {import('@advanced-rest-client/events').DataExport.ExportArcCookie} ExportArcCookie */
/** @typedef {import('@advanced-rest-client/events').DataExport.ExportArcVariable} ExportArcVariable */
/** @typedef {import('@advanced-rest-client/events').DataExport.ExportArcHistoryRequest} ExportArcHistoryRequest */
/** @typedef {import('@advanced-rest-client/events').DataExport.ExportArcUrlHistory} ExportArcUrlHistory */
/** @typedef {import('@advanced-rest-client/events').DataExport.ExportArcWebsocketUrl} ExportArcWebsocketUrl */
/** @typedef {import('@advanced-rest-client/events').DataExport.ExportArcAuthData} ExportArcAuthData */

class ComponentPage extends DemoPage {
  constructor() {
    super();
    this.initObservableProperties([
      'data'
    ]);
    this.componentName = 'import-data-inspector';
    this.generator = new ArcMock();
    this.data = this.generate();

    this.selectHandler = this.selectHandler.bind(this);
    this.importFileHandler = this.importFileHandler.bind(this);
  }

  mapExportKeys(item) {
    item.key = item._id;
    delete item._id;
    delete item._rev;
    return item;
  }

  /**
   * @return {ArcExportObject}
   */
  generate() {
    const saved = this.generator.http.savedData(50, 3);
    const history = /** @type ExportArcHistoryRequest[] */ (this.generator.http.listHistory(120)).map(this.mapExportKeys);
    const certs = this.generator.certificates.exportClientCertificates();
    return {
      kind: 'ARC#import',
      createdAt: '2017-09-28T19:43:09.491',
      version: '9.14.64.305',
      requests: saved.requests.map(this.mapExportKeys),
      projects: saved.projects.map(this.mapExportKeys),
      history,
      variables: /** @type ExportArcVariable[] */ (this.generator.variables.listVariables().map(this.mapExportKeys)),
      cookies: /** @type ExportArcCookie[] */ (this.generator.cookies.cookies().map(this.mapExportKeys)),
      urlhistory: /** @type ExportArcUrlHistory[] */ (this.generator.urls.urls().map(this.mapExportKeys)),
      websocketurlhistory: /** @type ExportArcWebsocketUrl[] */ (this.generator.urls.urls().map(this.mapExportKeys)),
      authdata: /** @type ExportArcAuthData[] */ (this.generator.authorization.basicList().map(this.mapExportKeys)),
      // @ts-ignore
      clientcertificates: certs,
    };
  }

  selectHandler() {
    const input = /** @type HTMLInputElement */ (document.getElementById('importFile'));
    input.click();
  }

  /**
   * @param {Event} e 
   */
  importFileHandler(e) {
    const input = /** @type HTMLInputElement */ (e.target);
    const file = input.files[0];
    if (!file) {
      return;
    }
    input.value = '';
    this.processFile(file);
  }

  /**
   * 
   * @param {File} file The file to import
   */
  async processFile(file) {
    const txt = await file.text();
    const normalizer = new ImportNormalize();
    try {
      const data = await normalizer.normalize(txt);
      console.log(data);
      this.data = data;
    } catch (e) {
      console.error(e);
    }
  }

  _demoTemplate() {
    const {
      data
    } = this;
    return html`
      <section class="documentation-section">
        <div class="demo-wrapper">
          <import-data-inspector
            .data="${data}"
          ></import-data-inspector>
        </div>
      </section>
    `;
  }

  customImportTemplate() {
    return html`
    <section class="documentation-section">
      <h3>Import ARC file</h3>
      <anypoint-button @click="${this.selectHandler}">Select file</anypoint-button>
      <input type="file" id="importFile" hidden @change="${this.importFileHandler}"/>
    </section>
    `;
  }

  contentTemplate() {
    return html`
      <h2>Import data inspector</h2>
      ${this._demoTemplate()}
      ${this.customImportTemplate()}
    `;
  }
}

const instance = new ComponentPage();
instance.render();
