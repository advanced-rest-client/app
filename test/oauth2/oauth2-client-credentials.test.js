// eslint-disable-next-line import/no-unresolved
import { assert } from '@open-wc/testing';
import { OAuth2Authorization } from '../../src/elements/authorization/OAuth2Authorization.js';

// responses are defined in the ./ServerMock.js

/** @typedef {import('@advanced-rest-client/events').Authorization.OAuth2Authorization} OAuth2Settings */

describe('OAuth2', () => {
  describe('client credentials grant', () => {
    describe('Body delivery method', () => {
      const baseConfig = /** @type OAuth2Settings */ (Object.freeze({
        grantType: 'client_credentials',
        clientId: 'auth-code-cid',
        clientSecret: 'cc-secret',
        scopes: ['a', 'b'],
        accessTokenUri: new URL('/oauth2/client-credentials', document.baseURI).toString(),
      }));

      it('returns the token info', async () => {
        const config = {
          ...baseConfig,
        };
        const auth = new OAuth2Authorization(config);
        const result = await auth.authorize();
        assert.typeOf(result, 'object', 'the response is an object');
        assert.equal(result.accessToken, 'token1234', 'access token is set');
        assert.equal(result.refreshToken, 'refresh1234', 'refresh token is set');
        assert.equal(result.expiresIn, 3600, 'expiresIn is set');
        assert.typeOf(result.expiresAt, 'number', 'expiresAt is set');
        assert.isFalse(result.expiresAssumed, 'expiresAssumed is set');
        assert.deepEqual(result.scope, baseConfig.scopes, 'scopes are set to the default scopes');
      });

      it('throws invalid_client error', async () => {
        const config = {
          ...baseConfig,
          clientId: 'invalid'
        };
        const auth = new OAuth2Authorization(config);
        let err;
        try {
          await auth.authorize();
        } catch (e) {
          err = e;
        }
        assert.typeOf(err, 'error', 'has the error');
        assert.equal(err.message, 'invalid client id', 'message is set');
        assert.equal(err.code, 'invalid_client', 'code is set');
      });

      it('throws when invalid secret', async () => {
        const config = {
          ...baseConfig,
          clientSecret: 'invalid',
        };
        const auth = new OAuth2Authorization(config);
        let err;
        try {
          await auth.authorize();
        } catch (e) {
          err = e;
        }
        assert.typeOf(err, 'error', 'has the error');
        assert.equal(err.message, 'invalid secret', 'message is set');
        assert.equal(err.code, 'invalid_client', 'code is set');
      });

      it('reports server scopes', async () => {
        const config = {
          ...baseConfig,
        };
        delete config.scopes;
        const auth = new OAuth2Authorization(config);
        const result = await auth.authorize();
        assert.deepEqual(result.scope, ['custom']);
      });
    });

    describe('Headers delivery method', () => {
      const baseConfig = /** @type OAuth2Settings */ (Object.freeze({
        grantType: 'client_credentials',
        clientId: 'auth-code-cid',
        clientSecret: 'cc-secret',
        scopes: ['a', 'b'],
        accessTokenUri: new URL('/oauth2/client-credentials-header', document.baseURI).toString(),
        deliveryMethod: 'header', 
        deliveryName: 'authorization',
      }));

      it('returns the token info', async () => {
        const config = {
          ...baseConfig,
        };
        const auth = new OAuth2Authorization(config);
        const result = await auth.authorize();
        assert.typeOf(result, 'object', 'the response is an object');
        assert.equal(result.accessToken, 'token1234', 'access token is set');
        assert.equal(result.refreshToken, 'refresh1234', 'refresh token is set');
        assert.equal(result.expiresIn, 3600, 'expiresIn is set');
        assert.typeOf(result.expiresAt, 'number', 'expiresAt is set');
        assert.isFalse(result.expiresAssumed, 'expiresAssumed is set');
        assert.deepEqual(result.scope, baseConfig.scopes, 'scopes are set to the default scopes');
      });
    });
  
    describe('custom data', () => {
      const settings = {
        grantType: 'client_credentials',
        clientId: 'auth-code-cid',
        clientSecret: 'cc-secret',
        scopes: ['a', 'b'],
        accessTokenUri: new URL('/oauth2/client-credentials', document.baseURI).toString(),
        customData: {
          auth: {
            parameters: [{
              name: 'customQuery',
              value: 'customQueryValue'
            }]
          },
          token: {
            body: [{
              name: 'customBody',
              value: 'customBodyValue'
            }],
            headers: [{
              name: 'customHeader',
              value: 'customHeaderValue'
            }],
            parameters: [{
              name: 'customParameter',
              value: 'customParameterValue'
            }],
          },
        }
      };
      it('applies all custom data', async () => {
        const auth = new OAuth2Authorization(settings);
        const result = await auth.authorize();
        assert.equal(result.accessToken, 'token1234');
      });
    });
  });
});
