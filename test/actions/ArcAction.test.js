import { assert } from '@open-wc/testing';
import { ArcAction } from '../../index.js';
import { mapActions, sortActions } from '../../src/lib/actions/ArcAction.js';

/** @typedef {import('@advanced-rest-client/events').ArcRequest.ArcBaseRequest} ArcBaseRequest */
/** @typedef {import('@advanced-rest-client/events').ArcRequest.TransportRequest} TransportRequest */
/** @typedef {import('@advanced-rest-client/events').ArcResponse.Response} Response */
/** @typedef {import('@advanced-rest-client/events').Actions.Condition} Condition */
/** @typedef {import('@advanced-rest-client/events').Actions.RunnableAction} RunnableAction */

describe('ArcAction', () => {
  describe('constructor()', () => {
    const actionInit = Object.freeze({ 
      type: 'request', 
      priority: 100, 
      config: { name: 'test' }, 
      name: 'test-name', 
      enabled: true, 
      failOnError: false, 
      sync: false, 
      view: { opened: false} 
    });

    it('sets default type', () => {
      // @ts-ignore
      const action = new ArcAction({});
      assert.equal(action.type, 'request');
    });

    it('uses passed type', () => {
      // @ts-ignore
      const action = new ArcAction(actionInit);
      assert.equal(action.type, 'request');
    });

    it('sets default name', () => {
      // @ts-ignore
      const action = new ArcAction({});
      assert.equal(action.name, null);
    });

    it('uses passed name', () => {
      // @ts-ignore
      const action = new ArcAction(actionInit);
      assert.equal(action.name, 'test-name');
    });

    it('sets default enabled', () => {
      // @ts-ignore
      const action = new ArcAction({});
      assert.equal(action.enabled, false);
    });

    it('uses passed enabled', () => {
      // @ts-ignore
      const action = new ArcAction(actionInit);
      assert.equal(action.enabled, true);
    });

    it('sets default priority', () => {
      // @ts-ignore
      const action = new ArcAction({});
      assert.equal(action.priority, 1);
    });

    it('uses passed priority', () => {
      // @ts-ignore
      const action = new ArcAction(actionInit);
      assert.equal(action.priority, 100);
    });

    it('sets default config', () => {
      // @ts-ignore
      const action = new ArcAction({});
      assert.deepEqual(action.config, {});
    });

    it('uses passed config', () => {
      // @ts-ignore
      const action = new ArcAction(actionInit);
      assert.deepEqual(action.config, actionInit.config);
    });

    it('sets default sync', () => {
      // @ts-ignore
      const action = new ArcAction({});
      assert.equal(action.sync, true);
    });

    it('uses passed sync', () => {
      // @ts-ignore
      const action = new ArcAction(actionInit);
      assert.equal(action.sync, false);
    });

    it('sets default failOnError', () => {
      // @ts-ignore
      const action = new ArcAction({});
      assert.equal(action.failOnError, true);
    });

    it('uses passed failOnError', () => {
      // @ts-ignore
      const action = new ArcAction(actionInit);
      assert.equal(action.failOnError, false);
    });

    it('sets default view', () => {
      // @ts-ignore
      const action = new ArcAction({});
      assert.deepEqual(action.view, { opened: true });
    });

    it('uses passed view', () => {
      // @ts-ignore
      const action = new ArcAction(actionInit);
      assert.deepEqual(action.view, actionInit.view);
    });
  });

  describe('clone()', () => {
    const actionInit = Object.freeze({ 
      type: 'request', 
      priority: 100, 
      config: { name: 'test' }, 
      name: 'test-name', 
      enabled: true, 
      failOnError: false, 
      sync: false, 
      view: { opened: false} 
    });

    let source = /** @type ArcAction */ (null);
    // @ts-ignore
    beforeEach(() => { source = new ArcAction(actionInit) });

    it('returns a new object', () => {
      const result = source.clone();
      assert.typeOf(result, 'object', 'returns an object');
      assert.isFalse(result === source, 'it is not the same object');
    });

    it('copies the name property', () => {
      const result = source.clone();
      assert.equal(result.name, actionInit.name, 'has the same value');
    });

    it('copies the type property', () => {
      const result = source.clone();
      assert.equal(result.type, actionInit.type, 'has the same value');
    });

    it('copies the enabled property', () => {
      const result = source.clone();
      assert.equal(result.enabled, actionInit.enabled, 'has the same value');
    });

    it('copies the priority property', () => {
      const result = source.clone();
      assert.equal(result.priority, actionInit.priority, 'has the same value');
    });

    it('copies the sync property', () => {
      const result = source.clone();
      assert.equal(result.sync, actionInit.sync, 'has the same value');
    });

    it('copies the failOnError property', () => {
      const result = source.clone();
      assert.equal(result.failOnError, actionInit.failOnError, 'has the same value');
    });

    it('copies the config property', () => {
      const result = source.clone();
      assert.deepEqual(result.config, actionInit.config, 'has the same value');
      // @ts-ignore
      source.config.source = 'test';
      // @ts-ignore
      assert.isUndefined(result.config.source, 'is a copy');
    });

    it('copies the view property', () => {
      const result = source.clone();
      assert.deepEqual(result.view, actionInit.view, 'has the same value');
      // @ts-ignore
      source.view.source = 'test';
      // @ts-ignore
      assert.isUndefined(result.view.source, 'is a copy');
    });
  });

  describe('toJSON()', () => {
    const actionInit = Object.freeze({ 
      type: 'request', 
      priority: 100, 
      config: { name: 'test' }, 
      name: 'test-name', 
      enabled: true, 
      failOnError: false, 
      sync: false, 
      view: { opened: false} 
    });

    let source = /** @type ArcAction */ (null);
    // @ts-ignore
    beforeEach(() => { source = new ArcAction(actionInit) });

    it('has the type', () => {
      const result = JSON.stringify(source);
      const decoded = JSON.parse(result);
      assert.equal(decoded.type, actionInit.type);
    });

    it('has the type', () => {
      const result = JSON.stringify(source);
      const decoded = JSON.parse(result);
      assert.equal(decoded.type, actionInit.type);
    });

    it('has the name', () => {
      const result = JSON.stringify(source);
      const decoded = JSON.parse(result);
      assert.equal(decoded.name, actionInit.name);
    });

    it('has the type', () => {
      const result = JSON.stringify(source);
      const decoded = JSON.parse(result);
      assert.equal(decoded.type, actionInit.type);
    });

    it('has the enabled', () => {
      const result = JSON.stringify(source);
      const decoded = JSON.parse(result);
      assert.equal(decoded.enabled, actionInit.enabled);
    });

    it('has the priority', () => {
      const result = JSON.stringify(source);
      const decoded = JSON.parse(result);
      assert.equal(decoded.priority, actionInit.priority);
    });

    it('has the sync', () => {
      const result = JSON.stringify(source);
      const decoded = JSON.parse(result);
      assert.equal(decoded.sync, actionInit.sync);
    });

    it('has the failOnError', () => {
      const result = JSON.stringify(source);
      const decoded = JSON.parse(result);
      assert.equal(decoded.failOnError, actionInit.failOnError);
    });

    it('has the config', () => {
      const result = JSON.stringify(source);
      const decoded = JSON.parse(result);
      assert.deepEqual(decoded.config, actionInit.config);
    });

    it('has the view', () => {
      const result = JSON.stringify(source);
      const decoded = JSON.parse(result);
      assert.deepEqual(decoded.view, actionInit.view);
    });
  });

  describe('mapActions()', () => {
    const actionInit = Object.freeze({ 
      type: 'request', 
      priority: 100, 
      config: { name: 'test' }, 
      name: 'test-name', 
      enabled: true, 
      failOnError: false, 
      sync: false, 
      view: { opened: false} 
    });

    it('it returns instance of an action', () => {
      // @ts-ignore
      const result = mapActions([actionInit]);
      assert.typeOf(result, 'array', 'returns an array of actions');
      assert.lengthOf(result, 1, 'returns a single action');
      assert.equal(result[0].name, actionInit.name, 'has the action definition');
    });

    it('returns empty array when no argument', () => {
      const result = mapActions(null);
      assert.typeOf(result, 'array', 'returns an array of actions');
      assert.lengthOf(result, 0, 'returns empty array');
    });
  });

  describe('sortActions()', () => {
    let a1 = /** @type ArcAction */ (null);
    let a2 = /** @type ArcAction */ (null);
    let a3 = /** @type ArcAction */ (null);
    let a4 = /** @type ArcAction */ (null);
    beforeEach(() => {
      a1 = new ArcAction({ priority: 2, type: 'response', name: 'p2' });
      a2 = new ArcAction({ priority: 3, type: 'response', name: 'p3' });
      a3 = new ArcAction({ priority: 1, type: 'request', name: 'p1' });
      a4 = new ArcAction({ priority: 3, type: 'request', name: 'p4' });
    });
    

    it('sorts the action in the ascending order', () => {
      const arr = [a1, a2, a3, a4];
      arr.sort(sortActions);
      assert.equal(arr[0].name, 'p1');
      assert.equal(arr[1].name, 'p2');
      assert.equal(arr[2].name, 'p3');
      assert.equal(arr[3].name, 'p4');
    });
  });
});
