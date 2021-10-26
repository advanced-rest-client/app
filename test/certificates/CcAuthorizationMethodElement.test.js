/* eslint-disable no-param-reassign */
import { fixture, assert, html, nextFrame } from '@open-wc/testing';
import sinon from 'sinon';
import { ArcMock } from '@advanced-rest-client/arc-mock';
import { ClientCertificateModel, MockedStore } from '@advanced-rest-client/idb-store';
import { ArcNavigationEventTypes, ImportEvents, ArcModelEventTypes, ArcModelEvents } from '@advanced-rest-client/events';
import { METHOD_CC } from '../../src/elements/authorization/CcAuthorizationMethodElement.js';
import '../../define/cc-authorization-method.js';

/** @typedef {import('../../index').CcAuthorizationMethodElement} CcAuthorizationMethodElement */
/** @typedef {import('@advanced-rest-client/events').ClientCertificate.ARCCertificateIndex} ARCCertificateIndex */

describe('CcAuthorizationMethodElement', () => {
  const generator = new ArcMock();
  const store = new MockedStore();
  const model = new ClientCertificateModel();

  before(() => {
    model.listen(window);
  });

  after(() => {
    model.unlisten(window);
  });
  
  /**
   * @returns {Promise<CcAuthorizationMethodElement>}
   */
  async function basicFixture() {
    return (fixture(html`<cc-authorization-method></cc-authorization-method>`));
  }

  /**
   * @returns {Promise<CcAuthorizationMethodElement>}
   */
  async function importButtonFixture() {
    return (fixture(html`<cc-authorization-method importButton></cc-authorization-method>`));
  }

  /**
   * @param {boolean=} none
   * @returns {Promise<CcAuthorizationMethodElement>}
   */
  async function queryDataFixture(none) {
    const elmRequest = /** @type Promise<CcAuthorizationMethodElement> */ (fixture(html`<cc-authorization-method ?none="${none}"></cc-authorization-method>`));
    return new Promise((resolve) => {
      window.addEventListener(ArcModelEventTypes.ClientCertificate.list, function f(e) {
        window.removeEventListener(ArcModelEventTypes.ClientCertificate.list, f);
        // @ts-ignore
        const { detail } = e;
        setTimeout(() => {
          detail.result
          .then(() => elmRequest)
          .then((node) => {
            resolve(node);
          });
        });
      });
    });
  }

  async function untilAfterQuery(element, result) {
    return new Promise((resolve) => {
      element.addEventListener(ArcModelEventTypes.ClientCertificate.list, function f(e) {
        element.removeEventListener(ArcModelEventTypes.ClientCertificate.list, f);
        e.preventDefault();
        e.detail.result = Promise.resolve(result || []);
        nextFrame().then(() => resolve())
      });
      element.reset();
    });
  }

  describe('initialization', () => {
    it('can be created by using web APIs', async () => {
      const element = document.createElement('cc-authorization-method');
      assert.ok(element);
    });

    it('can be created from a template', async () => {
      const element = await basicFixture();
      assert.ok(element);
    });

    it('has no initial selection value', async () => {
      const element = await basicFixture();
      assert.isUndefined(element.selected);
    });

    it('has the "type" property set', async () => {
      const element = await basicFixture();
      assert.equal(element.type, METHOD_CC, 'getter is set');
    });

    it('sets "type" attribute', async () => {
      const element = await basicFixture();
      assert.equal(element.getAttribute('type'), METHOD_CC);
    });
  });

  describe('validate()', () => {
    it('always returns true', async () => {
      const element = document.createElement('cc-authorization-method');
      assert.isTrue(element.validate());
    });
  });

  describe('Empty state', () => {
    it('render empty state', async () => {
      const element = await basicFixture();
      await untilAfterQuery(element);
      const node = element.shadowRoot.querySelector('.empty-screen');
      assert.ok(node);
    });

    it('queries for certificates when initialized', async () => {
      const spy = sinon.spy();
      window.addEventListener(ArcModelEventTypes.ClientCertificate.list, spy);
      await basicFixture();
      assert.isTrue(spy.called);
    });
  });

  describe('Data list', () => {
    before(async () => {
      await store.insertCertificates();
    });

    after(async () => {
      await store.destroyClientCertificates();
    });

    let element = /** @type CcAuthorizationMethodElement */ (null);
    beforeEach(async () => {
      element = await queryDataFixture();
    });

    it('has items set', () => {
      assert.lengthOf(element.items, 15);
    });

    it('renders list items', () => {
      const nodes = element.shadowRoot.querySelectorAll('anypoint-radio-button');
      assert.lengthOf(nodes, 15);
    });

    it('renders list items with "none"', async () => {
      element.none = true;
      await nextFrame();
      const nodes = element.shadowRoot.querySelectorAll('anypoint-radio-button');
      assert.lengthOf(nodes, 16);
    });

    it('does not render empty state', async () => {
      const node = element.shadowRoot.querySelector('.empty-screen');
      assert.notOk(node);
    });

    it('selects button group when selected changes', async () => {
      const item = element.items[0];
      const id = item._id;
      element.selected = id;
      await nextFrame();
      // const group = element.shadowRoot.querySelector('anypoint-radio-group');
      // assert.equal(group.selected, id, 'group selection is set');
      const button = /** @type HTMLInputElement */ (element.shadowRoot.querySelector(`[data-id="${id}"]`));
      assert.isTrue(button.checked, 'button is checked');
    });
  });

  describe('datastore destroyed event handler', () => {
    let element = /** @type CcAuthorizationMethodElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
      element.items = generator.certificates.clientCertificates(5);
    });

    it('resets items', () => {
      ArcModelEvents.destroyed(document.body, 'client-certificates');
      assert.isUndefined(element.items);
    });

    it('ignores other data stores', () => {
      ArcModelEvents.destroyed(document.body, 'saved-requests');
      assert.lengthOf(element.items, 5);
    });
  });

  describe('data-imported event handler', () => {
    let element = /** @type CcAuthorizationMethodElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('calls reset()', () => {
      const spy = sinon.spy(element, 'reset');
      ImportEvents.dataImported(document.body);
      assert.isTrue(spy.called);
    });
  });

  describe(`${ArcModelEventTypes.ClientCertificate.State.delete} event handler`, () => {
    let element = /** @type CcAuthorizationMethodElement */ (null);

    before(async () => {
      await store.insertCertificates();
    });

    after(async () => {
      await store.destroyClientCertificates();
    });

    beforeEach(async () => {
      element = await queryDataFixture();
    });

    it('removes existing item', () => {
      const before = element.items.length;
      const item = element.items[0];
      ArcModelEvents.ClientCertificate.State.delete(document.body, item._id, item._rev);
      assert.lengthOf(element.items, before - 1);
    });

    it('ignores when not on the list', () => {
      const before = element.items.length;
      ArcModelEvents.ClientCertificate.State.delete(document.body, 'some-id', 'some-rev');
      assert.lengthOf(element.items, before);
    });
  });

  describe(`The updated event handler`, () => {
    let element = /** @type CcAuthorizationMethodElement */ (null);

    before(async () => {
      await store.insertCertificates();
    });

    after(async () => {
      await store.destroyClientCertificates();
    });

    beforeEach(async () => {
      element = await queryDataFixture();
    });

    it('updates existing item', () => {
      const item = { ...element.items[0] };
      item.name = 'test';
      const record = {
        item,
        id: item._id,
        rev: 'test',
      };
      ArcModelEvents.ClientCertificate.State.update(document.body, record);
      assert.equal(element.items[0].name, 'test');
    });

    it('Adds new item to the list', () => {
      const before = element.items.length;
      const item = /** @type ARCCertificateIndex */ (generator.certificates.certificateIndex());
      item._id = `${before + 1  }_`;
      const record = {
        item,
        id: item._id,
        rev: 'test',
      };
      ArcModelEvents.ClientCertificate.State.update(document.body, record);
      assert.lengthOf(element.items, before + 1);
    });
  });

  describe('Selecting an item', () => {
    before(async () => {
      await store.insertCertificates();
    });

    after(async () => {
      await store.destroyClientCertificates();
    });

    it('changes selection on item click', async () => {
      const element = await queryDataFixture();
      const node = element.shadowRoot.querySelectorAll('anypoint-radio-button')[1];
      node.click();
      assert.equal(element.selected, node.dataset.id);
    });

    it('selects "none" option', async () => {
      const element = await queryDataFixture(true);
      const node = element.shadowRoot.querySelectorAll('anypoint-radio-button')[0];
      node.click();
      assert.equal(element.selected, 'none');
    });

    it('notifies change when selection is made', async () => {
      const element = await queryDataFixture();
      const node = element.shadowRoot.querySelectorAll('anypoint-radio-button')[1];
      const spy = sinon.spy();
      element.addEventListener('change', spy);
      node.click();
      assert.isTrue(spy.called);
    });
  });

  describe('Restoring settings', () => {
    it('sets selected when settings are restored', async () => {
      const element = await basicFixture();
      await untilAfterQuery(element);
      element.restore({
        id: 'test'
      });
      assert.equal(element.selected, 'test');
    });

    it('sets undefined when no argument', async () => {
      const element = await basicFixture();
      await untilAfterQuery(element);
      element.restore(undefined);
      assert.isUndefined(element.selected);
    });
  });

  describe('serialize()', () => {
    let element = /** @type CcAuthorizationMethodElement */ (null);
    before(async () => {
      await store.insertCertificates();
    });

    after(async () => {
      await store.destroyClientCertificates();
    });

    beforeEach(async () => {
      element = await queryDataFixture();
    });

    it('returns empty object when no selection', () => {
      const result = element.serialize();
      // @ts-ignore
      assert.deepEqual(result, {});
    });

    it('returns current selection', () => {
      const node = element.shadowRoot.querySelectorAll('anypoint-radio-button')[1];
      node.click();
      const result = element.serialize();
      assert.deepEqual(result, {
        id: node.dataset.id
      });
    });
  });

  describe('#importButton', () => {
    it('does not render import button by default', async () => {
      const element = await basicFixture();
      const button = element.shadowRoot.querySelector('anypoint-button');
      assert.notOk(button);
    });

    it('renders import button with importButton', async () => {
      const element = await importButtonFixture();
      const button = element.shadowRoot.querySelector('anypoint-button');
      assert.ok(button);
    });

    it('dispatches navigation event when clicked', async () => {
      const element = await importButtonFixture();
      const spy = sinon.spy();
      window.addEventListener(ArcNavigationEventTypes.navigate, spy);
      const button = element.shadowRoot.querySelector('anypoint-button');
      button.click();
      assert.isTrue(spy.called, 'event is called');
      assert.equal(spy.args[0][0].route, 'client-certificate-import');
    });
  });
});
