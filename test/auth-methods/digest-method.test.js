/* eslint-disable no-shadow */
import { html, fixture, assert, oneEvent, nextFrame } from '@open-wc/testing';
import { validateInput } from './TestUtils.js';
import { METHOD_DIGEST } from '../../index.js';
import '../../define/authorization-method.js';
import { factory } from '../../src/elements/authorization/AuthorizationMethodElement.js';

/** @typedef {import('../../src/elements/authorization/AuthorizationMethodElement').default} AuthorizationMethod */
/** @typedef {import('../../src/elements/authorization/ui/Digest').default} Digest */
/** @typedef {import('@anypoint-web-components/awc').AnypointInputElement} AnypointInput */

describe('Digest method', () => {
  const usernameSelector = 'anypoint-input[name="username"]';
  const passwordSelector = 'anypoint-masked-input[name="password"]';
  const realmSelector = 'anypoint-input[name="realm"]';
  const nonceSelector = 'anypoint-input[name="nonce"]';
  const ncSelector = 'anypoint-input[name="nc"]';
  const opaqueSelector = 'anypoint-input[name="opaque"]';
  const cnonceSelector = 'anypoint-input[name="cnonce"]';
  const qopSelector = 'anypoint-dropdown-menu[name="qop"]';
  const algorithmSelector = 'anypoint-dropdown-menu[name="algorithm"]';

  const username = 'test-username';
  const password = 'test-password';
  const requestUrl = 'https://api.domain.com/path/to/resource?parm=value';
  const httpMethod = 'GET';
  const realm = 'realm@domain.com';
  const nonce = '1234abcd';
  const cnonce = '19ed03580cf7125';
  const opaque = 'test-opaque';
  const qop = 'auth-int';
  const algorithm = 'MD5-sess';
  const nc = 12;

  /**
   * @param {any=} opts
   * @returns {Promise<AuthorizationMethod>}
   */
  async function basicFixture(opts={}) {
    const {
      username,
      password,
      requestUrl,
      httpMethod,
      realm,
      nonce,
      cnonce,
      qop,
      nc,
      opaque,
      algorithm,
    } = opts;
    return (fixture(html`<authorization-method
      type="${METHOD_DIGEST}"
      .username="${username}"
      .password="${password}"
      .requestUrl="${requestUrl}"
      .httpMethod="${httpMethod}"
      .realm="${realm}"
      .nonce="${nonce}"
      .cnonce="${cnonce}"
      .qop="${qop}"
      .nc="${nc}"
      .opaque="${opaque}"
      .algorithm="${algorithm}"
    ></authorization-method>`));
  }

  describe('DOM rendering', () => {
    let element = /** @type AuthorizationMethod */ (null);
    let form = /** @type HTMLFormElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
      form = element.shadowRoot.querySelector('form.digest-auth');
    });

    it('has form in the DOM', async () => {
      assert.ok(form);
    });

    it('has form has autocomplete', async () => {
      assert.equal(form.getAttribute('autocomplete'), 'on');
    });

    it('form has username input', async () => {
      const input = form.querySelector(usernameSelector);
      validateInput(input, true);
    });

    it('form has password input', async () => {
      const input = form.querySelector(passwordSelector);
      validateInput(input, false);
    });

    it('form has realm input', async () => {
      const input = form.querySelector(realmSelector);
      validateInput(input, true);
    });

    it('form has nonce input', async () => {
      const input = form.querySelector(nonceSelector);
      validateInput(input, true);
    });

    it('form has nc input', async () => {
      const input = form.querySelector(ncSelector);
      validateInput(input, true);
    });

    it('nc input is type number', async () => {
      const input = /** @type AnypointInput */ (form.querySelector(ncSelector));
      assert.equal(input.type, 'number');
    });

    it('form has opaque input', async () => {
      const input = form.querySelector(opaqueSelector);
      validateInput(input, true);
    });

    it('form has cnonce input', async () => {
      const input = form.querySelector(cnonceSelector);
      validateInput(input, true);
    });

    it('form has qop dropdown input', async () => {
      const input = form.querySelector(qopSelector);
      validateInput(input, false);
    });

    it('form has algorithm dropdown input', async () => {
      const input = form.querySelector(algorithmSelector);
      validateInput(input, false);
    });

    it('has no other inputs', () => {
      const controls = form.querySelectorAll('anypoint-input,anypoint-masked-input,anypoint-dropdown-menu');
      assert.lengthOf(controls, 9);
    });
  });

  describe('Data initialization', () => {
    let element = /** @type AuthorizationMethod */ (null);
    beforeEach(async () => {
      element = await basicFixture({
        username,
        password,
        requestUrl,
        httpMethod,
        realm,
        nonce,
        cnonce,
        qop,
        nc,
        opaque,
        algorithm,
      });
    });

    [
      ['username', username],
      ['password', password],
      ['realm', realm],
      ['nonce', nonce],
      ['opaque', opaque],
      ['cnonce', cnonce],
      ['nc', nc],
      ['qop', qop],
      ['algorithm', algorithm],
    ].forEach(([name, value]) => {
      it(`input ${name} has value`, async () => {
        const input = /** @type AnypointInput */ (element.shadowRoot.querySelector(`*[name="${name}"]`));
        assert.equal(input.value, value);
      });
    });
  });

  describe('Change notification', () => {
    let element = /** @type AuthorizationMethod */ (null);
    beforeEach(async () => {
      element = await basicFixture();
    });

    [
      'username',
      'password',
      'realm',
      'nonce',
      'opaque',
      'cnonce',
    ].forEach((name) => {
      it(`notifies when ${name} changes`, async () => {
        const input = /** @type AnypointInput */ (element.shadowRoot.querySelector(`*[name="${name}"]`));
        setTimeout(() => {
          input.value = `test-${name}`;
          input.dispatchEvent(new CustomEvent('change'));
        });
        const e = await oneEvent(element, 'change');
        assert.ok(e);
      });
    });

    it('notifies when nc changes', async () => {
      const input = /** @type AnypointInput */ (element.shadowRoot.querySelector(ncSelector));
      setTimeout(() => {
        input.value = 123;
        input.dispatchEvent(new CustomEvent('change'));
      });
      const e = await oneEvent(element, 'change');
      assert.ok(e);
    });

    it('notifies when algorithm changes', async () => {
      const dropdown = element.shadowRoot.querySelector(algorithmSelector);
      const input = dropdown.querySelector('anypoint-listbox');
      setTimeout(() => {
        input.selected = 'MD5-sess';
      });
      const e = await oneEvent(element, 'change');
      assert.ok(e);
    });

    it('notifies when qop changes', async () => {
      const dropdown = element.shadowRoot.querySelector(qopSelector);
      const input = dropdown.querySelector('anypoint-listbox');
      setTimeout(() => {
        input.selected = 'auth-init';
      });
      const e = await oneEvent(element, 'change');
      assert.ok(e);
    });
  });

  describe('Data serialization', () => {
    let element = /** @type AuthorizationMethod */ (null);
    beforeEach(async () => {
      element = await basicFixture({
        username,
        password,
        requestUrl,
        httpMethod,
        realm,
        nonce,
        cnonce,
        qop,
        nc,
        opaque,
        algorithm,
      });
    });

    [
      ['username', username],
      ['password', password],
      ['realm', realm],
      ['nonce', nonce],
      ['opaque', opaque],
      ['qop', qop],
      ['nc', '00000012'],
      ['cnonce', cnonce],
      ['algorithm', algorithm],
    ].forEach(([name, value]) => {
      it(`serialization has ${name}`, async () => {
        const result = element.serialize();
        assert.equal(result[name], value);
      });
    });

    it('serialization has response', () => {
      const result = element.serialize();
      assert.typeOf(result.response, 'string');
    });

    it('serialization has uri', () => {
      const result = element.serialize();
      assert.equal(result.uri, '/path/to/resource');
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
    let restoreMap;
    beforeEach(async () => {
      element = await basicFixture({
        username: 'initial-username',
        password: 'initial-password',
        requestUrl: 'initial-url',
        httpMethod: 'initial-method',
        realm: 'initial-realm',
        nonce: 'initial-nonce',
        cnonce: 'initial-cnonce',
        qop: 'initial-qop',
        nc: 112,
        opaque: 'initial-opaque',
        algorithm: 'initial-alg',
      });
      restoreMap = {
        username,
        password,
        requestUrl,
        httpMethod,
        realm,
        nonce,
        cnonce,
        qop,
        nc: '000000001121',
        opaque,
        algorithm,
      };
    });

    [
      ['username', username],
      ['password', password],
      ['realm', realm],
      ['nonce', nonce],
      ['opaque', opaque],
      ['qop', qop],
      ['cnonce', cnonce],
      ['algorithm', algorithm],
    ].forEach(([name, value]) => {
      it(`restores ${name}`, () => {
        element.restore(restoreMap);
        assert.equal(element[name], value);
      });
    });

    it('restores nc', () => {
      assert.notEqual(element.nc, nc, 'initial value is different');
      element.restore(restoreMap);
      assert.equal(element.nc, 1121);
    });

    it('ignores nc when in the map', () => {
      delete restoreMap.nc;
      element.restore(restoreMap);
      assert.equal(element.nc, 112);
    });

    it('restores uri/_requestUri', () => {
      restoreMap.uri = 'https://other.com/path';
      element.restore(restoreMap);
      const f = /** @type Digest */ (element[factory]);
      assert.equal(f._requestUri, restoreMap.uri);
    });
  });

  describe('Default values', () => {
    let element = /** @type AuthorizationMethod */ (null);
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('sets default nc', () => {
      assert.equal(element.nc, 1);
    });

    it('sets default algorithm', () => {
      assert.equal(element.algorithm, 'MD5');
    });

    it('generates cnonce', () => {
      assert.typeOf(element.cnonce, 'string');
      assert.ok(element.cnonce);
    });
  });

  describe('request URL setter', () => {
    let element = /** @type AuthorizationMethod */ (null);
    beforeEach(async () => {
      element = await basicFixture({
        requestUrl
      });
    });

    it('returns set requestUrl via setter', () => {
      assert.equal(element.requestUrl, requestUrl);
    });

    it('clears requestUrl when setting empty value', () => {
      element.requestUrl = undefined;
      assert.isUndefined(element.requestUrl);
    });
  });

  describe('response generation', () => {
    let element = /** @type AuthorizationMethod */ (null);
    beforeEach(async () => {
      element = await basicFixture({
        username,
        password,
        requestUrl,
        httpMethod,
        realm,
        nonce,
        cnonce,
        nc,
        opaque,
        algorithm,
      });
    });

    it('generates response without qop', () => {
      const result = element.serialize();
      assert.equal(result.response, 'dcef90af84c62601cd22e25cb81f7d81');
    });

    it('generates response with qop = auth-int', async () => {
      element.qop = 'auth-int';
      await nextFrame();
      const result = element.serialize();
      assert.equal(result.response, '041c8669c69b6f4821359ff1d965e0e5');
    });

    it('generates response with qop = auth', async () => {
      element.qop = 'auth';
      await nextFrame();
      const result = element.serialize();
      assert.equal(result.response, '455fa93bcf1163f0f0e3cc4b3eeb183f');
    });

    it('generates response with algorithm MD5-sess', async () => {
      element.algorithm = 'MD5-sess';
      await nextFrame();
      const result = element.serialize();
      assert.equal(result.response, 'dcef90af84c62601cd22e25cb81f7d81');
    });

    it('generates response with algorithm MD5', async () => {
      element.algorithm = 'MD5';
      await nextFrame();
      const result = element.serialize();
      assert.equal(result.response, '053c0c987d162c62d7a57395c20c0f3b');
    });
  });

  describe('validation', () => {
    let element = /** @type AuthorizationMethod */ (null);
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('is not valid without required parameters', () => {
      const result = element.validate();
      assert.isFalse(result);
    });

    it('is valid with the username', async () => {
      element.username = 'test-username';
      element.realm = 'realm';
      element.nonce = 'nonce';
      element.nc = 1121;
      element.opaque = 'opaque';
      element.cnonce = 'cnonce';
      await nextFrame();
      const result = element.validate();
      assert.isTrue(result);
    });
  });

  describe('clear()', () => {
    let element = /** @type AuthorizationMethod */ (null);
    beforeEach(async () => {
      element = await basicFixture({
        username,
        password,
        requestUrl,
        httpMethod,
        realm,
        nonce,
        cnonce,
        qop,
        nc,
        opaque,
        algorithm,
      });
    });

    ['username', 'password', 'realm', 'nonce', 'qop', 'opaque']
    .forEach((prop) => {
      it(`clears ${prop}`, () => {
        element.clear();
        assert.strictEqual(element[prop], '');
      });
    });

    ['cnonce', 'nc']
    .forEach((prop) => {
      it(`resets ${prop}`, () => {
        const orig = element[prop];
        element.clear();
        assert.notEqual(element[prop], orig);
      });
    });

    it('resets algorithm', () => {
      element.algorithm = 'MD5-sess';
      element.clear();
      assert.strictEqual(element.algorithm, 'MD5');
    });
  });
});
