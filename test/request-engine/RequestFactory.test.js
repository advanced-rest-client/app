/* eslint-disable no-template-curly-in-string */
import { assert } from '@open-wc/testing';
import { ArcMock } from '@advanced-rest-client/arc-mock';
import { ArcModelEventTypes, SessionCookieEventTypes } from '@advanced-rest-client/events';
import { RequestFactory, RequestAuthorization, ModulesRegistry, RequestCookies } from '../../index.js';

/** @typedef {import('@advanced-rest-client/events').ArcRequest.ArcBaseRequest} ArcBaseRequest */
/** @typedef {import('@advanced-rest-client/events').ArcRequest.ArcEditorRequest} ArcEditorRequest */
/** @typedef {import('@advanced-rest-client/events').Authorization.BasicAuthorization} BasicAuthorization */
/** @typedef {import('@advanced-rest-client/events').Authorization.OAuth2Authorization} OAuth2Authorization */
/** @typedef {import('@advanced-rest-client/events').Authorization.CCAuthorization} CCAuthorization */
/** @typedef {import('@advanced-rest-client/events').Authorization.BearerAuthorization} BearerAuthorization */
/** @typedef {import('@advanced-rest-client/events').Cookies.ARCCookie} ARCCookie */

describe('RequestFactory', () => {
  const generator = new ArcMock();
  // @ts-ignore
  const jexl = window.Jexl;

  describe('constructor()', () => {
    it('sets the eventsTarget property', () => {
      const inst = new RequestFactory(window, jexl);
      assert.isTrue(inst.eventsTarget === window);
    });

    it('sets the jexl property', () => {
      const inst = new RequestFactory(window, jexl);
      assert.isTrue(inst.jexl === jexl);
    });

    it('sets the actions property', () => {
      const inst = new RequestFactory(window, jexl);
      assert.typeOf(inst.actions, 'object');
    });

    it('sets the abortControllers property', () => {
      const inst = new RequestFactory(window, jexl);
      assert.typeOf(inst.abortControllers, 'map');
      assert.equal(inst.abortControllers.size, 0);
    });
  });

  describe('abort()', () => {
    const id = 'test-id';
    let inst = /** @type RequestFactory */ (null);
    beforeEach(() => {
      inst = new RequestFactory(window, jexl);
    });

    it('does nothing when controller not found', () => {
      inst.abort(id);
    });

    it('aborts the controller', () => {
      const abortController = new AbortController();
      inst.abortControllers.set(id, abortController);
      inst.abort(id);
      assert.isTrue(abortController.signal.aborted);
    });

    it('removes the controller', () => {
      const abortController = new AbortController();
      inst.abortControllers.set(id, abortController);
      inst.abort(id);
      assert.equal(inst.abortControllers.size, 0);
    });
  });

  describe('prepareExecutionStore()', () => {
    let inst = /** @type RequestFactory */ (null);
    beforeEach(() => {
      inst = new RequestFactory(window, jexl);
    });

    it('has the basic store items', () => {
      const result = inst.prepareExecutionStore(false);
      [
        'AuthData', 'ClientCertificate', 'HostRules', 'Project', 'Request', 'RestApi',
        'UrlHistory', 'UrlIndexer', 'WSUrlHistory',
      ].forEach((name) => {
        assert.typeOf(result[name], 'object', `has the ${name} property`);
      });
    });

    it('has the environment items', () => {
      const result = inst.prepareExecutionStore(true);
      [
        'AuthData', 'ClientCertificate', 'HostRules', 'Project', 'Request', 'RestApi',
        'UrlHistory', 'UrlIndexer', 'WSUrlHistory', 'Environment', 'Variable'
      ].forEach((name) => {
        assert.typeOf(result[name], 'object', `has the ${name} property`);
      });
    });
  });

  describe('prepareExecutionEvents()', () => {
    let inst = /** @type RequestFactory */ (null);
    beforeEach(() => {
      inst = new RequestFactory(window, jexl);
    });

    [
      'ArcNavigationEvents', 'SessionCookieEvents', 'EncryptionEvents', 'GoogleDriveEvents', 'ProcessEvents', 'WorkspaceEvents',
      'RequestEvents', 'AuthorizationEvents', 'ConfigEvents',
    ].forEach((name) => {
      it(`has the ${name} property`, () => {
        const result = inst.prepareExecutionEvents();
        assert.typeOf(result[name], 'object');
      });
    });
  });

  describe('buildExecutionContext()', () => {
    let inst = /** @type RequestFactory */ (null);
    beforeEach(() => {
      inst = new RequestFactory(window, jexl);
    });

    it('has the event target', async () => {
      const result = await inst.buildExecutionContext([], { environment: null, variables: [] });
      assert.isTrue(result.eventsTarget === window);
    });

    it('has no environment info by default', async () => {
      const result = await inst.buildExecutionContext([], { environment: null, variables: [] });
      assert.isUndefined(result.environment);
    });

    it('has no events info by default', async () => {
      const result = await inst.buildExecutionContext([], { environment: null, variables: [] });
      assert.isUndefined(result.Events);
    });

    it('adds the store info', async () => {
      const result = await inst.buildExecutionContext([], { environment: null, variables: [] });
      assert.isUndefined(result.Store);
    });

    it('adds the environment info', async () => {
      const result = await inst.buildExecutionContext(['environment'], { environment: null, variables: [] });
      assert.deepEqual(result.environment, { environment: null, variables: [] });
    });

    it('adds the events info', async () => {
      const result = await inst.buildExecutionContext(['events'], { environment: null, variables: [] });
      assert.typeOf(result.Events, 'object');
    });

    it('adds the store info', async () => {
      const result = await inst.buildExecutionContext(['store'], { environment: null, variables: [] });
      assert.typeOf(result.Store, 'object');
    });
  });

  describe('processRequest()', () => {
    function variablesHandler(e) {
      e.detail.result = Promise.resolve({
        environment: null,
        variables: [
          {
            name: 'host',
            value: 'dev.api.com',
            enabled: true,
          },
          {
            name: 'pathValue',
            value: '123456789',
            enabled: true,
          },
          {
            name: 'oauthToken',
            value: '123token',
            enabled: true,
          },
          {
            name: 'bodyVariable',
            value: 'body token',
            enabled: true,
          },
          {
            name: 'secretUsername',
            value: 'sName',
            enabled: true,
          },
          {
            name: 'secretPassword',
            value: 'sPwd',
            enabled: true,
          },
        ],
        systemVariables: {
          CWS_CLIENT_ID: 'abcdefghij-abcdefghij508.apps.googleusercontent.com'
        },
      });
    }

    before(() => {
      // emulates data model for variables
      window.addEventListener(ArcModelEventTypes.Environment.current, variablesHandler);
    });

    after(() => {
      window.removeEventListener(ArcModelEventTypes.Environment.current, variablesHandler);
    });

    describe('Processing request variables', () => {
      const id = 'test-id';
      let inst = /** @type RequestFactory */ (null);
      let request;
      beforeEach(() => {
        inst = new RequestFactory(window, jexl);
        const obj = generator.http.history({
          payload: {
            force: true,
          },
        });
        obj.url = 'http://${host}/v1/path/${pathValue}';
        obj.headers += '\nx=Authorization: Bearer ${oauthToken}';
        obj.payload += '\nvariable=${bodyVariable}';

        request = {
          id,
          request: obj,
        };
      });

      it('replaces URL variables', async () => {
        const result = await inst.processRequest(request);
        assert.equal(result.request.url, 'http://dev.api.com/v1/path/123456789');
      });

      it('replaces header variables', async () => {
        const result = await inst.processRequest(request);
        assert.include(result.request.headers, 'Authorization: Bearer 123token');
      });

      it('replaces payload variables', async () => {
        const result = await inst.processRequest(request);
        assert.include(result.request.payload, 'variable=body token');
      });

      it('ignores variables processing when disabled', async () => {
        const result = await inst.processRequest(request, {
          evaluateVariables: false,
        });
        assert.equal(result.request.url, 'http://${host}/v1/path/${pathValue}');
      });

      it('uses system variables', async () => {
        request.request.url += '?id=${CWS_CLIENT_ID}';
        const result = await inst.processRequest(request);
        assert.equal(result.request.url, 'http://dev.api.com/v1/path/123456789?id=abcdefghij-abcdefghij508.apps.googleusercontent.com');
      });

      it('ignores system variables processing when disabled', async () => {
        request.request.url += '?id=${CWS_CLIENT_ID}';
        const result = await inst.processRequest(request, {
          evaluateSystemVariables: false,
        });
        assert.equal(result.request.url, 'http://dev.api.com/v1/path/123456789?id=undefined');
      });
    });

    describe('Processing request authorization variables', () => {
      const id = 'test-id';
      /** @type RequestFactory */
      let inst;
      /** @type ArcEditorRequest */
      let request;
      beforeEach(() => {
        inst = new RequestFactory(window, jexl);
        const obj = generator.http.history({
          payload: {
            noPayload: true,
          },
        });
        obj.authorization = [];
        request = {
          id,
          request: obj,
        };
      });

      before(() => {
        ModulesRegistry.register(ModulesRegistry.request, 'request/request-authorization', RequestAuthorization, ['store']);
      });

      after(() => {
        ModulesRegistry.unregister(ModulesRegistry.request, 'request/request-authorization');
      });

      it('processes basic authorization', async () => {
        request.request.headers = '';
        const config = /** @type BasicAuthorization */ ({
          username: '{secretUsername}',
          password: '{secretPassword}',
        });
        request.request.authorization.push({
          config,
          valid: true,
          enabled: true,
          type: 'basic',
        });
        const result = await inst.processRequest(request);
        const [auth] = result.request.authorization;
        const processed = /** @type BasicAuthorization */ (auth.config);
        assert.equal(processed.username, 'sName', 'username is processed');
        assert.equal(processed.password, 'sPwd', 'password is processed');
        assert.include(result.request.headers, 'authorization: Basic c05hbWU6c1B3ZA==', 'has processed authorization value');
        assert.equal(config.username, '{secretUsername}', 'original auth config did not change');
        assert.notInclude(request.request.headers, 'authorization: Basic', 'original request did not change');
        // atob() => sName:sPwd
      });

      it('ignores basic auth when username is not defined', async () => {
        const config = /** @type BasicAuthorization */ ({
          username: undefined,
          password: '{secretPassword}',
        });
        request.request.authorization.push({
          config,
          valid: true,
          enabled: true,
          type: 'basic',
        });
        const result = await inst.processRequest(request);
        assert.notInclude(result.request.headers, 'authorization: Basic', 'processed has no authorization value');
        assert.notInclude(request.request.headers, 'authorization: Basic', 'original has no authorization value');
      });

      it('processes OAuth2 with default delivery', async () => {
        request.request.headers = '';
        const config = /** @type OAuth2Authorization */ ({
          accessToken: 'abc123',
        });
        request.request.authorization.push({
          config,
          valid: true,
          enabled: true,
          type: 'oauth 2',
        });
        const result = await inst.processRequest(request);
        assert.include(result.request.headers, 'authorization: Bearer abc123', 'has processed authorization value');
        assert.notInclude(request.request.headers, 'authorization: Bearer', 'original did not change');
      });

      it('processes OAuth2 with tokenType (header)', async () => {
        request.request.headers = '';
        const config = /** @type OAuth2Authorization */ ({
          accessToken: 'abc123',
          tokenType: 'Custom',
        });
        request.request.authorization.push({
          config,
          valid: true,
          enabled: true,
          type: 'oauth 2',
        });
        const result = await inst.processRequest(request);
        assert.include(result.request.headers, 'authorization: Custom abc123', 'has processed authorization value');
        assert.notInclude(request.request.headers, 'authorization: Custom', 'original did not change');
      });

      it('processes OAuth2 with deliveryName (header)', async () => {
        request.request.headers = '';
        const config = /** @type OAuth2Authorization */ ({
          accessToken: 'abc123',
          deliveryName: 'x-auth',
        });
        request.request.authorization.push({
          config,
          valid: true,
          enabled: true,
          type: 'oauth 2',
        });
        const result = await inst.processRequest(request);
        assert.include(result.request.headers, 'x-auth: Bearer abc123', 'has processed authorization value');
        assert.notInclude(request.request.headers, 'x-auth: Bearer', 'original did not change');
      });

      it('processes OAuth2 with query delivery', async () => {
        const config = /** @type OAuth2Authorization */ ({
          accessToken: 'abc123',
          deliveryMethod: 'query',
        });
        request.request.authorization.push({
          config,
          valid: true,
          enabled: true,
          type: 'oauth 2',
        });
        const result = await inst.processRequest(request);
        assert.include(result.request.url, 'authorization=Bearer+abc123', 'has processed authorization value');
        assert.notInclude(request.request.url, 'authorization', 'original did not change');
      });

      it('processes OAuth2 with tokenType (query)', async () => {
        const config = /** @type OAuth2Authorization */ ({
          accessToken: 'abc123',
          tokenType: 'Custom',
          deliveryMethod: 'query',
        });
        request.request.authorization.push({
          config,
          valid: true,
          enabled: true,
          type: 'oauth 2',
        });
        const result = await inst.processRequest(request);
        assert.include(result.request.url, 'authorization=Custom+abc123', 'has processed authorization value');
        assert.notInclude(request.request.url, 'authorization', 'original did not change');
      });

      it('processes OAuth2 with deliveryName (query)', async () => {
        const config = /** @type OAuth2Authorization */ ({
          accessToken: 'abc123',
          deliveryName: 'x-auth',
          deliveryMethod: 'query',
        });
        request.request.authorization.push({
          config,
          valid: true,
          enabled: true,
          type: 'oauth 2',
        });
        const result = await inst.processRequest(request);
        assert.include(result.request.url, 'x-auth=Bearer+abc123', 'has processed authorization value');
        assert.notInclude(request.request.url, 'x-auth', 'original did not change');
      });

      it('ignores OAuth2 when no accessToken', async () => {
        request.request.headers = '';
        const config = /** @type OAuth2Authorization */ ({
          accessToken: undefined,
        });
        request.request.authorization.push({
          config,
          valid: true,
          enabled: true,
          type: 'oauth 2',
        });
        const result = await inst.processRequest(request);
        assert.notInclude(result.request.headers, 'authorization', 'processed did not change');
        assert.notInclude(request.request.headers, 'authorization', 'original did not change');
      });

      it('ignores OAuth2 when not enabled', async () => {
        request.request.headers = '';
        const config = /** @type OAuth2Authorization */ ({
          accessToken: 'test',
        });
        request.request.authorization.push({
          config,
          valid: true,
          enabled: false,
          type: 'oauth 2',
        });
        const result = await inst.processRequest(request);
        assert.notInclude(result.request.headers, 'authorization', 'processed did not change');
        assert.notInclude(request.request.headers, 'authorization', 'original did not change');
      });

      it('ignores OAuth2 when no config', async () => {
        request.request.headers = '';
        request.request.authorization.push({
          config: undefined,
          valid: true,
          enabled: false,
          type: 'oauth 2',
        });
        const result = await inst.processRequest(request);
        assert.notInclude(result.request.headers, 'authorization', 'processed did not change');
        assert.notInclude(request.request.headers, 'authorization', 'original did not change');
      });

      it('ignores when no authorization', async () => {
        request.request.headers = '';
        const result = await inst.processRequest(request);
        assert.notInclude(result.request.headers, 'authorization', 'processed did not change');
        assert.notInclude(request.request.headers, 'authorization', 'original did not change');
      });

      it('processes client certificate authorization', async () => {
        request.request.clientCertificate = undefined;
        const cc = generator.certificates.requestCertificate({ noKey: true });
        /**
         * @param {CustomEvent} e
         */
        const hander = (e) => { e.detail.result = Promise.resolve(cc) };
        window.addEventListener(ArcModelEventTypes.ClientCertificate.read, hander);
        request.request.headers = '';
        const config = /** @type CCAuthorization */ ({
          id: '123'
        });
        request.request.authorization.push({
          config,
          valid: true,
          enabled: true,
          type: 'client certificate',
        });
        const result = await inst.processRequest(request);
        window.removeEventListener(ArcModelEventTypes.ClientCertificate.read, hander);
        const [auth] = result.request.authorization;
        const processed = /** @type CCAuthorization */ (auth.config);
        assert.deepEqual(processed, { id: '123' }, 'original auth did not change');
        assert.isUndefined(request.request.clientCertificate, 'original request did not change');
        const { clientCertificate } = result.request;
        assert.typeOf(clientCertificate, 'object', 'processed request has the certificate');
        assert.equal(clientCertificate.type, cc.type, 'certificate has the type');
        const cert = Array.isArray(cc.cert) ? cc.cert : [cc.cert];
        assert.deepEqual(clientCertificate.cert, cert, 'certificate has the certificate data');
        assert.isUndefined(clientCertificate.key, 'certificate has no key');
      });

      it('adds the key to the client certificate authorization', async () => {
        request.request.clientCertificate = undefined;
        const cc = generator.certificates.requestCertificate();
        /**
         * @param {CustomEvent} e
         */
        const hander = (e) => { e.detail.result = Promise.resolve(cc) };
        window.addEventListener(ArcModelEventTypes.ClientCertificate.read, hander);
        request.request.headers = '';
        const config = /** @type CCAuthorization */ ({
          id: '123'
        });
        request.request.authorization.push({
          config,
          valid: true,
          enabled: true,
          type: 'client certificate',
        });
        const result = await inst.processRequest(request);
        window.removeEventListener(ArcModelEventTypes.ClientCertificate.read, hander);
        const { clientCertificate } = result.request;
        const key = Array.isArray(cc.key) ? cc.key : [cc.key];
        assert.deepEqual(clientCertificate.key, key, 'certificate has the key data');
      });

      it('ignores certificate authorization when no id', async () => {
        request.request.clientCertificate = undefined;
        const cc = generator.certificates.requestCertificate();
        /**
         * @param {CustomEvent} e
         */
        const hander = (e) => { e.detail.result = Promise.resolve(cc) };
        window.addEventListener(ArcModelEventTypes.ClientCertificate.read, hander);
        const config = /** @type CCAuthorization */ ({
          id: undefined,
        });
        request.request.authorization.push({
          config,
          valid: true,
          enabled: true,
          type: 'client certificate',
        });
        const result = await inst.processRequest(request);
        window.removeEventListener(ArcModelEventTypes.ClientCertificate.read, hander);
        const { clientCertificate } = result.request;
        assert.isUndefined(clientCertificate);
      });

      it('ignores certificate authorization when model not accessible', async () => {
        request.request.clientCertificate = undefined;
        const config = /** @type CCAuthorization */ ({
          id: 'abc',
        });
        request.request.authorization.push({
          config,
          valid: true,
          enabled: true,
          type: 'client certificate',
        });
        const result = await inst.processRequest(request);
        const { clientCertificate } = result.request;
        assert.isUndefined(clientCertificate);
      });

      it('processes Bearer authorization', async () => {
        request.request.headers = '';
        const config = /** @type BearerAuthorization */ ({
          token: 'abc123',
        });
        request.request.authorization.push({
          config,
          valid: true,
          enabled: true,
          type: 'bearer',
        });
        const result = await inst.processRequest(request);
        assert.include(result.request.headers, 'authorization: Bearer abc123', 'has processed authorization value');
        assert.notInclude(request.request.headers, 'authorization: Bearer', 'original did not change');
      });

      it('appends Bearer token to the existing authorization', async () => {
        request.request.headers = 'authorization: Basic 1234';
        const config = /** @type BearerAuthorization */ ({
          token: 'abc123',
        });
        request.request.authorization.push({
          config,
          valid: true,
          enabled: true,
          type: 'bearer',
        });
        const result = await inst.processRequest(request);
        assert.include(result.request.headers, 'authorization: Basic 1234,Bearer abc123', 'has processed authorization value');
        assert.notInclude(request.request.headers, 'Bearer', 'original did not change');
      });
    });

    describe('processing request cookies', () => {
      /** @type ARCCookie[] */
      let cookies;
      /**
       * @param {CustomEvent} e
       */
      const handler = (e) => {
        cookies = generator.cookies.cookies(2);
        e.detail.result = Promise.resolve(cookies)
      };

      before(() => {
        ModulesRegistry.register(ModulesRegistry.request, 'arc/request/cookies', RequestCookies.processRequestCookies, ['events']);
      });

      after(() => {
        ModulesRegistry.unregister(ModulesRegistry.request, 'arc/request/cookies');
      });

      const id = 'test-id';
      /** @type RequestFactory */
      let inst;
      /** @type ArcEditorRequest */
      let request;
      beforeEach(() => {
        inst = new RequestFactory(window, jexl);
        const obj = generator.http.history({
          headers: {
            pool: ['accept', 'cache-control', 'date', 'if-match', 'if-none-match', 'accept-charset'],
          },
          payload: {
            noPayload: true,
          },
        });
        obj.headers = '';
        request = {
          id,
          request: obj,
        };
      });

      afterEach(() => {
        window.removeEventListener(SessionCookieEventTypes.listUrl, handler);
      });

      it('adds cookies to the request', async () => {
        window.addEventListener(SessionCookieEventTypes.listUrl, handler);
        const result = await inst.processRequest(request);
        const str = cookies.map(i => `${i.name}=${i.value}`).join('; ');
        assert.include(result.request.headers, `cookie: ${str}`);
        assert.notInclude(request.request.headers, `cookie:`);
      });

      it('ignores cookies when disabled in the config', async () => {
        window.addEventListener(SessionCookieEventTypes.listUrl, handler);
        request.request.config = {
          ignoreSessionCookies: true,
          enabled: true,
        };
        const result = await inst.processRequest(request);
        // const str = cookies.map(i => `${i.name}=${i.value}`).join('; ');
        assert.notInclude(result.request.headers, `cookie:`);
        assert.notInclude(request.request.headers, `cookie:`);
      });
    });
  });
});
