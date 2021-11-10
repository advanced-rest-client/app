import { assert } from '@open-wc/testing'
import { NavigationBindings } from '../../index.js';

describe('Bindings', () => {
  describe('NavigationBindings', () => {
    /** @type NavigationBindings */
    let instance;
    before(async () => {
      instance = new NavigationBindings();
      await instance.initialize();
    });

    describe('navigateExternal()', () => {
      it('throws error when called', async () => {
        let thrown = false;
        try {
          await instance.navigateExternal('');
        } catch (e) {
          thrown = true;
        }
        assert.isTrue(thrown);
      });
    });

    describe('openWebUrl()', () => {
      it('throws error when called', async () => {
        let thrown = false;
        try {
          await instance.openWebUrl(undefined, undefined);
        } catch (e) {
          thrown = true;
        }
        assert.isTrue(thrown);
      });
    });

    describe('helpTopic()', () => {
      it('throws error when called', async () => {
        let thrown = false;
        try {
          await instance.helpTopic(undefined);
        } catch (e) {
          thrown = true;
        }
        assert.isTrue(thrown);
      });
    });
  });
});
