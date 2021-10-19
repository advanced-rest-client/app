import { fixture, assert, aTimeout, nextFrame, html } from '@open-wc/testing';
import sinon from 'sinon';
import { GoogleDriveEventTypes } from '@advanced-rest-client/arc-events';
import '../../define/export-options.js';
import { driveSuggestionsValue, parentNameValue } from '../../src/ExportPanelBase.js'

/** @typedef {import('../../').ExportOptionsElement} ExportOptionsElement */
/** @typedef {import('@anypoint-web-components/anypoint-input').AnypointInput} AnypointInput */

describe('ExportOptionsElement', () => {
  /**
   * @return {Promise<ExportOptionsElement>}
   */
  async function basicFixture() {
    return (fixture(html`<export-options></export-options>`));
  }

  /**
   * @return {Promise<ExportOptionsElement>}
   */
  async function validFixture() {
    return (fixture(html`<export-options
      file="test-file"
      provider="file"></export-options>`));
  }

  /**
   * @return {Promise<ExportOptionsElement>}
   */
  async function fullDriveFixture() {
    return (fixture(html`
    <export-options
      file="test-file.json"
      provider="drive"
      skipImport
      parentId="test"
      withEncrypt
      encryptFile
      passphrase="test-passwd"
    ></export-options>`));
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
      const element = await fullDriveFixture();
      const input = element.shadowRoot.querySelector('anypoint-checkbox[name="encryptFile"]');
      assert.ok(input);
    });

    it('renders password field', async () => {
      const element = await fullDriveFixture();
      const input = element.shadowRoot.querySelector('anypoint-masked-input[name="passphrase"]');
      assert.ok(input);
    });

    it('renders provider dropdown', async () => {
      const element = await basicFixture();
      const input = element.shadowRoot.querySelector('anypoint-dropdown-menu[name="provider"]');
      assert.ok(input);
    });

    it('renders file name input', async () => {
      const element = await basicFixture();
      const input = element.shadowRoot.querySelector('anypoint-input[name="file"]');
      assert.ok(input);
    });

    it('does not render parent input by default', async () => {
      const element = await basicFixture();
      const input = element.shadowRoot.querySelector('anypoint-input[name="parentId"]');
      assert.notOk(input);
    });

    it('renders parent name input when drive is selected', async () => {
      const element = await fullDriveFixture();
      const input = element.shadowRoot.querySelector('anypoint-input[name="parentId"]');
      assert.ok(input);
    });

    it('renders action buttons', async () => {
      const element = await basicFixture();
      const buttons = element.shadowRoot.querySelectorAll('.actions anypoint-button');
      assert.equal(buttons.length, 2);
    });
  });

  describe('google drive support', () => {
    let element = /** @type ExportOptionsElement */ (null);
    beforeEach(async () => {
      element = await validFixture();
    });

    it('sets isDrive when provider changes', () => {
      assert.isFalse(element.isDrive);
      element.provider = 'drive';
      assert.isTrue(element.isDrive);
    });

    it('dispatches google drive folders list event', () => {
      const spy = sinon.spy();
      element.addEventListener(GoogleDriveEventTypes.listAppFolders, spy);
      element.provider = 'drive';
      assert.isTrue(spy.called);
    });

    it('sets driveFolders from the event', async () => {
      const folders = [{ id: '1', name: '2' }];
      element.addEventListener(GoogleDriveEventTypes.listAppFolders, (e) => {
        e.preventDefault();
        // @ts-ignore
        e.detail.result = Promise.resolve(folders);
      });
      element.provider = 'drive';
      await aTimeout(1);
      assert.deepEqual(folders, element.driveFolders);
    });

    it('sets drive suggestions value', async () => {
      const folders = [{ id: '1', name: '1' }, { name: '2' }, { id: '3' }, undefined];
      element.addEventListener(GoogleDriveEventTypes.listAppFolders, (e) => {
        e.preventDefault();
        // @ts-ignore
        e.detail.result = Promise.resolve(folders);
      });
      element.provider = 'drive';
      await aTimeout(1);
      assert.deepEqual(element[driveSuggestionsValue], [{ value: '1' }]);
    });

    it('resets suggestions when no folders', async () => {
      element.driveFolders = [{ id: '1', name: '1' }];
      const folders = [];
      element.addEventListener(GoogleDriveEventTypes.listAppFolders, (e) => {
        e.preventDefault();
        // @ts-ignore
        e.detail.result = Promise.resolve(folders);
      });
      element.provider = 'drive';
      await aTimeout(1);
      assert.isUndefined(element[driveSuggestionsValue]);
    });

    it('resets suggestions when query error', async () => {
      element.driveFolders = [{ id: '1', name: '1' }];
      element.addEventListener(GoogleDriveEventTypes.listAppFolders, (e) => {
        e.preventDefault();
        // @ts-ignore
        e.detail.result = Promise.reject(new Error('test'));
      });
      element.provider = 'drive';
      await aTimeout(1);
      assert.isUndefined(element[driveSuggestionsValue]);
    });

    it('sets drive folder name when folders change', async () => {
      element.parentId = '1';
      const folders = [{ id: '1', name: '1-name' }];
      element.addEventListener(GoogleDriveEventTypes.listAppFolders, (e) => {
        e.preventDefault();
        // @ts-ignore
        e.detail.result = Promise.resolve(folders);
      });
      element.provider = 'drive';
      await aTimeout(1);
      assert.equal(element[parentNameValue], '1-name');
    });
  });

  describe('user input', () => {
    let element = /** @type ExportOptionsElement */ (null);
    beforeEach(async () => {
      element = await validFixture();
    });

    it('sets file name property', () => {
      const input = /** @type AnypointInput */ (element.shadowRoot.querySelector('anypoint-input[name="file"]'));
      input.value = 'test';
      input.dispatchEvent(new CustomEvent('input'));
      assert.equal(element.file, 'test');
    });

    it('sets passphrase property', async () => {
      element.withEncrypt = true;
      element.encryptFile = true;
      await nextFrame();
      const input = /** @type AnypointInput */ (element.shadowRoot.querySelector('anypoint-masked-input[name="passphrase"]'));
      input.value = 'test';
      input.dispatchEvent(new CustomEvent('value-changed'));
      assert.equal(element.passphrase, 'test');
    });

    it('sets [parentNameValue] property', async () => {
      element.isDrive = true;
      await nextFrame();
      const input = /** @type AnypointInput */ (element.shadowRoot.querySelector('anypoint-input[name="parentId"]'));
      input.value = 'test';
      input.dispatchEvent(new CustomEvent('input'));
      assert.equal(element[parentNameValue], 'test');
    });

    it('sets parentId property to the input value', async () => {
      element.isDrive = true;
      await nextFrame();
      const input = /** @type AnypointInput */ (element.shadowRoot.querySelector('anypoint-input[name="parentId"]'));
      input.value = 'test';
      input.dispatchEvent(new CustomEvent('input'));
      assert.equal(element.parentId, 'test');
    });

    it('sets parentId property to the folder id', async () => {
      element.isDrive = true;
      await nextFrame();
      element.driveFolders = [{ name: 'test', id: 'test-id' }];
      const input = /** @type AnypointInput */ (element.shadowRoot.querySelector('anypoint-input[name="parentId"]'));
      input.value = 'test';
      input.dispatchEvent(new CustomEvent('input'));
      assert.equal(element.parentId, 'test-id');
    });

    it('sets skipImport property', () => {
      const input = /** @type AnypointInput */ (element.shadowRoot.querySelector('anypoint-checkbox[name="skipImport"]'));
      input.click();
      assert.isTrue(element.skipImport);
    });

    it('sets encryptFile property', async () => {
      element.withEncrypt = true;
      await nextFrame();
      const input = /** @type AnypointInput */ (element.shadowRoot.querySelector('anypoint-checkbox[name="encryptFile"]'));
      input.click();
      assert.isTrue(element.encryptFile);
    });
  });

  describe('onaccept', () => {
    let element;
    beforeEach(async () => {
      element = await validFixture();
    });

    it('Getter returns previously registered handler', () => {
      assert.isUndefined(element.onaccept);
      const f = () => {};
      element.onaccept = f;
      assert.isTrue(element.onaccept === f);
    });

    it('Calls registered function', () => {
      let called = false;
      const f = () => {
        called = true;
      };
      element.onaccept = f;
      element.confirm();
      element.onaccept = null;
      assert.isTrue(called);
    });

    it('Unregisters old function', () => {
      let called1 = false;
      let called2 = false;
      const f1 = () => {
        called1 = true;
      };
      const f2 = () => {
        called2 = true;
      };
      element.onaccept = f1;
      element.onaccept = f2;
      element.confirm();
      element.onaccept = null;
      assert.isFalse(called1);
      assert.isTrue(called2);
    });
  });

  describe('oncancel', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Getter returns previously registered handler', () => {
      assert.isUndefined(element.oncancel);
      const f = () => {};
      element.oncancel = f;
      assert.isTrue(element.oncancel === f);
    });

    it('Calls registered function', () => {
      let called = false;
      const f = () => {
        called = true;
      };
      element.oncancel = f;
      element.cancel();
      element.oncancel = null;
      assert.isTrue(called);
    });

    it('Unregisters old function', () => {
      let called1 = false;
      let called2 = false;
      const f1 = () => {
        called1 = true;
      };
      const f2 = () => {
        called2 = true;
      };
      element.oncancel = f1;
      element.oncancel = f2;
      element.cancel();
      element.oncancel = null;
      assert.isFalse(called1);
      assert.isTrue(called2);
    });
  });

  describe('onresize', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Getter returns previously registered handler', () => {
      assert.isUndefined(element.onresize);
      const f = () => {};
      element.onresize = f;
      assert.isTrue(element.onresize === f);
    });

    it('Calls registered function', () => {
      let called = false;
      const f = () => {
        called = true;
      };
      element.onresize = f;
      element.provider = 'drive';
      element.onresize = null;
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
      element.onresize = f1;
      element.onresize = f2;
      element.provider = 'drive';
      element.onresize = null;
      assert.isFalse(called1);
      assert.isTrue(called2);
    });
  });

  describe('ongoogledrivelistappfolders', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Getter returns previously registered handler', () => {
      assert.isUndefined(element.ongoogledrivelistappfolders);
      const f = () => {};
      element.ongoogledrivelistappfolders = f;
      assert.isTrue(element.ongoogledrivelistappfolders === f);
    });

    it('Calls registered function', () => {
      let called = false;
      const f = () => {
        called = true;
      };
      element.ongoogledrivelistappfolders = f;
      element.provider = 'drive';
      element.ongoogledrivelistappfolders = null;
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
      element.ongoogledrivelistappfolders = f1;
      element.ongoogledrivelistappfolders = f2;
      element.provider = 'drive';
      element.ongoogledrivelistappfolders = null;
      assert.isFalse(called1);
      assert.isTrue(called2);
    });
  });

  describe('a11y', () => {
    it('is accessible with data', async () => {
      const element = await fullDriveFixture();
      await assert.isAccessible(element, {
        ignoredRules: ['color-contrast'],
      });
    });
  });
});
