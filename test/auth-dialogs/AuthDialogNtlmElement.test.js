import { fixture, assert, html } from '@open-wc/testing';
import '../../define/auth-dialog-ntlm.js';

/** @typedef {import('../../index').AuthDialogNtlmElement} AuthDialogNtlmElement */

describe('AuthDialogNtlmElement', () => {
  let element = /** @type AuthDialogNtlmElement */ (null);
  const username = 'test';
  const password = 'test';
  const domain = 'mulesoft.com';

  /**
   * @returns {Promise<AuthDialogNtlmElement>}
   */
  async function basicFixture() {
    return fixture(html`<auth-dialog-ntlm opened .username="${username}" password="${password}" .domain="${domain}"></auth-dialog-ntlm>`);
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

  it('updates domain local property when input change', () => {
    const input = /** @type HTMLInputElement */ (element.shadowRoot.querySelector('[name="domain"]'))
    input.value = 'updated';
    input.dispatchEvent(new CustomEvent('change'));
    assert.equal(element.domain, 'updated');
  });

  it('serializes local values', () => {
    const result = element.serialize();
    assert.equal(result.username, username, 'username is set');
    assert.equal(result.password, password, 'password is set');
    assert.equal(result.domain, domain, 'domain is set');
  });
});
