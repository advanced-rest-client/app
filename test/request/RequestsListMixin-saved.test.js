/* eslint-disable no-undef */
/* eslint-disable no-param-reassign */
import { fixture, assert, html, nextFrame, oneEvent } from '@open-wc/testing';
import { ArcMock } from '@advanced-rest-client/arc-mock';
import { ArcNavigationEventTypes, ArcModelEvents, ArcModelEventTypes } from '@advanced-rest-client/events';
import { RequestModel, ProjectModel, MockedStore } from '@advanced-rest-client/idb-store'
import sinon from 'sinon';
import '../../define/saved-panel.js'
import * as internals from '../../src/elements/request/internals.js';
import 'pouchdb/dist/pouchdb.js'

/** @typedef {import('../../').SavedPanelElement} SavedPanelElement */
/** @typedef {import('@advanced-rest-client/events').ArcRequest.ARCHistoryRequest} ARCHistoryRequest */
/** @typedef {import('@advanced-rest-client/events').ArcRequest.ARCSavedRequest} ARCSavedRequest */
/** @typedef {import('lit-html').TemplateResult} TemplateResult */

describe('RequestsListMixin (saved)', () => {
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
   * @returns {TemplateResult}
   */
  function modelTemplate() {
    return html`<saved-panel></saved-panel>`;
  }

  /**
   * @returns {Promise<SavedPanelElement>}
   */
  async function noAutoFixture() {
    return fixture(html`<saved-panel noAuto></saved-panel>`);
  }

  /**
   * @returns {Promise<SavedPanelElement>}
   */
  async function afterQueryFixture() {
    const element = /** @type SavedPanelElement */ (await fixture(modelTemplate()));
    // the query could potentially start already
    if (!element.querying) {
      await oneEvent(element, 'queryingchange');
    }
    await oneEvent(element, 'queryingchange');
    return element;
  }

  /**
   * @returns {Promise<SavedPanelElement>}
   */
  async function queryLimitFixture() {
    const element = await noAutoFixture();
    element.pageLimit = 10;
    return element;
  }

  /**
   * @returns {Promise<SavedPanelElement>}
   */
  async function afterProjectQueryFixture() {
    const element = /** @type SavedPanelElement */ (await fixture(modelTemplate()));
    await oneEvent(element, 'projectschange');
    return element;
  }

  function projectDb() {
    // @ts-ignore
    return new PouchDB('legacy-projects');
  }

  describe('#hasRequests', () => {
    let element = /** @type SavedPanelElement */(null);
    beforeEach(async () => {
      element = await noAutoFixture();
    });

    it('returns false when no requests', () => {
      assert.isFalse(element.hasRequests);
    });

    it('returns true when has requests', () => {
      element.requests = generator.http.listSaved(2);
      assert.isTrue(element.hasRequests);
    });
  });

  describe('#listType', () => {
    let element = /** @type SavedPanelElement */(null);
    beforeEach(async () => {
      element = await noAutoFixture();
    });

    it('returns set value', () => {
      element.listType = 'default';
      assert.equal(element.listType, 'default');
    });

    it('computes [hasTwoLinesValue]', () => {
      element.listType = 'default';
      assert.isTrue(element[internals.hasTwoLinesValue]);
    });

    it('updates styles', () => {
      element.listType = 'compact';
      assert.equal(element.style.getPropertyValue('--anypoint-item-icon-width'), '36px');
    });
  });

  describe('#selectedItems', () => {
    let element = /** @type SavedPanelElement */(null);
    beforeEach(async () => {
      element = await noAutoFixture();
    });

    it('returns null when not selectable', () => {
      element.selectable = false;
      assert.equal(element.selectedItems, null);
    });

    it('returns empty array when no selection', () => {
      element.selectable = true;
      assert.deepEqual(element.selectedItems, []);
    });

    it('returns selected items', async () => {
      element.selectable = true;
      element.requests = generator.http.listSaved();
      await nextFrame();
      const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('.request-list-item'));
      node.click();
      assert.deepEqual(element.selectedItems, [element.requests[0]._id]);
    });

    it('sets selected items', () => {
      element.selectable = true;
      const arr = ['a', 'b'];
      element.selectedItems = arr;
      assert.deepEqual(element.selectedItems, arr);
    });

    it('sets selected items only once', () => {
      element.selectable = true;
      const arr = ['a', 'b'];
      element.selectedItems = arr;
      const spy = sinon.spy(element, 'requestUpdate');
      element.selectedItems = arr;
      assert.isFalse(spy.called);
    });
  });

  describe('#selectable', () => {
    let element = /** @type SavedPanelElement */(null);
    beforeEach(async () => {
      element = await noAutoFixture();
    });

    it('returns set value', () => {
      element.selectable = false;
      assert.isFalse(element.selectable);
    });

    it('sets value only once', () => {
      element.selectable = true;
      const spy = sinon.spy(element, 'requestUpdate');
      element.selectable = true;
      assert.isFalse(spy.called);
    });

    it('clears selected items', () => {
      element.selectable = false;
      element.selectedItems = ['test'];
      element.selectable = true;
      assert.deepEqual(element.selectedItems, []);
    });
  });

  describe('[projectChangeHandler]()', () => {
    before(async () => {
      await store.insertProjects(20, {
        autoRequestId: true,
      });
    });

    after(async () => {
      await store.destroySaved();
    });

    let element = /** @type SavedPanelElement */(null);
    beforeEach(async () => {
      element = await afterProjectQueryFixture();
      const [project] = element.projects;
      element.project = project;
      element.type = 'project';
    });

    it('updates the project', () => {
      const item = { ...element.project };
      item.name = 'other-name';
      ArcModelEvents.Project.State.update(document.body, {
        id: item._id,
        rev: item._rev,
        item,
      });
      assert.equal(element.project.name, 'other-name');
    });

    it('calls [updateProjectOrder]() with an argument', () => {
      const item = { ...element.project };
      item.name = 'other-name';
      const spy = sinon.spy(element, internals.updateProjectOrder);
      ArcModelEvents.Project.State.update(document.body, {
        id: item._id,
        rev: item._rev,
        item,
      });
      assert.deepEqual(spy.args[0][0], item);
    });

    it('ignores event when type is not project', () => {
      const item = { ...element.project };
      item.name = 'other-name';
      element.type = 'saved';
      ArcModelEvents.Project.State.update(document.body, {
        id: item._id,
        rev: item._rev,
        item,
      });
      assert.notEqual(element.project.name, 'other-name');
    });

    it('ignores event when project is not set', () => {
      const item = { ...element.project };
      item.name = 'other-name';
      element.project = undefined;
      ArcModelEvents.Project.State.update(document.body, {
        id: item._id,
        rev: item._rev,
        item,
      });
      assert.isUndefined(element.project);
    });

    it('does not set project if different id', () => {
      const item = { ...element.project };
      item._id = 'other-id';
      ArcModelEvents.Project.State.update(document.body, {
        id: item._id,
        rev: item._rev,
        item,
      });
      assert.notEqual(element.project._id, 'other-id');
    });

    it('reads project data when missing on the event', (done) => {
      const item = { ...element.project };
      element[internals.updateProjectOrder] = (project) => {
        assert.equal(project._id, item._id);
        done();
        return true;
      };
      ArcModelEvents.Project.State.update(document.body, {
        id: item._id,
        rev: item._rev,
      });
    });
  });

  describe('[updateProjectOrder]()', () => {
    function setupRequests(element) {
      const requests = [];
      for (let i = 0; i < 5; i++) {
        const request = generator.http.saved();
        request.projects = [element.project._id];
        element.project.requests.push(request._id);
        requests.push(request);
      }
      element.requests = requests;
    }

    let element = /** @type SavedPanelElement */(null);
    beforeEach(async () => {
      element = await noAutoFixture();
      element.project = generator.http.project();
      element.type = 'project';
      element.project.requests = [];
      setupRequests(element);
    });

    it('Ignores call when no requests', () => {
      element.requests = undefined;
      const result = element[internals.updateProjectOrder](element.project);
      assert.isFalse(result);
    });

    it('Ignores call when no requests on project', () => {
      element.project.requests = undefined;
      const result = element[internals.updateProjectOrder](element.project);
      assert.isFalse(result);
    });

    it('Ignores call when requests lists are different size', () => {
      element.project.requests.splice(0, 1);
      const result = element[internals.updateProjectOrder](element.project);
      assert.isFalse(result);
    });

    it('Ignores call when request cannot be find', () => {
      element.project.requests[0] = 'test-id';
      const result = element[internals.updateProjectOrder](element.project);
      assert.isFalse(result);
    });

    it('Ignores call when request are equal', () => {
      const result = element[internals.updateProjectOrder](element.project);
      assert.isFalse(result);
    });

    it('Updates list position', () => {
      const removed = element.project.requests.splice(0, 1);
      element.project.requests.splice(2, 0, removed[0]);
      const result = element[internals.updateProjectOrder](element.project);
      assert.isTrue(result);
    });
  });

  describe('[persistRequestsOrder]()', () => {
    let project;
    let requests;
    before(async () => {
      const result = await store.insertSaved(3, 1, { forceProject: true });
      requests = result.requests;
      [project] = result.projects;
    });
    
    after(async () => {
      await store.destroySaved();
    });
    
    let element = /** @type SavedPanelElement */(null);
    beforeEach(async () => {
      element = await noAutoFixture();
      element.project = project;
      element.requests = requests;
      await nextFrame();
    });

    it('does not persist if order is the same', async () => {
      await element[internals.persistRequestsOrder]();
      // change makes a copy of the object
      assert.isTrue(element.project === project);
    });

    it('throws an error when no project', async () => {
      element.project = undefined;
      let thrown = false;
      try {
        await element[internals.persistRequestsOrder]();
      } catch (_) {
        thrown = true;
      }
      assert.isTrue(thrown);
    });

    it('persists the order', async () => {
      const items = element.requests;
      const item = items.splice(0, 1);
      items.push(item[0]);
      const newOrder = items.map((i) => i._id);
      await element[internals.persistRequestsOrder]();
      const db = projectDb();
      const dbProject = await db.get(project._id);
      assert.deepEqual(dbProject.requests, newOrder);
    });
  });

  describe('readProjectRequests()', () => {
    let project;
    let requests;
    before(async () => {
      const result = await store.insertSaved(3, 1, {
        forceProject: true,
      });
      requests = result.requests;
      [project] = result.projects;
    });

    after(async () => {
      await store.destroySaved();
    });

    let element = /** @type SavedPanelElement */(null);
    beforeEach(async () => {
      element = await noAutoFixture();
    });


    it('reads project data when project is not set', async () => {
      const result = await element[internals.readProjectRequests](project._id);
      assert.deepEqual(result, requests.map((r) => { 
        const copy = {...r}; 
        delete copy.payload; 
        return copy; 
      }));
      assert.deepEqual(element.project, project);
    });

    it('reads project data when project is set', async () => {
      element.project = project;
      const result = await element[internals.readProjectRequests](project._id);
      assert.deepEqual(result, requests.map((r) => { 
        const copy = {...r}; 
        delete copy.payload; 
        return copy; 
      }));
    });
  });

  describe('[projectRequestChanged]()', () => {
    let element = /** @type SavedPanelElement */(null);
    const projectId = 'test-project';
    beforeEach(async () => {
      element = await noAutoFixture();
      element.type = 'project';
      element.projectId = projectId;
      const requests = generator.http.listSaved(10);
      requests.forEach((item) => { item.projects = [projectId]; });
      element.requests = requests;
    });

    function genProjectItem() {
      const item = generator.http.saved();
      // @ts-ignore
      item._rev = 'test';
      item.projects = [projectId];
      return /** @type ARCSavedRequest */ (item);
    }

    it('does nothing when no project id', () => {
      element.projectId = undefined;
      const item = genProjectItem();
      element[internals.projectRequestChanged](item);
      assert.lengthOf(element.requests, 10);
    });

    it('creates requests array', () => {
      element.requests = undefined;
      const item = genProjectItem();
      ArcModelEvents.Request.State.update(document.body, 'saved', {
        id: item._id,
        rev: item._rev,
        item
      });
      assert.lengthOf(element.requests, 1);
    });

    it('ignores item if not related to the project and no requests', () => {
      element.requests = undefined;
      const item = genProjectItem();
      item.projects = ['other'];
      ArcModelEvents.Request.State.update(document.body, 'saved', {
        id: item._id,
        rev: item._rev,
        item
      });
      assert.deepEqual(element.requests, []);
    });

    it('adds new item to requests array', () => {
      const item = genProjectItem();
      ArcModelEvents.Request.State.update(document.body, 'saved', {
        id: item._id,
        rev: item._rev,
        item
      });
      assert.lengthOf(element.requests, 11);
    });

    it('adds new item to requests array at position', () => {
      const item = genProjectItem();
      const project = generator.http.project();
      project._id = projectId;
      project.requests = element.requests.map((it) => it._id);
      project.requests.splice(1, 0, item._id);
      element.project = project;
      ArcModelEvents.Request.State.update(document.body, 'saved', {
        id: item._id,
        rev: item._rev,
        item
      });
      assert.lengthOf(element.requests, 11);
      assert.deepEqual(element.requests[1], item);
    });

    it('updates existing item', () => {
      const item = { ...element.requests[2] };
      item.name = 'test-name';
      ArcModelEvents.Request.State.update(document.body, 'saved', {
        id: item._id,
        rev: item._rev,
        item
      });
      assert.lengthOf(element.requests, 10);
      assert.equal(element.requests[2].name, 'test-name');
    });

    it('removes item when no longer related to project', () => {
      const item = { ...element.requests[2] };
      item.projects = undefined;
      // @ts-ignore
      item.legacyProject = undefined;
      ArcModelEvents.Request.State.update(document.body, 'saved', {
        id: item._id,
        rev: item._rev,
        item
      });
      assert.lengthOf(element.requests, 9);
    });

    it('ignores item not related to the project', () => {
      const item = genProjectItem();
      item.projects = ['non-existing-id'];
      ArcModelEvents.Request.State.update(document.body, 'saved', {
        id: item._id,
        rev: item._rev,
        item
      });
      assert.lengthOf(element.requests, 10);
    });
  });

  describe('[requestChangedHandler]()', () => {
    let element = /** @type SavedPanelElement */(null);
    beforeEach(async () => {
      const data = generator.http.listSaved(2);
      element = await noAutoFixture();
      element.requests = data;
      await nextFrame();
    });

    it('removes a request from the list', () => {
      const [item] = element.requests;
      ArcModelEvents.Request.State.delete(document.body, 'saved', item._id, 'test');
      const hasRequest = element.requests.some((i) => i._id === item._id);
      assert.isFalse(hasRequest);
      assert.lengthOf(element.requests, 1);
    });

    it('ignores unknown request', () => {
      ArcModelEvents.Request.State.delete(document.body, 'saved', 'test', 'test');
      assert.lengthOf(element.requests, 2);
    });

    it('ignores when no requests', () => {
      element.requests = undefined;
      ArcModelEvents.Request.State.delete(document.body, 'saved', 'test', 'test');
    });
  });

  describe('[requestChangedHandler]()', () => {
    let element = /** @type SavedPanelElement */(null);
    beforeEach(async () => {
      element = await noAutoFixture();
      element.requests = generator.http.listSaved(10);
    });

    it('calls [requestChanged]()', async () => {
      const spy = sinon.spy(element, internals.requestChanged);
      const [item] = element.requests;
      item._rev = 'test-rev';
      ArcModelEvents.Request.State.update(document.body, 'saved', {
        id: item._id,
        rev: item._rev,
        item
      });
      await nextFrame();
      assert.isTrue(spy.called);
    });

    it('calls [projectRequestChanged]() for the project type and saved item', async () => {
      element.type = 'project';
      const spy = sinon.spy(element, internals.projectRequestChanged);
      const [item] = element.requests;
      item._rev = 'test-rev';
      ArcModelEvents.Request.State.update(document.body, 'saved', {
        id: item._id,
        rev: item._rev,
        item
      });
      await nextFrame();
      assert.isTrue(spy.called);
    });
  });

  describe('[requestChangedHandler]() with data store', () => {
    before(async () => {
      await store.insertSaved(10, 1);
    });
    
    after(async () => {
      await store.destroySaved();
    });

    let element = /** @type SavedPanelElement */(null);
    beforeEach(async () => {
      element = await afterQueryFixture();
    });

    it('reads the request data when missing on event', (done) => {
      const [item] = element.requests;
      element[internals.requestChanged] = (request) => {
        assert.equal(request._id, item._id);
        done();
      };
      item._rev = 'test-rev';
      ArcModelEvents.Request.State.update(document.body, 'saved', {
        id: item._id,
        rev: item._rev,
      });
    });
  });

  describe('[requestChanged]()', () => {
    let element = /** @type SavedPanelElement */(null);
    beforeEach(async () => {
      element = await noAutoFixture();
      element.requests = generator.http.listSaved(10);
    });

    it('adds new request to empty list', () => {
      element.requests = undefined;
      const item = generator.http.saved();
      element[internals.requestChanged](item);
      assert.lengthOf(element.requests, 1);
    });

    it('adds new request existing list', () => {
      const item = generator.http.saved();
      element[internals.requestChanged](item);
      assert.lengthOf(element.requests, 11);
    });

    it('updates the request', () => {
      const item = { ...element.requests[0] };
      item.name = 'test';
      element[internals.requestChanged](item);
      assert.lengthOf(element.requests, 10);
      assert.equal(element.requests[0].name, 'test');
    });
  });

  describe('[readType]()', () => {
    let element = /** @type SavedPanelElement */(null);
    beforeEach(async () => {
      element = await noAutoFixture();
    });

    it('returns history for history', () => {
      element.type = 'history';
      const result = element[internals.readType]();
      assert.equal(result, 'history');
    });

    it('returns saved for saved', () => {
      element.type = 'saved';
      const result = element[internals.readType]();
      assert.equal(result, 'saved');
    });

    it('returns saved for project', () => {
      element.type = 'project';
      const result = element[internals.readType]();
      assert.equal(result, 'saved');
    });
  });

  describe('content rendering', () => {
    describe('selectable mode', () => {
      before(async () => {
        await store.insertSaved(10);
      });
      
      after(async () => {
        await store.destroySaved();
      });

      let element = /** @type SavedPanelElement */(null);
      beforeEach(async () => {
        element = await afterQueryFixture();
      });

      it('does not render selection controls when not selectable', async () => {
        element.selectable = false;
        await nextFrame();
        const node = element.shadowRoot.querySelector('.request-list-item anypoint-checkbox');
        assert.notOk(node);
      });

      it('opens request on an item click', async () => {
        element.selectable = false;
        await nextFrame();
        const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('.request-list-item'));
        const spy = sinon.spy();
        element.addEventListener(ArcNavigationEventTypes.navigateRequest, spy);
        node.click();
        assert.isTrue(spy.called);
      });

      it('selects an item', () => {
        const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('.request-list-item'));
        node.click();
        assert.deepEqual(element.selectedItems, [element.requests[0]._id]);
      });

      it('deselects an item', () => {
        element.selectedItems = [element.requests[0]._id];
        const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('.request-list-item'));
        node.click();
        assert.deepEqual(element.selectedItems, []);
      });

      it('does not opens request when selecting an item', () => {
        const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('.request-list-item'));
        const spy = sinon.spy();
        element.addEventListener(ArcNavigationEventTypes.navigateRequest, spy);
        node.click();
        assert.isFalse(spy.called);
      });
    });

    describe('listActions mode', () => {
      before(async () => {
        await store.insertSaved(10);
      });
      
      after(async () => {
        await store.destroySaved();
      });

      let element = /** @type SavedPanelElement */(null);
      beforeEach(async () => {
        element = await afterQueryFixture();
      });

      it('does not render list actions', async () => {
        element.listActions = false;
        await nextFrame();
        const node = element.shadowRoot.querySelector('.request-list-item anypoint-button');
        assert.notOk(node);
      });

      it('renders "details" list action', () => {
        const node = element.shadowRoot.querySelector('.request-list-item anypoint-button[data-action="item-detail"]');
        assert.ok(node);
      });

      it('"details" button click does not select the request', () => {
        const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('.request-list-item anypoint-button[data-action="item-detail"]'));
        node.click();
        assert.deepEqual(element.selectedItems, []);
      });

      it('"details" button dispatches the details event', () => {
        const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('.request-list-item anypoint-button[data-action="item-detail"]'));
        const spy = sinon.spy();
        element.addEventListener(ArcNavigationEventTypes.navigateRequest, spy);
        node.click();
        assert.isTrue(spy.called, 'the event is dispatched');
        const { action } = spy.args[0][0];
        assert.equal(action, 'detail', 'has the detail action');
      });

      it('renders "open" list action', () => {
        const node = element.shadowRoot.querySelector('.request-list-item anypoint-button[data-action="open-item"]');
        assert.ok(node);
      });

      it('"open" button click does not select the request', () => {
        const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('.request-list-item anypoint-button[data-action="open-item"]'));
        node.click();
        assert.deepEqual(element.selectedItems, []);
      });

      it('"open" button dispatches the request open event', () => {
        const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('.request-list-item anypoint-button[data-action="open-item"]'));
        const spy = sinon.spy();
        element.addEventListener(ArcNavigationEventTypes.navigateRequest, spy);
        node.click();
        assert.isTrue(spy.called);
        const { action } = spy.args[0][0];
        assert.equal(action, 'open', 'has the detail action');
      });
    });
  });

  describe('[dragStartHandler]()', () => {
    let element = /** @type SavedPanelElement */(null);
    beforeEach(async () => {
      const data = /** @type ARCSavedRequest[] */ (generator.http.listSaved(2));
      element = await noAutoFixture();
      element.requests = data;
      element.draggableEnabled = true;
      await nextFrame();
    });

    it('does nothing when draggable is not enabled', () => {
      element.draggableEnabled = false;
      const e = new DragEvent('dragstart', {
        dataTransfer: new DataTransfer(),
      });
      const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('.request-list-item'));
      node.dispatchEvent(e);
      const result = [...e.dataTransfer.types];
      assert.deepEqual(result, []);
    });

    it('adds arc/id data', () => {
      const e = new DragEvent('dragstart', {
        dataTransfer: new DataTransfer(),
      });
      const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('.request-list-item'));
      node.dispatchEvent(e);
      const id = e.dataTransfer.getData('arc/id');
      assert.equal(id, element.requests[0]._id);
    });

    it('adds arc/type data', () => {
      const e = new DragEvent('dragstart', {
        dataTransfer: new DataTransfer(),
      });
      const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('.request-list-item'));
      node.dispatchEvent(e);
      const id = e.dataTransfer.getData('arc/type');
      assert.equal(id, 'saved');
    });

    it('adds arc/request data', () => {
      const e = new DragEvent('dragstart', {
        dataTransfer: new DataTransfer(),
      });
      const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('.request-list-item'));
      node.dispatchEvent(e);
      const id = e.dataTransfer.getData('arc/request');
      assert.equal(id, '1');
    });

    it('adds arc/source data', () => {
      const e = new DragEvent('dragstart', {
        dataTransfer: new DataTransfer(),
      });
      const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('.request-list-item'));
      node.dispatchEvent(e);
      const id = e.dataTransfer.getData('arc/source');
      assert.equal(id, 'saved-panel');
    });
  });

  describe('[prepareQuery]()', () => {
    let element = /** @type SavedPanelElement */(null);
    beforeEach(async () => {
      element = await noAutoFixture();
    });

    it('returns a string value', () => {
      // @ts-ignore
      const result = element[internals.prepareQuery](2);
      assert.equal(result, '2');
    });

    it('returns lower case value', () => {
      const result = element[internals.prepareQuery]('AaBb');
      assert.equal(result, 'aabb');
    });

    it('removes first "_" character', () => {
      const result = element[internals.prepareQuery]('_design');
      assert.equal(result, 'design');
    });
  });

  describe('[loadPage]()', () => {
    before(async () => {
      await store.insertSaved(40, 1);
    });
    
    after(async () => {
      await store.destroySaved();
    });

    let element = /** @type SavedPanelElement */(null);
    beforeEach(async () => {
      element = await queryLimitFixture();
    });

    it('ignores when searching for an item', async () => {
      element.isSearch = true;
      await nextFrame();
      await element[internals.loadPage]();
      assert.isUndefined(element.requests);
    });

    it('ignores when querying', async () => {
      element[internals.queryingProperty] = true;
      await nextFrame();
      await element[internals.loadPage]();
      assert.isUndefined(element.requests);
    });

    it('adds items to the list of requests', async () => {
      await element[internals.loadPage]();
      assert.lengthOf(element.requests, element.pageLimit);
    });

    it('sets page token value', async () => {
      await element[internals.loadPage]();
      assert.typeOf(element[internals.pageTokenValue], 'string');
    });

    it('reuses page token with the next query', async () => {
      await element[internals.loadPage]();
      await element[internals.loadPage]();
      assert.lengthOf(element.requests, element.pageLimit * 2);
    });

    it('sets a new page token after next query', async () => {
      await element[internals.loadPage]();
      const old = element[internals.pageTokenValue];
      await element[internals.loadPage]();
      assert.notEqual(element[internals.pageTokenValue], old);
    });

    it('sets querying property', async () => {
      const p = element[internals.loadPage]();
      assert.isTrue(element.querying);
      await p;
    });

    it('resets querying property after the query', async () => {
      await element[internals.loadPage]();
      assert.isFalse(element.querying);
    });

    it('resets querying property after an error', async () => {
      element.addEventListener(ArcModelEventTypes.Request.list, (e) => {
        e.preventDefault();
        e.stopPropagation();
        // @ts-ignore
        e.detail.result = Promise.reject(new Error('test'));
      });
      try {
        await element[internals.loadPage]();
      } catch (e) {
        // 
      }
      assert.isFalse(element.querying);
    });

    it('throws error when model error', async () => {
      element.addEventListener(ArcModelEventTypes.Request.list, (e) => {
        e.preventDefault();
        e.stopPropagation();
        // @ts-ignore
        e.detail.result = Promise.reject(new Error('test'));
      });
      let called = false;
      try {
        await element[internals.loadPage]();
      } catch (e) {
        called = true;
      }
      assert.isTrue(called);
    });
  });
});
