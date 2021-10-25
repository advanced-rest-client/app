/* eslint-disable no-param-reassign */

import { fixture, assert, html, oneEvent, nextFrame } from '@open-wc/testing';
import { ArcMock } from '@advanced-rest-client/arc-mock';
import { RestApiModel, MockedStore } from '@advanced-rest-client/idb-store'
import { ArcNavigationEventTypes, ImportEvents, ArcModelEventTypes, ArcModelEvents } from '@advanced-rest-client/events';
import sinon from 'sinon';
import '../../define/rest-apis-panel.js'
import * as internals from '../../src/elements/request/internals.js';

/** @typedef {import('@advanced-rest-client/events').ARCModelStateDeleteEvent} ARCModelStateDeleteEvent */
/** @typedef {import('@advanced-rest-client/events').ARCRestApiDeletedEvent} ARCRestApiDeletedEvent */
/** @typedef {import('@advanced-rest-client/events').ARCRestApiUpdatedEvent} ARCRestApiUpdatedEvent */
/** @typedef {import('@advanced-rest-client/events').RestApi.ARCRestApiIndex} ARCRestApiIndex */
/** @typedef {import('../../').RestApisPanelElement} RestApisPanelElement */
/** @typedef {import('lit-html').TemplateResult} TemplateResult */

