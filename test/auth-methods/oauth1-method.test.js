import { html, fixture, assert, oneEvent, nextFrame } from '@open-wc/testing';
import { spy } from 'sinon';
import { validateInput } from './TestUtils.js';
import { METHOD_OAUTH1 } from '../../index.js';
import '../../define/authorization-method.js';
import {
  defaultSignatureMethods,
} from '../../src/elements/authorization/ui/OAuth1.js';
import { factory } from '../../src/elements/authorization/AuthorizationMethodElement.js';

/** @typedef {import('../../src/elements/authorization/AuthorizationMethodElement').default} AuthorizationMethod */
/** @typedef {import('@anypoint-web-components/awc').AnypointInputElement} AnypointInput */
/** @typedef {import('../../src/elements/authorization/ui/OAuth1').default} OAuth1 */

describe('OAuth 1 method', () => {
  const inputFields = [
    ['timestamp', 1574187333],
    ['nonce', 'QPpu5BF7L8txkzqRnZYRxjLdvIajLSZO'],
    ['consumerKey', 'key'],
    ['consumerSecret', 'secret'],
    ['token', 'oauth 1 token'],
    ['tokenSecret', 'oauth 1 token secret'],
    ['requestTokenUri', 'http://term.ie/oauth/example/request_token.php'],
    ['accessTokenUri', 'http://term.ie/oauth/example/access_token.php'],
    ['authorizationUri', 'http://term.ie/oauth/example/dialog.php'],
    ['redirectUri', 'https://auth.com/oauth-popup.html'],
    ['realm', 'test-realm'],
  ];
  const selectFields = [
    ['authTokenMethod', 'POST'],
    ['authParamsLocation', 'authorization'],
    ['signatureMethod', 'PLAINTEXT']
  ];

  function createParamsMap() {
    const props = {};
    inputFields.forEach(([n, v]) => {props[n] = v});
    selectFields.forEach(([n, v]) => {props[n] = v});
    return props;
  }

  /**
   * @param {any=} opts
   * @returns {Promise<AuthorizationMethod>}
   */
  async function basicFixture(opts={}) {
    const {
      consumerKey,
      consumerSecret,
      token,
      tokenSecret,
      requestTokenUri,
      accessTokenUri,
      authorizationUri,
      redirectUri,
      realm,
      signatureMethod,
      authTokenMethod,
      authParamsLocation,
      timestamp,
      nonce,
    } = opts;
    return (fixture(html`
    <authorization-method
      type="${METHOD_OAUTH1}"
      .consumerKey="${consumerKey}"
      .consumerSecret="${consumerSecret}"
      .token="${token}"
      .tokenSecret="${tokenSecret}"
      .requestTokenUri="${requestTokenUri}"
      .accessTokenUri="${accessTokenUri}"
      .authorizationUri="${authorizationUri}"
      .redirectUri="${redirectUri}"
      .realm="${realm}"
      .signatureMethod="${signatureMethod}"
      .authTokenMethod="${authTokenMethod}"
      .authParamsLocation="${authParamsLocation}"
      .timestamp="${timestamp}"
      .nonce="${nonce}"></authorization-method>`));
  }

  describe('DOM rendering', () => {
    let element = /** @type AuthorizationMethod */ (null);
    let form = /** @type HTMLFormElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
      form = element.shadowRoot.querySelector('form.oauth1-auth');
    });

    it('has form in the DOM', async () => {
      assert.ok(form);
    });

    it('has form has autocomplete', async () => {
      assert.equal(form.getAttribute('autocomplete'), 'on');
    });

    const requiredInputs = [true, true, true, false, false, false, false, false, false, false, false];
    inputFields.forEach(([name], index) => {
      it(`form has ${name} input (${index})`, async () => {
        const input = form.querySelector(`*[name="${name}"]`);
        validateInput(input, requiredInputs[index]);
      });
    });

    selectFields.forEach(([name]) => {
      it(`form has ${name} select`, async () => {
        const input = form.querySelector(`anypoint-dropdown-menu[name="${name}"]`);
        assert.ok(input);
      });
    });

    it('has no other inputs', () => {
      const controls = form.querySelectorAll('anypoint-input,anypoint-masked-input,anypoint-dropdown-menu');
      assert.lengthOf(controls, 14);
    });
  });

  describe('Data initialization', () => {
    let element = /** @type AuthorizationMethod */ (null);
    beforeEach(async () => {
      element = await basicFixture(createParamsMap());
    });

    inputFields.forEach(([name, value]) => {
      it(`input ${name} has value`, async () => {
        const input = /** @type AnypointInput */ (element.shadowRoot.querySelector(`*[name="${name}"]`));
        assert.equal(input.value, value);
      });
    });

    selectFields.forEach(([name, value]) => {
      it(`select ${name} has value`, async () => {
        const dropdown = element.shadowRoot.querySelector(`anypoint-dropdown-menu[name="${name}"]`);
        const input = dropdown.querySelector('anypoint-listbox');
        assert.equal(input.selected, value);
      });
    });
  });

  describe('Change notification', () => {
    let element = /** @type AuthorizationMethod */ (null);
    beforeEach(async () => {
      element = await basicFixture({
        authTokenMethod: 'GET',
        authParamsLocation: 'querystring',
        signatureMethod: 'RSA-SHA1'
      });
    });

    inputFields.forEach(([name, value]) => {
      it(`notifies when ${name} changes`, async () => {
        const input = /** @type AnypointInput */ (element.shadowRoot.querySelector(`*[name="${name}"]`));
        setTimeout(() => {
          input.value = value;
          input.dispatchEvent(new CustomEvent('change'));
        });
        const e = await oneEvent(element, 'change');
        assert.ok(e);
      });
    });

    selectFields.forEach(([name, value]) => {
      it(`notifies when ${name} changes`, async () => {
        const dropdown = element.shadowRoot.querySelector(`anypoint-dropdown-menu[name="${name}"]`);
        const input = dropdown.querySelector('anypoint-listbox');
        setTimeout(() => {
          input.selected = value;
        });
        const e = await oneEvent(element, 'change');
        assert.ok(e);
      });
    });

    it('does not notify when sets default', () => {
      const handler = spy();
      element.addEventListener('change', handler);
      const f = /** @type OAuth1 */ (element[factory]);
      f.defaults();
      assert.isFalse(handler.called);
    });

    it('notifies when generating the timestamp', () => {
      const input = element.shadowRoot.querySelector('anypoint-input[name="timestamp"]');
      const button = input.querySelector('anypoint-icon-button');
      const handler = spy();
      element.addEventListener('change', handler);
      button.click();
      assert.isTrue(handler.called);
    });

    it('notifies when generating the nonce', () => {
      const input = element.shadowRoot.querySelector('anypoint-input[name="nonce"]');
      const button = input.querySelector('anypoint-icon-button');
      const handler = spy();
      element.addEventListener('change', handler);
      button.click();
      assert.isTrue(handler.called);
    });
  });

  describe('Data serialization', () => {
    let element = /** @type AuthorizationMethod */ (null);
    beforeEach(async () => {
      element = await basicFixture(createParamsMap());
    });

    inputFields.concat(selectFields).forEach(([name, value]) => {
      it(`serialization has ${name}`, async () => {
        const result = element.serialize();
        assert.equal(result[name], value);
      });
    });
  });

  describe('Data restoration', () => {
    let element = /** @type AuthorizationMethod */ (null);
    let restoreMap;

    beforeEach(async () => {
      element = await basicFixture();
      restoreMap = createParamsMap();
    });

    inputFields.concat(selectFields).forEach(([name, value]) => {
      it(`restores ${name}`, () => {
        element.restore(restoreMap);
        assert.equal(element[name], value);
      });
    });
  });

  describe('Default values', () => {
    let element = /** @type AuthorizationMethod */ (null);
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('sets default signatureMethod', () => {
      assert.equal(element.signatureMethod, 'HMAC-SHA1');
    });

    it('sets default authTokenMethod', () => {
      assert.equal(element.authTokenMethod, 'POST');
    });

    it('sets authParamsLocation', () => {
      assert.equal(element.authParamsLocation, 'authorization');
    });

    it('sets signatureMethods', () => {
      assert.deepEqual(element.signatureMethods, defaultSignatureMethods);
    });

    it('generates timestamp', () => {
      assert.typeOf(element.timestamp, 'number');
    });

    it('generates nonce', () => {
      assert.typeOf(element.nonce, 'string');
    });
  });

  describe('authorization request', () => {
    let element = /** @type AuthorizationMethod */ (null);

    beforeEach(async () => {
      element = await basicFixture(createParamsMap());
    });

    function sendTokenResponse() {
      const e = new CustomEvent('oauth1-token-response', {
        bubbles: true,
        composed: true,
        cancelable: true,
        detail: {
          oauth_token: 'token-value',
          oauth_token_secret: 'token-secret-value'
        }
      });
      document.body.dispatchEvent(e);
    }

    inputFields.concat(selectFields).forEach(([name, value]) => {
      it(`authorization event has ${name} property`, async () => {
        const handler = spy();
        element.addEventListener('oauth1-token-requested', handler);
        element.authorize();
        const { detail } = handler.args[0][0];
        assert.equal(detail[name], value);
      });
    });

    it('calls authorize() from button click', () => {
      const button = /** @type HTMLElement */ (element.shadowRoot.querySelector('.auth-button'));
      const handler = spy();
      element.addEventListener('oauth1-token-requested', handler);
      button.click();
      assert.isTrue(handler.called);
    });

    it('sets #authorizing flag', () => {
      const button = /** @type HTMLElement */ (element.shadowRoot.querySelector('.auth-button'));
      button.click();
      assert.isTrue(element.authorizing);
    });

    it('ignores authorization when did not pass validation', async () => {
      element.consumerKey = '';
      await nextFrame();
      element.authorize();
      assert.isFalse(element.authorizing);
    });

    it('resets the #authorizing flag when token response', async () => {
      element.authorize();
      await nextFrame();
      sendTokenResponse();
      assert.isFalse(element.authorizing);
    });

    it('sets values from response event', async () => {
      element.authorize();
      await nextFrame();
      sendTokenResponse();
      assert.equal(element.token, 'token-value');
      assert.equal(element.tokenSecret, 'token-secret-value');
    });

    it('resets the #authorizing flag when token error', async () => {
      element.authorize();
      await nextFrame();
      const e = new CustomEvent('oauth1-error', {
        bubbles: true,
        composed: true,
        cancelable: true,
      });
      document.body.dispatchEvent(e);
      assert.isFalse(element.authorizing);
    });
  });

  describe('clear()', () => {
    let element = /** @type AuthorizationMethod */ (null);
    beforeEach(async () => {
      element = await basicFixture(createParamsMap());
    });

    [
      'consumerKey', 'consumerSecret', 'token', 'tokenSecret',
      'realm', 'requestTokenUri', 'accessTokenUri', 'authorizationUri'
    ]
    .forEach((prop) => {
      it(`clears ${prop}`, () => {
        element.clear();
        assert.strictEqual(element[prop], '');
      });
    });

    ['timestamp', 'nonce']
    .forEach((prop) => {
      it(`resets ${prop}`, () => {
        const orig = element[prop];
        element.clear();
        assert.notEqual(element[prop], orig);
      });
    });

    [
      ['signatureMethod', 'PLAINTEXT', 'HMAC-SHA1'],
      ['authTokenMethod', 'PUT', 'POST'],
      ['authParamsLocation', 'query', 'authorization'],
    ]
    .forEach(([prop, initialValue, testValue]) => {
      it(`resets ${prop}`, () => {
        element[prop] = initialValue;
        element.clear();
        assert.equal(element[prop], testValue);
      });
    });
  });
});
