import { assert } from '@open-wc/testing'
import { ConfigurationBindings } from '../../index.js';

describe('Bindings', () => {
  describe('ConfigurationBindings', () => {
    /** @type ConfigurationBindings */
    let instance;
    before(async () => {
      instance = new ConfigurationBindings();
    });

    describe('readAll()', () => {
      it('throws error when called', async () => {
        let thrown = false;
        try {
          await instance.readAll();
        } catch (e) {
          thrown = true;
        }
        assert.isTrue(thrown);
      });
    });

    describe('read()', () => {
      it('throws error when called', async () => {
        let thrown = false;
        try {
          await instance.read(undefined);
        } catch (e) {
          thrown = true;
        }
        assert.isTrue(thrown);
      });
    });

    describe('update()', () => {
      it('throws error when called', async () => {
        let thrown = false;
        try {
          await instance.update(undefined, undefined);
        } catch (e) {
          thrown = true;
        }
        assert.isTrue(thrown);
      });
    });
  });
});
