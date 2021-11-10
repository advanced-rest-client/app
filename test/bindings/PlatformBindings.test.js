import { assert } from '@open-wc/testing'
import { PlatformBindings } from '../../index.js';

describe('Bindings', () => {
  describe('PlatformBindings', () => {
    /** @type PlatformBindings */
    let instance;
    before(async () => {
      instance = new PlatformBindings();
    });

    describe('updateValue()', () => {
      it('updates a deep value', async () => {
        const target = {};
        instance.updateValue(target, 'a.b.c', 123);
        assert.equal(target.a.b.c, 123);
      });
    });
  });
});
