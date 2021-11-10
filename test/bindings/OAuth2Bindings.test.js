import { assert } from '@open-wc/testing'
import { OAuth2Bindings } from '../../index.js';

describe('Bindings', () => {
  describe('OAuth2Bindings', () => {
    /** @type OAuth2Bindings */
    let instance;
    before(async () => {
      instance = new OAuth2Bindings();
      await instance.initialize();
    });

    describe('oauth2Authorize()', () => {
      it('throws error when called', async () => {
        let thrown = false;
        try {
          await instance.oauth2Authorize(undefined);
        } catch (e) {
          thrown = true;
        }
        assert.isTrue(thrown);
      });
    });

    describe('oauth2RemoveToken()', () => {
      it('throws error when called', async () => {
        let thrown = false;
        try {
          await instance.oauth2RemoveToken(undefined);
        } catch (e) {
          thrown = true;
        }
        assert.isTrue(thrown);
      });
    });

    describe('oidcAuthorize()', () => {
      it('throws error when called', async () => {
        let thrown = false;
        try {
          await instance.oidcAuthorize(undefined);
        } catch (e) {
          thrown = true;
        }
        assert.isTrue(thrown);
      });
    });

    describe('oidcRemoveTokens()', () => {
      it('throws error when called', async () => {
        let thrown = false;
        try {
          await instance.oidcRemoveTokens(undefined);
        } catch (e) {
          thrown = true;
        }
        assert.isTrue(thrown);
      });
    });
  });
});
