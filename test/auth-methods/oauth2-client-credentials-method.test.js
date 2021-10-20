import { html, fixture, assert, oneEvent, nextFrame } from '@open-wc/testing';
import { spy } from 'sinon';
import { AuthorizationEventTypes } from '@advanced-rest-client/events';
import { METHOD_OAUTH2 } from '../../index.js';
import '../../define/authorization-method.js';
import { factory } from '../../src/elements/authorization/AuthorizationMethodElement.js';

/** @typedef {import('../../src/elements/authorization/ui/OAuth2').default} OAuth2 */
/** @typedef {import('../../src/elements/authorization/AuthorizationMethodElement').default} AuthorizationMethod */
/** @typedef {import('@anypoint-web-components/awc').AnypointInputElement} AnypointInput */
/** @typedef {import('@anypoint-web-components/awc').AnypointDropdownMenuElement} AnypointDropdownMenu */
/** @typedef {import('@anypoint-web-components/awc').AnypointListboxElement} AnypointListbox */

describe('OAuth 2, client credentials method', () => {
  const clientCredentialsGrantType = 'client_credentials';
  const inputFields = [
    ['clientId', '821776164331-rserncqpdsq32lmbf5cfeolgcoujb6fm.apps.googleusercontent.com'],
    ['accessTokenUri', 'https://accounts.google.com/o/oauth2/v2/token'],
    ['scopes', ['email', 'profile']],
    ['clientSecret', 'cc-secret'],
    ['ccDeliveryMethod', 'header']
  ];

  function createParamsMap() {
    const props = {
      grantType: clientCredentialsGrantType,
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
      accessTokenUri,
      scopes,
      ccDeliveryMethod,
      grantType = clientCredentialsGrantType
    } = opts;
    return (fixture(html`<authorization-method
      type="${METHOD_OAUTH2}"
      grantType=${grantType}
      .clientId="${clientId}"
      .clientSecret="${clientSecret}"
      .accessTokenUri="${accessTokenUri}"
      .scopes="${scopes}"
      .ccDeliveryMethod="${ccDeliveryMethod}"></authorization-method>`));
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
    scopes = undefined
  } = {}) {
    return (fixture(html`<authorization-method
      type="${METHOD_OAUTH2}"
      grantType="client_credentials"
      .clientId="${clientId}"
      .clientSecret="${clientSecret}"
      .accessTokenUri="${accessTokenUri}"
      .scopes="${scopes}"
      .baseUri="${baseUri}"
    ></authorization-method>`));
  }

  /**
   * @param {array=} credentialsSource
   * @param {any=} opts
   * @returns {Promise<AuthorizationMethod>}
   */
  async function credentialSourceFixture(credentialsSource, {
    clientId = undefined,
    clientSecret = undefined,
    accessTokenUri = undefined,
    scopes = undefined
  } = {}) {
    return (fixture(html`<authorization-method
      type="${METHOD_OAUTH2}"
      grantType="client_credentials"
      .clientId="${clientId}"
      .clientSecret="${clientSecret}"
      .accessTokenUri="${accessTokenUri}"
      .scopes="${scopes}"
      .credentialsSource="${credentialsSource}"
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

    it('renders the delivery method drop down', async () => {
      const element = await basicFixture(createParamsMap());
      const input = /** @type AnypointInput */ (element.shadowRoot.querySelector('*[name="ccDeliveryMethod"]'));
      assert.ok(input);
    });
  });

  describe('Data initialization', () => {
    let element = /** @type AuthorizationMethod */ (null);
    beforeEach(async () => {
      element = await basicFixture(createParamsMap());
    });

    inputFields.forEach(([name, value]) => {
      it(`input ${name} has value`, async () => {
        const node = /** @type HTMLElement */ (element.shadowRoot.querySelector(`*[name="${name}"]`));
        if (node.localName === 'anypoint-input') {
          const input = /** @type AnypointInput */ (node);
          assert.equal(input.value, value);
        } else if (node.localName === 'anypoint-dropdown-menu') {
          const menu = /** @type AnypointDropdownMenu */ (node);
          const list = /** @type AnypointListbox */ (menu.children[1]);
          assert.equal(String(list.selected), value);
        }
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
        const node = /** @type HTMLElement */ (element.shadowRoot.querySelector(`*[name="${name}"]`));
        setTimeout(() => {
          if (name === 'ccDeliveryMethod') {
            const menu = /** @type AnypointDropdownMenu */ (node);
            const list = /** @type AnypointListbox */ (menu.children[1]);
            list.selected = String(value);
            list.dispatchEvent(new CustomEvent('change'));
          } else if (name === 'scopes') {
            const input = /** @type AnypointInput */ (node);
            input.value = value;
            input.dispatchEvent(new CustomEvent('change'));
          } else {
            const input = /** @type AnypointInput */ (node);
            input.value = value;
            input.dispatchEvent(new CustomEvent('change'));
          }
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
        if (name === 'ccDeliveryMethod') {
          assert.equal(result.deliveryMethod, value);
        } else {
          // @ts-ignore
          assert.equal(result[name], value);
        }
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

    inputFields.filter(([name]) => name !== 'ccDeliveryMethod').forEach(([name, value]) => {
      it(`restores ${name}`, () => {
        element.restore(restoreMap);
        // @ts-ignore
        assert.equal(element[name], value);
      });
    });

    it('restores deliveryMethod', () => {
      element.restore({ ...restoreMap, deliveryMethod: 'header' });
      assert.equal(element.ccDeliveryMethod, 'header');
    });
  });

  describe('authorization request', () => {
    let element = /** @type AuthorizationMethod */ (null);

    beforeEach(async () => {
      element = await basicFixture(createParamsMap());
    });

    inputFields.filter(([name]) => name !== 'ccDeliveryMethod').forEach(([name, value]) => {
      it(`authorization event has ${name} property`, async () => {
        const handler = spy();
        element.addEventListener(AuthorizationEventTypes.OAuth2.authorize, handler);
        await element.authorize();
        const { detail } = handler.args[0][0];
        // @ts-ignore
        assert.equal(detail[name], value);
      });
    });

    it(`authorization event has the deliveryMethod property`, async () => {
      const handler = spy();
      element.addEventListener(AuthorizationEventTypes.OAuth2.authorize, handler);
      await element.authorize();
      const { detail } = handler.args[0][0];
      assert.equal(detail.deliveryMethod, 'header');
    });
  });

  describe('application flow', () => {
    let element = /** @type AuthorizationMethod */ (null);

    beforeEach(async () => {
      const opts = {
        grantType: 'application',
        clientId: '821776164331-rserncqpdsq32lmbf5cfeolgcoujb6fm.apps.googleusercontent.com',
        accessTokenUri: 'https://accounts.google.com/o/oauth2/v2/token',
        scopes: ['email', 'profile'],
        clientSecret: 'cc-secret',
        ccDeliveryMethod: 'header'
      }
      element = await basicFixture(opts);
    });

    it(`authorization event has credentials when grant_type is application`, async () => {
      const handler = spy();
      element.addEventListener(AuthorizationEventTypes.OAuth2.authorize, handler);
      await element.authorize();
      const { detail } = handler.args[0][0];
      assert.equal(detail.grantType, 'application');
      assert.equal(detail.clientId, '821776164331-rserncqpdsq32lmbf5cfeolgcoujb6fm.apps.googleusercontent.com');
      assert.equal(detail.clientSecret, 'cc-secret');
    });
  });

  describe('#baseUri', () => {
    const baseUri = 'https://api.domain.com/auth';

    it('adds base URI to accessTokenUri', async () => {
      const params = createParamsMap();
      params.accessTokenUri = '/authorize';
      const element = await baseUriFixture(baseUri, params);
      const result = element.serialize();
      assert.equal(result.accessTokenUri, 'https://api.domain.com/auth/authorize');
    });

    it('ignores trailing slash', async () => {
      const uri = `${baseUri}/`;
      const params = createParamsMap();
      params.accessTokenUri = '/authorize';
      const element = await baseUriFixture(uri, params);
      const result = element.serialize();
      assert.equal(result.accessTokenUri, 'https://api.domain.com/auth/authorize');
    });

    it('makes accessTokenUri input text type', async () => {
      const element = await baseUriFixture(baseUri, createParamsMap());
      const node = /** @type AnypointInput */ (element.shadowRoot.querySelector('[name="accessTokenUri"]'));
      assert.equal(node.type, 'string');
    });
  });

  describe('Credentials source', () => {
    const credentials = [{grantType: 'client_credentials', credentials: [{name: 'My social Network', clientId: '123', clientSecret: 'xyz'}, {name: 'My social Network 2', clientId: '1234', clientSecret: 'wxyz'}]}];

    let element = /** @type AuthorizationMethod */ (null);
    beforeEach(async () => {
      element = await credentialSourceFixture(credentials, createParamsMap());
    });

    it('should render credentials source dropdown', async () => {
      assert.isNotNull(element.shadowRoot.querySelector('.credential-source-dropdown'));
    });

    it('should fill clientId and clientSecret as read only from source', async () => {
      const dropdown = element.shadowRoot.querySelector(`anypoint-dropdown-menu[name="credentialSource"]`);
      const input = dropdown.querySelector('anypoint-listbox');
      setTimeout(() => {
        input.selected = 'My social Network';
      });
      const e = await oneEvent(element, 'change');
      assert.ok(e);
      assert.equal(element.clientSecret, 'xyz');
      assert.equal(element.clientId, '123');
      const f = /** @type OAuth2 */ (element[factory]);
      assert.equal(f.credentialsDisabled, true);
    });
  });
});
