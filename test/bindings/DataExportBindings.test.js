import { assert } from '@open-wc/testing'
import { DataExportBindings } from '../../index.js';

describe('Bindings', () => {
  describe('DataExportBindings', () => {
    /** @type DataExportBindings */
    let instance;
    before(async () => {
      instance = new DataExportBindings();
    });

    describe('exportFileData()', () => {
      it('throws error when called', async () => {
        let thrown = false;
        try {
          await instance.exportFileData(undefined, undefined);
        } catch (e) {
          thrown = true;
        }
        assert.isTrue(thrown);
      });
    });

    describe('prepareData()', () => {
      it('stringifies an object', async () => {
        const result = instance.prepareData({ test: true }, 'application/json');
        assert.equal(result, '{"test":true}');
      });

      it('returns a string instance', async () => {
        const result = instance.prepareData("test", 'text/plain');
        assert.equal(result, 'test');
      });
    });
  });
});
