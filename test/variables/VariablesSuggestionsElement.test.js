/* eslint-disable prefer-destructuring */
import { assert, html, fixture, nextFrame, oneEvent } from '@open-wc/testing';
import { MockedStore, VariablesModel } from '@advanced-rest-client/idb-store';
import sinon from 'sinon';
import '../../define/variables-suggestions.js';

/** @typedef {import('@advanced-rest-client/events').Variable.ARCVariable} ARCVariable */
/** @typedef {import('@advanced-rest-client/events').Variable.ARCEnvironment} ARCEnvironment */
/** @typedef {import('../../index').VariablesSuggestionsElement} VariablesSuggestionsElement */

describe('VariablesSuggestionsElement', () => {
  const store = new MockedStore();
  const model = new VariablesModel();

  before(() => {
    model.listen(window);
  });

  after(() => {
    model.unlisten(window);
  });

  /**
   * @returns {Promise<VariablesSuggestionsElement>}
   */
  async function basicFixture() {
    const elm = /** @type VariablesSuggestionsElement */ (await fixture(html`<variables-suggestions></variables-suggestions>`));
    if (!elm.variables) {
      await oneEvent(elm, 'ready');
    }
    return elm;
  }

  /**
   * @returns {Promise<VariablesSuggestionsElement>}
   */
  async function systemFixture() {
    const elm = /** @type VariablesSuggestionsElement */ (await fixture(html`
      <variables-suggestions systemVariablesEnabled></variables-suggestions>
    `));
    if (!elm.variables) {
      await oneEvent(elm, 'ready');
    }
    return elm;
  }

  /**
   * @returns {Promise<Element>}
   */
  async function inputFixture() {
    const tpl = await fixture(html`
    <div>
      <input type="text"/>
      <variables-suggestions opened systemVariablesEnabled></variables-suggestions>
    </div>
    `);
    const elm = tpl.querySelector('variables-suggestions');
    if (!elm.variables) {
      await oneEvent(elm, 'ready');
    }
    return tpl;
  }

  describe('with data', () => {
    /** @type ARCVariable[] */
    let created;

    before(async () => {
      created = await store.insertVariablesAndEnvironments(5, {
        defaultEnv: true,
      });
    });
  
    after(async () => {
      await store.destroyVariables();
    });
  
    describe('view rendering', () => {
      /** @type VariablesSuggestionsElement */
      let element;
      beforeEach(async () => { element = await basicFixture(); });
  
      it('renders the environment variables section', () => {
        const elm = element.shadowRoot.querySelector('.section-label.environment');
        assert.ok(elm, 'the element is rendered');
        assert.equal(elm.textContent.trim(), 'Environment variables', 'the element has the label');
      });
  
      it('does not render empty info for environment', () => {
        const elm = element.shadowRoot.querySelector('.empty-info.environment');
        assert.notOk(elm, 'the element is not rendered');
      });

      it('has all list items', () => {
        const enabled = created.filter(i => i.enabled !== false);
        const items = element.shadowRoot.querySelectorAll('anypoint-item');
        assert.lengthOf(items, enabled.length);
      });

      it('system variables are not rendered by default', () => {
        const elm = element.shadowRoot.querySelector('.section-label.system');
        assert.notOk(elm);
      });

      it('renders system variables label when enabled', async () => {
        element.systemVariablesEnabled = true;
        await nextFrame();
        const elm = element.shadowRoot.querySelector('.section-label.system');
        assert.ok(elm, 'the element is rendered');
        assert.equal(elm.textContent.trim(), 'System variables', 'the element has the label');
      });

      it('does not render empty info for system', () => {
        const elm = element.shadowRoot.querySelector('.empty-info.system');
        assert.notOk(elm, 'the element is not rendered');
      });
    });

    describe('input processing', () => {
      /** @type VariablesSuggestionsElement */
      let element;
      /** @type HTMLInputElement */
      let input;
      beforeEach(async () => { 
        const tpl = await inputFixture(); 
        element = tpl.querySelector('variables-suggestions');
        input = tpl.querySelector('input');
      });

      it('sets and removes aria-owns on the input', () => {
        element.input = input;
        assert.typeOf(element.listId, 'string', 'the element has listId');
        assert.equal(input.getAttribute('aria-owns'), element.listId, 'sets the same id on the input');
        element.input = undefined;
        assert.isFalse(input.hasAttribute('aria-owns'), 'removes the attribute when not originally set');
      });

      it('restores original aria-owns on the input', () => {
        input.setAttribute('aria-owns', 'test-id');
        element.input = input;
        assert.equal(input.getAttribute('aria-owns'), element.listId, 'sets the same id on the input');
        element.input = undefined;
        assert.equal(input.getAttribute('aria-owns'), 'test-id', 'restores the attribute');
      });

      it('sets and removes aria-expanded on the input', () => {
        element.input = input;
        assert.equal(input.getAttribute('aria-expanded'), 'true', 'sets the value on the input');
        element.input = undefined;
        assert.isFalse(input.hasAttribute('aria-expanded'), 'removes the attribute when not originally set');
      });

      it('restores original aria-owns on the input', () => {
        input.setAttribute('aria-expanded', 'unknown');
        element.input = input;
        assert.equal(input.getAttribute('aria-expanded'), 'true', 'sets the value on the input');
        element.input = undefined;
        assert.equal(input.getAttribute('aria-expanded'), 'unknown', 'restores the attribute');
      });

      it('sets and removes aria-autocomplete on the input', () => {
        element.input = input;
        assert.equal(input.getAttribute('aria-autocomplete'), 'none', 'sets the value on the input');
        element.input = undefined;
        assert.isFalse(input.hasAttribute('aria-autocomplete'), 'removes the attribute when not originally set');
      });

      it('restores original aria-owns on the input', () => {
        input.setAttribute('aria-autocomplete', 'both');
        element.input = input;
        assert.equal(input.getAttribute('aria-autocomplete'), 'none', 'sets the value on the input');
        element.input = undefined;
        assert.equal(input.getAttribute('aria-autocomplete'), 'both', 'restores the attribute');
      });

      it('sets and removes aria-activedescendant on the input', () => {
        element.input = input;
        assert.equal(input.getAttribute('aria-activedescendant'), '', 'sets the value on the input');
        element.input = undefined;
        assert.isFalse(input.hasAttribute('aria-activedescendant'), 'removes the attribute when not originally set');
      });

      it('restores original aria-owns on the input', () => {
        input.setAttribute('aria-activedescendant', 'abc');
        element.input = input;
        assert.equal(input.getAttribute('aria-activedescendant'), '', 'sets the value on the input');
        element.input = undefined;
        assert.equal(input.getAttribute('aria-activedescendant'), 'abc', 'restores the attribute');
      });

      it('handles pressing arrow up on the input', () => {
        element.input = input;
        const list = element.shadowRoot.querySelector('anypoint-listbox');
        assert.notOk(list.highlightedItem, 'the list has no highlighted item');
        
        const e = new KeyboardEvent('keydown', {
          code: 'ArrowUp',
          cancelable: true,
        });
        input.dispatchEvent(e);
        assert.isTrue(e.defaultPrevented, 'the event is cancelled');
        
        assert.ok(list.highlightedItem, 'the list has highlighted item');
      });

      it('handles pressing arrow down on the input', () => {
        element.input = input;
        const list = element.shadowRoot.querySelector('anypoint-listbox');
        assert.notOk(list.highlightedItem, 'the list has no highlighted item');
        
        const e = new KeyboardEvent('keydown', {
          code: 'ArrowDown',
          cancelable: true,
        });
        input.dispatchEvent(e);
        assert.isTrue(e.defaultPrevented, 'the event is cancelled');
        assert.ok(list.highlightedItem, 'the list has highlighted item');
      });

      it('handles pressing Enter on the input when opened and not highlighted', () => {
        element.input = input;
        const list = element.shadowRoot.querySelector('anypoint-listbox');
        const [item] = list.items;
        
        const e = new KeyboardEvent('keydown', {
          code: 'Enter',
          cancelable: true,
        });
        input.dispatchEvent(e);
        assert.isTrue(e.defaultPrevented, 'the event is cancelled');
        const { name } = item.dataset;
        assert.equal(input.value, `{${name}}`, 'has the first value');
      });

      it('handles pressing Enter on the input when opened and highlighted', () => {
        element.input = input;
        const list = element.shadowRoot.querySelector('anypoint-listbox');
        list.highlightNext();
        
        const e = new KeyboardEvent('keydown', {
          code: 'Enter',
          cancelable: true,
        });
        input.dispatchEvent(e);
        assert.isTrue(e.defaultPrevented, 'the event is cancelled');
        const { name } = list.highlightedItem.dataset;
        assert.equal(input.value, `{${name}}`, 'has the highlighted value');
      });

      it('ignores Enter when not opened', () => {
        element.input = input;
        element.opened = false;
        const list = element.shadowRoot.querySelector('anypoint-listbox');
        list.highlightNext();
        assert.notOk(list.selectedItem, 'the list has no highlighted item');
        
        const e = new KeyboardEvent('keydown', {
          code: 'Enter',
          cancelable: true,
        });
        input.dispatchEvent(e);
        assert.isFalse(e.defaultPrevented, 'the event is not cancelled');
      });

      it('changes input value when empty', () => {
        element.input = input;
        const item = element.shadowRoot.querySelector('anypoint-item');
        const { name } = item.dataset;
        item.click();
        assert.equal(input.value, `{${name}}`);
      });

      it('resets the list selection', () => {
        element.input = input;
        const item = element.shadowRoot.querySelector('anypoint-item');
        item.click();
        const list = element.shadowRoot.querySelector('anypoint-listbox');
        assert.isUndefined(list.selected);
      });

      it('closes the list', () => {
        element.input = input;
        const item = element.shadowRoot.querySelector('anypoint-item');
        item.click();
        assert.isFalse(element.opened);
      });

      it('changes input value when has value', () => {
        input.value = 'test '
        element.input = input;
        const item = element.shadowRoot.querySelector('anypoint-item');
        const { name } = item.dataset;
        item.click();
        assert.equal(input.value, `test {${name}}`);
      });

      it('changes input value with collapsed selection', () => {
        input.value = 'te st '
        input.selectionStart = 2;
        input.selectionEnd = 2;
        element.input = input;
        const item = element.shadowRoot.querySelector('anypoint-item');
        const { name } = item.dataset;
        item.click();
        assert.equal(input.value, `te{${name}} st `);
      });

      it('changes input value with valid selection', () => {
        input.value = 'te st '
        input.selectionStart = 2;
        input.selectionEnd = 5;
        element.input = input;
        const item = element.shadowRoot.querySelector('anypoint-item');
        const { name } = item.dataset;
        item.click();
        assert.equal(input.value, `te{${name}} `);
      });

      it('dispatches the select when no input', () => {
        const spy = sinon.spy();
        element.addEventListener('select', spy)
        const item = element.shadowRoot.querySelector('anypoint-item');
        const { name } = item.dataset;
        item.click();
        assert.isTrue(spy.calledOnce, 'the event was called');
        const e = spy.args[0][0];
        assert.equal(e.detail, name, 'has the variable name on the detail');
      });

      it('dispatches the select when preferEvent is set', () => {
        element.preferEvent = true;
        element.input = input;
        const spy = sinon.spy();
        element.addEventListener('select', spy)
        const item = element.shadowRoot.querySelector('anypoint-item');
        const { name } = item.dataset;
        item.click();
        assert.isTrue(spy.calledOnce, 'the event was called');
        assert.equal(input.value, '', 'input value is not changed');
        const e = spy.args[0][0];
        assert.equal(e.detail, name, 'has the variable name on the detail');
      });
    });
  });

  describe('with system variables', () => {
    /** @type ARCVariable[] */
    let created;

    before(async () => {
      model.systemVariables = {
        a: 'b',
        c: 'd',
      };
      created = await store.insertVariablesAndEnvironments(5, {
        defaultEnv: true,
      });
    });
  
    after(async () => {
      model.systemVariables = undefined;
      await store.destroyVariables();
    });
  
    describe('view rendering', () => {
       /** @type VariablesSuggestionsElement */
      let element;
      beforeEach(async () => { element = await systemFixture(); });

      it('has all list items', () => {
        const enabled = created.filter(i => i.enabled !== false);
        const items = element.shadowRoot.querySelectorAll('anypoint-item');
        assert.lengthOf(items, enabled.length + 2);
      });
    });
  });
});
