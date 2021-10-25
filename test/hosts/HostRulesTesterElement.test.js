import { fixture, assert, html } from '@open-wc/testing';
import { resultValue, evaluate } from '../../src/elements/hosts/HostRulesTesterElement.js';
import '../../define/host-rules-tester.js';

/** @typedef {import('../../index').HostRulesTesterElement} HostRulesTesterElement */

describe('HostRulesTesterElement', () => {
  /**
   * @return {Promise<HostRulesTesterElement>} 
   */
  async function basicFixture() {
    return fixture(html`<host-rules-tester></host-rules-tester>`);
  }

  describe('basics', () => {
    let element = /** @type HostRulesTesterElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
    });

    const rules = [{
      from: 'domain.com',
      to: 'localhost'
    }];

    it('sets URL when input value change', () => {
      const input  = element.shadowRoot.querySelector('anypoint-input');
      input.value = 'https://domain.com';
      input.dispatchEvent(new Event('input'));
      assert.equal(element.url, input.value);
    });

    it('Sets error when rules are not set', () => {
      element.testUrl();
      assert.equal(element[resultValue], 'Define rules first.');
    });

    it('Sets error when url is not set', () => {
      element.rules = rules;
      element.testUrl();
      assert.equal(element[resultValue], 'Define the URL first.');
    });

    it('Evaluates the rules', () => {
      element.rules = rules;
      element.url = 'domain.com/test';
      element.testUrl();
      assert.equal(element[resultValue], 'localhost/test');
    });

    it('evaluates the rule on enter', () => {
      const input  = element.shadowRoot.querySelector('anypoint-input');
      const e = new KeyboardEvent('keydown', {
        composed: true,
        cancelable: true,
        bubbles: true,
        key: 'Enter',
        code: 'Enter',
      });
      input.dispatchEvent(e);
      assert.equal(element[resultValue], 'Define rules first.');
    });
  });

  describe('[evaluate]()', () => {
    let element = /** @type HostRulesTesterElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
    });

    const rules = [{
      from: 'domain.com',
      to: 'localhost',
      enabled: true
    }, {
      from: 'other.com',
      to: '127.0.0.1',
      enabled: false
    }, {
      from: '',
      to: '192.168.1.1',
      enabled: true
    }];

    it('evaluates a rule', () => {
      element.url = 'https://domain.com/path';
      element.rules = rules;
      const result = element[evaluate]();
      assert.equal(result, 'https://localhost/path');
    });

    it('ignores disabled rules', () => {
      element.url = 'https://other.com/path';
      element.rules = rules;
      const result = element[evaluate]();
      assert.equal(result, 'https://other.com/path');
    });

    it('ignores rules without "from" value', () => {
      element.url = '';
      element.rules = rules;
      const result = element[evaluate]();
      assert.equal(result, '');
    });

    it('executes rules in order', () => {
      const items = Array.from(rules);
      items.push({
        from: 'localhost',
        to: '192.168.1.1',
        enabled: true
      });
      element.url = 'https://domain.com/path';
      element.rules = items;
      const result = element[evaluate]();
      assert.equal(result, 'https://192.168.1.1/path');
    });
  });
});
