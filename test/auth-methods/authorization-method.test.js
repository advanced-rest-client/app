import { html, fixture, assert, nextFrame } from '@open-wc/testing';
import '../../define/authorization-method.js';

/** @typedef {import('../../src/elements/authorization/AuthorizationMethodElement').default} AuthorizationMethod */

describe('AuthorizationMethod', () => {
  /**
   * @param {string=} type
   * @returns {Promise<AuthorizationMethod>}
   */
  async function basicFixture(type) {
    return (fixture(html`<authorization-method .type="${type}"></authorization-method>`));
  }

  describe('Switching type', () => {
    it('renders no form', async () => {
      const element = await basicFixture();
      const form = element.shadowRoot.querySelector('form');
      assert.notOk(form);
    });

    it('renders basic auth form controls', async () => {
      const element = await basicFixture('basic');
      const form = element.shadowRoot.querySelector('form');
      assert.ok(form, 'has form element');
      const controls = form.querySelectorAll('anypoint-input,anypoint-masked-input');
      assert.lengthOf(controls, 2);
    });

    it('switches to basic from no method', async () => {
      const element = await basicFixture();
      element.type = 'Basic';
      await nextFrame();
      const form = element.shadowRoot.querySelector('form');
      assert.ok(form, 'has form element');
      const controls = form.querySelectorAll('anypoint-input,anypoint-masked-input');
      assert.lengthOf(controls, 2);
    });

    it('renders ntlm auth form controls', async () => {
      const element = await basicFixture('ntlm');
      const form = element.shadowRoot.querySelector('form');
      assert.ok(form, 'has form element');
      const controls = form.querySelectorAll('anypoint-input,anypoint-masked-input');
      assert.lengthOf(controls, 3);
    });

    it('switches to NTLM from no method', async () => {
      const element = await basicFixture();
      element.type = 'NTLM';
      await nextFrame();
      const form = element.shadowRoot.querySelector('form');
      assert.ok(form, 'has form element');
      const controls = form.querySelectorAll('anypoint-input,anypoint-masked-input');
      assert.lengthOf(controls, 3);
    });

    it('keeps username/password from basic method for NTLM', async () => {
      const element = await basicFixture('basic');
      element.username = 'u-test';
      element.password = 'p-test';
      await nextFrame();
      element.type = 'NTLM';
      await nextFrame();
      const form = element.shadowRoot.querySelector('form');
      assert.ok(form, 'has form element');
      const controls = /** @type NodeListOf<HTMLInputElement> */ (form.querySelectorAll('anypoint-input,anypoint-masked-input'));
      assert.equal(controls[0].value, 'u-test', 'username is set');
      assert.equal(controls[1].value, 'p-test', 'password is set');
      // currently it returns undefined but it should empty string.
      assert.notOk(controls[2].value, 'domain is not set');
    });

    it('renders digest auth form controls', async () => {
      const element = await basicFixture('digest');
      const form = element.shadowRoot.querySelector('form');
      assert.ok(form, 'has form element');
      const controls = form.querySelectorAll('anypoint-input,anypoint-masked-input,anypoint-dropdown-menu');
      assert.lengthOf(controls, 9);
    });

    it('keeps username/password from basic method for digest', async () => {
      const element = await basicFixture('basic');
      element.username = 'u-test';
      element.password = 'p-test';
      await nextFrame();
      element.type = 'Digest';
      await nextFrame();
      const form = element.shadowRoot.querySelector('form');
      assert.ok(form, 'has form element');
      const controls = /** @type NodeListOf<HTMLInputElement> */ (form.querySelectorAll('anypoint-input,anypoint-masked-input'));
      assert.equal(controls[0].value, 'u-test', 'username is set');
      assert.equal(controls[1].value, 'p-test', 'password is set');
    });

    it('renders OAuth1 auth form controls', async () => {
      const element = await basicFixture('oauth 1');
      const form = element.shadowRoot.querySelector('form');
      assert.ok(form, 'has form element');
      const controls = form.querySelectorAll('anypoint-input,anypoint-masked-input,anypoint-dropdown-menu');
      assert.lengthOf(controls, 14);
    });

    it('renders OAuth2 auth form controls', async () => {
      const element = await basicFixture('oauth 2');
      const form = element.shadowRoot.querySelector('form');
      assert.ok(form, 'has form element');
      const controls = form.querySelectorAll('anypoint-input,anypoint-masked-input,anypoint-dropdown-menu');
      // without grant type it is only grant selector
      assert.lengthOf(controls, 2);
      const selector = form.querySelector('oauth2-scope-selector');
      assert.ok(selector, 'has oauth2-scope-selector');
    });
  });

  describe('onchange', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture('basic');
    });

    function makeChange(elm) {
      const input = elm.shadowRoot.querySelector('anypoint-input[name="username"]');
      input.value = 'test';
      input.dispatchEvent(new CustomEvent('change'));
    }

    it('Getter returns previously registered handler', () => {
      assert.isUndefined(element.onchange);
      const f = () => {};
      element.onchange = f;
      assert.isTrue(element.onchange === f);
    });

    it('Calls registered function', () => {
      let called = false;
      const f = () => {
        called = true;
      };
      element.onchange = f;
      makeChange(element);
      element.onchange = null;
      assert.isTrue(called);
    });

    it('Unregisters old function', () => {
      let called1 = false;
      let called2 = false;
      const f1 = () => {
        called1 = true;
      };
      const f2 = () => {
        called2 = true;
      };
      element.onchange = f1;
      element.onchange = f2;
      makeChange(element);
      element.onchange = null;
      assert.isFalse(called1);
      assert.isTrue(called2);
    });
  });
});
