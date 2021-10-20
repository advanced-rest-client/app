/* eslint-disable no-shadow */
import { html, fixture, assert, oneEvent, nextFrame, aTimeout } from '@open-wc/testing';
import { spy } from 'sinon';
import { AuthorizationEventTypes } from '@advanced-rest-client/events';
import { METHOD_OAUTH2 } from '../../index.js';
import '../../define/authorization-method.js';
import {
  oauth2GrantTypes,
} from '../../src/elements/authorization/ui/OAuth2.js';
import { factory } from '../../src/elements/authorization/AuthorizationMethodElement.js';

/** @typedef {import('../../src/elements/authorization/ui/OAuth2').default} OAuth2 */
/** @typedef {import('../../src/elements/authorization/AuthorizationMethodElement').default} AuthorizationMethod */
/** @typedef {import('@anypoint-web-components/awc').AnypointInputElement} AnypointInput */

describe('OAuth 2, JWT method', () => {
  const redirectUri = 'https://redirect.com/';
  const grantType = 'urn:ietf:params:oauth:grant-type:jwt-bearer';
  const inputFields = [
    ['accessTokenUri', 'https://oauth2.googleapis.com/token'],
    ['scopes', ['openid', 'email', 'profile']],
    ['assertion', 'test-jwt']
  ];

  /**
   * @returns {any}
   */
  function createParamsMap() {
    const props = {
      redirectUri,
      grantType,
    };
    inputFields.forEach(([n, v]) => {props[n] = v});
    return props;
  }

  /**
   * @param {any=} opts
   * @returns {Promise<AuthorizationMethod>}
   */
  async function basicFixture(opts={}) {
    const {
      accessTokenUri,
      redirectUri,
      scopes,
      assertion,
    } = opts;
    return (fixture(html`<authorization-method
      type="${METHOD_OAUTH2}"
      grantType="${grantType}"
      accessTokenUri="${accessTokenUri}"
      redirectUri="${redirectUri}"
      .scopes="${scopes}"
      assertion="${assertion}"
      advanced></authorization-method>`));
  }

  /**
   * @param {string=} baseUri
   * @param {any=} opts
   * @returns {Promise<AuthorizationMethod>}
   */
  async function baseUriFixture(baseUri, {
    accessTokenUri = undefined,
    scopes = undefined,
    assertion,
  } = {}) {
    return (fixture(html`<authorization-method
      type="${METHOD_OAUTH2}"
      grantType="${grantType}"
      accessTokenUri="${accessTokenUri}"
      assertion="${assertion}"
      redirectUri="/redirect"
      .scopes="${scopes}"
      baseUri="${baseUri}"
    ></authorization-method>`));
  }

  describe('DOM rendering', () => {
    let element = /** @type AuthorizationMethod */ (null);
    let form = /** @type HTMLFormElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
      form = element.shadowRoot.querySelector('form.oauth2-auth');
    });

    it('has form in the DOM', async () => {
      assert.ok(form);
    });

    inputFields.forEach(([name]) => {
      it(`form has ${name} input`, async () => {
        const input = form.querySelector(`*[name="${name}"]`);
        assert.ok(input);
      });
    });

    it('does not render redirect URI filed', async () => {
      const node = element.shadowRoot.querySelector('.redirect-section');
      assert.notOk(node);
    });

    it('does not render token section when no token information', () => {
      const node = element.shadowRoot.querySelector('.current-token');
      assert.notOk(node);
    });

    it('renders token section when token information is set', async () => {
      element.accessToken = 'test-token';
      await nextFrame();
      const node = element.shadowRoot.querySelector('.current-token');
      assert.ok(node);
      const label = node.querySelector('.code');
      assert.equal(label.textContent.trim(), 'test-token');
    });

    it('renders the advanced switch', async () => {
      const element = await basicFixture();
      const node = element.shadowRoot.querySelector('.adv-toggle');
      assert.ok(node);
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
  });

  describe('Change notification', () => {
    let element = /** @type AuthorizationMethod */ (null);
    beforeEach(async () => {
      element = await basicFixture({});
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

    it('does not notify when sets default values', () => {
      const handler = spy();
      element.addEventListener('change', handler);
      const f = /** @type OAuth2 */ (element[factory]);
      f.defaults();
      assert.isFalse(handler.called);
    });

    it('notifies when changing scopes', async () => {
      const node = element.shadowRoot.querySelector('oauth2-scope-selector');
      setTimeout(() => {
        node.value = ['test'];
        node.dispatchEvent(new CustomEvent('change'));
      });
      const e = await oneEvent(element, 'change');
      assert.ok(e);
    });
  });

  describe('Data serialization', () => {
    let element = /** @type AuthorizationMethod */ (null);
    beforeEach(async () => {
      element = await basicFixture(createParamsMap());
    });

    inputFields.forEach(([name, value]) => {
      it(`serialization has ${name}`, async () => {
        const result = element.serialize();
        // @ts-ignore
        assert.equal(result[name], value);
      });
    });

    it('deletes the client id', async () => {
      element.clientId = 'test';
      await nextFrame();
      const result = element.serialize();
      assert.isUndefined(result.clientId);
    });
  });

  describe('Data restoration', () => {
    let element = /** @type AuthorizationMethod */ (null);
    let restoreMap;

    beforeEach(async () => {
      element = await basicFixture();
      restoreMap = createParamsMap();
    });

    inputFields.forEach(([name, value]) => {
      it(`restores ${name}`, () => {
        element.restore(restoreMap);
        // @ts-ignore
        assert.equal(element[name], value);
      });
    });
  });

  describe('Default values', () => {
    let element = /** @type AuthorizationMethod */ (null);
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('sets default oauthDeliveryName', () => {
      assert.equal(element.oauthDeliveryName, 'authorization');
    });

    it('sets default oauthDeliveryMethod', () => {
      assert.equal(element.oauthDeliveryMethod, 'header');
    });

    it('sets grantType', () => {
      assert.deepEqual(element.grantTypes, oauth2GrantTypes);
    });

    it('sets tokenType', () => {
      assert.equal(element.tokenType, 'Bearer');
    });
  });

  describe('authorization request', () => {
    let element = /** @type AuthorizationMethod */ (null);

    beforeEach(async () => {
      element = await basicFixture(createParamsMap());
    });

    /**
     * @param {string=} state
     * @param {string=} tokenType
     * @param {CustomEvent=} e
     */
    async function sendResponse(state, tokenType, e) {
      await aTimeout(1);
      return {
        accessToken: 'test-token',
        tokenType,
        // @ts-ignore
        state: state || e.detail.state,
      }
    }

    /**
     * @param {string=} state
     * @param {string=} tokenType
     */
    function mockTokenRequest(state, tokenType) {
      window.addEventListener(AuthorizationEventTypes.OAuth2.authorize, function f(e) {
        window.removeEventListener(AuthorizationEventTypes.OAuth2.authorize, f);
        e.preventDefault();
        // @ts-ignore
        e.detail.result = sendResponse(state, tokenType, e);
      });
    }

    /**
     * @param {string=} message
     */
    function mockTokenErrorRequest(message) {
      window.addEventListener(AuthorizationEventTypes.OAuth2.authorize, function f(e) {
        window.removeEventListener(AuthorizationEventTypes.OAuth2.authorize, f);
        e.preventDefault();
        // @ts-ignore
        e.detail.result = Promise.reject(new Error(message));
      });
    }

    inputFields.forEach(([name, value]) => {
      it(`authorization event has ${name} property`, async () => {
        const handler = spy();
        element.addEventListener(AuthorizationEventTypes.OAuth2.authorize, handler);
        element.authorize();
        const { detail } = handler.args[0][0];
        // @ts-ignore
        assert.equal(detail[name], value);
      });
    });

    it('calls authorize() from button click', () => {
      const button = /** @type HTMLElement */ (element.shadowRoot.querySelector('.auth-button'));
      const handler = spy();
      element.addEventListener(AuthorizationEventTypes.OAuth2.authorize, handler);
      button.click();
      assert.isTrue(handler.called);
    });

    it('sets the #authorizing flag', async () => {
      mockTokenRequest();
      const button = /** @type HTMLElement */ (element.shadowRoot.querySelector('.auth-button'));
      button.click();
      assert.isTrue(element.authorizing);
    });

    it('ignores authorization when did not pass validation', async () => {
      element.assertion = '';
      await nextFrame();
      element.authorize();
      assert.isFalse(element.authorizing);
    });

    it('resets the #authorizing flag when token response', async () => {
      mockTokenRequest();
      element.authorize();
      await aTimeout(2);
      await nextFrame();
      assert.isFalse(element.authorizing);
    });

    it('sets state on the event', async () => {
      const handler = spy();
      element.addEventListener(AuthorizationEventTypes.OAuth2.authorize, handler);
      element.authorize();
      const { detail } = handler.args[0][0];
      const eventState = detail.state;
      assert.typeOf(eventState, 'string', 'event state is set');
    });

    it('sets values from the response event with state', async () => {
      mockTokenRequest(undefined, 'other');
      element.authorize();
      await aTimeout(2);
      await nextFrame();
      assert.equal(element.accessToken, 'test-token');
      assert.equal(element.tokenType, 'other');
    });

    it('sets "lastErrorMessage" with event message', async () => {
      const message = 'Test error';
      mockTokenErrorRequest(message);
      await nextFrame();
      try {
        await element.authorize();
      } catch (e) {
        // ..
      }
      await nextFrame();
      assert.equal(element.lastErrorMessage, message);
    });

    it('renders error message', async () => {
      mockTokenErrorRequest('This is an error');
      try {
        await element.authorize();
      } catch (e) {
        // ...
      }
      await nextFrame();
      const node = element.shadowRoot.querySelector('.error-message');
      assert.ok(node);
    });

    it('clears "lastErrorMessage" when requesting the token again', async () => {
      mockTokenErrorRequest('This is an error');
      try {
        await element.authorize();
      } catch (e) {
        // ...
      }
      await nextFrame();
      await element.authorize();
      assert.isUndefined(element.lastErrorMessage);
    });
  });

  describe('#baseUri', () => {
    const baseUri = 'https://api.domain.com/auth';

    it('adds base URI to accessTokenUri', async () => {
      const params = createParamsMap();
      params.accessTokenUri = '/authorize';
      const element = await baseUriFixture(baseUri, params);
      await nextFrame();
      const result = element.serialize();
      assert.equal(result.accessTokenUri, 'https://api.domain.com/auth/authorize');
    });
  });
});
