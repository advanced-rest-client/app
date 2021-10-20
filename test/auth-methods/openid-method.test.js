import { html, fixture, assert, nextFrame } from '@open-wc/testing';
import sinon from 'sinon';
import { AuthorizationEventTypes, TransportEventTypes } from '@advanced-rest-client/events';
import { METHOD_OIDC } from '../../src/elements/authorization/Utils.js';
import '../../define/authorization-method.js';
import env from '../env.js';
import { discoveryCache, defaultGrantTypes } from '../../src/elements/authorization/ui/OpenID.js';
import { factory } from '../../src/elements/authorization/AuthorizationMethodElement.js';
import { OidcAuthorization } from '../../src/elements/authorization/OidcAuthorization.js';


/** @typedef {import('../../src/elements/authorization/AuthorizationMethodElement').default} AuthorizationMethod */
/** @typedef {import('../../src/elements/authorization/ui/OpenID').default} OpenID */
/** @typedef {import('@advanced-rest-client/events').OidcAuthorizeEvent} OidcAuthorizeEvent */
/** @typedef {import('@advanced-rest-client/events').Authorization.OidcTokenInfo} OidcTokenInfo */
/** @typedef {import('@advanced-rest-client/events').ArcResponse.HTTPResponse} HTTPResponse */

describe('OpenID Connect', () => {
  const oauth2redirect = `${window.location.origin}/oauth-popup.html`;

  /**
   * @param {any=} opts
   * @returns {Promise<AuthorizationMethod>}
   */
  async function basicFixture(opts = {}) {
    const { clientId, clientSecret, authorizationUri, accessTokenUri, scopes, grantType, issuerUri } = opts;
    return fixture(html`<authorization-method
      type="${METHOD_OIDC}"
      .grantType="${grantType}"
      .redirectUri="${oauth2redirect}"
      .clientId="${clientId}"
      .clientSecret="${clientSecret}"
      .authorizationUri="${authorizationUri}"
      .accessTokenUri="${accessTokenUri}"
      .scopes="${scopes}"
      .issuerUri="${issuerUri}"
    ></authorization-method>`);
  }

  const oidcConfig = Object.freeze({
    issuer: 'http://localhost:8004',
    token_endpoint: 'http://localhost:8004/token',
    authorization_endpoint: 'http://localhost:8004/authorize',
    userinfo_endpoint: 'http://localhost:8004/userinfo',
    token_endpoint_auth_methods_supported: ['none'],
    jwks_uri: 'http://localhost:8004/jwks',
    response_types_supported: ['code', 'id_token', 'code id_token'],
    grant_types_supported: ['authorization_code', 'custom'],
    token_endpoint_auth_signing_alg_values_supported: ['RS256'],
    response_modes_supported: ['query'],
    id_token_signing_alg_values_supported: ['RS256'],
    revocation_endpoint: 'http://localhost:8004/revoke',
    subject_types_supported: ['public'],
    scopes_supported: ['openid', 'profile'],
  });

  describe('base state', () => {
    it('renders base state component', async () => {
      const element = await basicFixture();
      const issuer = element.shadowRoot.querySelector('[name="issuerUri"]');
      assert.ok(issuer, 'has the issuer URI input');

      const allFields = element.shadowRoot.querySelectorAll('[name]');
      assert.lengthOf(allFields, 1, 'has only one input field');
    });

    it('has the request tokens button disabled', async () => {
      const element = await basicFixture();
      const button = /** @type HTMLButtonElement */ (element.shadowRoot.querySelector('[data-type="get-token"]'));
      assert.ok(button, 'has the button');
      assert.isTrue(button.disabled, 'the button is disabled');
    });

    it('has the read button', async () => {
      const element = await basicFixture();
      const button = /** @type HTMLButtonElement */ (element.shadowRoot.querySelector('[data-type="read-discovery"]'));
      assert.ok(button, 'has the button');
      assert.notOk(button.disabled, 'the button is not disabled');
    });
  });

  describe('requesting the discovery data', () => {
    const fullDiscoveryUrl = `${env.oauth2.issuer}/.well-known/openid-configuration`;
    /** @type AuthorizationMethod */
    let element;
    beforeEach(async () => {
      discoveryCache.clear();
      element = await basicFixture({
        issuerUri: env.oauth2.issuer,
      });
    });

    it('requests for the data with ARC event', async () => {
      const spy = sinon.spy();
      element.addEventListener(TransportEventTypes.httpTransport, spy);
      await element.discover();
      assert.isTrue(spy.called);
      const { request } = spy.args[0][0].detail;
      assert.equal(request.method, 'GET', 'request.method is set')
      assert.equal(request.url, fullDiscoveryUrl, 'request.url is set')
    });

    it('processes the ARC events data', async () => {
      element.addEventListener(TransportEventTypes.httpTransport, function f(e) {
        element.removeEventListener(TransportEventTypes.httpTransport, f);
        const typed = /** @type CustomEvent */ (e);
        typed.detail.result = Promise.resolve(/** @type HTTPResponse */ ({
          payload: JSON.stringify(oidcConfig),
          status: 200,
          headers: '',
        }));
      });
      await element.discover();
      assert.equal(element.authorizationUri, oidcConfig.authorization_endpoint, 'sets the authorizationUri');
      assert.equal(element.accessTokenUri, oidcConfig.token_endpoint, 'sets the accessTokenUri');
      // the rest is in unit tests
    });

    it('processes the fetch data', async () => {
      await element.discover();
      assert.equal(element.authorizationUri, `${env.oauth2.issuer}/authorize`, 'sets the authorizationUri');
      assert.equal(element.accessTokenUri, `${env.oauth2.issuer}/token`, 'sets the accessTokenUri');
      // the rest is in unit tests
    });

    it('sets the discovered flag', async () => {
      await element.discover();
      const f = /** @type OpenID */ (element[factory]);
      assert.isTrue(f.discovered);
    });

    it('sets the message and flags when error', async () => {
      element.issuerUri = 'http://localhost:1234/notinhg';
      await nextFrame();
      await element.discover();
      const f = /** @type OpenID */ (element[factory]);
      assert.isFalse(f.discovered, 'discovered is false');
      assert.equal(f.lastErrorMessage, 'Unable to read the discovery information.', 'lastErrorMessage is set');
    });

    it('sets the cache data', async () => {
      element.addEventListener(TransportEventTypes.httpTransport, function f(e) {
        element.removeEventListener(TransportEventTypes.httpTransport, f);
        const typed = /** @type CustomEvent */ (e);
        typed.detail.result = Promise.resolve(/** @type HTTPResponse */ ({
          payload: JSON.stringify(oidcConfig),
          status: 200,
          headers: '',
        }));
        typed.preventDefault();
      });
      await element.discover();
      assert.deepEqual(discoveryCache.get(fullDiscoveryUrl), oidcConfig);
    });

    it('reuses the cached data', async () => {
      const spy = sinon.spy();
      element.addEventListener(TransportEventTypes.httpTransport, spy);
      await element.discover();
      await element.discover();
      assert.isTrue(spy.calledOnce);
    });

    it('throws when no issuerUrl', async () => {
      let message;
      element.issuerUri = undefined;
      await nextFrame();
      try {
        await element.discover();
      } catch (e) {
        message = e.message;
      }
      const f = /** @type OpenID */ (element[factory]);
      assert.equal(message, 'Issuer URI is not set.', 'throws the error');
      assert.equal(f.lastErrorMessage, 'Issuer URI is not set.', 'sets the error message');
    });

    it('reads the data after the read button click', async () => {
      const ui = /** @type OpenID */ (element[factory]);
      ui.discover = async () => {};
      const spy = sinon.spy(ui, 'discover');
      const button = /** @type HTMLButtonElement */ (element.shadowRoot.querySelector('[data-type="read-discovery"]'));
      button.click();
      assert.isTrue(spy.calledOnce);
    });
  });

  describe('propagateOidc()', () => {
    /** @type OpenID */
    let ui;
    beforeEach(async () => {
      const element = await basicFixture({
        issuerUri: env.oauth2.issuer,
      });
      ui = /** @type OpenID */ (element[factory]);
    });

    it('sets the authorizationUri', () => {
      ui.propagateOidc({ ...oidcConfig });
      assert.equal(ui.authorizationUri, oidcConfig.authorization_endpoint, 'authorizationUri is set');
    });

    it('sets the accessTokenUri', () => {
      ui.propagateOidc({ ...oidcConfig });
      assert.equal(ui.accessTokenUri, oidcConfig.token_endpoint, 'accessTokenUri is set');
    });

    it('ignores accessTokenUri when not set', () => {
      ui.propagateOidc({ ...oidcConfig, token_endpoint: undefined });
      assert.isUndefined(ui.accessTokenUri, 'accessTokenUri is not set');
    });

    it('sets the grantTypes', () => {
      ui.propagateOidc({ ...oidcConfig });
      assert.typeOf(ui.grantTypes, 'array', 'grantTypes is an array');
      assert.lengthOf(ui.grantTypes, oidcConfig.grant_types_supported.length, 'has all types');
      const [g1, g2] = ui.grantTypes;
      assert.equal(g1.type, 'authorization_code', 'grant #1 type is set');
      assert.equal(g1.label, 'Authorization code', 'grant #1 label is set');
      assert.equal(g2.type, 'custom', 'grant #2 type is set');
      assert.equal(g2.label, 'custom', 'grant #2 label is set');
    });

    it('sets the default grantTypes', () => {
      ui.propagateOidc({ ...oidcConfig, grant_types_supported: undefined, });
      assert.deepEqual(ui.grantTypes, defaultGrantTypes);
    });

    it('sets the scopes', () => {
      ui.propagateOidc({ ...oidcConfig });
      assert.typeOf(ui.scopes, 'array', 'scopes is an array');
      assert.deepEqual(ui.scopes, ['openid', 'profile'], 'has the scopes');
    });

    it('sets the default scopes', () => {
      ui.propagateOidc({ ...oidcConfig, scopes_supported: undefined, });
      assert.deepEqual(ui.scopes, ['openid']);
    });

    it('sets the supportedResponses', () => {
      ui.propagateOidc({ ...oidcConfig });
      assert.typeOf(ui.supportedResponses, 'array', 'supportedResponses is an array');
      assert.lengthOf(ui.supportedResponses, 3, 'has all supportedResponses');
      const [r1, r2, r3] = ui.supportedResponses;
      assert.isArray(r1, 'response #1 is an array');
      assert.lengthOf(r1, 1, 'response #1 has a single type');
      assert.equal(r1[0].type, 'code', 'response #1 has type type');
      assert.equal(r1[0].label, 'Code', 'response #1 has type label');
      assert.lengthOf(r2, 1, 'response #2 has a single type');
      assert.equal(r2[0].type, 'id_token', 'response #2 has type type');
      assert.equal(r2[0].label, 'ID token', 'response #2 has type label');
      assert.lengthOf(r3, 2, 'response #3 has a 2 types');
      assert.equal(r3[0].type, 'code', 'response #3,1 has type type');
      assert.equal(r3[0].label, 'Code', 'response #3,1 has type label');
      assert.equal(r3[1].type, 'id_token', 'response #3,2 has type type');
      assert.equal(r3[1].label, 'ID token', 'response #3,2 has type label');
    });
  });

  describe('Discovered UI', () => {
    /** @type AuthorizationMethod */
    let element;
    beforeEach(async () => {
      element = await basicFixture({
        issuerUri: env.oauth2.issuer,
        clientId: 'test-cid',
        clientSecret: 'test-secret',
        grantType: 'authorization_code',
      });
      await element.discover();
    });

    it('has the response type input', () => {
      const node = element.shadowRoot.querySelector('[name="responseType"');
      assert.ok(node);
    });

    it('has the grant type input', () => {
      const node = element.shadowRoot.querySelector('[name="grantType"');
      assert.ok(node);
    });

    it('has the clientId input', () => {
      const node = /** @type HTMLInputElement */ (element.shadowRoot.querySelector('[name="clientId"'));
      assert.ok(node, 'has the input');
      assert.isTrue(node.required, 'is required')
    });

    it('has the clientSecret input', () => {
      const node = /** @type HTMLInputElement */ (element.shadowRoot.querySelector('[name="clientSecret"'));
      assert.ok(node, 'has the input');
      assert.isTrue(node.required, 'is required')
    });
  });

  describe('Data change and propagation', () => {
    /** @type AuthorizationMethod */
    let element;
    beforeEach(async () => {
      element = await basicFixture({
        issuerUri: env.oauth2.issuer,
        clientId: 'test-cid',
        clientSecret: 'test-secret',
        grantType: 'authorization_code',
      });
      await element.discover();
    });

    it('propagates issuerUri change', async () => {
      const spy = sinon.spy();
      element.addEventListener('change', spy);
      const input = /** @type HTMLInputElement */ (element.shadowRoot.querySelector('[name="issuerUri"'));
      input.value = 'https://api.domain.com';
      input.dispatchEvent(new Event('change'));
      assert.equal(element.issuerUri, 'https://api.domain.com', 'propagates the change');
      assert.isTrue(spy.calledOnce, 'dispatched the change event');
    });
  });

  describe('readTokenValue()', () => {
    /** @type OpenID */
    let ui;
    beforeEach(async () => {
      const element = await basicFixture({
        issuerUri: env.oauth2.issuer,
      });
      ui = /** @type OpenID */ (element[factory]);
    });

    it('returns the token for token response type', () => {
      const result = ui.readTokenValue({
        responseType: 'token',
        state: '',
        time: 1,
        accessToken: 'test-token',
      });
      assert.equal(result, 'test-token');
    });

    it('returns the token for code response type', () => {
      const result = ui.readTokenValue({
        responseType: 'code',
        state: '',
        time: 1,
        accessToken: 'test-token',
      });
      assert.equal(result, 'test-token');
    });

    it('returns the token for id_token response type', () => {
      const result = ui.readTokenValue({
        responseType: 'id_token',
        state: '',
        time: 1,
        idToken: 'test-token',
      });
      assert.equal(result, 'test-token');
    });

    it('returns the token for id response type', () => {
      const result = ui.readTokenValue({
        responseType: 'id',
        state: '',
        time: 1,
        idToken: 'test-token',
      });
      assert.equal(result, 'test-token');
    });

    it('returns the token from accessToken', () => {
      const result = ui.readTokenValue({
        responseType: 'other',
        state: '',
        time: 1,
        accessToken: 'test-token',
      });
      assert.equal(result, 'test-token');
    });

    it('returns the token from refreshToken', () => {
      const result = ui.readTokenValue({
        responseType: 'other',
        state: '',
        time: 1,
        refreshToken: 'test-token',
      });
      assert.equal(result, 'test-token');
    });

    it('returns the token from idToken', () => {
      const result = ui.readTokenValue({
        responseType: 'other',
        state: '',
        time: 1,
        idToken: 'test-token',
      });
      assert.equal(result, 'test-token');
    });

    it('returns the token from idToken', () => {
      const result = ui.readTokenValue({
        responseType: 'other',
        state: '',
        time: 1,
        idToken: 'test-token',
      });
      assert.equal(result, 'test-token');
    });

    it('returns the empty string for default', () => {
      const result = ui.readTokenValue({
        responseType: 'other',
        state: '',
        time: 1,
      });
      assert.equal(result, '');
    });

    it('returns the empty string when no token', () => {
      const result = ui.readTokenValue(undefined);
      assert.equal(result, '');
    });
  });

  describe('readTokenLabel()', () => {
    /** @type OpenID */
    let ui;
    beforeEach(async () => {
      const element = await basicFixture({
        issuerUri: env.oauth2.issuer,
      });
      ui = /** @type OpenID */ (element[factory]);
    });

    it('returns the label for token response type', () => {
      const result = ui.readTokenLabel({
        responseType: 'token',
        state: '',
        time: 1,
        accessToken: 'test-token',
      });
      assert.equal(result, 'Access token');
    });

    it('returns the label for code response type', () => {
      const result = ui.readTokenLabel({
        responseType: 'code',
        state: '',
        time: 1,
        accessToken: 'test-token',
      });
      assert.equal(result, 'Access token from code exchange');
    });

    it('returns the label for id_token response type', () => {
      const result = ui.readTokenLabel({
        responseType: 'id_token',
        state: '',
        time: 1,
        idToken: 'test-token',
      });
      assert.equal(result, 'ID token');
    });

    it('returns the label for id response type', () => {
      const result = ui.readTokenLabel({
        responseType: 'id',
        state: '',
        time: 1,
        idToken: 'test-token',
      });
      assert.equal(result, 'ID token');
    });

    it('returns the label from default', () => {
      const result = ui.readTokenLabel({
        responseType: 'other',
        state: '',
        time: 1,
        accessToken: 'test-token',
      });
      assert.equal(result, 'Unknown token');
    });
  });

  describe('serialize()', () => {
    /** @type AuthorizationMethod */
    let element;
    /** @type OpenID */
    let ui;
    beforeEach(async () => {
      element = await basicFixture({
        issuerUri: env.oauth2.issuer,
        clientId: 'test-cid',
        clientSecret: 'test-secret',
        grantType: 'authorization_code',
      });
      ui = /** @type OpenID */ (element[factory]);
      await element.discover();
    });

    it('sets the responseType', () => {
      const result = element.serialize();
      assert.equal(result.responseType, 'code');
    });

    it('sets the accessToken when has tokens', () => {
      ui.tokens = [
        {
          responseType: 'code',
          state: 'abc',
          time: 1,
          accessToken: 'test-token'
        }
      ];
      const result = element.serialize();
      assert.equal(result.accessToken, 'test-token');
    });

    it('has no accessToken when no tokens', () => {
      ui.tokens = undefined;
      const result = element.serialize();
      assert.isUndefined(result.accessToken);
    });

    it('adds the issuerUri property', () => {
      const result = element.serialize();
      assert.equal(result.issuerUri, env.oauth2.issuer);
    });

    it('adds the tokens property', () => {
      const tokens = [
        {
          responseType: 'code',
          state: 'abc',
          time: 1,
          accessToken: 'test-token'
        }
      ];
      ui.tokens = tokens;
      const result = element.serialize();
      assert.deepEqual(result.tokens, tokens);
    });

    it('adds the tokenInUse property', () => {
      const tokens = [
        {
          responseType: 'code',
          state: 'abc',
          time: 1,
          accessToken: 'test-token'
        }
      ];
      ui.tokens = tokens;
      ui.tokenInUse = 1;
      const result = element.serialize();
      assert.equal(result.tokenInUse, 1);
    });

    it('adds the supportedResponses property', () => {
      const responses = [
        [ { label: 'a', type: 'b' } ],
      ];
      ui.supportedResponses = responses;
      const result = element.serialize();
      assert.deepEqual(result.supportedResponses, responses);
    });

    it('adds the grantTypes property', () => {
      const grantTypes = [
        { label: 'a', type: 'b' },
      ];
      ui.grantTypes = grantTypes;
      const result = element.serialize();
      assert.deepEqual(result.grantTypes, grantTypes);
    });

    it('adds the serverScopes property', () => {
      const serverScopes = ['a'];
      ui.serverScopes = serverScopes;
      const result = element.serialize();
      assert.deepEqual(result.serverScopes, serverScopes);
    });
  });

  describe('authorize()', () => {
    /** @type AuthorizationMethod */
    let element;
    /** @type OpenID */
    let ui;
    beforeEach(async () => {
      element = await basicFixture({
        issuerUri: env.oauth2.issuer,
        clientId: 'test-cid',
        clientSecret: 'test-secret',
        grantType: 'authorization_code',
      });
      ui = /** @type OpenID */ (element[factory]);
      await element.discover();
    });

    /**
     * @param {OidcAuthorizeEvent} e
     */
    function handler(e) {
      const config = { ...e.detail };
      const auth = new OidcAuthorization(config);
      e.detail.result = auth.authorize();
    }

    before(() => {
      document.body.addEventListener(AuthorizationEventTypes.Oidc.authorize, handler);
    });

    after(() => {
      document.body.removeEventListener(AuthorizationEventTypes.Oidc.authorize, handler);
    });

    it('sets the state before authorization', async () => {
      ui.lastErrorMessage = 'test';
      ui.authorizing = false;
      const promise = element.authorize();
      assert.isUndefined(ui.lastErrorMessage, 'clears the lastErrorMessage');
      assert.isTrue(ui.authorizing, 'sets the authorizing');
      await promise;
    });

    it('sets the state after authorization', async () => {
      element.accessToken = 'test';
      await nextFrame();
      await element.authorize();
      assert.typeOf(ui.tokens, 'array', 'has the tokens set');
      const token = /** @type OidcTokenInfo */ (ui.tokens[0]);
      assert.equal(token.responseType, 'code', 'has the responseType');
      assert.typeOf(token.accessToken, 'string', 'has the accessToken');
      assert.typeOf(token.idToken, 'string', 'has the idToken');
      assert.isFalse(ui.authorizing, 're-sets authorizing flag');
      assert.isUndefined(ui.accessToken, 'accessToken is removed');
      assert.equal(ui.tokenInUse, 0, 'tokenInUse is set');
    });
  });
});
