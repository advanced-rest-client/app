import { fixture, assert, html, nextFrame } from '@open-wc/testing';
import * as sinon from 'sinon';
import {
  DataExportEventTypes,
} from '@advanced-rest-client/events';
import '../../define/arc-export-form.js';
import { loadingProperty } from '../../src/elements/import-export/ArcExportFormElement.js';

/** @typedef {import('../../').ArcExportFormElement} ArcExportFormElement */
/** @typedef {import('@anypoint-web-components/awc').AnypointCheckboxElement} AnypointCheckbox */
/** @typedef {import('@advanced-rest-client/events').ArcDataExportEvent} ArcDataExportEvent */

describe('ArcDataExport', () => {
  /**
   * @return {Promise<ArcExportFormElement>}
   */
  async function basicFixture() {
    return fixture(html`<arc-export-form></arc-export-form>`);
  }

  /**
   * @return {Promise<ArcExportFormElement>}
   */
  async function fileFixture() {
    return fixture(html`<arc-export-form provider="file" file="test.file"></arc-export-form>`);
  }

  /**
   * @return {Promise<ArcExportFormElement>}
   */
  async function driveFixture() {
    return fixture(html`<arc-export-form provider="drive"></arc-export-form>`);
  }

  /**
   * @return {Promise<ArcExportFormElement>}
   */
  async function encryptFixture() {
    return fixture(html`<arc-export-form withEncrypt encryptFile provider="file"></arc-export-form>`);
  }

  describe('view rendering', () => {
    it('renders skip import checkbox', async () => {
      const element = await basicFixture();
      const input = element.shadowRoot.querySelector('anypoint-checkbox[name="skipImport"]');
      assert.ok(input);
    });

    it('does not render encrypt file checkbox by default', async () => {
      const element = await basicFixture();
      const input = element.shadowRoot.querySelector('anypoint-checkbox[name="encryptFile"]');
      assert.notOk(input);
    });

    it('does not render password input by default', async () => {
      const element = await basicFixture();
      const input = element.shadowRoot.querySelector('anypoint-masked-input[name="passphrase"]');
      assert.notOk(input);
    });

    it('renders encrypt file checkbox', async () => {
      const element = await encryptFixture();
      const input = element.shadowRoot.querySelector('anypoint-checkbox[name="encryptFile"]');
      assert.ok(input);
    });

    it('renders password field', async () => {
      const element = await encryptFixture();
      element.encryptFile = true;
      await nextFrame();
      const input = element.shadowRoot.querySelector('anypoint-masked-input[name="passphrase"]');
      assert.ok(input);
    });

    it('renders provider dropdown', async () => {
      const element = await basicFixture();
      const input = element.shadowRoot.querySelector('anypoint-dropdown-menu[name="provider"]');
      assert.ok(input);
    });

    it('renders file name input', async () => {
      const element = await fileFixture();
      const input = element.shadowRoot.querySelector('anypoint-input[name="file"]');
      assert.ok(input);
    });

    it('does not render parent input by default', async () => {
      const element = await fileFixture();
      const input = element.shadowRoot.querySelector('anypoint-input[name="parentId"]');
      assert.notOk(input);
    });

    it('renders parent name input when drive is selected', async () => {
      const element = await driveFixture();
      const input = element.shadowRoot.querySelector('anypoint-input[name="parentId"]');
      assert.ok(input);
    });

    it('renders action button', async () => {
      const element = await basicFixture();
      const buttons = element.shadowRoot.querySelectorAll('.actions anypoint-button');
      assert.equal(buttons.length, 1);
    });
  });

  describe('constructor()', () => {
    let element = /** @type ArcExportFormElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('sets file property', () => {
      assert.include(element.file, 'arc-data-export-');
    });
  });

  describe('selectAll()', () => {
    let element = /** @type ArcExportFormElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('selects deselected checkboxes', () => {
      const nodes = /** @type NodeListOf<AnypointCheckbox> */ (element.shadowRoot.querySelectorAll('form anypoint-checkbox'));
      nodes[0].checked = false;
      element.selectAll();
      assert.isTrue(nodes[0].checked);
    });
  });

  describe('startExport()', () => {
    it('throws error when no provider selection', async () => {
      const element = await basicFixture();
      let message;
      try {
        await element.startExport();
      } catch (e) {
        message = e.message;
      }
      assert.equal(message, 'Export provider is not set');
    });

    it('throws error when no passphrase', async () => {
      const element = await encryptFixture();
      let message;
      try {
        await element.startExport();
      } catch (e) {
        message = e.message;
      }
      assert.equal(message, 'The passphrase is required with encryption.');
    });

    it('throws error when no file name', async () => {
      const element = await fileFixture();
      element.file = '';
      let message;
      try {
        await element.startExport();
      } catch (e) {
        message = e.message;
      }
      assert.equal(message, 'The file name is required.');
    });

    it('dispatches native export event', async () => {
      const element = await fileFixture();
      const spy = sinon.spy();
      element.addEventListener(DataExportEventTypes.nativeData, spy);
      await element.startExport();
      assert.isTrue(spy.called);
    });

    it('has export data set', async () => {
      const element = await fileFixture();
      const spy = sinon.spy();
      element.addEventListener(DataExportEventTypes.nativeData, spy);
      await element.startExport();
      const e = /** @type ArcDataExportEvent */ (spy.args[0][0]);
      assert.typeOf(e.exportOptions, 'object', 'has export options');
      assert.typeOf(e.providerOptions, 'object', 'has provider options');
      assert.typeOf(e.data, 'object', 'has the data');
    });

    it('opens the success message', async () => {
      const element = await fileFixture();
      await element.startExport();
      const info = element.shadowRoot.querySelector('.confirmation.success');
      assert.ok(info);
    });

    it('opens the error message', async () => {
      const element = await basicFixture();
      try {
        await element.startExport();
      } catch (e) {
        // ...
      }
      const info = element.shadowRoot.querySelector('.confirmation.error');
      assert.ok(info);
    });

    it('calls startExport() from action button', async () => {
      const element = await fileFixture();
      const button = /** @type HTMLElement */ (element.shadowRoot.querySelector('.actions anypoint-button'));
      const spy = sinon.spy(element, 'startExport');
      button.click();
      assert.isTrue(spy.calledOnce);
    });
  });

  describe('onloadingchange', () => {
    let element = /** @type ArcExportFormElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Getter returns previously registered handler', () => {
      assert.isUndefined(element.onloadingchange);
      const f = () => {};
      element.onloadingchange = f;
      assert.isTrue(element.onloadingchange === f);
    });

    it('Calls registered function', () => {
      let called = false;
      const f = () => {
        called = true;
      };
      element.onloadingchange = f;
      element[loadingProperty] = true;
      element.onloadingchange = null;
      assert.isTrue(called);
    });

    it('Unregisteres old function', () => {
      let called1 = false;
      let called2 = false;
      const f1 = () => {
        called1 = true;
      };
      const f2 = () => {
        called2 = true;
      };
      element.onloadingchange = f1;
      element.onloadingchange = f2;
      element[loadingProperty] = true;
      element.onloadingchange = null;
      assert.isFalse(called1);
      assert.isTrue(called2);
    });
  });

  describe('onarcnativeexport', () => {
    let element = /** @type ArcExportFormElement */ (null);
    beforeEach(async () => {
      element = await fileFixture();
    });

    it('getter returns previously registered handler', () => {
      assert.isUndefined(element.onarcnativeexport);
      const f = () => {};
      element.onarcnativeexport = f;
      assert.isTrue(element.onarcnativeexport === f);
    });

    it('calls registered function', async () => {
      let called = false;
      const f = () => {
        called = true;
      };
      element.onarcnativeexport = f;
      await element.startExport();
      element.onarcnativeexport = null;
      assert.isTrue(called);
    });

    it('unregisteres old function', async () => {
      let called1 = false;
      let called2 = false;
      const f1 = () => {
        called1 = true;
      };
      const f2 = () => {
        called2 = true;
      };
      element.onarcnativeexport = f1;
      element.onarcnativeexport = f2;
      await element.startExport();
      element.onarcnativeexport = null;
      assert.isFalse(called1);
      assert.isTrue(called2);
    });
  });
});
