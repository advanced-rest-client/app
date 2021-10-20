// eslint-disable-next-line import/no-unresolved
import { assert } from '@open-wc/testing';
import { OAuth2Authorization } from '../../src/elements/authorization/OAuth2Authorization.js';

// responses are defined in the ./ServerMock.js

describe('OAuth2', () => {
  describe('password grant', () => {
    const baseConfig = Object.freeze({
      grantType: 'password',
      username: 'test-uname',
      password: 'test-passwd',
      clientId: 'auth-code-cid',
      scopes: ['a', 'b'],
      accessTokenUri: new URL('/oauth2/password', document.baseURI).toString(),
    });

    describe('requesting the data', () => {
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

      it('throws when invalid credentials', async () => {
        const config = {
          ...baseConfig,
          username: 'invalid',
        };
        const auth = new OAuth2Authorization(config);
        let err;
        try {
          await auth.authorize();
        } catch (e) {
          err = e;
        }
        assert.typeOf(err, 'error', 'has the error');
        assert.equal(err.message, 'invalid username', 'message is set');
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
  
    describe('custom data', () => {
      const settings = {
        clientId: 'custom-data',
        grantType: 'password',
        username: 'test-uname',
        password: 'test-passwd',
        scopes: ['a', 'b'],
        accessTokenUri: new URL('/oauth2/password', document.baseURI).toString(),
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
