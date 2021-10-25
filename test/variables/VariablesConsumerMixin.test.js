/* eslint-disable arrow-body-style */
/* eslint-disable prefer-destructuring */
import { assert, defineCE, fixture, aTimeout, nextFrame } from '@open-wc/testing';
import { ArcMock } from '@advanced-rest-client/arc-mock';
import { MockedStore, VariablesModel } from '@advanced-rest-client/idb-store';
import sinon from 'sinon';
import { LitElement } from 'lit-element';
import { ArcModelEvents, ArcModelEventTypes, ConfigEventTypes, ConfigEvents, ImportEvents } from '@advanced-rest-client/events';
import { VariablesConsumerMixin } from '../../index.js';
import { systemVariablesModel, systemVariablesValue } from '../../src/elements/variables/VariablesConsumerMixin.js';
import { resetSelection } from './ModelUtils.js';

/** @typedef {import('@advanced-rest-client/events').Variable.ARCVariable} ARCVariable */
/** @typedef {import('@advanced-rest-client/events').Variable.ARCEnvironment} ARCEnvironment */

const tag = defineCE(
  class extends VariablesConsumerMixin(LitElement) {
  },
);

/** @typedef {VariablesConsumerMixin & LitElement} VariablesConsumer */

describe('VariablesConsumerMixin', () => {
  const generator = new ArcMock();
  const store = new MockedStore();
  const model = new VariablesModel();

  before(() => {
    model.listen(window);
  });

  after(() => {
    model.unlisten(window);
  });

  /**
   * @returns {Promise<VariablesConsumer>}
   */
  async function basicFixture() {
    return fixture(`<${tag}></${tag}>`);
  }

  /**
   * 
   * @param {number=} size 
   * @returns {ARCEnvironment[]}
   */
  function generateEnvironments(size=10) {
    return new Array(size).fill(0).map(() => {
      return /** @type ARCEnvironment */ ({
        name: generator.lorem.sentence({ words: 2 }),
        created: generator.types.datetime().getTime(),
        _id: generator.types.uuid(),
        _rev: generator.types.uuid(),
      });
    });
  }

  describe('refreshEnvironment()', () => {
    let element = /** @type VariablesConsumer */ (null);
    let createdDefault = /** @type ARCVariable[] */ (null);
    let createdRandom = /** @type ARCVariable[] */ (null);
    before(async () => {
      await resetSelection();
      createdDefault = await store.insertVariablesAndEnvironments(5, {
        defaultEnv: true,
      });
      createdRandom = await store.insertVariablesAndEnvironments(5, {
        randomEnv: true,
      });
    });

    after(async () => {
      await resetSelection();
      await store.destroyVariables();
    });
    
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('reads data for the default environment', async () => {
      await element.refreshEnvironment();
      assert.equal(element.environment, null, 'environment is null');
      assert.lengthOf(element.variables, createdDefault.length, 'has all variables');
    });

    it('reads data for a created environment', async () => {
      const envs = await store.getDatastoreEnvironmentsData();
      const [env] = envs;
      
      model.currentEnvironment = env._id;
      await element.refreshEnvironment();
      assert.deepEqual(element.environment, env, 'environment is set');
      const envVars = createdRandom.filter((item) => item.environment === env.name);
      assert.lengthOf(element.variables, envVars.length, 'has all variables');
    });
  });

  describe('refreshEnvironments()', () => {
    let element = /** @type VariablesConsumer */ (null);
    before(async () => {
      await store.insertVariablesAndEnvironments(5, {
        randomEnv: true,
      });
    });

    after(async () => {
      await store.destroyVariables();
    });
    
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('has no environments by default', async () => {
      assert.isUndefined(element.environments);
    });

    it('sets the environments from the store', async () => {
      await element.refreshEnvironments();
      assert.typeOf(element.environments, 'array');
    });
  });

  describe('selectEnvironment()', () => {
    let element = /** @type VariablesConsumer */ (null);
    let envs = /** @type ARCEnvironment[] */ (null);
    before(async () => {
      await store.insertVariablesAndEnvironments(5, {
        randomEnv: true,
      });
      envs = await store.getDatastoreEnvironmentsData();
      assert.isAbove(envs.length, 0);
    });

    after(async () => {
      await store.destroyVariables();
      await resetSelection();
    });
    
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('has no effect when selecting default over default', async () => {
      const spy = sinon.spy();
      element.addEventListener(ArcModelEventTypes.Environment.select, spy);
      element.selectEnvironment();
      assert.isFalse(spy.called);
    });

    it('has no effect when selecting already selected environment', async () => {
      const spy = sinon.spy();
      element.addEventListener(ArcModelEventTypes.Environment.select, spy);
      element.environment = envs[0];
      element.selectEnvironment(envs[0]._id);
      assert.isFalse(spy.called);
    });

    it('dispatches an event to the model to select an environment', async () => {
      const spy = sinon.spy();
      element.addEventListener(ArcModelEventTypes.Environment.select, spy);
      element.selectEnvironment(envs[0]._id);
      assert.isTrue(spy.called);
      await aTimeout(1);
      element.selectEnvironment();
    });
  });

  describe('addEnvironment()', () => {
    after(async () => {
      await store.destroyVariables();
      ArcModelEvents.Environment.select(document.body, null);
    });
    
    let element = /** @type VariablesConsumer */ (null);
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('adds an environment to the data store', async () => {
      await element.addEnvironment('env1');
      const envs = await store.getDatastoreEnvironmentsData();
      assert.lengthOf(envs, 1);
      assert.equal(envs[0].name, 'env1');
    });

    it('selects added environment', async () => {
      const spy = sinon.spy(element, 'selectEnvironment');
      await element.addEnvironment('env2');
      assert.isTrue(spy.called, 'called the selectEnvironment function');
    });

    it('throws when no argument', async () => {
      let thrown = false;
      try {
        await element.addEnvironment(null);
      } catch (e) {
        thrown = true;
      }
      assert.isTrue(thrown);
    });
  });

  describe('removeEnvironment()', () => {
    let element = /** @type VariablesConsumer */ (null);
    let envs = /** @type ARCEnvironment[] */ (null);
    before(async () => {
      await store.insertVariablesAndEnvironments(5, {
        randomEnv: true,
      });
      envs = await store.getDatastoreEnvironmentsData();
    });

    after(async () => {
      await store.destroyVariables();
    });
    
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('dispatches the remove event', async () => {
      const spy = sinon.spy();
      element.addEventListener(ArcModelEventTypes.Environment.delete, spy);
      await element.removeEnvironment(envs[0]._id);
      assert.isTrue(spy.called, 'event is called');
    });

    it('removes the environment from the data store', async () => {
      const id = envs[1]._id;
      await element.removeEnvironment(id);
      let thrown = false;
      try {
        await model.getEnvironment(id);
      } catch (e) {
        thrown = true;
      }
      assert.isTrue(thrown);
    });

    it('throws when no argument', async () => {
      let thrown = false;
      try {
        await element.removeEnvironment(null);
      } catch (e) {
        thrown = true;
      }
      assert.isTrue(thrown);
    });
  });

  describe('toggleSystemVariables()', () => {
    let element = /** @type VariablesConsumer */ (null);
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('toggles "systemVariablesEnabled" property', () => {
      element.toggleSystemVariables();
      assert.isTrue(element.systemVariablesEnabled);
    });

    it('toggles "systemVariablesEnabled" with passed value', () => {
      element.toggleSystemVariables(true);
      assert.isTrue(element.systemVariablesEnabled);
    });

    it('dispatches the config change event', async () => {
      const spy = sinon.spy();
      element.addEventListener(ConfigEventTypes.update, spy);
      await element.toggleSystemVariables();
      assert.isTrue(spy.called, 'event is called');
    });
  });

  describe('#systemVariables', () => {
    let element = /** @type VariablesConsumer */ (null);
    beforeEach(async () => {
      element = await basicFixture();
    });

    const sysVars = Object.freeze({
      'a': 'b',
      'test var': 'value var',
    });

    it('has no variables by default', () => {
      assert.isUndefined(element.systemVariables);
      assert.isUndefined(element[systemVariablesValue]);
    });

    it('has empty model by default', () => {
      assert.deepEqual(element[systemVariablesModel], []);
    });

    it('returns the set system variables', () => {
      element.systemVariables = sysVars;
      assert.deepEqual(element.systemVariables, sysVars);
    });

    it('sets the data model', () => {
      element.systemVariables = sysVars;
      const varModel = element[systemVariablesModel];
      assert.typeOf(varModel, 'array', 'model is an array');
      assert.lengthOf(varModel, 2, 'model has variables');
      const [var1, var2] = varModel;
      assert.equal(var1.name, 'a', 'var #1 has the name');
      assert.equal(var1.value, 'b', 'var #1 has the value');
      assert.isTrue(var1.enabled, 'var #1 is enabled');
      assert.equal(var2.name, 'test var', 'var #2 has the name');
      assert.equal(var2.value, 'value var', 'var #2 has the value');
      assert.isTrue(var2.enabled, 'var #2 is enabled');
    });
  });

  describe('#environmentLabel', () => {
    let element = /** @type VariablesConsumer */ (null);
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('returns the default name', () => {
      assert.equal(element.environmentLabel, 'Default');
    });

    it('returns selected environment name', () => {
      element.environment = {
        name: 'test-name',
      };
      assert.equal(element.environmentLabel, 'test-name');
    });
  });

  describe('#environmentNameValue', () => {
    let element = /** @type VariablesConsumer */ (null);
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('returns the default name', () => {
      assert.equal(element.environmentNameValue, 'default');
    });

    it('returns selected environment name', () => {
      element.environment = {
        name: 'test-name',
      };
      assert.equal(element.environmentNameValue, 'test-name');
    });
  });

  describe('Events', () => {
    describe('environment deleted event', () => {
      let element = /** @type VariablesConsumer */ (null);
      beforeEach(async () => {
        element = await basicFixture();
      });

      it('has no effect when no environments', () => {
        // this is for code coverage
        ArcModelEvents.Environment.State.delete(document.body, '1', '2');
      });

      it('removes the environment from the list', () => {
        element.environments = generateEnvironments();
        const env = element.environments[0];
        ArcModelEvents.Environment.State.delete(document.body, env._id, env._rev);
        assert.lengthOf(element.environments, 9, 'has 9 environments (-1)');
      });

      it('ignores unknown environment', () => {
        element.environments = generateEnvironments();
        ArcModelEvents.Environment.State.delete(document.body, '1', '2');
        assert.lengthOf(element.environments, 10, 'has 10 environments (-0)');
      });

      it('selects the default environment when removed selected', () => {
        const spy = sinon.spy(element, 'selectEnvironment');
        element.environments = generateEnvironments();
        const env = element.environments[0];
        element.environment = env;
        ArcModelEvents.Environment.State.delete(document.body, env._id, env._rev);
        assert.isTrue(spy.called);
      });
    });
  
    describe('environment updated event', () => {
      let element = /** @type VariablesConsumer */ (null);
      beforeEach(async () => {
        element = await basicFixture();
      });

      it('updates existing environment', () => {
        element.environments = generateEnvironments();
        const env = { ...element.environments[0] };
        env.name = 'updated';
        const record = {
          item: env,
          oldRev: env._rev,
          id: env._id,
          rev: '2',
        };
        ArcModelEvents.Environment.State.update(document.body, record);
        assert.equal(element.environments[0].name, 'updated');
      });

      it('adds created environment', () => {
        element.environments = generateEnvironments();
        const env = generateEnvironments(1)[0];
        const record = {
          item: env,
          oldRev: env._rev,
          id: env._id,
          rev: '2',
        };
        ArcModelEvents.Environment.State.update(document.body, record);
        assert.lengthOf(element.environments, 11);
      });

      it('adds created environment when no environments', () => {
        const env = generateEnvironments(1)[0];
        const record = {
          item: env,
          oldRev: env._rev,
          id: env._id,
          rev: '2',
        };
        ArcModelEvents.Environment.State.update(document.body, record);
        assert.lengthOf(element.environments, 1);
      });

      it('ignores when no item on the event', () => {
        const record = {
          oldRev: '1',
          id: '2',
          rev: '3',
        };
        ArcModelEvents.Environment.State.update(document.body, record);
        assert.isUndefined(element.environments);
      });
    });
  
    describe('environment selection event', () => {
      let element = /** @type VariablesConsumer */ (null);
      beforeEach(async () => {
        element = await basicFixture();
      });

      it('updates the environment', () => {
        const env = generateEnvironments(1)[0];
        ArcModelEvents.Environment.State.select(document.body, {
          environment: env,
          variables: [],
        });
        assert.deepEqual(element.environment, env);
      });

      it('updates the variables', () => {
        const env = generateEnvironments(1)[0];
        const variables = generator.variables.listVariables(5);
        ArcModelEvents.Environment.State.select(document.body, {
          environment: env,
          variables,
        });
        assert.deepEqual(element.variables, variables, 'has the variables');
        variables.splice(0, 1);
        assert.lengthOf(element.variables, 5, 'the variables array is a copy');
      });
    });
  
    describe('variable deleted event', () => {
      let element = /** @type VariablesConsumer */ (null);
      beforeEach(async () => {
        element = await basicFixture();
      });

      it('has no effect when no variables', () => {
        // this is for code coverage
        ArcModelEvents.Variable.State.delete(document.body, '1', '2');
      });

      it('removes the variables from the list', () => {
        element.variables = generator.variables.listVariables(10);
        const variable = element.variables[0];
        ArcModelEvents.Variable.State.delete(document.body, variable._id, 'test');
        assert.lengthOf(element.variables, 9, 'has 9 variables (-1)');
      });

      it('ignores unknown variables', () => {
        element.variables = generator.variables.listVariables(10);
        ArcModelEvents.Variable.State.delete(document.body, '1', '2');
        assert.lengthOf(element.variables, 10, 'has 10 variables (-0)');
      });
    });
  
    describe('variable updated event', () => {
      let element = /** @type VariablesConsumer */ (null);
      beforeEach(async () => {
        element = await basicFixture();
      });

      it('updates an existing variable', () => {
        element.variables = generator.variables.listVariables(5, { defaultEnv: true });
        const variable = { ...element.variables[0] };
        variable.name = 'updated';
        const record = {
          item: variable,
          oldRev: '2',
          id: variable._id,
          rev: '1',
        };
        ArcModelEvents.Variable.State.update(document.body, record);
        assert.equal(element.variables[0].name, 'updated');
      });

      it('adds created variable', () => {
        element.variables = generator.variables.listVariables(5, { defaultEnv: true });
        const variable = generator.variables.variable({ defaultEnv: true });
        const record = {
          item: variable,
          // @ts-ignore
          id: variable._id,
          rev: 1,
        };
        // @ts-ignore
        ArcModelEvents.Variable.State.update(document.body, record);
        assert.lengthOf(element.variables, 6);
      });

      it('ignores other environment variables', () => {
        element.variables = generator.variables.listVariables(5, { defaultEnv: true });
        const variable = generator.variables.variable({ randomEnv: true });
        const record = {
          item: variable,
          // @ts-ignore
          id: variable._id,
          rev: 1,
        };
        // @ts-ignore
        ArcModelEvents.Variable.State.update(document.body, record);
        assert.lengthOf(element.variables, 5);
      });
    });
  
    describe('data store destroy event', () => {
      let element = /** @type VariablesConsumer */ (null);
      beforeEach(async () => {
        element = await basicFixture();
      });

      it('calls refresh functions for "variables" data store', () => {
        element.refreshEnvironment = async () => {};
        element.refreshEnvironments = async () => {};
        const spy1 = sinon.spy(element, 'refreshEnvironment');
        const spy2 = sinon.spy(element, 'refreshEnvironments');
        ArcModelEvents.destroyed(document.body, 'variables');
        assert.isTrue(spy1.called, 'refreshEnvironment is called');
        assert.isTrue(spy2.called, 'refreshEnvironments is called');
      });

      it('calls refresh functions for "variables-environments" data store', () => {
        element.refreshEnvironment = async () => {};
        element.refreshEnvironments = async () => {};
        const spy1 = sinon.spy(element, 'refreshEnvironment');
        const spy2 = sinon.spy(element, 'refreshEnvironments');
        ArcModelEvents.destroyed(document.body, 'variables-environments');
        assert.isTrue(spy1.called, 'refreshEnvironment is called');
        assert.isTrue(spy2.called, 'refreshEnvironments is called');
      });

      it('ignores other stores', () => {
        const spy = sinon.spy(element, 'refreshEnvironment');
        ArcModelEvents.destroyed(document.body, 'requests');
        assert.isFalse(spy.called, 'refreshEnvironment is called');
      });
    });
  
    describe('configuration change event', () => {
      let element = /** @type VariablesConsumer */ (null);
      beforeEach(async () => {
        element = await basicFixture();
      });

      it('sets the "systemVariablesEnabled" property', () => {
        ConfigEvents.State.update(document.body, 'request.useSystemVariables', true);
        assert.isTrue(element.systemVariablesEnabled);
      });

      it('ignores other keys', () => {
        ConfigEvents.State.update(document.body, 'request.other', true);
        assert.isFalse(element.systemVariablesEnabled);
      });
    });

    describe('data import event', () => {
      let element = /** @type VariablesConsumer */ (null);
      beforeEach(async () => {
        element = await basicFixture();
      });

      it('refreshes the current environment', async () => {
        const spy = sinon.spy(element, 'refreshEnvironment');
        ImportEvents.dataImported(document.body);
        await nextFrame();
        assert.isTrue(spy.called);
      });

      it('refreshes the list of environments', async () => {
        const spy = sinon.spy(element, 'refreshEnvironments');
        ImportEvents.dataImported(document.body);
        // there are two function calls with `await`. This is the second one
        // and it waits here to be sure that first function finishes which is 
        // dependent on the speed of the IDB.
        await aTimeout(100);
        assert.isTrue(spy.called);
      });
    });
  });
});
