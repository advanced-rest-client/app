import { RequestEvents } from '@advanced-rest-client/events';
/* eslint-disable no-template-curly-in-string */
import { fixture, html, assert, nextFrame, aTimeout } from '@open-wc/testing';
import sinon from 'sinon';
import '../../define/headers-editor.js';
import { viewModel, autocompleteRef, resetCopyState } from '../../src/elements/headers/internals.js';

const hasPartsApi = 'part' in document.createElement('span');

/** @typedef {import('../../index').HeadersEditorElement} HeadersEditorElement */
/** @typedef {import('@anypoint-web-components/awc').AnypointInputElement} AnypointInput */
/** @typedef {import('@anypoint-web-components/awc').AnypointSwitchElement} AnypointSwitch */
/** @typedef {import('@anypoint-web-components/awc').AnypointButtonElement} AnypointButton */

describe('HeadersEditorElement', () => {
  /**
   * @return {Promise<HeadersEditorElement>}
   */
  async function basicFixture() {
    return fixture(html`<headers-editor></headers-editor>`);
  }

  /**
   * @param {string} value
   * @return {Promise<HeadersEditorElement>}
   */
  async function valueFixture(value) {
    return fixture(html`<headers-editor .value="${value}"></headers-editor>`);
  }

  describe('constructor()', () => {
    let element = /** @type HeadersEditorElement */(null);
    beforeEach(async () => { element = await basicFixture() });

    it('sets empty view model', () => {
      assert.deepEqual(element.model, []);
    });

    it('sets default value', () => {
      assert.equal(element.value, '');
    });

    it('sets default editor', () => {
      assert.isFalse(element.source);
    });
  });

  describe('#value', () => {
    let element = /** @type HeadersEditorElement */(null);
    beforeEach(async () => { element = await basicFixture() });

    it('creates the view model', () => {
      element.value = 'test: value';
      assert.deepEqual(element.model, [{ name: 'test', value: 'value', enabled: true }]);
    });

    it('does not dispatch the change event from value setter', () => {
      const spy = sinon.spy();
      element.addEventListener('change', spy);
      element.value = 'test: value';
      assert.isFalse(spy.called);
    });

    it('sets empty view model when no value', () => {
      element.value = null;
      assert.deepEqual(element.model, []);
    });
  });

  describe('#model', () => {
    let element = /** @type HeadersEditorElement */(null);
    beforeEach(async () => { element = await basicFixture() });

    it('sets value from the view model', () => {
      element.model = [{ name: 'test', value: 'value', enabled: true }];
      assert.equal(element.value, 'test: value');
    });

    it('does not dispatch the change event from value setter', () => {
      const spy = sinon.spy();
      element.addEventListener('change', spy);
      element.model = [{ name: 'test', value: 'value', enabled: true }];
      assert.isFalse(spy.called);
    });

    it('sets empty view model when no value', () => {
      element.model = [];
      assert.equal(element.value, '');
    });

    it('ignores invalid values', () => {
      element.model = null;
      assert.deepEqual(element.model, []);
    });
  });

  describe('updateHeader()', () => {
    let element = /** @type HeadersEditorElement */(null);
    beforeEach(async () => { element = await basicFixture() });

    it('adds a new header', () => {
      element.updateHeader('test', 'value');
      assert.deepEqual(element.model, [{ name: 'test', value: 'value', enabled: true }]);
    });

    it('replaces existing model item', () => {
      element[viewModel] = [{ name: 'test', value: 'value', enabled: true }];
      element.updateHeader('test', 'other');
      assert.deepEqual(element.model, [{ name: 'test', value: 'other', enabled: true }]);
    });
  });

  describe('removeHeader()', () => {
    let element = /** @type HeadersEditorElement */(null);
    beforeEach(async () => { element = await basicFixture() });

    it('ignores when no header', () => {
      element[viewModel] = [{ name: 'test', value: 'value', enabled: true }];
      element.removeHeader('other');
      assert.deepEqual(element.model, [{ name: 'test', value: 'value', enabled: true }]);
    });

    it('removes existing model item', () => {
      element[viewModel] = [{ name: 'test', value: 'value', enabled: true }, { name: 'other', value: 'value', enabled: true }];
      element.removeHeader('other');
      assert.deepEqual(element.model, [{ name: 'test', value: 'value', enabled: true }]);
    });
  });

  describe('add()', () => {
    let element = /** @type HeadersEditorElement */(null);
    beforeEach(async () => { element = await basicFixture() });

    it('adds new header', () => {
      element.add();
      assert.deepEqual(element.model, [{ name: '', value: '', enabled: true }]);
    });
  });

  describe('[contentTypeHandler]()', () => {
    let element = /** @type HeadersEditorElement */(null);
    beforeEach(async () => { element = await basicFixture() });

    it('adds the header when not on the list', () => {
      RequestEvents.State.contentTypeChange(document.body, 'x-test');
      assert.deepEqual(element.model, [{ name: 'content-type', value: 'x-test', enabled: true }]);
    });

    it('replaces the header', () => {
      element[viewModel] = [{ name: 'content-type', value: 'value', enabled: true }];
      RequestEvents.State.contentTypeChange(document.body, 'x-test');
      assert.deepEqual(element.model, [{ name: 'content-type', value: 'x-test', enabled: true }]);
    });

    it('ignores other properties', () => {
      element[viewModel] = [{ name: 'content-type', value: 'value', enabled: true }];
      RequestEvents.State.urlChange(document.body, 'x-test');
      assert.deepEqual(element.model, [{ name: 'content-type', value: 'value', enabled: true }]);
    });
  });

  describe('list rendering', () => {
    const headers = `content-type: x-value
accept: */*
accept-encoding: gzip`;
    let element = /** @type HeadersEditorElement */(null);
    beforeEach(async () => { element = await valueFixture(headers) });

    it('renders all list items', () => {
      const nodes = element.shadowRoot.querySelectorAll('.form-row');
      assert.lengthOf(nodes, 3);
    });

    it('all items are enabled', () => {
      const nodes = element.shadowRoot.querySelectorAll('.form-row anypoint-switch');
      Array.from(nodes).forEach((node) => {
        // @ts-ignore
        assert.isTrue(node.checked);
      });
    });

    it('renders name fields', () => {
      const nodes = element.shadowRoot.querySelectorAll('.param-name');
      assert.lengthOf(nodes, 3);
      // @ts-ignore
      assert.equal(nodes[0].value, 'content-type');
      // @ts-ignore
      assert.equal(nodes[1].value, 'accept');
      // @ts-ignore
      assert.equal(nodes[2].value, 'accept-encoding');
    });

    it('renders value fields', () => {
      const nodes = element.shadowRoot.querySelectorAll('.param-value');
      assert.lengthOf(nodes, 3);
      // @ts-ignore
      assert.equal(nodes[0].value, 'x-value');
      // @ts-ignore
      assert.equal(nodes[1].value, '*/*');
      // @ts-ignore
      assert.equal(nodes[2].value, 'gzip');
    });

    it('renders all remove buttons', () => {
      const nodes = element.shadowRoot.querySelectorAll('.form-row anypoint-icon-button');
      assert.lengthOf(nodes, 3);
    });

    it('render the add button', () => {
      const node = element.shadowRoot.querySelector('.add-param');
      assert.ok(node);
    });

    it('adds new model item from the button add button', () => {
      const node = element.shadowRoot.querySelector('.add-param');
      // @ts-ignore
      node.click();
      assert.deepEqual(element.model.pop(), { name: '', value: '', enabled: true });
    });
  });

  describe('Removing an item', () => {
    const headers = `content-type: x-value
accept: */*
accept-encoding: gzip`;
    let element = /** @type HeadersEditorElement */(null);
    beforeEach(async () => { element = await valueFixture(headers) });

    it('removes an item from the view', async () => {
      const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('.form-row anypoint-icon-button'));
      node.click();
      await aTimeout(0);
      assert.lengthOf(element.model, 2);
    });

    it('notifies the change', async () => {
      const spy = sinon.spy();
      element.addEventListener('change', spy);
      const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('.form-row anypoint-icon-button'));
      node.click();
      await aTimeout(0);
      assert.isTrue(spy.called);
    });
  });

  describe('Autocomplete focus', () => {
    let element = /** @type HeadersEditorElement */(null);
    beforeEach(async () => { 
      element = await basicFixture(); 
      element.model = [{ name: '', value: '', enabled: true }];
      await nextFrame();
    });

    it('sets autocomplete target to the name filed', async () => {
      const node = /** @type AnypointInput */ (element.shadowRoot.querySelector('.param-name'));
      node.focus();
      assert.isTrue(element[autocompleteRef].target === node);
    });

    it('sets suggestions for the name', async () => {
      const node = /** @type AnypointInput */ (element.shadowRoot.querySelector('.param-name'));
      node.focus();
      assert.isAbove(element[autocompleteRef].source.length, 0);
    });

    it('sets suggestions only once', async () => {
      const node = /** @type AnypointInput */ (element.shadowRoot.querySelector('.param-name'));
      node.focus();
      await nextFrame();
      node.blur();
      node.focus();
      assert.isAbove(element[autocompleteRef].source.length, 0);
    });

    it('sets autocomplete target to the value filed', async () => {
      element.model[0].name = 'content-type';
      const node = /** @type AnypointInput */ (element.shadowRoot.querySelector('.param-value'));
      node.focus();
      assert.isTrue(element[autocompleteRef].target === node);
    });

    it('sets suggestions for the value', async () => {
      element.model[0].name = 'content-type';
      const node = /** @type AnypointInput */ (element.shadowRoot.querySelector('.param-value'));
      node.focus();
      assert.isAbove(element[autocompleteRef].source.length, 0);
    });

    it('does not set suggestions when no header name', async () => {
      const node = /** @type AnypointInput */ (element.shadowRoot.querySelector('.param-value'));
      node.focus();
      assert.isUndefined(element[autocompleteRef].source);
    });

    it('does not set suggestions when unknown header', async () => {
      element.model[0].name = 'abc';
      const node = /** @type AnypointInput */ (element.shadowRoot.querySelector('.param-value'));
      node.focus();
      assert.isUndefined(element[autocompleteRef].source);
    });
  });

  describe('Switching editors', () => {
    const headers = `content-type: x-value
accept: */*
accept-encoding: gzip`;
    let element = /** @type HeadersEditorElement */(null);
    beforeEach(async () => { element = await valueFixture(headers) });

    it('switches editor from the switch button', async () => {
      const button = /** @type AnypointSwitch */ (element.shadowRoot.querySelector('.editor-switch'));
      button.click();
      assert.isTrue(element.source, 'source model is enabled');
      await nextFrame();
      const node = element.shadowRoot.querySelector('.raw-editor');
      assert.ok(node, 'Code mirror element is in the dom');
    });

    it('editor has the value', async () => {
      const button = /** @type AnypointSwitch */ (element.shadowRoot.querySelector('.editor-switch'));
      button.click();
      await nextFrame();
      const node = element.shadowRoot.querySelector('.raw-editor');
      assert.equal(node.textContent, headers);
    });

    it('updates the model and the value form the editor', async () => {
      const button = /** @type AnypointSwitch */ (element.shadowRoot.querySelector('.editor-switch'));
      button.click();
      await nextFrame();
      const node = element.shadowRoot.querySelector('.raw-editor');
      node.textContent = 'a: b';
      node.dispatchEvent(new Event('input'))

      assert.equal(element.value, 'a: b');
      assert.deepEqual(element.model, [{ name: 'a', value: 'b', enabled: true }]);
    });

    it('does not render the add button in source mode', async () => {
      element.source = true;
      await nextFrame();
      const node = element.shadowRoot.querySelector('.add-param');
      assert.notOk(node);
    });
  });

  describe('Enable / disable form item', () => {
    const headers = `content-type: x-value
accept: */*
accept-encoding: gzip`;
    let element = /** @type HeadersEditorElement */(null);
    beforeEach(async () => { element = await valueFixture(headers) });

    it('removes the header from the value', async () => {
      const button = /** @type AnypointSwitch */ (element.shadowRoot.querySelector('.param-switch'));
      button.click();
      assert.equal(element.value, 'accept: */*\naccept-encoding: gzip');
    });

    it('updates the view model', async () => {
      const button = /** @type AnypointSwitch */ (element.shadowRoot.querySelector('.param-switch'));
      button.click();
      assert.isFalse(element.model[0].enabled);
    });

    it('dispatches the change event', async () => {
      const button = /** @type AnypointSwitch */ (element.shadowRoot.querySelector('.param-switch'));
      const spy = sinon.spy();
      element.addEventListener('change', spy);
      button.click();
      assert.isTrue(spy.called);
    });
  });

  describe('[copyHandler]()', () => {
    const headers = `content-type: x-value
accept: */*
accept-encoding: gzip`;
    let element = /** @type HeadersEditorElement */(null);
    beforeEach(async () => { element = await valueFixture(headers) });

    it('changes the label', async () => {
      const button = /** @type AnypointButton */(element.shadowRoot.querySelector('.copy-button'));
      button.click();
      await aTimeout(10);
      assert.notEqual(button.innerText.trim().toLowerCase(), 'copy');
    });

    it('disables the button', (done) => {
      setTimeout(async () => {
        const button = /** @type AnypointButton */(element.shadowRoot.querySelector('.copy-button'));
        button.click();
        await aTimeout(10);
        assert.isTrue(button.disabled);
        done();
      });
    });

    (hasPartsApi ? it : it.skip)(
      'Adds content-action-button-disabled to the button',
      async () => {
        const button = /** @type AnypointButton */(element.shadowRoot.querySelector('.copy-button'));
        button.click();
        await aTimeout(10);
        // @ts-ignore
        assert.isTrue(button.part.contains('content-action-button-disabled'));
      }
    );

    (hasPartsApi ? it : it.skip)(
      'Adds code-content-action-button-disabled to the button',
      async () => {
        const button = /** @type AnypointButton */(element.shadowRoot.querySelector('.copy-button'));
        button.click();
        await aTimeout(10);
        // @ts-ignore
        assert.isTrue(button.part.contains('code-content-action-button-disabled'));
      }
    );
  });

  describe('[resetCopyState]()', () => {
    let element = /** @type HeadersEditorElement */(null);
    beforeEach(async () => { element = await valueFixture('accept: */*'); });

    it('Changes label back', (done) => {
      setTimeout(() => {
        const button = /** @type AnypointButton */(element.shadowRoot.querySelector('.copy-button'));
        button.innerText = 'test';
        // @ts-ignore
        element[resetCopyState](button);
        assert.equal(button.innerText.trim().toLowerCase(), 'copy');
        done();
      });
    });

    it('Restores disabled state', (done) => {
      setTimeout(() => {
        const button = /** @type AnypointButton */(element.shadowRoot.querySelector('.copy-button'));
        button.click();
        button.disabled = true;
        // @ts-ignore
        element[resetCopyState](button);
        assert.isFalse(button.disabled);
        done();
      });
    });

    (hasPartsApi ? it : it.skip)(
      'Removes content-action-button-disabled part from the button',
      async () => {
        await aTimeout(0);
        const button = /** @type AnypointButton */(element.shadowRoot.querySelector('.copy-button'));
        button.click();
        // @ts-ignore
        element[resetCopyState](button);
        assert.isFalse(button.part.contains('content-action-button-disabled'));
      }
    );

    (hasPartsApi ? it : it.skip)(
      'Removes code-content-action-button-disabled part from the button',
      async () => {
        await aTimeout(0);
        const button = /** @type AnypointButton */(element.shadowRoot.querySelector('.copy-button'));
        button.click();
        // @ts-ignore
        element[resetCopyState](button);
        assert.isFalse(
          button.part.contains('code-content-action-button-disabled')
        );
      }
    );
  });

  describe('[copyActionButtonTemplate]()', () => {
    let element = /** @type HeadersEditorElement */(null);
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('should render copy button disabled when there are no headers', () => {
      const button = /** @type AnypointButton */ (element.shadowRoot.querySelector('.copy-button'));
      assert.isTrue(button.disabled);
    });

    it('should render copy button not disabled when there is at least one header', async () => {
      const headers = `content-type: x-value
accept: */*
accept-encoding: gzip`;
      element = await valueFixture(headers);
      await aTimeout(0);
      const button = /** @type AnypointButton */ (element.shadowRoot.querySelector('.copy-button'));
      assert.isNotTrue(button.disabled);
    });
  })
});
