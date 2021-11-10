import { assert } from '@open-wc/testing'
import { ApiParserBindings } from '../../index.js';

describe('Bindings', () => {
  describe('ApiParserBindings', () => {
    /** @type ApiParserBindings */
    let instance;
    before(async () => {
      instance = new ApiParserBindings();
    });

    describe('processApiLink()', () => {
      it('throws error when called', async () => {
        let thrown = false;
        try {
          await instance.processApiLink('http://localhost');
        } catch (e) {
          thrown = true;
        }
        assert.isTrue(thrown);
      });
    });

    describe('processBuffer()', () => {
      it('throws error when called', async () => {
        let thrown = false;
        try {
          await instance.processBuffer(undefined);
        } catch (e) {
          thrown = true;
        }
        assert.isTrue(thrown);
      });
    });

    describe('processApiFile()', () => {
      it('throws error when called', async () => {
        let thrown = false;
        try {
          await instance.processApiFile(undefined);
        } catch (e) {
          thrown = true;
        }
        assert.isTrue(thrown);
      });
    });

    describe('legacyProcessApiFile()', () => {
      it('throws error when called', async () => {
        let thrown = false;
        try {
          await instance.legacyProcessApiFile(undefined);
        } catch (e) {
          thrown = true;
        }
        assert.isTrue(thrown);
      });
    });

    describe('selectApiMainFile()', () => {
      it('throws error when called', async () => {
        let thrown = false;
        try {
          await instance.selectApiMainFile(undefined);
        } catch (e) {
          thrown = true;
        }
        assert.isTrue(thrown);
      });
    });
  });
});
