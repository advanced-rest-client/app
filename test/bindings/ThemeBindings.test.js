import { assert } from '@open-wc/testing'
import { ThemeBindings } from '../../index.js';

describe('Bindings', () => {
  describe('ThemeBindings', () => {
    /** @type ThemeBindings */
    let instance;
    before(async () => {
      instance = new ThemeBindings('http', `${window.location.host}/demo/themes`);
    });

    describe('defaultSettings()', () => {
      it('returns default settings', async () => {
        const result = instance.defaultSettings();
        assert.equal(result.kind, 'ARC#ThemeInfo', 'has the kind');
        assert.equal(result.version, '1.1.0', 'has the version');
        assert.isTrue(result.systemPreferred, 'has the systemPreferred');
        assert.deepEqual(result.themes, [], 'has themes');
      });
    });

    describe('readSystemThemeInfo()', () => {
      it('returns default settings', async () => {
        const result = await instance.readSystemThemeInfo();
        assert.isFalse(result.shouldUseDarkColors, 'has the shouldUseDarkColors');
        assert.isFalse(result.shouldUseHighContrastColors, 'has the shouldUseHighContrastColors');
        assert.isFalse(result.shouldUseInvertedColorScheme, 'has the shouldUseInvertedColorScheme');
      });
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

    describe('activate()', () => {
      it('throws error when called', async () => {
        let thrown = false;
        try {
          await instance.activate('test');
        } catch (e) {
          thrown = true;
        }
        assert.isTrue(thrown);
      });
    });

    describe('setSystemPreferred()', () => {
      it('throws error when called', async () => {
        let thrown = false;
        try {
          await instance.setSystemPreferred(true);
        } catch (e) {
          thrown = true;
        }
        assert.isTrue(thrown);
      });
    });
  });
});
