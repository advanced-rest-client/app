import { html, fixture, assert, oneEvent, nextFrame } from '@open-wc/testing';
import { METHOD_BASIC } from '../../index.js';
import '../../define/authorization-method.js';

/** @typedef {import('../../src/elements/authorization/AuthorizationMethodElement').default} AuthorizationMethod */

describe('Basic method', () => {
  const usernameSelector = 'anypoint-input[name="username"]';
  const passwordSelector = 'anypoint-masked-input[name="password"]';

  const username = 'test-username';
  const password = 'test-password';

  /**
   * @param {string=} uname
   * @param {string=} passwd
   * @returns {Promise<AuthorizationMethod>}
   */
  async function basicFixture(uname, passwd) {
    return fixture(html`<authorization-method
      type="${METHOD_BASIC}"
      .username="${uname}"
      .password="${passwd}"
    ></authorization-method>`);
  }

  describe('DOM rendering', () => {
    let element = /** @type AuthorizationMethod */ (null);
    let form;
    beforeEach(async () => {
      element = await basicFixture();
      form = element.shadowRoot.querySelector('form.basic-auth');
    });

    it('has form in the DOM', async () => {
      assert.ok(form);
    });

    it('has form has autocomplete', async () => {
      assert.equal(form.getAttribute('autocomplete'), 'on');
    });

    it('form has username input', async () => {
      const input = form.querySelector(usernameSelector);
      assert.ok(input);
    });

    it('username has autoValidate', async () => {
      const input = form.querySelector(usernameSelector);
      assert.isTrue(input.autoValidate);
    });

    it('username is required', async () => {
      const input = form.querySelector(usernameSelector);
      assert.isTrue(input.required);
    });

    it('username has invalid label', async () => {
      const input = form.querySelector(usernameSelector);
      assert.equal(input.invalidMessage, 'Username is required');
    });

    it('form has password input', async () => {
      const input = form.querySelector(passwordSelector);
      assert.ok(input);
    });

    it('has no other inputs', () => {
      const controls = form.querySelectorAll(
        'anypoint-input,anypoint-masked-input'
      );
      assert.lengthOf(controls, 2);
    });
  });

  describe('Change notification', () => {
    let element = /** @type AuthorizationMethod */ (null);
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('notifies when username changes', async () => {
      const input = /** @type HTMLInputElement */ (element.shadowRoot.querySelector(usernameSelector));
      setTimeout(() => {
        input.value = 'test';
        input.dispatchEvent(new Event('change'));
      });
      const e = await oneEvent(element, 'change');
      assert.ok(e);
    });

    it('notifies when password changes', async () => {
      const input = /** @type HTMLInputElement */ (element.shadowRoot.querySelector(passwordSelector));
      setTimeout(() => {
        input.value = 'test-password';
        input.dispatchEvent(new Event('change'));
      });
      const e = await oneEvent(element, 'change');
      assert.ok(e);
    });
  });

  describe('Data serialization', () => {
    let element = /** @type AuthorizationMethod */ (null);
    beforeEach(async () => {
      element = await basicFixture(username, password);
    });

    it('serialization has username', () => {
      const result = element.serialize();
      assert.equal(result.username, username);
    });

    it('serialization has password', () => {
      const result = element.serialize();
      assert.equal(result.password, password);
    });

    it('serialization default username', async () => {
      element.username = undefined;
      await nextFrame();
      const result = element.serialize();
      assert.equal(result.username, '');
    });

    it('serialization default password', async () => {
      element.password = undefined;
      await nextFrame();
      const result = element.serialize();
      assert.equal(result.password, '');
    });
  });

  describe('Data restoration', () => {
    let element = /** @type AuthorizationMethod */ (null);
    beforeEach(async () => {
      element = await basicFixture('initial-username', 'initial-password');
    });

    it('serialization has username', () => {
      assert.notEqual(element.username, username);
      element.restore({
        username,
        password,
      });
      assert.equal(element.username, username);
    });

    it('serialization has password', () => {
      assert.notEqual(element.password, password);
      element.restore({
        username,
        password,
      });
      assert.equal(element.password, password);
    });
  });

  describe('validation', () => {
    let element = /** @type AuthorizationMethod */ (null);
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('is not valid without the username', () => {
      const result = element.validate();
      assert.isFalse(result);
    });

    it('is valid with the username', async () => {
      element.username = 'test-username';
      await nextFrame();
      const result = element.validate();
      assert.isTrue(result);
    });
  });

  describe('clear()', () => {
    let element = /** @type AuthorizationMethod */ (null);
    beforeEach(async () => {
      element = await basicFixture(username, password);
    });

    ['username', 'password'].forEach((prop) => {
      it(`clears ${prop}`, () => {
        element.clear();
        assert.strictEqual(element[prop], '');
      });
    });
  });
});
