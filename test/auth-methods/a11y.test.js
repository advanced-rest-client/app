import { html, fixture, assert } from '@open-wc/testing';

import '../../define/authorization-method.js';

describe.skip('accessibility', () => {
  async function basicFixture(username, password) {
    return fixture(html`<authorization-method
      type="basic"
      .username="${username}"
      .password="${password}"
    ></authorization-method>`);
  }

  async function ntlmFixture(username, password, domain) {
    return fixture(html`<authorization-method
      type="ntlm"
      .username="${username}"
      .password="${password}"
      .domain="${domain}"
    ></authorization-method>`);
  }

  async function digestFixture(opts = {}) {
    const { username, password, realm, nonce, opaque, requestUrl } = opts;
    return fixture(html`<authorization-method
      type="digest"
      .username="${username}"
      .password="${password}"
      .realm="${realm}"
      .nonce="${nonce}"
      .opaque="${opaque}"
      .requestUrl="${requestUrl}"
    ></authorization-method>`);
  }

  async function oauth1Fixture(opts = {}) {
    const {
      consumerKey,
      consumerSecret,
      redirectUri,
      token,
      tokenSecret,
      requestTokenUri,
      accessTokenUri,
      authTokenMethod,
      authParamsLocation,
    } = opts;
    return fixture(html`<authorization-method
      type="oauth 1"
      .consumerKey="${consumerKey}"
      .consumerSecret="${consumerSecret}"
      .redirectUri="${redirectUri}"
      .token="${token}"
      .tokenSecret="${tokenSecret}"
      .requestTokenUri="${requestTokenUri}"
      .accessTokenUri="${accessTokenUri}"
      .authTokenMethod="${authTokenMethod}"
      .authParamsLocation="${authParamsLocation}"
    ></authorization-method>`);
  }

  async function oauth2Fixture(opts = {}) {
    const {
      grantType,
      redirectUri,
      authorizationUri,
      accessTokenUri,
      clientId,
      scopes,
      clientSecret,
      username,
      password,
    } = opts;
    return fixture(html`<authorization-method
      type="oauth 2"
      .grantType="${grantType}"
      .redirectUri="${redirectUri}"
      .authorizationUri="${authorizationUri}"
      .accessTokenUri="${accessTokenUri}"
      .clientId="${clientId}"
      .scopes="${scopes}"
      .clientSecret="${clientSecret}"
      .username="${username}"
      .password="${password}"
    ></authorization-method>`);
  }

  describe('Basic authorization', () => {
    it('is accessible when empty', async () => {
      const element = await basicFixture();
      await assert.isAccessible(element, {
        ignoredRules: ['color-contrast'],
      });
    });

    it('is accessible with values', async () => {
      const element = await basicFixture('uname', 'passwd');
      await assert.isAccessible(element, {
        ignoredRules: ['color-contrast'],
      });
    });
  });

  describe('NTLM authorization', () => {
    it('is accessible when empty', async () => {
      const element = await ntlmFixture();
      await assert.isAccessible(element, {
        ignoredRules: ['color-contrast'],
      });
    });

    it('is accessible with values', async () => {
      const element = await ntlmFixture('uname', 'passwd', 'domain.com');
      await assert.isAccessible(element, {
        ignoredRules: ['color-contrast'],
      });
    });
  });

  describe('Digest authorization', () => {
    it('is accessible when empty', async () => {
      const element = await digestFixture();
      await assert.isAccessible(element, {
        ignoredRules: ['color-contrast'],
      });
    });

    it('is accessible with values', async () => {
      const element = await digestFixture({
        username: 'uname',
        password: 'passwd',
        realm: 'realm',
        nonce: 'nonce',
        opaque: 'opaque',
        requestUrl: 'https://api.domain.com/v0/endpoint',
      });
      await assert.isAccessible(element, {
        ignoredRules: ['color-contrast'],
      });
    });
  });

  describe('OAuth 1 authorization', () => {
    it('is accessible when empty', async () => {
      const element = await oauth1Fixture();
      assert.isAccessible(element, {
        ignoredRules: ['color-contrast'],
      });
    });

    it('is accessible with values', async () => {
      const element = await oauth1Fixture({
        consumerKey: 'ck',
        consumerSecret: 'cs',
        redirectUri: 'https://r.uri',
        token: 'tok',
        tokenSecret: 'sec',
        requestTokenUri: 'https://token.uri',
        accessTokenUri: 'https://atoken.uri',
        authTokenMethod: 'GET',
        authParamsLocation: 'headers',
      });
      await assert.isAccessible(element, {
        ignoredRules: ['color-contrast'],
      });
    });
  });

  describe('OAuth 2 authorization', () => {
    const redirectUri = 'https://r.uri';
    const authorizationUri = 'https://auth.uri';
    const accessTokenUri = 'https://token.uri';
    const clientId = 'cid';
    const clientSecret = 'sc';
    const username = 'uname';
    const password = 'pwd';
    const scopes = ['email', 'profile'];

    it('is accessible when empty', async () => {
      const element = await oauth2Fixture();
      await assert.isAccessible(element, {
        ignoredRules: ['color-contrast'],
      });
    });

    it('is accessible with values (implicit)', async () => {
      const element = await oauth2Fixture({
        grantType: 'implicit',
        redirectUri,
        authorizationUri,
        clientId,
        scopes,
      });
      await assert.isAccessible(element, {
        ignoredRules: ['color-contrast'],
      });
    });

    it('is accessible with values (code)', async () => {
      const element = await oauth2Fixture({
        grantType: 'authorization_code',
        redirectUri,
        authorizationUri,
        accessTokenUri,
        clientId,
        clientSecret,
        scopes,
      });
      await assert.isAccessible(element, {
        ignoredRules: ['color-contrast'],
      });
    });

    it('is accessible with values (client credentials)', async () => {
      const element = await oauth2Fixture({
        grantType: 'client_credentials',
        redirectUri,
        accessTokenUri,
        clientId,
        clientSecret,
        scopes,
      });
      await assert.isAccessible(element, {
        ignoredRules: ['color-contrast'],
      });
    });

    it('is accessible with values (password)', async () => {
      const element = await oauth2Fixture({
        grantType: 'password',
        redirectUri,
        accessTokenUri,
        clientId,
        scopes,
        username,
        password,
      });
      await assert.isAccessible(element, {
        ignoredRules: ['color-contrast'],
      });
    });

    it('is accessible with values (custom grant)', async () => {
      const element = await oauth2Fixture({
        grantType: 'custom',
        redirectUri,
        authorizationUri,
        accessTokenUri,
        clientId,
        clientSecret,
        scopes,
        username,
        password,
      });
      await assert.isAccessible(element, {
        ignoredRules: ['color-contrast'],
      });
    });
  });
});
