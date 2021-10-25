import { assert, fixture, html, nextFrame } from '@open-wc/testing';
import sinon from 'sinon';
import '../../define/arc-condition-editor.js'

/** @typedef {import('../../index').ARCConditionEditorElement} ARCConditionEditorElement */
/** @typedef {import('@advanced-rest-client/events').Actions.Condition} Condition */
/** @typedef {import('@anypoint-web-components/awc').AnypointDropdownMenuElement} AnypointDropdownMenu */
/** @typedef {import('@anypoint-web-components/awc').AnypointSwitchElement} AnypointSwitch */

describe('ARCConditionEditorElement', () => {
  /**
   * @returns {Promise<ARCConditionEditorElement>}
   */
  async function requestFixture() {
    const condition = /** @type Condition */ ({
      type: 'request',
      alwaysPass: false,
      source: 'body',
      operator: 'not-equal',
      predictedValue: 'test-value',
      path: 'test.path',
      view: {
        opened: true,
      },
      iteratorEnabled: false,
      iterator: {},
    });
    return fixture(html`<arc-condition-editor type="request" .condition="${condition}"></arc-condition-editor>`);
  }

  /**
   * @returns {Promise<ARCConditionEditorElement>}
   */
  async function responseFixture() {
    const condition = /** @type Condition */ ({
      type: 'response',
      alwaysPass: false,
      source: 'body',
      operator: 'not-equal',
      predictedValue: 'test-value',
      path: 'test.path',
      view: {
        opened: true,
      },
      iteratorEnabled: false,
      iterator: {},
    });
    return fixture(html`<arc-condition-editor type="response" .condition="${condition}"></arc-condition-editor>`);
  }

  describe('basic UI', () => {
    let element = /** @type ARCConditionEditorElement */ (null);
    beforeEach(async () => { element = await requestFixture() });

    it('renders the opened title', () => {
      const node = element.shadowRoot.querySelector('.opened-title');
      assert.ok(node);
    });

    it('has action title', () => {
      const node = element.shadowRoot.querySelector('.action-title');
      assert.equal(node.textContent.trim(), 'Condition editor');
    });

    it('closes the action from the close button click', () => {
      const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('.opened-title [data-action="close"]'));
      node.click();
      assert.isFalse(element.opened);
    });
  });

  describe('data source', () => {
    let element = /** @type ARCConditionEditorElement */ (null);
    beforeEach(async () => { element = await requestFixture() });

    it('does not render the source type selector for the request action', () => {
      const input = /** @type HTMLInputElement */ (element.shadowRoot.querySelector('[name="type"]'));
      assert.notOk(input);
    });

    it('renders the source selector', () => {
      const input = /** @type HTMLElement */ (element.shadowRoot.querySelector('[name="source"]'));
      assert.ok(input);
    });

    it('has the configured selection', () => {
      const input = /** @type AnypointDropdownMenu */ (element.shadowRoot.querySelector('[name="source"]'));
      assert.equal(input.value, 'Body');
    });

    it('source change changes the config', () => {
      const input = /** @type HTMLElement */ (element.shadowRoot.querySelector('[name="source"] anypoint-item[data-value="method"]'));
      input.click();
      assert.equal(element.condition.source, 'method');
    });

    it('source change dispatches the change event', () => {
      const spy = sinon.spy();
      element.addEventListener('change', spy);
      const input = /** @type HTMLElement */ (element.shadowRoot.querySelector('[name="source"] anypoint-item[data-value="method"]'));
      input.click();
      assert.equal(element.condition.source, 'method');
      assert.isTrue(spy.calledOnce);
    });
  });

  describe('data source path', () => {
    let element = /** @type ARCConditionEditorElement */ (null);
    beforeEach(async () => { element = await requestFixture() });

    it('renders the source path input', () => {
      const input = /** @type HTMLInputElement */ (element.shadowRoot.querySelector('[name="path"]'));
      assert.ok(input);
    });

    it('has the configured value', () => {
      const input = /** @type HTMLInputElement */ (element.shadowRoot.querySelector('[name="path"]'));
      assert.equal(input.value, 'test.path');
    });

    it('source path input change changes the config object', () => {
      const input = /** @type HTMLInputElement */ (element.shadowRoot.querySelector('[name="path"]'));
      input.value = 'test-path';
      input.dispatchEvent(new CustomEvent('input'));
      assert.equal(element.condition.path, 'test-path');
    });

    it('source path input change dispatches the change event', () => {
      const spy = sinon.spy();
      element.addEventListener('change', spy);
      const input = /** @type HTMLInputElement */ (element.shadowRoot.querySelector('[name="path"]'));
      input.value = 'test-path';
      input.dispatchEvent(new CustomEvent('input'));
      assert.isTrue(spy.calledOnce);
    });
  });

  describe('data condition', () => {
    let element = /** @type ARCConditionEditorElement */ (null);
    beforeEach(async () => { element = await requestFixture() });

    it('renders the operator input', () => {
      const input = element.shadowRoot.querySelector('[name="operator"]');
      assert.ok(input);
    });

    it('has the configured selection', () => {
      const input = /** @type AnypointDropdownMenu */ (element.shadowRoot.querySelector('[name="operator"]'));
      assert.equal(input.value, 'Not equal');
    });

    it('operator input change changes the config object', () => {
      const item = /** @type HTMLElement */ (element.shadowRoot.querySelector('[name="operator"] [data-value="contains"]'));
      item.click();
      assert.equal(element.condition.operator, 'contains');
    });

    it('operator input change dispatches the change event', () => {
      const spy = sinon.spy();
      element.addEventListener('change', spy);
      const item = /** @type HTMLElement */ (element.shadowRoot.querySelector('[name="operator"] [data-value="contains"]'));
      item.click();
      assert.isTrue(spy.calledOnce);
    });
  });

  describe('condition value path', () => {
    let element = /** @type ARCConditionEditorElement */ (null);
    beforeEach(async () => { element = await requestFixture() });

    it('renders the condition value input', () => {
      const input = /** @type HTMLInputElement */ (element.shadowRoot.querySelector('[name="predictedValue"]'));
      assert.ok(input);
    });

    it('has the configured value', () => {
      const input = /** @type HTMLInputElement */ (element.shadowRoot.querySelector('[name="predictedValue"]'));
      assert.equal(input.value, 'test-value');
    });

    it('condition value input change changes the config object', () => {
      const input = /** @type HTMLInputElement */ (element.shadowRoot.querySelector('[name="predictedValue"]'));
      input.value = 'test-predictedValue';
      input.dispatchEvent(new CustomEvent('input'));
      assert.equal(element.condition.predictedValue, 'test-predictedValue');
    });

    it('condition value input change dispatches the change event', () => {
      const spy = sinon.spy();
      element.addEventListener('change', spy);
      const input = /** @type HTMLInputElement */ (element.shadowRoot.querySelector('[name="predictedValue"]'));
      input.value = 'test-predictedValue';
      input.dispatchEvent(new CustomEvent('input'));
      assert.isTrue(spy.calledOnce);
    });
  });

  describe('data source type', () => {
    let element = /** @type ARCConditionEditorElement */ (null);
    beforeEach(async () => { element = await responseFixture() });

    it('renders the source type selector', () => {
      const input = /** @type HTMLElement */ (element.shadowRoot.querySelector('[name="type"]'));
      assert.ok(input);
    });

    it('has the configured selection', () => {
      const input = /** @type AnypointDropdownMenu */ (element.shadowRoot.querySelector('[name="type"]'));
      assert.equal(input.value, 'Response');
    });

    it('source type change changes the config', () => {
      const input = /** @type HTMLElement */ (element.shadowRoot.querySelector('[name="type"] anypoint-item[data-value="request"]'));
      input.click();
      assert.equal(element.condition.type, 'request');
    });

    it('source type change dispatches the change event', () => {
      const spy = sinon.spy();
      element.addEventListener('change', spy);
      const input = /** @type HTMLElement */ (element.shadowRoot.querySelector('[name="type"] anypoint-item[data-value="request"]'));
      input.click();
      assert.isTrue(spy.calledOnce);
    });

    it('updates the source options for the response type', () => {
      const items = /** @type HTMLElement[] */ (Array.from(element.shadowRoot.querySelectorAll('[name="source"] anypoint-item')));
      assert.equal(items[0].getAttribute('data-value'), 'url');
      assert.equal(items[1].getAttribute('data-value'), 'status');
      assert.equal(items[2].getAttribute('data-value'), 'headers');
      assert.equal(items[3].getAttribute('data-value'), 'body');
    });

    it('updates the source options for the request type', async () => {
      element.type = 'request';
      await nextFrame();
      const items = /** @type HTMLElement[] */ (Array.from(element.shadowRoot.querySelectorAll('[name="source"] anypoint-item')));
      assert.equal(items[0].getAttribute('data-value'), 'url');
      assert.equal(items[1].getAttribute('data-value'), 'method');
      assert.equal(items[2].getAttribute('data-value'), 'headers');
      assert.equal(items[3].getAttribute('data-value'), 'body');
    });
  });

  describe('enable/disable the condition', () => {
    let element = /** @type ARCConditionEditorElement */ (null);
    beforeEach(async () => { element = await requestFixture() });

    it('renders the enabled toggle', () => {
      const input = /** @type AnypointSwitch */ (element.shadowRoot.querySelector('[name="enabled"]'));
      assert.ok(input);
    });

    it('toggles the enabled property', () => {
      const input = /** @type AnypointSwitch */ (element.shadowRoot.querySelector('[name="enabled"]'));
      input.click();
      assert.isTrue(element.enabled);
    });

    it('dispatches the change event', () => {
      const spy = sinon.spy();
      element.addEventListener('change', spy);
      const input = /** @type AnypointSwitch */ (element.shadowRoot.querySelector('[name="enabled"]'));
      input.click();
      assert.isTrue(spy.called);
      assert.equal(spy.args[0][0].detail.prop, 'enabled', 'The event has changed property path');
    });
  });

  describe('always pass the condition', () => {
    let element = /** @type ARCConditionEditorElement */ (null);
    beforeEach(async () => { element = await requestFixture() });

    it('renders the alwaysPass toggle', () => {
      const input = /** @type AnypointSwitch */ (element.shadowRoot.querySelector('[name="alwaysPass"]'));
      assert.ok(input);
    });

    it('toggles the alwaysPass property', () => {
      const input = /** @type AnypointSwitch */ (element.shadowRoot.querySelector('[name="alwaysPass"]'));
      input.click();
      assert.isTrue(element.condition.alwaysPass);
    });

    it('dispatches the change event', () => {
      const spy = sinon.spy();
      element.addEventListener('change', spy);
      const input = /** @type AnypointSwitch */ (element.shadowRoot.querySelector('[name="alwaysPass"]'));
      input.click();
      assert.isTrue(spy.called);
      assert.equal(spy.args[0][0].detail.prop, 'condition', 'The event has changed property path');
    });
  });
});
