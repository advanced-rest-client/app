import { assert } from '@open-wc/testing'
import { WorkspaceBindings } from '../../index.js';

describe('Bindings', () => {
  describe('WorkspaceBindings', () => {
    /** @type WorkspaceBindings */
    let instance;
    before(async () => {
      instance = new WorkspaceBindings();
    });

    describe('store()', () => {
      it('throws error when called', async () => {
        let thrown = false;
        try {
          await instance.store(undefined);
        } catch (e) {
          thrown = true;
        }
        assert.isTrue(thrown);
      });
    });

    describe('setId()', () => {
      it('throws error when called', async () => {
        let thrown = false;
        try {
          instance.setId(undefined);
        } catch (e) {
          thrown = true;
        }
        assert.isTrue(thrown);
      });
    });

    describe('exportWorkspace()', () => {
      it('throws error when called', async () => {
        let thrown = false;
        try {
          await instance.exportWorkspace();
        } catch (e) {
          thrown = true;
        }
        assert.isTrue(thrown);
      });
    });

    describe('restore()', () => {
      it('throws error when called', async () => {
        let thrown = false;
        try {
          await instance.restore();
        } catch (e) {
          thrown = true;
        }
        assert.isTrue(thrown);
      });
    });

    describe('createDefaultWorkspace()', () => {
      it('returns default settings', async () => {
        const result = instance.createDefaultWorkspace();
        assert.equal(result.kind, 'ARC#DomainWorkspace', 'has the kind');
        assert.typeOf(result.id, 'string', 'has the id');
        assert.isFalse(result.readOnly, 'has the readOnly');
      });
    });

    describe('upgradeLegacyWorkspace()', () => {
      it('creates default values', async () => {
        const result = instance.upgradeLegacyWorkspace({ variables: undefined });
        assert.equal(result.kind, 'ARC#DomainWorkspace', 'has the kind');
        assert.typeOf(result.id, 'string', 'has the id');
        assert.isFalse(result.readOnly, 'has the readOnly');
      });

      it('creates basic meta', async () => {
        const result = instance.upgradeLegacyWorkspace({ variables: undefined });
        assert.equal(result.meta.kind, 'ARC#ThingMeta', 'has the meta.kind');
      });

      it('adds meta.description', async () => {
        const result = instance.upgradeLegacyWorkspace({ variables: undefined, description: 'test' });
        assert.equal(result.meta.description, 'test');
      });

      it('adds meta.version', async () => {
        const result = instance.upgradeLegacyWorkspace({ variables: undefined, version: 'test' });
        assert.equal(result.meta.version, 'test');
      });

      it('adds meta.published', async () => {
        const result = instance.upgradeLegacyWorkspace({ variables: undefined, published: 'test' });
        assert.equal(result.meta.published, 'test');
        assert.equal(result.meta.updated, 'test');
      });

      it('adds the provider', async () => {
        const result = instance.upgradeLegacyWorkspace({ variables: undefined, provider: { name: 'test' } });
        assert.deepEqual(result.provider, { name: 'test', kind: 'ARC#Provider' });
      });

      it('adds the selected', async () => {
        const result = instance.upgradeLegacyWorkspace({ variables: undefined, selected: 12 });
        assert.equal(result.selected, 12);
      });
    });
  });
});
