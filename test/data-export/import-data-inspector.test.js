import { fixture, assert, nextFrame, html } from '@open-wc/testing';
import sinon from 'sinon';
import '../../define/import-data-inspector.js';
import { DataHelper } from './DataHelper.js';
import { getTableData, readNonProjectsData } from '../../src/elements/import-export/ImportDataInspectorElement.js';

/** @typedef {import('../../').ImportDataInspectorElement} ImportDataInspectorElement */
/** @typedef {import('@advanced-rest-client/events').DataExport.ArcExportObject} ArcExportObject */
/** @typedef {import('@advanced-rest-client/events').DataExport.ExportArcHistoryRequest} ExportArcHistoryRequest */
/** @typedef {import('@advanced-rest-client/events').DataExport.ExportArcCookie} ExportArcCookie */
/** @typedef {import('@advanced-rest-client/events').DataExport.ExportArcVariable} ExportArcVariable */
/** @typedef {import('@advanced-rest-client/events').DataExport.ExportArcUrlHistory} ExportArcUrlHistory */
/** @typedef {import('@advanced-rest-client/events').DataExport.ExportArcWebsocketUrl} ExportArcWebsocketUrl */
/** @typedef {import('@advanced-rest-client/events').DataExport.ExportArcAuthData} ExportArcAuthData */

