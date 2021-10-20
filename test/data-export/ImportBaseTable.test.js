import { fixture, assert, nextFrame, html } from '@open-wc/testing';
// import '@advanced-rest-client/arc-data-import/arc-data-import.js';
import { ArcMock } from '@advanced-rest-client/arc-mock';
import '../../define/import-history-table.js';

/** @typedef {import('../../src/elements/inspector/ImportHistoryTable').ImportHistoryTable} ImportHistoryTable */
/** @typedef {import('@advanced-rest-client/events').DataExport.ExportArcHistoryRequest} ExportArcHistoryRequest */

describe('ImportBaseTable', () => {
  const generator = new ArcMock();
  /**
   * @param {ExportArcHistoryRequest[]=} data
   * @returns {Promise<ImportHistoryTable>}
   */
  async function basicFixture(data) {
    return fixture(html`
      <import-history-table .data="${data}"></import-history-table>
    `);
  }

  /**
   * @param {any} item
   * @returns {ExportArcHistoryRequest}
   */
  function mapExportKeys(item) {
    item.key = item._id;
    delete item._id;
    delete item._rev;
    return item;
  }

  describe('toggleOpened()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('toggles "opened" property', () => {
      element.toggleOpened();
      assert.isTrue(element.opened);
    });
  });

  describe('Selection', () => {
    let element;
    beforeEach(async () => {
      const data = generator.http.listHistory(5);
      element = await basicFixture(data.map(mapExportKeys));
    });

    it('sets all selected by default', () => {
      assert.isTrue(element.allSelected, 'all selected flag is set');
      assert.lengthOf(element.selectedIndexes, 5, 'selected indexes contains all items');
      const nodes = element.shadowRoot.querySelectorAll('anypoint-icon-item anypoint-checkbox');
      const nonSelected = Array.from(nodes).filter((i) => !i.checked);
      assert.lengthOf(nonSelected, 0, 'all list items are selected');
    });

    it('hasSelection is true when selected', () => {
      assert.isTrue(element.hasSelection);
    });

    it('deselects all items with checkbox', async () => {
      const button = element.shadowRoot.querySelector('.select-all');
      button.click();
      await nextFrame();
      assert.isFalse(element.allSelected, 'all selected flag is updated');
      assert.lengthOf(element.selectedIndexes, 0, 'selected has no items');
      const nodes = element.shadowRoot.querySelectorAll('anypoint-icon-item.selected');
      assert.lengthOf(nodes, 0, 'all list items are deselected');
    });

    it('hasSelection is false when none selected', async () => {
      const button = element.shadowRoot.querySelector('.select-all');
      button.click();
      await nextFrame();
      assert.isFalse(element.hasSelection);
    });

    it('deselects an item via checkbox', async () => {
      const button = element.shadowRoot.querySelector('anypoint-icon-item anypoint-checkbox');
      button.click();
      await nextFrame();
      assert.isFalse(button.parentElement.classList.contains('selected'), 'item has no selected styles');
      assert.isFalse(button.checked, 'checkbox is not selected');
      assert.lengthOf(element.selectedIndexes, 4, 'table has partial selection');
    });

    it('deselects an item via item click', async () => {
      const item = element.shadowRoot.querySelector('anypoint-icon-item');
      item.click();
      await nextFrame();
      assert.isFalse(item.classList.contains('selected'), 'item has no selected styles');
      const button = item.querySelector('anypoint-checkbox');
      assert.isFalse(button.checked, 'checkbox is not selected');
      assert.lengthOf(element.selectedIndexes, 4, 'table has partial selection');
    });
  });

  describe('#selectedItems', () => {
    let element;
    let data;
    beforeEach(async () => {
      data = generator.http.listHistory(5);
      element = await basicFixture(data.map(mapExportKeys));
    });

    it('returns all items', () => {
      assert.deepEqual(element.selectedItems, data);
    });

    it('returns only selected items', async () => {
      const item = element.shadowRoot.querySelector('anypoint-icon-item');
      item.click();
      await nextFrame();
      assert.lengthOf(element.selectedItems, 4);
    });

    it('returns empty array when no selection', async () => {
      const button = element.shadowRoot.querySelector('.select-all');
      button.click();
      await nextFrame();
      assert.lengthOf(element.selectedItems, 0);
    });
  });
});
