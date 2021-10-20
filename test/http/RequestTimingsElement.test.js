import { fixture, assert, nextFrame } from '@open-wc/testing';
import '../../define/request-timings.js';
import { 
  roundTime, 
  computeSum, 
  computeTimings, 
  requestTime,
  connectTime,
  receiveTime,
  sendTime,
  waitTime,
  blockedTime,
  dnsTime,
  sslTime,
} from '../../src/elements/http/internals.js';

/** @typedef {import('../../index').RequestTimingsElement} RequestTimingsElement */
/** @typedef {import('@anypoint-web-components/awc').AnypointProgressElement} AnypointProgressElement */

describe('RequestTimingsElement', () => {
  /**
   * @returns {Promise<RequestTimingsElement>}
   */
  async function basicFixture() {
    return fixture(`<request-timings></request-timings>`);
  }

  describe('[roundTime]()', () => {
    let element = /** @type RequestTimingsElement */(null);
    before(async () => {
      element = await basicFixture();
    });

    it('returns "unknown" when not a number', () => {
      const result = element[roundTime](undefined);
      assert.equal(result, 'unknown');
    });

    it('returns the same integer', () => {
      const result = element[roundTime](10);
      assert.equal(result, '10');
    });

    it('rounds the number', () => {
      const result = element[roundTime](7.751456734);
      assert.equal(result, '7.7515');
    });

    it('rounds number as string', () => {
      // @ts-ignore
      const result = element[roundTime]('7.751456734');
      assert.equal(result, '7.7515');
    });
  });

  describe('[computeSum]()', () => {
    let element = /** @type RequestTimingsElement */(null);
    before(async () => {
      element = await basicFixture();
    });

    it('sums two numbers', () => {
      const result = element[computeSum](1, 2);
      assert.equal(result, 3);
    });

    it('sums two numbers as string', () => {
      // @ts-ignore
      const result = element[computeSum]('1', '2');
      assert.equal(result, 3);
    });

    it('sums when first is missing', () => {
      const result = element[computeSum](undefined, 2);
      assert.equal(result, 2);
    });

    it('sums when second is missing', () => {
      const result = element[computeSum](2, undefined);
      assert.equal(result, 2);
    });

    it('ignores negative first argument', () => {
      const result = element[computeSum](-1, 2);
      assert.equal(result, 2);
    });

    it('ignores negative second argument', () => {
      const result = element[computeSum](1, -2);
      assert.equal(result, 1);
    });
  });

  describe('[computeTimings]()', () => {
    let element = /** @type RequestTimingsElement */(null);
    let timings;
    beforeEach(async () => {
      element = await basicFixture();
      timings = {
        blocked: 7.751456734,
        dns: 279.3812349,
        connect: 883.1201243,
        ssl: 633.0517329,
        send: 0.2900234,
        wait: 649.8810009,
        receive: 1.7121211
      };
    });

    it('computes _fullTime', () => {
      element.timings = timings;
      assert.equal(element[requestTime], 2455.187694234);
    });

    it('computes values when no timings', () => {
      element[computeTimings](undefined);
      assert.equal(element[requestTime], 0, 'fulltime is 0');
      assert.isUndefined(element[connectTime], 'connect is 0');
      assert.isUndefined(element[receiveTime], 'receive is 0');
      assert.isUndefined(element[sendTime], 'send is 0');
      assert.isUndefined(element[waitTime], 'wait is 0');
      assert.isUndefined(element[dnsTime], 'dns is undefined');
      assert.isUndefined(element[blockedTime], 'blocked is undefined');
      assert.isUndefined(element[sslTime], 'ssl is undefined');
    });

    [
      ['connect', connectTime],
      ['blocked', blockedTime],
      ['dns', dnsTime],
      ['ssl', sslTime],
      ['send', sendTime],
      ['wait', waitTime],
      ['receive', receiveTime],
    ].forEach(([prop, symbol]) => {
      it(`sets ${String(prop)}`, () => {
        element.timings = timings;
        assert.equal(element[symbol], timings[prop]);
      });

      it(`ignores negative ${String(prop)}`, () => {
        const value = timings[prop];
        const total = 2455.187694234 - value;
        timings[prop] = -1;
        element.timings = timings;
        assert.equal(element[requestTime], total);
      });

      it(`ignores non number ${String(prop)}`, () => {
        const value = timings[prop];
        const total = 2455.187694234 - value;
        timings[prop] = undefined;
        element.timings = timings;
        assert.equal(element[requestTime], total);
      });
    });
  });

  describe('render()', () => {
    let element = /** @type RequestTimingsElement */(null);
    beforeEach(async () => {
      element = await basicFixture();
      element.timings = {
        blocked: 7.751456734,
        dns: 279.3812349,
        connect: 883.1201243,
        ssl: 633.0517329,
        send: 0.2900234,
        wait: 649.8810009,
        receive: 1.7121211
      };
      await nextFrame();
    });

    it('renders total time', () => {
      const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('.timing-value.total'));
      const value = node.innerText.trim().toLowerCase();
      assert.equal(value, '2455.1877 ms');
    });

    [
      ['blocked-time', 'blocked', 7.7515, 7.7515],
      ['dns-time', 'dns', 287.1327, 279.3812],
      ['ttc-time', 'connect', 1170.2528, 883.1201],
      ['ssl-time', 'ssl', 1803.3045, 633.0517],
      ['send-time', 'send', 1803.5946, 0.29],
      ['ttfb-time', 'wait', 2453.4756, 649.881],
      ['receive-time', 'receive', 2455.187694234, 1.7121]
    ].forEach(([type, prop, value, roundValue]) => {
      it(`renders the progress bar for ${prop}`, () => {
        const node = element.shadowRoot.querySelector(`[data-type="${type}"]`);
        assert.ok(node);
      });

      it.skip(`anypoint-progress has the secondary-progress for ${prop}`, () => {
        const node = /** @type AnypointProgressElement */ (element.shadowRoot.querySelector(`[data-type="${type}"] anypoint-progress`));
        console.log('READING', node.secondaryProgress);
        assert.equal(node.secondaryProgress, value);
      });

      it(`anypoint-progress has max for ${prop}`, () => {
        const node = /** @type AnypointProgressElement */ (element.shadowRoot.querySelector(`[data-type="${type}"] anypoint-progress`));
        assert.equal(node.max, 2455.187694234);
      });

      it(`renders ${prop} round time`, () => {
        const node = element.shadowRoot.querySelector(`[data-type="${type}"] .timing-value`);
        // @ts-ignore
        const text = node.innerText.trim().toLowerCase();
        assert.equal(text, `${roundValue} ms`);
      });
    });
  });

  describe('a11y', () => {
    let element = /** @type RequestTimingsElement */(null);
    beforeEach(async () => {
      element = await basicFixture();
      element.timings = {
        blocked: 7.751456734,
        dns: 279.3812349,
        connect: 883.1201243,
        ssl: 633.0517329,
        send: 0.2900234,
        wait: 649.8810009,
        receive: 1.7121211
      };
      await nextFrame();
    });

    it('is accessible', async () => {
      await assert.isAccessible(element);
    });
  });
});
