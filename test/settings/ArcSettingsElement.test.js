import { fixture, assert } from '@open-wc/testing';
import { ConfigEventTypes } from '@advanced-rest-client/events';
import sinon from 'sinon';
import '../../define/arc-settings.js';

/** @typedef {import('../../src/elements/settings/ArcSettingsElement').default} ArcSettingsElement */

describe('ArcSettingsElement', () => {
  /**
   * @return {Promise<ArcSettingsElement>} 
   */
  async function basicFixture() {
    return fixture(`<arc-settings></arc-settings>`);
  }

  describe('Initialization', () => {
    it('dispatches the config read event', async () => {
      const spy = sinon.spy();
      window.addEventListener(ConfigEventTypes.readAll, spy);
      await basicFixture();
      window.removeEventListener(ConfigEventTypes.readAll, spy);
      assert.isTrue(spy.called);
    });

    it('sets the read settings', async () => {
      const cnf = { view: {  } };
      const fn = (e) => {
        e.detail.result = Promise.resolve(cnf);
      };
      window.addEventListener(ConfigEventTypes.readAll, fn);
      const element = await basicFixture();
      window.removeEventListener(ConfigEventTypes.readAll, fn);
      assert.deepEqual(element.appSettings, cnf);
    });
  });

  describe('view rendering', () => {
    let element = /** @type ArcSettingsElement */ (null);
    beforeEach(async () => { element = await basicFixture() });

    it('renders all settings sections', () => {
      const nodes = element.shadowRoot.querySelectorAll('.settings-group');
      assert.lengthOf(nodes, 7);
    });

    it('renders a section title', () => {
      const node = element.shadowRoot.querySelector('.settings-group .settings-title');
      assert.equal(node.localName, 'h3');
    });

    it('renders a section description', () => {
      const node = element.shadowRoot.querySelector('.settings-group .settings-description');
      assert.equal(node.localName, 'p');
    });
    
    it('renders enum list entry', () => {
      const node = element.shadowRoot.querySelector('anypoint-item[data-path="view.listType"]');
      assert.ok(node, 'has list node with a dropdown list');
      const list = node.querySelector('anypoint-dropdown-menu');
      assert.ok(list, 'has the dropdown list');
      const options = list.querySelectorAll('anypoint-item');
      assert.lengthOf(options, 3, 'has the enum options');
      assert.equal(options[0].getAttribute('data-value'), 'default', 'list option has data-value attribute');
    });

    it('renders toggle list entry', () => {
      const node = element.shadowRoot.querySelector('anypoint-item[data-path="view.popupMenu"]');
      assert.ok(node, 'has list node with a switch');
      const toggle = node.querySelector('anypoint-switch');
      assert.ok(toggle, 'has the switch element');
    });

    it('renders input list entry', () => {
      const node = element.shadowRoot.querySelector('anypoint-item[data-path="request.timeout"]');
      assert.ok(node, 'has list node with a button to the sub page');
      const button = node.querySelector('anypoint-icon-button');
      assert.ok(button, 'has the button');
    });

    it('renders link list entry', () => {
      const node = element.shadowRoot.querySelector('anypoint-item[data-href]');
      assert.ok(node, 'has list node with a link');
    });
  });

  describe('setting default values', () => {
    let element = /** @type ArcSettingsElement */ (null);
    beforeEach(async () => { element = await basicFixture() });

    it('has the default value for a drop down list', () => {
      const node = /** @type any */ (element.shadowRoot.querySelector('anypoint-item[data-path="view.listType"] anypoint-dropdown-menu anypoint-listbox'));
      assert.equal(node.selected, 'default');
    });

    it('has the default value for a switch (checked)', () => {
      const node = /** @type any */ (element.shadowRoot.querySelector('anypoint-item[data-path="view.popupMenu"] anypoint-switch'));
      assert.isTrue(node.checked);
    });

    it('has the default value for a switch (not checked)', () => {
      const node = /** @type any */ (element.shadowRoot.querySelector('anypoint-item[data-path="request.nativeTransport"] anypoint-switch'));
      assert.isFalse(node.checked);
    });

    it('has the default value for an input', async () => {
      const item = element.readConfigItemSchema('request.timeout');
      element.pages.push({
        page: item,
      });
      await element.requestUpdate();
      const node = /** @type HTMLInputElement */ (element.shadowRoot.querySelector('anypoint-input[data-path="request.timeout"]'));
      assert.equal(node.value, '90');
    });
  });

  describe('setting application settings values', () => {
    let element = /** @type ArcSettingsElement */ (null);
    beforeEach(async () => { 
      const cnf = { view: { listType: 'comfortable', popupMenu: false }, request: { timeout: 120 } };
      const fn = (e) => {
        e.detail.result = Promise.resolve(cnf);
      };
      window.addEventListener(ConfigEventTypes.readAll, fn);
      element = await basicFixture(); 
      window.removeEventListener(ConfigEventTypes.readAll, fn);
    });

    it('has selected drop down list item', () => {
      const node = /** @type any */ (element.shadowRoot.querySelector('anypoint-item[data-path="view.listType"] anypoint-dropdown-menu anypoint-listbox'));
      assert.equal(node.selected, 'comfortable');
    });

    it('has the value for the switch', () => {
      const node = /** @type any */ (element.shadowRoot.querySelector('anypoint-item[data-path="view.popupMenu"] anypoint-switch'));
      assert.isFalse(node.checked);
    });

    it('has the default value for an input', async () => {
      const item = element.readConfigItemSchema('request.timeout');
      element.pages.push({
        page: item,
      });
      await element.requestUpdate();
      const node = /** @type HTMLInputElement */ (element.shadowRoot.querySelector('anypoint-input[data-path="request.timeout"]'));
      assert.equal(node.value, '120');
    });
  });

  describe('editing boolean options', () => {
    let element = /** @type ArcSettingsElement */ (null);
    beforeEach(async () => { element = await basicFixture() });

    it('sets setting value locally', () => {
      const button = /** @type HTMLElement */ (element.shadowRoot.querySelector('anypoint-item[data-path="view.popupMenu"] anypoint-switch'));
      button.click();
      // this option is `true` by default
      assert.isFalse(element.appSettings.view.popupMenu);
    });

    it('updates the setting when clicking on the config list item', () => {
      const button = /** @type HTMLElement */ (element.shadowRoot.querySelector('anypoint-item[data-path="view.popupMenu"]'));
      button.click();
      assert.isFalse(element.appSettings.view.popupMenu);
    });

    it('dispatches config update event', () => {
      const spy = sinon.spy();
      element.addEventListener(ConfigEventTypes.update, spy);
      const button = /** @type HTMLElement */ (element.shadowRoot.querySelector('anypoint-item[data-path="view.popupMenu"] anypoint-switch'));
      button.click();
      assert.isTrue(spy.called, 'The event is dispatched');
      const e = spy.args[0][0];
      const { key, value } = e.detail;
      assert.equal(key, 'view.popupMenu', 'the event has the key set');
      assert.equal(value, false, 'the event has the value set');
    });
  });

  describe('editing list item options', () => {
    let element = /** @type ArcSettingsElement */ (null);
    beforeEach(async () => { element = await basicFixture() });

    it('sets setting value locally', () => {
      const node = element.shadowRoot.querySelector('anypoint-item[data-path="view.listType"]');
      const options = node.querySelectorAll('anypoint-dropdown-menu anypoint-item');
      /** @type HTMLElement */ (options[1]).click();
      
      assert.equal(element.appSettings.view.listType, 'comfortable');
    });

    it('dispatches config update event', () => {
      const spy = sinon.spy();
      element.addEventListener(ConfigEventTypes.update, spy);
      const node = element.shadowRoot.querySelector('anypoint-item[data-path="view.listType"]');
      const options = node.querySelectorAll('anypoint-dropdown-menu anypoint-item');
      /** @type HTMLElement */ (options[1]).click();
      assert.isTrue(spy.called, 'The event is dispatched');
      const e = spy.args[0][0];
      const { key, value } = e.detail;
      assert.equal(key, 'view.listType', 'the event has the key set');
      assert.equal(value, 'comfortable', 'the event has the value set');
    });
  });

  describe('editing text input options', () => {
    let element = /** @type ArcSettingsElement */ (null);
    let input = /** @type HTMLInputElement */ (null);
    beforeEach(async () => { 
      element = await basicFixture();
      const item = element.readConfigItemSchema('request.timeout');
      element.pages.push({
        page: item,
      });
      await element.requestUpdate();
      input = /** @type HTMLInputElement */ (element.shadowRoot.querySelector('anypoint-input[data-path="request.timeout"]'));
    });

    it('sets setting value locally', () => {
      input.value = '92';
      input.dispatchEvent(new Event('change'));
      
      assert.equal(element.appSettings.request.timeout, 92);
    });

    it('dispatches config update event', () => {
      const spy = sinon.spy();
      element.addEventListener(ConfigEventTypes.update, spy);
      input.value = '92';
      input.dispatchEvent(new Event('change'));
      assert.isTrue(spy.called, 'The event is dispatched');
      const e = spy.args[0][0];
      const { key, value } = e.detail;
      assert.equal(key, 'request.timeout', 'the event has the key set');
      assert.equal(value, 92, 'the event has the value set');
    });
  });

  describe('sub-pages', () => {
    let element = /** @type ArcSettingsElement */ (null);
    beforeEach(async () => { element = await basicFixture() });

    it('opens a sub page on the button click', async () => {
      const button = /** @type HTMLInputElement */ (element.shadowRoot.querySelector('anypoint-item[data-path="request.timeout"] anypoint-icon-button'));
      button.click();
      await element.updateComplete;
      assert.ok(element.shadowRoot.querySelector('.settings-page'));
    });

    it('sets the subPageItem property', () => {
      const button = /** @type HTMLInputElement */ (element.shadowRoot.querySelector('anypoint-item[data-path="request.timeout"] anypoint-icon-button'));
      button.click();
      assert.lengthOf(element.pages, 1);
    });

    it('closes the sub page', async () => {
      const button = /** @type HTMLInputElement */ (element.shadowRoot.querySelector('anypoint-item[data-path="request.timeout"] anypoint-icon-button'));
      button.click();
      await element.updateComplete;
      const backButton = /** @type HTMLInputElement */ (element.shadowRoot.querySelector('.title-line anypoint-icon-button'));
      backButton.click();
      await element.updateComplete;
      assert.notOk(element.shadowRoot.querySelector('.settings-page'));
    });

    it('clears the subPageItem property', async () => {
      const button = /** @type HTMLInputElement */ (element.shadowRoot.querySelector('anypoint-item[data-path="request.timeout"] anypoint-icon-button'));
      button.click();
      await element.updateComplete;
      const backButton = /** @type HTMLInputElement */ (element.shadowRoot.querySelector('.title-line anypoint-icon-button'));
      backButton.click();
      assert.isEmpty(element.pages)
    });
  });

  describe('HTTP request configuration', () => {
    let element = /** @type ArcSettingsElement */ (null);
    beforeEach(async () => { element = await basicFixture() });

    [
      'request.timeout',
      // 'request.followRedirects',
      // 'request.useSystemVariables',
      // 'request.useAppVariables',
      // 'request.ignoreContentOnGet',
      // 'request.defaultHeaders',
      // 'request.ignoreSessionCookies',
      // 'request.validateCertificates',
      // 'request.oauth2redirectUri',
      'request.readOsHosts',
    ].forEach((key) => {
      it(`renders the ${key} option`, () => {
        const item = element.shadowRoot.querySelector(`anypoint-item[data-path="${key}"]`);
        assert.ok(item);
      });
    });
  });
});
