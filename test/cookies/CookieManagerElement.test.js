import { fixture, assert, html, nextFrame, aTimeout } from '@open-wc/testing';
import sinon from 'sinon';
import { ArcMock } from '@advanced-rest-client/arc-mock';
import { SessionCookieEventTypes, SessionCookieEvents } from '@advanced-rest-client/events';
import { CookieStub } from './stub.js';
import '../../define/cookie-manager.js';
import { resetSearch, beforeQueryItemsValue, deleteCookies, deleteHandler, getCookieIndex, nextInsertAtPositionValue, exportAllHandler, exportItemsValue } from '../../src/elements/cookies/CookieManagerElement.js';

/** @typedef {import('../../src/elements/cookies/CookieManagerElement').default} CookieManagerElement */
/** @typedef {import('@advanced-rest-client/events').Cookies.ARCCookie} ARCCookie */
/** @typedef {import('@anypoint-web-components/awc').AnypointInputElement} AnypointInput */
/** @typedef {import('@anypoint-web-components/awc').AnypointCheckboxElement} AnypointCheckbox */

describe('CookieManagerElement', () => {
  /**
   *
   * @param {ARCCookie[]=} cookies
   * @return {Promise<CookieManagerElement>}
   */
  async function basicFixture(cookies) {
    return (fixture(html`<cookie-manager .items="${cookies}"></cookie-manager>`));
  }

  const generator = new ArcMock();

  describe('Basics', () => {
    before(() => {
      CookieStub.mockBridge();
    });

    after(() => {
      CookieStub.stop();
    });

    it('queries for cookies when attached', (done) => {
      window.addEventListener(SessionCookieEventTypes.listAll, function f() {
        window.removeEventListener(SessionCookieEventTypes.listAll, f);
        done();
      });
      basicFixture();
    });

    it('hasItems is false when no items', async () => {
      const element = await basicFixture();
      assert.isFalse(element.hasItems);
    });

    it('dataUnavailable is true when no items', async () => {
      const element = await basicFixture();
      assert.isTrue(element.dataUnavailable);
    });

    it('renders the add cookie button', async () => {
      const element = await basicFixture();
      const button = element.shadowRoot.querySelector('[data-action="add-cookie"]');
      assert.ok(button);
    });

    it('opens the editor on add cookie button click', async () => {
      const element = await basicFixture();
      const button = /** @type HTMLElement */ (element.shadowRoot.querySelector('[data-action="add-cookie"]'));
      button.click();
      await nextFrame();
      assert.isTrue(element.editorOpened);
    });

    it('renders the refresh cookie button', async () => {
      const element = await basicFixture();
      const button = element.shadowRoot.querySelector('[data-action="refresh-list"]');
      assert.ok(button);
    });

    it('the refresh list button queryies for the data', async () => {
      const element = await basicFixture();
      const button = /** @type HTMLElement */ (element.shadowRoot.querySelector('[data-action="refresh-list"]'));

      const spy = sinon.spy();
      element.addEventListener(SessionCookieEventTypes.listAll, spy);
      button.click();
      assert.isTrue(spy.called);
    });
  });

  describe('#listHidden', () => {
    let element = /** @type CookieManagerElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('returns false when isSearch', () => {
      element.isSearch = true;
      assert.isFalse(element.listHidden);
    });

    it('returns false when has items', () => {
      element.items = generator.cookies.cookies(1);
      assert.isFalse(element.listHidden);
    });

    it('returns true when no items', () => {
      element.items = undefined;
      assert.isTrue(element.listHidden);
    });
  });

  describe('#hasItems', () => {
    let element = /** @type CookieManagerElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('returns false when no items', () => {
      assert.isFalse(element.hasItems);
    });

    it('returns true when has items', () => {
      element.items = generator.cookies.cookies(1);
      assert.isTrue(element.hasItems);
    });
  });

  describe('#dataUnavailable', () => {
    let element = /** @type CookieManagerElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('returns false when has items', () => {
      element.items = generator.cookies.cookies(1);
      // element.loading = false;
      element.isSearch = false;
      assert.isFalse(element.dataUnavailable);
    });

    it('returns false when isSearch', () => {
      element.isSearch = true;
      assert.isFalse(element.dataUnavailable);
    });

    it('returns true when all is false', () => {
      // element.loading = false;
      element.isSearch = false;
      assert.isTrue(element.dataUnavailable);
    });
  });
  
  describe('[resetSearch]()', () => {
    before(() => {
      CookieStub.mockBridge();
    });

    after(() => {
      CookieStub.stop();
    });

    let element = /** @type CookieManagerElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
      await aTimeout(0);
    });

    it('sets "items" to "[beforeQueryItemsValue]"', () => {
      element[beforeQueryItemsValue] = generator.cookies.cookies(50);
      element[resetSearch]();
      assert.lengthOf(element.items, 50);
    });

    it('Clears "_beforeQueryItems"', () => {
      element[beforeQueryItemsValue] = generator.cookies.cookies(50);
      element[resetSearch]();
      assert.isUndefined(element[beforeQueryItemsValue]);
    });

    it('Resets isSearch', () => {
      element.isSearch = true;
      element[resetSearch]();
      assert.isFalse(element.isSearch);
    });

    it('Queries for cookies when no _beforeQueryItems', () => {
      const spy = sinon.spy();
      element.addEventListener(SessionCookieEventTypes.listAll, spy);
      element[resetSearch]();
      assert.isTrue(spy.called);
    });

    it('Do not query for cookies if _beforeQueryItems', () => {
      element[beforeQueryItemsValue] = generator.cookies.cookies(50);
      const spy = sinon.spy();
      element.addEventListener(SessionCookieEventTypes.listAll, spy);
      element[resetSearch]();
      assert.isFalse(spy.called);
    });
  });

  describe('[deleteCookies]()', () => {
    before(() => {
      CookieStub.mockBridge();
    });

    after(() => {
      CookieStub.stop();
    });

    let element = /** @type CookieManagerElement */ (null);
    let cookies = /** @type ARCCookie[] */ (null);

    beforeEach(async () => {
      element = await basicFixture();
      cookies = generator.cookies.cookies(1);
      await aTimeout(0);
    });

    it(`dispatches the ${SessionCookieEventTypes.delete} event`, (done) => {
      element.addEventListener(SessionCookieEventTypes.delete, (e) => {
        e.preventDefault();
        // @ts-ignore
        assert.deepEqual(e.cookies, cookies, 'Cookie is set');
        assert.isTrue(e.cancelable, 'Event is cancelable');
        assert.isTrue(e.bubbles, 'Event bubbles');
        // @ts-ignore
        e.detail.result = Promise.resolve();
        done();
      });
      element[deleteCookies](cookies);
    });

    it('[deleteHandler]() calls [deleteCookies]() with an argument', () => {
      element.addEventListener(SessionCookieEventTypes.delete, (e) => {
        e.preventDefault();
        // @ts-ignore
        e.detail.result = Promise.resolve();
      });
      const items = [{ name: 'test' }];
      // @ts-ignore
      element.items = items;
      element.selectedIndexes = [0];
      const spy = sinon.spy(element, deleteCookies);
      element[deleteHandler]();
      assert.isTrue(spy.called);
      assert.deepEqual(spy.args[0][0], items);
    });
  });

  describe('With cookies', () => {
    let cookies = /** @type ARCCookie[] */ (null);
    before(() => {
      cookies = generator.cookies.cookies(50);
      CookieStub.mockBridge(cookies);
    });

    after(() => {
      CookieStub.stop();
    });

    let element = /** @type CookieManagerElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
      await aTimeout(0);
    });

    it('hasItems is computed', () => {
      assert.isTrue(element.hasItems);
    });

    it('Computes dataUnavailable property', () => {
      assert.isFalse(element.dataUnavailable);
    });

    it('Computes listHidden property', () => {
      assert.isFalse(element.listHidden);
    });
  });

  describe('[searchHandler]()', () => {
    let cookies = /** @type ARCCookie[] */ (null);
    before(() => {
      cookies = generator.cookies.cookies(1);
      CookieStub.mockBridge(cookies);
    });

    after(() => {
      CookieStub.stop();
    });

    let element = /** @type CookieManagerElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
      await aTimeout(0);
    });

    it('calls query() with an argument', async () => {
      element.isSearch = true;
      await nextFrame();
      const input = /** @type HTMLInputElement */ (element.shadowRoot.querySelector('.search-input'))
      input.value = 'test';
      const spy = sinon.spy(element, 'query');
      input.dispatchEvent(new Event('search'));
      assert.isTrue(spy.called);
      assert.equal(spy.args[0][0], 'test');
    });
  });

  describe('query()', () => {
    let cookies = /** @type ARCCookie[] */ (null);
    before(() => {
      cookies = generator.cookies.cookies(10);
      CookieStub.mockBridge(cookies);
    });

    after(() => {
      CookieStub.stop();
    });

    let element = /** @type CookieManagerElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
      await aTimeout(0);
    });

    it('calls [resetSearch]() when no argument', () => {
      const spy = sinon.spy(element, resetSearch);
      element.query('');
      assert.isTrue(spy.called);
    });

    it('sets isSearch property', () => {
      element.query('test');
      assert.isTrue(element.isSearch);
    });

    it('sets [beforeQueryItemsValue] property', () => {
      element.query('test');
      assert.lengthOf(element[beforeQueryItemsValue], 10);
    });

    it('does not set _beforeQueryItems property when already set', () => {
      const items = [{ name: 'test' }];
      // @ts-ignore
      element[beforeQueryItemsValue] = items;
      element.query('test');
      assert.isTrue(element[beforeQueryItemsValue] === items);
    });

    it('Filters by name', () => {
      const name = 'test-name';
      element.items[0].name = name;
      element.query(name);
      assert.lengthOf(element.items, 1);
      assert.equal(element.items[0].name, name);
    });

    it('Filters by name case insensitive', () => {
      const name = 'Test-Name';
      element.items[0].name = name;
      element.query('tesT-namE');
      assert.lengthOf(element.items, 1);
      assert.equal(element.items[0].name, name);
    });

    it('Filters by domain', () => {
      const domain = 'test-domain';
      element.items[0].domain = domain;
      element.query(domain);
      assert.lengthOf(element.items, 1);
      assert.equal(element.items[0].domain, domain);
    });

    it('Filters by domain case insensitive', () => {
      const domain = 'Test-Domain';
      element.items[0].domain = domain;
      element.query('tesT-domaiN');
      assert.lengthOf(element.items, 1);
      assert.equal(element.items[0].domain, domain);
    });

    it('Filters by value', () => {
      const value = 'test-value';
      element.items[0].value = value;
      element.query(value);
      assert.lengthOf(element.items, 1);
      assert.equal(element.items[0].value, value);
    });

    it('Filters by value case insensitive', () => {
      const value = 'Test-Value';
      element.items[0].value = value;
      element.query('tesT-valuE');
      assert.lengthOf(element.items, 1);
      assert.equal(element.items[0].value, value);
    });

    it('Filters by path', () => {
      const path = 'test-path';
      element.items[0].path = path;
      element.query(path);
      assert.lengthOf(element.items, 1);
      assert.equal(element.items[0].path, path);
    });

    it('Filters by path case insensitive', () => {
      const path = 'Test-Path';
      element.items[0].path = path;
      element.query('tesT-patH');
      assert.lengthOf(element.items, 1);
      assert.equal(element.items[0].path, path);
    });

    it('Resets the items when no argument', () => {
      element.query('test-non-existing');
      assert.lengthOf(element.items, 0);
      element.query('');
      assert.lengthOf(element.items, 10);
    });
  });

  describe('[getCookieIndex]()', () => {
    before(() => {
      CookieStub.mockBridge();
    });

    after(() => {
      CookieStub.stop();
    });

    let element = /** @type CookieManagerElement */ (null);
    beforeEach(async () => {
      const items = generator.cookies.cookies(3);
      element = await basicFixture(items);
    });

    it('returns cookie index', () => {
      const result = element[getCookieIndex](element.items[1]);
      assert.equal(result, 1);
    });

    it('Returns -1 when not found', () => {
      const result = element[getCookieIndex]({ name: 'a', path: 'b', domain: 'c' });
      assert.equal(result, -1);
    });

    it('Returns -1 when no items', () => {
      element.items = undefined;
      const result = element[getCookieIndex]({ name: 'a', path: 'b', domain: 'c' });
      assert.equal(result, -1);
    });

    it('Returns -1 when items is empty', () => {
      element.items = [];
      const result = element[getCookieIndex]({ name: 'a', path: 'b', domain: 'c' });
      assert.equal(result, -1);
    });
  });

  describe('[cookieDeleteHandler]()', () => {
    before(() => {
      CookieStub.mockBridge();
    });

    after(() => {
      CookieStub.stop();
    });

    let element = /** @type CookieManagerElement */ (null);
    beforeEach(async () => {
      const items = generator.cookies.cookies(3);
      element = await basicFixture(items);
    });

    it('removes a cookie', () => {
      SessionCookieEvents.State.delete(document.body, element.items[0]);
      assert.lengthOf(element.items, 2);
    });

    it('Ignores action when cookie not found', () => {
      SessionCookieEvents.State.delete(document.body, { name: 'a', domain: 'b', path: 'c' });
      assert.lengthOf(element.items, 3);
    });

    it('resets [nextInsertAtPositionValue]', () => {
      element[nextInsertAtPositionValue] = true;
      SessionCookieEvents.State.delete(document.body, element.items[1]);
      assert.isFalse(element[nextInsertAtPositionValue]);
    });

    it('Sets _nextInsertPosition', () => {
      element[nextInsertAtPositionValue] = true;
      SessionCookieEvents.State.delete(document.body, element.items[2]);
      assert.equal(element._nextInsertPosition, 2);
    });
  });

  describe('[cookieUpdateHandler]()', () => {
    before(() => {
      CookieStub.mockBridge();
    });

    after(() => {
      CookieStub.stop();
    });

    let element = /** @type CookieManagerElement */ (null);
    beforeEach(async () => {
      const items = generator.cookies.cookies(3);
      element = await basicFixture(items);
    });

    it('updates an existing cookie', () => {
      const cookie = { ...element.items[0] };
      cookie.value = 'test-value';
      SessionCookieEvents.State.update(document.body, cookie);
      assert.equal(element.items[0].value, 'test-value');
    });

    it('adds a new cookie', () => {
      SessionCookieEvents.State.update(document.body, { name: 'a', domain: 'b', path: 'c' });
      assert.lengthOf(element.items, 4);
      assert.equal(element.items[3].name, 'a');
    });

    it('creates items array', () => {
      element.items = undefined;
      SessionCookieEvents.State.update(document.body, { name: 'a', domain: 'b', path: 'c' });
      assert.lengthOf(element.items, 1);
    });

    it('Updates cookie at position', () => {
      element._nextInsertPosition = 1;
      const cookie = { name: 'a', domain: 'b', path: 'c' };
      SessionCookieEvents.State.update(document.body, cookie);
      assert.deepEqual(element.items[1], cookie);
    });
  });

  describe('[exportAllHandler]()', () => {
    before(() => {
      CookieStub.mockBridge();
    });

    after(() => {
      CookieStub.stop();
    });

    let element = /** @type CookieManagerElement */ (null);
    beforeEach(async () => {
      const items = generator.cookies.cookies(3);
      element = await basicFixture(items);
    });

    it('sets exportOptionsOpened', () => {
      element[exportAllHandler]();
      assert.isTrue(element.exportOptionsOpened);
    });

    it('sets [exportItemsValue]', () => {
      element[exportAllHandler]();
      assert.deepEqual(element[exportItemsValue], element.items);
    });
  });

  describe.skip('Cookie details', () => {
    before(() => {
      CookieStub.mockBridge();
    });

    after(() => {
      CookieStub.stop();
    });

    let element = /** @type CookieManagerElement */ (null);
    beforeEach(async () => {
      const items = generator.cookies.cookies(3);
      element = await basicFixture(items);
    });

    it('sets cookie on a detail panel', async () => {
      const button = /** @type HTMLElement */ (element.shadowRoot.querySelector('[data-action="item-detail"]'));
      button.click();
      await element.updateComplete;
      await nextFrame();
      await element.updateComplete;
      const viewer = element.shadowRoot.querySelector('cookie-details');
      assert.deepEqual(viewer.cookie, element.items[0]);
    });

    it('opens cookie detail', async () => {
      const button = /** @type HTMLElement */ (element.shadowRoot.querySelector('[data-action="item-detail"]'));
      button.click();
      await element.updateComplete;
      await nextFrame();
      const viewer = element.shadowRoot.querySelector('cookie-details');
      // @ts-ignore
      assert.isTrue(viewer.opened);
    });

    it('sets up the editor when requested', async () => {
      const button = /** @type HTMLElement */ (element.shadowRoot.querySelector('[data-action="item-detail"]'));
      button.click();
      await nextFrame();
      const viewer = element.shadowRoot.querySelector('cookie-details');
      viewer.dispatchEvent(new CustomEvent('edit'));
      const editor = element.shadowRoot.querySelector('cookie-editor');
      assert.deepEqual(editor.cookie, element.items[0], 'editor cookie is set');
      assert.isUndefined(editor.cookie, 'details cookie is cleared');
    });
  });
});
