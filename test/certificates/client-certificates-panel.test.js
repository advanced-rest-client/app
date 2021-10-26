import { fixture, assert, html, nextFrame, aTimeout } from '@open-wc/testing';
import sinon from 'sinon';
import { ArcMock } from '@advanced-rest-client/arc-mock';
import { ClientCertificateModel, MockedStore } from '@advanced-rest-client/idb-store';
import { DataExportEventTypes, ImportEvents, ArcModelEvents, ArcModelEventTypes  } from '@advanced-rest-client/events';
import { doExportItems } from '../../src/elements/certificates/ClientCertificatesPanelElement.js';
import '../../define/client-certificates-panel.js';

/** @typedef {import('../../').ClientCertificatesPanelElement} ClientCertificatesPanelElement */
/** @typedef {import('@advanced-rest-client/events').ClientCertificate.Certificate} Certificate */

describe('ClientCertificatesPanelElement', () => {
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
   * @returns {Promise<ClientCertificatesPanelElement>}
   */
  async function basicFixture() {
    return fixture(html`<client-certificates-panel></client-certificates-panel>`);
  }

  /**
   * @returns {Promise<ClientCertificatesPanelElement>}
   */
  async function queryDataFixture() {
    const elmRequest = fixture(html`<client-certificates-panel></client-certificates-panel>`);
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
        setTimeout(() => resolve());
      });
      element.reset();
    });
  }

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

    it('import button renders import element', async () => {
      const element = await basicFixture();
      await untilAfterQuery(element);
      const button = element.shadowRoot.querySelector('[data-action="empty-add-cert"]');
      /** @type HTMLElement */ (button).click();
      await nextFrame();
      const node = element.shadowRoot.querySelector('certificate-import');
      assert.ok(node);
    });
  });

  describe('Data list', () => {
    before(async () => {
      await store.insertCertificates();
    });

    after(async () => {
      await store.destroyClientCertificates();
    });

    let element = /** @type ClientCertificatesPanelElement */ (null);
    beforeEach(async () => {
      element = await queryDataFixture();
    });

    it('has items set', () => {
      assert.lengthOf(element.items, 15);
    });

    it('renders list items', () => {
      const nodes = element.shadowRoot.querySelectorAll('.list-item');
      assert.lengthOf(nodes, 15);
    });

    it('does not render empty state', async () => {
      const node = element.shadowRoot.querySelector('.empty-screen');
      assert.notOk(node);
    });
  });

  describe('datastore-destroyed event handler', () => {
    let element = /** @type ClientCertificatesPanelElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
      // @ts-ignore
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
    let element = /** @type ClientCertificatesPanelElement */ (null);
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
    let element = /** @type ClientCertificatesPanelElement */ (null);
    before(async () => {
      await store.insertCertificates(5);
    });

    after(async () => {
      await store.destroyClientCertificates();
    });

    beforeEach(async () => {
      element = await queryDataFixture();
    });

    it('removes existing item', () => {
      const item = element.items[0];
      ArcModelEvents.ClientCertificate.State.delete(document.body, item._id, item._rev);
      assert.lengthOf(element.items, 4);
    });

    it('ignores when not on the list', () => {
      ArcModelEvents.ClientCertificate.State.delete(document.body, 'some-id', 'some-rev');
      assert.lengthOf(element.items, 5);
    });
  });

  describe(`${ArcModelEventTypes.ClientCertificate.State.update} event handler`, () => {
    let element = /** @type ClientCertificatesPanelElement */ (null);
    before(async () => {
      await store.insertCertificates(5);
    });

    after(async () => {
      await store.destroyClientCertificates();
    });

    beforeEach(async () => {
      element = await queryDataFixture();
    });

    it('updates existing item', () => {
      let item = element.items[0];
      item = { ...item};
      item.name = 'test';
      const record = {
        item,
        id: item._id,
        rev: 'test',
      };
      // @ts-ignore
      ArcModelEvents.ClientCertificate.State.update(document.body, record);
      assert.equal(element.items[0].name, 'test');
    });

    it('Adds new item to the list', () => {
      const item = generator.certificates.clientCertificate();
      // @ts-ignore
      item._id = '6_';
      const record = {
        item,
        // @ts-ignore
        id: item._id,
        rev: 'test',
      };
      // @ts-ignore
      ArcModelEvents.ClientCertificate.State.update(document.body, record);
      assert.lengthOf(element.items, 6);
    });
  });

  describe('Details rendering', () => {
    before(async () => {
      await store.insertCertificates(5);
    });

    after(async () => {
      await store.destroyClientCertificates();
    });

    let element = /** @type ClientCertificatesPanelElement */ (null);
    beforeEach(async () => {
      element = await queryDataFixture();
    });

    it('opens detail dialog when detail button is clicked', async () => {
      const node = element.shadowRoot.querySelector('.list-item anypoint-button');
      /** @type HTMLElement */ (node).click();
      await nextFrame();
      assert.equal(element.openedDetailsId, element.items[0]._id, 'openedDetailsId is set');
      assert.isTrue(element.certDetailsOpened);
    });

    it('sets certId on details panel', async () => {
      const button = element.shadowRoot.querySelector('.list-item anypoint-button');
      /** @type HTMLElement */ (button).click();
      await nextFrame();
      const node = element.shadowRoot.querySelector('certificate-details');
      assert.equal(node.certId, element.items[0]._id);
    });
  });

  describe('Export certificates flow', () => {
    before(async () => {
      await store.insertCertificates(5);
    });

    after(async () => {
      await store.destroyClientCertificates();
    });

    let element = /** @type ClientCertificatesPanelElement */ (null);
    beforeEach(async () => {
      element = await queryDataFixture();
    });

    it('opens export options when menu item is clicked', () => {
      const button = element.shadowRoot.querySelector('[data-action="export-all"]');
      /** @type HTMLElement */ (button).click();
      assert.isTrue(element.exportOptionsOpened, 'sets _exportOptionsOpened');
    });

    it('cancels the export ', async () => {
      const button = element.shadowRoot.querySelector('[data-action="export-all"]');
      /** @type HTMLElement */ (button).click();
      await nextFrame();
      const node = element.shadowRoot.querySelector('export-options');
      node.dispatchEvent(new CustomEvent('cancel'));
      assert.isFalse(element.exportOptionsOpened);
    });

    it('accepts export and dispatches event ', async () => {
      const button = element.shadowRoot.querySelector('[data-action="export-all"]');
      /** @type HTMLElement */ (button).click();
      await nextFrame();
      const spy = sinon.spy();
      element.addEventListener(DataExportEventTypes.nativeData, spy);
      const node = element.shadowRoot.querySelector('export-options');
      node.dispatchEvent(new CustomEvent('accept', {
        detail: {
          exportOptions: {},
          providerOptions: {}
        }
      }));
      assert.isTrue(spy.called);
    });
  });

  describe('[doExportItems]()', () => {
    let element = /** @type ClientCertificatesPanelElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
      const items = generator.certificates.clientCertificates(5);
      await untilAfterQuery(element, items);
    });

    it('dispatches the export event', (done) => {
      window.addEventListener(DataExportEventTypes.nativeData, function f() {
        window.removeEventListener(DataExportEventTypes.nativeData, f);
        done();
      });
      element[doExportItems]({ provider: 'file' }, { file: 'test.json' });
    });

    it('renders error message when no export adapter', async () => {
      await element[doExportItems]({ provider: 'file' }, { file: 'test.json' });
      await nextFrame();
      const node = element.shadowRoot.querySelector('.error-message');
      assert.ok(node);
    });
  });

  describe('All data delete', () => {
    before(async () => {
      await store.insertCertificates(5);
    });

    after(async () => {
      await store.destroyClientCertificates();
    });

    let element = /** @type ClientCertificatesPanelElement */ (null);
    beforeEach(async () => {
      element = await queryDataFixture();
    });

    it('opens delete confirmation dialog', () => {
      const node = element.shadowRoot.querySelector('[data-action="delete-all"]');
      /** @type HTMLElement */ (node).click();
      const dialog = element.shadowRoot.querySelector('#dataClearDialog');
      // @ts-ignore
      assert.isTrue(dialog.opened);
    });

    it('requests file export', async () => {
      const spy = sinon.spy();
      element.addEventListener(DataExportEventTypes.nativeData, spy);
      const node = element.shadowRoot.querySelector('[data-action="delete-export-all"]');
      /** @type HTMLElement */ (node).click();
      assert.isTrue(spy.calledOnce);
    });

    it('does not delete data when dialog is cancelled', async () => {
      const dialog = element.shadowRoot.querySelector('#dataClearDialog');
      // @ts-ignore
      dialog.opened = true;
      await nextFrame();
      const spy = sinon.spy();
      element.addEventListener(ArcModelEventTypes.destroy, spy);
      /** @type HTMLElement */ (element).click();
      await aTimeout(100);
      // @ts-ignore
      assert.isFalse(dialog.opened);
      assert.isFalse(spy.called);
    });

    it('clears the data store when accepted', async () => {
      const spy = sinon.spy();
      element.addEventListener(ArcModelEventTypes.destroy, spy);
      const dialog = element.shadowRoot.querySelector('#dataClearDialog');
      // @ts-ignore
      dialog.opened = true;
      await nextFrame();
      const node = element.shadowRoot.querySelector('[data-dialog-confirm]');
      /** @type HTMLElement */ (node).click();
      await aTimeout(150);
      // @ts-ignore
      assert.isFalse(dialog.opened, 'dialog is not opened');
      assert.isTrue(spy.called, 'delete event is dispatched');
    });
  });
});
