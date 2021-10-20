import { fixture, assert, nextFrame } from '@open-wc/testing';
import sinon from 'sinon';
import { HeadersParser } from '../../index.js';
import '../../define/headers-list.js';
import {
  listValue,
} from '../../src/elements/headers/internals.js';

/** @typedef {import('../../index').HeadersListElement} HeadersListElement */

describe('HeadersListElement', () => {
  /**
   * @return {Promise<HeadersListElement>}
   */
  async function basicFixture() {
    return (fixture(`<headers-list></headers-list>`));
  }

  /**
   * @param {string} value
   * @return {Promise<HeadersListElement>}
   */
  async function headersFixture(value) {
    return (fixture(`<headers-list headers="${value}"></headers-list>`));
  }

  describe('getters and setters', () => {
    let element = /** @type HeadersListElement */(null);
    beforeEach(async () => { element = await basicFixture() });

    it('headers are undefined by default', () => {
      assert.isUndefined(element.headers);
    });

    it('headers getter has the same headers', () => {
      const headers = 'content-type: application/json';
      element.headers = headers;
      assert.equal(element.headers, headers);
    });

    it('headers setter parses the headers', () => {
      element.headers = 'content-type: application/json';
      assert.deepEqual(element[listValue], [{ name: 'content-type', 'value': 'application/json', enabled: true }]);
    });

    it('headers setter ignores the same value', () => {
      const headers = 'content-type: application/json';
      element.headers = headers;
      const spy = sinon.spy(HeadersParser, 'toJSON');
      element.headers = headers;
      // @ts-ignore
      HeadersParser.toJSON.restore();
      assert.isFalse(spy.called);
    });

    it('clears the list when setting undefined', () => {
      const headers = 'content-type: application/json';
      element.headers = headers;
      assert.lengthOf(element[listValue], 1);
      element.headers = undefined;
      assert.isUndefined(element[listValue]);
    });
  });

  describe('Rendering the list', () => {
    let element = /** @type HeadersListElement */(null);
    let headers;
    beforeEach(async () => {
      headers = 'Content-Type: application-json\n';
      headers += 'Content-Length: 256\n';
      headers += 'Content-Encoding: gzip';
      element = await headersFixture(headers);
    });

    it('renders the list', () => {
      const result = element.shadowRoot.querySelectorAll('.container .list-item');
      assert.equal(result.length, 3);
    });

    it('re-renders the list', async () => {
      element.headers = 'accept: application/json';
      await nextFrame();
      const result = element.shadowRoot.querySelectorAll('.container .list-item');
      assert.equal(result.length, 1);
    });
  });

  describe('links discovery', () => {
    let element = /** @type HeadersListElement */(null);
    beforeEach(async () => { element = await basicFixture() });

    it('renders a Link header', async () => {
      element.headers = 'Link: <https://example.com>; rel="preload"';
      await nextFrame();
      const node = element.shadowRoot.querySelector('.header-value');
      assert.dom.equal(node, `<span class="header-value">
        <
          <a class="auto-link" href="https://example.com" target="_blank">
            https://example.com
          </a>
        >; rel="preload"
      </span>`);
    });

    it('ignores incomplete urls', async () => {
      element.headers = 'Link: <example.com>; rel="preload"';
      await nextFrame();
      const node = element.shadowRoot.querySelector('.header-value');
      assert.dom.equal(node, `<span class="header-value">
        &lt;example.com&gt;; rel="preload"
      </span>`);
    });

    it('renders complex location value', async () => {
      const header = 'Location: <http://localhost:8080/pimexport/products?page=2>;rel="next";';
      element.headers = header;
      await nextFrame();
      const node = element.shadowRoot.querySelector('.header-value');
      assert.dom.equal(node, `<span class="header-value">
        <
          <a
            class="auto-link"
            href="http://localhost:8080/pimexport/products?page=2"
            target="_blank"
          >
            http://localhost:8080/pimexport/products?page=2
          </a>
        >;rel="next";
      </span>`);
    });
  });

  describe('a11y', () => {
    let element = /** @type HeadersListElement */(null);
    beforeEach(async () => {
      let headers = 'Content-Type: application-json\n';
      headers += 'Content-Length: 256\n';
      headers += 'Content-Encoding: gzip\n';
      headers += 'Location: <http://localhost:8080/pimexport/products?page=2>;rel="next";';
      element = await headersFixture(headers);
    });

    it('is accessible', async () => {
      await assert.isAccessible(element);
    });
  });
});
