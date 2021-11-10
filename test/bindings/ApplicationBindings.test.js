import { assert } from '@open-wc/testing'
import { ApplicationBindings } from '../../index.js';

describe('Bindings', () => {
  describe('ApplicationBindings', () => {
    /** @type ApplicationBindings */
    let instance;
    before(async () => {
      instance = new ApplicationBindings();
    });

    describe('readState()', () => {
      it('throws error when called', async () => {
        let thrown = false;
        try {
          await instance.readState();
        } catch (e) {
          thrown = true;
        }
        assert.isTrue(thrown);
      });
    });

    describe('updateStateProperty()', () => {
      it('throws error when called', async () => {
        let thrown = false;
        try {
          await instance.updateStateProperty(undefined, undefined);
        } catch (e) {
          thrown = true;
        }
        assert.isTrue(thrown);
      });
    });
  });
});
