import { fixture, assert, html, oneEvent, nextFrame } from '@open-wc/testing';
import { ArcMock } from '@advanced-rest-client/arc-mock';
import { ArcModelEvents, ArcModelEventTypes } from '@advanced-rest-client/events';
import sinon from 'sinon';
import { RequestModel, ProjectModel, MockedStore } from '@advanced-rest-client/idb-store'
import '../../define/saved-panel.js'
import '../../define/history-panel.js'
import * as internals from '../../src/elements/request/internals.js';

/** @typedef {import('../../').SavedPanelElement} SavedPanelElement */
/** @typedef {import('../../').HistoryPanelElement} HistoryPanelElement */
/** @typedef {import('@advanced-rest-client/events').ArcRequest.ARCSavedRequest} ARCSavedRequest */
/** @typedef {import('lit-html').TemplateResult} TemplateResult */

describe('SavedListMixin', () => {
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
  function historyModelTemplate() {
    return html`<history-panel></history-panel>`;
  }

  /**
   * @returns {Promise<SavedPanelElement>}
   */
  async function noAutoFixture() {
    return fixture(html`<saved-panel noAuto></saved-panel>`);
  }

  /**
   * @returns {Promise<HistoryPanelElement>}
   */
  async function afterHistoryQueryFixture() {
    const element = /** @type HistoryPanelElement */ (await fixture(historyModelTemplate()));
    // the query could potentially start already
    if (!element.querying) {
      await oneEvent(element, 'queryingchange');
    }
    await oneEvent(element, 'queryingchange');
    await nextFrame();
    return element;
  }

  describe('[draggableChanged]', () => {
    let element = /** @type SavedPanelElement */(null);
    beforeEach(async () => {
      element = await noAutoFixture();
    });

    it('calls [addDraggableEvents]', () => {
      const spy = sinon.spy(element, internals.addDraggableEvents);
      element.draggableEnabled = true;
      assert.isTrue(spy.calledOnce);
    });

    it('calls [addDraggableEvents] only once', () => {
      element[internals.hasDraggableEventsValue] = true;
      element.draggableEnabled = true;
      // this is for coverage
      assert.isTrue(element[internals.hasDraggableEventsValue]);
    });

    it('calls [removeDraggableEvents]', () => {
      element.draggableEnabled = true;
      const spy = sinon.spy(element, internals.removeDraggableEvents);
      element.draggableEnabled = false;
      assert.isTrue(spy.calledOnce);
    });

    it('calls [removeDraggableEvents] only once', () => {
      element.draggableEnabled = true;
      element[internals.hasDraggableEventsValue] = false;
      element.draggableEnabled = false;
      // this is for coverage
      assert.isFalse(element[internals.hasDraggableEventsValue]);
    });
  });

  describe('[dragOverHandler]', () => {
    before(async () => {
      await store.insertHistory(5);
    });
    
    after(async () => {
      await store.destroyHistory();
    });

    let element = /** @type SavedPanelElement */(null);
    let historyElement = /** @type HistoryPanelElement */(null);
    beforeEach(async () => {
      historyElement = await afterHistoryQueryFixture();
      historyElement.draggableEnabled = true;
      element = await noAutoFixture();
      element.draggableEnabled = true;
    });

    /**
     * @param {EventTarget=} target
     */
    function dispatchEvent(target) {
      const dt = new DataTransfer();
      const node = (target || historyElement.shadowRoot.querySelector('.request-list-item'));
      const startEvent = new DragEvent('dragstart', {
        dataTransfer: dt,
      });
      node.dispatchEvent(startEvent);
      const overEvent = new DragEvent('dragover', {
        dataTransfer: dt,
      });
      element.dispatchEvent(overEvent);
    }

    it('sets drop target class on the element', () => {
      dispatchEvent();
      assert.isTrue(element.classList.contains('drop-target'));
    });

    it('sets drop target class only once', () => {
      element.classList.add('drop-target');
      dispatchEvent();
      // for coverage
      assert.isTrue(element.classList.contains('drop-target'));
    });

    it('ignores saved requests (dragOverHandler)', async () => {
      element.requests = /** @type ARCSavedRequest[] */ (generator.http.savedData(5).requests);
      await nextFrame();
      const target = element.shadowRoot.querySelector('.request-list-item');
      dispatchEvent(target);
      // for coverage
      assert.isFalse(element.classList.contains('drop-target'));
    });
  });

  describe('[dragLeaveHandler]', () => {
    before(async () => {
      await store.insertHistory(5);
    });
    
    after(async () => {
      await store.destroyHistory();
    });

    let element = /** @type SavedPanelElement */(null);
    let historyElement = /** @type HistoryPanelElement */(null);
    beforeEach(async () => {
      historyElement = await afterHistoryQueryFixture();
      historyElement.draggableEnabled = true;
      element = await noAutoFixture();
      element.draggableEnabled = true;
    });

    /**
     * @param {EventTarget=} target
     */
    function dispatchEvent(target) {
      const dt = new DataTransfer();
      const node = (target || historyElement.shadowRoot.querySelector('.request-list-item'));
      const startEvent = new DragEvent('dragstart', {
        dataTransfer: dt,
      });
      node.dispatchEvent(startEvent);
      const overEvent = new DragEvent('dragleave', {
        dataTransfer: dt,
      });
      element.dispatchEvent(overEvent);
    }

    it('removes drop target class from the element', () => {
      element.classList.add('drop-target');
      dispatchEvent();
      assert.isFalse(element.classList.contains('drop-target'));
    });

    it('removes drop target class only once', () => {
      dispatchEvent();
      // for coverage
      assert.isFalse(element.classList.contains('drop-target'));
    });

    it('ignores saved requests (dragLeaveHandler)', async () => {
      element.requests = /** @type ARCSavedRequest[] */ (generator.http.savedData(5).requests);
      await nextFrame();
      const target = element.shadowRoot.querySelector('.request-list-item');
      dispatchEvent(target);
      // for coverage
      assert.isFalse(element.classList.contains('drop-target'));
    });
  });

  describe('[dropHandler]', () => {
    before(async () => {
      await store.insertHistory(5);
    });
    
    after(async () => {
      await store.destroyHistory();
      await store.destroySaved();
    });

    let element = /** @type SavedPanelElement */(null);
    let historyElement = /** @type HistoryPanelElement */(null);
    beforeEach(async () => {
      historyElement = await afterHistoryQueryFixture();
      historyElement.draggableEnabled = true;
      element = await noAutoFixture();
      element.draggableEnabled = true;
    });

    /**
     * @param {EventTarget=} target
     */
    function dispatchEvent(target) {
      const dt = new DataTransfer();
      const node = (target || historyElement.shadowRoot.querySelector('.request-list-item'));
      const startEvent = new DragEvent('dragstart', {
        dataTransfer: dt,
      });
      node.dispatchEvent(startEvent);
      const overEvent = new DragEvent('drop', {
        dataTransfer: dt,
      });
      element.dispatchEvent(overEvent);
    }

    it('adds history to saved list after the drop', async () => {
      dispatchEvent();
      const e = await oneEvent(element, ArcModelEventTypes.Request.store);
      const record = await e.detail.result;
      const {item} = record;
      assert.typeOf(item, 'object', 'created the request');
      assert.equal(item.type, 'saved', 'the request has the new type');
      assert.equal(item.name, 'Unnamed request', 'the request has default name');
    });

    it('keeps the name when set', async () => {
      const node = /** @type HTMLElement */ (historyElement.shadowRoot.querySelector('.request-list-item'));
      const { id } = node.dataset;
      const request = /** @type ARCSavedRequest */ (await ArcModelEvents.Request.read(historyElement, 'history', id));
      request.name = 'test-name';
      await ArcModelEvents.Request.update(historyElement, 'history', request);
      dispatchEvent();
      const e = await oneEvent(element, ArcModelEventTypes.Request.store);
      const record = await e.detail.result;
      const {item} = record;
      assert.equal(item.name, 'test-name', 'the request has default name');
    });

    it('removes drop-target class', async () => {
      element.classList.add('drop-target');
      dispatchEvent();
      await oneEvent(element, ArcModelEventTypes.Request.store);
      assert.isFalse(element.classList.contains('drop-target'));
    });
  });
});
