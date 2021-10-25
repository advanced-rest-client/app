import { fixture, assert, html, nextFrame, oneEvent } from '@open-wc/testing';
import { ArcMock } from '@advanced-rest-client/arc-mock';
import { ImportEvents, ArcModelEvents, ArcModelEventTypes } from '@advanced-rest-client/events';
import { RequestModel, ProjectModel, MockedStore } from '@advanced-rest-client/idb-store'
import sinon from 'sinon';
import '../../define/history-panel.js'
import * as internals from '../../src/elements/request/internals.js';

/** @typedef {import('../../').HistoryPanelElement} HistoryPanelElement */
/** @typedef {import('@advanced-rest-client/events').ArcRequest.ARCHistoryRequest} ARCHistoryRequest */
/** @typedef {import('@advanced-rest-client/events').ArcRequest.ARCSavedRequest} ARCSavedRequest */

describe('RequestsListMixin (history)', () => {
  const generator = new ArcMock();
  const store = new MockedStore();
  const projectModel = new ProjectModel();
  const requestModel = new RequestModel();

  before(() => {
    projectModel.listen(window);
    requestModel.listen(window);
  });

  after(() => {
    projectModel.unlisten(window);
    requestModel.unlisten(window);
  });

  /**
   * @returns {Promise<HistoryPanelElement>}
   */
  async function noAutoFixture() {
    return fixture(html`<history-panel noAuto></history-panel>`);
  }

  /**
   * @returns {Promise<HistoryPanelElement>}
   */
  async function afterQueryFixture() {
    const element = /** @type HistoryPanelElement */ (await fixture(html`<history-panel></history-panel>`));
    // the query could potentially start already
    if (!element.querying) {
      await oneEvent(element, 'queryingchange');
    }
    await oneEvent(element, 'queryingchange');
    return element;
  }

  /**
   * @param {ARCHistoryRequest[]} requests
   * @returns {Promise<HistoryPanelElement>}
   */
  async function requestsFixture(requests) {
    const element = /** @type HistoryPanelElement */ (await fixture(html`<history-panel noAuto></history-panel>`));
    element[internals.appendItems](requests);
    await nextFrame();
    return element;
  }

  // /**
  //  * @param {ARCHistoryRequest[]} requests
  //  * @returns {Promise<HistoryPanelElement>}
  //  */
  // async function draggableRequestsFixture(requests) {
  //   const element = /** @type HistoryPanelElement */ (await fixture(html`<history-panel noAuto draggableEnabled></history-panel>`));
  //   element[internals.appendItems](requests);
  //   await nextFrame();
  //   return element;
  // }

  /**
   * @param {ARCHistoryRequest[]=} requests
   * @returns {Promise<HistoryPanelElement>}
   */
  async function modelFixture(requests) {
    const elm = /** @type HistoryPanelElement */ (await fixture(`<history-panel noAuto></history-panel>`));
    if (requests) {
      elm[internals.appendItems](requests);
    }
    return elm;
  }

  describe('refresh()', () => {
    let element = /** @type HistoryPanelElement */(null);
    beforeEach(async () => {
      element = await noAutoFixture();
    });

    it('calls reset()', async () => {
      const spy = sinon.spy(element, 'reset');
      element.refresh();
      await oneEvent(element, 'queryingchange');
      await oneEvent(element, 'queryingchange');
      assert.isTrue(spy.called);
    });

    it('calls loadNext()', async () => {
      const spy = sinon.spy(element, 'loadNext');
      element.refresh();
      await oneEvent(element, 'queryingchange');
      await oneEvent(element, 'queryingchange');
      assert.isTrue(spy.called);
    });
  });

  describe('reset()', () => {
    let element = /** @type HistoryPanelElement */(null);
    beforeEach(async () => {
      element = await noAutoFixture();
    });

    it('resets [pageTokenValue]', () => {
      element[internals.pageTokenValue] = 'test';
      element.reset();
      assert.isUndefined(element[internals.pageTokenValue]);
    });

    it('resets requests', () => {
      element.requests = [];
      element.reset();
      assert.isUndefined(element.requests);
    });

    it('resets isSearch', () => {
      element.isSearch = true;
      element.reset();
      assert.isFalse(element.isSearch);
    });

    it('resets [queryingProperty]', () => {
      element[internals.queryingProperty] = true;
      element.reset();
      assert.isFalse(element[internals.queryingProperty]);
    });

    it('resets [selectedItemsValue]', () => {
      element[internals.selectedItemsValue] = ['a'];
      element.reset();
      assert.deepEqual(element[internals.selectedItemsValue], []);
    });
  });

  describe('loadNext()', () => {
    let element = /** @type HistoryPanelElement */(null);
    beforeEach(async () => {
      element = await noAutoFixture();
    });

    it('eventually calls [loadPage]()', async () => {
      // @ts-ignore
      const spy = sinon.spy(element, internals.loadPage);
      element.loadNext();
      await oneEvent(element, 'queryingchange');
      await oneEvent(element, 'queryingchange');
      assert.isTrue(spy.called);
    });

    it('sets [makingQueryValue] flag', async () => {
      element.loadNext();
      assert.isTrue(element[internals.makingQueryValue]);
      await oneEvent(element, 'queryingchange');
      await oneEvent(element, 'queryingchange');
    });

    it('clears [makingQueryValue] flag after callback', async () => {
      element.loadNext();
      await oneEvent(element, 'queryingchange');
      await oneEvent(element, 'queryingchange');
      assert.isFalse(element[internals.makingQueryValue]);
    });

    it('does nothing when [makingQueryValue] flag is set', async () => {
      let called = false;
      element[internals.loadPage] = async () => { called = true };
      element[internals.makingQueryValue] = true;
      element.loadNext();
      assert.isFalse(called);
    });

    it('do nothing when isSearch flag is set', async () => {
      let called = false;
      element[internals.loadPage] = async () => { called = true };
      element.isSearch = true;
      element.loadNext();
      assert.isFalse(called);
    });
  });

  describe('query()', () => {
    before(async () => {
      await store.insertHistory();
    });

    after(async () => {
      await store.destroyHistory();
    });

    let element = /** @type HistoryPanelElement */(null);
    beforeEach(async () => {
      element = await afterQueryFixture();
    });

    it('does nothing when query is not set', async () => {
      const p = element.query(undefined);
      assert.isFalse(element.querying);
      await p;
    });

    it('returns a promise when query is not set', async () => {
      const p = element.query(undefined);
      assert.typeOf(p.then, 'function');
      await p;
    });

    it('returns promise when query is not set and isSearch', async () => {
      element.isSearch = true;
      const p = element.query(undefined);
      assert.typeOf(p.then, 'function');
      await p;
    });

    it('calls refresh() when query is not set and isSearch', async () => {
      element.isSearch = true;
      let called = false;
      element.refresh = () => { called = true };
      const p = element.query(undefined);
      assert.isTrue(called);
      await p;
    });

    it('sets querying property', async () => {
      const p = element.query('test');
      assert.isTrue(element.querying);
      await p;
    });

    it('resets querying when ready', async () => {
      await element.query('test');
      assert.isFalse(element.querying);
    });

    it('passes "detailedSearch" to the event', async () => {
      const spy = sinon.spy();
      element.addEventListener(ArcModelEventTypes.Request.query, spy);
      element.detailedSearch = true;
      await element.query('test');
      assert.isTrue(spy.args[0][0].detailed);
    });

    it('passes query term to the event', async () => {
      const spy = sinon.spy();
      element.addEventListener(ArcModelEventTypes.Request.query, spy);
      element.detailedSearch = true;
      await element.query('test-query');
      assert.equal(spy.args[0][0].term, 'test-query');
    });

    it('searches history store', async () => {
      const spy = sinon.spy();
      element.addEventListener(ArcModelEventTypes.Request.query, spy);
      element.detailedSearch = true;
      await element.query('test-query');
      assert.equal(spy.args[0][0].requestType, 'history');
    });

    it('resets [queryingProperty] after error', async () => {
      element.addEventListener(ArcModelEventTypes.Request.query, (e) => {
        // @ts-ignore
        e.detail.result = Promise.reject(new Error('test'));
      });
      try {
        await element.query('test-query');
      } catch (e) {
        // ...
      }
      assert.isFalse(element.querying);
    });
  });

  describe('[updateListStyles]()', () => {
    let element = /** @type HistoryPanelElement */(null);
    beforeEach(async () => {
      const data = generator.http.listHistory(2);
      element = await requestsFixture(data);
    });

    it('Calls [applyListStyles]() for default type', () => {
      const spy = sinon.spy(element, internals.applyListStyles);
      element[internals.updateListStyles]('default');
      assert.equal(spy.args[0][0], 72);
    });

    it('Calls [applyListStyles]() for comfortable type', () => {
      const spy = sinon.spy(element, internals.applyListStyles);
      element[internals.updateListStyles]('comfortable');
      assert.equal(spy.args[0][0], 48);
    });

    it('Calls [applyListStyles]() for compact type', () => {
      const spy = sinon.spy(element, internals.applyListStyles);
      element[internals.updateListStyles]('compact');
      assert.equal(spy.args[0][0], 36);
    });
  });

  describe('[applyListStyles]()', () => {
    let element = /** @type HistoryPanelElement */(null);
    beforeEach(async () => {
      element = await noAutoFixture();
    });

    it('sets css variable value on self', () => {
      element[internals.applyListStyles](10);
      assert.equal(element.style.getPropertyValue('--anypoint-item-icon-width'), '10px');
    });

    it('sets css variable value on passed element', () => {
      const target = document.createElement('div');
      element[internals.applyListStyles](10, target);
      assert.equal(target.style.getPropertyValue('--anypoint-item-icon-width'), '10px');
    });

    it('notifies resize when available', () => {
      let called = false;
      // @ts-ignore
      element.notifyResize = () => { called = true; };
      element[internals.applyListStyles](10);
      assert.isTrue(called);
    });
  });

  describe('[dataDestroyHandler]()', () => {
    let element = /** @type HistoryPanelElement */(null);
    beforeEach(async () => {
      element = await noAutoFixture();
    });

    it('calls reset() when type matches', () => {
      const spy = sinon.spy(element, 'reset');
      ArcModelEvents.destroyed(document.body, 'history');
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

  describe('[refresh]()', () => {
    let element = /** @type HistoryPanelElement */(null);
    beforeEach(async () => {
      element = await noAutoFixture();
    });

    it('calls refresh() when type matches', async () => {
      const spy = sinon.spy(element, 'refresh');
      ImportEvents.dataImported(document.body);
      await oneEvent(element, 'queryingchange');
      await oneEvent(element, 'queryingchange');
      assert.isTrue(spy.called);
    });
  });

  describe('[requestChangedHandler]()', () => {
    let element = /** @type HistoryPanelElement */(null);
    beforeEach(async () => {
      const data = generator.http.listHistory(2);
      element = await modelFixture(data);
    });

    it('calls [requestChanged]()', async () => {
      const spy = sinon.spy(element, internals.requestChanged);
      const { item } = element.requests[0].requests[0];
      item._rev = 'test-rev';
      ArcModelEvents.Request.State.update(document.body, 'history', {
        id: item._id,
        rev: item._rev,
        item
      });
      await nextFrame();
      assert.isTrue(spy.called);
    });

    it('does not call [projectRequestChanged]() for a project type when a history item', async () => {
      element.type = 'project';
      const spy = sinon.spy(element, internals.projectRequestChanged);
      const { item } = element.requests[0].requests[0];
      item._rev = 'test-rev';
      ArcModelEvents.Request.State.update(document.body, 'history', {
        id: item._id,
        rev: item._rev,
        item
      });
      await nextFrame();
      assert.isFalse(spy.called);
    });
  });
});
