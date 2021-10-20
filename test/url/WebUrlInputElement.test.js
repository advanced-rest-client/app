import { fixture, html, assert, nextFrame, aTimeout, oneEvent } from '@open-wc/testing';
import sinon from 'sinon';
import { UrlHistoryModel } from '@advanced-rest-client/idb-store';
import { ArcNavigationEventTypes, ArcModelEventTypes } from '@advanced-rest-client/events';
import * as MockInteractions from '../MockInteractions.js';
import '../../define/web-url-input.js';
import {
  autocompleteTarget,
  enterHandler,
  readAutocomplete,
  autocompleteRef,
} from '../../src/elements/url/internals.js';

/** @typedef {import('../../index').WebUrlInputElement} WebUrlInputElement */

describe('WebUrlInputElement', () => {
  /** @type UrlHistoryModel */
  let model;

  before(() => {
    model = new UrlHistoryModel();
    model.listen(window);
  });

  /**
   * @return {Promise<WebUrlInputElement>}
   */
  async function basicFixture() {
    return fixture(html`
      <web-url-input purpose="test"></web-url-input>
    `);
  }

  /**
   * @param {EventTarget} element 
   */
  function mockSingleQuery(element) {
    element.addEventListener(ArcModelEventTypes.UrlHistory.query, function f (e) {
      e.preventDefault();
      e.stopPropagation();
      element.removeEventListener(ArcModelEventTypes.UrlHistory.query, f);
      // @ts-ignore
      e.detail.result = Promise.resolve([
        { url: 'url1', },
        { url: 'url2', },
      ]);
    });
  }

  function mockSingleQueryError(element) {
    element.addEventListener(ArcModelEventTypes.UrlHistory.query, (e) => {
      e.preventDefault();
      e.stopPropagation();
      element.removeEventListener(ArcModelEventTypes.UrlHistory.query, e);
      // @ts-ignore
      e.detail.result = Promise.reject(new Error('test'));
    });
  }

  describe('basics', () => {
    let element = /** @type WebUrlInputElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('`web-url-input` is hidden by default', () => {
      assert.equal(element.style.display, 'none');
    });

    it('Computes _autocompleteTarget', () => {
      const input = element.shadowRoot.querySelector('anypoint-input');
      assert.isTrue(element[autocompleteTarget] === input);
    });

    it(`dispatches ${ArcNavigationEventTypes.navigateExternal} event`, async () => {
      const value = 'https://test.com';
      element.value = value;
      element.opened = true;
      await nextFrame();
      const spy = sinon.spy();
      element.addEventListener(ArcNavigationEventTypes.navigateExternal, spy);
      const button = element.shadowRoot.querySelector('anypoint-button');
      button.click();
      assert.isTrue(spy.called, 'the event is dispatched');
      const event = spy.args[0][0];
      assert.equal(event.url, value, 'the url is set');
      assert.equal(event.detail.purpose, 'test', 'the purpose is set');
    });

    it('queries for suggestions', async () => {
      const value = 'https://a';
      element.value = value;
      element.opened = true;
      await nextFrame();
      const spy = sinon.spy();
      element.addEventListener(ArcModelEventTypes.UrlHistory.query, spy);
      const ac = element.shadowRoot.querySelector('anypoint-autocomplete');
      ac.dispatchEvent(new CustomEvent('query', { detail: { value } }));
      assert.isTrue(spy.called);
    });

    it('accepts selection on enter', async () => {
      element.opened = true;
      const spy = sinon.spy(element, enterHandler);
      element.value = 'abc';
      await nextFrame();
      const input = element.shadowRoot.querySelector('anypoint-input');
      // @ts-ignore
      await MockInteractions.pressAndReleaseKeyOn(input.inputElement, 'Enter', [], 'Enter');
      assert.isTrue(spy.called);
    });

    it.skip('Opens suggestions after query', async () => {
      mockSingleQuery(element);
      element.opened = true;
      const input = element.shadowRoot.querySelector('anypoint-input');
      element.value = 'u';
      await nextFrame();
      MockInteractions.keyEventOn(input.inputElement, 'input', 114, [], 'r');
      await nextFrame();
      assert.isTrue(element.suggestionsOpened);
    });

    it('closes the overlay when ESC key', async () => {
      element.opened = true;
      await nextFrame();
      MockInteractions.keyEventOn(document.body, 'keydown', 27, [], 'Escape');
      assert.isFalse(element.opened);
    });

    it('does not close overlay when suggestions are opened', async () => {
      element.opened = true;
      element.suggestionsOpened = true;
      await nextFrame();
      MockInteractions.keyEventOn(document.body, 'keydown', 27, [], 'Escape');
      assert.isTrue(element.opened);
    });
  });

  describe('[keyDownHandler]()', () => {
    let element = /** @type WebUrlInputElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
      await nextFrame();
    });

    function addInput(el) {
      const input = document.createElement('input');
      el.shadowRoot.appendChild(input);
      return input;
    }

    it('calls [enterHandler]() when is Enter', () => {
      const input = addInput(element);
      const spy = sinon.spy(element, enterHandler);
      // @ts-ignore
      MockInteractions.keyEventOn(input, 'keydown', 'Enter', [], 'Enter');
      assert.isTrue(spy.called);
    });

    it('ignores other letters', () => {
      const input = addInput(element);
      const spy = sinon.spy(element, enterHandler);
      // @ts-ignore
      MockInteractions.keyEventOn(input, 'keydown', 'r', [], 'r');
      assert.isFalse(spy.called);
    });

    it('Ignores when target is not input', () => {
      const spy = sinon.spy(element, enterHandler);
      // @ts-ignore
      MockInteractions.keyEventOn(element, 'keydown', 'r', [], 'r');
      assert.isFalse(spy.called);
    });
  });

  describe('[readAutocomplete]()', () => {
    const query = 'test-query';
    let element = /** @type WebUrlInputElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('sets autocomplete source', async () => {
      mockSingleQuery(element);

      await element[readAutocomplete](query);
      assert.deepEqual(element[autocompleteRef].source, ['url1', 'url2']);
    });

    it('Sets autocomplete when error', async () => {
      mockSingleQueryError(element);
      await element[readAutocomplete](query);
      assert.deepEqual(element[autocompleteRef].source, []);
    });
  });

  describe('[enterHandler]()', () => {
    let element = /** @type WebUrlInputElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
      element.opened = true;
      await nextFrame();
    });

    it('closes the overlay', () => {
      element[enterHandler]();
      assert.isFalse(element.opened);
    });

    it(`dispatches ${ArcNavigationEventTypes.navigateExternal} event`, () => {
      const spy = sinon.spy();
      element.addEventListener(ArcNavigationEventTypes.navigateExternal, spy);
      element[enterHandler]();
      assert.isTrue(spy.called);
    });

    it('ignores the call when suggestions are opened', () => {
      element.suggestionsOpened = true;
      const spy = sinon.spy();
      element.addEventListener(ArcNavigationEventTypes.navigateExternal, spy);
      element[enterHandler]();
      assert.isFalse(spy.called);
    });
  });

  describe('[autocompleteQueryHandler]()', () => {
    let element = /** @type WebUrlInputElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('makes the query when has the value', () => {
      const value = 'test';
      const spy = sinon.spy();
      element.addEventListener(ArcModelEventTypes.UrlHistory.query, spy);
      const ac = element.shadowRoot.querySelector('anypoint-autocomplete');
      ac.dispatchEvent(new CustomEvent('query', { detail: { value } }));
      assert.isTrue(spy.called);
    });

    it('clears the suggestions when has no value', async () => {
      const ac = element.shadowRoot.querySelector('anypoint-autocomplete');
      ac.source = [ 'test' ];
      ac.dispatchEvent(new CustomEvent('query', { detail: { value: '' } }));
      await aTimeout(0);
      assert.deepEqual(ac.source, []);
    });
  });

  describe('autosuggestion input open/close events', () => {
    let element = /** @type WebUrlInputElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
    });
    [
      'closed', 'overlay-closed', 'iron-overlay-closed',
      'opened', 'overlay-opened', 'iron-overlay-opened',
    ].forEach((type) => {
      it(`cancels autocomplete ${type} event`, async () => {
        const spy = sinon.spy();
        element.addEventListener(type, spy);
        const ac = element.shadowRoot.querySelector('anypoint-autocomplete');
        ac.dispatchEvent(new CustomEvent(type, { bubbles: true, composed: true, cancelable: true }));
        assert.isFalse(spy.called);
      });
    });
  });

  describe('open/close transitions', () => {
    let element = /** @type WebUrlInputElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('eventually dispatches "opened" event', async () => {
      element.opened = true;
      await oneEvent(element, 'opened');
    });

    it('eventually dispatches "closed" event', async () => {
      element.opened = true;
      await oneEvent(element, 'opened');
      element.opened = false;
      await oneEvent(element, 'closed');
    });
  });

  describe('a11y', () => {
    it('is accessible in normal state', async () => {
      const input = await fixture(
        `<web-url-input purpose="test"></web-url-input>`
      );
      await assert.isAccessible(input);
    });

    it('is accessible in opened state', async () => {
      const input = await fixture(`<web-url-input opened></web-url-input>`);
      await assert.isAccessible(input);
    });
  });
});
