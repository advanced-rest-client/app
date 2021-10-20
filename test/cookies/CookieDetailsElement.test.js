import { fixture, assert, html } from '@open-wc/testing';
import sinon from 'sinon';
import { ArcMock } from '@advanced-rest-client/arc-mock';
import '../../define/cookie-details.js';
import { SessionCookieEventTypes } from '@advanced-rest-client/events';

/** @typedef {import('@advanced-rest-client/events').Cookies.ARCCookie} ARCCookie */

describe('CookieDetailsElement', () => {
  async function basicFixture(cookie) {
    return (fixture(html`
      <cookie-details
      .cookie="${cookie}"></cookie-details>`));
  }

  const generator = new ArcMock();

  /** @type ARCCookie */
  let cookie;
  before(() => {
    cookie = generator.cookies.cookie();
    cookie.httpOnly = true;
    cookie.secure = true;
    cookie.session = true;
  });

  it('dispatches delete event', async () => {
    const element = await basicFixture(cookie);
    const spy = sinon.spy();
    element.addEventListener(SessionCookieEventTypes.delete, spy);
    const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('[data-action="delete-action"]'));
    node.click();
    assert.isTrue(spy.called);
  });

  it('dispatches edit event', async () =>  {
    const element = await basicFixture(cookie);
    const spy = sinon.spy();
    element.addEventListener('edit', spy);
    const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('[data-action="edit-action"]'));
    node.click();
    assert.isTrue(spy.called);
  });

  it('can be initialized without a cookie', async () =>  {
    await basicFixture();
  });
});
