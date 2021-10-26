/* eslint-disable no-continue */
import { fixture, assert, html, nextFrame } from '@open-wc/testing';
import sinon from 'sinon';
import '../../define/arc-request-config.js';

/** @typedef {import('../../index').ArcRequestConfigElement} ArcRequestConfigElement */
/** @typedef {import('@anypoint-web-components/awc').AnypointButtonElement} AnypointButtonElement */
/** @typedef {import('@anypoint-web-components/awc').AnypointInputElement} AnypointInputElement */

describe('<request-config>', () => {

  /**
   * @param {any=} config
   * @returns {Promise<ArcRequestConfigElement>}
   */
  async function basicFixture(config) {
    return fixture(html`
      <arc-request-config .config="${config}"></arc-request-config>
    `);
  }

  describe('no configuration', () => {
    let element = /** @type ArcRequestConfigElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('disables inputs', () => {
      const switches = element.shadowRoot.querySelectorAll('anypoint-switch');
      for (let i = 0; i < switches.length; i++) {
        const node = switches[i];
        if (node.name === 'enabled') {
          continue;
        }
        assert.isTrue(node.disabled, `${node.name} is disabled`);
      }
      const inputs = element.shadowRoot.querySelectorAll('anypoint-input');
      for (let i = 0; i < inputs.length; i++) {
        const node = inputs[i];
        assert.isTrue(node.disabled, `${node.name} is disabled`);
      }
    });

    it('enable button is not disabled', () => {
      const button = /** @type AnypointButtonElement */ (element.shadowRoot.querySelector('[name="enabled"]'));
      assert.notEqual(button.disabled, true);
    });

    it('enables inputs when enabled clicked', async () => {
      const button = /** @type AnypointButtonElement */ (element.shadowRoot.querySelector('[name="enabled"]'));
      button.click();
      await nextFrame();
      assert.isTrue(element.config.enabled, 'sets config.enabled');
      const switches = element.shadowRoot.querySelectorAll('anypoint-switch');
      for (let i = 0; i < switches.length; i++) {
        const node = switches[i];
        if (node.name === 'enabled') {
          continue;
        }
        assert.isFalse(node.disabled, `${node.name} is enabled`);
      }
      const inputs = element.shadowRoot.querySelectorAll('anypoint-input');
      for (let i = 0; i < inputs.length; i++) {
        const node = inputs[i];
        assert.isFalse(node.disabled, `${node.name} is enabled`);
      }
    });

    it('sets default config', () => {
      const button = /** @type AnypointButtonElement */ (element.shadowRoot.querySelector('[name="enabled"]'));
      button.click();
      assert.deepEqual(element.config, {
        enabled: true,
        timeout: 90,
        followRedirects: false,
        ignoreSessionCookies: false,
      });
    });
  });

  describe('with model', () => {
    let element = /** @type ArcRequestConfigElement */ (null);
    let model;
    beforeEach(async () => {
      model = {
        enabled: true,
        timeout: 50,
        followRedirects: true,
        validateCertificates: true,
        nativeTransport: true,
        defaultHeaders: true,
        ignoreSessionCookies: true,
      };
      element = await basicFixture(model);
    });
    // switches
    [
      'enabled', 'followRedirects', 'validateCertificates', 'nativeTransport',
      'defaultHeaders', 'ignoreSessionCookies'
    ]
    .forEach((prop) => {
      it(`checks ${prop} input`, () => {
        assert.isTrue(element.config[prop]);
      });

      it(`toggles ${prop} input`, () => {
        const button = /** @type AnypointButtonElement */ (element.shadowRoot.querySelector(`[name="${prop}"]`));
        button.click();
        assert.isFalse(element.config[prop]);
      });

      it(`notifies value change for ${prop}`, () => {
        const spy = sinon.spy();
        element.addEventListener('change', spy);
        const button = /** @type AnypointButtonElement */ (element.shadowRoot.querySelector(`[name="${prop}"]`));
        button.click();
        assert.isTrue(spy.called);
      });
    });
    // text inputs
    [
      ['timeout', 50, 100]
    ]
    .forEach(([prop, value, change]) => {
      it(`sets ${prop} value`, () => {
        const input = /** @type AnypointInputElement */ (element.shadowRoot.querySelector(`[name="${prop}"]`));
        assert.equal(input.value, value);
      });

      it(`changes ${prop} on input`, () => {
        const input = /** @type AnypointInputElement */ (element.shadowRoot.querySelector(`[name="${prop}"]`));
        input.value = change;
        assert.equal(element.config[prop], change);
      });

      it(`notifies value change for ${prop}`, () => {
        const spy = sinon.spy();
        element.addEventListener('change', spy);
        const input = /** @type AnypointInputElement */ (element.shadowRoot.querySelector(`[name="${prop}"]`));
        input.value = change;
        assert.isTrue(spy.called);
      });
    });
  });

  describe('a11y', () => {
    it('is accessible when not enabled', async () => {
      const element = await basicFixture();
      await assert.isAccessible(element);
    });

    it('is accessible when enabled', async () => {
      const model = {
        enabled: true,
        timeout: 50,
        followRedirects: true,
        validateCertificates: true,
        nativeTransport: true,
        defaultHeaders: true,
        ignoreSessionCookies: true,
      };
      const element = await basicFixture(model);
      await assert.isAccessible(element);
    });
  });
});
