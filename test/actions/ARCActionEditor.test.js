import { assert, fixture, html, nextFrame } from '@open-wc/testing';
import sinon from 'sinon';
import '../../define/arc-action-editor.js'

/** @typedef {import('../../index').ARCActionEditorElement} ARCActionEditorElement */
/** @typedef {import('@advanced-rest-client/events').Actions.SetCookieConfig} SetCookieConfig */
/** @typedef {import('@anypoint-web-components/awc').AnypointListboxElement} AnypointListbox */
/** @typedef {import('@anypoint-web-components/awc').AnypointSwitchElement} AnypointSwitch */

describe('ARCActionEditorElement', () => {
  describe('Basics', () => {

    /**
     * @returns {Promise<ARCActionEditorElement>}
     */
    async function basicFixture() {
      return fixture(html`<arc-action-editor type="request"></arc-action-editor>`);
    }

    /**
     * @returns {Promise<ARCActionEditorElement>}
     */
    async function basicOpenedFixture() {
      return fixture(html`<arc-action-editor type="request" opened></arc-action-editor>`);
    }

    describe('closed basic setup', () => {
      let element = /** @type ARCActionEditorElement */ (null);
      beforeEach(async () => { element = await basicFixture() });

      it('renders the closed title', () => {
        const node = element.shadowRoot.querySelector('.closed-title');
        assert.ok(node);
      });

      it('has action title', () => {
        const node = element.shadowRoot.querySelector('.action-title');
        // no action, no title
        assert.equal(node.textContent.trim(), '');
      });

      it('opens the action from the button click', () => {
        const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('.action-open'));
        node.click();
        assert.isTrue(element.opened);
      });
    });
  
    describe('opened basic setup', () => {
      let element = /** @type ARCActionEditorElement */ (null);
      beforeEach(async () => { element = await basicOpenedFixture() });

      it('renders the action content', () => {
        const input = /** @type HTMLElement */ (element.shadowRoot.querySelector('.action-content'));
        assert.ok(input);
      });
    });
  
    describe('opening and closing the action UI', () => {
      let element = /** @type ARCActionEditorElement */ (null);
      beforeEach(async () => { element = await basicOpenedFixture() });

      it('title close button closes the action UI', () => {
        const button = /** @type HTMLElement */ (element.shadowRoot.querySelector('.opened-title [data-action="close"]'));
        button.click();
        assert.isFalse(element.opened);
      });

      it('the close button dispatches the change event', () => {
        const spy = sinon.spy();
        element.addEventListener('change', spy);
        const button = /** @type HTMLElement */ (element.shadowRoot.querySelector('.opened-title [data-action="close"]'));
        button.click();
        assert.isTrue(spy.called);
        assert.equal(spy.args[0][0].detail.prop, 'view.opened', 'The event has changed property path');
      });

      it('footer close button closes the action UI', () => {
        const button = /** @type HTMLElement */ (element.shadowRoot.querySelector('.action-footer [data-action="close"]'));
        button.click();
        assert.isFalse(element.opened);
      });

      it('renders closed view after closing', async () => {
        const button = /** @type HTMLElement */ (element.shadowRoot.querySelector('.action-footer [data-action="close"]'));
        button.click();
        await nextFrame();
        const opened = /** @type HTMLElement */ (element.shadowRoot.querySelector('.closed-title'));
        assert.ok(opened);
      });

      it('does not render opened view after closing', async () => {
        const button = /** @type HTMLElement */ (element.shadowRoot.querySelector('.action-footer [data-action="close"]'));
        button.click();
        await nextFrame();
        const opened = /** @type HTMLElement */ (element.shadowRoot.querySelector('.action-content'));
        assert.notOk(opened);
      });
    });

    describe('deleting the action', () => {
      let element = /** @type ARCActionEditorElement */ (null);
      beforeEach(async () => { element = await basicOpenedFixture() });
  
      it('dispatches the remove event', () => {
        const spy = sinon.spy();
        element.addEventListener('remove', spy);
        const button = /** @type HTMLElement */ (element.shadowRoot.querySelector('.action-footer [data-action="delete"]'));
        button.click();
        assert.isTrue(spy.called);
      });
    });

    describe('duplicating the action', () => {
      let element = /** @type ARCActionEditorElement */ (null);
      beforeEach(async () => { element = await basicOpenedFixture() });
  
      it('dispatches the duplicate event', () => {
        const spy = sinon.spy();
        element.addEventListener('duplicate', spy);
        const button = /** @type HTMLElement */ (element.shadowRoot.querySelector('.action-footer [data-action="duplicate"]'));
        button.click();
        assert.isTrue(spy.called);
      });
    });

    describe('enable/disable the action', () => {
      let element = /** @type ARCActionEditorElement */ (null);
      beforeEach(async () => { element = await basicOpenedFixture() });
  
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
  });
});
