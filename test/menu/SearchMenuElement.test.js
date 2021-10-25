/* eslint-disable arrow-body-style */
import { fixture, assert, nextFrame, html } from '@open-wc/testing';
import { ArcMock } from '@advanced-rest-client/arc-mock';
import { MockedStore, UrlIndexer, RequestModel, ProjectModel } from '@advanced-rest-client/idb-store';
import sinon from 'sinon';
import { ArcNavigationEventTypes } from '@advanced-rest-client/events';
import { commitValue } from '../../src/elements/menu/SearchMenuElement.js';
import '../../define/search-menu.js';

/** @typedef {import('../../').SearchMenuElement} SearchMenuElement */
/** @typedef {import('../../src/types').SavedSearchItem} SavedSearchItem */
/** @typedef {import('../../src/types').HistorySearchItem} HistorySearchItem */

describe('SavedMenuElement', () => {
  const generator = new ArcMock();
  const store = new MockedStore();
  const requestModel = new RequestModel();
  const projectModel = new ProjectModel();
  const indexer = new UrlIndexer(window);

  before(() => {
    requestModel.listen(window);
    projectModel.listen(window);
    indexer.listen();
  });

  after(() => {
    requestModel.unlisten(window);
    projectModel.unlisten(window);
    indexer.unlisten();
  });

  /**
   * @returns {Promise<SearchMenuElement>}
   */
  async function basicFixture() {
    return fixture(html`<search-menu></search-menu>`);
  }

  /**
   * @param {HistorySearchItem[] | SavedSearchItem[]} items
   * @returns {Promise<SearchMenuElement>}
   */
  async function filledListFixture(items) {
    return fixture(html`<search-menu .items="${items}" q="test" inSearch></search-menu>`);
  }

  /**
   * @returns {Promise<SearchMenuElement>}
   */
  async function modelFixture() {
    return fixture(html`<search-menu></search-menu>`);
  }

  describe('#noResults', () => {
    let element = /** @type SearchMenuElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
    });

    const items = [
      /** @type SavedSearchItem */ ({ kind: 'ARC#SavedSearchItem', item: { _id: 'test', method: 'GET', url: 'https:/domain.com', name: 'test' }, projects: [] }),
    ];

    it('returns true when no query results', () => {
      element.items = [];
      element.querying = false;
      element.inSearch = true;
      element[commitValue] = 'test';
      assert.isTrue(element.noResults);
    });

    it('returns false when has results', () => {
      element.items = items;
      element.querying = false;
      element.inSearch = true;
      element[commitValue] = 'test';
      assert.isFalse(element.noResults);
    });

    it('returns false when querying', () => {
      element.items = undefined;
      element.querying = true;
      element.inSearch = true;
      element[commitValue] = 'test';
      assert.isFalse(element.noResults);
    });

    it('returns false when not in search', () => {
      element.items = undefined;
      element.querying = false;
      element.inSearch = false;
      element[commitValue] = 'test';
      assert.isFalse(element.noResults);
    });

    it('returns false when has no [commitValue]', () => {
      element.items = undefined;
      element.querying = false;
      element.inSearch = true;
      element[commitValue] = '';
      assert.isFalse(element.noResults);
    });
  });

  describe('#hasResults', () => {
    let element = /** @type SearchMenuElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
    });

    const items = [
      /** @type SavedSearchItem */ ({ kind: 'ARC#SavedSearchItem', item: { _id: 'test', method: 'GET', url: 'https:/domain.com', name: 'test' }, projects: [] }),
    ];

    it('returns true when has results', () => {
      element.items = items;
      assert.isTrue(element.hasResults);
    });

    it('returns false when empty array', () => {
      element.items = [];
      assert.isFalse(element.hasResults);
    });

    it('returns false when no value', () => {
      element.items = undefined;
      assert.isFalse(element.hasResults);
    });
  });

  describe('Initial state', () => {
    let element = /** @type SearchMenuElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('renders the search input', () => {
      const node = element.shadowRoot.querySelector('.search-input');
      assert.ok(node);
    });

    it('does not render the results list', () => {
      const node = element.shadowRoot.querySelector('.list');
      assert.notOk(node);
    });

    it('does not render the no results info', () => {
      const node = element.shadowRoot.querySelector('.empty-info');
      assert.notOk(node);
    });

    it('does not render the no results info when has query input value', async () => {
      element.q = 'test';
      await nextFrame();
      const node = element.shadowRoot.querySelector('.empty-info');
      assert.notOk(node);
    });
  });

  describe('Results rendering', () => {
    let element = /** @type SearchMenuElement */ (null);
    const items = [];

    before(() => {
      const saved = /** @type SavedSearchItem */ ({ 
        kind: 'ARC#SavedSearchItem', 
        item: { 
          _id: 'test', 
          method: 'GET', 
          url: 'https:/domain.com', 
          name: 'test', 
          type: 'saved',
          projects: ['1'] ,
        }, 
        projects: [{ id: '1', label: 'project label' }] 
      });
      items.push(saved);
      const hItem = generator.http.history();
      const date = hItem.updated || hItem.created || Date.now();
      const d = new Date(date);
      const iso = d.toISOString();
      const history = /** @type HistorySearchItem */ ({ 
        kind: 'ARC#HistorySearchItem', 
        item: hItem, 
        isoTime: iso,
      });
      items.push(history);
    });

    beforeEach(async () => {
      element = await filledListFixture(items);
    });


    it('does not render the no results info', () => {
      const node = element.shadowRoot.querySelector('.empty-info');
      assert.notOk(node);
    });

    it('renders the results list', () => {
      const node = element.shadowRoot.querySelector('.list');
      assert.ok(node);
    });

    it('renders the history item', () => {
      const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('.request-list-item[data-type="history"]'));
      assert.equal(node.dataset.index, '1', 'has data-index');
      assert.equal(node.dataset.id, items[1].item._id, 'has data-id');
      const itemBody = /** @type HTMLElement */ (node.querySelector('anypoint-item-body'));
      assert.isTrue(itemBody.hasAttribute('twoLine'), 'has two line body');
      const pill = /** @type HTMLElement */ (itemBody.querySelector('.pill.type'));
      assert.ok(pill, 'has history type pill');
    });

    it('renders the saved item', () => {
      const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('.request-list-item[data-type="saved"]'));
      assert.equal(node.dataset.index, '0', 'has data-index');
      assert.equal(node.dataset.id, items[0].item._id, 'has data-id');
      const itemBody = /** @type HTMLElement */ (node.querySelector('anypoint-item-body'));
      assert.isTrue(itemBody.hasAttribute('twoLine'), 'has two line body');
      const pill = /** @type HTMLElement */ (itemBody.querySelector('.pill.type'));
      assert.ok(pill, 'has saved type pill');
      const namePill = /** @type HTMLElement */ (itemBody.querySelector('.pill.name'));
      assert.ok(namePill, 'has name pill');
      const projectPill = /** @type HTMLElement */ (itemBody.querySelector('.pill.project'));
      assert.ok(projectPill, 'has project name pill');
    });

    it('triggers navigation when item click', () => {
      const spy = sinon.spy();
      element.addEventListener(ArcNavigationEventTypes.navigateRequest, spy);
      const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('.request-list-item[data-type="saved"]'));
      node.click();
      assert.isTrue(spy.called);
    });
  });

  describe('querying for data', () => {
    let savedRequests;
    let historyRequests;
    before(async () => {
      const projects = await store.insertProjects(2);
      const insert = await store.insertSaved(undefined, undefined, {
        forceProject: true,
        projects,
      }, {
        autoRequestId: true,
      });
      savedRequests = insert.requests;
      const indexable = savedRequests.map((item) => {
        return {
          id: item._id,
          type: 'saved',
          url: item.url,
        };
      });
      await indexer.index(indexable);
      historyRequests = await store.insertHistory();
      const indexable2 = historyRequests.map((item) => {
        return {
          id: item._id,
          type: 'history',
          url: item.url,
        };
      });
      await indexer.index(indexable2);
    });

    after(async () => {
      await store.destroySaved();
      await store.destroyHistory();
    });

    let element = /** @type SearchMenuElement */ (null);
    beforeEach(async () => {
      element = await modelFixture();
    });

    it('queries for the saved data', async () => {
      const { url } = savedRequests[0];
      element.q = url;
      await element.query();
      assert.typeOf(element.items, 'array', 'has the results');
      const saved = /** @type SavedSearchItem */ (element.items[0]);
      const { projects } = saved;
      assert.typeOf(projects[0], 'object', 'has a project');
    });

    it('queries for the history data', async () => {
      const { url } = historyRequests[0];
      element.q = url;
      await element.query();
      assert.typeOf(element.items, 'array', 'has the results');
      const saved = /** @type HistorySearchItem */ (element.items[0]);
      const { isoTime } = saved;
      assert.typeOf(isoTime, 'string', 'has the isoTime');
    });
  });
});
