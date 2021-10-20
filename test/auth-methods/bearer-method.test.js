import { html, fixture, assert, oneEvent, nextFrame } from '@open-wc/testing';
import { METHOD_BEARER } from '../../index.js';
import '../../define/authorization-method.js';

/** @typedef {import('../../src/elements/authorization/AuthorizationMethodElement').default} AuthorizationMethod */
/** @typedef {import('@anypoint-web-components/awc').AnypointMaskedInputElement} AnypointMaskedInput */

describe('Bearer method', () => {
  const tokenSelector = 'anypoint-masked-input[name="token"]';

  const token = 'test-token';
  /**
   * @param {string=} tokenValue
   * @returns {Promise<AuthorizationMethod>}
   */
  async function basicFixture(tokenValue) {
    return (fixture(html`<authorization-method
      type="${METHOD_BEARER}"
      .token="${tokenValue}"
    ></authorization-method>`));
  }

  describe('DOM rendering', () => {
    let element = /** @type AuthorizationMethod */ (null);
    let form = /** @type HTMLFormElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
      form = element.shadowRoot.querySelector('form.bearer-auth');
    });

    it('has form in the DOM', async () => {
      assert.ok(form);
    });

    it('has form has autocomplete', async () => {
      assert.equal(form.getAttribute('autocomplete'), 'on');
    });

    it('form has token input', async () => {
      const input = form.querySelector(tokenSelector);
      assert.ok(input);
    });

    it('token has autoValidate', async () => {
      const input = /** @type AnypointMaskedInput */ (form.querySelector(tokenSelector));
      assert.isTrue(input.autoValidate);
    });

    it('token is required', async () => {
      const input = /** @type AnypointMaskedInput */ (form.querySelector(tokenSelector));
      assert.isTrue(input.required);
    });

    it('token has invalid label', async () => {
      const input = /** @type AnypointMaskedInput */ (form.querySelector(tokenSelector));
      assert.equal(input.invalidMessage, 'Token is required');
    });

    it('has no other inputs', () => {
      const controls = form.querySelectorAll('anypoint-input,anypoint-masked-input');
      assert.lengthOf(controls, 1);
    });
  });

  describe('Change notification', () => {
    let element = /** @type AuthorizationMethod */ (null);
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('notifies when token changes', async () => {
      const input =  /** @type AnypointMaskedInput */ (element.shadowRoot.querySelector(tokenSelector));
      setTimeout(() => {
        input.value = 'test';
        input.dispatchEvent(new CustomEvent('change'));
      });
      const e = await oneEvent(element, 'change');
      assert.ok(e);
    });
  });

  describe('Data serialization', () => {
    let element = /** @type AuthorizationMethod */ (null);
    beforeEach(async () => {
      element = await basicFixture(token);
    });

    it('serialization has token', () => {
      const result = element.serialize();
      assert.equal(result.token, token);
    });
  });

  describe('Data restoration', () => {
    let element = /** @type AuthorizationMethod */ (null);
    beforeEach(async () => {
      element = await basicFixture('initial-token');
    });

    it('serialization has token', () => {
      assert.notEqual(element.token, token);
      element.restore({
        token,
      });
      assert.equal(element.token, token);
    });
  });

  describe('validation', () => {
    let element = /** @type AuthorizationMethod */ (null);
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('is not valid without the token', () => {
      const result = element.validate();
      assert.isFalse(result);
    });

    it('is valid with the token', async () => {
      element.token = token;
      await nextFrame();
      const result = element.validate();
      assert.isTrue(result);
    });
  });

  describe('clear()', () => {
    let element = /** @type AuthorizationMethod */ (null);
    beforeEach(async () => {
      element = await basicFixture(token);
    });

    ['token']
    .forEach((prop) => {
      it(`clears ${prop}`, () => {
        element.clear();
        assert.strictEqual(element[prop], '');
      });
    });
  });
});
