import { assert } from '@open-wc/testing';
import { ModulesRegistry } from '../../index.js';

describe('ModulesRegistry', () => {
  describe('#request', () => {
    it('returns the value', () => {
      assert.equal(ModulesRegistry.request, 'request');
    });

    it('is read only', () => {
      assert.throws(() => {
        // @ts-ignore
        ModulesRegistry.request = 'test';
      });
    });
  });

  describe('#response', () => {
    it('returns the value', () => {
      assert.equal(ModulesRegistry.response, 'response');
    });

    it('is read only', () => {
      assert.throws(() => {
        // @ts-ignore
        ModulesRegistry.response = 'test';
      });
    });
  });

  describe('register()', () => {
    const id = 'test-module';

    after(() => {
      ModulesRegistry.unregister(ModulesRegistry.request, id);
      ModulesRegistry.unregister(ModulesRegistry.request, 'id1');
      ModulesRegistry.unregister(ModulesRegistry.request, 'id2');
    });

    it('adds a module to the "request" registry', () => {
      ModulesRegistry.register(ModulesRegistry.request, id, () => {});

      const registered = ModulesRegistry.get(ModulesRegistry.request);
      assert.equal(registered.size, 1);
    });

    it('throws when trying to register a module again', () => {
      assert.throws(() => {
        ModulesRegistry.register(ModulesRegistry.request, id, () => {});
      });
    });

    it('adds default permission set', () => {
      ModulesRegistry.register(ModulesRegistry.request, 'id1', () => {});

      const registered = ModulesRegistry.get(ModulesRegistry.request);
      const info = registered.get('id1');
      assert.deepEqual(info.permissions, []);
    });

    it('sets passed permissions', () => {
      ModulesRegistry.register(ModulesRegistry.request, 'id2', () => {}, ['a', 'b']);

      const registered = ModulesRegistry.get(ModulesRegistry.request);
      const info = registered.get('id2');
      assert.deepEqual(info.permissions, ['a', 'b']);
    });
  });

  describe('has()', () => {
    const id = 'test-module-has';

    after(() => {
      ModulesRegistry.unregister(ModulesRegistry.request, id);
    });

    it('returns true for a registered module', () => {
      ModulesRegistry.register(ModulesRegistry.request, id, () => {});
      const result = ModulesRegistry.has(ModulesRegistry.request, id);
      assert.isTrue(result);
    });

    it('returns false for an unknown module', () => {
      const result = ModulesRegistry.has(ModulesRegistry.request, 'unknown');
      assert.isFalse(result);
    });
  });

  describe('unregister()', () => {
    const id = 'test-module-unregister';

    it('removes the module from the registry', () => {
      ModulesRegistry.register(ModulesRegistry.request, id, () => {});
      ModulesRegistry.unregister(ModulesRegistry.request, id);
      const result = ModulesRegistry.has(ModulesRegistry.request, id);
      assert.isFalse(result);
    });
  });
});
