import { assert, fixture, html, nextFrame } from '@open-wc/testing';
import sinon from 'sinon';
import '../../define/arc-action-editor.js'

/** @typedef {import('../../index').ARCActionEditorElement} ARCActionEditorElement */
/** @typedef {import('@advanced-rest-client/events').Actions.SetVariableConfig} SetVariableConfig */
/** @typedef {import('@anypoint-web-components/awc').AnypointListboxElement} AnypointListbox */
/** @typedef {import('@anypoint-web-components/awc').AnypointSwitchElement} AnypointSwitch */

describe('ARCActionEditorElement', () => {
  describe('set-variable', () => {

    /**
     * @returns {Promise<ARCActionEditorElement>}
     */
    async function basicFixture() {
      return fixture(html`<arc-action-editor name="set-variable" type="request"></arc-action-editor>`);
    }

    /**
     * @returns {Promise<ARCActionEditorElement>}
     */
    async function basicOpenedFixture() {
      return fixture(html`<arc-action-editor name="set-variable" type="request" opened></arc-action-editor>`);
    }

    /**
     * @returns {Promise<ARCActionEditorElement>}
     */
    async function iteratorConditionFixture() {
      const config = /** @type SetVariableConfig */ ({
        source: { 
          type: 'response', 
          source: 'body',
          path: 'test.path',
          iteratorEnabled: true,
          iterator: {
            path: 'test.iterator.path',
            operator: 'not-equal',
            condition: 'test-condition',
          },
        }, 
        name: 'test',
      });
      return fixture(html`<arc-action-editor name="set-variable" type="response" opened .config="${config}"></arc-action-editor>`);
    }

    describe('closed basic setup', () => {
      let element = /** @type ARCActionEditorElement */ (null);
      beforeEach(async () => { element = await basicFixture() });

      it('has action title', () => {
        const node = element.shadowRoot.querySelector('.action-title');
        assert.equal(node.textContent.trim(), 'Set variable');
      });
    });
  
    describe('opened basic setup', () => {
      let element = /** @type ARCActionEditorElement */ (null);
      beforeEach(async () => { element = await basicOpenedFixture() });

      it('renders the variable name input', () => {
        const input = /** @type HTMLInputElement */ (element.shadowRoot.querySelector('[name="config.name"]'));
        assert.ok(input);
      });

      it('variable name input change changes the config object', () => {
        const input = /** @type HTMLInputElement */ (element.shadowRoot.querySelector('[name="config.name"]'));
        input.value = 'test-cookie';
        input.dispatchEvent(new CustomEvent('input'));
        const result = /** @type SetVariableConfig */ (element.config);
        assert.equal(result.name, 'test-cookie');
      });

      it('variable name input change dispatches the change event', () => {
        const spy = sinon.spy();
        element.addEventListener('change', spy);
        const input = /** @type HTMLInputElement */ (element.shadowRoot.querySelector('[name="config.name"]'));
        input.value = 'test-cookie';
        input.dispatchEvent(new CustomEvent('input'));
        assert.isTrue(spy.calledOnce);
      });

      it('does not render the source type selector for the request action', () => {
        const input = /** @type HTMLInputElement */ (element.shadowRoot.querySelector('[name="config.source.type"]'));
        assert.notOk(input);
      });

      it('renders the source selector', () => {
        const input = /** @type HTMLElement */ (element.shadowRoot.querySelector('[name="config.source.source"]'));
        assert.ok(input);
      });

      it('source change changes the config', () => {
        const input = /** @type HTMLElement */ (element.shadowRoot.querySelector('[name="config.source.source"] anypoint-item[data-value="method"]'));
        input.click();
        const result = /** @type SetVariableConfig */ (element.config);
        assert.equal(result.source.source, 'method');
      });

      it('source change dispatches the change event', () => {
        const spy = sinon.spy();
        element.addEventListener('change', spy);
        const input = /** @type HTMLElement */ (element.shadowRoot.querySelector('[name="config.source.source"] anypoint-item[data-value="method"]'));
        input.click();
        const result = /** @type SetVariableConfig */ (element.config);
        assert.equal(result.source.source, 'method');
        assert.isTrue(spy.calledOnce);
      });

      it('renders the source path input', () => {
        const input = /** @type HTMLInputElement */ (element.shadowRoot.querySelector('[name="config.source.path"]'));
        assert.ok(input);
      });

      it('source path input change changes the config object', () => {
        const input = /** @type HTMLInputElement */ (element.shadowRoot.querySelector('[name="config.source.path"]'));
        input.value = 'test-path';
        input.dispatchEvent(new CustomEvent('input'));
        const result = /** @type SetVariableConfig */ (element.config);
        assert.equal(result.source.path, 'test-path');
      });

      it('source path input change dispatches the change event', () => {
        const spy = sinon.spy();
        element.addEventListener('change', spy);
        const input = /** @type HTMLInputElement */ (element.shadowRoot.querySelector('[name="config.source.path"]'));
        input.value = 'test-path';
        input.dispatchEvent(new CustomEvent('input'));
        assert.isTrue(spy.calledOnce);
      });

      it('renders the failOnError checkbox', () => {
        const input = /** @type HTMLInputElement */ (element.shadowRoot.querySelector('[name="failOnError"]'));
        assert.ok(input);
      });

      it('the failOnError input change changes the element\'s property', () => {
        const input = /** @type HTMLInputElement */ (element.shadowRoot.querySelector('[name="failOnError"]'));
        input.click();
        const result = element.failOnError;
        assert.isTrue(result);
      });

      it('the failOnError change dispatches the change event', () => {
        const spy = sinon.spy();
        element.addEventListener('change', spy);
        const input = /** @type HTMLInputElement */ (element.shadowRoot.querySelector('[name="failOnError"]'));
        input.click();
        assert.isTrue(spy.calledOnce);
      });
    });

    describe('iterator configuration', () => {
      it('does not render the source iterator toggle for URL source selection', async () => {
        const element = await basicOpenedFixture();
        const option = /** @type HTMLElement */ (element.shadowRoot.querySelector('[name="config.source.source"] anypoint-item[data-value="url"]'));
        option.click();
        await nextFrame();
        const input = /** @type HTMLInputElement */ (element.shadowRoot.querySelector('[name="config.source.iteratorEnabled"]'));
        assert.notOk(input);
      });

      it('does not render the source iterator toggle for method source selection', async () => {
        const element = await basicOpenedFixture();
        const option = /** @type HTMLElement */ (element.shadowRoot.querySelector('[name="config.source.source"] anypoint-item[data-value="method"]'));
        option.click();
        await nextFrame();
        const input = /** @type HTMLInputElement */ (element.shadowRoot.querySelector('[name="config.source.iteratorEnabled"]'));
        assert.notOk(input);
      });

      it('does not render the source iterator toggle for headers source selection', async () => {
        const element = await basicOpenedFixture();
        const option = /** @type HTMLElement */ (element.shadowRoot.querySelector('[name="config.source.source"] anypoint-item[data-value="headers"]'));
        option.click();
        await nextFrame();
        const input = /** @type HTMLInputElement */ (element.shadowRoot.querySelector('[name="config.source.iteratorEnabled"]'));
        assert.notOk(input);
      });

      it('does not render the source iterator toggle for status source selection', async () => {
        const element = await basicOpenedFixture();
        element.type = 'response';
        element.config = { source: { type: 'response', source: 'status' }, name: 'test' };
        await element.requestUpdate();
        const input = /** @type HTMLInputElement */ (element.shadowRoot.querySelector('[name="config.source.iteratorEnabled"]'));
        assert.notOk(input);
      });

      it('renders the source iterator toggle for request body source selection', async () => {
        const element = await basicOpenedFixture();
        const option = /** @type HTMLElement */ (element.shadowRoot.querySelector('[name="config.source.source"] anypoint-item[data-value="body"]'));
        option.click();
        await nextFrame();
        const input = /** @type HTMLInputElement */ (element.shadowRoot.querySelector('[name="config.source.iteratorEnabled"]'));
        assert.ok(input);
      });

      it('renders the source iterator toggle for response body source selection', async () => {
        const element = await iteratorConditionFixture();
        const input = /** @type HTMLInputElement */ (element.shadowRoot.querySelector('[name="config.source.iteratorEnabled"]'));
        assert.ok(input);
      });

      it('renders the source iterator toggle for response body source selection', async () => {
        const element = await iteratorConditionFixture();
        const input = /** @type HTMLInputElement */ (element.shadowRoot.querySelector('[name="config.source.iteratorEnabled"]'));
        assert.ok(input);
      });

      it('renders the iterator path input', async () => {
        const element = await iteratorConditionFixture();
        const input = /** @type HTMLInputElement */ (element.shadowRoot.querySelector('[name="config.source.iterator.path"]'));
        assert.ok(input);
      });

      it('the iterator path input change changes the config object', async () => {
        const element = await iteratorConditionFixture();
        const input = /** @type HTMLInputElement */ (element.shadowRoot.querySelector('[name="config.source.iterator.path"]'));
        input.value = 'test-path';
        input.dispatchEvent(new CustomEvent('input'));
        const result = /** @type SetVariableConfig */ (element.config);
        assert.equal(result.source.iterator.path, 'test-path');
      });

      it('the iterator path input change dispatches the change event', async () => {
        const element = await iteratorConditionFixture();
        const spy = sinon.spy();
        element.addEventListener('change', spy);
        const input = /** @type HTMLInputElement */ (element.shadowRoot.querySelector('[name="config.source.iterator.path"]'));
        input.value = 'test-path';
        input.dispatchEvent(new CustomEvent('input'));
        assert.isTrue(spy.calledOnce);
      });

      it('renders the condition value input', async () => {
        const element = await iteratorConditionFixture();
        const input = /** @type HTMLInputElement */ (element.shadowRoot.querySelector('[name="config.source.iterator.condition"]'));
        assert.ok(input);
      });

      it('the condition value input change changes the config object', async () => {
        const element = await iteratorConditionFixture();
        const input = /** @type HTMLInputElement */ (element.shadowRoot.querySelector('[name="config.source.iterator.condition"]'));
        input.value = 'test-condition';
        input.dispatchEvent(new CustomEvent('input'));
        const result = /** @type SetVariableConfig */ (element.config);
        assert.equal(result.source.iterator.condition, 'test-condition');
      });

      it('the condition value input change dispatches the change event', async () => {
        const element = await iteratorConditionFixture();
        const spy = sinon.spy();
        element.addEventListener('change', spy);
        const input = /** @type HTMLInputElement */ (element.shadowRoot.querySelector('[name="config.source.iterator.condition"]'));
        input.value = 'test-condition';
        input.dispatchEvent(new CustomEvent('input'));
        assert.isTrue(spy.calledOnce);
      });

      it('renders the operator dropdown', async () => {
        const element = await iteratorConditionFixture();
        const input = /** @type HTMLInputElement */ (element.shadowRoot.querySelector('[name="config.source.iterator.operator"]'));
        assert.ok(input);
      });

      it('the operator value change changes the config object', async () => {
        const element = await iteratorConditionFixture();
        const item = /** @type HTMLElement */ (element.shadowRoot.querySelector('[name="config.source.iterator.operator"] [data-value="contains"]'));
        item.click();
        const result = /** @type SetVariableConfig */ (element.config);
        assert.equal(result.source.iterator.operator, 'contains');
      });

      it('the condition value input change dispatches the change event', async () => {
        const element = await iteratorConditionFixture();
        const spy = sinon.spy();
        element.addEventListener('change', spy);
        const item = /** @type HTMLElement */ (element.shadowRoot.querySelector('[name="config.source.iterator.operator"] [data-value="contains"]'));
        item.click();
        assert.isTrue(spy.calledOnce);
      });
    });
  });
});
