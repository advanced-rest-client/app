import { fixture, assert, html, nextFrame } from '@open-wc/testing';
import { ArcMock } from '@advanced-rest-client/arc-mock';
import { ArcModelEvents } from '@advanced-rest-client/events';
import '../../define/history-panel.js'
import * as internals from '../../src/elements/request/internals.js';

/** @typedef {import('../../').HistoryPanelElement} HistoryPanelElement */
/** @typedef {import('@advanced-rest-client/events').ArcRequest.ARCHistoryRequest} ARCHistoryRequest */
/** @typedef {import('@advanced-rest-client/events').ArcRequest.ARCSavedRequest} ARCSavedRequest */

describe('HistoryListMixin', () => {
  const generator = new ArcMock();

  /**
   * @returns {Promise<HistoryPanelElement>}
   */
  async function noAutoFixture() {
    return fixture(html`<history-panel noAuto></history-panel>`);
  }

  /**
   * @returns {Promise<HistoryPanelElement>}
   */
  async function roleFixture() {
    return fixture(html`<history-panel noAuto role="article"></history-panel>`);
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

  /**
   * @param {ARCHistoryRequest[]} requests
   * @returns {Promise<HistoryPanelElement>}
   */
  async function draggableRequestsFixture(requests) {
    const element = /** @type HistoryPanelElement */ (await fixture(html`<history-panel noAuto draggableEnabled></history-panel>`));
    element[internals.appendItems](requests);
    await nextFrame();
    return element;
  }

  describe('constructor()', () => {
    it('sets [exportKindValue]', async () => {
      const element = await noAutoFixture();
      assert.equal(element[internals.exportKindValue], 'ARC#HistoryExport');
    });
  });

  describe('connectedCallback()', () => {
    it('sets type property', async () => {
      const element = await noAutoFixture();
      assert.equal(element.type, 'history');
    });

    it('sets role attribute', async () => {
      const element = await noAutoFixture();
      assert.equal(element.getAttribute('role'), 'menu');
    });

    it('respects existing role', async () => {
      const element = await roleFixture();
      assert.equal(element.getAttribute('role'), 'article');
    });
  });

  describe('[appendItems]()', () => {
    let element = /** @type HistoryPanelElement */(null);
    beforeEach(async () => {
      element = await noAutoFixture();
    });

    it('does nothing when no argument', () => {
      element[internals.appendItems](undefined);
      assert.isUndefined(element.requests);
    });

    it('does nothing when empty array as the argument', () => {
      element[internals.appendItems]([]);
      assert.isUndefined(element.requests);
    });

    it('sets the requests property', () => {
      const items = /** @type ARCHistoryRequest[] */ (generator.http.listHistory());
      element[internals.appendItems](items);
      assert.typeOf(element.requests, 'array');
    });

    it('adds history group', () => {
      const item = /** @type ARCHistoryRequest */ (generator.http.history());
      element[internals.appendItems]([item]);
      const [group] = element.requests;
      assert.typeOf(group.day, 'object', 'day property is set');
      assert.typeOf(group.requests, 'array', 'requests property is set');
      assert.isTrue(group.opened, 'opened property is set');
    });

    it('adds newer item to an existing group', () => {
      const item = /** @type ARCHistoryRequest */ (generator.http.history());
      element[internals.appendItems]([item]);

      const copy = { ...item };
      copy.updated += 1000; // item created later then the previous
      element[internals.appendItems]([copy]);

      assert.lengthOf(element.requests, 1, 'has single group');
      const [group] = element.requests;
      assert.lengthOf(group.requests, 2, 'has 2 requests');
      assert.deepEqual(group.requests[0].item, copy, 'the request is inserted before previous');
    });

    it('adds older item to an existing group', () => {
      const item = /** @type ARCHistoryRequest */ (generator.http.history());
      element[internals.appendItems]([item]);

      const copy = { ...item };
      copy.updated -= 1000; // item created later then the previous
      element[internals.appendItems]([copy]);

      assert.lengthOf(element.requests, 1, 'has single group');
      const [group] = element.requests;
      assert.lengthOf(group.requests, 2, 'has 2 requests');
      assert.deepEqual(group.requests[1].item, copy, 'the request is inserted after previous');
    });

    it('adds newer group', () => {
      const item = /** @type ARCHistoryRequest */ (generator.http.history());
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      item.midnight = d.getTime();
      element[internals.appendItems]([item]);

      const copy = { ...item };
      copy.midnight = d.getTime() + 86400000;
      element[internals.appendItems]([copy]);

      assert.lengthOf(element.requests, 2, 'has 2 groups');
      const [group] = element.requests;
      assert.equal(group.day.midnight, copy.midnight, 'the group is inserted before the other');
    });

    it('adds older group', () => {
      const item = /** @type ARCHistoryRequest */ (generator.http.history());
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      item.midnight = d.getTime();
      element[internals.appendItems]([item]);

      const copy = { ...item };
      copy.midnight = d.getTime() - 86400000;
      element[internals.appendItems]([copy]);

      assert.lengthOf(element.requests, 2, 'has 2 groups');
      const group = element.requests[1];
      assert.equal(group.day.midnight, copy.midnight, 'the group is inserted before the other');
    });

    it('notifies resize when available', () => {
      let called = false;
      // @ts-ignore
      element.notifyResize = () => { called = true; };
      const item = /** @type ARCHistoryRequest */ (generator.http.history());
      element[internals.appendItems]([item]);
      assert.isTrue(called);
    });
  });

  describe('[requestChanged]()', () => {
    let element = /** @type HistoryPanelElement */(null);
    beforeEach(async () => {
      element = await noAutoFixture();
    });

    it('ignores the change when the type is not history', () => {
      const item = /** @type ARCHistoryRequest */ (generator.http.history());
      element[internals.appendItems]([item]);
      const copy = { ...item };
      copy.method = 'test';
      element.type = 'saved';
      ArcModelEvents.Request.State.update(document.body, 'history', {
        id: copy._id,
        rev: copy._rev,
        item: copy,
      });
      assert.notEqual(element.requests[0].requests[0].item.method, 'test');
    });

    it('ignores the changed is not history', () => {
      const item = /** @type ARCHistoryRequest */ (generator.http.history());
      element[internals.appendItems]([item]);
      const other = /** @type ARCSavedRequest */ (generator.http.saved());
      ArcModelEvents.Request.State.update(document.body, 'saved', {
        id: other._id,
        rev: other._rev,
        item: other,
      });
      assert.notDeepEqual(element.requests[0].requests[0].item, other);
    });

    it('adds the request to the empty list', () => {
      const item = generator.http.history();
      ArcModelEvents.Request.State.update(document.body, 'history', {
        id: item._id,
        rev: item._rev,
        item,
      });
      assert.lengthOf(element.requests, 1);
    });

    it('adds the request to the an existing list', () => {
      const item = /** @type ARCHistoryRequest */ (generator.http.history());
      element[internals.appendItems]([item]);
      const copy = { ...item };
      copy._id = 'test-id';
      ArcModelEvents.Request.State.update(document.body, 'history', {
        id: item._id,
        rev: item._rev,
        item: copy,
      });
      assert.lengthOf(element.requests[0].requests, 2);
    });

    it('updates the same request', () => {
      const item = /** @type ARCHistoryRequest */ (generator.http.history());
      element[internals.appendItems]([item]);
      const copy = { ...item };
      copy.method = 'test';
      ArcModelEvents.Request.State.update(document.body, 'history', {
        id: item._id,
        rev: item._rev,
        item: copy,
      });
      assert.equal(element.requests[0].requests[0].item.method, 'test');
    });
  });

  describe('[requestDeletedHandler]()', () => {
    let element = /** @type HistoryPanelElement */(null);
    beforeEach(async () => {
      element = await noAutoFixture();
    });

    it('does nothing when no requests', () => {
      // @ts-ignore
      element[internals.requestDeletedHandler]({});
      assert.isUndefined(element.requests);
    });

    it('does nothing when empty requests', () => {
      element.requests = [];
      // @ts-ignore
      element[internals.requestDeletedHandler]({});
      assert.deepEqual(element.requests, []);
    });

    it('removes a request from the list of requests', () => {
      const item = /** @type ARCHistoryRequest */ (generator.http.history());
      item._rev = 'test-rev';
      const copy = { ...item };
      copy._id = 'other';
      element[internals.appendItems]([item, copy]);
      ArcModelEvents.Request.State.delete(document.body, 'history', copy._id, copy._rev);
      assert.lengthOf(element.requests[0].requests, 1, 'has single request');
      assert.notEqual(element.requests[0].requests[0].item._id, 'other', 'the request has been removed');
    });

    it('removes the group when no more items', () => {
      const item = /** @type ARCHistoryRequest */ (generator.http.history());
      item._rev = 'test-rev';
      element[internals.appendItems]([item]);
      ArcModelEvents.Request.State.delete(document.body, 'history', item._id, item._rev);
      assert.lengthOf(element.requests, 0);
    });

    it('removes an item from the middle of the list', () => {
      const items = /** @type ARCHistoryRequest[] */ (generator.http.listHistory());
      element[internals.appendItems](items);
      const item = items[10];
      item._rev = 'test-rev';
      const id = item._id;
      ArcModelEvents.Request.State.delete(document.body, 'history', id, item._rev);
      element.requests.forEach((group) => {
        group.requests.forEach((i) => {
          assert.notEqual(i.item._id, id);
        });
      });
    });
  });

  describe('[toggleHistoryGroupHandler]()', () => {
    let element = /** @type HistoryPanelElement */(null);
    beforeEach(async () => {
      const items = /** @type ARCHistoryRequest[] */ (generator.http.listHistory());
      element = await requestsFixture(items);
    });

    it('toggles group opened state', () => {
      const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('.history-group anypoint-icon-button'));
      node.click();
      assert.isFalse(element.requests[0].opened);
    });

    it('ignores when the node has no data-index property', () => {
      const node = document.createElement('div');
      node.addEventListener('click', element[internals.toggleHistoryGroupHandler]);
      element.shadowRoot.appendChild(node);
      node.click();
    });
  });

  describe('[toggleHistoryGroupHandler]()', () => {
    let element = /** @type HistoryPanelElement */(null);
    beforeEach(async () => {
      const items = /** @type ARCHistoryRequest[] */ (generator.http.listHistory());
      element = await draggableRequestsFixture(items);
    });

    it('sets arc/history data', () => {
      const e = new DragEvent('dragstart', {
        dataTransfer: new DataTransfer(),
      });
      const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('.request-list-item'));
      node.dispatchEvent(e);
      assert.isTrue([...e.dataTransfer.types].includes('arc/history'));
    });

    it('ignores when draggableEnabled is not set', () => {
      const e = new DragEvent('dragstart', {
        dataTransfer: new DataTransfer(),
      });
      const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('.request-list-item'));
      element.draggableEnabled = false;
      node.dispatchEvent(e);
      assert.isFalse([...e.dataTransfer.types].includes('arc/history'));
    });
  });

  describe('[unavailableTemplate]()', () => {
    let element = /** @type HistoryPanelElement */(null);
    beforeEach(async () => {
      element = await noAutoFixture();
    });

    it('renders empty screen info', () => {
      const node = element.shadowRoot.querySelector('.list-empty');
      assert.ok(node);
    });

    it('has history list info message', () => {
      const node = element.shadowRoot.querySelector('.list-empty');
      const ps = node.querySelectorAll('p.empty-info');
      assert.lengthOf(ps, 2);
    });
  });
});
