import { fixture, assert, html, oneEvent, nextFrame } from '@open-wc/testing';
import { ArcMock } from '@advanced-rest-client/arc-mock';
import { DataExportEventTypes, ArcModelEventTypes } from '@advanced-rest-client/events';
import sinon from 'sinon';
import { RequestModel, ProjectModel, MockedStore } from '@advanced-rest-client/idb-store'
import '../../define/saved-panel.js'
import * as internals from '../../src/elements/request/internals.js';

/** @typedef {import('../../').SavedPanelElement} SavedPanelElement */
/** @typedef {import('@advanced-rest-client/events').ArcRequest.ARCSavedRequest} ARCSavedRequest */
/** @typedef {import('lit-html').TemplateResult} TemplateResult */

describe('RequestsPanelElement', () => {
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
    await nextFrame();
    return element;
  }

  describe('toggleSelection()', () => {
    let element = /** @type SavedPanelElement */(null);
    beforeEach(async () => {
      element = await noAutoFixture();
    });

    it('does nothing when no requests', () => {
      element.toggleSelection();
      assert.deepEqual(element.selectedItems, []);
    });

    it('sets [toggleSelectAllValue] value', () => {
      element.toggleSelection();
      assert.isTrue(element[internals.toggleSelectAllValue]);
    });

    it('sets selected items', () => {
      const items = /** @type ARCSavedRequest[] */ (generator.http.savedData().requests);
      element[internals.appendItems](items);
      element.toggleSelection();
      assert.lengthOf(element.selectedItems, items.length);
    });

    it('overrides previous selection', () => {
      const items = /** @type ARCSavedRequest[] */ (generator.http.savedData().requests);
      element[internals.appendItems](items);
      element.selectedItems = [items[0]._id];
      element.toggleSelection();
      assert.lengthOf(element.selectedItems, items.length);
    });

    it('clears the selection', () => {
      const items = /** @type ARCSavedRequest[] */ (generator.http.savedData().requests);
      element[internals.appendItems](items);
      element[internals.toggleSelectAllValue] = true;
      element.toggleSelection();
      assert.lengthOf(element.selectedItems, 0);
    });
  });

  describe('content actions', () => {
    before(async () => {
      await store.insertSaved(20, 1);
    });
    
    after(async () => {
      await store.destroySaved();
    });

    let element = /** @type SavedPanelElement */(null);
    beforeEach(async () => {
      element = await afterQueryFixture();
    });

    it('triggers export flow', () => {
      const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('[data-action="export"]'));
      node.click();
      assert.isTrue(element[internals.exportOptionsOpened]);
    });

    it('triggers delete all flow', () => {
      const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('[data-action="delete"]'));
      node.click();
      assert.isTrue(element[internals.deleteAllDialogValue]);
    });

    it('deletes selected requests', (done) => {
      element.selectedItems = [element.requests[0]._id];
      element.addEventListener(ArcModelEventTypes.Request.deleteBulk, (e) => {
        e.preventDefault();
        e.stopPropagation();
        // @ts-ignore
        assert.deepEqual(e.ids, element.selectedItems);
        done();
      });
      const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('[data-action="delete"]'));
      node.click();
    });
  
    it('runs toggle all action', () => {
      const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('[data-action="toggle-all"]'));
      node.click();
      assert.isTrue(element[internals.toggleSelectAllValue]);
    });

    it('runs refresh all action', () => {
      const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('[data-action="refresh"]'));
      const spy = sinon.spy(element, 'refresh');
      node.click();
      assert.isTrue(spy.calledOnce);
    });

    it('sets is search', () => {
      const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('[data-action="search"]'));
      node.click();
      assert.isTrue(element.isSearch);
    });
  });

  describe('[searchHandler]()', () => {
    before(async () => {
      await store.insertSaved(20, 1);
    });
    
    after(async () => {
      await store.destroySaved();
    });

    let element = /** @type SavedPanelElement */(null);
    beforeEach(async () => {
      element = await afterQueryFixture();
      element.isSearch = true;
      await nextFrame();
    });

    it('triggers export flow', () => {
      const input = /** @type HTMLInputElement */ (element.shadowRoot.querySelector('.search-input'));
      const spy = sinon.spy(element, 'query');
      input.value = 'test';
      input.dispatchEvent(new Event('search'));
      assert.isTrue(spy.calledOnce);
      assert.equal(spy.args[0][0], 'test');
    });
  });

  describe('[listScrollHandler]()', () => {
    before(async () => {
      await store.insertSaved(50, 1);
    });
    
    after(async () => {
      await store.destroySaved();
    });

    let element = /** @type SavedPanelElement */(null);
    beforeEach(async () => {
      element = await afterQueryFixture();
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

  describe('[deleteSelected]()', () => {
    before(async () => {
      await store.insertSaved(50, 1);
    });
    
    after(async () => {
      await store.destroySaved();
    });

    let element = /** @type SavedPanelElement */(null);
    beforeEach(async () => {
      element = await afterQueryFixture();
      element.selectedItems = [element.requests[0]._id, element.requests[1]._id];
    });

    it('removes deleted items from the list', async () => {
      await element[internals.deleteSelected]();
      assert.lengthOf(element.requests, 48);
    });
    
    it('sets [deleteLatestList] value', async () => {
      const items = [...element.selectedItems];
      await element[internals.deleteSelected]();
      const result = element[internals.deleteLatestList];
      assert.lengthOf(result, 2, 'has 2 records');
      assert.equal(result[0].id, items[0], 'has id on #1');
      assert.equal(result[1].id, items[1], 'has id on #2');
    });

    it('clears selection', async () => {
      await element[internals.deleteSelected]();
      assert.deepEqual(element.selectedItems, []);
    });

    it('notifies selection change', async () => {
      const spy = sinon.spy();
      element.addEventListener('select', spy);
      await element[internals.deleteSelected]();
      assert.isTrue(spy.calledOnce);
    });

    it('opens deleted toast', async () => {
      await element[internals.deleteSelected]();
      assert.isTrue(element[internals.deleteUndoOpened], 'opened flag is set');
      const toast = element.shadowRoot.querySelector('mwc-snackbar');
      assert.isTrue(toast.open, 'toast is set to open');
    });
  });

  describe('[deleteAll]()', () => {
    let element = /** @type SavedPanelElement */(null);
    beforeEach(async () => {
      element = await noAutoFixture();
    });

    it('sets [deleteAllDialogValue] property', () => {
      element[internals.deleteAll]();
      assert.isTrue(element[internals.deleteAllDialogValue]);
    });

    it('renders the delete dialog', async () => {
      element[internals.deleteAll]();
      await nextFrame();
      const node = element.shadowRoot.querySelector('.delete-container');
      assert.ok(node);
    });
  });

  describe('Delete dialog actions', () => {
    let element = /** @type SavedPanelElement */(null);
    beforeEach(async () => {
      element = await noAutoFixture();
      element[internals.deleteAll]();
      await nextFrame();
    });

    it('sets the [deleteAllDialogValue] property', async () => {
      const node = /** @type HTMLElement */ (element.shadowRoot.querySelectorAll('.delete-container .buttons anypoint-button')[1]);
      node.click();
      assert.isFalse(element[internals.deleteAllDialogValue]);
    });

    it('hides the dialog from the button click', async () => {
      const button = /** @type HTMLElement */ (element.shadowRoot.querySelectorAll('.delete-container .buttons anypoint-button')[1]);
      button.click();
      await nextFrame();
      const node = element.shadowRoot.querySelector('.delete-container');
      assert.notOk(node);
    });

    it('opens the export dialog', async () => {
      const node = /** @type HTMLElement */ (element.shadowRoot.querySelectorAll('.delete-container .buttons anypoint-button')[0]);
      node.click();
      assert.isTrue(element[internals.exportOptionsOpened]);
    });

    it('runs delete action', (done) => {
      element.addEventListener(ArcModelEventTypes.destroy, (e) => {
        e.preventDefault();
        e.stopPropagation();
        // @ts-ignore
        assert.deepEqual(e.stores, ['saved'])
        done();
      });
      const node = /** @type HTMLElement */ (element.shadowRoot.querySelectorAll('.delete-container .buttons anypoint-button')[2]);
      node.click();
      assert.isFalse(element[internals.deleteAllDialogValue]);
    });
  });

  describe('[deleteConfirm]', () => {
    let element = /** @type SavedPanelElement */(null);
    beforeEach(async () => {
      element = await noAutoFixture();
    });

    it('dispatches the delete event', async () => {
      const spy = sinon.spy();
      element.addEventListener(ArcModelEventTypes.destroy, spy);
      element[internals.deleteConfirm]();
      assert.isTrue(spy.calledOnce);
    });

    it('sets [deleteAllDialogValue] property', async () => {
      element[internals.deleteConfirm]();
      assert.isFalse(element[internals.deleteAllDialogValue]);
    });

    it('clears selection', async () => {
      element.selectedItems = ['test'];
      element[internals.deleteConfirm]();
      assert.deepEqual(element.selectedItems, []);
    });

    it('dispatches select event', async () => {
      const spy = sinon.spy();
      element.addEventListener('select', spy);
      element.selectedItems = ['test'];
      element[internals.deleteConfirm]();
      assert.isTrue(spy.calledOnce);
    });
  });

  describe('[deleteUndoAction]()', () => {
    before(async () => {
      await store.insertSaved(5, 1);
    });
    
    after(async () => {
      await store.destroySaved();
    });

    let element = /** @type SavedPanelElement */(null);
    beforeEach(async () => {
      element = await afterQueryFixture();
      element.selectedItems = [element.requests[0]._id];
      await element[internals.deleteSelected]();
    });

    it('restores previously deleted items', async () => {
      assert.lengthOf(element.requests, 4);
      await element[internals.deleteUndoAction]();
      assert.lengthOf(element.requests, 5);
    });

    it('clears the [deleteLatestList] property', async () => {
      await element[internals.deleteUndoAction]();
      assert.isUndefined(element[internals.deleteLatestList]);
    });

    it('closes the delete toast', async () => {
      await element[internals.deleteUndoAction]();
      assert.isFalse(element[internals.deleteUndoOpened]);
    });

    it('does nothing when no selection', async () => {
      element[internals.deleteLatestList] = undefined;
      const spy = sinon.spy();
      element.addEventListener(ArcModelEventTypes.Request.undeleteBulk, spy);
      await element[internals.deleteUndoAction]();
      assert.isFalse(spy.called);
    });
  });

  describe('[exportAction]()', () => {
    let element = /** @type SavedPanelElement */(null);
    beforeEach(async () => {
      element = await noAutoFixture();
    });

    it('sets [exportOptionsOpened] property', () => {
      element[internals.exportAction]();
      assert.isTrue(element[internals.exportOptionsOpened]);
    });
  });

  describe('[exportOverlayClosed]()', () => {
    let element = /** @type SavedPanelElement */(null);
    beforeEach(async () => {
      element = await noAutoFixture();
    });

    it('sets [exportOptionsOpened] property', () => {
      element[internals.exportOverlayClosed]();
      assert.isFalse(element[internals.exportOptionsOpened]);
    });
  });

  describe('[exportCancel]()', () => {
    let element = /** @type SavedPanelElement */(null);
    beforeEach(async () => {
      element = await noAutoFixture();
    });

    it('sets [exportOptionsOpened] property', () => {
      element[internals.exportCancel]();
      assert.isFalse(element[internals.exportOptionsOpened]);
    });
  });

  describe('[exportAll]()', () => {
    let element = /** @type SavedPanelElement */(null);
    let interrupted;
    let provider;
    let success;
    const file = 'export-file.arc';
    beforeEach(async () => {
      element = await noAutoFixture();
      interrupted = false;
      success = true;
      provider = 'file';
    });

    let handler;
    before(() => {
      handler = (e) => {
        e.preventDefault();
        e.detail.result = Promise.resolve({
          interrupted,
          provider,
          success,
        });
      };
      window.addEventListener(DataExportEventTypes.nativeData, handler);
    });

    after(() => {
      window.removeEventListener(DataExportEventTypes.nativeData, handler);
    });

    it('dispatches the export event', () => {
      const spy = sinon.spy();
      element.addEventListener(DataExportEventTypes.nativeData, spy)
      element[internals.exportAll]({ provider }, { file });
      assert.isTrue(spy.calledOnce);
    });

    it('sets the data object', () => {
      const spy = sinon.spy();
      element.addEventListener(DataExportEventTypes.nativeData, spy)
      element[internals.exportAll]({ provider }, { file });
      assert.isTrue(spy.args[0][0].data.requests);
    });

    it('sets the exportOptions object', () => {
      const spy = sinon.spy();
      element.addEventListener(DataExportEventTypes.nativeData, spy)
      element[internals.exportAll]({ provider }, { file });
      const { exportOptions } = spy.args[0][0];
      assert.equal(exportOptions.provider, provider, 'provider is set');
      assert.equal(exportOptions.kind, 'ARC#SavedExport', 'kind is set');
    });

    it('sets the providerOptions object', () => {
      const spy = sinon.spy();
      element.addEventListener(DataExportEventTypes.nativeData, spy)
      element[internals.exportAll]({ provider }, { file });
      const { providerOptions } = spy.args[0][0];
      assert.equal(providerOptions.file, file, 'file is set');
    });

    it('renders confirmation toast when success', async () => {
      provider = 'drive';
      await element[internals.exportAll]({ provider }, { file });
      const node = element.shadowRoot.querySelector('#driveExport');
      // @ts-ignore
      assert.isTrue(node.open);
    });

    it('does not render confirmation toast when interrupted', async () => {
      provider = 'drive';
      interrupted = true;
      await element[internals.exportAll]({ provider }, { file });
      const node = element.shadowRoot.querySelector('#driveExport');
      // @ts-ignore
      assert.isFalse(node.open);
    });
  });

  describe('[exportSelected]()', () => {
    let element = /** @type SavedPanelElement */(null);
    let interrupted;
    let provider;
    let success;
    const file = 'export-file.arc';
    const selected = [];
    beforeEach(async () => {
      element = await noAutoFixture();
      interrupted = false;
      success = true;
      provider = 'file';
    });

    let handler;
    before(async () => {
      const created = await store.insertSaved(5, 1);
      selected.push(created.requests[0]._id);
      handler = (e) => {
        e.preventDefault();
        e.detail.result = Promise.resolve({
          interrupted,
          provider,
          success,
        });
      };
      window.addEventListener(DataExportEventTypes.nativeData, handler);
    });

    after(async () => {
      window.removeEventListener(DataExportEventTypes.nativeData, handler);
      await store.destroySaved();
    });

    it('dispatches the export event', async () => {
      const spy = sinon.spy();
      element.addEventListener(DataExportEventTypes.nativeData, spy)
      await element[internals.exportSelected](selected, { provider }, { file });
      assert.isTrue(spy.calledOnce);
    });

    it('sets the data object to read request object', async () => {
      const spy = sinon.spy();
      element.addEventListener(DataExportEventTypes.nativeData, spy)
      await element[internals.exportSelected](selected, { provider }, { file });
      const { requests } = spy.args[0][0].data;
      assert.typeOf(requests, 'array');
      assert.typeOf(requests[0], 'object');
      assert.equal(requests[0]._id, selected[0]);
    });

    it('sets the exportOptions object', async () => {
      const spy = sinon.spy();
      element.addEventListener(DataExportEventTypes.nativeData, spy)
      await element[internals.exportSelected](selected, { provider }, { file });
      const { exportOptions } = spy.args[0][0];
      assert.equal(exportOptions.provider, provider, 'provider is set');
      assert.equal(exportOptions.kind, 'ARC#SavedExport', 'kind is set');
    });

    it('sets the providerOptions object', async () => {
      const spy = sinon.spy();
      element.addEventListener(DataExportEventTypes.nativeData, spy)
      await element[internals.exportSelected](selected, { provider }, { file });
      const { providerOptions } = spy.args[0][0];
      assert.equal(providerOptions.file, file, 'file is set');
    });

    it('renders confirmation toast when success', async () => {
      provider = 'drive';
      await element[internals.exportSelected](selected, { provider }, { file });
      const node = element.shadowRoot.querySelector('#driveExport');
      // @ts-ignore
      assert.isTrue(node.open);
    });

    it('does not render confirmation toast when interrupted', async () => {
      provider = 'drive';
      interrupted = true;
      await element[internals.exportSelected](selected, { provider }, { file });
      const node = element.shadowRoot.querySelector('#driveExport');
      // @ts-ignore
      assert.isFalse(node.open);
    });
  });

  describe('[exportAccept]()', () => {
    let element = /** @type SavedPanelElement */(null);
    let interrupted;
    let provider;
    let success;
    const file = 'export-file.arc';
    const selected = [];
    beforeEach(async () => {
      element = await noAutoFixture();
      interrupted = false;
      success = true;
      provider = 'file';
    });

    let handler;
    before(async () => {
      const created = await store.insertSaved(5, 1);
      selected.push(created.requests[0]._id);
      handler = (e) => {
        e.preventDefault();
        e.detail.result = Promise.resolve({
          interrupted,
          provider,
          success,
        });
      };
      window.addEventListener(DataExportEventTypes.nativeData, handler);
    });

    after(async () => {
      window.removeEventListener(DataExportEventTypes.nativeData, handler);
      await store.destroySaved();
    });

    it('calls [exportAll] when no selection', async () => {
      const e = new CustomEvent('accept', {
        detail: {
          exportOptions: {
            provider,
          },
          providerOptions: {
            file,
          },
        },
      });
      const spy = sinon.spy(element, internals.exportAll);
      element[internals.exportAccept](e);
      assert.isTrue(spy.calledOnce);
    });

    it('calls [exportSelected] when has selection', async () => {
      element.selectedItems = selected;
      const e = new CustomEvent('accept', {
        detail: {
          exportOptions: {
            provider,
          },
          providerOptions: {
            file,
          },
        },
      });
      const spy = sinon.spy(element, internals.exportSelected);
      element[internals.exportAccept](e);
      assert.isTrue(spy.calledOnce);
    });
  });
});
