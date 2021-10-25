/* eslint-disable prefer-destructuring */
import { assert, html, fixture, nextFrame, oneEvent } from '@open-wc/testing';
import { ArcMock } from '@advanced-rest-client/arc-mock';
import { MockedStore, VariablesModel } from '@advanced-rest-client/idb-store';
import sinon from 'sinon';
import '../../define/variables-list.js';
import { ArcModelEventTypes } from '@advanced-rest-client/events';
import { varAddHandler, editedVariable, } from '../../src/elements/variables/VariablesListElement.js';
import { variableValueLabel } from '../../src/lib/Utils.js';

/** @typedef {import('@anypoint-web-components/awc').AnypointInputElement} AnypointInput */
/** @typedef {import('@advanced-rest-client/events').Variable.ARCVariable} ARCVariable */
/** @typedef {import('@advanced-rest-client/events').Variable.ARCEnvironment} ARCEnvironment */
/** @typedef {import('../../index').VariablesListElement} VariablesListElement */

describe('VariablesListElement', () => {
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
   * @param {array=} vars
   * @returns {Promise<VariablesListElement>}
   */
  async function basicFixture(vars) {
    return fixture(html`<variables-list environment="default" .variables="${vars}"></variables-list>`);
  }

  /**
   * @param {array=} vars
   * @returns {Promise<VariablesListElement>}
   */
  async function systemFixture(vars) {
    return fixture(html`<variables-list system .variables="${vars}"></variables-list>`);
  }

  describe('Empty default list', () => {
    let element = /** @type VariablesListElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('renders the title', () => {
      const node = element.shadowRoot.querySelector('.section-title');
      assert.ok(node);
    });

    it('renders the add variable button', () => {
      const node = element.shadowRoot.querySelector('[data-action="add-variables"]');
      assert.ok(node);
    });

    it('renders the toggle visibility button', () => {
      const node = element.shadowRoot.querySelector('[data-action="toggle-visibility"]');
      assert.ok(node);
    });

    it('has default toggle icon', () => {
      const node = element.shadowRoot.querySelector('[data-action="toggle-visibility"] arc-icon');
      assert.equal(node.getAttribute('icon'), 'visibility');
    });

    it('changes the toggle icon', async () => {
      element.renderValues = true;
      await nextFrame();
      const node = element.shadowRoot.querySelector('[data-action="toggle-visibility"] arc-icon');
      assert.equal(node.getAttribute('icon'), 'visibilityOff');
    });

    it('has the "titleValue" set', () => {
      assert.equal(element.titleValue, 'Variables');
    });

    it('renders the empty list info', () => {
      const node = element.shadowRoot.querySelector('.empty-info');
      assert.ok(node);
    });
  });

  describe('Empty system variables list', () => {
    let element = /** @type VariablesListElement */ (null);
    beforeEach(async () => {
      element = await systemFixture();
    });

    it('renders the title', () => {
      const node = element.shadowRoot.querySelector('.section-title');
      assert.ok(node);
    });

    it('does not render the add variable button for system variables', async () => {
      element.system = true;
      await nextFrame();
      const node = element.shadowRoot.querySelector('[data-action="add-variables"]');
      assert.notOk(node);
    });

    it('has the "titleValue" set', () => {
      assert.equal(element.titleValue, 'System variables');
    });
  });

  describe('Adding a variable', () => {
    let element = /** @type VariablesListElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
    });

    after(async () => {
      await store.destroyVariables();
    });

    it('dispatches the update event', async () => {
      const spy = sinon.spy();
      element.addEventListener(ArcModelEventTypes.Variable.update, spy);
      await element[varAddHandler]();
      assert.isTrue(spy.called);
    });

    it('sets the [editedVariable] property', async () => {
      await element[varAddHandler]();
      assert.typeOf(element[editedVariable], 'string');
    });
  });

  describe('list items rendering', () => {
    let element = /** @type VariablesListElement */ (null);
    beforeEach(async () => {
      const variables = generator.variables.listVariables(10, {
        defaultEnv: true,
      });
      element = await basicFixture(variables);
    });

    it('renders the list of variables', () => {
      const node = element.shadowRoot.querySelector('.var-list');
      assert.ok(node);
    });

    it('renders all variables', () => {
      const nodes = element.shadowRoot.querySelectorAll('.var-item');
      assert.lengthOf(nodes, 10);
    });

    it('renders hidden variable item actions', () => {
      const nodes = element.shadowRoot.querySelectorAll('.var-list-actions');
      assert.lengthOf(nodes, 10);
      const [node] = Array.from(nodes);
      const { display } = getComputedStyle(node);
      assert.equal(display, 'none');
    });

    it('renders hidden variable item actions', () => {
      const nodes = element.shadowRoot.querySelectorAll('.var-list-actions');
      assert.lengthOf(nodes, 10);
      const [node] = Array.from(nodes);
      const { display } = getComputedStyle(node);
      assert.equal(display, 'none');
    });

    it('renders values masked by default', () => {
      const node = element.shadowRoot.querySelector('.var-value');
      const value = node.textContent.trim();
      const transformed = variableValueLabel(element.variables[0].value, true);
      assert.equal(value, transformed);
    });

    it('renders values when toggling visibility', async () => {
      const button = /** @type HTMLElement */ (element.shadowRoot.querySelector('[data-action="toggle-visibility"]'));
      button.click();
      await nextFrame();
      const node = element.shadowRoot.querySelector('.var-value');
      const value = node.textContent.trim();
      assert.equal(value, element.variables[0].value);
    });
  });

  describe('variable editing', () => {
    before(async () => {
      await store.insertVariables(10, {
        defaultEnv: true,
      });
    });

    after(async () => {
      await store.destroyVariables();
    });
    
    let element = /** @type VariablesListElement */ (null);
    let variables = /** @type ARCVariable[] */ (null);
    beforeEach(async () => {
      variables = await store.getDatastoreVariablesData();
      assert.isAbove(variables.length, 0, 'has generated variables');
      element = await basicFixture(variables);
    });

    it('enables the variable editor', async () => {
      const button = /** @type HTMLElement */ (element.shadowRoot.querySelector('.var-list-actions [data-action="edit"]'));
      button.click();
      await nextFrame();
      const node = element.shadowRoot.querySelector('.var-editor');
      assert.ok(node);
    });

    it('ignores the variable editor when system vars', async () => {
      element.system = true;
      // at this point changes has not been committed to the DOM and the action button is still there.
      // after awaiting for the next frame this button wouldn't be rendered, which was tested above.
      const button = /** @type HTMLElement */ (element.shadowRoot.querySelector('.var-list-actions [data-action="edit"]'));
      button.click();
      await nextFrame();
      const node = element.shadowRoot.querySelector('.var-editor');
      assert.notOk(node);
    });

    it('changes variable name', async () => {
      const id = variables[0]._id;
      element[editedVariable] = id;
      element.requestUpdate();
      await nextFrame();
      const input = /** @type AnypointInput */ (element.shadowRoot.querySelector('.variable-name'));
      input.value = 'updated-name';
      input.dispatchEvent(new CustomEvent('change'));
      const e = await oneEvent(window, ArcModelEventTypes.Variable.State.update);
      // @ts-ignore
      const { changeRecord } = e;
      assert.equal(changeRecord.id, id);
    });

    it('variable name has a pattern set', async () => {
      const id = variables[0]._id;
      element[editedVariable] = id;
      element.requestUpdate();
      await nextFrame();
      const input = /** @type AnypointInput */ (element.shadowRoot.querySelector('.variable-name'));
      assert.equal(input.allowedPattern, '[a-zA-Z0-9_]');
    });

    it('changes variable value', async () => {
      const id = variables[1]._id;
      element[editedVariable] = id;
      await element.requestUpdate();
      const input = /** @type HTMLInputElement */ (element.shadowRoot.querySelector('.variable-value'));
      input.value = 'updated-value';
      input.dispatchEvent(new CustomEvent('change'));
      const e = await oneEvent(window, ArcModelEventTypes.Variable.State.update);
      // @ts-ignore
      const { changeRecord } = e;
      assert.equal(changeRecord.id, id);
    });

    it('toggles variable enabled', async () => {
      const id = variables[4]._id;
      element[editedVariable] = id;
      await element.requestUpdate();
      const input = /** @type HTMLInputElement */ (element.shadowRoot.querySelector(`anypoint-switch[data-id="${id}"]`));
      input.checked = !input.checked;
      input.dispatchEvent(new CustomEvent('change'));
      const e = await oneEvent(window, ArcModelEventTypes.Variable.State.update);
      // @ts-ignore
      const { changeRecord } = e;
      assert.equal(changeRecord.id, id);
    });

    it('closes the editor', async () => {
      const id = variables[0]._id;
      element[editedVariable] = id;
      await element.requestUpdate();
      
      const button = /** @type HTMLElement */ (element.shadowRoot.querySelector('[data-action="close-editor"]'));
      button.click();
      await nextFrame();

      const node = element.shadowRoot.querySelector('.var-editor');
      assert.notOk(node);
    });
  });

  describe('variable deleting', () => {
    before(async () => {
      await store.insertVariables(10, {
        defaultEnv: true,
      });
    });

    after(async () => {
      await store.destroyVariables();
    });
    
    let element = /** @type VariablesListElement */ (null);
    let variables = /** @type ARCVariable[] */ (null);
    beforeEach(async () => {
      variables = await store.getDatastoreVariablesData();
      assert.isAbove(variables.length, 0, 'has generated variables');
      element = await basicFixture(variables);
    });

    it('deletes a variables', async () => {
      const id = variables[0]._id;

      const button = /** @type HTMLElement */ (element.shadowRoot.querySelector(`*[data-action="remove"][data-id="${id}"]`));
      button.click();

      const e = await oneEvent(window, ArcModelEventTypes.Variable.State.delete);
      // @ts-ignore
      assert.equal(e.id, id);
    });
  });
});
