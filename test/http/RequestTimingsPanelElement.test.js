import { fixture, assert, nextFrame } from '@open-wc/testing';
import '../../define/request-timings-panel.js';
import { 
  computeHarTime, 
  computeRequestTime, 
} from '../../src/elements/http/internals.js';

/** @typedef {import('../../index').RequestTimingsPanelElement} RequestTimingsPanelElement */

describe('RequestTimingsPanelElement', () => {
  /**
   * @returns {Promise<RequestTimingsPanelElement>}
   */
  async function basicFixture() {
    return fixture(`<request-timings-panel></request-timings-panel>`);
  }

  const TOTAL = 2455.187694234;

  describe('[computeHarTime]()', () => {
    let element = /** @type RequestTimingsPanelElement */(null);
    let timings;
    beforeEach(async () => {
      element = await basicFixture();
      timings = {
        startTime: 1483368432132,
        blocked: 7.751456734,
        dns: 279.3812349,
        connect: 883.1201243,
        ssl: 633.0517329,
        send: 0.2900234,
        wait: 649.8810009,
        receive: 1.7121211
      };
    });

    it('computes total time', () => {
      const result = element[computeHarTime](timings);
      assert.equal(result, TOTAL);
    });

    it('computes time when no har', () => {
      const result = element[computeHarTime](undefined);
      assert.equal(result, 0);
    });

    ['connect', 'blocked', 'dns', 'ssl', 'send', 'wait', 'receive'].forEach((prop) => {
      it(`ignores negative _${prop}`, () => {
        const value = timings[prop];
        const total = TOTAL - value;
        timings[prop] = -1;
        const result = element[computeHarTime](timings);
        assert.equal(result, total);
      });

      it(`ignores non number _${prop}`, () => {
        const value = timings[prop];
        const total = TOTAL - value;
        timings[prop] = undefined;
        const result = element[computeHarTime](timings);
        assert.equal(result, total);
      });
    });
  });

  describe('[computeRequestTime]()', () => {
    let element = /** @type RequestTimingsPanelElement */(null);
    let timings;
    let redirects;
    beforeEach(async () => {
      element = await basicFixture();
      timings = {
        startTime: 1483368432132,
        blocked: 7.751456734,
        dns: 279.3812349,
        connect: 883.1201243,
        ssl: 633.0517329,
        send: 0.2900234,
        wait: 649.8810009,
        receive: 1.7121211
      };
      redirects = [
        {
          timings: {
            blocked: 10.697000019718,
            dns: -1,
            connect: -1,
            send: 0.34099997719749986,
            wait: 155.50400002393852,
            receive: 4.751000029500744,
            ssl: -1
          },
          response: {
            status: 0,
          },
          startTime: 0,
          endTime: 0,
        },
        {
          timings: {
            blocked: 3.36500001139939,
            dns: -1,
            connect: -1,
            send: 0.06499997107311994,
            wait: 138.7439999962225,
            receive: 4.986000014469084,
            ssl: -1
          },
          response: {
            status: 0,
          },
          startTime: 0,
          endTime: 0,
        }
      ];
    });

    it('computes time without arguments', () => {
      const result = element[computeRequestTime](undefined, undefined);
      assert.equal(result, 0);
    });

    it('computes time without redirects', () => {
      const result = element[computeRequestTime](undefined, timings);
      assert.equal(result, 2455.1877);
    });

    it('computes time with redirects', () => {
      const result = element[computeRequestTime](redirects, timings);
      assert.equal(result, 2773.6407);
    });
  });

  describe('render()', () => {
    let element = /** @type RequestTimingsPanelElement */(null);
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
      element.redirects = [
        {
          url: 'https://domain.com/1',
          timings: {
            blocked: 10.697000019718,
            dns: -1,
            connect: -1,
            send: 0.34099997719749986,
            wait: 155.50400002393852,
            receive: 4.751000029500744,
            ssl: -1
          },
          response: {
            status: 0,
          },
          startTime: 0,
          endTime: 0,
        },
        {
          url: 'https://domain.com/2',
          timings: {
            blocked: 3.36500001139939,
            dns: -1,
            connect: -1,
            send: 0.06499997107311994,
            wait: 138.7439999962225,
            receive: 4.986000014469084,
            ssl: -1
          },
          response: {
            status: 0,
          },
          startTime: 0,
          endTime: 0,
        }
      ];
      await nextFrame();
    });

    it('renders redirects section', () => {
      const node = element.shadowRoot.querySelector('.redirects');
      assert.ok(node);
    });

    it('renders 3 timings panels', () => {
      const nodes = element.shadowRoot.querySelectorAll('.timings-row');
      assert.lengthOf(nodes, 3);
    });

    it('renders 1 timing panel when no redirects', async () => {
      element.redirects = undefined;
      await nextFrame();
      const nodes = element.shadowRoot.querySelectorAll('request-timings');
      assert.lengthOf(nodes, 1);
    });
  });

  describe('a11y', () => {
    let element = /** @type RequestTimingsPanelElement */(null);
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
      element.redirects = [
        {
          url: 'https://domain.com/1',
          timings: {
            blocked: 10.697000019718,
            dns: -1,
            connect: -1,
            send: 0.34099997719749986,
            wait: 155.50400002393852,
            receive: 4.751000029500744,
            ssl: -1
          },
          response: {
            status: 0,
          },
          startTime: 0,
          endTime: 0,
        },
        {
          url: 'https://domain.com/2',
          timings: {
            blocked: 3.36500001139939,
            dns: -1,
            connect: -1,
            send: 0.06499997107311994,
            wait: 138.7439999962225,
            receive: 4.986000014469084,
            ssl: -1
          },
          response: {
            status: 0,
          },
          startTime: 0,
          endTime: 0,
        }
      ];
      await nextFrame();
    });

    it('is accessible', async () => {
      await assert.isAccessible(element);
    });
  });
});
