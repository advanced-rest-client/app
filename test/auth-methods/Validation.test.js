import { assert } from '@open-wc/testing';
import * as Validation  from '../../src/elements/authorization/Validation.js';

describe('Validation', () => {
  describe('validateBasicAuth()', () => {
    it('returns false when no username', () => {
      // @ts-ignore
      const result = Validation.validateBasicAuth({});
      assert.isFalse(result);
    });

    it('returns true when has username', () => {
      // @ts-ignore
      const result = Validation.validateBasicAuth({
        username: 'test'
      });
      assert.isTrue(result);
    });
  });

  describe('validateBearerAuth()', () => {
    it('returns false when no token', () => {
      // @ts-ignore
      const result = Validation.validateBearerAuth({});
      assert.isFalse(result);
    });

    it('returns true when has token', () => {
      // @ts-ignore
      const result = Validation.validateBearerAuth({
        token: 'test'
      });
      assert.isTrue(result);
    });
  });

  describe('validateNtlmAuth()', () => {
    it('returns false when no username', () => {
      // @ts-ignore
      const result = Validation.validateNtlmAuth({});
      assert.isFalse(result);
    });

    it('returns true when has username', () => {
      // @ts-ignore
      const result = Validation.validateNtlmAuth({
        username: 'test'
      });
      assert.isTrue(result);
    });
  });

  describe('validateDigestAuth()', () => {
    let cnf;
    beforeEach(() => {
      cnf = {
        username: 'username',
        realm: 'realm',
        nonce: 'nonce',
        nc: 'nc',
        opaque: 'opaque',
        cnonce: 'cnonce'
      };
    });

    [
      'username', 'realm', 'nonce', 'nc', 'opaque', 'cnonce'
    ].forEach((prop) => {
      it(`returns false when no ${prop}`, () => {
        delete cnf[prop];
        const result = Validation.validateDigestAuth(cnf);
        assert.isFalse(result);
      });
    });

    it('returns true when valid', () => {
      const result = Validation.validateDigestAuth(cnf);
      assert.isTrue(result);
    });
  });

  describe('validateOauth1Auth()', () => {
    let cnf;
    beforeEach(() => {
      cnf = {
        authTokenMethod: 'test-value',
        authParamsLocation: 'test-value',
        timestamp: 'test-value',
        nonce: 'test-value',
        signatureMethod: 'test-value',
        consumerKey: 'test-value',
      };
    });

    [
      'authTokenMethod',
      'authParamsLocation',
      'timestamp',
      'nonce',
      'signatureMethod',
      'consumerKey',
    ].forEach((prop) => {
      it(`returns false when no ${prop}`, () => {
        delete cnf[prop];
        const result = Validation.validateOauth1Auth(cnf);
        assert.isFalse(result);
      });
    });

    it('returns true when valid', () => {
      const result = Validation.validateOauth1Auth(cnf);
      assert.isTrue(result);
    });
  });

  describe('validateOauth2AuthImplicit()', () => {
    let cnf;
    beforeEach(() => {
      cnf = {
        clientId: 'cid',
        authorizationUri: 'auth-uri',
      };
    });

    [
      'clientId',
      'authorizationUri',
    ].forEach((prop) => {
      it(`returns false when no ${prop}`, () => {
        delete cnf[prop];
        const result = Validation.validateOauth2AuthImplicit(cnf);
        assert.isFalse(result);
      });
    });

    it('returns true when valid', () => {
      const result = Validation.validateOauth2AuthImplicit(cnf);
      assert.isTrue(result);
    });
  });

  describe('validateOauth2AuthCode()', () => {
    let cnf;
    beforeEach(() => {
      cnf = {
        clientId: 'cid',
        clientSecret: 'cs',
        authorizationUri: 'auth-uri',
        accessTokenUri: 'token-uri',
      };
    });

    [
      'clientId',
      'clientSecret',
      'authorizationUri',
      'accessTokenUri',
    ].forEach((prop) => {
      it(`returns false when no ${prop}`, () => {
        delete cnf[prop];
        const result = Validation.validateOauth2AuthCode(cnf);
        assert.isFalse(result);
      });
    });

    it('returns true when valid', () => {
      const result = Validation.validateOauth2AuthCode(cnf);
      assert.isTrue(result);
    });
  });

  describe('validateOauth2AuthCredentials()', () => {
    let cnf;
    beforeEach(() => {
      cnf = {
        accessTokenUri: 'token-uri',
      };
    });

    [
      'accessTokenUri',
    ].forEach((prop) => {
      it(`returns false when no ${prop}`, () => {
        delete cnf[prop];
        const result = Validation.validateOauth2AuthCredentials(cnf);
        assert.isFalse(result);
      });
    });

    it('returns true when valid', () => {
      const result = Validation.validateOauth2AuthCredentials(cnf);
      assert.isTrue(result);
    });
  });

  describe('validateOauth2AuthPassword()', () => {
    let cnf;
    beforeEach(() => {
      cnf = {
        accessTokenUri: 'token-uri',
        username: 'username',
        password: 'password',
      };
    });

    [
      'accessTokenUri',
      'username',
      'password',
    ].forEach((prop) => {
      it(`returns false when no ${prop}`, () => {
        delete cnf[prop];
        const result = Validation.validateOauth2AuthPassword(cnf);
        assert.isFalse(result);
      });
    });

    it('returns true when valid', () => {
      const result = Validation.validateOauth2AuthPassword(cnf);
      assert.isTrue(result);
    });
  });

  describe('validateOauth2AuthCustom()', () => {
    let cnf;
    beforeEach(() => {
      cnf = {
        accessTokenUri: 'token-uri',
      };
    });

    [
      'accessTokenUri',
    ].forEach((prop) => {
      it(`returns false when no ${prop}`, () => {
        delete cnf[prop];
        const result = Validation.validateOauth2AuthCustom(cnf);
        assert.isFalse(result);
      });
    });

    it('returns true when valid', () => {
      const result = Validation.validateOauth2AuthCustom(cnf);
      assert.isTrue(result);
    });
  });

  describe('validateOauth2Auth()', () => {
    let element;
    beforeEach(() => {
      element = document.createElement('div');
      const shadow = element.attachShadow({ mode: 'open' });
      shadow.appendChild(document.createElement('form'));
    });

    it('calls implicit validation', () => {
      element.grantType = 'implicit';
      element.clientId = 'cid';
      element.authorizationUri = 'auth-uri';
      const result = Validation.validateOauth2Auth(element);
      assert.isTrue(result);
    });

    it('calls code validation', () => {
      element.grantType = 'authorization_code';
      element.clientId = 'cid';
      element.clientSecret = 'cs';
      element.authorizationUri = 'auth-uri';
      element.accessTokenUri = 'token-uri';
      const result = Validation.validateOauth2Auth(element);
      assert.isTrue(result);
    });

    it('calls client_credentials validation', () => {
      element.grantType = 'client_credentials';
      element.accessTokenUri = 'token-uri';
      const result = Validation.validateOauth2Auth(element);
      assert.isTrue(result);
    });

    it('calls password validation', () => {
      element.grantType = 'password';
      element.accessTokenUri = 'token-uri';
      element.username = 'username';
      element.password = 'password';
      const result = Validation.validateOauth2Auth(element);
      assert.isTrue(result);
    });

    it('calls custom validation', () => {
      element.grantType = 'other';
      element.accessTokenUri = 'token-uri';
      const result = Validation.validateOauth2Auth(element);
      assert.isTrue(result);
    });
  });
});
