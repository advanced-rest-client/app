import { fixture, assert, html } from '@open-wc/testing';
import sinon from 'sinon';
import '../../define/arc-definitions.js';

/** @typedef {import('../../').ArcDefinitionsElement} ArcDefinitionsElement */

describe('<arc-definitions>', () => {
  /**
   * @returns {Promise<ArcDefinitionsElement>}
   */
  async function basicFixture() {
    return fixture(html`<arc-definitions></arc-definitions>`);
  }

  describe('requestHeaders getter', () => {
    /** @type ArcDefinitionsElement */
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Returns list of request headers', () => {
      const result = element.requestHeaders;
      assert.typeOf(result, 'array', 'returns an array');
      assert.isNotEmpty(result, 'is not empty array');
      const keys = Object.keys(result[0]);
      assert.deepEqual(
        keys,
        ['key', 'desc', 'example', 'autocomplete'],
        'is headers struct'
      );
      const index = result.findIndex((item) => item.key === 'Accept');
      assert.notEqual(index, -1, 'List has request header');
    });
  });

  describe('responseHeaders getter', () => {
    /** @type ArcDefinitionsElement */
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Returns list of response headers', () => {
      const result = element.responseHeaders;
      assert.typeOf(result, 'array', 'returns an array');
      assert.isNotEmpty(result, 'is not empty array');
      const keys = Object.keys(result[0]);
      assert.deepEqual(keys, ['key', 'desc', 'example'], 'is headers struct');
      const index = result.findIndex((item) => item.key === 'Accept-Ranges');
      assert.notEqual(index, -1, 'List has response header');
    });
  });

  describe('statusCodes getter', () => {
    /** @type ArcDefinitionsElement */
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Returns list of status codes', () => {
      const result = element.statusCodes;
      assert.typeOf(result, 'array');
      assert.isNotEmpty(result);
      const keys = Object.keys(result[0]);
      assert.deepEqual(keys, ['key', 'label', 'desc'], 'is headers struct');
    });
  });

  describe('Autocomplete', () => {
    /** @type ArcDefinitionsElement */
    let element;
    let requestHeaders;
    before(async () => {
      element = await basicFixture();
      requestHeaders = element.requestHeaders;
    });

    const headers = [
      'Accept',
      'Accept-Charset',
      'Accept-Encoding',
      'Accept-Language',
      'Cache-Control',
      'Connection',
      'Cookie',
      'Content-Type',
      'Expect',
      'From',
      'Host',
      'If-Match',
      'If-None-Match',
      'If-Range',
      'Pragma',
      'Range',
      'Referer',
      'TE',
      'Upgrade',
      'User-Agent',
      'Via',
      'Warning',
    ];

    function findHeader(header) {
      return requestHeaders.find((item) => item.key === header);
    }

    headers.forEach((header) => {
      it(`${header} has autocomplete property`, () => {
        const def = findHeader(header);
        assert.typeOf(def.autocomplete, 'array');
        assert.isAbove(def.autocomplete.length, 0);
      });
    });
  });

  describe('queryResponseHeaders()', () => {
    /** @type ArcDefinitionsElement */
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('returns a value', () => {
      const result = element.queryResponseHeaders('accept');
      assert.typeOf(result, 'array', 'returns an array');
      assert.lengthOf(result, 1, 'array has 1 items');
    });
  });

  describe('queryRequestHeaders()', () => {
    /** @type ArcDefinitionsElement */
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('returns a value', () => {
      const result = element.queryRequestHeaders('accept');
      assert.typeOf(result, 'array', 'returns an array');
      assert.lengthOf(result, 4, 'array has 4 items');
    });
  });

  describe('queryHeaders()', () => {
    /** @type ArcDefinitionsElement */
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('returns all request headers', () => {
      const result = element.queryHeaders('', 'request');
      assert.typeOf(result, 'array', 'returns an array');
      assert.lengthOf(result, 29, 'array has 29 items');
    });

    it('returns all response headers', () => {
      const result = element.queryHeaders('', 'response');
      assert.typeOf(result, 'array', 'returns an array');
      assert.lengthOf(result, 31, 'array has 31 items');
    });

    it('filters the result', () => {
      const result = element.queryHeaders('content', 'request');
      assert.typeOf(result, 'array', 'returns an array');
      assert.lengthOf(result, 2, 'array has 2 items');
    });

    it('filters case insensitive', () => {
      const result = element.queryHeaders('ConTent', 'request');
      assert.typeOf(result, 'array', 'returns an array');
      assert.lengthOf(result, 2, 'array has 2 items');
    });
  });

  describe('getStatusCode()', () => {
    /** @type ArcDefinitionsElement */
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('returns all status codes', () => {
      const result = element.getStatusCode();
      assert.typeOf(result, 'array', 'returns an array');
      assert.lengthOf(result, 57, 'array has 57 items');
    });

    it('returns specific status code', () => {
      const result = element.getStatusCode(201);
      assert.typeOf(result, 'object', 'returns an object');
      assert.equal(result.key, 201, 'item has key property');
    });

    it('accepts numeric string argument', () => {
      const result = element.getStatusCode('201');
      assert.typeOf(result, 'object', 'returns an object');
      assert.equal(result.key, 201, 'item has key property');
    });

    it('returns null for invalid attribute', () => {
      const result = element.getStatusCode('test');
      assert.equal(result, null);
    });

    it('returns null id status not found', () => {
      const result = element.getStatusCode(600);
      assert.equal(result, null);
    });
  });

  describe('_queryHeadersHandler()', () => {
    /** @type ArcDefinitionsElement */
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    function fire(query, type = 'request') {
      const e = new CustomEvent('queryheaders', {
        detail: {
          type,
          query,
        },
        bubbles: true,
        cancelable: true,
      });
      document.body.dispatchEvent(e);
      return e;
    }

    it('sets headers on the detail object', () => {
      const e = fire('ac');
      assert.typeOf(e.detail.headers, 'array');
      assert.lengthOf(e.detail.headers, 5);
    });

    it('returns empty array when no type', () => {
      const e = fire('ac', null);
      assert.typeOf(e.detail.headers, 'array');
      assert.lengthOf(e.detail.headers, 0);
    });

    it('cancels the event', () => {
      const e = fire('ac', null);
      assert.isTrue(e.defaultPrevented);
    });

    it('ignores cancelled eventds', () => {
      const spy = sinon.spy(element, 'queryHeaders');
      document.body.addEventListener('queryheaders', function f(e) {
        document.body.removeEventListener('queryheaders', f);
        e.preventDefault();
      });
      fire('ac');
      assert.isFalse(spy.called);
    });
  });

  describe('_queryCodesHandler()', () => {
    /** @type ArcDefinitionsElement */
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    function fire(code) {
      const e = new CustomEvent('querystatuscodes', {
        detail: {
          code,
        },
        bubbles: true,
        cancelable: true,
      });
      document.body.dispatchEvent(e);
      return e;
    }

    it('sets statusCode on the detail object', () => {
      const e = fire(201);
      assert.typeOf(e.detail.statusCode, 'object');
    });

    it('cancels the event', () => {
      const e = fire(200);
      assert.isTrue(e.defaultPrevented);
    });

    it('ignores cancelled events', () => {
      const spy = sinon.spy(element, 'queryHeaders');
      document.body.addEventListener('querystatuscodes', function f(e) {
        document.body.removeEventListener('querystatuscodes', f);
        e.preventDefault();
      });
      fire(301);
      assert.isFalse(spy.called);
    });
  });

  describe('a11y', () => {
    it('is accessible', async () => {
      const element = await basicFixture();
      await assert.isAccessible(element);
    });

    it('sets aria-hidden attribute', async () => {
      const element = await basicFixture();
      assert.equal(element.getAttribute('aria-hidden'), 'true');
    });

    it('respects existing aria-hidden attribute', async () => {
      const element = await fixture(
        `<arc-definitions aria-hidden="false"></arc-definitions>`
      );
      assert.equal(element.getAttribute('aria-hidden'), 'false');
    });
  });
});
