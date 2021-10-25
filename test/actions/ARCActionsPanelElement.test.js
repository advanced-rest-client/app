import { ArcNavigationEventTypes } from '@advanced-rest-client/events';
import { assert, fixture, html, nextFrame } from '@open-wc/testing';
import sinon from 'sinon';
import '../../define/arc-actions-panel.js'

/** @typedef {import('../../index').ARCActionsPanelElement} ARCActionsPanelElement */
/** @typedef {import('@advanced-rest-client/events').Actions.RunnableAction} RunnableAction */

describe('ARCActionsPanelElement', () => {
  /**
   * @returns {Promise<ARCActionsPanelElement>}
   */
  async function requestFixture() {
    return fixture(html`<arc-actions-panel type="request"></arc-actions-panel>`);
  }

  /**
   * @returns {Promise<ARCActionsPanelElement>}
   */
  async function responseFixture() {
    return fixture(html`<arc-actions-panel type="response"></arc-actions-panel>`);
  }

  /**
   * @returns {Promise<ARCActionsPanelElement>}
   */
  async function dataFixture() {
    const condition = /** @type RunnableAction[] */ ([{
      actions: [{
        priority: 1,
        type: 'request',
        name: 'set-variable',
      }],
      condition: {},
      enabled: true,
      type: 'request',
    }]);
    return fixture(html`<arc-actions-panel type="request" .conditions="${condition}"></arc-actions-panel>`);
  }

  describe('request actions', () => {
    let element = /** @type ARCActionsPanelElement */ (null);
    beforeEach(async () => { element = await requestFixture() });

    it('renders the intro for request actions', () => {
      const node = element.shadowRoot.querySelector('.tutorial-section .content');
      const result = node.textContent.trim();
      assert.include(result, 'Request actions allows you');
    });
  });

  describe('response actions', () => {
    let element = /** @type ARCActionsPanelElement */ (null);
    beforeEach(async () => { element = await responseFixture() });

    it('renders the intro for request actions', () => {
      const node = element.shadowRoot.querySelector('.tutorial-section .content');
      const result = node.textContent.trim();
      assert.include(result, 'Response actions allows you');
    });
  });

  describe('help button', () => {
    let element = /** @type ARCActionsPanelElement */ (null);
    beforeEach(async () => { element = await responseFixture() });

    it('renders the help button', () => {
      const node = element.shadowRoot.querySelector('.tutorial-section anypoint-button');
      assert.ok(node);
    });

    it('dispatches the navigate event', () => {
      const spy = sinon.spy();
      element.addEventListener(ArcNavigationEventTypes.navigateExternal, spy);
      const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('.tutorial-section anypoint-button'));
      node.click();
      assert.isTrue(spy.called);
      assert.equal(spy.args[0][0].url, 'https://docs.advancedrestclient.com/using-arc/request-actions');
    });
  });

  describe('adding a condition', () => {
    let element = /** @type ARCActionsPanelElement */ (null);
    beforeEach(async () => { element = await responseFixture() });

    it('renders the add condition button', () => {
      const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('[data-action="add-condition"]'));
      assert.ok(node);
    });

    it('the add condition button click adds a condition', () => {
      const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('[data-action="add-condition"]'));
      node.click();
      assert.lengthOf(element.conditions, 1);
    });

    it('has condition default properties', () => {
      const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('[data-action="add-condition"]'));
      node.click();
      const [condition] = element.conditions;
      assert.equal(condition.type, 'response', 'has the type');
      assert.isTrue(condition.enabled, 'is enabled');
      assert.deepEqual(condition.actions, [], 'has no actions');
      assert.typeOf(condition.condition, 'object', 'has the condition');
    });

    it('is opened by default', () => {
      const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('[data-action="add-condition"]'));
      node.click();
      const [condition] = element.conditions;
      assert.isTrue(condition.condition.view.opened);
    });

    it('renders the condition', async () => {
      const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('[data-action="add-condition"]'));
      node.click();
      await nextFrame();
      const condition = element.shadowRoot.querySelector('arc-condition-editor');
      assert.ok(condition);
    });

    it('renders multiple conditions', async () => {
      const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('[data-action="add-condition"]'));
      node.click();
      await nextFrame();
      node.click();
      await nextFrame();
      const conditions = element.shadowRoot.querySelectorAll('arc-condition-editor');
      assert.lengthOf(conditions, 2);
    });

    it('notifies the change', async () => {
      const spy = sinon.spy();
      element.addEventListener('change', spy);
      const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('[data-action="add-condition"]'));
      node.click();
      assert.isTrue(spy.calledOnce);
    });
  });

  describe('#hasConditions', () => {
    let element = /** @type ARCActionsPanelElement */ (null);
    beforeEach(async () => { element = await requestFixture() });

    it('is false when no conditions', () => {
      assert.isFalse(element.hasConditions);
    });

    it('is true when has conditions', () => {
      const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('[data-action="add-condition"]'));
      node.click();
      assert.isTrue(element.hasConditions);
    });
  });

  describe('#conditions', () => {
    let element = /** @type ARCActionsPanelElement */ (null);
    beforeEach(async () => { element = await requestFixture() });

    it('sets ActionCondition instance', () => {
      const condition = /** @type RunnableAction */ ({
        actions: [],
        condition: {},
        enabled: true,
        type: 'request',
      });
      element.conditions = [condition];
      const [item] = element.conditions;
      assert.typeOf(item, 'object');
      // @ts-ignore
      assert.typeOf(item.clone, 'function');
    });
  });

  describe('add()', () => {
    let element = /** @type ARCActionsPanelElement */ (null);
    beforeEach(async () => { element = await requestFixture() });

    it('adds a request condition when no conditions', () => {
      element.add('set-variable');
      assert.lengthOf(element.conditions, 1, 'has a new condition');
      assert.lengthOf(element.conditions[0].actions, 1, 'has an action in the condition');
      assert.equal(element.conditions[0].actions[0].name, 'set-variable', 'has the set action');
    });

    it('adds a response condition when no conditions', () => {
      element.type = 'response';
      element.add('set-variable');
      assert.lengthOf(element.conditions, 1, 'has a new condition');
      assert.lengthOf(element.conditions[0].actions, 1, 'has an action in the condition');
      assert.equal(element.conditions[0].actions[0].name, 'set-variable', 'has the set action');
    });

    it('adds an action to existing request condition', () => {
      element.add('set-variable');
      element.add('set-cookie', 0);
      assert.lengthOf(element.conditions, 1, 'has a single condition');
      assert.lengthOf(element.conditions[0].actions, 2, 'has 2 actions');
      assert.equal(element.conditions[0].actions[1].name, 'set-cookie', 'has the set action');
    });

    it('adds an action to existing response condition', () => {
      element.type = 'response';
      element.add('set-variable');
      element.add('set-cookie', 0);
      assert.lengthOf(element.conditions, 1, 'has a single condition');
      assert.lengthOf(element.conditions[0].actions, 2, 'has 2 actions');
      assert.equal(element.conditions[0].actions[1].name, 'set-cookie', 'has the set action');
    });

    it('renders the add action button under the condition', async () => {
      const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('[data-action="add-condition"]'));
      node.click();
      await nextFrame();
      const button = /** @type HTMLElement */ (element.shadowRoot.querySelector('[data-action="add-action"]'));
      assert.ok(button);
    });

    it('dropdown menu item click adds an action', async () => {
      const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('[data-action="add-condition"]'));
      node.click();
      await nextFrame();
      const button = /** @type HTMLElement */ (element.shadowRoot.querySelector('[data-name="delete-cookie"]'));
      button.click();
      await nextFrame();
      assert.lengthOf(element.conditions, 1);
    });
  });

  describe('duplicating an action', () => {
    let element = /** @type ARCActionsPanelElement */ (null);
    beforeEach(async () => { element = await dataFixture() });

    it('creates a duplicate of an action in a request condition', () => {
      const panel = element.shadowRoot.querySelector('arc-action-editor');
      panel.dispatchEvent(new CustomEvent('duplicate'));
      assert.lengthOf(element.conditions[0].actions, 2);
    });

    it('creates a duplicate of an action in a response condition', () => {
      element.type = 'response';
      const panel = element.shadowRoot.querySelector('arc-action-editor');
      panel.dispatchEvent(new CustomEvent('duplicate'));
      assert.lengthOf(element.conditions[0].actions, 2);
    });

    it('dispatches the change event', () => {
      const spy = sinon.spy();
      element.addEventListener('change', spy);
      const panel = element.shadowRoot.querySelector('arc-action-editor');
      panel.dispatchEvent(new CustomEvent('duplicate'));
      assert.isTrue(spy.calledOnce);
    });
  });

  describe('removing an action', () => {
    let element = /** @type ARCActionsPanelElement */ (null);
    beforeEach(async () => { element = await dataFixture() });

    it('removes the action from the condition', () => {
      const panel = element.shadowRoot.querySelector('arc-action-editor');
      panel.dispatchEvent(new CustomEvent('remove'));
      assert.lengthOf(element.conditions[0].actions, 0);
    });

    it('dispatches the change event', () => {
      const spy = sinon.spy();
      element.addEventListener('change', spy);
      const panel = element.shadowRoot.querySelector('arc-action-editor');
      panel.dispatchEvent(new CustomEvent('remove'));
      assert.isTrue(spy.calledOnce);
    });
  });

  describe('changing an action', () => {
    let element = /** @type ARCActionsPanelElement */ (null);
    beforeEach(async () => { element = await dataFixture() });

    it('updates simple property on the action configuration', () => {
      const panel = element.shadowRoot.querySelector('arc-action-editor');
      panel.enabled = false;
      panel.dispatchEvent(new CustomEvent('change', {
        detail: {
          prop: 'enabled',
        }
      }));
      assert.isFalse(element.conditions[0].actions[0].enabled);
    });

    it('updates complex path to a property on the action configuration', () => {
      const panel = element.shadowRoot.querySelector('arc-action-editor');
      // @ts-ignore
      panel.config.source = { path: 'a' };
      panel.dispatchEvent(new CustomEvent('change', {
        detail: {
          prop: 'config.source.path',
        }
      }));
      // @ts-ignore
      assert.equal(element.conditions[0].actions[0].config.source.path, 'a');
    });
  });

  describe('removing a condition', () => {
    let element = /** @type ARCActionsPanelElement */ (null);
    beforeEach(async () => { element = await dataFixture() });

    it('removes the action from the condition', () => {
      const panel = element.shadowRoot.querySelector('arc-condition-editor');
      panel.dispatchEvent(new CustomEvent('remove'));
      assert.lengthOf(element.conditions, 0);
    });

    it('dispatches the change event', () => {
      const spy = sinon.spy();
      element.addEventListener('change', spy);
      const panel = element.shadowRoot.querySelector('arc-condition-editor');
      panel.dispatchEvent(new CustomEvent('remove'));
      assert.isTrue(spy.calledOnce);
    });
  });

  describe('changing a condition', () => {
    let element = /** @type ARCActionsPanelElement */ (null);
    beforeEach(async () => { element = await dataFixture() });

    it('removes the action from the condition', () => {
      const panel = element.shadowRoot.querySelector('arc-condition-editor');
      panel.enabled = false;
      panel.dispatchEvent(new CustomEvent('change', {
        detail: {
          prop: 'enabled',
        }
      }));
      assert.isFalse(element.conditions[0].enabled);
    });

    it('dispatches the change event', () => {
      const spy = sinon.spy();
      element.addEventListener('change', spy);
      const panel = element.shadowRoot.querySelector('arc-condition-editor');
      panel.enabled = false;
      panel.dispatchEvent(new CustomEvent('change', {
        detail: {
          prop: 'enabled',
        }
      }));
      assert.isTrue(spy.calledOnce);
    });
  });
});
