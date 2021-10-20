/* eslint-disable no-shadow */
import { html, fixture, assert, oneEvent, nextFrame } from '@open-wc/testing';
import { spy } from 'sinon';
import { AuthorizationEventTypes } from '@advanced-rest-client/events';
import { METHOD_OAUTH2 } from '../../index.js';
import '../../define/authorization-method.js';

/** @typedef {import('../../src/elements/authorization/AuthorizationMethodElement').default} AuthorizationMethod */
/** @typedef {import('@anypoint-web-components/awc').AnypointInputElement} AnypointInput */
/** @typedef {import('@anypoint-web-components/awc').AnypointCheckboxElement} AnypointCheckbox */

describe('OAuth 2, authorization code method', () => {
  const redirectUri = 'https://redirect.com/';
  const grantType = 'authorization_code';
  const inputFields = [
    ['clientId', '821776164331-rserncqpdsq32lmbf5cfeolgcoujb6fm.apps.googleusercontent.com'],
    ['clientSecret', 'test-secret-client'],
    ['authorizationUri', 'https://accounts.google.com/o/oauth2/v2/auth'],
    ['accessTokenUri', 'https://accounts.google.com/o/oauth2/v2/token'],
    ['scopes', ['email', 'profile']],
  ];

  function createParamsMap() {
    const props = {
      redirectUri,
      grantType,
      pkce: true,
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
      clientSecret,
      authorizationUri,
      accessTokenUri,
      redirectUri,
      scopes,
      pkce,
    } = opts;
    return (fixture(html`<authorization-method
      type="${METHOD_OAUTH2}"
      grantType="authorization_code"
      .clientId="${clientId}"
      .clientSecret="${clientSecret}"
      .authorizationUri="${authorizationUri}"
      .accessTokenUri="${accessTokenUri}"
      .redirectUri="${redirectUri}"
      .scopes="${scopes}"
      .pkce="${pkce}"></authorization-method>`));
  }

  /**
   * @param {string=} baseUri
   * @param {any=} opts
   * @returns {Promise<AuthorizationMethod>}
   */
  async function baseUriFixture(baseUri, {
    clientId = undefined,
    clientSecret = undefined,
    authorizationUri = undefined,
    accessTokenUri = undefined,
    scopes = undefined
  } = {}) {
    return (fixture(html`<authorization-method
      type="${METHOD_OAUTH2}"
      grantType="authorization_code"
      .clientId="${clientId}"
      .clientSecret="${clientSecret}"
      .authorizationUri="${authorizationUri}"
      .accessTokenUri="${accessTokenUri}"
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

    inputFields.forEach(([name]) => {
      it(`form has ${name} input`, async () => {
        const input = form.querySelector(`*[name="${name}"]`);
        assert.ok(input);
      });
    });

    it('client secret is required', async () => {
      const input = /** @type AnypointInput */ (form.querySelector('*[name="clientSecret"]'));
      assert.isTrue(input.required);
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

    it('renders the PKCE checkbox', async () => {
      const element = await basicFixture(createParamsMap());
      const node = element.shadowRoot.querySelector('[name="pkce"]');
      assert.ok(node);
    });

    it('does not render the PKCE checkbox with noPkce', async () => {
      const element = await basicFixture(createParamsMap());
      element.noPkce = true;
      await nextFrame();
      const node = element.shadowRoot.querySelector('[name="pkce"]');
      assert.notOk(node);
    });

    it('checking the checkbox changes the pkce value of the element', async () => {
      const element = await basicFixture(createParamsMap());
      element.pkce = false;
      await nextFrame();
      const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('[name="pkce"]'));
      node.click();
      assert.isTrue(element.pkce);
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

    it('selects the PKCE checkbox', async () => {
      const input = /** @type AnypointCheckbox */ (element.shadowRoot.querySelector(`*[name="pkce"]`));
      assert.isTrue(input.checked);
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

    it('has the pkce value', () => {
      const result = element.serialize();
      assert.isTrue(result.pkce);
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

  describe('authorization request', () => {
    let element = /** @type AuthorizationMethod */ (null);

    beforeEach(async () => {
      element = await basicFixture(createParamsMap());
    });

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

    it('adds base URI to accessTokenUri', async () => {
      const params = createParamsMap();
      params.accessTokenUri = '/authorize';
      const element = await baseUriFixture(baseUri, params);
      const result = element.serialize();
      assert.equal(result.accessTokenUri, 'https://api.domain.com/auth/authorize');
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

    it('makes authorizationUri input text type', async () => {
      const element = await baseUriFixture(baseUri, createParamsMap());
      const node = /** @type AnypointInput */ (element.shadowRoot.querySelector('[name="authorizationUri"]'));
      assert.equal(node.type, 'string');
    });

    it('makes accessTokenUri input text type', async () => {
      const element = await baseUriFixture(baseUri, createParamsMap());
      const node = /** @type AnypointInput */ (element.shadowRoot.querySelector('[name="accessTokenUri"]'));
      assert.equal(node.type, 'string');
    });
  });
});
