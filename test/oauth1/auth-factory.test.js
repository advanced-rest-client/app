import { html, fixture, assert } from '@open-wc/testing';
import '../../define/oauth1-authorization.js';

/** @typedef {import('../../src/elements/authorization/OAuth1AuthorizationElement').OAuth1AuthorizationElement} OAuth1AuthorizationElement */

describe('OAuth1AuthorizationElement', () => {
  /**
   * @returns {Promise<OAuth1AuthorizationElement>}
   */
  async function basicFixture() {
    return (fixture(html`<oauth1-authorization></oauth1-authorization>`));
  }

  describe('Hmac SHA1 generation', () => {
    it('generates the HMAC-SHA1 signature', async () => {
      const element = await basicFixture();
      const src = 'a value to encode';
      const key = 'a3f4c3e07af7';
      const result = element._createSignatureHamacSha1(src, key);
      assert.equal(result, 'Hl+3ChWzhgBGOAVS6QBfpkPBk2w=');
    });
  });
});
