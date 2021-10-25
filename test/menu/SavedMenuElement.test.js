import { fixture, assert, nextFrame, html } from '@open-wc/testing';
import { MockedStore, RequestModel } from '@advanced-rest-client/idb-store';
import * as internals from '../../src/elements/request/internals.js';
import '../../define/saved-menu.js';

/** @typedef {import('../../').SavedMenuElement} SavedMenuElement */

describe('SavedMenuElement', () => {
  const store = new MockedStore();
  const model = new RequestModel();

  before(() => {
    model.listen(window);
  });

  after(() => {
    model.unlisten(window);
  });

  /**
   * @returns {Promise<SavedMenuElement>}
   */
  async function noAutoFixture() {
    return fixture(html`<saved-menu noAuto></saved-menu>`);
  }

  describe('data rendering', () => {
    before(async () => {
      await store.insertSaved();
    });

    after(async () => {
      await store.destroySaved();
    });

    let element = /** @type SavedMenuElement */ (null);
    beforeEach(async () => {
      element = await noAutoFixture();
    });

    it('renders empty screen when no data', () => {
      const node = element.shadowRoot.querySelector('.list-empty');
      assert.ok(node);
    });

    it('does not render empty screen with data', async () => {
      await element[internals.loadPage]();
      await nextFrame();
      const node = element.shadowRoot.querySelector('.list-empty');
      assert.notOk(node);
    });

    it('does not render progress bar when not loading', async () => {
      const node = element.shadowRoot.querySelector('progress');
      assert.notOk(node);
    });

    it('render progress bar when loading', async () => {
      const p = element[internals.loadPage]();
      assert.isTrue(element.querying);
      await element.requestUpdate();
      const node = element.shadowRoot.querySelector('progress');
      assert.ok(node);
      await p;
    });

    it('renders list items', async () => {
      await element[internals.loadPage]();
      await element.requestUpdate();
      const nodes = element.shadowRoot.querySelectorAll('anypoint-icon-item');
      assert.lengthOf(nodes, 25);
    });
  });

  
  describe.skip('a11y', () => {
    before(async () => {
      await store.insertSaved();
    });

    after(async () => {
      await store.destroySaved();
    });

    let element;
    beforeEach(async () => {
      element = await noAutoFixture();
      await element[internals.loadPage]();
      await nextFrame();
    });

    it('is accessible with list items', async () => {
      await assert.isAccessible(element, {
        ignoredRules: ['color-contrast'],
      });
    });
  });
});