describe('RestApisPanelElement', () => {
  const generator = new ArcMock();
  const store = new MockedStore();
  const model = new RestApiModel();

  before(() => {
    model.listen(window);
  });

  after(() => {
    model.unlisten(window);
  });

  /**
   * @returns {TemplateResult}
   */
  function modelTemplate() {
    return html`<rest-apis-panel></rest-apis-panel>`;
  }

  /**
   * @returns {Promise<RestApisPanelElement>}
   */
  async function noAutoFixture() {
    return fixture(html`<rest-apis-panel noAuto></rest-apis-panel>`);
  }

  /**
   * @returns {Promise<RestApisPanelElement>}
   */
  async function afterQueryFixture() {
    const element = /** @type RestApisPanelElement */ (await fixture(modelTemplate()));
    if (element.items && element.items.length) {
      return element;
    }
    // the query may not have started just yet.
    if (!element.querying) {
      await oneEvent(element, 'queryingchange');
    }
    await oneEvent(element, 'queryingchange');
    await nextFrame();
    return element;
  }


  describe('empty list', () => {
    let element = /** @type RestApisPanelElement */ (null);
    beforeEach(async () => {
      element = await noAutoFixture();
    });

    it('hasItems is false', () => {
      assert.isFalse(element.hasItems);
    });

    it('dataUnavailable is true', () => {
      assert.isTrue(element.dataUnavailable);
    });

    it('renders empty message', () => {
      const node = element.shadowRoot.querySelector('.empty-info');
      assert.ok(node);
    });
  });

  describe('list with items', () => {
    before(async () => {
      await store.insertApis();
    });

    after(async () => {
      await store.destroyApisAll();
    });

    let element = /** @type RestApisPanelElement */ (null);
    beforeEach(async () => {
      element = await afterQueryFixture();
    });

    it('hasItems is true', () => {
      assert.isTrue(element.hasItems);
    });

    it('dataUnavailable is false', () => {
      assert.isFalse(element.dataUnavailable);
    });

    it('does not render empty message', () => {
      const node = element.shadowRoot.querySelector('.empty-info');
      assert.notOk(node);
    });

    it('renders list items', () => {
      const nodes = element.shadowRoot.querySelectorAll('.list > anypoint-item');
      assert.lengthOf(nodes, 25);
    });

    it('dispatches navigation event when button clicked', () => {
      const spy = sinon.spy();
      element.addEventListener(ArcNavigationEventTypes.navigateRestApi, spy);
      const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('anypoint-item'));
      node.click();
      assert.isTrue(spy.called);
    });
  });

  describe('reset()', () => {
    let element = /** @type RestApisPanelElement */ (null);
    beforeEach(async () => {
      element = await noAutoFixture();
    });

    it('clears [pageTokenValue]', () => {
      element[internals.pageTokenValue] = 'test';
      element.reset();
      assert.isUndefined(element[internals.pageTokenValue]);
    });

    it('clears [queryTimeoutValue]', () => {
      element[internals.queryTimeoutValue] = 123;
      element.reset();
      assert.isUndefined(element[internals.queryTimeoutValue]);
    });

    it('clears [noMoreItemsValue]', () => {
      element[internals.noMoreItemsValue] = true;
      element.reset();
      assert.isFalse(element[internals.noMoreItemsValue]);
    });

    it('clears querying', () => {
      element[internals.queryingProperty] = true;
      element.reset();
      assert.isFalse(element.querying);
    });

    it('clears items', () => {
      // @ts-ignore
      element.items = [{ test: true }];
      element.reset();
      assert.deepEqual(element.items, []);
    });
  });

  describe('loadPage()', () => {
    before(async () => {
      await store.insertApis();
    });

    after(async () => {
      await store.destroyApisAll();
    });

    let element = /** @type RestApisPanelElement */ (null);
    beforeEach(async () => {
      // prevents auto query
      element = await noAutoFixture();
    });

    it('sets page of results', async () => {
      await element[internals.loadPage]();
      assert.lengthOf(element.items, 25);
    });

    it('sets [pageTokenValue]', async () => {
      await element[internals.loadPage]();
      assert.typeOf(element[internals.pageTokenValue], 'string');
    });

    it('sets [queryingProperty]', async () => {
      const p = element[internals.loadPage]();
      assert.isTrue(element[internals.queryingProperty]);
      await p;
    });

    it('re-sets [queryingProperty]', async () => {
      await element[internals.loadPage]();
      assert.isFalse(element[internals.queryingProperty]);
    });

    it('sets [noMoreItemsValue]', async () => {
      await element[internals.loadPage]();
      await element[internals.loadPage]();
      assert.isTrue(element[internals.noMoreItemsValue]);
    });
  });

  describe('[indexUpdatedHandler]()', () => {
    before(async () => {
      await store.insertApis();
    });

    after(async () => {
      await store.destroyApisAll();
    });

    let element = /** @type RestApisPanelElement */ (null);
    beforeEach(async () => {
      element = await afterQueryFixture();
    });

    it('adds new item to the list', async () => {
      assert.lengthOf(element.items, 25);
      const item = /** @type ARCRestApiIndex */ (generator.restApi.apiIndex());
      item._id = 'test-id';
      item._rev = 'test-rev';
      const record = {
        id: item._id,
        rev: item._rev,
        item,
      };
      ArcModelEvents.RestApi.State.update(document.body, record);
      assert.lengthOf(element.items, 26);
    });

    it('adds new item to the empty list', async () => {
      element.items = undefined;
      const item = /** @type ARCRestApiIndex */ (generator.restApi.apiIndex());
      item._id = 'test-id';
      item._rev = 'test-rev';
      const record = {
        id: item._id,
        rev: item._rev,
        item,
      };
      ArcModelEvents.RestApi.State.update(document.body, record);
      assert.lengthOf(element.items, 1);
    });

    it('updates existing item', async () => {
      const item = { ...element.items[2] };
      item.title = 'test-title';
      const record = {
        id: item._id,
        rev: item._rev,
        item,
      };
      ArcModelEvents.RestApi.State.update(document.body, record);
      assert.equal(element.items[2].title, 'test-title');
    });

    it('requests for an item if missing', async () => {
      const item = { ...element.items[1] };
      const origTitle = item.title;
      item.title = 'test-title';
      const record = {
        id: item._id,
        rev: item._rev,
      };
      // @ts-ignore
      await element[internals.indexUpdatedHandler]({
        changeRecord: record,
      });
      assert.equal(element.items[1].title, origTitle);
    });
  });

  describe('[indexDeletedHandler]()', () => {
    before(async () => {
      await store.insertApis();
    });

    after(async () => {
      await store.destroyApisAll();
    });

    let element = /** @type RestApisPanelElement */ (null);
    beforeEach(async () => {
      element = await afterQueryFixture();
    });

    it('removes existing item', () => {
      const item = { ...element.items[1] };
      ArcModelEvents.RestApi.State.delete(document.body, item._id, item._rev);
      assert.lengthOf(element.items, 24);
    });

    it('ignores unknown item', () => {
      ArcModelEvents.RestApi.State.delete(document.body, 'a', 'b');
      assert.lengthOf(element.items, 25);
    });

    it('ignores when empty list', () => {
      element.items = [];
      ArcModelEvents.RestApi.State.delete(document.body, 'a', 'b');
      assert.lengthOf(element.items, 0);
    });
  });

  describe('[listScrollHandler]()', () => {
    let element = /** @type RestApisPanelElement */ (null);
    beforeEach(async () => {
      element = await noAutoFixture();
      const items = generator.restApi.apiIndexList();
      element.items = /** @type ARCRestApiIndex[] */ (items.map((item, index) => { 
        item._id = `id-${index}`;
        // @ts-ignore
        item._rev = `rev-${index}`;
        return item;
      }));
      element.style.height = '180px';
      await nextFrame();
    });

    it('calls loadNext() when reaches bottom of the list', async () => {
      const list = /** @type HTMLDivElement */ (element.shadowRoot.querySelector('.list'));
      const spy = sinon.spy(element, 'loadNext');
      list.scrollTop = list.scrollHeight;
      await nextFrame();
      assert.isTrue(spy.calledOnce);
    });

    it('does not call loadNext() when has more space', async () => {
      const list = /** @type HTMLDivElement */ (element.shadowRoot.querySelector('.list'));
      const spy = sinon.spy(element, 'loadNext');
      list.scrollTop = 10;
      await nextFrame();
      assert.isFalse(spy.called);
    });
  });

  describe('[restApiDeleteHandler]()', () => {
    before(async () => {
      await store.insertApis();
    });

    after(async () => {
      await store.destroyApisAll();
    });

    let element = /** @type RestApisPanelElement */ (null);
    beforeEach(async () => {
      element = await afterQueryFixture();
    });

    it('deletes item from the data store', async () => {
      const spy = sinon.spy();
      element.addEventListener(ArcModelEventTypes.RestApi.delete, spy);
      const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('[data-action="item-delete"]'));
      node.click();
      assert.isTrue(spy.called);
      await oneEvent(window, ArcModelEventTypes.RestApi.State.delete);
    });

    it('ignores when unknown id', () => {
      const spy = sinon.spy();
      element.addEventListener(ArcModelEventTypes.RestApi.delete, spy);
      const node = document.createElement('div');
      node.click();
      assert.isFalse(spy.called);
    });
  });

  describe('[dataImportHandler]()', () => {
    let element = /** @type RestApisPanelElement */(null);
    beforeEach(async () => {
      element = await noAutoFixture();
    });

    it('Calls reset()', async () => {
      const spy = sinon.spy(element, 'reset');
      ImportEvents.dataImported(document.body);
      assert.isTrue(spy.called);
    });

    it('Calls refresh()', async () => {
      const spy = sinon.spy(element, 'refresh');
      ImportEvents.dataImported(document.body);
      assert.isTrue(spy.called);
    });
  });

  describe('[dataDestroyHandler]()', () => {
    let element = /** @type RestApisPanelElement */(null);
    beforeEach(async () => {
      element = await noAutoFixture();
    });

    it('calls reset() when type matches', () => {
      const spy = sinon.spy(element, 'reset');
      ArcModelEvents.destroyed(document.body, 'api-index');
      assert.isTrue(spy.called);
    });

    it('calls reset() when type is "all"', () => {
      const spy = sinon.spy(element, 'reset');
      ArcModelEvents.destroyed(document.body, 'all');
      assert.isTrue(spy.called);
    });

    it('ignores other types', () => {
      const spy = sinon.spy(element, 'reset');
      ArcModelEvents.destroyed(document.body, 'project');
      assert.isFalse(spy.called);
    });
  });
});
