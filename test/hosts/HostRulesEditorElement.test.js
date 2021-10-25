import { fixture, assert, html, nextFrame, oneEvent, aTimeout } from '@open-wc/testing';
import sinon from 'sinon';
import { ArcMock } from '@advanced-rest-client/arc-mock';
import { HostRulesModel, MockedStore } from '@advanced-rest-client/idb-store';
import { DataExportEventTypes, ArcModelEvents, ArcModelEventTypes } from '@advanced-rest-client/events';
import '../../define/host-rules-editor.js';

/** @typedef {import('../../index').HostRulesEditorElement} HostRulesEditorElement */
/** @typedef {import('@advanced-rest-client/events').ARCHostRuleUpdatedEvent} ARCHostRuleUpdatedEvent */
/** @typedef {import('@anypoint-web-components/awc').AnypointDialogElement} AnypointDialog */

describe('HostRulesEditorElement', () => {
  const generator = new ArcMock();
  const store = new MockedStore();
  const model = new HostRulesModel();

  before(() => {
    model.listen(window);
  });

  after(() => {
    model.unlisten(window);
  });

  /**
   * @return {Promise<HostRulesEditorElement>} 
   */
  async function basicFixture() {
    return fixture(html`<host-rules-editor></host-rules-editor>`);
  }

  /**
   * @return {Promise<HostRulesEditorElement>} 
   */
  async function dataFixture() {
    const items = generator.hostRules.rules(10);
    return fixture(html`<host-rules-editor .items="${items}"></host-rules-editor>`);
  }

  /**
   * @return {Promise<HostRulesEditorElement>} 
   */
  async function databaseFixture() {
    let e;
    window.addEventListener(ArcModelEventTypes.HostRules.list, function f(event) {
      window.removeEventListener(ArcModelEventTypes.HostRules.list, f);
      e = event;
    });
    const node = await fixture(html`<host-rules-editor></host-rules-editor>`);
    if (!e) {
      e = await oneEvent(node, ArcModelEventTypes.HostRules.list);
    }
    await aTimeout(0);
    await e.detail.result;
    await nextFrame();
    return /** @type HostRulesEditorElement */ (node);
  }

  describe('initialization', () => {
    it('dispatches the query event when connected to the DOM', async () => {
      const spy = sinon.spy();
      window.addEventListener(ArcModelEventTypes.HostRules.list, spy);
      const elm = document.createElement('host-rules-editor');
      document.body.appendChild(elm);
      await nextFrame();
      document.body.removeChild(elm);
      assert.isTrue(spy.called);
    });

    it('resets the items when error', async () => {
      const elm = document.createElement('host-rules-editor');
      elm.items = [];
      document.body.appendChild(elm);
      await nextFrame();
      document.body.removeChild(elm);
      assert.isEmpty(elm.items);
    });

    it('does not query the store when has items set', async () => {
      const spy = sinon.spy();
      window.addEventListener(ArcModelEventTypes.HostRules.list, spy);
      const elm = document.createElement('host-rules-editor');
      elm.items = [{ from: 'a', 'to': 'b' }];
      document.body.appendChild(elm);
      await nextFrame();
      document.body.removeChild(elm);
      assert.isFalse(spy.called);
    });

    it('renders empty screen', async () => {
      model.unlisten(window);
      const element = await basicFixture();
      model.listen(window);
      const node = element.shadowRoot.querySelector('.empty-screen');
      assert.ok(node);
    });

    it('the empty screen has the add button', async () => {
      model.unlisten(window);
      const element = await basicFixture();
      model.listen(window);
      const node = element.shadowRoot.querySelector('.empty-screen .add-param');
      assert.ok(node);
    });

    it('sets dataUnavailable property', async () => {
      model.unlisten(window);
      const element = await basicFixture();
      model.listen(window);
      assert.isTrue(element.dataUnavailable);
    });

    it('sets hasItems property', async () => {
      const element = await basicFixture();
      assert.isFalse(element.hasItems);
    });
  });

  describe('initialization with data', () => {
    let element = /** @type HostRulesEditorElement */ (null);
    beforeEach(async () => {
      element = await dataFixture();
    });

    it('does not render empty screen', async () => {
      const node = element.shadowRoot.querySelector('.empty-screen');
      assert.notOk(node);
    });

    it('has the list of items', async () => {
      const node = element.shadowRoot.querySelector('.params-list');
      assert.ok(node);
    });

    it('renders all items', async () => {
      const nodes = element.shadowRoot.querySelectorAll('.form-row');
      assert.lengthOf(nodes, 10);
    });

    it('renders the toggle button', async () => {
      const node = element.shadowRoot.querySelector('.form-row .param-switch');
      assert.ok(node);
    });

    it('renders the remove icon', async () => {
      const node = element.shadowRoot.querySelector('.form-row .param-remove');
      assert.ok(node);
    });

    it('renders the "from" input', async () => {
      const node = element.shadowRoot.querySelector('.form-row .param-name');
      assert.ok(node);
    });

    it('renders the "to" input', async () => {
      const node = element.shadowRoot.querySelector('.form-row .param-value');
      assert.ok(node);
    });
  });

  describe('data manipulation', () => {
    before(async () => {
      await store.insertHostRules();
    });

    after(async () => {
      await store.destroyHostRules();
    });

    let element = /** @type HostRulesEditorElement */ (null);
    beforeEach(async () => {
      element = await databaseFixture();
    });

    it('has the data', () => {
      assert.lengthOf(element.items, 25);
    });

    it('toggles the enabled state', async () => {
      const initial = element.items[0].enabled;
      const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('.form-row .param-switch'));
      node.click();
      const e = /** @type any */ (await oneEvent(window, ArcModelEventTypes.HostRules.State.update));
      assert.equal(e.changeRecord.item.enabled, !initial);
    });

    it('changes the from property', async () => {
      const input = /** @type HTMLInputElement */ (element.shadowRoot.querySelector('.form-row .param-name'));
      input.value = 'test-from-updated';
      input.dispatchEvent(new Event('change'));
      const e = /** @type any */ (await oneEvent(window, ArcModelEventTypes.HostRules.State.update));
      assert.equal(e.changeRecord.item.from, 'test-from-updated');
    });

    it('changes the to property', async () => {
      const input = /** @type HTMLInputElement */ (element.shadowRoot.querySelector('.form-row .param-value'));
      input.value = 'test-to-updated';
      input.dispatchEvent(new Event('change'));
      const e = /** @type any */ (await oneEvent(window, ArcModelEventTypes.HostRules.State.update));
      assert.equal(e.changeRecord.item.to, 'test-to-updated');
    });

    it('deletes an item', async () => {
      const id = element.items[0]._id;
      const input = /** @type HTMLElement */ (element.shadowRoot.querySelector('.form-row .param-remove'));
      input.click();
      const e = /** @type any */ (await oneEvent(window, ArcModelEventTypes.HostRules.State.delete));
      assert.equal(e.id, id);
    });

    it('removes a deleted item from the list', async () => {
      const { length } = element.items;
      const input = /** @type HTMLElement */ (element.shadowRoot.querySelector('.form-row .param-remove'));
      input.click();
      await oneEvent(window, ArcModelEventTypes.HostRules.State.delete);
      assert.lengthOf(element.items, length - 1);
    });

    it('adds a new item to the list', async () => {
      const { length } = element.items;
      const item = generator.hostRules.rule();
      item._id = 'test-id';
      const record = {
        id: item._id,
        rev: 'test-rev',
        item,
      };
      ArcModelEvents.HostRules.State.update(document.body, record);
      assert.lengthOf(element.items, length + 1);
    });
  });

  describe('deleting all data', () => {
    before(async () => {
      await store.insertHostRules();
    });

    after(async () => {
      await store.destroyHostRules();
    });

    let element = /** @type HostRulesEditorElement */ (null);
    beforeEach(async () => {
      element = await databaseFixture();
    });

    it('had the dialog in the DOM', () => {
      const node = element.shadowRoot.querySelector('#dataClearDialog');
      assert.ok(node);
    });

    it('opens the dialog when selecting the menu option', () => {
      const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('[data-action="delete-all"]'));
      node.click();
      const dialog = /** @type AnypointDialog */ (element.shadowRoot.querySelector('#dataClearDialog'));
      assert.isTrue(dialog.opened);
    });

    it('triggers export from the dialog', () => {
      const spy = sinon.spy();
      element.addEventListener(DataExportEventTypes.nativeData, spy);
      const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('#dataClearDialog [data-action="delete-export-all"]'));
      node.click();
      assert.isTrue(spy.called);
    });

    it('cancels the dialog', async () => {
      const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('[data-action="delete-all"]'));
      node.click();
      await nextFrame();
      const dialog = /** @type AnypointDialog */ (element.shadowRoot.querySelector('#dataClearDialog'));
      const button = /** @type HTMLElement */ (dialog.querySelector('[data-dialog-dismiss]'));
      button.click();
      assert.isFalse(dialog.opened);
    });

    it('clears all data in the data store', async () => {
      const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('[data-action="delete-all"]'));
      node.click();
      await nextFrame();
      const button = /** @type HTMLElement */ (element.shadowRoot.querySelector('#dataClearDialog [data-dialog-confirm]'));
      button.click();
      await oneEvent(window, ArcModelEventTypes.destroyed);
      assert.deepEqual(element.items, []);
    });
  });
});
