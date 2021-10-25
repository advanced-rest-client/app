import { assert, fixture, html, nextFrame } from '@open-wc/testing';
import sinon from 'sinon';
import '../../define/arc-action-editor.js'

/** @typedef {import('../../index').ARCActionEditorElement} ARCActionEditorElement */
/** @typedef {import('@advanced-rest-client/events').Actions.DeleteCookieConfig} DeleteCookieConfig */
/** @typedef {import('@anypoint-web-components/awc').AnypointListboxElement} AnypointListbox */
/** @typedef {import('@anypoint-web-components/awc').AnypointSwitchElement} AnypointSwitch */

describe('ARCActionEditorElement', () => {
  describe('delete-cookie', () => {

    /**
     * @returns {Promise<ARCActionEditorElement>}
     */
    async function basicFixture() {
      return fixture(html`<arc-action-editor name="delete-cookie" type="request"></arc-action-editor>`);
    }

    /**
     * @returns {Promise<ARCActionEditorElement>}
     */
    async function basicOpenedFixture() {
      return fixture(html`<arc-action-editor name="delete-cookie" type="request" opened></arc-action-editor>`);
    }

    describe('closed basic setup', () => {
      let element = /** @type ARCActionEditorElement */ (null);
      beforeEach(async () => { element = await basicFixture() });

      it('has action title', () => {
        const node = element.shadowRoot.querySelector('.action-title');
        assert.equal(node.textContent.trim(), 'Delete cookie');
      });
    });
  
    describe('cookie URL', () => {
      let element = /** @type ARCActionEditorElement */ (null);
      beforeEach(async () => { element = await basicOpenedFixture() });

      it('renders the use request URL input', () => {
        const input = /** @type HTMLInputElement */ (element.shadowRoot.querySelector('[name="config.useRequestUrl"]'));
        assert.ok(input);
      });

      it('the use request URL input change changes the config object', () => {
        const input = /** @type HTMLInputElement */ (element.shadowRoot.querySelector('[name="config.useRequestUrl"]'));
        input.click();
        const result = /** @type DeleteCookieConfig */ (element.config);
        assert.isTrue(result.useRequestUrl);
      });

      it('the use request URL input change dispatches the change event', () => {
        const spy = sinon.spy();
        element.addEventListener('change', spy);
        const input = /** @type HTMLInputElement */ (element.shadowRoot.querySelector('[name="config.useRequestUrl"]'));
        input.click();
        assert.isTrue(spy.calledOnce);
      });

      it('renders the cookie URL input', () => {
        const input = /** @type HTMLInputElement */ (element.shadowRoot.querySelector('[name="config.url"]'));
        assert.ok(input);
      });

      it('does not render URL input when use request URL is set', async () => {
        const checkbox = /** @type HTMLInputElement */ (element.shadowRoot.querySelector('[name="config.useRequestUrl"]'));
        checkbox.click();
        await nextFrame();
        const input = /** @type HTMLInputElement */ (element.shadowRoot.querySelector('[name="config.url"]'));
        assert.notOk(input);
      });

      it('the url input change changes the config object', () => {
        const input = /** @type HTMLInputElement */ (element.shadowRoot.querySelector('[name="config.url"]'));
        input.value = 'test-url';
        input.dispatchEvent(new CustomEvent('input'));
        const result = /** @type DeleteCookieConfig */ (element.config);
        assert.equal(result.url, 'test-url');
      });

      it('the url input input change dispatches the change event', () => {
        const spy = sinon.spy();
        element.addEventListener('change', spy);
        const input = /** @type HTMLInputElement */ (element.shadowRoot.querySelector('[name="config.url"]'));
        input.value = 'test-url';
        input.dispatchEvent(new CustomEvent('input'));
        assert.isTrue(spy.calledOnce);
      });
    });

    describe('cookie name', () => {
      let element = /** @type ARCActionEditorElement */ (null);
      beforeEach(async () => { element = await basicOpenedFixture() });

      it('renders the remove all cookies input', () => {
        const input = /** @type HTMLInputElement */ (element.shadowRoot.querySelector('[name="config.removeAll"]'));
        assert.ok(input);
      });

      it('the remove all cookies input change changes the config object', () => {
        const input = /** @type HTMLInputElement */ (element.shadowRoot.querySelector('[name="config.removeAll"]'));
        input.click();
        const result = /** @type DeleteCookieConfig */ (element.config);
        assert.isTrue(result.removeAll);
      });

      it('the remove all cookies change dispatches the change event', () => {
        const spy = sinon.spy();
        element.addEventListener('change', spy);
        const input = /** @type HTMLInputElement */ (element.shadowRoot.querySelector('[name="config.removeAll"]'));
        input.click();
        assert.isTrue(spy.calledOnce);
      });

      it('renders the cookie name input', () => {
        const input = /** @type HTMLInputElement */ (element.shadowRoot.querySelector('[name="config.name"]'));
        assert.ok(input);
      });

      it('does not render name input when remove all cookies is set', async () => {
        const checkbox = /** @type HTMLInputElement */ (element.shadowRoot.querySelector('[name="config.removeAll"]'));
        checkbox.click();
        await nextFrame();
        const input = /** @type HTMLInputElement */ (element.shadowRoot.querySelector('[name="config.name"]'));
        assert.notOk(input);
      });

      it('the name input change changes the config object', () => {
        const input = /** @type HTMLInputElement */ (element.shadowRoot.querySelector('[name="config.name"]'));
        input.value = 'test-name';
        input.dispatchEvent(new CustomEvent('input'));
        const result = /** @type DeleteCookieConfig */ (element.config);
        assert.equal(result.name, 'test-name');
      });

      it('the name input input change dispatches the change event', () => {
        const spy = sinon.spy();
        element.addEventListener('change', spy);
        const input = /** @type HTMLInputElement */ (element.shadowRoot.querySelector('[name="config.name"]'));
        input.value = 'test-name';
        input.dispatchEvent(new CustomEvent('input'));
        assert.isTrue(spy.calledOnce);
      });
    });
  });
});
