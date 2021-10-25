import { assert, aTimeout, fixture, html, nextFrame } from '@open-wc/testing';
import sinon from 'sinon';
import { ArcMock } from '@advanced-rest-client/arc-mock';
import { loadMonaco } from '../MonacoSetup.js';
import '../../define/body-formdata-editor.js'
import {
  addParamHandler,
} from '../../src/elements/body/internals.js';

/** @typedef {import('../../').BodyFormdataEditorElement} BodyFormdataEditorElement */

describe('BodyFormdataEditorElement', () => {
  /**
   * @returns {Promise<BodyFormdataEditorElement>}
   */
  async function basicFixture() {
    return fixture(`<body-formdata-editor></body-formdata-editor>`);
  }

  /**
   * @param {string} value
   * @returns {Promise<BodyFormdataEditorElement>}
   */
  async function valueFixture(value) {
    return fixture(html`<body-formdata-editor .value="${value}"></body-formdata-editor>`);
  }

  /**
   * @returns {Promise<BodyFormdataEditorElement>}
   */
  async function autoEncodeFixture() {
    return fixture(html`<body-formdata-editor autoEncode></body-formdata-editor>`);
  }

  const generator = new ArcMock();
  
  before(async () => loadMonaco());

  describe('Empty state', () => {
    let element = /** @type BodyFormdataEditorElement */ (null);
    beforeEach(async () => { element = await basicFixture(); })

    it('renders empty message', () => {
      const node = element.shadowRoot.querySelector('.empty-list');
      assert.ok(node);
    });

    it('renders the add button', () => {
      const node = element.shadowRoot.querySelector('.add-param');
      assert.ok(node);
    });

    it('renders the encode value button', () => {
      const node = element.shadowRoot.querySelector('#encode');
      assert.ok(node);
    });

    it('renders the decode value button', () => {
      const node = element.shadowRoot.querySelector('#decode');
      assert.ok(node);
    });

    it('has empty model', () => {
      assert.deepEqual(element.model, []);
    });
  });

  describe('adding a property', () => {
    let element = /** @type BodyFormdataEditorElement */ (null);
    beforeEach(async () => { element = await basicFixture(); })

    it('adds a model item on add button click', () => {
      const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('.add-param'));
      node.click();
      assert.lengthOf(element.model, 1);
    });

    it('does not add a model when readonly', () => {
      element.readOnly = true;
      const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('.add-param'));
      node.click();
      assert.lengthOf(element.model, 0);
    });

    it('does not add a model when disabled', () => {
      element.disabled = true;
      const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('.add-param'));
      node.click();
      assert.lengthOf(element.model, 0);
    });

    it('model item has basic schema', () => {
      const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('.add-param'));
      node.click();
      assert.deepEqual(element.model[0], {
        name: '',
        value: '',
        enabled: true,
      });
    });

    it('adds an item with undefined model', () => {
      element.model = undefined;
      const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('.add-param'));
      node.click();
      assert.lengthOf(element.model, 1);
    });

    it('focuses on the added item', async () => {
      const spy = sinon.spy(element, 'focusLastName');
      await element[addParamHandler]();
      await aTimeout(0);
      assert.isTrue(spy.called);
    });

    it('does not notify model change', async () => {
      // there's no point of storing the model without empty values. They are not generating 
      // any editor value
      const spy = sinon.spy();
      element.addEventListener('change', spy);
      await element[addParamHandler]();
      assert.isFalse(spy.called);
    });
  });

  describe('#value', () => {
    let element = /** @type BodyFormdataEditorElement */ (null);
    beforeEach(async () => { element = await basicFixture(); })

    it('reads set value', () => {
      element.value = 'a=b';
      assert.equal(element.value, 'a=b');
    });

    it('generates a view model', () => {
      element.value = 'a=b&c=d';
      assert.lengthOf(element.model, 2);
    });

    it('generated model has basic properties', () => {
      element.value = 'a=b&c=d';
      const [item] = element.model;
      assert.deepEqual(item, {
        name: 'a',
        value: 'b',
        enabled: true,
      });
    });

    it('clears the model when no value', () => {
      element.value = 'a=b&c=d';
      assert.lengthOf(element.model, 2);
      element.value = '';
      assert.lengthOf(element.model, 0);
    });

    it('updates existing model', () => {
      element.model = [{ name: 'test', value: 'true', enabled: true }];
      element.value = 'a=b&c=d';
      assert.equal(element.model[0].name, 'a');
    });

    it('does not notify model change', async () => {
      // value/model setters should not dispatch change events
      const spy = sinon.spy();
      element.addEventListener('change', spy);
      element.value = 'a=b&c=d';
      assert.isFalse(spy.called);
    });
  });

  describe('#model', () => {
    let element = /** @type BodyFormdataEditorElement */ (null);
    beforeEach(async () => { element = await basicFixture(); })

    it('reads set value', () => {
      const value = [{ name: 'test', value: 'true', enabled: true }];
      element.model = value;
      assert.deepEqual(element.model, value);
    });

    it('generates a value', () => {
      const value = [{ name: 'test', value: 'true', enabled: true }];
      element.model = value;
      assert.equal(element.value, 'test=true');
    });

    it('clears the previously set value', () => {
      element.value = 'a=b&c=d';
      element.model = undefined;
      assert.equal(element.value, '');
    });

    it('updates existing value', () => {
      element.value = 'a=b&c=d';
      const value = [{ name: 'test', value: 'true', enabled: true }];
      element.model = value;
      assert.equal(element.value, 'test=true');
    });

    it('does not notify model change', () => {
      // value/model setters should not dispatch change events
      const spy = sinon.spy();
      element.addEventListener('change', spy);
      element.model = [{ name: 'test', value: 'true', enabled: true }];
      assert.isFalse(spy.called);
    });
  });

  describe('values rendering', () => {
    let element = /** @type BodyFormdataEditorElement */ (null);
    beforeEach(async () => {
      const value = generator.http.payload.urlEncoded();
      element = await valueFixture(value);
    });

    it('renders form rows for each model entry', () => {
      const items = element.shadowRoot.querySelectorAll('.form-row');
      assert.lengthOf(items, element.model.length);
    });

    it('renders the enable switch', () => {
      const item = element.shadowRoot.querySelector('.form-row anypoint-switch');
      assert.ok(item);
    });

    it('renders the remove button', () => {
      const item = element.shadowRoot.querySelector('.form-row [data-action="remove"]');
      assert.ok(item);
    });

    it('renders the name input', () => {
      const item = element.shadowRoot.querySelector('.form-row .param-name');
      assert.ok(item);
    });

    it('renders the value input', () => {
      const item = element.shadowRoot.querySelector('.form-row .param-value');
      assert.ok(item);
    });
  });

  describe('enable/disable action', () => {
    let element = /** @type BodyFormdataEditorElement */ (null);
    beforeEach(async () => {
      const value = generator.http.payload.urlEncoded();
      element = await valueFixture(value);
    });

    it('disables the form item', () => {
      const item = /** @type HTMLElement */ (element.shadowRoot.querySelector('.form-row anypoint-switch'));
      item.click();
      assert.isFalse(element.model[0].enabled);
    });

    it('updates the value', () => {
      const item = /** @type HTMLElement */ (element.shadowRoot.querySelector('.form-row anypoint-switch'));
      item.click();
      const { name, value: modelValue } = element.model[0];
      const { value } = element;
      assert.notInclude(value, `${name}=${modelValue}`);
    });

    it('dispatches the change event', () => {
      const spy = sinon.spy();
      element.addEventListener('change', spy);
      const item = /** @type HTMLElement */ (element.shadowRoot.querySelector('.form-row anypoint-switch'));
      item.click();
      assert.isTrue(spy.called);
    });

    it('re-enables the form item', async () => {
      const item = /** @type HTMLElement */ (element.shadowRoot.querySelector('.form-row anypoint-switch'));
      item.click();
      await aTimeout(0);
      item.click();
      assert.isTrue(element.model[0].enabled);
    });

    it('changes the value when enabling', async () => {
      const item = /** @type HTMLElement */ (element.shadowRoot.querySelector('.form-row anypoint-switch'));
      item.click();
      await aTimeout(0);
      item.click();
      const { name, value: modelValue } = element.model[0];
      const { value } = element;
      assert.include(value, `${name}=${modelValue}`);
    });

    it('dispatches the change event when enabling', async () => {
      const spy = sinon.spy();
      element.addEventListener('change', spy);
      const item = /** @type HTMLElement */ (element.shadowRoot.querySelector('.form-row anypoint-switch'));
      item.click();
      await aTimeout(0);
      item.click();
      assert.equal(spy.callCount, 2);
    });
  });

  describe('removing an item', () => {
    let element = /** @type BodyFormdataEditorElement */ (null);
    beforeEach(async () => {
      const value = generator.http.payload.urlEncoded();
      element = await valueFixture(value);
    });

    it('removes an item from the model', () => {
      const item = { ...element.model[0] };
      const button = /** @type HTMLElement */ (element.shadowRoot.querySelector('.form-row [data-action="remove"]'));
      button.click();
      assert.notDeepEqual(element.model[0], item);
    });

    it('updates the value', () => {
      const item = { ...element.model[0] };
      const button = /** @type HTMLElement */ (element.shadowRoot.querySelector('.form-row [data-action="remove"]'));
      button.click();
      assert.notInclude(element.value, `${item.name}=${item.value}`);
    });

    it('dispatches the change event', () => {
      const spy = sinon.spy();
      element.addEventListener('change', spy);
      const button = /** @type HTMLElement */ (element.shadowRoot.querySelector('.form-row [data-action="remove"]'));
      button.click();
      assert.isTrue(spy.calledOnce);
    });
  });

  describe('name change', () => {
    let element = /** @type BodyFormdataEditorElement */ (null);
    beforeEach(async () => {
      const value = generator.http.payload.urlEncoded();
      element = await valueFixture(value);
    });

    it('changes the name', () => {
      const item = { ...element.model[0] };
      const input = /** @type HTMLInputElement */ (element.shadowRoot.querySelector('.form-row .param-name'));
      input.value = 'new-value-test';
      input.dispatchEvent(new CustomEvent('change'))
      assert.notEqual(element.model[0].name, item.name);
      assert.equal(element.model[0].name, 'new-value-test');
    });

    it('updates the value', () => {
      const input = /** @type HTMLInputElement */ (element.shadowRoot.querySelector('.form-row .param-name'));
      input.value = 'new-value-test';
      input.dispatchEvent(new CustomEvent('change'))
      assert.include(element.value, `new-value-test=${element.model[0].value}`);
    });

    it('dispatches the change event', () => {
      const spy = sinon.spy();
      element.addEventListener('change', spy);
      const input = /** @type HTMLInputElement */ (element.shadowRoot.querySelector('.form-row .param-name'));
      input.value = 'new-value-test';
      input.dispatchEvent(new CustomEvent('change'))
      assert.isTrue(spy.calledOnce);
    });
  });

  describe('value change', () => {
    let element = /** @type BodyFormdataEditorElement */ (null);
    beforeEach(async () => {
      const value = generator.http.payload.urlEncoded();
      element = await valueFixture(value);
    });

    it('changes the value', () => {
      const item = { ...element.model[0] };
      const input = /** @type HTMLInputElement */ (element.shadowRoot.querySelector('.form-row .param-value'));
      input.value = 'new-value-test';
      input.dispatchEvent(new CustomEvent('change'))
      assert.notEqual(element.model[0].value, item.value);
      assert.equal(element.model[0].value, 'new-value-test');
    });

    it('updates the value', () => {
      const input = /** @type HTMLInputElement */ (element.shadowRoot.querySelector('.form-row .param-value'));
      input.value = 'new-value-test';
      input.dispatchEvent(new CustomEvent('change'))
      assert.include(element.value, `${element.model[0].name}=new-value-test`);
    });

    it('dispatches the change event', () => {
      const spy = sinon.spy();
      element.addEventListener('change', spy);
      const input = /** @type HTMLInputElement */ (element.shadowRoot.querySelector('.form-row .param-value'));
      input.value = 'new-value-test';
      input.dispatchEvent(new CustomEvent('change'))
      assert.isTrue(spy.calledOnce);
    });
  });

  describe('value encoding', () => {
    let element = /** @type BodyFormdataEditorElement */ (null);
    beforeEach(async () => {
      const value = 'a b=c d'
      element = await valueFixture(value);
    });

    it('has unchanged values in the model', () => {
      const [item] = element.model;
      assert.equal(item.name, 'a b');
      assert.equal(item.value, 'c d');
    });

    it('encodes the model values', () => {
      const button = /** @type HTMLElement */ (element.shadowRoot.querySelector('#encode'));
      button.click();
      const [item] = element.model;
      assert.equal(item.name, 'a+b');
      assert.equal(item.value, 'c+d');
    });

    it('encodes the value', () => {
      const button = /** @type HTMLElement */ (element.shadowRoot.querySelector('#encode'));
      button.click();
      assert.equal(element.value, 'a+b=c+d');
    });

    it('dispatches the change event', () => {
      const spy = sinon.spy();
      element.addEventListener('change', spy);
      const button = /** @type HTMLElement */ (element.shadowRoot.querySelector('#encode'));
      button.click();
      assert.isTrue(spy.calledOnce);
    });
  });

  describe('value decoding', () => {
    let element = /** @type BodyFormdataEditorElement */ (null);
    beforeEach(async () => {
      const value = 'a+b=c+d'
      element = await valueFixture(value);
    });

    it('has unchanged values in the model', () => {
      const [item] = element.model;
      assert.equal(item.name, 'a+b');
      assert.equal(item.value, 'c+d');
    });

    it('decodes the model values', () => {
      const button = /** @type HTMLElement */ (element.shadowRoot.querySelector('#decode'));
      button.click();
      const [item] = element.model;
      assert.equal(item.name, 'a b');
      assert.equal(item.value, 'c d');
    });

    it('decodes the value', () => {
      const button = /** @type HTMLElement */ (element.shadowRoot.querySelector('#decode'));
      button.click();
      assert.equal(element.value, 'a b=c d');
    });

    it('dispatches the change event', () => {
      const spy = sinon.spy();
      element.addEventListener('change', spy);
      const button = /** @type HTMLElement */ (element.shadowRoot.querySelector('#decode'));
      button.click();
      assert.isTrue(spy.calledOnce);
    });
  });

  describe('#autoEncode', () => {
    let element = /** @type BodyFormdataEditorElement */ (null);
    beforeEach(async () => { element = await autoEncodeFixture(); });

    it('automatically decodes the set value', () => {
      element.value = 'a+b=c+d';
      const [item] = element.model;
      assert.equal(item.name, 'a b');
      assert.equal(item.value, 'c d');
    });

    it('encodes values on input change', async () => {
      element.value = 'a+b=c+d';
      await nextFrame();
      const input = /** @type HTMLInputElement */ (element.shadowRoot.querySelector('.form-row .param-name'));
      input.value = 'new value test';
      input.dispatchEvent(new CustomEvent('change'))
      assert.equal(element.value, 'new+value+test=c+d');
    });

    it('does not double encodes values', async () => {
      element.value = 'a+b=c+d';
      await nextFrame();
      const input = /** @type HTMLInputElement */ (element.shadowRoot.querySelector('.form-row .param-name'));
      input.value = 'new value test';
      input.dispatchEvent(new CustomEvent('change'))
      await nextFrame();
      input.value = 'new value tests';
      input.dispatchEvent(new CustomEvent('change'))
      assert.equal(element.value, 'new+value+tests=c+d');
    });
  });
});
