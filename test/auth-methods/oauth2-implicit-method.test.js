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

describe('OAuth 2, implicit method', () => {
  const redirectUri = 'https://redirect.com/';
  const grantType = 'implicit';
  const inputFields = [
    ['clientId', '821776164331-rserncqpdsq32lmbf5cfeolgcoujb6fm.apps.googleusercontent.com'],
    ['authorizationUri', 'https://accounts.google.com/o/oauth2/v2/auth'],
    ['scopes', ['email', 'profile']],
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
      clientId,
      authorizationUri,
      redirectUri,
      scopes,
      allowRedirectUriChange=false,
    } = opts;
    return (fixture(html`<authorization-method
      type="${METHOD_OAUTH2}"
      grantType="implicit"
      .clientId="${clientId}"
      .authorizationUri="${authorizationUri}"
      .redirectUri="${redirectUri}"
      .scopes="${scopes}"
      ?allowRedirectUriChange="${allowRedirectUriChange}"></authorization-method>`));
  }

  /**
   * @param {string=} baseUri
   * @param {any=} opts
   * @returns {Promise<AuthorizationMethod>}
   */
  async function baseUriFixture(baseUri, {
    clientId = undefined,
    authorizationUri = undefined,
    scopes = undefined
  } = {}) {
    return (fixture(html`<authorization-method
      type="${METHOD_OAUTH2}"
      grantType="implicit"
      .clientId="${clientId}"
      .authorizationUri="${authorizationUri}"
      redirectUri="/redirect"
      .scopes="${scopes}"
      .baseUri="${baseUri}"
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

    it('has form has autocomplete', async () => {
      assert.equal(form.getAttribute('autocomplete'), 'on');
    });

    inputFields.forEach(([name]) => {
      it(`form has ${name} input`, async () => {
        const input = form.querySelector(`*[name="${name}"]`);
        assert.ok(input);
      });
    });

    it('renders redirect URI filed', async () => {
      element.redirectUri = redirectUri;
      await nextFrame();
      const node = element.shadowRoot.querySelector('.redirect-section');
      assert.ok(node);
      const label = node.querySelector('.code');
      assert.equal(label.textContent.trim(), redirectUri);
    });

    it('does not render edit redirect URI button', async () => {
      element.redirectUri = redirectUri;
      await nextFrame();
      const node = element.shadowRoot.querySelector('.redirect-section');
      assert.ok(node);
      const button = node.querySelector('.edit-rdr-uri');
      assert.notOk(button);
    });

    it('renders the edit button for the redirect uri', async () => {
      element.redirectUri = redirectUri;
      element.allowRedirectUriChange = true;
      await nextFrame();
      const node = element.shadowRoot.querySelector('.redirect-section');
      assert.ok(node);
      const button = node.querySelector('.edit-rdr-uri');
      assert.ok(button);
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

    it('renders the redirect URI field', async () => {
      const section = element.shadowRoot.querySelector('.redirect-section');
      assert.ok(section);
    });
  });

  describe('Advanced mode', () => {
    it('renders all fields when no initial values', async () => {
      const element = await basicFixture();
      assert.isTrue(element.advancedOpened, 'advanced view is opened');
      assert.isUndefined(element.advanced, 'advanced is undefined');
    });

    it('does not render advanced switch', async () => {
      const element = await basicFixture();
      const node = element.shadowRoot.querySelector('.adv-toggle');
      assert.notOk(node);
    });

    it('hides advanced fields when has all data', async () => {
      const element = await basicFixture(createParamsMap());
      assert.isFalse(element.advancedOpened, 'advanced view is not opened');
      assert.isTrue(element.advanced, 'advanced is set');
    });

    it('renders advanced switch when advanced is enabled', async () => {
      const element = await basicFixture(createParamsMap());
      const node = element.shadowRoot.querySelector('.adv-toggle');
      assert.ok(node);
    });

    it('toggles advanced visibility when switch is clicked', async () => {
      const element = await basicFixture(createParamsMap());
      const section = element.shadowRoot.querySelector('.advanced-section');
      assert.equal(getComputedStyle(section).display, 'none', 'section is hidden');
      const button = /** @type HTMLElement */ (element.shadowRoot.querySelector('.adv-settings-input'));
      button.click();
      await nextFrame();
      assert.equal(getComputedStyle(section).display, 'block', 'section is not hidden');
    });

    it('does not render PKCE checkbox', async () => {
      const element = await basicFixture(createParamsMap());
      const node = element.shadowRoot.querySelector('[name="pkce"]');
      assert.notOk(node);
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

    it('has no pkce value', () => {
      element.pkce = true;
      const result = element.serialize();
      assert.isUndefined(result.pkce);
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

    it('sets #authorizing flag', () => {
      mockTokenRequest();
      const button = /** @type HTMLElement */ (element.shadowRoot.querySelector('.auth-button'));
      button.click();
      // await nextFrame();
      assert.isTrue(element.authorizing);
    });

    it('ignores authorization when did not pass validation', async () => {
      element.clientId = '';
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

    it('ignores events with different state', async () => {
      mockTokenRequest('unknown-state', 'other');
      element.authorize();
      await aTimeout(2);
      await nextFrame();
      assert.isUndefined(element.accessToken);
    });

    it('ignores the response event when token is already set', async () => {
      mockTokenRequest(undefined, 'token-value');
      element.authorize();
      element.accessToken = 'test-token';
      await aTimeout(2);
      await nextFrame();
      assert.equal(element.accessToken, 'test-token');
    });

    it('restores default token type from the response event', async () => {
      mockTokenRequest();
      element.authorize();
      element.tokenType = 'custom';
      await aTimeout(2);
      await nextFrame();
      assert.equal(element.tokenType, 'Bearer');
    });

    it('dispatches change event when the token is received', async () => {
      mockTokenRequest();
      const handler = spy();
      element.addEventListener('change', handler);
      element.authorize();
      await aTimeout(2);
      await nextFrame();
      assert.isTrue(handler.called);
    });

    it('resets the #authorizing flag when token error', async () => {
      mockTokenErrorRequest();
      try {
        await element.authorize();
      } catch (e) {
        // ..
      }
      await nextFrame();
      assert.isFalse(element.authorizing);
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

    // it('sets default "lastErrorMessage"', async () => {
    //   mockTokenErrorRequest();
    //   element.authorize();
    //   await nextFrame();
    //   assert.equal(element.lastErrorMessage, 'Unknown error');
    // });

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

  describe.skip('clipboard copy', () => {
    let element = /** @type AuthorizationMethod */ (null);
    let copy;
    beforeEach(async () => {
      element = await basicFixture(createParamsMap());
      copy = element.shadowRoot.querySelector('clipboard-copy');
    });

    // Note (pawel): there's no way to tell whether content was copied to
    // clipboard or not. Instead it tests whether the content is passed to the
    // clipboard-copy element.

    it('copies redirect URL to clipboard', () => {
      const node = element.shadowRoot.querySelector('.redirect-section');
      const label = /** @type HTMLElement */ (node.querySelector('.code'));
      label.click();
      assert.equal(copy.content, label.innerText);
    });

    it('copies token value to clipboard', async () => {
      const tokenValue = 'test-token';
      element.accessToken = tokenValue;
      await nextFrame();
      const node = element.shadowRoot.querySelector('.current-token');
      const label = /** @type HTMLElement */ (node.querySelector('.code'));
      label.click();
      assert.equal(copy.content, tokenValue);
    });

    it('makes text selection from click', async () => {
      const node = element.shadowRoot.querySelector('.redirect-section');
      const label = /** @type HTMLElement */ (node.querySelector('.code'));
      label.click();
      await aTimeout(0);
      const selection = window.getSelection();
      assert.ok(selection.anchorNode);
    });

    it('makes text selection from focus', () => {
      const node = element.shadowRoot.querySelector('.redirect-section');
      const label = /** @type HTMLElement */ (node.querySelector('.code'));
      label.focus();
      const selection = window.getSelection();
      assert.ok(selection.anchorNode);
    });
  });

  describe('#baseUri', () => {
    const baseUri = 'https://api.domain.com/auth';

    it('adds base URI to authorizationUri', async () => {
      const params = createParamsMap();
      params.authorizationUri = '/authorize';
      const element = await baseUriFixture(baseUri, params);
      const result = element.serialize();
      assert.equal(result.authorizationUri, 'https://api.domain.com/auth/authorize');
    });

    it('adds base URI to redirectUri', async () => {
      const element = await baseUriFixture(baseUri, createParamsMap());
      const result = element.serialize();
      assert.equal(result.redirectUri, 'https://api.domain.com/auth/redirect');
    });

    it('ignores trailing slash', async () => {
      const uri = `${baseUri}/`;
      const element = await baseUriFixture(uri, createParamsMap());
      const result = element.serialize();
      assert.equal(result.redirectUri, 'https://api.domain.com/auth/redirect');
    });

    it('makes authorizationUri input of a type of String', async () => {
      const element = await baseUriFixture(baseUri, createParamsMap());
      const node = /** @type AnypointInput */ (element.shadowRoot.querySelector('[name="authorizationUri"]'));
      assert.equal(node.type, 'string');
    });
  });

  describe('editing oauth 2 redirect URI', () => {
    /** @type AuthorizationMethod */
    let element;
    beforeEach(async () => {
      const opts = createParamsMap();
      opts.allowRedirectUriChange = true;
      element = await basicFixture(opts);
    });

    /**
     * @param {AuthorizationMethod} editor
     */
    async function enableEditor(editor) {
      const node = /** @type HTMLElement */ (editor.shadowRoot.querySelector('.edit-rdr-uri'));
      node.click();
      await nextFrame();
    }

    it('sets the edit flag when clicking on the edit button', async () => {
      const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('.edit-rdr-uri'));
      node.click();
      const f = /** @type OAuth2 */ (element[factory]);
      assert.isTrue(f.editingRedirectUri);
      await nextFrame();
    });

    it('renders the input when enabling the editor', async () => {
      await enableEditor(element);
      const input = /** @type HTMLElement */ (element.shadowRoot.querySelector('.redirect-input'));
      assert.ok(input);
    });

    it('updates the redirect URI on enter key', async () => {
      await enableEditor(element);
      const input = /** @type HTMLInputElement */ (element.shadowRoot.querySelector('.redirect-input'));
      input.value = 'https://other.com';
      const e = new KeyboardEvent('keydown', {
        code: 'Enter',
        bubbles: true,
        composed: true,
        cancelable: true,
      });
      input.dispatchEvent(e);
      assert.equal(element.redirectUri, 'https://other.com');
    });

    it('updates the redirect URI on numpad enter key', async () => {
      await enableEditor(element);
      const input = /** @type HTMLInputElement */ (element.shadowRoot.querySelector('.redirect-input'));
      input.value = 'https://other.com';
      const e = new KeyboardEvent('keydown', {
        code: 'NumpadEnter',
        bubbles: true,
        composed: true,
        cancelable: true,
      });
      input.dispatchEvent(e);
      assert.equal(element.redirectUri, 'https://other.com');
    });

    it('cancels on Escape key down', async () => {
      await enableEditor(element);
      const input = /** @type HTMLInputElement */ (element.shadowRoot.querySelector('.redirect-input'));
      input.value = 'https://other.com';
      const e = new KeyboardEvent('keydown', {
        code: 'Escape',
        bubbles: true,
        composed: true,
        cancelable: true,
      });
      input.dispatchEvent(e);
      await nextFrame();
      assert.equal(element.redirectUri, redirectUri, 'has the unchanged redirect URI');
      const f = /** @type OAuth2 */ (element[factory]);
      assert.isFalse(f.editingRedirectUri, 'the edit flag is reset');
      assert.notOk(element.shadowRoot.querySelector('.redirect-input'), 'does not render the input');
    });

    it('updates the redirect URI on element blur event', async () => {
      await enableEditor(element);
      const input = /** @type HTMLInputElement */ (element.shadowRoot.querySelector('.redirect-input'));
      // input.focus();
      input.value = 'https://other.com';
      const e = new Event('blur');
      input.dispatchEvent(e);
      assert.equal(element.redirectUri, 'https://other.com');
    });

    it('notifies when redirect URI change', async () => {
      await enableEditor(element);
      const handler = spy();
      element.addEventListener('change', handler);
      const f = /** @type OAuth2 */ (element[factory]);
      f.commitRedirectUri('https://domain.com');
      assert.isTrue(handler.calledOnce);
    });

    it('ignores setting the same value', async () => {
      await enableEditor(element);
      const handler = spy();
      element.addEventListener('change', handler);
      const f = /** @type OAuth2 */ (element[factory]);
      f.commitRedirectUri(redirectUri);
      assert.isFalse(handler.called);
    });

    it('ignores when empty value', async () => {
      await enableEditor(element);
      const handler = spy();
      element.addEventListener('change', handler);
      const f = /** @type OAuth2 */ (element[factory]);
      f.commitRedirectUri('');
      assert.isFalse(handler.called);
    });

    it('ignores when invalid value', async () => {
      await enableEditor(element);
      const handler = spy();
      element.addEventListener('change', handler);
      const f = /** @type OAuth2 */ (element[factory]);
      // @ts-ignore
      f.commitRedirectUri(54);
      assert.isFalse(handler.called);
    });

    it('ignores when evil script', async () => {
      await enableEditor(element);
      const handler = spy();
      element.addEventListener('change', handler);
      const f = /** @type OAuth2 */ (element[factory]);
      // eslint-disable-next-line no-script-url
      f.commitRedirectUri('javascript:alert("test")');
      assert.isFalse(handler.called);
    });
  });
});
