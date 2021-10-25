import { assert } from '@open-wc/testing';
import { ActionCondition } from '../../index.js';

/** @typedef {import('@advanced-rest-client/events').ArcRequest.ArcBaseRequest} ArcBaseRequest */
/** @typedef {import('@advanced-rest-client/events').ArcRequest.TransportRequest} TransportRequest */
/** @typedef {import('@advanced-rest-client/events').ArcResponse.Response} Response */
/** @typedef {import('@advanced-rest-client/events').Actions.Condition} Condition */
/** @typedef {import('@advanced-rest-client/events').Actions.RunnableAction} RunnableAction */

describe('ActionCondition', () => {
  describe('satisfied()', () => {
    const jsonStr = `{
      "nextPageToken": "test-token",
      "data": [{
        "name": "test1",
        "numeric": 1
      }, {
        "name": "test2",
        "arr": ["a", 1]
      }, {
        "name": "test3",
        "value": "array",
        "deep": {
          "booleanValue": true,
          "nullValue": null,
          "numberValue": 2,
          "arrayValue": ["test1", "test2"]
        }
      }]
    }`;


    let request = /** @type ArcBaseRequest */(null);
    let executed = /** @type TransportRequest */(null);
    let response = /** @type Response */(null);
    before(() => {
      request = {
        url: '/',
        method: 'GET',
        headers: `Connection: keep-alive\ncookie: a=b\naccept: */*`,
      };
      executed = {
        url: '/',
        method: 'GET',
        httpMessage: '',
        startTime: Date.now() - 100,
        endTime: Date.now(),
        headers: `Connection: keep-alive\ncookie: a=b\naccept: */*`,
      };
      response = {
        payload: jsonStr,
        headers: 'content-type: application/json\nx-custom: true\nset-cookie: a=b',
        loadingTime: 100,
        status: 200,
      };
    });

    describe('equal op', () => {
      const condition = /** @type Condition */ ({
        source: 'body',
        type: 'response',
        path: 'data.2.value',
        operator: 'equal',
        predictedValue: 'array',
      });

      let instance = /** @type ActionCondition */ (null);

      beforeEach(() => {
        instance = new ActionCondition({
          condition,
          type: 'response',
          actions: [],
          enabled: true,
        });
      });

      it('true action', () => {
        const result = instance.satisfied(request, executed, response);
        assert.isTrue(result);
      });

      it('false action', () => {
        instance.condition.predictedValue = 'other';
        const result = instance.satisfied(request, executed, response);
        assert.isFalse(result);
      });
    });

    describe('not equal op', () => {
      const condition = /** @type Condition */ ({
        source: 'body',
        type: 'response',
        path: 'data.2.value',
        operator: 'not-equal',
        predictedValue: 'other',
      });

      let instance = /** @type ActionCondition */ (null);

      beforeEach(async () => {
        instance = new ActionCondition({
          condition,
          type: 'response',
          actions: [],
          enabled: true,
        });
      });

      it('true for action', () => {
        const result = instance.satisfied(request, executed, response);
        assert.isTrue(result);
      });

      it('false for action', () => {
        instance.condition.predictedValue = 'array';
        const result = instance.satisfied(request, executed, response);
        assert.isFalse(result);
      });
    });

    describe('less than op', () => {
      const condition = /** @type Condition */ ({
        source: 'body',
        type: 'response',
        path: 'data.0.numeric',
        operator: 'less-than',
        predictedValue: '2',
      });
      let instance = /** @type ActionCondition */ (null);

      beforeEach(async () => {
        instance = new ActionCondition({
          condition,
          type: 'response',
          actions: [],
          enabled: true,
        });
      });

      it('true for action', () => {
        const result = instance.satisfied(request, executed, response);
        assert.isTrue(result);
      });

      it('false for action', () => {
        instance.condition.predictedValue = 0;
        const result = instance.satisfied(request,executed, response);
        assert.isFalse(result);
      });
    });

    describe('less than or equal op', () => {
      const condition = /** @type Condition */ ({
        source: 'body',
        type: 'response',
        path: 'data.0.numeric',
        operator: 'less-than-equal',
        predictedValue: '1',
      });
      let instance = /** @type ActionCondition */ (null);

      beforeEach(async () => {
        instance = new ActionCondition({
          condition,
          type: 'response',
          actions: [],
          enabled: true,
        });
      });

      it('true for action', () => {
        const result = instance.satisfied(request, executed, response);
        assert.isTrue(result);
      });

      it('false for action', () => {
        instance.condition.predictedValue = 0;
        const result = instance.satisfied(request, executed, response);
        assert.isFalse(result);
      });
    });

    describe('greater than op', () => {
      const condition = /** @type Condition */ ({
        source: 'body',
        type: 'response',
        path: 'data.0.numeric',
        operator: 'greater-than',
        predictedValue: '0'
      })
      let instance = /** @type ActionCondition */ (null);

      beforeEach(async () => {
        instance = new ActionCondition({
          condition,
          type: 'response',
          actions: [],
          enabled: true,
        });
      });

      it('true for action', () => {
        const result = instance.satisfied(request, executed, response);
        assert.isTrue(result);
      });

      it('false for action', () => {
        instance.condition.predictedValue = 2;
        const result = instance.satisfied(request, executed, response);
        assert.isFalse(result);
      });
    });

    describe('greater than or equal op', () => {
      const condition = /** @type Condition */ ({
        source: 'body',
        type: 'response',
        path: 'data.0.numeric',
        operator: 'greater-than-equal',
        predictedValue: '1'
      });

      let instance = /** @type ActionCondition */ (null);

      beforeEach(async () => {
        instance = new ActionCondition({
          condition,
          type: 'response',
          actions: [],
          enabled: true,
        });
      });

      it('true for action', () => {
        const result = instance.satisfied(request, executed, response);
        assert.isTrue(result);
      });

      it('false for action', () => {
        instance.condition.predictedValue = 2;
        const result = instance.satisfied(request, executed, response);
        assert.isFalse(result);
      });
    });
  
    describe('contains op', () => {
      describe('String', () => {
        const condition = /** @type Condition */ ({
          source: 'body',
          type: 'response',
          path: 'nextPageToken',
          operator: 'contains',
          predictedValue: 'token'
        });

        let instance = /** @type ActionCondition */ (null);
        beforeEach(async () => {
          instance = new ActionCondition({
            condition,
            type: 'response',
            actions: [],
            enabled: true,
          });
        });

        it('true for action', () => {
          const result = instance.satisfied(request, executed, response);
          assert.isTrue(result);
        });

        it('false for action', () => {
          instance.condition.predictedValue = 'hello';
          const result = instance.satisfied(request, executed, response);
          assert.isFalse(result);
        });
      });

      describe('Array', () => {
        const condition = /** @type Condition */ ({
          source: 'body',
          type: 'response',
          path: 'data.1.arr',
          operator: 'contains',
          predictedValue: 'a'
        });
        let instance = /** @type ActionCondition */ (null);
        beforeEach(async () => {
          instance = new ActionCondition({
            condition,
            type: 'response',
            actions: [],
            enabled: true,
          });
        });

        it('true for action', () => {
          const result = instance.satisfied(request, executed, response);
          assert.isTrue(result);
        });

        it('false for action', () => {
          instance.condition.predictedValue = 'b';
          const result = instance.satisfied(request, executed, response);
          assert.isFalse(result);
        });
      });

      describe('Object', () => {
        const condition = /** @type Condition */ ({
          source: 'body',
          type: 'response',
          path: '',
          operator: 'contains',
          predictedValue: 'nextPageToken',
        });

        let instance = /** @type ActionCondition */ (null);
        beforeEach(async () => {
          instance = new ActionCondition({
            condition,
            type: 'response',
            actions: [],
            enabled: true,
          });
        });

        it('true for action', () => {
          const result = instance.satisfied(request, executed, response);
          assert.isTrue(result);
        });

        it('false for action', () => {
          instance.condition.predictedValue = 'nextPageTokenNot';
          const result = instance.satisfied(request, executed, response);
          assert.isFalse(result);
        });
      });
    });

    describe('regexp op', () => {
      const condition = /** @type Condition */ ({
        source: 'body',
        type: 'response',
        path: 'nextPageToken',
        operator: 'regex',
        predictedValue: 'test-token'
      });
      let instance = /** @type ActionCondition */ (null);
      beforeEach(async () => {
        instance = new ActionCondition({
          condition,
          type: 'response',
          actions: [],
          enabled: true,
        });
      });

      it('true for action', () => {
        const result = instance.satisfied(request, executed, response);
        assert.isTrue(result);
      });

      it('false for action', () => {
        instance.condition.predictedValue = 'other-token';
        const result = instance.satisfied(request, executed, response);
        assert.isFalse(result);
      });
    });
  
    describe('disabled condition', () => {
      const condition = /** @type Condition */ ({
        source: 'body',
        type: 'response',
        path: 'data.2.value',
        operator: 'equal',
        predictedValue: 'array',
        alwaysPass: true,
      });

      let instance = /** @type ActionCondition */ (null);

      beforeEach(() => {
        instance = new ActionCondition({
          condition,
          type: 'response',
          actions: [],
          enabled: false,
        });
      });

      it('is always returns false', () => {
        const result = instance.satisfied(request, executed, response);
        assert.isFalse(result);
      });
    });

    describe('always pass option', () => {
      const condition = /** @type Condition */ ({
        source: 'body',
        type: 'response',
        path: 'data.2.value',
        operator: 'equal',
        predictedValue: 'none-existing',
        alwaysPass: true,
      });

      let instance = /** @type ActionCondition */ (null);

      beforeEach(() => {
        instance = new ActionCondition({
          condition,
          type: 'response',
          actions: [],
          enabled: true,
        });
      });

      it('is returns true', () => {
        const result = instance.satisfied(request, executed, response);
        assert.isTrue(result);
      });
    });
  
    describe('status code', () => {
      const condition = /** @type Condition */ ({
        type: 'response',
        source: 'status',
        operator: 'equal',
        predictedValue: '200',
      });

      let instance = /** @type ActionCondition */ (null);

      beforeEach(() => {
        instance = new ActionCondition({
          condition,
          type: 'response',
          actions: [],
          enabled: true,
        });
      });

      it('returns true when the response has the status', () => {
        const result = instance.satisfied(request, executed, response);
        assert.isTrue(result);
      });

      it('returns false when the response has different status', () => {
        instance.condition.predictedValue = '301';
        const result = instance.satisfied(request, executed, response);
        assert.isFalse(result);
      });
    });

    describe('request headers', () => {
      const condition = /** @type Condition */ ({
        type: 'request',
        source: 'headers',
        path: 'accept',
        operator: 'equal',
        predictedValue: '*/*',
      });

      let instance = /** @type ActionCondition */ (null);

      beforeEach(() => {
        instance = new ActionCondition({
          condition,
          type: 'response',
          actions: [],
          enabled: true,
        });
      });

      it('returns true when the request has the header', () => {
        const result = instance.satisfied(request, executed, response);
        assert.isTrue(result);
      });

      it('returns false when the request does not have the header', () => {
        instance.condition.path = 'x-custom';
        const result = instance.satisfied(request, executed, response);
        assert.isFalse(result);
      });

      it('returns false when the request header has different value', () => {
        instance.condition.path = 'accept';
        instance.condition.predictedValue = 'other';
        const result = instance.satisfied(request, executed, response);
        assert.isFalse(result);
      });
    });

    describe('response headers', () => {
      const condition = /** @type Condition */ ({
        type: 'response',
        source: 'headers',
        path: 'set-cookie',
        operator: 'contains',
        predictedValue: 'a=b',
      });

      let instance = /** @type ActionCondition */ (null);

      beforeEach(() => {
        instance = new ActionCondition({
          condition,
          type: 'response',
          actions: [],
          enabled: true,
        });
      });

      it('returns true when the response has the header', () => {
        const result = instance.satisfied(request, executed, response);
        assert.isTrue(result);
      });

      it('returns false when the request does not have the header', () => {
        instance.condition.path = 'x-non-existing';
        const result = instance.satisfied(request, executed, response);
        assert.isFalse(result);
      });

      it('returns false when the request header has different value', () => {
        instance.condition.path = 'set-cookie';
        instance.condition.predictedValue = 'other';
        const result = instance.satisfied(request, executed, response);
        assert.isFalse(result);
      });
    });
  });

  describe('defaultCondition()', () => {
    it('returns an object', () => {
      const result = ActionCondition.defaultCondition();
      assert.typeOf(result, 'object');
    });

    it('has the default type', () => {
      const result = ActionCondition.defaultCondition();
      assert.equal(result.type, 'response');
    });

    it('has the passed type', () => {
      const result = ActionCondition.defaultCondition('request');
      assert.equal(result.type, 'request');
    });

    it('has the default source', () => {
      const result = ActionCondition.defaultCondition();
      assert.equal(result.source, 'url');
    });

    it('has the default operator', () => {
      const result = ActionCondition.defaultCondition();
      assert.equal(result.operator, 'equal');
    });

    it('has the default alwaysPass', () => {
      const result = ActionCondition.defaultCondition();
      assert.equal(result.alwaysPass, false);
    });

    it('has the default path', () => {
      const result = ActionCondition.defaultCondition();
      assert.equal(result.path, '');
    });

    it('has the default predictedValue', () => {
      const result = ActionCondition.defaultCondition();
      assert.equal(result.predictedValue, '');
    });

    it('has the default view object', () => {
      const result = ActionCondition.defaultCondition();
      assert.deepEqual(result.view, { opened: true });
    });
  });

  describe('defaultAction()', () => {
    it('returns an object', () => {
      const result = ActionCondition.defaultAction();
      assert.typeOf(result, 'object');
    });

    it('has the default type', () => {
      const result = ActionCondition.defaultAction();
      assert.equal(result.type, 'response');
    });

    it('has the passed type', () => {
      const result = ActionCondition.defaultAction('request');
      assert.equal(result.type, 'request');
    });

    it('has the default name', () => {
      const result = ActionCondition.defaultAction();
      assert.equal(result.name, 'New action');
    });

    it('has the default config object', () => {
      const result = ActionCondition.defaultAction();
      assert.deepEqual(result.config, {
        source: {
          type: 'response',
          source: 'body',
        },
        name: '',
      });
    });

    it('has the default failOnError', () => {
      const result = ActionCondition.defaultAction();
      assert.equal(result.failOnError, false);
    });

    it('has the default priority', () => {
      const result = ActionCondition.defaultAction();
      assert.equal(result.priority, 0);
    });

    it('has the default sync', () => {
      const result = ActionCondition.defaultAction();
      assert.equal(result.sync, false);
    });

    it('has the default view object', () => {
      const result = ActionCondition.defaultAction();
      assert.deepEqual(result.view, { });
    });

    it('has the default enabled', () => {
      const result = ActionCondition.defaultAction();
      assert.equal(result.enabled, true);
    });    
  });

  describe('importExternal()', () => {
    it('creates a copy of self', () => {
      const action = new ActionCondition({
        actions: [],
        condition: {
          source: 'url',
        },
        enabled: false,
        type: 'request'
      });
      const result = ActionCondition.importExternal([action]);
      assert.deepEqual(result[0], action);
    });

    it('creates a copy of a configuration', () => {
      const action = {
        actions: [],
        condition: {
          source: 'url',
        },
        enabled: false,
        type: 'request'
      };
      // @ts-ignore
      const result = ActionCondition.importExternal([action]);
      assert.deepEqual(result[0], action);
    });
  });

  describe('importAction()', () => {
    it('creates a copy of self', () => {
      const action = new ActionCondition({
        actions: [],
        condition: {
          source: 'url',
        },
        enabled: false,
        type: 'request'
      });
      const result = ActionCondition.importAction(action);
      assert.deepEqual(result, action);
    });

    it('creates a copy of a configuration', () => {
      const action = {
        actions: [],
        condition: {
          source: 'url',
        },
        enabled: false,
        type: 'request'
      };
      // @ts-ignore
      const result = ActionCondition.importAction(action);
      assert.deepEqual(result, action);
    });
  });

  describe('constructor()', () => {
    const action = /** @type RunnableAction */ ({
      actions: [
        {
          type: 'request',
          priority: 1,
        }
      ],
      condition: {
        source: 'url',
      },
      enabled: true,
      type: 'request'
    });

    it('sets a copy of the condition', () => {
      const instance = new ActionCondition(action);
      assert.deepEqual(instance.condition, action.condition, 'the condition is set');
      instance.condition.alwaysPass = true;
      assert.isUndefined(action.condition.alwaysPass, 'the condition is a copy');
    });

    it('sets the type', () => {
      const instance = new ActionCondition(action);
      assert.equal(instance.type, action.type);
    });

    it('sets the actions', () => {
      const instance = new ActionCondition(action);
      assert.lengthOf(instance.actions, 1, 'has the action');
      assert.equal(instance.actions[0].priority, 1, 'has defined value');
    });

    it('sets the passed enabled', () => {
      const instance = new ActionCondition(action);
      assert.isTrue(instance.enabled);
    });

    it('sets default enabled', () => {
      const init = { ...action };
      delete init.enabled;
      const instance = new ActionCondition(init);
      assert.isFalse(instance.enabled);
    });
  });

  describe('add()', () => {
    let instance = /** @type ActionCondition */ (null);

    beforeEach(() => {
      instance = new ActionCondition({
        condition: {
          source: 'url',
        },
        type: 'response',
        actions: [],
        enabled: true,
      });
    });

    it('add a default action', () => {
      instance.add('test name');
      assert.lengthOf(instance.actions, 1, 'has the new action');
    });

    it('sets the name', () => {
      instance.add('test name');
      assert.equal(instance.actions[0].name, 'test name');
    });
  });

  describe('clone()', () => {
    let instance = /** @type ActionCondition */ (null);

    beforeEach(() => {
      instance = new ActionCondition({
        condition: {
          source: 'url',
        },
        type: 'response',
        actions: [],
        enabled: true,
      });
    });

    it('creates a copy', () => {
      const result = instance.clone();
      assert.deepEqual(result, instance);
    });

    it('clones actions', () => {
      instance.add('test');
      const result = instance.clone();
      assert.lengthOf(result.actions, 1, 'clone has the action');
      assert.equal(result.actions[0].name, 'test', 'the action has cloned properties');
      instance.actions[0].name = 'other';
      assert.equal(result.actions[0].name, 'test', 'the action is a copy');
    });
  });
});