describe('ImportDataInspectorElement', () => {
  /**
   * @param {ArcExportObject=} data
   * @returns {Promise<ImportDataInspectorElement>}
   */
  async function basicFixture(data) {
    return fixture(html`<import-data-inspector .data="${data}"></import-data-inspector>`);
  }

  describe('import table test', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture(DataHelper.generateExportData());
    });

    it('dispatches "cancel" event', () => {
      const spy = sinon.spy();
      element.addEventListener('cancel', spy);
      const button = element.shadowRoot.querySelector('[data-action="cancel-import"]');
      button.click();
      assert.isTrue(spy.calledOnce);
    });

    it('dispatches "import" event', () => {
      const spy = sinon.spy();
      element.addEventListener('import', spy);
      const button = element.shadowRoot.querySelector('[data-action="import-data"]');
      button.click();
      assert.isTrue(spy.calledOnce, 'event is dispatched');

      const { detail } = spy.args[0][0]
      assert.typeOf(detail, 'object', 'Detail is an object');
      assert.equal(detail.kind, 'ARC#Import', 'Detail is an import object');
    });

    it('renders history table', () => {
      const node = element.shadowRoot.querySelector('import-history-table');
      assert.ok(node, 'table is rendered');
      assert.typeOf(node.data, 'array', 'table has data');
    });

    it('renders requests table', () => {
      const node = element.shadowRoot.querySelector('import-requests-table');
      assert.ok(node, 'table is rendered');
      assert.typeOf(node.data, 'array', 'table has data');
    });

    it('renders projects table', () => {
      const node = element.shadowRoot.querySelector('import-projects-table');
      assert.ok(node, 'table is rendered');
      assert.typeOf(node.data, 'array', 'table has data');
    });

    it('renders variables table', () => {
      const node = element.shadowRoot.querySelector('import-variables-table');
      assert.ok(node, 'table is rendered');
      assert.typeOf(node.data, 'array', 'table has data');
    });

    it('renders cookies table', () => {
      const node = element.shadowRoot.querySelector('import-cookies-table');
      assert.ok(node, 'table is rendered');
      assert.typeOf(node.data, 'array', 'table has data');
    });

    it('renders url-history table', () => {
      const node = element.shadowRoot.querySelector('import-url-history-table');
      assert.ok(node, 'table is rendered');
      assert.typeOf(node.data, 'array', 'table has data');
    });

    it('renders websocket-url-history table', () => {
      const node = element.shadowRoot.querySelector('import-websocket-url-history-table');
      assert.ok(node, 'table is rendered');
      assert.typeOf(node.data, 'array', 'table has data');
    });

    it('renders client certificates table', () => {
      const node = element.shadowRoot.querySelector('import-cc-table');
      assert.ok(node, 'table is rendered');
      assert.typeOf(node.data, 'array', 'table has data');
    });

    it('the request table has only requests that are not assigned to a project', () => {
      const table = element.shadowRoot.querySelector('import-requests-table');
      if (!table) {
        console.warn(`This test did not run. No single requests generated`);
        return;
      }
      const filtered = element.data.requests.filter((i) => !i.projects || !i.projects.length);
      assert.lengthOf(table.data, filtered.length)
    });
  });

  describe('[getTableData]()', () => {
    let element = /** @type ImportDataInspectorElement */(null);
    beforeEach(async () => {
      element = await basicFixture(DataHelper.generateExportData());
    });

    it('computes list of selected objects', () => {
      const result = element[getTableData]('import-websocket-url-history-table');
      assert.typeOf(result, 'array');
      assert.lengthOf(result, 10);
    });

    it('returns undefined if selection is empty', () => {
      const table = element.shadowRoot.querySelector('import-websocket-url-history-table');
      table.selectedIndexes = [];
      const result = element[getTableData]('import-websocket-url-history-table');
      assert.isUndefined(result);
    });
  });

  describe('collectData()', () => {
    let element = /** @type ImportDataInspectorElement */(null);
    beforeEach(async () => {
      const data = DataHelper.generateExportData();
      element = await basicFixture(data);
      await nextFrame();
    });

    it('returns an object', () => {
      const result = element.collectData();
      assert.typeOf(result, 'object');
    });

    it('has ARC import object', () => {
      const result = element.collectData();
      assert.equal(result.kind, 'ARC#Import');
    });

    it('has all data', () => {
      const result = element.collectData();
      assert.lengthOf(Object.keys(result), 12);
    });

    it('contains partial import', () => {
      const table = element.shadowRoot.querySelector('import-websocket-url-history-table');
      table.selectedIndexes = [table.selectedIndexes[0]];
      const result = element.collectData();
      assert.lengthOf(result.websocketurlhistory, 1);
    });

    it('has projects data', () => {
      const result = element.collectData();
      assert.lengthOf(result.projects, 2);
    });
    
    it('has all passed requests', () => {
      const requests = Array.from(element.data.requests);
      const result = element.collectData();
      assert.lengthOf(result.requests, requests.length);
    });

    it('removes unselected project and its requests', () => {
      const requests = Array.from(element.data.requests);
      const table = element.shadowRoot.querySelector('import-projects-table');
      const id = table.selectedItems[0].key;
      table.selectedIndexes = [table.selectedIndexes[0]];
      const result = element.collectData();
      assert.lengthOf(result.projects, 1, 'has single project');
      const filtered = [];
      requests.forEach((i) => {
        if (!i.projects) {
          filtered.push(i);
          return;
        }
        if (i.projects.length > 1) {
          filtered.push(i);
          return;
        }
        if (i.projects.includes(id)) {
          filtered.push(i);
        }
      });
      assert.lengthOf(result.requests, filtered.length);
    });
  });

  describe('[readNonProjectsData]()', () => {
    let element = /** @type ImportDataInspectorElement */(null);
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('returns null when no requests', () => {
      const result = element[readNonProjectsData]({});
      assert.equal(result, null);
    });

    it('returns null when empty requests', () => {
      const result = element[readNonProjectsData]({ requests: [] });
      assert.equal(result, null);
    });
    
    it('filters out items with projects', () => {
      const result = element[readNonProjectsData]({ requests: [{ projects: ['test'] }] });
      assert.deepEqual(result, []);
    });
    
    it('returns non project items', () => {
      const result = element[readNonProjectsData]({ requests: [{ id: 1 }] });
      assert.deepEqual(result, [{ id: 1 }]);
    });
    
    it('checks for the project size', () => {
      const result = element[readNonProjectsData]({ requests: [{ id: 2, projects: [] }] });
      assert.deepEqual(result, [{ id: 2, projects: [] }]);
    });
  });
});
