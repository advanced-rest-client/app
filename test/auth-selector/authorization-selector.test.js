import { fixture, assert, html, nextFrame } from '@open-wc/testing';
import sinon from 'sinon';
import '../../define/authorization-method.js';
import '../../define/authorization-selector.js';
import './custom-method.js';
import { dropdownSelected, dropdownValue, notifyChange, nodeToLabel } from '../../src/elements/authorization/AuthorizationSelectorElement.js';

/** @typedef {import('../../index').AuthorizationSelectorElement} AuthorizationSelectorElement */

describe('authorization-selector', () => {
  /**
   * @returns {Promise<AuthorizationSelectorElement>}
   */
  async function basicFixture() {
    return fixture(html`<authorization-selector></authorization-selector>`);
  }

  /**
   * @param {number=} selected
   * @returns {Promise<AuthorizationSelectorElement>}
   */
  async function methodsFixture(selected) {
    return (fixture(html`<authorization-selector .selected="${selected}">
      <authorization-method type="basic"></authorization-method>
      <authorization-method type="ntlm"></authorization-method>
    </authorization-selector>`));
  }

  /**
   * @returns {Promise<AuthorizationSelectorElement>}
   */
  async function singleFixture() {
    return (fixture(html`<authorization-selector>
      <authorization-method type="basic"></authorization-method>
    </authorization-selector>`));
  }

  /**
   * @param {string=} selected
   * @returns {Promise<AuthorizationSelectorElement>}
   */
  async function attrForSelectedFixture(selected) {
    return (fixture(html`<authorization-selector .selected="${selected}" attrforselected="type">
      <authorization-method type="basic"></authorization-method>
      <authorization-method type="ntlm"></authorization-method>
    </authorization-selector>`));
  }

  /**
   * @param {string|number=} selected
   * @returns {Promise<AuthorizationSelectorElement>}
   */
  async function customFixture(selected) {
    return (fixture(html`<authorization-selector .selected="${selected}" attrForLabel="data-label">
      <authorization-method type="basic"></authorization-method>
      <div type="noop-custom"></div>
      <custom-auth-method type="test-custom" data-label="Test custom"></custom-auth-method>
      <div id="not-included"></div>
    </authorization-selector>`));
  }

  /**
   * @returns {Promise<AuthorizationSelectorElement>}
   */
  async function labelsFixture() {
    return (fixture(html`<authorization-selector attrForLabel="data-label">
      <authorization-method type="basic"></authorization-method>
      <authorization-method type="basic" data-label="Test Basic"></authorization-method>
      <custom-auth-method type="test-custom" data-label="Test Custom"></custom-auth-method>
      <custom-auth-method type="other-custom"></custom-auth-method>
      <div type="attribute-custom"></div>
    </authorization-selector>`));
  }

  // /**
  //  * @param {string|number=} selected
  //  * @returns {Promise<AuthorizationSelectorElement>}
  //  */
  // async function authorizeFixture(selected) {
  //   return (fixture(html`<authorization-selector .selected="${selected}">
  //     <authorization-method type="basic"></authorization-method>
  //     <authorization-method type="oauth 2"></authorization-method>
  //   </authorization-selector>`));
  // }

  /**
   * @param {string|number=} selected
   * @returns {Promise<AuthorizationSelectorElement>}
   */
  async function docsFixture(selected) {
    return (fixture(html`
    <authorization-selector .selected="${selected}">
      <authorization-method type="basic" aria-describedby="basicDocs"></authorization-method>
      <div slot="aria" id="basicDocs">basic-docs</div>
      <authorization-method type="oauth 2" aria-describedby="oauth2Docs"></authorization-method>
      <div slot="aria" id="oauth2Docs">basic-docs</div>
    </authorization-selector>`));
  }

  describe('initialization', () => {
    it('can be created by using web APIs', async () => {
      const element = document.createElement('authorization-selector');
      assert.ok(element);
    });

    it('can be created from a template', async () => {
      const element = await basicFixture();
      assert.ok(element);
    });
  });

  describe('#selectable', () => {
    let element = /** @type AuthorizationSelectorElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('reads the value', () => {
      assert.equal(element.selectable, '[type]');
    });

    it('ignores the setter', () => {
      element.selectable = 'test'
      assert.equal(element.selectable, '[type]');
    });
  });

  describe('Children rendering', () => {
    it('renders no authorization method when no selection', async () => {
      const element = await methodsFixture();
      const nodes = element.querySelectorAll('authorization-method');
      const node = Array.from(nodes).some((n) => !n.hasAttribute('hidden'));
      assert.notOk(node, 'all nodes are hidden');
    });

    it('renders selected method only', async () => {
      const element = await methodsFixture(1);
      assert.isFalse(element.querySelector('[type=ntlm]').hasAttribute('hidden'));
      assert.isTrue(element.querySelector('[type=basic]').hasAttribute('hidden'));
    });

    it('renders other method when selection change', async () => {
      const element = await methodsFixture(1);
      element.selected = 0;
      await nextFrame();
      assert.isFalse(element.querySelector('[type=basic]').hasAttribute('hidden'));
      assert.isTrue(element.querySelector('[type=ntlm]').hasAttribute('hidden'));
    });

    it('automatically selects single authorization method', async () => {
      const element = await singleFixture();
      assert.equal(element.selected, 0);
    });
  });

  describe('Selection management', () => {
    it('changes selection when dropdown item is selected', async () => {
      const element = await methodsFixture();
      const option = /** @type HTMLElement */ (element.shadowRoot.querySelector('anypoint-item[data-label="Basic"]'));
      option.click();
      assert.equal(element.selected, 0);
    });

    it('changes selection when dropdown item is selected for attrforselected', async () => {
      const element = await attrForSelectedFixture();
      const option = /** @type HTMLElement */ (element.shadowRoot.querySelector('anypoint-item[data-label="Basic"]'));
      option.click();
      assert.equal(element.selected, 'basic');
    });

    it('changes selection for attrforselected', async () => {
      const element = await attrForSelectedFixture();
      element.selected = 'ntlm';
      assert.isFalse(element.querySelector('[type=ntlm]').hasAttribute('hidden'));
    });

    it('renders selected while initialization method', async () => {
      const element = await attrForSelectedFixture('basic');
      assert.isFalse(element.querySelector('[type=basic]').hasAttribute('hidden'));
    });

    it('sets dropdown selection index', async () => {
      const element = await attrForSelectedFixture('ntlm');
      assert.equal(element[dropdownSelected], 1);
    });
  });

  describe('Dynamic children', () => {
    it('adds new method dynamically to existing methods', async () => {
      const element = await methodsFixture();
      const node = document.createElement('authorization-method');
      node.setAttribute('type', 'oauth 1');
      element.appendChild(node);
      await nextFrame();
      assert.lengthOf(element.items, 3, 'new child is detected');
      // @ts-ignore
      assert.equal(element.items[2].type, 'oauth 1', 'new child is inserted in the right position');
      const options = element.shadowRoot.querySelectorAll('anypoint-item[data-label]');
      assert.lengthOf(options, 3, 'has 3 options in the selector');
    });

    it('removes an option when node is removed', async () => {
      const element = await methodsFixture();
      const node = element.querySelector('[type="basic"]');
      element.removeChild(node);
      await nextFrame();
      assert.lengthOf(element.items, 1, 'the child is removed');
      const options = element.shadowRoot.querySelectorAll('anypoint-item[data-label]');
      assert.lengthOf(options, 1, 'has 1 option in the selector');
    });

    it('removes selection when removing current node', async () => {
      const element = await methodsFixture(0);
      const node = element.querySelector('[type="basic"]');
      element.removeChild(node);
      await nextFrame();
      assert.isUndefined(element.selected, 'selected is undefined');
      assert.isUndefined(element[dropdownSelected], '_dropdownSelected is undefined');
      assert.notOk(element[dropdownValue]._selectedItem, '_selectedItem on the dropdown is undefined');
    });

    it('keeps selection when removed node is not selected', async () => {
      const element = await methodsFixture(1);
      const node = element.querySelector('[type="basic"]');
      element.removeChild(node);
      await nextFrame();
      assert.equal(element.selected, 0);
    });
  });

  describe('Custom authorization methods', () => {
    it('accepts all supported methods', async () => {
      const element = await customFixture();
      assert.lengthOf(element.items, 3, 'has all recognized methods')
    });

    it('accepts label defined on a custom method', async () => {
      const element = await customFixture();
      const option = element.shadowRoot.querySelector('anypoint-item[data-label="Test custom"]');
      assert.ok(option);
    });

    it('selects custom method', async () => {
      const element = await customFixture(2);
      assert.isFalse(element.querySelector('[type=test-custom]').hasAttribute('hidden'));
    });

    it('selects custom method (native element)', async () => {
      const element = await customFixture(1);
      assert.isFalse(element.querySelector('[type=noop-custom]').hasAttribute('hidden'));
    });
  });

  describe('Methods labeling', () => {
    it('sets label for a default method', async () => {
      const element = await labelsFixture();
      const node = element.shadowRoot.querySelector('[data-label=Basic]');
      assert.equal(node.textContent.trim(), 'Basic');
    });

    it('overrides label for a default method', async () => {
      const element = await labelsFixture();
      const node = element.shadowRoot.querySelector('[data-label="Test Basic"]');
      assert.equal(node.textContent.trim(), 'Test Basic');
    });

    it('sets label for an unknown method', async () => {
      const element = await labelsFixture();
      const node = element.shadowRoot.querySelector('[data-label="Test Custom"]');
      assert.equal(node.textContent.trim(), 'Test Custom');
    });

    it('uses type property as a fallback', async () => {
      const element = await labelsFixture();
      const node = element.shadowRoot.querySelector('[data-label="other-custom"]');
      assert.equal(node.textContent.trim(), 'other-custom');
    });

    it('uses type attribute as a fallback', async () => {
      const element = await labelsFixture();
      const node = element.shadowRoot.querySelector('[data-label="attribute-custom"]');
      assert.equal(node.textContent.trim(), 'attribute-custom');
    });
  });

  describe('nodeToLabel()', () => {
    it('returns empty string when no node', () => {
      const result = nodeToLabel(undefined);
      assert.equal(result, '');
    });

    it('returns attribute value for attrForLabel', () => {
      const node = document.createElement('p');
      node.setAttribute('test-label', 'test-value');
      // @ts-ignore
      const result = nodeToLabel(node, 'test-label');
      assert.equal(result, 'test-value');
    });

    it('returns the same "type" property value', () => {
      const node = document.createElement('p');
      // @ts-ignore
      node.type = 'test-type-property';
      // @ts-ignore
      const result = nodeToLabel(node);
      assert.equal(result, 'test-type-property');
    });

    it('returns the same "type" attribute value', () => {
      const node = document.createElement('p');
      node.setAttribute('type', 'test-type-attribute');
      // @ts-ignore
      const result = nodeToLabel(node);
      assert.equal(result, 'test-type-attribute');
    });

    it('returns the "type" property when attrForLabel is not in the passed node', () => {
      const node = document.createElement('p');
      // @ts-ignore
      node.type = 'test-type';
      // @ts-ignore
      const result = nodeToLabel(node, 'test-label');
      assert.equal(result, 'test-type');
    });

    [
      ['none', 'None'],
      ['basic', 'Basic'],
      ['ntlm', 'NTLM'],
      ['digest', 'Digest'],
      ['oauth 1', 'OAuth 1'],
      ['oauth 2', 'OAuth 2'],
      ['client certificate', 'Client certificate'],
    ].forEach(([type, label]) => {
      it(`returns mapped value for ${type}`, () => {
        const node = document.createElement('p');
        // @ts-ignore
        node.type = type;
        // @ts-ignore
        const result = nodeToLabel(node);
        assert.equal(result, label);
      });
    });
  });

  describe('#type', () => {
    it('returns null when no selection', async () => {
      const element = await customFixture();
      assert.strictEqual(element.type, null);
    });

    it('returns value from "type" property', async () => {
      const element = await customFixture(0);
      assert.strictEqual(element.type, 'basic');
    });

    it('returns value from "type" attribute', async () => {
      const element = await customFixture(1);
      assert.strictEqual(element.type, 'noop-custom');
    });
  });

  describe('onchange', () => {
    let element = /** @type AuthorizationSelectorElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Getter returns previously registered handler', () => {
      assert.isUndefined(element.onchange);
      const f = () => {};
      element.onchange = f;
      assert.isTrue(element.onchange === f);
    });

    it('Calls registered function', () => {
      let called = false;
      const f = () => {
        called = true;
      };
      element.onchange = f;
      element[notifyChange]();
      element.onchange = null;
      assert.isTrue(called);
    });

    it('Unregisters old function', () => {
      let called1 = false;
      let called2 = false;
      const f1 = () => {
        called1 = true;
      };
      const f2 = () => {
        called2 = true;
      };
      element.onchange = f1;
      element.onchange = f2;
      element[notifyChange]();
      element.onchange = null;
      assert.isFalse(called1);
      assert.isTrue(called2);
    });
  });

  describe('validate()', () => {
    it('returns true when no selection', async () => {
      const element = await customFixture();
      const result = element.validate();
      assert.isTrue(result);
    });

    it('returns true when no validate function on selected item', async () => {
      const element = await customFixture(1);
      const result = element.validate();
      assert.isTrue(result);
    });

    it('returns result of calling validate function on selected item', async () => {
      const element = await customFixture(0);
      const result = element.validate();
      assert.isFalse(result);
    });
  });

  describe('slotted docs rendering', () => {
    it('hides all docs elements in the aria slot', async () => {
      const element = await docsFixture();
      const nodes = element.querySelectorAll('[slot="aria"]');
      assert.isTrue(nodes[0].hasAttribute('hidden'));
      assert.isTrue(nodes[1].hasAttribute('hidden'));
    });

    it('shows pre-selected description', async () => {
      const element = await docsFixture(0);
      const nodes = element.querySelectorAll('[slot="aria"]');
      assert.isFalse(nodes[0].hasAttribute('hidden'));
      assert.isTrue(nodes[1].hasAttribute('hidden'));
    });

    it('changes rendered docs when selection change', async () => {
      const element = await docsFixture(0);
      element.selected = 1;
      await nextFrame();
      const nodes = element.querySelectorAll('[slot="aria"]');
      assert.isTrue(nodes[0].hasAttribute('hidden'));
      assert.isFalse(nodes[1].hasAttribute('hidden'));
    });
  });

  describe('change event', () => {
    it('dispatches the event when method selection changes', async () => {
      const element = await methodsFixture();
      const spy = sinon.spy();
      element.addEventListener('change', spy);
      const option = /** @type HTMLElement */ (element.shadowRoot.querySelector('anypoint-item[data-label="Basic"]'));
      option.click();
      assert.isTrue(spy.called);
    });

    it('re-targets event from method', async () => {
      const element = await methodsFixture(0); // basic
      const spy = sinon.spy();
      element.addEventListener('change', spy);
      const method = element.querySelector('authorization-method[type="basic"]');
      method.dispatchEvent(new CustomEvent('change')); // non-bubbling
      assert.isTrue(spy.called);
    });
  });

  describe('accessibility', () => {
    it('is accessible when no selection', async () => {
      const element = await methodsFixture();
      await assert.isAccessible(element);
    });

    it('is accessible when selection', async () => {
      const element = await methodsFixture(0);
      await assert.isAccessible(element);
    });

    it('is accessible when no methods', async () => {
      const element = await basicFixture();
      await assert.isAccessible(element);
    });
  });
});
