import { fixture, assert, html, nextFrame } from '@open-wc/testing';
import sinon from 'sinon';
import '../../define/authorization-method.js';
import '../../define/authorization-selector.js';
import './custom-method.js';
// import { dropdownSelected, dropdownValue, notifyChange, nodeToLabel } from '../src/AuthorizationSelectorElement.js';

/** @typedef {import('../../index').AuthorizationSelectorElement} AuthorizationSelectorElement */
/** @typedef {import('@anypoint-web-components/awc').AnypointSwitchElement} AnypointSwitch */

describe('authorization-selector', () => {

  /**
   * @param {number=} selected
   * @param {number[]=} enabled
   * @returns {Promise<AuthorizationSelectorElement>}
   */
  async function methodsFixture(selected, enabled=[]) {
    return (fixture(html`<authorization-selector .selected="${selected}" .selectedValues="${enabled}" multi>
      <authorization-method type="basic"></authorization-method>
      <authorization-method type="ntlm"></authorization-method>
    </authorization-selector>`));
  }

  /**
   * @param {number=} selected
   * @param {number[]=} enabled
   * @returns {Promise<AuthorizationSelectorElement>}
   */
  async function selectionFixture(selected, enabled=[]) {
    return (fixture(html`<authorization-selector .selected="${selected}" .selectedValues="${enabled}" multi>
      <authorization-method type="basic"></authorization-method>
      <authorization-method type="bearer"></authorization-method>
      <authorization-method type="ntlm"></authorization-method>
    </authorization-selector>`));
  }

  describe('dropdown selector rendering', () => {
    let element = /** @type AuthorizationSelectorElement */ (null);
    beforeEach(async () => {
      element = await methodsFixture(0);
    });

    it('renders the toggle button', () => {
      const nodes = element.shadowRoot.querySelectorAll('.auth-listbox anypoint-switch');
      assert.lengthOf(nodes, 2);
    });

    it('adds method to selectedValues on click', () => {
      const nodes = element.shadowRoot.querySelectorAll('.auth-listbox anypoint-switch');
      const button = /** @type AnypointSwitch */ (nodes[0]);
      button.click();
      assert.deepEqual(element.selectedValues, [0])
    });

    it('removes the method from selectedValues on click', async () => {
      const nodes = element.shadowRoot.querySelectorAll('.auth-listbox anypoint-switch');
      const button = /** @type AnypointSwitch */ (nodes[0]);
      button.click();
      await nextFrame();
      button.click();
      assert.deepEqual(element.selectedValues, []);
    });

    it('does not make item selected on switch click', () => {
      const nodes = element.shadowRoot.querySelectorAll('.auth-listbox anypoint-switch');
      const button = /** @type AnypointSwitch */ (nodes[1]);
      button.click();
      assert.deepEqual(element.selected, 0)
    });
  });

  describe('selection management', () => {
    let element = /** @type AuthorizationSelectorElement */ (null);
    beforeEach(async () => {
      element = await selectionFixture(0, [0, 1]);
    });

    it('renders the selected item', () => {
      const node = element.querySelector('authorization-method[type="basic"]');
      assert.isFalse(node.hasAttribute('hidden'));
    });

    it('renders enabled items', () => {
      const nodes = element.shadowRoot.querySelectorAll('.auth-listbox anypoint-switch');
      const button1 = /** @type AnypointSwitch */ (nodes[0]);
      const button2 = /** @type AnypointSwitch */ (nodes[1]);
      const button3 = /** @type AnypointSwitch */ (nodes[2]);
      assert.isTrue(button1.checked);
      assert.isTrue(button2.checked);
      assert.isFalse(button3.checked);
    });

    it('selects another item', async () => {
      element.selected = 2;
      await nextFrame();
      const basicNode = element.querySelector('authorization-method[type="basic"]');
      assert.isTrue(basicNode.hasAttribute('hidden'));
      const ntlmNode = element.querySelector('authorization-method[type="ntlm"]');
      assert.isFalse(ntlmNode.hasAttribute('hidden'));
    });

    it('does not enables the item when selecting it', async () => {
      const nodes = element.shadowRoot.querySelectorAll('.auth-listbox anypoint-icon-item');
      const button = /** @type AnypointSwitch */ (nodes[2]);
      button.click();
      await nextFrame();
      assert.equal(element.selected, 2);
      assert.deepEqual(element.selectedValues, [0, 1]);
    });

    it('notifies the change when changing enabled state', () => {
      const spy = sinon.spy();
      element.addEventListener('change', spy);
      const nodes = element.shadowRoot.querySelectorAll('.auth-listbox anypoint-switch');
      const button = /** @type AnypointSwitch */ (nodes[1]);
      button.click();
      assert.isTrue(spy.calledOnce);
    });

    it('click on the auth method does not change the selection', () => {
      const spy = sinon.spy();
      element.addEventListener('change', spy);
      const ntlmNode = /** @type HTMLElement */ (element.querySelector('authorization-method[type="ntlm"]'));
      ntlmNode.click();
      assert.isFalse(spy.called, 'change event is not dispatched');
      assert.equal(element.selected, 0, 'selected is not changed');
      assert.deepEqual(element.selectedValues, [0, 1], 'multi selection is not changed');
    });
  });

  describe('#type', () => {
    let element = /** @type AuthorizationSelectorElement */ (null);
    beforeEach(async () => {
      element = await selectionFixture(0, [0, 1]);
    });

    it('returns an array of selected types', () => {
      assert.deepEqual(element.type, ['basic', 'bearer']);
    });
  });
});
