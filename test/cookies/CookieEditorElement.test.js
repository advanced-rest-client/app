import { fixture, assert, html, nextFrame } from '@open-wc/testing';
import sinon from 'sinon';
import { ArcMock } from '@advanced-rest-client/arc-mock';
import '../../define/cookie-editor.js';

/** @typedef {import('../../src/elements/cookies/CookieEditorElement').default} CookieEditorElement */
/** @typedef {import('@advanced-rest-client/events').Cookies.ARCCookie} ARCCookie */
/** @typedef {import('@anypoint-web-components/awc').AnypointInputElement} AnypointInput */
/** @typedef {import('@anypoint-web-components/awc').AnypointCheckboxElement} AnypointCheckbox */

describe('CookieEditorElement', () => {
  /**
   *
   * @param {ARCCookie=} cookie
   * @return {Promise<CookieEditorElement>}
   */
  async function basicFixture(cookie) {
    return (fixture(html`<cookie-editor .cookie="${cookie}"></cookie-editor>`));
  }

  const generator = new ArcMock();

  describe('empty editor', () => {
    const name = 'test-name';
    const value = 'test-value';
    const domain = 'test-domain';
    const path = 'test-path';
    const exp = 1508510400000;

    let element = /** @type CookieEditorElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('does not passes validation', () => {
      const validated = element.validate();
      assert.isFalse(validated);
    });

    it('does not sends save event', () => {
      const spy = sinon.spy();
      element.addEventListener('save', spy);
      const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('[data-action="save-action"]'));
      node.click();
      assert.isFalse(spy.called);
    });

    it('sends save event for minimum required', async () => {
      const spy = sinon.spy();
      element.addEventListener('save', spy);
      const cookie = {
        name,
        domain,
        path,
      };
      element.cookie = cookie;
      await nextFrame();
      const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('[data-action="save-action"]'));
      node.click();
      assert.isTrue(spy.calledOnce);
    });

    it('the event contains form properties', async () => {
      const spy = sinon.spy();
      element.addEventListener('save', spy);
      const cookie = {
        name,
        domain,
        path,
        value,
        expires: exp,
        hostOnly: true,
        httpOnly: true,
        secure: true,
        session: true
      };
      element.cookie = cookie;
      await nextFrame();
      const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('[data-action="save-action"]'));
      node.click();
      const { detail } = spy.args[0][0];
      assert.typeOf(detail, 'object');
      assert.equal(detail.name, name);
      assert.equal(detail.domain, domain);
      assert.equal(detail.value, value);
      assert.typeOf(detail.expires, 'number');
      assert.isTrue(detail.hostOnly, 'has hostOnly');
      assert.isTrue(detail.httpOnly, 'has httpOnly');
      assert.isTrue(detail.secure, 'has secure');
      assert.isTrue(detail.session, 'has session');
    });

    it('cancel button fires cancel custom event', () => {
      const spy = sinon.spy();
      element.addEventListener('cancel', spy);
      const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('[data-action="cancel-action"]'));
      node.click();
      assert.isTrue(spy.calledOnce);
    });
  });

  describe('Setting values', () => {
    let element = /** @type CookieEditorElement */ (null);
    let cookie = /** @type ARCCookie */ (null);
    beforeEach(async () => {
      cookie = generator.cookies.cookie();
      cookie.secure = true;
      cookie.session = true;
      element = await basicFixture(cookie);
    });

    it('has a cookie on the element', () => {
      assert.deepEqual(element.cookie, cookie);
    });

    it('has name set', () => {
      assert.equal(element._cookieName, cookie.name);
      const input = /** @type AnypointInput */ (element.shadowRoot.querySelector('[name="name"]'));
      assert.equal(input.value, cookie.name);
    });

    it('has value set', () => {
      assert.equal(element._cookieValue, cookie.value);
      const input = /** @type AnypointInput */ (element.shadowRoot.querySelector('[name="value"]'));
      assert.equal(input.value, cookie.value);
    });

    it('has domain set', () => {
      assert.equal(element._cookieDomain, cookie.domain);
      const input = /** @type AnypointInput */ (element.shadowRoot.querySelector('[name="domain"]'));
      assert.equal(input.value, cookie.domain);
    });

    it('has path set', () => {
      assert.equal(element._cookiePath, cookie.path);
      const input = /** @type AnypointInput */ (element.shadowRoot.querySelector('[name="path"]'));
      assert.equal(input.value, cookie.path);
    });

    it('has expires set', () => {
      assert.typeOf(element._expires, 'string');
      const input = /** @type AnypointInput */ (element.shadowRoot.querySelector('[name="expires"]'));
      assert.typeOf(input.value, 'string');
    });

    it('has hostOnly set', () => {
      assert.equal(element._hostOnly, cookie.hostOnly);
      const input = /** @type AnypointCheckbox */ (element.shadowRoot.querySelector('[name="hostOnly"]'));
      assert.equal(input.checked, cookie.hostOnly);
    });

    it('has httpOnly set', () => {
      assert.equal(element._httpOnly, cookie.httpOnly);
      const input = /** @type AnypointCheckbox */ (element.shadowRoot.querySelector('[name="httpOnly"]'));
      assert.equal(input.checked, cookie.httpOnly);
    });

    it('has secure set', () => {
      assert.equal(element._secure, cookie.secure);
      const input = /** @type AnypointCheckbox */ (element.shadowRoot.querySelector('[name="secure"]'));
      assert.equal(input.checked, cookie.secure);
    });

    it('has session set', () => {
      assert.equal(element._session, cookie.session);
      const input = /** @type AnypointCheckbox */ (element.shadowRoot.querySelector('[name="session"]'));
      assert.equal(input.checked, cookie.session);
    });

    it('clears values after resetting the cookies', () => {
      element.cookie = undefined;
      assert.equal(element._cookieName, '');
      assert.equal(element._cookieValue, '');
      assert.equal(element._cookieDomain, '');
      assert.equal(element._cookiePath, '');
      assert.equal(element._expires, '');
      assert.isFalse(element._hostOnly);
      assert.isFalse(element._httpOnly);
      assert.isFalse(element._secure);
      assert.isFalse(element._session);
    });

    it('handles invalid "expires" value', () => {
      const c = { ...cookie, expires: 'invalid value' };
      // @ts-ignore
      element.cookie = c;
      assert.equal(element._expires, '');
    });
  });

  describe('a11y', () => {
    /**
     * @return {Promise<CookieEditorElement>}
     */
    async function tabindexFixture() {
      return (fixture(html`<cookie-editor tabindex="0"></cookie-editor>`));
    }

    /**
     * @return {Promise<CookieEditorElement>}
     */
    async function roleFixture() {
      return (fixture(html`<cookie-editor role="main"></cookie-editor>`));
    }

    it('sets tabindex attribute', async () => {
      const simple = await basicFixture();
      assert.equal(simple.getAttribute('tabindex'), '-1');
    });

    it('respects existing tabindex attribute', async () => {
      const simple = await tabindexFixture();
      assert.equal(simple.getAttribute('tabindex'), '0');
    });

    it('sets role attribute', async () => {
      const simple = await basicFixture();
      assert.equal(simple.getAttribute('role'), 'dialog');
    });

    it('respects existing role attribute', async () => {
      const simple = await roleFixture();
      assert.equal(simple.getAttribute('role'), 'main');
    });
  });
});
