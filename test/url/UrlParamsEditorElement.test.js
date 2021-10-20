/* eslint-disable no-template-curly-in-string */
import { fixture, html, assert, nextFrame, aTimeout } from '@open-wc/testing';
import sinon from 'sinon';
import { UrlParser } from '../../index.js';
import '../../define/url-params-editor.js';
import { 
  getHostValue, 
  findSearchParam, 
  findModelParam,
  parserValue,
  computeModel,
  valueChanged,
  computeSearchParams,
  addParamHandler,
  queryModelChanged,
} from '../../src/elements/url/internals.js';

/** @typedef {import('../../index').UrlParamsEditorElement} UrlParamsEditorElement */
/** @typedef {import('@anypoint-web-components/awc').AnypointInputElement} AnypointInput */
/** @typedef {import('@anypoint-web-components/awc').AnypointButtonElement} AnypointButton */

describe('UrlParamsEditorElement', () => {
  /**
   * @return {Promise<UrlParamsEditorElement>}
   */
  async function basicFixture() {
    const value = 'https://arc.com:1234/path/o ther/?a=b&c=d#123';
    return fixture(html`<url-params-editor
      .value="${value}"></url-params-editor>`);
  }
  /**
   * @return {Promise<UrlParamsEditorElement>}
   */
  async function emptyFixture() {
    return fixture(html`<url-params-editor></url-params-editor>`);
  }
  /**
   * @return {Promise<UrlParamsEditorElement>}
   */
  async function readOnlyFixture(value) {
    return fixture(html`<url-params-editor
      .value="${value}"
      readonly></url-params-editor>`);
  }
  /**
   * @return {Promise<UrlParamsEditorElement>}
   */
  async function valueFixture(value) {
    return fixture(html`<url-params-editor
      .value="${value}"></url-params-editor>`);
  }

  describe('Basics', () => {
    let element = /** @type UrlParamsEditorElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('the model is computed', () => {
      const m = element.model;
      assert.typeOf(m, 'object', 'Model is an object');
      assert.equal(m.host, 'https://arc.com:1234', 'Host is computed');
      assert.equal(m.path, '/path/o ther/', 'Path is computed');
      assert.equal(m.anchor, '123', 'Ancor is computed');
      assert.lengthOf(element.queryParameters, 2, 'Search is computed');
    });

    it('[parserValue] is set', () => {
      assert.typeOf(element[parserValue], 'object');
    });

    it('notifies change for a param name', () => {
      const input = /** @type AnypointInput */ (element.shadowRoot.querySelector('.param-name'));
      const spy = sinon.spy();
      element.addEventListener('change', spy);
      input.value = 'a-changed';
      input.dispatchEvent(new Event('change'));
      assert.isTrue(spy.called, 'event is dispatched');
    });

    it('notifies change for a param value', () => {
      const input = /** @type AnypointInput */ (element.shadowRoot.querySelector('.param-value'));
      const spy = sinon.spy();
      element.addEventListener('change', spy);
      input.value = 'a-value';
      input.dispatchEvent(new Event('change'));
      assert.isTrue(spy.called, 'event is dispatched');
    });

    it('notifies change for a param value with variable', () => {
      const input = /** @type AnypointInput */ (element.shadowRoot.querySelector('.param-value'));
      const spy = sinon.spy();
      element.addEventListener('change', spy);
      input.value = 'a-value${test}';
      input.dispatchEvent(new Event('change'));
      assert.isTrue(spy.called, 'event is dispatched');
    });

    it('notifies change for removing search param', () => {
      const spy = sinon.spy();
      element.addEventListener('change', spy);
      const button = /** @type HTMLElement */ (element.shadowRoot.querySelector('.form-row > anypoint-icon-button'));
      button.click();
      assert.isTrue(spy.called, 'event is dispatched');
    });

    it('changes model when value change', () => {
      element.value = 'http://arc.com/o%20ther?test=value';
      const m = element.model;
      assert.equal(m.host, 'http://arc.com', 'Host is computed');
      assert.equal(m.path, '/o%20ther', 'Path is computed');
      assert.equal(m.anchor, '', 'Anchor is computed');
      assert.lengthOf(element.queryParameters, 1, 'Search is computed');
    });

    it('dispatches the urlencode event', () => {
      const spy = sinon.spy();
      element.addEventListener('urlencode', spy);
      const button = /** @type AnypointButton */ (element.shadowRoot.querySelector('#encode'));
      button.click();
      assert.isTrue(spy.calledOnce);
    });

    it('dispatches the urldecode event', () => {
      const spy = sinon.spy();
      element.addEventListener('urldecode', spy);
      const button = /** @type AnypointButton */ (element.shadowRoot.querySelector('#decode'));
      button.click();
      assert.isTrue(spy.calledOnce);
    });
  });

  describe('[valueChanged]()', () => {
    let element = /** @type UrlParamsEditorElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('calls "[computeModel]()"', () => {
      const spy = sinon.spy(element, computeModel);
      element[valueChanged]('http://');
      assert.isTrue(spy.called);
    });

    it('[computeModel]() is called with passed value', () => {
      const spy = sinon.spy(element, computeModel);
      element[valueChanged]('http://');
      assert.equal(spy.args[0][0], 'http://');
    });

    it('[computeModel]() is called with default query parameters model', () => {
      const spy = sinon.spy(element, computeModel);
      element[valueChanged]('http://');
      const params = spy.args[0][1];
      assert.typeOf(params, 'array');
      assert.lengthOf(params, 0);
    });

    it('[computeModel]() is called with computed query model', () => {
      const spy = sinon.spy(element, computeModel);
      const model = [{ name: 'a', value: 'b', enabled: true }];
      element.queryParameters = model;
      element[valueChanged]('http://');
      const params = spy.args[0][1];
      assert.deepEqual(params, model);
    });

    it('does nothing when no value and model', () => {
      element.queryParameters = undefined;
      const spy = sinon.spy(element, computeModel);
      element[valueChanged]('');
      assert.isFalse(spy.called);
    });
  });

  describe('[computeModel]()', () => {
    let element = /** @type UrlParamsEditorElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('sets "model" to empty object when no value', () => {
      element[computeModel](undefined, undefined);
      assert.typeOf(element.model, 'object');
      assert.lengthOf(Object.keys(element.model), 0);
    });

    it('sets "queryParameters" to empty array when no value', () => {
      element[computeModel](undefined, undefined);
      assert.typeOf(element.queryParameters, 'array');
      assert.lengthOf(element.queryParameters, 0);
    });

    it('creates empty query model when missing', () => {
      element[computeModel]('/test', undefined);
      // No error
    });

    it('does not cause errors for missing path', () => {
      element[computeModel]('test', undefined);
      // No error
    });

    it('sets model property', () => {
      element[computeModel]('http://test.com/path?a=b&c=d#hash', undefined);
      assert.typeOf(element.model, 'object');
      assert.equal(element.model.host, 'http://test.com');
      assert.equal(element.model.path, '/path');
      assert.equal(element.model.anchor, 'hash');
    });

    it('Calls [computeSearchParams]()', () => {
      const spy = sinon.spy(element, computeSearchParams);
      element[computeModel]('http://test.com/path?a=b&c=d#hash', undefined);
      assert.isTrue(spy.called);
    });
  });

  describe('[getHostValue]()', () => {
    let element = /** @type UrlParamsEditorElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Build host value', () => {
      const parser = new UrlParser('http://test.com/path');
      const result = element[getHostValue](parser);
      assert.equal(result, 'http://test.com');
    });

    it('Returns protocol only', () => {
      const parser = new UrlParser('http://');
      const result = element[getHostValue](parser);
      assert.equal(result, 'http://');
    });
  });

  describe('[computeSearchParams]()', () => {
    let element = /** @type UrlParamsEditorElement */ (null);
    let parser;
    beforeEach(async () => {
      element = await emptyFixture();
    });

    it('Sets "queryParameters"', () => {
      parser = new UrlParser('/?a=b&c=d');
      element[computeSearchParams](parser, undefined);
      assert.typeOf(element.queryParameters, 'array');
      assert.lengthOf(element.queryParameters, 2);
    });

    it('Adds disabled items to the model', () => {
      const model = [{
        name: 'disabled',
        value: 'true',
        enabled: false
      }];
      parser = new UrlParser('/?a=b&c=d');
      element[computeSearchParams](parser, model);
      assert.typeOf(element.queryParameters, 'array');
      assert.lengthOf(element.queryParameters, 3);
      assert.isFalse(element.queryParameters[0].enabled);
    });

    it('Duplicates the entry keeping enabled / disabled state', () => {
      const model = [{
        name: 'a',
        value: 'b',
        enabled: false
      }];
      parser = new UrlParser('/?a=b&c=d');
      element[computeSearchParams](parser, model);
      assert.typeOf(element.queryParameters, 'array');
      assert.lengthOf(element.queryParameters, 3);
      assert.isFalse(element.queryParameters[0].enabled);
      assert.isTrue(element.queryParameters[1].enabled);
      assert.isTrue(element.queryParameters[2].enabled);
    });

    it('Removes missing query parameters', () => {
      const model = [{
        name: 'a',
        value: 'b',
        enabled: true
      }];
      parser = new UrlParser('/?c=d');
      element[computeSearchParams](parser, model);
      assert.typeOf(element.queryParameters, 'array');
      assert.lengthOf(element.queryParameters, 1);
      assert.equal(element.queryParameters[0].name, 'c');
    });
  });

  describe('[findSearchParam]()', () => {
    let element = /** @type UrlParamsEditorElement */ (null);
    beforeEach(async () => {
      element = await emptyFixture();
    });

    it('Finds a param by name', () => {
      const params = [['test', 'v']];
      const result = element[findSearchParam](params, 'test');
      assert.typeOf(result, 'array');
    });

    it('Returns undefined when no item in the array', () => {
      const params = [['test', 'v']];
      const result = element[findSearchParam](params, 'other');
      assert.isUndefined(result);
    });
  });

  describe('[findModelParam]()', () => {
    let element = /** @type UrlParamsEditorElement */ (null);
    beforeEach(async () => {
      element = await emptyFixture();
    });

    it('Finds item by name', () => {
      const params = [{
        name: 'test',
        enabled: true,
        value: '',
      }];
      const result = element[findModelParam](params, 'test');
      assert.typeOf(result, 'object');
    });

    it('Ignores disabled items', () => {
      const params = [{
        name: 'test',
        enabled: false,
        value: '',
      }];
      const result = element[findModelParam](params, 'test');
      assert.isUndefined(result);
    });

    it('Returns undefined when item not found', () => {
      const params = [{
        name: 'test',
        enabled: true,
        value: '',
      }];
      const result = element[findModelParam](params, 'other');
      assert.isUndefined(result);
    });
  });

  describe('[addParamHandler]()', () => {
    let element = /** @type UrlParamsEditorElement */ (null);
    beforeEach(async () => {
      element = await emptyFixture();
    });

    it('Does nothing in readonly mode', () => {
      element.readOnly = true;
      element[addParamHandler]();
      assert.isUndefined(element.queryParameters);
    });

    it('Sets queryParameters property', () => {
      element[addParamHandler]();
      assert.typeOf(element.queryParameters, 'array');
      assert.lengthOf(element.queryParameters, 1);
    });

    it('Added property is empty', () => {
      element[addParamHandler]();
      const param = element.queryParameters[0];
      assert.equal(param.name, '');
      assert.equal(param.value, '');
      assert.isTrue(param.enabled);
    });

    it('Adds property to existing list', () => {
      element[addParamHandler]();
      element[addParamHandler]();
      assert.lengthOf(element.queryParameters, 2);
    });

    it('notifies resize', async () => {
      const spy = sinon.spy();
      element.addEventListener('resize', spy);
      element[addParamHandler]();
      await element.updateComplete;
      await aTimeout(0);
      assert.isTrue(spy.called);
    });

    it('focuses on the last element', async () => {
      const spy = sinon.spy(element, 'focusLastName');
      element[addParamHandler]();
      await element.updateComplete;
      await aTimeout(0);
      assert.isTrue(spy.called);
    });
  });

  describe('_getValidity()', () => {
    let element = /** @type UrlParamsEditorElement */ (null);
    beforeEach(async () => {
      element = await emptyFixture();
      element.value = 'http://domain.com/path';
      await nextFrame();
    });

    it('Returns true when valid', () => {
      const result = element._getValidity();
      assert.isTrue(result);
    });
  });

  describe('read only editor', () => {
    const value = 'https://arc.com:1234/path/o ther/?a=b&c=d#123';
    let element = /** @type UrlParamsEditorElement */ (null);
    beforeEach(async () => {
      element = await readOnlyFixture(value);
    });

    it('ignores query model computation', () => {
      element.queryParameters[0].value = 'test';
      element[queryModelChanged]();
      assert.equal(element.value, value);
    });
  });

  describe('Disabling parameters', () => {
    const value = 'https://arc.com/?a=b&c=d&e=f';
    let element = /** @type UrlParamsEditorElement */ (null);
    beforeEach(async () => {
      element = await valueFixture(value);
    });

    it('removes query parameter', () => {
      const button = element.shadowRoot.querySelector('anypoint-switch');
      button.click();
      assert.equal(element.value, 'https://arc.com/?c=d&e=f');
    });

    it('re-enables query parameter', async () => {
      const button = element.shadowRoot.querySelector('anypoint-switch');
      button.click();
      await nextFrame();
      button.click();
      assert.equal(element.value, value);
    });

    it('does not change value when adding not enabled model item', () => {
      const item = {
        name: 'test',
        value: 'value',
        enabled: false
      };
      element.queryParameters.push(item);
      element.queryParameters = [...element.queryParameters];
      assert.equal(element.value, value);
    });
  });

  describe('a11y', () => {
    it('is accessible when empty', async () => {
      const element = await emptyFixture();
      await assert.isAccessible(element, {
        ignoredRules: ['color-contrast']
      });
    });

    it('is accessible with all values', async () => {
      const element = await basicFixture();
      await assert.isAccessible(element, {
        ignoredRules: ['color-contrast']
      });
    });
  });
});
