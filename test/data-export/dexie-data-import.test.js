import { assert, fixture } from '@open-wc/testing';
import { DataGenerator } from '@advanced-rest-client/arc-data-generator';
import { DataHelper } from './DataHelper.js';
import '../../arc-data-import.js';

/** @typedef {import('../../src/ArcDataImportElement.js').ArcDataImportElement} ArcDataImportElement */

describe('Dexie legacy import', () => {
  /**
   * @return {Promise<ArcDataImportElement>}
   */
  async function basicFixture() {
    return fixture(`<arc-data-import></arc-data-import>`);
  }

  const generator = new DataGenerator();

  describe('Dexie import to datastore', () => {
    let originalData;
    let element = /** @type ArcDataImportElement */ (null);
    let data;
    before(async () => {
      await generator.destroySavedRequestData();
      const response = await DataHelper.getFile('dexie-data-export.json');
      originalData = JSON.parse(response);
    });

    after(() => generator.destroySavedRequestData());

    beforeEach(async () => {
      element = await basicFixture();
      data = generator.clone(originalData);
    });

    it('stores the data', async () => {
      const parsed = await element.normalizeImportData(data);
      const errors = await element.storeData(parsed);
      assert.isUndefined(errors, 'has no data storing error');
      const requests = await generator.getDatastoreRequestData();
      assert.lengthOf(requests, 6, 'Has 6 requests');
      const projects = await generator.getDatastoreProjectsData();
      assert.lengthOf(projects, 2, 'Has 2 projects');
      const history = await generator.getDatastoreHistoryData();
      assert.lengthOf(history, 0, 'Has no history');
    });

    // it('overrides (some) data', async () => {
    //   const parsed = await element.normalizeImportData(data);
    //   const errors = await element.storeData(parsed);
    //   assert.isUndefined(errors, 'has no data storing error');
    //   const requests = await generator.getDatastoreRequestData();
    //   // 4 requests are in a project in the test data
    //   // and this import is missing project ID so it generates IDs again
    //   // so together it should give 6 from previous import + 4 new
    //   assert.lengthOf(requests, 10, 'Has 10 requests');
    //   const projects = await generator.getDatastoreProjectsData();
    //   assert.lengthOf(projects, 4, 'Has 4 projects');
    //   const history = await generator.getDatastoreHistoryData();
    //   assert.lengthOf(history, 0, 'Has no history');
    // });
  });
});
