import { assert, fixture, html } from '@open-wc/testing';
import sinon from 'sinon';
import '../../define/arc-actions.js'
import { selectedChangeEvent, conditionChangeEvent } from '../../src/elements/actions/ARCActionsElement.js';

/** @typedef {import('../../index').ARCActionsElement} ARCActionsElement */
/** @typedef {import('@advanced-rest-client/events').Actions.RunnableAction} RunnableAction */

describe('ARCActionsElement', () => {
  /**
   * @returns {Promise<ARCActionsElement>}
   */
  async function basicFixture() {
    return fixture(html`<arc-actions></arc-actions>`);
  }

  describe('constructor()', () => {
    let element = /** @type ARCActionsElement */ (null);
    beforeEach(async () => { element = await basicFixture() });

    it('selects the default editor', () => {
      assert.equal(element.selected, 0);
    });

    it('sets request to null', () => {
      assert.equal(element.request, null);
    });

    it('sets response to null', () => {
      assert.equal(element.response, null);
    });
  });

  describe('view rendering', () => {
    let element = /** @type ARCActionsElement */ (null);
    beforeEach(async () => { element = await basicFixture() });

    it('renders the tutorial', () => {
      const node = element.shadowRoot.querySelector('.actions-intro');
      assert.ok(node);
    });

    it('renders the tabs selector', () => {
      const node = element.shadowRoot.querySelector('anypoint-tabs');
      assert.ok(node);
    });

    it('renders the tabs', () => {
      const nodes = element.shadowRoot.querySelectorAll('anypoint-tab');
      assert.lengthOf(nodes, 2);
    });

    it('renders the actions panel', () => {
      const node = element.shadowRoot.querySelector('arc-actions-panel');
      assert.ok(node);
    });
  });

  describe('selection change', () => {
    let element = /** @type ARCActionsElement */ (null);
    beforeEach(async () => { element = await basicFixture() });

    it('clicking on a tab changes selection', () => {
      const tabs = element.shadowRoot.querySelectorAll('anypoint-tab');
      const tab = tabs[1];
      tab.click();
      assert.equal(element.selected, 1);
    });

    it('dispatches the selection change event', () => {
      const spy = sinon.spy();
      element.addEventListener(selectedChangeEvent, spy);
      const tabs = element.shadowRoot.querySelectorAll('anypoint-tab');
      const tab = tabs[1];
      tab.click();
      assert.isTrue(spy.called);
    });
  });

  describe('condition property change', () => {
    let element = /** @type ARCActionsElement */ (null);
    beforeEach(async () => { element = await basicFixture() });

    const condition = /** @type RunnableAction */ ({
      actions: [],
      enabled: true,
      type: 'request',
      condition: {
        source: 'url',
      },
    });

    it('sets the local property', () => {
      const panel = element.shadowRoot.querySelector('arc-actions-panel');
      panel.conditions = [condition];
      panel.dispatchEvent(new CustomEvent('change'));
      assert.deepEqual(element.request, [condition]);
    });

    it('dispatches the change event', () => {
      const spy = sinon.spy();
      element.addEventListener(conditionChangeEvent, spy);
      const panel = element.shadowRoot.querySelector('arc-actions-panel');
      panel.conditions = [condition];
      panel.dispatchEvent(new CustomEvent('change'));
      assert.isTrue(spy.called);
    });
  });

  describe('#onchange', () => {
    let element = /** @type ARCActionsElement */ (null);
    beforeEach(async () => { element = await basicFixture() });

    const condition = /** @type RunnableAction */ ({
      actions: [],
      enabled: true,
      type: 'request',
      condition: {
        source: 'url',
      },
    });

    it('returns the same function', () => {
      const fn = () => {};
      element.onchange = fn;
      assert.isTrue(element.onchange === fn);
    });

    it('calls the function', () => {
      let called = false;
      const fn = () => { called = true };
      element.onchange = fn;
      const panel = element.shadowRoot.querySelector('arc-actions-panel');
      panel.conditions = [condition];
      panel.dispatchEvent(new CustomEvent('change'));
      assert.isTrue(called);
    });

    it('unregistered function is not called function', () => {
      let called1 = false;
      let called2 = false;
      const fn1 = () => { called1 = true };
      const fn2 = () => { called2 = true };
      element.onchange = fn1;
      element.onchange = fn2;
      const panel = element.shadowRoot.querySelector('arc-actions-panel');
      panel.conditions = [condition];
      panel.dispatchEvent(new CustomEvent('change'));
      assert.isFalse(called1);
      assert.isTrue(called2);
    });
  });

  describe('#onselectedchange', () => {
    let element = /** @type ARCActionsElement */ (null);
    beforeEach(async () => { element = await basicFixture() });

    it('returns the same function', () => {
      const fn = () => {};
      element.onselectedchange = fn;
      assert.isTrue(element.onselectedchange === fn);
    });

    it('calls the function', () => {
      let called = false;
      const fn = () => { called = true };
      element.onselectedchange = fn;
      const tabs = element.shadowRoot.querySelectorAll('anypoint-tab');
      const tab = tabs[1];
      tab.click();
      assert.isTrue(called);
    });

    it('unregistered function is not called function', () => {
      let called1 = false;
      let called2 = false;
      const fn1 = () => { called1 = true };
      const fn2 = () => { called2 = true };
      element.onselectedchange = fn1;
      element.onselectedchange = fn2;
      const tabs = element.shadowRoot.querySelectorAll('anypoint-tab');
      const tab = tabs[1];
      tab.click();
      assert.isFalse(called1);
      assert.isTrue(called2);
    });
  });

  describe('#request', () => {
    let element = /** @type ARCActionsElement */ (null);
    beforeEach(async () => { element = await basicFixture() });

    const condition = /** @type RunnableAction */ ({
      actions: [],
      enabled: true,
      type: 'request',
      condition: {
        source: 'url',
      },
    });

    it('returns the same condition', () => {
      element.request = [condition];
      assert.deepEqual(element.request, [condition]);
    });
  });

  describe('#response', () => {
    let element = /** @type ARCActionsElement */ (null);
    beforeEach(async () => { element = await basicFixture() });

    const condition = /** @type RunnableAction */ ({
      actions: [],
      enabled: true,
      type: 'response',
      condition: {
        source: 'url',
      },
    });

    it('returns the same condition', () => {
      element.response = [condition];
      assert.deepEqual(element.response, [condition]);
    });
  });
});
