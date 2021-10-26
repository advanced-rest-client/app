import { fixture, assert, html, nextFrame, oneEvent } from '@open-wc/testing';
import sinon from 'sinon';
import { ClientCertificateModel, MockedStore } from '@advanced-rest-client/idb-store';
import { certFileHandler, keyFileHandler } from '../../src/elements/certificates/CertificateImportElement.js';
import '../../define/certificate-import.js';
import * as Interactions from '../MockInteractions.js';

/** @typedef {import('../../').CertificateImportElement} CertificateImportElement */
/** @typedef {import('@advanced-rest-client/events').ClientCertificate.Certificate} Certificate */

describe('CertificateImportElement', () => {
  const store = new MockedStore();
  const model = new ClientCertificateModel();

  before(() => {
    model.listen(window);
  });

  after(() => {
    model.unlisten(window);
  });

  /**
   * @returns {File}
   */
  function generateTestFile() {
    const blob = /** @type File */ (new Blob(['test']));
    // @ts-ignore
    blob.name = 'test';
    return blob;
  }

  /**
   * @returns {Promise<CertificateImportElement>}
   */
  async function basicFixture() {
    return fixture(html`<certificate-import></certificate-import>`);
  }

  /**
   * @param {string} type
   * @returns {Promise<CertificateImportElement>}
   */
  async function typeFixture(type) {
    return fixture(html`<certificate-import .importType="${type}" page="1"></certificate-import>`);
  }

  /**
   * @param {string} type
   * @returns {Promise<CertificateImportElement>}
   */
  async function filesFixture(type) {
    const blob = generateTestFile();
    return fixture(html`<certificate-import .importType="${type}" page="1" .certificateFile="${blob}" .keyFile="${blob}"></certificate-import>`);
  }

  /**
   * @param {string} type
   * @returns {Promise<CertificateImportElement>}
   */
  async function modelFilesFixture(type) {
    const blob = generateTestFile();
    return fixture(html`<certificate-import .importType="${type}" page="1" .certificateFile="${blob}" .keyFile="${blob}"></certificate-import>`);
  }

  describe('pages rendering', () => {
    let element = /** @type CertificateImportElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('renders default (start) page', () => {
      const node = element.shadowRoot.querySelector('.type-options');
      assert.ok(node);
    });

    it('switches to import page when p12 button click', async () => {
      const button = element.shadowRoot.querySelector('.cert-type-option[data-type=p12]');
      Interactions.tap(button);
      await oneEvent(button, 'transitionend');
      assert.equal(element.page, 1, 'page is switched');
      assert.equal(element.importType, 'p12', 'importType is set');
    });

    it('switches to import page when pem button click', async () => {
      const button = element.shadowRoot.querySelector('.cert-type-option[data-type=pem]');
      Interactions.tap(button);
      await oneEvent(button, 'transitionend');
      assert.equal(element.page, 1, 'page is switched');
      assert.equal(element.importType, 'pem', 'importType is set');
    });
  });

  describe('Import rendering options', () => {
    describe('PEM certificate', () => {
      let element = /** @type CertificateImportElement */ (null);
      beforeEach(async () => {
        element = await typeFixture('pem');
      });

      it('renders name field', () => {
        const node = element.shadowRoot.querySelector('anypoint-input[name=name]');
        assert.ok(node);
      });

      it('renders certificate trigger button', () => {
        const node = element.shadowRoot.querySelector('.cert-file[data-type=cert] anypoint-button');
        assert.ok(node);
      });

      it('does not renders password switch button for certificate', () => {
        const node = element.shadowRoot.querySelector('anypoint-switch[data-type=cert]');
        assert.notOk(node);
      });

      it('renders key trigger button', () => {
        const node = element.shadowRoot.querySelector('.cert-file[data-type=key] anypoint-button');
        assert.ok(node);
      });

      it('renders password switch button for key', () => {
        const node = element.shadowRoot.querySelector('anypoint-switch[data-type=key]');
        assert.ok(node);
      });

      it('renders import button', () => {
        const node = element.shadowRoot.querySelector('.action-button anypoint-button');
        assert.ok(node);
      });

      it('import button is disabled by default', () => {
        const node = /** @type HTMLButtonElement */ (element.shadowRoot.querySelector('.action-button anypoint-button'));
        assert.isTrue(node.disabled);
      });

      it('renders file details instead of certificate trigger button', async () => {
        const blob = generateTestFile();
        element.certificateFile = blob;
        await nextFrame();
        const button = element.shadowRoot.querySelector('.cert-file[data-type=cert] anypoint-button');
        assert.notOk(button, 'trigger button is not rendered');
        const iconButton = element.shadowRoot.querySelector('.cert-file[data-type=cert] anypoint-icon-button');
        assert.ok(iconButton, 'delete button is rendered');
      });

      it('certificate delete button clear the file', async () => {
        const blob = generateTestFile();
        element.certificateFile = blob;
        await nextFrame();
        const iconButton = element.shadowRoot.querySelector('.cert-file[data-type=cert] anypoint-icon-button');
        /** @type HTMLElement */ (iconButton).click();
        assert.notOk(element.certificateFile);
      });

      it('renders file details instead of key trigger button', async () => {
        const blob = generateTestFile();
        element.keyFile = blob;
        await nextFrame();
        const button = element.shadowRoot.querySelector('.cert-file[data-type=key] anypoint-button');
        assert.notOk(button, 'trigger button is not rendered');
        const iconButton = element.shadowRoot.querySelector('.cert-file[data-type=key] anypoint-icon-button');
        assert.ok(iconButton, 'delete button is rendered');
      });

      it('certificate delete button clear the file', async () => {
        const blob = generateTestFile();
        element.keyFile = blob;
        await nextFrame();
        const iconButton = element.shadowRoot.querySelector('.cert-file[data-type=key] anypoint-icon-button');
        /** @type HTMLElement */ (iconButton).click();
        assert.notOk(element.keyFile);
      });
    });

    describe('p12 certificate', () => {
      let element = /** @type CertificateImportElement */ (null);
      beforeEach(async () => {
        element = await typeFixture('p12');
      });

      it('renders name field', () => {
        const node = element.shadowRoot.querySelector('anypoint-input[name=name]');
        assert.ok(node);
      });

      it('renders certificate trigger button', () => {
        const node = element.shadowRoot.querySelector('.cert-file[data-type=cert] anypoint-button');
        assert.ok(node);
      });

      it('renders password switch button for certificate', () => {
        const node = element.shadowRoot.querySelector('anypoint-switch[data-type=cert]');
        assert.ok(node);
      });

      it('does no render key trigger button', () => {
        const node = element.shadowRoot.querySelector('.cert-file[data-type=key] anypoint-button');
        assert.notOk(node);
      });

      it('does not render password switch button for key', () => {
        const node = element.shadowRoot.querySelector('anypoint-switch[data-type=key]');
        assert.notOk(node);
      });

      it('renders import button', () => {
        const node = element.shadowRoot.querySelector('.action-button anypoint-button');
        assert.ok(node);
      });

      it('import button is disabled by default', () => {
        const node = /** @type HTMLButtonElement */ (element.shadowRoot.querySelector('.action-button anypoint-button'));
        assert.isTrue(node.disabled);
      });
    });

    describe('import button state', () => {
      it('is disabled when no file', async () => {
        const element = await typeFixture('p12');
        const button = /** @type HTMLButtonElement */ (element.shadowRoot.querySelector('.action-button anypoint-button'));
        assert.isTrue(button.disabled);
      });

      it('is not disabled when has p12 file', async () => {
        const element = await typeFixture('p12');
        const blob = generateTestFile();
        element.certificateFile = blob;
        await nextFrame();
        const button = /** @type HTMLButtonElement */ (element.shadowRoot.querySelector('.action-button anypoint-button'));
        assert.isFalse(button.disabled);
      });

      it('is not disabled when has pem cert and key files', async () => {
        const element = await typeFixture('pem');
        const blob = generateTestFile();
        element.certificateFile = blob;
        element.keyFile = blob;
        await nextFrame();
        const button = /** @type HTMLButtonElement */ (element.shadowRoot.querySelector('.action-button anypoint-button'));
        assert.isFalse(button.disabled);
      });

      it('is disabled when missing pem file', async () => {
        const element = await typeFixture('pem');
        const blob = generateTestFile();
        element.keyFile = blob;
        await nextFrame();
        const button = /** @type HTMLButtonElement */ (element.shadowRoot.querySelector('.action-button anypoint-button'));
        assert.isTrue(button.disabled);
      });
    });

    describe('getConfig()', () => {
      describe('PEM certificate', () => {
        let element = /** @type CertificateImportElement */ (null);
        beforeEach(async () => {
          element = await filesFixture('pem');
        });

        it('returns basic data', async () => {
          const result = await element.getConfig();
          assert.typeOf(result, 'object', 'Result is an object');
          assert.equal(result.name, '', 'has empty name');
          assert.equal(result.type, 'pem', 'has type');
          assert.typeOf(result.cert, 'object', 'has cert');
          assert.typeOf(result.key, 'object', 'has key');
        });

        it('generates certificate data', async () => {
          const result = await element.getConfig();
          const item = /** @type Certificate */ (result.cert);
          assert.typeOf(item, 'object', 'cert is an object');
          assert.typeOf(item.data, 'string', 'has data as string');
          assert.isUndefined(item.passphrase);
        });

        it('ignores passphrase when _certificateHasPassword is not set', async () => {
          const result = await element.getConfig();
          const item = /** @type Certificate */ (result.cert);
          assert.typeOf(item, 'object', 'cert is an object');
          assert.typeOf(item.data, 'string', 'has data as string');
          assert.isUndefined(item.passphrase);
        });

        it('generates key data', async () => {
          const result = await element.getConfig();
          const item = /** @type Certificate */ (result.key);
          assert.typeOf(item, 'object', 'key is an object');
          assert.typeOf(item.data, 'string', 'has data as string');
          assert.isUndefined(item.passphrase);
        });

        it('generates key data with passphrase when keyHasPassword is set', async () => {
          const button = element.shadowRoot.querySelector('anypoint-switch[data-type=key]');
          /** @type HTMLElement */ (button).click();
          await nextFrame();
          const input = /** @type HTMLInputElement */ (element.shadowRoot.querySelector('anypoint-masked-input[name=keyPassword]'));
          input.value = 'test';
          input.dispatchEvent(new CustomEvent('change'));
          const result = await element.getConfig();
          const item = /** @type Certificate */ (result.key);
          assert.equal(item.passphrase, 'test');
        });

        it('generates key data with default passphrase ', async () => {
          const button = element.shadowRoot.querySelector('anypoint-switch[data-type=key]');
          /** @type HTMLElement */ (button).click();
          await nextFrame();
          const result = await element.getConfig();
          const item = /** @type Certificate */ (result.key);
          assert.equal(item.passphrase, '');
        });
      });

      describe('p12 certificate', () => {
        let element = /** @type CertificateImportElement */ (null);
        beforeEach(async () => {
          element = await filesFixture('p12');
        });

        it('returns basic data', async () => {
          const result = await element.getConfig();
          assert.typeOf(result, 'object', 'Result is an object');
          assert.equal(result.name, '', 'has empty name');
          assert.equal(result.type, 'p12', 'has type');
          assert.typeOf(result.cert, 'object', 'has cert');
          assert.isUndefined(result.key, 'key is not set');
        });

        it('generates certificate data', async () => {
          const result = await element.getConfig();
          const item = /** @type Certificate */ (result.cert);
          assert.typeOf(item, 'object', 'cert is an object');
          assert.typeOf(item.data, 'uint8array', 'has data as array');
          assert.isUndefined(item.passphrase);
        });

        it('generates cert data with passphrase when certificateHasPassword is set', async () => {
          const button = element.shadowRoot.querySelector('anypoint-switch[data-type=cert]');
          /** @type HTMLElement */ (button).click();
          await nextFrame();
          const input = /** @type HTMLInputElement */ (element.shadowRoot.querySelector('anypoint-masked-input[name=certificatePassword]'));
          input.value = 'test';
          input.dispatchEvent(new CustomEvent('change'));
          const result = await element.getConfig();
          const item = /** @type Certificate */ (result.cert);
          assert.equal(item.passphrase, 'test');
        });

        it('generates cert data with default passphrase', async () => {
          const button = element.shadowRoot.querySelector('anypoint-switch[data-type=cert]');
          /** @type HTMLElement */ (button).click();
          await nextFrame();
          const result = await element.getConfig();
          const item = /** @type Certificate */ (result.cert);
          assert.equal(item.passphrase, '');
        });
      });
    });
  });

  describe('Canceling import flow', () => {
    let element = /** @type CertificateImportElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('dispatches close event when cancel button is pressed', () => {
      const spy = sinon.spy();
      element.addEventListener('close', spy);
      const button = element.shadowRoot.querySelector('[data-action="cancel-header"]');
      /** @type HTMLElement */ (button).click();
      assert.isTrue(spy.called);
    });

    it('sets page to 0', () => {
      element.cancel();
      assert.equal(element.page, 0);
    });
  });

  describe('Import flow', () => {
    before(async () => {
      await store.destroyClientCertificates();
    });

    after(async () => {
      await store.destroyClientCertificates();
    });

    it('imports new certificate', async () => {
      const element = await modelFilesFixture('p12');
      await element.accept();
      const items = await store.getDatastoreClientCertificates();
      const [index, data] = items;
      assert.lengthOf(index, 1, 'Has an index item');
      assert.lengthOf(data, 1, 'Has a data item');
    });

    it('calls accept() when import is clicked', async () => {
      const element = await filesFixture('p12');
      const spy = sinon.spy(element, 'accept');
      const button = element.shadowRoot.querySelector('[data-action="accept"]');
      /** @type HTMLElement */ (button).click();
      assert.isTrue(spy.called);
    });

    it('ignores accept event when not valid', async () => {
      const element = await typeFixture('p12');
      const spy = sinon.spy();
      element.addEventListener('accept', spy);
      assert.notOk(element.loading);
    });
  });

  describe('native file input handlers', () => {
    let element = /** @type CertificateImportElement */ (null);
    let file;
    beforeEach(async () => {
      element = await filesFixture('pem');
      file = generateTestFile();
    });

    it('sets _certificateFile data from field event', () => {
      element.certificateFile = file;
      const input = element.shadowRoot.querySelector('#cf');
      input.dispatchEvent(new CustomEvent('change'));
      assert.notOk(element.certificateFile);
    });

    it('sets _certificateFile data', () => {
      element[certFileHandler]({
        target: {
          // @ts-ignore
          files: [file],
        }
      });
      assert.equal(element.certificateFile, file);
    });

    it('sets _keyFile data from field event', () => {
      element.keyFile = file;
      const input = element.shadowRoot.querySelector('#kf');
      input.dispatchEvent(new CustomEvent('change'));
      assert.notOk(element.keyFile);
    });

    it('sets _keyFile data', () => {
      element[keyFileHandler]({
        target: {
          // @ts-ignore
          files: [file]
        }
      });
      assert.equal(element.keyFile, file);
    });
  });
});
