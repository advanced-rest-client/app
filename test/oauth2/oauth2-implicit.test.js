import { aTimeout } from '@open-wc/testing-helpers';
import { assert } from '@open-wc/testing';
import { OAuth2Authorization, popupValue } from '../../src/elements/authorization/OAuth2Authorization.js';

// responses are defined in the ./ServerMock.js

describe('OAuth2', () => {
  describe('implicit grant', () => {
    const baseConfig = Object.freeze({
      grantType: 'implicit',
      clientId: 'auth-code-cid',
      authorizationUri: new URL('/oauth2/auth-implicit', document.baseURI).toString(),
      redirectUri: new URL('/test/oauth2/popup.html', document.baseURI).toString(),
      scopes: ['a', 'b'],
      state: 'my-state',
    });

    describe('non-interactive', () => {
      it('returns the token info', async () => {
        const config = {
          ...baseConfig,
          interactive: false,
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

      it('has scopes returned by the server', async () => {
        const config = {
          ...baseConfig,
          interactive: false,
          clientId: 'custom-scopes',
        };
        const auth = new OAuth2Authorization(config);
        const result = await auth.authorize();
        assert.deepEqual(result.scope, ['c1', 'c2']);
      });

      it('throws when client id error', async () => {
        const config = {
          ...baseConfig,
          interactive: false,
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
        assert.equal(err.message, 'Client authentication failed.', 'message is set');
        assert.equal(err.code, 'invalid_client', 'code is set');
        assert.equal(err.state, 'my-state', 'state is set');
        assert.isFalse(err.interactive, 'interactive is set');
      });

      it('handles no body in token response', async () => {
        const config = {
          ...baseConfig,
          interactive: false,
          authorizationUri: new URL('/empty-response', document.baseURI).toString(),
        };
        const auth = new OAuth2Authorization(config, {
          iframeTimeout: 100,
        });
        let err;
        try {
          await auth.authorize();
        } catch (e) {
          err = e;
        }
        assert.typeOf(err, 'error', 'has the error');
        assert.equal(err.message, 'Non-interactive authorization failed.', 'message is set');
        assert.equal(err.code, 'iframe_load_error', 'code is set');
        assert.equal(err.state, 'my-state', 'state is set');
        assert.isFalse(err.interactive, 'interactive is set');
      });
    });

    describe('interactive', () => {
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
        assert.equal(err.message, 'Client authentication failed.', 'message is set');
        assert.equal(err.code, 'invalid_client', 'code is set');
        assert.equal(err.state, 'my-state', 'state is set');
        assert.isTrue(err.interactive, 'interactive is set');
      });

      it('throws when popup window is closed without values', async () => {
        const config = {
          ...baseConfig,
          authorizationUri: new URL('/empty-response', document.baseURI).toString(),
        };
        const auth = new OAuth2Authorization(config, {
          iframeTimeout: 100,
        });
        let err;
        const p = auth.authorize();
        await aTimeout(1);
        auth[popupValue].popup.close();
        try {
          await p;
        } catch (e) {
          err = e;
        }
        assert.typeOf(err, 'error', 'has the error');
        assert.equal(err.message, 'No response has been recorded.', 'message is set');
        assert.equal(err.code, 'no_response', 'code is set');
        assert.equal(err.state, 'my-state', 'state is set');
        assert.isTrue(err.interactive, 'interactive is set');
      });

      it('throws when state is different', async () => {
        const config = {
          ...baseConfig,
          authorizationUri: new URL('/oauth2/auth-implicit-invalid-state', document.baseURI).toString(),
        };
        const auth = new OAuth2Authorization(config);
        let err;
        try {
          await auth.authorize();
        } catch (e) {
          err = e;
        }
        assert.typeOf(err, 'error', 'has the error');
        assert.equal(err.message, 'The state value returned by the authorization server is invalid.', 'message is set');
        assert.equal(err.code, 'invalid_state', 'code is set');
        assert.equal(err.state, 'my-state', 'state is set');
        assert.isTrue(err.interactive, 'interactive is set');
      });
    });
  
    describe('custom data', () => {
      const settings = {
        grantType: 'implicit',
        clientId: 'auth-code-cid',
        authorizationUri: new URL('/oauth2/auth-implicit-custom', document.baseURI).toString(),
        redirectUri: new URL('/test/oauth2/popup.html', document.baseURI).toString(),
        scopes: ['a', 'b'],
        state: 'my-state',
        customData: {
          auth: {
            parameters: [{
              name: 'customQuery',
              value: 'customQueryValue'
            }]
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
