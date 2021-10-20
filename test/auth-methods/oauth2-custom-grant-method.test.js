import { html, fixture, assert, oneEvent } from '@open-wc/testing';
import { spy } from 'sinon';
import { AuthorizationEventTypes } from '@advanced-rest-client/events';
import { METHOD_OAUTH2 } from '../../index.js';
import '../../define/authorization-method.js';

/** @typedef {import('../../src/elements/authorization/AuthorizationMethodElement').default} AuthorizationMethod */
/** @typedef {import('@anypoint-web-components/awc').AnypointInputElement} AnypointInput */

describe('OAuth 2, custom grant', () => {
  const grantType = 'custom-credentials';
  const inputFields = [
    ['clientId', '821776164331-rserncqpdsq32lmbf5cfeolgcoujb6fm.apps.googleusercontent.com'],
    ['clientSecret', 'custom-secret'],
    ['accessTokenUri', 'https://accounts.google.com/o/oauth2/v2/token'],
    ['scopes', ['email', 'profile']],
  ];

  /**
   * @param {any=} defaults
   * @returns {any}
   */
  function createParamsMap(defaults={}) {
    const props = {
      grantType,
    };
    inputFields.forEach(([n, v]) => {props[n] = v});
    return {
      ...props,
      ...defaults,
    };
  }

  /**
   * @param {any=} opts
   * @returns {Promise<AuthorizationMethod>}
   */
  async function basicFixture(opts={}) {
    const {
      clientId,
      clientSecret,
      accessTokenUri,
      scopes,
    } = opts;
    return (fixture(html`<authorization-method
      type="${METHOD_OAUTH2}"
      grantType="custom-credentials"
      .clientId="${clientId}"
      .clientSecret="${clientSecret}"
      .accessTokenUri="${accessTokenUri}"
      .scopes="${scopes}"></authorization-method>`));
  }

  /**
   * @param {string=} baseUri
   * @param {any=} opts
   * @returns {Promise<AuthorizationMethod>}
   */
  async function baseUriFixture(baseUri, {
    clientId = undefined,
    clientSecret = undefined,
    accessTokenUri = undefined,
    authorizationUri = undefined,
    scopes = undefined
  } = {}) {
    return (fixture(html`<authorization-method
      type="${METHOD_OAUTH2}"
      grantType="custom-credentials"
      .clientId="${clientId}"
      .clientSecret="${clientSecret}"
      .accessTokenUri="${accessTokenUri}"
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

    inputFields.forEach(([name]) => {
      it(`form has ${name} input`, async () => {
        const input = form.querySelector(`*[name="${name}"]`);
        assert.ok(input);
      });
    });

    it('client secret is not required', async () => {
      const input = /** @type AnypointInput */ (form.querySelector('*[name="clientSecret"]'));
      assert.notOk(input.required);
    });

    it('does not render the redirect URI field', async () => {
      const section = element.shadowRoot.querySelector('.redirect-section');
      assert.notOk(section);
    });
  });

  describe('Advanced mode', () => {
    it('renders all fields with values', async () => {
      const element = await basicFixture(createParamsMap());
      assert.isTrue(element.advancedOpened, 'advanced view is opened');
      assert.isUndefined(element.advanced, 'advanced is undefined');
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

  describe('clear()', () => {
    let element = /** @type AuthorizationMethod */ (null);
    beforeEach(async () => {
      element = await basicFixture(createParamsMap());
    });

    [
      'grantType', 'accessToken', 'authorizationUri',
      'accessTokenUri', 'clientId', 'clientSecret', 'username', 'password'
    ]
    .forEach((prop) => {
      it(`clears ${prop}`, () => {
        element.clear();
        assert.strictEqual(element[prop], '');
      });
    });

    [
      ['oauthDeliveryMethod', 'query', 'header'],
      ['oauthDeliveryName', 'test', 'authorization'],
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
