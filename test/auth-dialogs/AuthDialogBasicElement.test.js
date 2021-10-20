import { fixture, assert, html } from '@open-wc/testing';
import '../../define/auth-dialog-basic.js';

/** @typedef {import('../../index').AuthDialogBasicElement} AuthDialogBasicElement */

describe('AuthDialogBasicElement', () => {
  let element = /** @type AuthDialogBasicElement */ (null);
  const username = 'test';
  const password = 'test';
  const hash = 'dGVzdDp0ZXN0';

  /**
   * @returns {Promise<AuthDialogBasicElement>}
   */
  async function basicFixture() {
    return fixture(html`<auth-dialog-basic opened .username="${username}" password="${password}"></auth-dialog-basic>`);
  }

  beforeEach(async () => {
    element = await basicFixture();
  });

  it('updates username local property when input change', () => {
    const input = /** @type HTMLInputElement */ (element.shadowRoot.querySelector('[name="username"]'))
    input.value = 'updated';
    input.dispatchEvent(new CustomEvent('change'));
    assert.equal(element.username, 'updated');
  });

  it('updates password local property when input change', () => {
    const input = /** @type HTMLInputElement */ (element.shadowRoot.querySelector('[name="password"]'))
    input.value = 'updated';
    input.dispatchEvent(new CustomEvent('change'));
    assert.equal(element.password, 'updated');
  });

  it('serializes local values', () => {
    const result = element.serialize();
    assert.equal(result.username, username, 'username is set');
    assert.equal(result.password, password, 'password is set');
  });

  it('serializes the "hash" property', () => {
    const result = element.serialize();
    assert.equal(result.hash, hash);
  });
});
