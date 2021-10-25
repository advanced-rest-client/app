import { assert, html, fixture, nextFrame, oneEvent } from '@open-wc/testing';
import { MockedStore, VariablesModel } from '@advanced-rest-client/idb-store';
import { ArcModelEventTypes } from '@advanced-rest-client/events';
import sinon from 'sinon';
import { resetSelection } from './ModelUtils.js';
import { envSelectorOpened, } from '../../src/elements/variables/EnvironmentSelectorElement.js';
import '../../define/environment-selector.js';
// import { variableValueLabel } from '../src/Utils.js';

/** @typedef {import('@advanced-rest-client/events').Variable.ARCVariable} ARCVariable */
/** @typedef {import('@advanced-rest-client/events').Variable.ARCEnvironment} ARCEnvironment */
/** @typedef {import('../../index').EnvironmentSelectorElement} EnvironmentSelectorElement */

describe('EnvironmentSelectorElement', () => {
  const store = new MockedStore();
  const model = new VariablesModel();


  /**
   * @param {ARCEnvironment=} environment
   * @param {ARCEnvironment[]=} environments
   * @returns {Promise<EnvironmentSelectorElement>}
   */
  async function basicFixture(environment, environments) {
    return fixture(html`<environment-selector .environment="${environment}" .environments="${environments}"></environment-selector>`);
  }

  before(async () => {
    model.listen(window);
    await store.insertVariablesAndEnvironments(5, {
      randomEnv: true,
    });
  });

  after(async () => {
    await resetSelection();
    await store.destroyVariables();
    model.unlisten(window);
  });

  describe('No data state', () => {
    let element = /** @type EnvironmentSelectorElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('renders the label for the default environment', () => {
      const label = element.shadowRoot.querySelector('.label');
      const value = label.textContent.trim();
      assert.equal(value, 'Default');
    });

    it('renders the dropdown', () => {
      const node = element.shadowRoot.querySelector('anypoint-dropdown');
      assert.ok(node);
    });

    it('the dropdown has the default environment', () => {
      const node = element.shadowRoot.querySelector('anypoint-icon-item[data-id=""]');
      assert.ok(node);
    });

    it('the dropdown has the add environment option', () => {
      const node = element.shadowRoot.querySelector('[data-action="add-environment"]');
      assert.ok(node);
    });

    it('the dropdown has no remove-environment option for the default environment', () => {
      const node = element.shadowRoot.querySelector('[data-action="remove-environment"]');
      assert.notOk(node);
    });
  });

  describe('Adding an environment', () => {
    let element = /** @type EnvironmentSelectorElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('renders the form', async () => {
      const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('[data-action="add-environment"]'));
      node.click();
      await nextFrame();
      const form = /** @type HTMLElement */ (element.shadowRoot.querySelector('.env-input-wrapper'));
      assert.ok(form);
    });

    it('cancel button cancels the form', async () => {
      const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('[data-action="add-environment"]'));
      node.click();
      await nextFrame();
      const button = /** @type HTMLElement */ (element.shadowRoot.querySelector('[data-action="cancel"]'));
      button.click();
      await nextFrame();
      const form = /** @type HTMLElement */ (element.shadowRoot.querySelector('.env-input-wrapper'));
      assert.notOk(form);
    });

    it('adds an environment', async () => {
      const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('[data-action="add-environment"]'));
      node.click();
      await nextFrame();
      const input = /** @type HTMLInputElement */ (element.shadowRoot.querySelector('#envNameInput'));
      input.value = 'test environment';

      const button = /** @type HTMLElement */ (element.shadowRoot.querySelector('[data-action="save"]'));
      button.click();
      
      const e = await oneEvent(window, ArcModelEventTypes.Environment.State.update);
      // @ts-ignore
      const { changeRecord } = e;
      assert.equal(changeRecord.item.name, 'test environment');
    });
  });

  describe('Changing an environment', () => {
    let element = /** @type EnvironmentSelectorElement */ (null);
    let environments = /** @type ARCEnvironment[] */ (null);

    before(async () => {
      environments = await store.getDatastoreEnvironmentsData();
    });

    beforeEach(async () => {
      element = await basicFixture(environments[0], environments);
      element[envSelectorOpened] = true;
    });

    afterEach(async () => {
      await resetSelection();
    });

    it('selects a new environment', async () => {
      const spy = sinon.spy();
      element.addEventListener(ArcModelEventTypes.Environment.select, spy);
      const env = environments[3];
      const node = /** @type HTMLElement */ (element.shadowRoot.querySelector(`anypoint-icon-item[data-id="${env._id}"]`));
      node.click();

      assert.isTrue(spy.called);
    });
  });

  describe('Deleting an environment', () => {
    let element = /** @type EnvironmentSelectorElement */ (null);
    let environments = /** @type ARCEnvironment[] */ (null);

    before(async () => {
      environments = await store.getDatastoreEnvironmentsData();
    });

    beforeEach(async () => {
      element = await basicFixture(environments[0], environments);
      element[envSelectorOpened] = true;
    });

    afterEach(async () => {
      await resetSelection();
    });

    it('removes an environment', async () => {
      const node = /** @type HTMLElement */ (element.shadowRoot.querySelector(`anypoint-icon-item[data-action="remove-environment"]`));
      node.click();

      await oneEvent(window, ArcModelEventTypes.Environment.State.delete);
    });
  });
});
