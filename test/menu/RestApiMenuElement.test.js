import { fixture, assert, html, aTimeout } from '@open-wc/testing';
import { MockedStore, RestApiModel } from '@advanced-rest-client/idb-store';
import * as internals from '../../src/elements/request/internals.js';
import '../../define/rest-api-menu.js';

/** @typedef {import('../../').RestApiMenuElement} RestApiMenuElement */

describe('RestApiMenuElement', () => {
  const store = new MockedStore();
  const model = new RestApiModel();

  before(() => {
    model.listen(window);
  });

  after(() => {
    model.unlisten(window);
  });

  /**
   * @returns {Promise<RestApiMenuElement>}
   */
  async function noAutoFixture() {
    return fixture(html`<rest-api-menu noAuto></rest-api-menu>`);
  }

  describe('data rendering', () => {
    before(async () => {
      await store.insertApis();
    });

    after(async () => {
      await store.destroyApisAll();
    });

    let element = /** @type RestApiMenuElement */ (null);
    beforeEach(async () => {
      element = await noAutoFixture();
    });

    it('renders empty screen when no data', () => {
      const node = element.shadowRoot.querySelector('.empty-message');
      assert.ok(node);
    });

    it('does not render empty screen with data', async () => {
      await element[internals.loadPage]();
      await aTimeout(0);
      const node = element.shadowRoot.querySelector('.empty-message');
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
      const nodes = element.shadowRoot.querySelectorAll('anypoint-item');
      assert.lengthOf(nodes, 25);
    });

    it('renders drop target template', () => {
      const node = element.shadowRoot.querySelector('.drop-target');
      assert.ok(node);
    });
  });

  describe.skip('a11y', () => {
    before(async () => {
      await store.insertApis();
    });

    after(async () => {
      await store.destroyApisAll();
    });

    let element = /** @type RestApiMenuElement */ (null);
    beforeEach(async () => {
      element = await noAutoFixture();
      await element[internals.loadPage]();
      await element.requestUpdate();
    });

    it('is accessible with list items', async () => {
      await assert.isAccessible(element, {
        ignoredRules: ['color-contrast'],
      });
    });
  });
});
