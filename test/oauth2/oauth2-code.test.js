import { aTimeout } from '@open-wc/testing-helpers';
import { assert } from '@open-wc/testing';
import { OAuth2Authorization, popupValue } from '../../src/elements/authorization/OAuth2Authorization.js';

// responses are defined in the ./ServerMock.js

describe('OAuth2', () => {
  describe('authorization_code grant', () => {
    const baseConfig = Object.freeze({
      grantType: 'authorization_code',
      clientId: 'auth-code-cid',
      clientSecret: 'auth-code-cs',
      authorizationUri: new URL('/oauth2/auth-code', document.baseURI).toString(),
      accessTokenUri: new URL('/oauth2/token', document.baseURI).toString(),
      redirectUri: new URL('/test/oauth2/popup.html', document.baseURI).toString(),
      scopes: ['a', 'b'],
      state: 'my-state'
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

      it('throws for invalid_request error', async () => {
        const config = {
          ...baseConfig,
          interactive: false,
          redirectUri: new URL('/test/oauth2/wrong-redirect.html', document.baseURI).toString(),
        };
        const auth = new OAuth2Authorization(config);
        let err;
        try {
          await auth.authorize();
        } catch (e) {
          err = e;
        }
        assert.typeOf(err, 'error', 'has the error');
        assert.equal(err.message, 'invalid redirect', 'message is set');
        assert.equal(err.code, 'invalid_request', 'code is set');
        assert.equal(err.state, 'my-state', 'state is set');
        assert.isFalse(err.interactive, 'interactive is set');
      });

      it('throws for invalid token request url', async () => {
        const config = {
          ...baseConfig,
          interactive: false,
          accessTokenUri: new URL('/invalid', document.baseURI).toString(),
        };
        const auth = new OAuth2Authorization(config);
        let err;
        try {
          await auth.authorize();
        } catch (e) {
          err = e;
        }
        assert.typeOf(err, 'error', 'has the error');
        assert.equal(err.message, 'Couldn\'t connect to the server. Authorization URI is invalid. Received status 404.', 'message is set');
        assert.equal(err.code, 'request_error', 'code is set');
        assert.equal(err.state, 'my-state', 'state is set');
        assert.isFalse(err.interactive, 'interactive is set');
      });

      it('throws for invalid authorization request url', async () => {
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
      
      it('handles no body in token response', async () => {
        const config = {
          ...baseConfig,
          interactive: false,
          accessTokenUri: new URL('/empty-response', document.baseURI).toString(),
        };
        const auth = new OAuth2Authorization(config);
        let err;
        try {
          await auth.authorize();
        } catch (e) {
          err = e;
        }
        assert.typeOf(err, 'error', 'has the error');
        assert.equal(err.message, 'Couldn\'t connect to the server. Code response body is empty.', 'message is set');
        assert.equal(err.code, 'request_error', 'code is set');
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

      it('throws invalid_request error', async () => {
        const config = {
          ...baseConfig,
          redirectUri: new URL('/test/oauth2/wrong-redirect.html', document.baseURI).toString(),
        };
        const auth = new OAuth2Authorization(config);
        let err;
        try {
          await auth.authorize();
        } catch (e) {
          err = e;
        }
        assert.typeOf(err, 'error', 'has the error');
        assert.equal(err.message, 'invalid redirect', 'message is set');
        assert.equal(err.code, 'invalid_request', 'code is set');
        assert.equal(err.state, 'my-state', 'state is set');
        assert.isTrue(err.interactive, 'interactive is set');
      });

      it('throws for invalid token request url', async () => {
        const config = {
          ...baseConfig,
          accessTokenUri: new URL('/invalid', document.baseURI).toString(),
        };
        const auth = new OAuth2Authorization(config);
        let err;
        try {
          await auth.authorize();
        } catch (e) {
          err = e;
        }
        assert.typeOf(err, 'error', 'has the error');
        assert.equal(err.message, 'Couldn\'t connect to the server. Authorization URI is invalid. Received status 404.', 'message is set');
        assert.equal(err.code, 'request_error', 'code is set');
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
      
      it('handles no body in token response', async () => {
        const config = {
          ...baseConfig,
          accessTokenUri: new URL('/empty-response', document.baseURI).toString(),
        };
        const auth = new OAuth2Authorization(config);
        let err;
        try {
          await auth.authorize();
        } catch (e) {
          err = e;
        }
        assert.typeOf(err, 'error', 'has the error');
        assert.equal(err.message, 'Couldn\'t connect to the server. Code response body is empty.', 'message is set');
        assert.equal(err.code, 'request_error', 'code is set');
        assert.equal(err.state, 'my-state', 'state is set');
        assert.isTrue(err.interactive, 'interactive is set');
      });
    });
  
    describe('custom data', () => {
      const settings = {
        grantType: 'authorization_code',
        clientId: 'auth-code-cid',
        clientSecret: 'auth-code-cs',
        authorizationUri: new URL('/oauth2/auth-code-custom', document.baseURI).toString(),
        accessTokenUri: new URL('/oauth2/token-custom', document.baseURI).toString(),
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

    describe('PKCE', () => {
      const settings = {
        grantType: 'authorization_code',
        clientId: 'auth-code-cid',
        clientSecret: 'auth-code-cs',
        authorizationUri: new URL('/oauth2/auth-code', document.baseURI).toString(),
        accessTokenUri: new URL('/oauth2/token', document.baseURI).toString(),
        redirectUri: new URL('/test/oauth2/popup.html', document.baseURI).toString(),
        pkce: true,
      };

      it('returns the token for PKCE extension', async () => {
        // during this test the mock server actually performs the check for the challenge and the verifier
        const auth = new OAuth2Authorization(settings);
        const result = await auth.authorize();
        assert.equal(result.accessToken, 'token1234');
      });

      it('returns error when verification fails', async () => {
        // just to be sure we got it right. With the custom data the "server" adds a single character to the stored challenge.
        // This will case the verification to fail and therefore this test is... well, tested.
        const opts = {
          ...settings,
          customData: {
            auth: {
              parameters: [{
                name: 'failPkce',
                value: 'true'
              }]
            },
          },
        };
        const auth = new OAuth2Authorization(opts);
        let err;
        try {
          await auth.authorize();
        } catch (e) {
          err = e;
        }
        assert.typeOf(err, 'error');
        assert.equal(err.message, 'invalid code_verifier');
      });
    });
  });
});
