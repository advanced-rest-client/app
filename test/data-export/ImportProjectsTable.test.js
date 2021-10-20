import { fixture, assert, html, nextFrame } from '@open-wc/testing';
import { DataHelper } from './DataHelper.js';
import '../../define/import-projects-table.js';
import { renderValue, selectedRequestsValue, openedProjectsValue } from '../../src/elements/inspector/ImportProjectsTable.js';

/** @typedef {import('../../src/elements/inspector/ImportProjectsTable').ImportProjectsTable} ImportProjectsTable */
/** @typedef {import('@advanced-rest-client/events').DataExport.ExportArcProjects} ExportArcProjects */
/** @typedef {import('@advanced-rest-client/events').DataExport.ExportArcSavedRequest} ExportArcSavedRequest */
/** @typedef {import('@anypoint-web-components/awc').AnypointCollapseElement} AnypointCollapseElement */

describe('ImportProjectsTable', () => {
  /**
   * @param {ExportArcProjects[]=} projects
   * @param {ExportArcSavedRequest[]=} requests
   * @return {Promise<ImportProjectsTable>}
   */
  async function basicFixture(projects, requests) {
    return fixture(html`
      <import-projects-table 
        tableTitle="Projects" 
        .data="${projects}" 
        .requests="${requests}"
        opened
      ></import-projects-table>
    `);
  }

  describe('data setup', () => {
    let element = /** @type ImportProjectsTable */(null);
    beforeEach(async () => {
      const { projects, requests } = DataHelper.generateExportData();
      element = await basicFixture(projects, requests);
    });

    it('sets [renderValue] with projects and requests', () => {
      const value = element[renderValue];
      assert.typeOf(value, 'array');
      const [item] = value;
      assert.typeOf(item.project, 'object', 'has project');
      assert.typeOf(item.requests, 'array', 'has requests');
    });

    it('sets [selectedRequestsValue] property', () => {
      const { project, requests } = element[renderValue][0];
      const value = element[selectedRequestsValue];
      assert.typeOf(value, 'object', 'property is set');
      const selected = value[project.key];
      assert.deepEqual(selected, requests.map((i) => i.key));
    });
  });

  describe('data rendering', () => {
    let element = /** @type ImportProjectsTable */(null);
    beforeEach(async () => {
      const { projects, requests } = DataHelper.generateExportData();
      element = await basicFixture(projects, requests);
    });

    it('renders table header', () => {
      const value = element[renderValue];
      const cnt = value.length;
      const checkbox = element.shadowRoot.querySelector('header anypoint-checkbox');
      assert.ok(checkbox, 'renders toggle all checkbox');
      const label = element.shadowRoot.querySelector('header h3');
      assert.equal(label.textContent.trim(), `Projects (${cnt})`);
    });

    it('renders all projects', () => {
      const value = element[renderValue];
      const cnt = value.length;
      const items = element.shadowRoot.querySelectorAll('.project-label');
      assert.lengthOf(items, cnt);
    });

    it('renders all collapse elements', () => {
      const value = element[renderValue];
      let cnt = 0;
      value.forEach((i) => {
        if (i.requests.length) {
          cnt++;
        }
      });
      const items = element.shadowRoot.querySelectorAll('anypoint-collapse > anypoint-collapse');
      assert.lengthOf(items, cnt);
    });

    it('renders requests in a project', () => {
      const { project, requests } = element[renderValue][0];
      const pid = project.key;
      requests.forEach((request) => {
        const { key } = request;
        const item = element.shadowRoot.querySelector(`anypoint-icon-item[data-key="${key}"][data-project="${pid}"]`);
        assert.ok(item);
      });
    });
  });

  describe('data manipulation', () => {
    let element = /** @type ImportProjectsTable */(null);
    beforeEach(async () => {
      const { projects, requests } = DataHelper.generateExportData();
      element = await basicFixture(projects, requests);
    });

    it('has all data selected', () => {
      const indexes = element[renderValue].map((i) => i.project.key);
      assert.deepEqual(element.selectedIndexes, indexes, 'has selected indexes');
      assert.lengthOf(element.selectedItems, indexes.length, 'has selected items');
      const cnt = element[renderValue].reduce((acc, i) => acc + (i.requests ? i.requests.length : 0), 0);
      assert.lengthOf(element.selectedRequests, cnt, 'has selected requests');
    });

    it('deselects all data from the main toggle', () => {
      const checkbox = /** @type HTMLElement */ (element.shadowRoot.querySelector('header anypoint-checkbox'));
      checkbox.click();
      assert.deepEqual(element.selectedIndexes, []);
      assert.deepEqual(element.selectedItems, []);
    });

    it('deselects single project', async () => {
      const { project } = element[renderValue][0];
      const pid = project.key;
      const checkbox = /** @type HTMLElement */ (element.shadowRoot.querySelector(`.project-label anypoint-checkbox[data-id="${pid}"]`));
      checkbox.click();
      await nextFrame();
      assert.isFalse(element.selectedIndexes.includes(pid));
    });

    it('selects back a single project', async () => {
      element.allSelected = false;
      await nextFrame();
      const { project } = element[renderValue][0];
      const pid = project.key;
      const checkbox = /** @type HTMLElement */ (element.shadowRoot.querySelector(`.project-label anypoint-checkbox[data-id="${pid}"]`));
      checkbox.click();
      await nextFrame();
      assert.isTrue(element.selectedIndexes.includes(pid));
    });

    it('deselects requests from unselected project', async () => {
      const { project, requests } = element[renderValue][0];
      const pid = project.key;
      const checkbox = /** @type HTMLElement */ (element.shadowRoot.querySelector(`.project-label anypoint-checkbox[data-id="${pid}"]`));
      checkbox.click();
      await nextFrame();
      element.selectedRequests.forEach((request) => {
        const inputRequest = requests.find((r) => r.key === request.key);
        assert.notOk(inputRequest);
      });
    });

    it('deselects single request', () => {
      const { project, requests } = element[renderValue][0];
      const pid = project.key;
      const { key } = requests[0];
      const item = /** @type HTMLElement */ (element.shadowRoot.querySelector(`anypoint-icon-item[data-key="${key}"][data-project="${pid}"]`));
      item.click();
      const request = element.selectedRequests.find((r) => r.key === key);
      assert.notOk(request);
    });
  });

  describe('project visibility toggle', () => {
    let element = /** @type ImportProjectsTable */(null);
    beforeEach(async () => {
      const { projects, requests } = DataHelper.generateExportData();
      element = await basicFixture(projects, requests);
    });

    it('has all projects collapsed', () => {
      assert.deepEqual(element[openedProjectsValue], []);
      const items = element.shadowRoot.querySelectorAll('anypoint-collapse > anypoint-collapse');
      const toggles = /** @type AnypointCollapseElement[] */ (Array.from(items));
      toggles.forEach((i) => {
        assert.isFalse(i.opened);
      });
    });

    it('opens a project via project name click', async () => {
      const span = /** @type HTMLSpanElement */ (element.shadowRoot.querySelector('.project-name'))
      span.click();
      assert.deepEqual(element[openedProjectsValue], [span.dataset.id]);
      await nextFrame();
      const collapse = /** @type AnypointCollapseElement */ (span.parentElement.nextElementSibling);
      assert.isTrue(collapse.opened);
    });

    it('opens a project via toggle button', async () => {
      const span = /** @type HTMLSpanElement */ (element.shadowRoot.querySelector('.project-label .toggle-icon'))
      span.click();
      assert.deepEqual(element[openedProjectsValue], [span.dataset.id]);
      await nextFrame();
      const collapse = /** @type AnypointCollapseElement */ (span.parentElement.nextElementSibling);
      assert.isTrue(collapse.opened);
    });

    it('collapses a project', async () => {
      const span = /** @type HTMLSpanElement */ (element.shadowRoot.querySelector('.project-name'))
      element[openedProjectsValue] = [span.dataset.id];
      await nextFrame();
      span.click();
      assert.deepEqual(element[openedProjectsValue], []);
      await nextFrame();
      const collapse = /** @type AnypointCollapseElement */ (span.parentElement.nextElementSibling);
      assert.isFalse(collapse.opened);
    });
  });
});
