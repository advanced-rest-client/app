import { fixture, assert, html } from '@open-wc/testing';
import { ArcMock } from '@advanced-rest-client/arc-mock';
import '../../define/history-panel.js'
import * as internals from '../../src/elements/request/internals.js';

/** @typedef {import('../../').HistoryPanelElement} HistoryPanelElement */
/** @typedef {import('@advanced-rest-client/events').ArcRequest.ARCHistoryRequest} ARCHistoryRequest */

describe('HistoryPanelElement', () => {
  const generator = new ArcMock();

  /**
   * @returns {Promise<HistoryPanelElement>}
   */
  async function noAutoFixture() {
    return fixture(html`<history-panel noAuto></history-panel>`);
  }

  describe('toggleSelection()', () => {
    let element = /** @type HistoryPanelElement */(null);
    beforeEach(async () => {
      element = await noAutoFixture();
    });

    it('does nothing when no requests', () => {
      element.toggleSelection();
      assert.deepEqual(element.selectedItems, []);
    });

    it('sets [toggleSelectAllValue] value', () => {
      element.toggleSelection();
      assert.isTrue(element[internals.toggleSelectAllValue]);
    });

    it('sets selected items', () => {
      const items = /** @type ARCHistoryRequest[] */ (generator.http.listHistory());
      element[internals.appendItems](items);
      element.toggleSelection();
      assert.lengthOf(element.selectedItems, items.length);
    });

    it('overrides previous selection', () => {
      const items = /** @type ARCHistoryRequest[] */ (generator.http.listHistory());
      element[internals.appendItems](items);
      element.selectedItems = [items[0]._id];
      element.toggleSelection();
      assert.lengthOf(element.selectedItems, items.length);
    });

    it('clears the selection', () => {
      const items = /** @type ARCHistoryRequest[] */ (generator.http.listHistory());
      element[internals.appendItems](items);
      element[internals.toggleSelectAllValue] = true;
      element.toggleSelection();
      assert.lengthOf(element.selectedItems, 0);
    });
  });
});
