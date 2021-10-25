/* eslint-disable no-template-curly-in-string */
import { assert, oneEvent } from '@open-wc/testing';
import sinon from 'sinon';
import { ArcMock } from '@advanced-rest-client/arc-mock';
import { ArcModelEventTypes, SessionCookieEventTypes } from '@advanced-rest-client/events';
import { ActionsRunner } from '../../index.js';

/** @typedef {import('@advanced-rest-client/events').ArcRequest.ArcEditorRequest} ArcEditorRequest */
/** @typedef {import('@advanced-rest-client/events').ArcRequest.TransportRequest} TransportRequest */
/** @typedef {import('@advanced-rest-client/events').Actions.Action} Action */
/** @typedef {import('@advanced-rest-client/events').Actions.ActionType} ActionType */
/** @typedef {import('@advanced-rest-client/events').Actions.RunnableAction} RunnableAction */
/** @typedef {import('@advanced-rest-client/events').Actions.SetVariableConfig} SetVariableConfig */
/** @typedef {import('@advanced-rest-client/events').Actions.SetCookieConfig} SetCookieConfig */
/** @typedef {import('@advanced-rest-client/events').Actions.DeleteCookieConfig} DeleteCookieConfig */

describe('ActionsRunner', () => {
  let varHandler;
  let eventsTarget = /** @type Element */ (null);
  // @ts-ignore
  const jexl = window.Jexl;
  const generator = new ArcMock();

  before(() => {
    varHandler = (e) => {
      e.detail.result = Promise.resolve({
        environment: null,
        variables: [
          {
            name: 'var1',
            value: 'value1',
            enabled: true,
          },
          {
            name: 'var2',
            value: 'value2',
            enabled: true,
          },
          {
            name: 'var3',
            value: 'value3',
            enabled: false,
          }
        ],
      });
    };
    eventsTarget = document.createElement('div');
    document.body.appendChild(eventsTarget);
    eventsTarget.addEventListener(ArcModelEventTypes.Environment.current, varHandler);
  });

  after(() => {
    eventsTarget.removeEventListener(ArcModelEventTypes.Environment.current, varHandler);
    document.body.removeChild(eventsTarget);
    varHandler = null;
    eventsTarget = null;
  });

  describe('processRequestActions()', () => {
    /**
     * @returns {ArcEditorRequest}
     */
    function generateEditorRequest() {
      const editorRequest = generator.http.saved({
        payload: {
          force: true,
        },
        headers: {
          min: 1,
          max: 3,
        },
      });
      return {
        id: '1',
        request: editorRequest,
      }
    }

    /**
     * 
     * @param {ActionType=} type 
     * @returns {RunnableAction}
     */
    function createPassableCondition(type='request') {
      return {
        actions: [],
        enabled: true,
        type,
        condition: {
          source: 'url',
          alwaysPass: true,
        },
      };
    }

    describe('basics', () => {
      let instance = /** @type ActionsRunner */ (null);
      beforeEach(() => {
        instance = new ActionsRunner({
          jexl,
          eventsTarget,
        });
      });

      it('throws when no request', async () => {
        let thrown = false;
        try {
          await instance.processRequestActions(undefined);
        } catch (e) {
          thrown = true;
        }
        assert.isTrue(thrown);
      });

      it('returns the same request when no actions', async () => {
        const request = generateEditorRequest();
        delete request.request.actions;
        const result = await instance.processRequestActions(request);
        assert.isTrue(result === request);
      });

      it('returns the same request when no request actions', async () => {
        const request = generateEditorRequest();
        request.request.actions = {
          response: [],
        };
        const result = await instance.processRequestActions(request);
        assert.isTrue(result === request);
      });

      it('returns the same request when no enabled actions', async () => {
        const request = generateEditorRequest();
        request.request.actions = {
          request: [
            {
              actions: [],
              enabled: false,
              type: 'request',
              condition: {
                source: 'url',
              },
            }
          ],
        };
        const result = await instance.processRequestActions(request);
        assert.isTrue(result === request);
      });
    });

    describe('set-variable actions', () => {
      let instance = /** @type ActionsRunner */ (null);
      beforeEach(() => {
        instance = new ActionsRunner({
          jexl,
          eventsTarget,
        });
      });

      /**
       * 
       * @param {ActionType=} type 
       * @returns {Action}
       */
      function createBaseAction(type='request') {
        return {
          priority: 1,
          type,
          enabled: true,
          name: 'set-variable',
          failOnError: true,
          sync: true,
          view: {
            opened: false,
          },
          config: {
            name: "protocolVariable",
            source: {
              type,
              path: '',
              source: 'body',
            }
          },
        };
      }

      describe('request action', () => {
        const type = 'request';
        describe('URL source', () => {
          it('sets a variable from the request URL protocol', async () => {
            const request = generateEditorRequest();
            const condition = createPassableCondition(type);
            const action = createBaseAction(type);
            const cnf = /** @type  SetVariableConfig */ (action.config);
            cnf.source.path = 'protocol';
            cnf.source.source = 'url';
            condition.actions.push(action);
            request.request.actions = {
              request: [condition],
            };
            const spy = sinon.spy();
            eventsTarget.addEventListener(ArcModelEventTypes.Variable.set, spy);
            await instance.processRequestActions(request);
            assert.isTrue(spy.calledOnce);
            assert.equal(spy.args[0][0].name, 'protocolVariable', 'has the variable name');
            assert.match(spy.args[0][0].value, /https?:/, 'has the variable value');
          });
    
          it('sets a variable from the request URL host', async () => {
            const request = generateEditorRequest();
            const condition = createPassableCondition(type);
            const action = createBaseAction(type);
            const cnf = /** @type  SetVariableConfig */ (action.config);
            cnf.source.path = 'host';
            cnf.source.source = 'url';
            cnf.name = 'hostVariable';
            condition.actions.push(action);
            request.request.actions = {
              request: [condition],
            };
            const spy = sinon.spy();
            eventsTarget.addEventListener(ArcModelEventTypes.Variable.set, spy);
            await instance.processRequestActions(request);
            assert.isTrue(spy.calledOnce);
            assert.equal(spy.args[0][0].name, 'hostVariable', 'has the variable name');
            const host = new URL(request.request.url).hostname;
            assert.equal(spy.args[0][0].value, host, 'has the variable value');
          });
    
          it('sets a variable from the request URL path', async () => {
            const request = generateEditorRequest();
            const condition = createPassableCondition(type);
            const action = createBaseAction(type);
            const cnf = /** @type  SetVariableConfig */ (action.config);
            cnf.source.path = 'path';
            cnf.source.source = 'url';
            cnf.name = 'pathVariable';
            condition.actions.push(action);
            request.request.actions = {
              request: [condition],
            };
            const spy = sinon.spy();
            eventsTarget.addEventListener(ArcModelEventTypes.Variable.set, spy);
            await instance.processRequestActions(request);
            assert.isTrue(spy.calledOnce);
            assert.equal(spy.args[0][0].name, 'pathVariable', 'has the variable name');
            const value = new URL(request.request.url).pathname;
            assert.equal(spy.args[0][0].value, value, 'has the variable value');
          });
    
          it('sets a variable from the request URL query (full)', async () => {
            const request = generateEditorRequest();
            const condition = createPassableCondition(type);
            const action = createBaseAction(type);
            const cnf = /** @type  SetVariableConfig */ (action.config);
            cnf.source.path = 'query';
            cnf.source.source = 'url';
            cnf.name = 'fullQueryVariable';
            condition.actions.push(action);
            request.request.actions = {
              request: [condition],
            };
            request.request.url += '?a=b&c=d';
            const spy = sinon.spy();
            eventsTarget.addEventListener(ArcModelEventTypes.Variable.set, spy);
            await instance.processRequestActions(request);
            assert.isTrue(spy.calledOnce);
            assert.equal(spy.args[0][0].name, 'fullQueryVariable', 'has the variable name');
            assert.equal(spy.args[0][0].value, 'a=b&c=d', 'has the variable value');
          });
    
          it('sets a variable from the request URL query param', async () => {
            const request = generateEditorRequest();
            const condition = createPassableCondition(type);
            const action = createBaseAction(type);
            const cnf = /** @type  SetVariableConfig */ (action.config);
            cnf.source.path = 'query.a';
            cnf.source.source = 'url';
            cnf.name = 'queryVariable';
            condition.actions.push(action);
            request.request.actions = {
              request: [condition],
            };
            request.request.url += '?a=b&c=d';
            const spy = sinon.spy();
            eventsTarget.addEventListener(ArcModelEventTypes.Variable.set, spy);
            await instance.processRequestActions(request);
            assert.isTrue(spy.calledOnce);
            assert.equal(spy.args[0][0].name, 'queryVariable', 'has the variable name');
            assert.equal(spy.args[0][0].value, 'b', 'has the variable value');
          });

          it('evaluates action variables', async () => {
            const request = generateEditorRequest();
            const condition = createPassableCondition(type);
            const action = createBaseAction(type);
            const cnf = /** @type  SetVariableConfig */ (action.config);
            cnf.source.path = 'query.${var1}';
            cnf.source.source = 'url';
            cnf.name = 'queryVariable';
            condition.actions.push(action);
            request.request.actions = {
              request: [condition],
            };
            request.request.url += '?value1=variablesTest&c=d';
            const spy = sinon.spy();
            eventsTarget.addEventListener(ArcModelEventTypes.Variable.set, spy);
            await instance.processRequestActions(request);
            assert.isTrue(spy.calledOnce);
            assert.equal(spy.args[0][0].value, 'variablesTest', 'has the variable value');
          });
    
          it('sets a variable from the request URL hash (full)', async () => {
            const request = generateEditorRequest();
            const condition = createPassableCondition(type);
            const action = createBaseAction(type);
            const cnf = /** @type  SetVariableConfig */ (action.config);
            cnf.source.path = 'hash';
            cnf.source.source = 'url';
            cnf.name = 'fullHashVariable';
            condition.actions.push(action);
            request.request.actions = {
              request: [condition],
            };
            request.request.url += '#access_token=abcd&state=test';
            const spy = sinon.spy();
            eventsTarget.addEventListener(ArcModelEventTypes.Variable.set, spy);
            await instance.processRequestActions(request);
            assert.isTrue(spy.calledOnce);
            assert.equal(spy.args[0][0].name, 'fullHashVariable', 'has the variable name');
            assert.equal(spy.args[0][0].value, 'access_token=abcd&state=test', 'has the variable value');
          });
    
          it('sets a variable from the request URL query param', async () => {
            const request = generateEditorRequest();
            const condition = createPassableCondition(type);
            const action = createBaseAction(type);
            const cnf = /** @type  SetVariableConfig */ (action.config);
            cnf.source.path = 'hash.access_token';
            cnf.source.source = 'url';
            cnf.name = 'hashVariable';
            condition.actions.push(action);
            request.request.actions = {
              request: [condition],
            };
            request.request.url += '#access_token=abcd&state=test';
            const spy = sinon.spy();
            eventsTarget.addEventListener(ArcModelEventTypes.Variable.set, spy);
            await instance.processRequestActions(request);
            assert.isTrue(spy.calledOnce);
            assert.equal(spy.args[0][0].name, 'hashVariable', 'has the variable name');
            assert.equal(spy.args[0][0].value, 'abcd', 'has the variable value');
          });
        });
      
        describe('headers source', () => {
          it('sets a variable from the header value', async () => {
            const request = generateEditorRequest();
            request.request.headers += '\nx-1: test1\nx-2:test2\n';
            const condition = createPassableCondition(type);
            const action = createBaseAction(type);
            const cnf = /** @type  SetVariableConfig */ (action.config);
            cnf.source.path = 'x-1';
            cnf.source.source = 'headers';
            cnf.name = 'headerVariable';
            condition.actions.push(action);
            request.request.actions = {
              request: [condition],
            };
            const spy = sinon.spy();
            eventsTarget.addEventListener(ArcModelEventTypes.Variable.set, spy);
            await instance.processRequestActions(request);
            assert.isTrue(spy.calledOnce);
            assert.equal(spy.args[0][0].name, 'headerVariable', 'has the variable name');
            assert.equal(spy.args[0][0].value, 'test1', 'has the variable value');
          });

          it('throws when the value is not set', async () => {
            const request = generateEditorRequest();
            request.request.headers += '\nx-1: test1\nx-2:test2\n';
            const condition = createPassableCondition(type);
            const action = createBaseAction(type);
            const cnf = /** @type  SetVariableConfig */ (action.config);
            cnf.source.path = 'x-non-existing';
            cnf.source.source = 'headers';
            condition.actions.push(action);
            request.request.actions = {
              request: [condition],
            };
            let error;
            try {
              await instance.processRequestActions(request);
            } catch (e) {
              error = e.message;
            }
            assert.equal(error, 'Cannot read value for the action "set-variable"');
          });
        });

        describe('method source', () => {
          it('sets the variable from the request method', async () => {
            const request = generateEditorRequest();
            const condition = createPassableCondition(type);
            const action = createBaseAction(type);
            const cnf = /** @type  SetVariableConfig */ (action.config);
            cnf.source.source = 'method';
            cnf.name = 'methodVariable';
            condition.actions.push(action);
            request.request.actions = {
              request: [condition],
            };
            const spy = sinon.spy();
            eventsTarget.addEventListener(ArcModelEventTypes.Variable.set, spy);
            await instance.processRequestActions(request);
            assert.isTrue(spy.calledOnce);
            assert.equal(spy.args[0][0].name, 'methodVariable', 'has the variable name');
            assert.equal(spy.args[0][0].value, request.request.method, 'has the variable value');
          });
        });

        describe('body source', () => {
          // Note, tests for iterators and different body types are conducted in the data extractor tests. 
          // This makes sure the configuration is properly read.
          // If you need add a test for a particular body type, iterator, or path configuration add them in the corresponding data read test.

          it('sets the variable from the request body - simple path', async () => {
            const request = generateEditorRequest();
            request.request.headers = 'content-type: application/json';
            request.request.payload = JSON.stringify({
              deep: {
                path: {
                  to: 'value'
                }
              }
            });
            const condition = createPassableCondition(type);
            const action = createBaseAction(type);
            const cnf = /** @type  SetVariableConfig */ (action.config);
            cnf.source.source = 'body';
            cnf.source.path = 'deep.path.to';
            cnf.name = 'bodyVariable';
            condition.actions.push(action);
            request.request.actions = {
              request: [condition],
            };
            const spy = sinon.spy();
            eventsTarget.addEventListener(ArcModelEventTypes.Variable.set, spy);
            await instance.processRequestActions(request);
            assert.isTrue(spy.calledOnce);
            assert.equal(spy.args[0][0].name, 'bodyVariable', 'has the variable name');
            assert.equal(spy.args[0][0].value, 'value', 'has the variable value');
          });

          it('sets the variable from the request body - with iterator', async () => {
            const request = generateEditorRequest();
            request.request.headers = 'content-type: application/json';
            request.request.payload = JSON.stringify({
              items: [
                {
                  id: '1',
                  name: 'n1'
                },
                {
                  id: '2',
                  name: 'n2'
                }
              ]
            });
            const condition = createPassableCondition(type);
            const action = createBaseAction(type);
            const cnf = /** @type  SetVariableConfig */ (action.config);
            cnf.source.source = 'body';
            cnf.source.path = 'items.*.id';
            cnf.source.iteratorEnabled = true;
            cnf.source.iterator = {
              operator: 'equal',
              condition: 'n2',
              path: 'name'
            };
            cnf.name = 'bodyVariable';
            condition.actions.push(action);
            request.request.actions = {
              request: [condition],
            };
            const spy = sinon.spy();
            eventsTarget.addEventListener(ArcModelEventTypes.Variable.set, spy);
            await instance.processRequestActions(request);
            assert.isTrue(spy.calledOnce);
            assert.equal(spy.args[0][0].name, 'bodyVariable', 'has the variable name');
            assert.equal(spy.args[0][0].value, '2', 'has the variable value');
          });

          it('throws when the body value is not set', async () => {
            const request = generateEditorRequest();
            request.request.headers = 'content-type: application/json';
            request.request.payload = JSON.stringify({
              deep: {
                path: {
                  to: 'value'
                }
              }
            });
            const condition = createPassableCondition(type);
            const action = createBaseAction(type);
            const cnf = /** @type  SetVariableConfig */ (action.config);
            cnf.source.source = 'body';
            cnf.source.path = 'a.path.to';
            cnf.name = 'bodyVariable';
            condition.actions.push(action);
            request.request.actions = {
              request: [condition],
            };
            let error;
            try {
              await instance.processRequestActions(request);
            } catch (e) {
              error = e.message;
            }
            assert.equal(error, 'Cannot read value for the action "set-variable"');
          });

          it('ignores execution errors when not allowed', async () => {
            const request = generateEditorRequest();
            request.request.headers = 'content-type: application/json';
            request.request.payload = '';
            const condition = createPassableCondition(type);
            const action = createBaseAction(type);
            action.failOnError = false;
            const cnf = /** @type  SetVariableConfig */ (action.config);
            cnf.source.source = 'body';
            cnf.source.path = 'a.path.to';
            cnf.name = 'bodyVariable';
            condition.actions.push(action);
            request.request.actions = {
              request: [condition],
            };
            await instance.processRequestActions(request);
          });

          it('runs asynchronous action', async () => {
            const request = generateEditorRequest();
            request.request.headers = 'content-type: application/json';
            request.request.payload = JSON.stringify({
              deep: {
                path: {
                  to: 'value'
                }
              }
            });
            const condition = createPassableCondition(type);
            const action = createBaseAction(type);
            action.sync = false;
            const cnf = /** @type  SetVariableConfig */ (action.config);
            cnf.source.source = 'body';
            cnf.source.path = 'deep.path.to';
            cnf.name = 'bodyVariable';
            condition.actions.push(action);
            request.request.actions = {
              request: [condition],
            };
            instance.processRequestActions(request);
            const e = /** @type any */ (await oneEvent(eventsTarget, ArcModelEventTypes.Variable.set));
            assert.equal(e.value, 'value');
          });
        });
      
        describe('stopping actions from execution', () => {
          it('does not run actions if the condition fail', async () => {
            const request = generateEditorRequest();
            request.request.method = 'GET';
            const condition = createPassableCondition(type);
            condition.condition.alwaysPass = false;
            condition.condition.source = 'method';
            condition.condition.predictedValue = 'POST';
            condition.condition.operator = 'equal';
            const action = createBaseAction(type);
            const cnf = /** @type  SetVariableConfig */ (action.config);
            cnf.source.path = 'protocol';
            cnf.source.source = 'url';
            condition.actions.push(action);
            request.request.actions = {
              request: [condition],
            };
            const spy = sinon.spy();
            eventsTarget.addEventListener(ArcModelEventTypes.Variable.set, spy);
            await instance.processRequestActions(request);
            assert.isFalse(spy.calledOnce);
          });

          it('does not run actions when is not enabled', async () => {
            const request = generateEditorRequest();
            const condition = createPassableCondition(type);
            condition.enabled = false;
            const action = createBaseAction(type);
            const cnf = /** @type  SetVariableConfig */ (action.config);
            cnf.source.path = 'protocol';
            cnf.source.source = 'url';
            condition.actions.push(action);
            request.request.actions = {
              request: [condition],
            };
            const spy = sinon.spy();
            eventsTarget.addEventListener(ArcModelEventTypes.Variable.set, spy);
            await instance.processRequestActions(request);
            assert.isFalse(spy.calledOnce);
          });

          it('executes actions when alwaysPass is set', async () => {
            const request = generateEditorRequest();
            request.request.method = 'GET';
            const condition = createPassableCondition(type);
            condition.condition.alwaysPass = true;
            condition.condition.source = 'method';
            condition.condition.predictedValue = 'POST';
            condition.condition.operator = 'equal';
            const action = createBaseAction(type);
            const cnf = /** @type  SetVariableConfig */ (action.config);
            cnf.source.path = 'protocol';
            cnf.source.source = 'url';
            condition.actions.push(action);
            request.request.actions = {
              request: [condition],
            };
            const spy = sinon.spy();
            eventsTarget.addEventListener(ArcModelEventTypes.Variable.set, spy);
            await instance.processRequestActions(request);
            assert.isTrue(spy.calledOnce);
          });
        });
      });
    });

    describe('set-cookie actions', () => {
      let instance = /** @type ActionsRunner */ (null);
      beforeEach(() => {
        instance = new ActionsRunner({
          jexl,
          eventsTarget,
        });
      });

      /**
       * 
       * @param {ActionType=} type 
       * @returns {Action}
       */
      function createBaseAction(type='request') {
        const config = /** @type SetCookieConfig */ ({
          name: 'a-cookie',
          useRequestUrl: true,
          url: 'https://api.domain.com/v1/cookies',
          hostOnly: true,
          httpOnly: true,
          session: true,
          secure: true,
          expires: '2040-11-24T00:51:12.622Z',
          source: {
            type,
            path: '',
            source: 'body',
          }
        });
        return {
          priority: 1,
          type,
          enabled: true,
          name: 'set-cookie',
          failOnError: true,
          sync: true,
          view: {
            opened: false,
          },
          config,
        };
      }

      describe('request action', () => {
        const type = 'request';
        describe('URL source', () => {
          it('sets a cookie from a URL source', async () => {
            const request = generateEditorRequest();
            const condition = createPassableCondition(type);
            const action = createBaseAction(type);
            const cnf = /** @type  SetCookieConfig */ (action.config);
            cnf.source.path = 'hash.access_token';
            cnf.source.source = 'url';
            condition.actions.push(action);
            request.request.actions = {
              request: [condition],
            };
            request.request.url += '#access_token=abcd&state=test';
            const spy = sinon.spy();
            eventsTarget.addEventListener(SessionCookieEventTypes.update, spy);
            await instance.processRequestActions(request);
            assert.isTrue(spy.calledOnce);
            const { cookie } = spy.args[0][0];
            assert.typeOf(cookie, 'object', 'the event is dispatched');
            assert.equal(cookie.name, 'a-cookie', 'has the cookie configuration');
            assert.equal(cookie.value, 'abcd', 'has the cookie value');
          });

          it('uses the request URL', async () => {
            const request = generateEditorRequest();
            const condition = createPassableCondition(type);
            const action = createBaseAction(type);
            const cnf = /** @type  SetCookieConfig */ (action.config);
            cnf.source.source = 'url';
            condition.actions.push(action);
            request.request.actions = {
              request: [condition],
            };
            const spy = sinon.spy();
            eventsTarget.addEventListener(SessionCookieEventTypes.update, spy);
            await instance.processRequestActions(request);
            const { cookie } = spy.args[0][0];
            const url = new URL(request.request.url);
            assert.equal(cookie.domain, url.host, 'has the host part');
            assert.equal(cookie.path, url.pathname, 'has the path part');
          });

          it('uses the set URL', async () => {
            const request = generateEditorRequest();
            const condition = createPassableCondition(type);
            const action = createBaseAction(type);
            const cnf = /** @type  SetCookieConfig */ (action.config);
            cnf.source.source = 'url';
            cnf.useRequestUrl = false;
            condition.actions.push(action);
            request.request.actions = {
              request: [condition],
            };
            const spy = sinon.spy();
            eventsTarget.addEventListener(SessionCookieEventTypes.update, spy);
            await instance.processRequestActions(request);
            const { cookie } = spy.args[0][0];            
            assert.equal(cookie.domain, 'api.domain.com', 'has the host part');
            assert.equal(cookie.path, '/v1/cookies', 'has the path part');
          });
        });
        
        describe('headers source', () => {
          it('sets a cookie from the header value', async () => {
            const request = generateEditorRequest();
            request.request.headers += '\nx-1: test1\nx-2:test2\n';
            const condition = createPassableCondition(type);
            const action = createBaseAction(type);
            const cnf = /** @type  SetVariableConfig */ (action.config);
            cnf.source.path = 'x-1';
            cnf.source.source = 'headers';
            condition.actions.push(action);
            request.request.actions = {
              request: [condition],
            };
            const spy = sinon.spy();
            eventsTarget.addEventListener(SessionCookieEventTypes.update, spy);
            await instance.processRequestActions(request);
            const { cookie } = spy.args[0][0];
            assert.equal(cookie.value, 'test1', 'has the variable value');
          });

          it('throws when the value is not set', async () => {
            const request = generateEditorRequest();
            request.request.headers += '\nx-1: test1\nx-2:test2\n';
            const condition = createPassableCondition(type);
            const action = createBaseAction(type);
            const cnf = /** @type  SetVariableConfig */ (action.config);
            cnf.source.path = 'x-non-existing';
            cnf.source.source = 'headers';
            condition.actions.push(action);
            request.request.actions = {
              request: [condition],
            };
            let error;
            try {
              await instance.processRequestActions(request);
            } catch (e) {
              error = e.message;
            }
            assert.equal(error, 'Cannot read value for the action "set-cookie"');
          });
        });

        describe('body source', () => {
          // Note, tests for iterators and different body types are conducted in the data extractor tests. 
          // This makes sure the configuration is properly read.
          // If you need add a test for a particular body type, iterator, or path configuration add them in the corresponding data read test.

          it('sets the cookie from the request body', async () => {
            const request = generateEditorRequest();
            request.request.headers = 'content-type: application/json';
            request.request.payload = JSON.stringify({
              deep: {
                path: {
                  to: 'value'
                }
              }
            });
            const condition = createPassableCondition(type);
            const action = createBaseAction(type);
            const cnf = /** @type  SetVariableConfig */ (action.config);
            cnf.source.source = 'body';
            cnf.source.path = 'deep.path.to';
            condition.actions.push(action);
            request.request.actions = {
              request: [condition],
            };
            const spy = sinon.spy();
            eventsTarget.addEventListener(SessionCookieEventTypes.update, spy);
            await instance.processRequestActions(request);
            const { cookie } = spy.args[0][0];
            assert.equal(cookie.value, 'value', 'has the variable value');
          });

          it('sets the cookie from the request body - with iterator', async () => {
            const request = generateEditorRequest();
            request.request.headers = 'content-type: application/json';
            request.request.payload = JSON.stringify({
              items: [
                {
                  id: '1',
                  name: 'n1'
                },
                {
                  id: '2',
                  name: 'n2'
                }
              ]
            });
            const condition = createPassableCondition(type);
            const action = createBaseAction(type);
            const cnf = /** @type  SetVariableConfig */ (action.config);
            cnf.source.source = 'body';
            cnf.source.path = 'items.*.id';
            cnf.source.iteratorEnabled = true;
            cnf.source.iterator = {
              operator: 'equal',
              condition: 'n2',
              path: 'name'
            };
            condition.actions.push(action);
            request.request.actions = {
              request: [condition],
            };
            const spy = sinon.spy();
            eventsTarget.addEventListener(SessionCookieEventTypes.update, spy);
            await instance.processRequestActions(request);
            const { cookie } = spy.args[0][0];
            assert.equal(cookie.value, '2', 'has the variable value');
          });
        });
      });
    });

    describe('delete-cookie actions', () => {
      let instance = /** @type ActionsRunner */ (null);
      beforeEach(() => {
        instance = new ActionsRunner({
          jexl,
          eventsTarget,
        });
      });

      /**
       * 
       * @param {ActionType=} type 
       * @returns {Action}
       */
      function createBaseAction(type='request') {
        const config = /** @type DeleteCookieConfig */ ({
          useRequestUrl: true,
          url: 'https://api.comain.com/',
          removeAll: true,
          name: 'the-cookie',
        });
        return {
          priority: 1,
          type,
          enabled: true,
          name: 'delete-cookie',
          failOnError: true,
          sync: true,
          view: {
            opened: false,
          },
          config,
        };
      }

      describe('request action', () => {
        const type = 'request';
        describe('cookie url', () => {
          it('uses the current request URL', async () => {
            const request = generateEditorRequest();
            const condition = createPassableCondition(type);
            const action = createBaseAction(type);
            condition.actions.push(action);
            request.request.actions = {
              request: [condition],
            };
            const spy = sinon.spy();
            eventsTarget.addEventListener(SessionCookieEventTypes.deleteUrl, spy);
            await instance.processRequestActions(request);
            assert.isTrue(spy.calledOnce);
            const { url } = spy.args[0][0];
            assert.equal(url, request.request.url);
          });

          it('uses the set url', async () => {
            const request = generateEditorRequest();
            const condition = createPassableCondition(type);
            const action = createBaseAction(type);
            const cnf = /** @type  DeleteCookieConfig */ (action.config);
            cnf.useRequestUrl = false;
            condition.actions.push(action);
            request.request.actions = {
              request: [condition],
            };
            const spy = sinon.spy();
            eventsTarget.addEventListener(SessionCookieEventTypes.deleteUrl, spy);
            await instance.processRequestActions(request);
            const { url } = spy.args[0][0];
            assert.equal(url, 'https://api.comain.com/');
          });
        });
        
        describe('cookie name', () => {
          it('does not set name for deleting all cookies', async () => {
            const request = generateEditorRequest();
            const condition = createPassableCondition(type);
            const action = createBaseAction(type);
            condition.actions.push(action);
            request.request.actions = {
              request: [condition],
            };
            const spy = sinon.spy();
            eventsTarget.addEventListener(SessionCookieEventTypes.deleteUrl, spy);
            await instance.processRequestActions(request);
            assert.isTrue(spy.calledOnce);
            const { name } = spy.args[0][0];
            assert.isUndefined(name);
          });

          it('uses the set name', async () => {
            const request = generateEditorRequest();
            const condition = createPassableCondition(type);
            const action = createBaseAction(type);
            const cnf = /** @type  DeleteCookieConfig */ (action.config);
            cnf.removeAll = false;
            condition.actions.push(action);
            request.request.actions = {
              request: [condition],
            };
            const spy = sinon.spy();
            eventsTarget.addEventListener(SessionCookieEventTypes.deleteUrl, spy);
            await instance.processRequestActions(request);
            const { name } = spy.args[0][0];
            assert.equal(name, 'the-cookie');
          });
        });
      });
    });
  });

  describe('processResponseActions()', () => {
    const type = 'response';
    /**
     * @returns {ArcEditorRequest}
     */
    function generateEditorRequest() {
      const editorRequest = generator.http.saved({
        payload: {
          force: true,
        },
        headers: {
          min: 1,
          max: 10,
        },
      });
      return {
        id: '2',
        request: editorRequest,
      }
    }

    /**
     * @param {ArcEditorRequest} editorRequest 
     * @returns {TransportRequest}
     */
    function createTransportRequest(editorRequest) {
      const { request } = editorRequest;
      const transport = /** @type TransportRequest */ ({
        ...request,
        endTime: Date.now(),
        startTime: Date.now() - 100,
        httpMessage: `GET / HTTP 1.1`,
        payload: String(request.payload),
      });
      return transport;
    }

    /**
     * 
     * @param {ActionType=} actionType 
     * @returns {RunnableAction}
     */
    function createPassableCondition(actionType='response') {
      return {
        actions: [],
        enabled: true,
        type: actionType,
        condition: {
          source: 'url',
          alwaysPass: true,
        },
      };
    }

    describe('basics', () => {
      let instance = /** @type ActionsRunner */ (null);
      beforeEach(() => {
        instance = new ActionsRunner({
          jexl,
          eventsTarget,
        });
      });

      it('throws when no argument', async () => {
        let thrown = false;
        try {
          await instance.processResponseActions(undefined, undefined, undefined);
        } catch (e) {
          thrown = true;
        }
        assert.isTrue(thrown);
      });

      it('ignores when no actions', async () => {
        const request = generateEditorRequest();
        delete request.request.actions;
        const executed = createTransportRequest(request);
        const response = generator.http.response.arcResponse();
        const spy = sinon.spy(instance, 'evaluateAction');
        await instance.processResponseActions(request, executed, response);
        assert.isFalse(spy.called);
      });

      it('ignores when no response actions', async () => {
        const request = generateEditorRequest();
        request.request.actions = {
          request: [],
        };
        const executed = createTransportRequest(request);
        const response = generator.http.response.arcResponse();
        const spy = sinon.spy(instance, 'evaluateAction');
        await instance.processResponseActions(request, executed, response);
        assert.isFalse(spy.called);
      });

      it('ignores when no enabled actions', async () => {
        const request = generateEditorRequest();
        request.request.actions = {
          response: [
            {
              actions: [],
              enabled: false,
              type,
              condition: {
                source: 'url',
              },
            }
          ],
        };
        const executed = createTransportRequest(request);
        const response = generator.http.response.arcResponse();
        const spy = sinon.spy(instance, 'evaluateAction');
        await instance.processResponseActions(request, executed, response);
        assert.isFalse(spy.called);
      });
    });

    describe('set-variable actions', () => {
      let instance = /** @type ActionsRunner */ (null);
      beforeEach(() => {
        instance = new ActionsRunner({
          jexl,
          eventsTarget,
        });
      });

      /**
       * 
       * @param {ActionType=} actionType 
       * @returns {Action}
       */
      function createBaseAction(actionType='response') {
        return {
          priority: 1,
          type,
          enabled: true,
          name: 'set-variable',
          failOnError: true,
          sync: true,
          view: {
            opened: false,
          },
          config: {
            name: "aVariable",
            source: {
              type: actionType,
              path: '',
              source: 'body',
            }
          },
        };
      }

      it('sets a variable from the response URL query param', async () => {
        const request = generateEditorRequest();
        const condition = createPassableCondition(type);
        const action = createBaseAction(type);
        const cnf = /** @type  SetVariableConfig */ (action.config);
        cnf.source.path = 'hash.access_token';
        cnf.source.source = 'url';
        condition.actions.push(action);
        request.request.actions = {
          response: [condition],
        };
        request.request.url += '#access_token=abcd&state=test';
        const spy = sinon.spy();
        eventsTarget.addEventListener(ArcModelEventTypes.Variable.set, spy);
        const executed = createTransportRequest(request);
        const response = generator.http.response.arcResponse();
        await instance.processResponseActions(request, executed, response);
        assert.isTrue(spy.calledOnce);
        assert.equal(spy.args[0][0].name, 'aVariable', 'has the variable name');
        assert.equal(spy.args[0][0].value, 'abcd', 'has the variable value');
      });

      it('sets a variable from the request URL query param', async () => {
        const request = generateEditorRequest();
        const condition = createPassableCondition(type);
        const action = createBaseAction(type);
        const cnf = /** @type  SetVariableConfig */ (action.config);
        cnf.source.path = 'hash.access_token';
        cnf.source.source = 'url';
        cnf.source.type = 'request';
        condition.actions.push(action);
        request.request.actions = {
          response: [condition],
        };
        request.request.url += '#access_token=abcd&state=test';
        const spy = sinon.spy();
        eventsTarget.addEventListener(ArcModelEventTypes.Variable.set, spy);
        const executed = createTransportRequest(request);
        const response = generator.http.response.arcResponse();
        await instance.processResponseActions(request, executed, response);
        assert.isTrue(spy.calledOnce);
        assert.equal(spy.args[0][0].name, 'aVariable', 'has the variable name');
        assert.equal(spy.args[0][0].value, 'abcd', 'has the variable value');
      });
    });
  
    describe('set-cookie actions', () => {
      let instance = /** @type ActionsRunner */ (null);
      beforeEach(() => {
        instance = new ActionsRunner({
          jexl,
          eventsTarget,
        });
      });

      /**
       * 
       * @param {ActionType=} actionType 
       * @returns {Action}
       */
      function createBaseAction(actionType='response') {
        const config = /** @type SetCookieConfig */ ({
          name: 'a-cookie',
          useRequestUrl: true,
          url: 'https://api.domain.com/v1/cookies',
          hostOnly: true,
          httpOnly: true,
          session: true,
          secure: true,
          expires: '2040-11-24T00:51:12.622Z',
          source: {
            type: actionType,
            path: '',
            source: 'body',
          }
        });

        return {
          priority: 1,
          type,
          enabled: true,
          name: 'set-cookie',
          failOnError: true,
          sync: true,
          view: {
            opened: false,
          },
          config,
        };
      }

      it('sets the cookie from the response URL source', async () => {
        const request = generateEditorRequest();
        const condition = createPassableCondition(type);
        const action = createBaseAction(type);
        const cnf = /** @type  SetCookieConfig */ (action.config);
        cnf.source.path = 'hash.access_token';
        cnf.source.source = 'url';
        condition.actions.push(action);
        request.request.actions = {
          response: [condition],
        };
        request.request.url += '#access_token=abcd&state=test';
        const spy = sinon.spy();
        eventsTarget.addEventListener(SessionCookieEventTypes.update, spy);
        const executed = createTransportRequest(request);
        const response = generator.http.response.arcResponse();
        await instance.processResponseActions(request, executed, response);
        assert.isTrue(spy.calledOnce);
        const { cookie } = spy.args[0][0];
        assert.typeOf(cookie, 'object', 'the event is dispatched');
        assert.equal(cookie.name, 'a-cookie', 'has the cookie configuration');
        assert.equal(cookie.value, 'abcd', 'has the cookie value');
      });

      it('sets the cookie from the request URL source', async () => {
        const request = generateEditorRequest();
        const condition = createPassableCondition(type);
        const action = createBaseAction(type);
        const cnf = /** @type  SetCookieConfig */ (action.config);
        cnf.source.path = 'hash.access_token';
        cnf.source.source = 'url';
        cnf.source.type = 'request';
        condition.actions.push(action);
        request.request.actions = {
          response: [condition],
        };
        request.request.url += '#access_token=abcd&state=test';
        const spy = sinon.spy();
        eventsTarget.addEventListener(SessionCookieEventTypes.update, spy);
        const executed = createTransportRequest(request);
        const response = generator.http.response.arcResponse();
        await instance.processResponseActions(request, executed, response);
        assert.isTrue(spy.calledOnce);
        const { cookie } = spy.args[0][0];
        assert.typeOf(cookie, 'object', 'the event is dispatched');
        assert.equal(cookie.name, 'a-cookie', 'has the cookie configuration');
        assert.equal(cookie.value, 'abcd', 'has the cookie value');
      });

      it('sets the cookie from the response body', async () => {
        const request = generateEditorRequest();
        const executed = createTransportRequest(request);
        const response = generator.http.response.arcResponse();
        response.headers = 'content-type: application/json';
        response.payload = JSON.stringify({
          deep: {
            path: {
              to: 'value'
            }
          }
        });

        const condition = createPassableCondition(type);
        const action = createBaseAction(type);
        const cnf = /** @type  SetVariableConfig */ (action.config);
        cnf.source.source = 'body';
        cnf.source.path = 'deep.path.to';
        condition.actions.push(action);
        request.request.actions = {
          response: [condition],
        };
        const spy = sinon.spy();
        eventsTarget.addEventListener(SessionCookieEventTypes.update, spy);
        await instance.processResponseActions(request, executed, response);
        const { cookie } = spy.args[0][0];
        assert.equal(cookie.value, 'value', 'has the variable value');
      });

      it('sets the cookie from the request body', async () => {
        const request = generateEditorRequest();
        request.request.headers = 'content-type: application/json';
        request.request.payload = JSON.stringify({
          deep: {
            path: {
              to: 'value'
            }
          }
        });
        const executed = createTransportRequest(request);
        const response = generator.http.response.arcResponse();
        
        const condition = createPassableCondition(type);
        const action = createBaseAction('request');
        const cnf = /** @type  SetVariableConfig */ (action.config);
        cnf.source.source = 'body';
        cnf.source.path = 'deep.path.to';
        condition.actions.push(action);
        request.request.actions = {
          response: [condition],
        };
        const spy = sinon.spy();
        eventsTarget.addEventListener(SessionCookieEventTypes.update, spy);
        await instance.processResponseActions(request, executed, response);
        const { cookie } = spy.args[0][0];
        assert.equal(cookie.value, 'value', 'has the variable value');
      });

      it('throws when the body value is not set', async () => {
        const request = generateEditorRequest();
        const executed = createTransportRequest(request);
        const response = generator.http.response.arcResponse();
        response.headers = 'content-type: application/json';
        response.payload = JSON.stringify({
          deep: {
            path: {
              to: 'value'
            }
          }
        });
        const condition = createPassableCondition(type);
        const action = createBaseAction(type);
        const cnf = /** @type  SetCookieConfig */ (action.config);
        cnf.source.source = 'body';
        cnf.source.path = 'a.path.to';
        condition.actions.push(action);
        request.request.actions = {
          response: [condition],
        };
        let error;
        try {
          await instance.processResponseActions(request, executed, response);
        } catch (e) {
          error = e.message;
        }
        assert.equal(error, 'Cannot read value for the action "set-cookie"');
      });

      it('ignores execution errors when not allowed', async () => {
        const request = generateEditorRequest();
        const executed = createTransportRequest(request);
        const response = generator.http.response.arcResponse();
        response.headers = 'content-type: application/json';
        response.payload = '';
        const condition = createPassableCondition(type);
        const action = createBaseAction(type);
        action.failOnError = false;
        const cnf = /** @type  SetCookieConfig */ (action.config);
        cnf.source.source = 'body';
        cnf.source.path = 'a.path.to';
        condition.actions.push(action);
        request.request.actions = {
          response: [condition],
        };
        await instance.processResponseActions(request, executed, response);
      });

      it('runs asynchronous action', async () => {
        const request = generateEditorRequest();
        const executed = createTransportRequest(request);
        const response = generator.http.response.arcResponse();
        response.headers = 'content-type: application/json';
        response.payload = JSON.stringify({
          deep: {
            path: {
              to: 'value'
            }
          }
        });
        const condition = createPassableCondition(type);
        const action = createBaseAction(type);
        action.sync = false;
        const cnf = /** @type  SetCookieConfig */ (action.config);
        cnf.source.source = 'body';
        cnf.source.path = 'deep.path.to';
        condition.actions.push(action);
        request.request.actions = {
          response: [condition],
        };
        instance.processResponseActions(request, executed, response);
        const e = /** @type any */ (await oneEvent(eventsTarget, SessionCookieEventTypes.update));
        const { cookie } = e;
        assert.equal(cookie.value, 'value');
      });
    });
  });
});
