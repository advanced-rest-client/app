import { assert } from '@open-wc/testing';
import { ArcMock } from '@advanced-rest-client/arc-mock';
import { HarTransformer } from '../../index.js';
import {
  createCreator,
  createLog,
  createCache,
  createHeaders,
  readQueryString,
  readBodyString,
  createPostData,
  createResponseContent,
  createResponse,
  readRequestCookies,
  readResponseCookies,
} from '../../src/lib/har/HarTransformer.js';

/** @typedef {import('@advanced-rest-client/events').ArcRequest.ArcBaseRequest} ArcBaseRequest */
/** @typedef {import('@advanced-rest-client/events').ArcResponse.ErrorResponse} ErrorResponse */
/** @typedef {import('@advanced-rest-client/events').ArcResponse.Response} ArcResponse */
/** @typedef {import('@advanced-rest-client/events').ArcResponse.HTTPResponse} HTTPResponse */
/** @typedef {import('har-format').Entry} Entry */

const hasTextEncoder = typeof TextEncoder !== 'undefined';

describe('HarTransformer', () => {
  const generator = new ArcMock();

  describe('[createCreator]()', () => {
    it('has the default name', () => {
      const har = new HarTransformer();
      const result = har[createCreator]();
      assert.equal(result.name, 'Advanced REST Client');
    });

    it('has the default version', () => {
      const har = new HarTransformer();
      const result = har[createCreator]();
      assert.equal(result.version, 'Unknown');
    });

    it('has the passed name', () => {
      const har = new HarTransformer(undefined, 'test');
      const result = har[createCreator]();
      assert.equal(result.name, 'test');
    });

    it('has the passed version', () => {
      const har = new HarTransformer('1.0.0');
      const result = har[createCreator]();
      assert.equal(result.version, '1.0.0');
    });
  });

  describe('[createLog]()', () => {
    it('has the version property', () => {
      const har = new HarTransformer();
      const result = har[createLog]();
      assert.equal(result.version, '1.2');
    });

    it('has the creator property', () => {
      const har = new HarTransformer();
      const result = har[createLog]();
      assert.typeOf(result.creator, 'object');
    });

    it('has the empty entries property', () => {
      const har = new HarTransformer();
      const result = har[createLog]();
      assert.deepEqual(result.entries, []);
    });
  });

  describe('[createCache]()', () => {
    it('sets the afterRequest property to null', () => {
      const har = new HarTransformer();
      const result = har[createCache]();
      assert.isNull(result.afterRequest);
    });

    it('sets the beforeRequest property to null', () => {
      const har = new HarTransformer();
      const result = har[createCache]();
      assert.isNull(result.beforeRequest);
    });

    it('sets the comment property', () => {
      const har = new HarTransformer();
      const result = har[createCache]();
      assert.typeOf(result.comment, 'string');
    });
  });

  describe('[createHeaders]()', () => {
    let har = /** @type HarTransformer */ (null);
    beforeEach(() => {
      har = new HarTransformer();
    });

    it('returns parsed headers', () => {
      const headers = 'content-type: test/plain\ncontent-length: 12\n';
      const result = har[createHeaders](headers);
      assert.typeOf(result, 'array')
      assert.lengthOf(result, 2)
    });

    it('returns empty array when no argument', () => {
      const result = har[createHeaders](undefined);
      assert.deepEqual(result, []);
    });

    it('returns empty array when unsupported input', () => {
      // @ts-ignore
      const result = har[createHeaders](2);
      assert.deepEqual(result, []);
    });
  });

  describe('[readQueryString]()', () => {
    let har = /** @type HarTransformer */ (null);
    beforeEach(() => {
      har = new HarTransformer();
    });

    it('returns query string parameters', () => {
      const url = 'https://a.app/index?a=b&c=d';
      const result = har[readQueryString](url);
      assert.typeOf(result, 'array');
      assert.lengthOf(result, 2);
    });

    it('returns empty array for invalid input', () => {
      const url = 'something';
      const result = har[readQueryString](url);
      assert.deepEqual(result, []);
    });
  });

  describe('[readBodyString]()', () => {
    let har = /** @type HarTransformer */ (null);
    beforeEach(() => {
      har = new HarTransformer();
    });

    it('returns the same value for a string', () => {
      const body = 'test';
      const result = har[readBodyString](body);
      assert.equal(result, body);
    });

    it('returns the same value for a boolean value', () => {
      const body = true;
      // @ts-ignore
      const result = har[readBodyString](body);
      // @ts-ignore
      assert.equal(result, body);
    });

    (hasTextEncoder ? it : it.skip)('returns string for Uint8Array', () => {
      const string = 'test encoded value';
      const textEncoder = new TextEncoder();
      const result = har[readBodyString](textEncoder.encode(string));
      assert.equal(result, string);
    });

    (hasTextEncoder ? it : it.skip)('Returns string for meta data (ArrayBuffer)', () => {
      const string = 'test encoded value';
      const textEncoder = new TextEncoder();
      const input = {
        data: textEncoder.encode(string).buffer,
        type: 'Buffer'
      };
      // @ts-ignore
      const result = har[readBodyString](input);
      assert.equal(result, string);
    });
  });

  describe('[createPostData]()', () => {
    const headers = 'content-type: application/json\nContent-length: 100';
    let har = /** @type HarTransformer */ (null);
    beforeEach(() => {
      har = new HarTransformer();
    });

    it('returns the mimeType property', async () => {
      const body = 'test';
      const result = await har[createPostData](body, headers);
      assert.equal(result.mimeType, 'application/json');
    });

    it('set text to undefined whe no payload', async () => {
      const result = await har[createPostData](undefined, headers);
      assert.isUndefined(result.text);
    });

    it('set text to the blob value', async () => {
      const body = new Blob(['test-blob'], { type: 'text/plain' });
      const result = await har[createPostData](body, headers);
      assert.equal(result.text, 'test-blob');
    });

    it('set text to the FormData value', async () => {
      const body = new FormData();
      body.append('test-part', 'test-value');
      const result = await har[createPostData](body, headers);
      assert.include(result.text, 'name="test-part"\r\n\r\ntest-value\r\n');
    });

    (hasTextEncoder ? it : it.skip)('set text to the Uint8Array value', async () => {
      const string = 'test encoded value';
      const textEncoder = new TextEncoder();
      const result = await har[createPostData](textEncoder.encode(string), headers);
      assert.equal(result.text, 'test encoded value');
    });
  });

  describe('[createResponseContent]()', () => {
    const headers = 'content-type: application/json\nContent-length: 100';
    let har = /** @type HarTransformer */ (null);
    beforeEach(() => {
      har = new HarTransformer();
    });

    it('sets the mimeType property', async () => {
      const result = await har[createResponseContent](undefined, headers);
      assert.equal(result.mimeType, 'application/json');
    });

    it('sets the mimeType and encoding property', async () => {
      const encHeaders = 'content-type: application/json; charset=UTF-8\nContent-length: 100';
      const result = await har[createResponseContent](undefined, encHeaders);
      assert.equal(result.mimeType, 'application/json');
      assert.equal(result.encoding, 'UTF-8');
    });

    it('sets the text property', async () => {
      const result = await har[createResponseContent]('test', headers);
      assert.equal(result.text, 'test');
    });

    it('sets the size property', async () => {
      const result = await har[createResponseContent]('test', headers);
      assert.equal(result.size, 4);
    });
  });

  describe('[createResponse]()', () => {
    let har = /** @type HarTransformer */ (null);
    beforeEach(() => {
      har = new HarTransformer();
    });

    it('sets the status code', async () => {
      const rsp = generator.http.response.arcResponse({ timings: true, ssl: true });
      assert.typeOf(rsp.status, 'number', 'generated response status is a number');
      const result = await har[createResponse](rsp);
      assert.strictEqual(result.status, rsp.status, 'has the status');
    });

    it('sets the status text', async () => {
      const rsp = generator.http.response.arcResponse({ timings: true, ssl: true });
      assert.typeOf(rsp.statusText, 'string', 'generated response statusText is a string');
      const result = await har[createResponse](rsp);
      assert.strictEqual(result.statusText, rsp.statusText, 'has the statusText');
    });

    it('sets the httpVersion property', async () => {
      const rsp = generator.http.response.arcResponse({ timings: true, ssl: true });
      const result = await har[createResponse](rsp);
      assert.strictEqual(result.httpVersion, 'HTTP/1.1');
    });

    it('sets the headers property', async () => {
      const rsp = generator.http.response.arcResponse({ timings: true, ssl: true });
      const result = await har[createResponse](rsp);
      assert.typeOf(result.headers, 'array', 'returns the array');
      assert.isNotEmpty(result.headers, 'has values')
    });

    it('sets the redirectURL property', async () => {
      const rsp = generator.http.response.arcResponse({ timings: true, ssl: true });
      const result = await har[createResponse](rsp, 'https://rdr.com');
      assert.equal(result.redirectURL, 'https://rdr.com');
    });

    it('sets the content property', async () => {
      const rsp = generator.http.response.arcResponse({ timings: true, ssl: true });
      const result = await har[createResponse](rsp, 'https://rdr.com');
      assert.equal(result.content.text, rsp.payload, 'has the text');
      assert.typeOf(result.content.size, 'number', 'has the size');
    });

    it('sets the bodySize property', async () => {
      const rsp = generator.http.response.arcResponse({ timings: true, ssl: true });
      const result = await har[createResponse](rsp, 'https://rdr.com');
      assert.typeOf(result.bodySize, 'number', 'has the size');
    });

    it('sets the headersSize property', async () => {
      const rsp = generator.http.response.arcResponse({ timings: true, ssl: true });
      const result = await har[createResponse](rsp, 'https://rdr.com');
      assert.typeOf(result.headersSize, 'number', 'has the size');
    });

    it('sets the cookies property', async () => {
      const rsp = generator.http.response.arcResponse({ timings: true, ssl: true });
      rsp.headers = `content-type: application/json\nset-cookie: rememberMe=1; domain=foo.com; path=/; max-age=100; other=test; domain=baz.com;`;
      const result = await har[createResponse](rsp);
      assert.typeOf(result.cookies, 'array', 'has the cookies');
      assert.lengthOf(result.cookies, 2, 'has all cookies');
    });
  });

  describe('createRedirectEntries()', () => {
    let har = /** @type HarTransformer */ (null);
    beforeEach(() => {
      har = new HarTransformer();
    });

    it('returns an array with all responses', async () => {
      const request = generator.http.history();
      const rsp = generator.http.response.arcResponse({ timings: true, ssl: true, redirects: true });
      const result = await har.createRedirectEntries(request, rsp);
      assert.lengthOf(result, rsp.redirects.length);
    });

    it('has the startedDateTime property', async () => {
      const request = generator.http.history();
      const rsp = generator.http.response.arcResponse({ timings: true, ssl: true, redirects: true });
      const [result] = await har.createRedirectEntries(request, rsp);
      assert.equal(result.startedDateTime, new Date(rsp.redirects[0].startTime).toISOString());
    });

    it('has the time property', async () => {
      const request = generator.http.history();
      const rsp = generator.http.response.arcResponse({ timings: true, ssl: true, redirects: true });
      const [result] = await har.createRedirectEntries(request, rsp);
      assert.equal(result.time, rsp.redirects[0].endTime - rsp.redirects[0].startTime);
    });

    it('has the cache property', async () => {
      const request = generator.http.history();
      const rsp = generator.http.response.arcResponse({ timings: true, ssl: true, redirects: true });
      const [result] = await har.createRedirectEntries(request, rsp);
      assert.typeOf(result.cache, 'object');
    });

    it('has the timings property', async () => {
      const request = generator.http.history();
      const rsp = generator.http.response.arcResponse({ timings: true, ssl: true, redirects: true });
      const [result] = await har.createRedirectEntries(request, rsp);
      assert.deepEqual(result.timings, rsp.redirects[0].timings);
    });

    it('has the request property', async () => {
      const request = generator.http.history();
      const rsp = generator.http.response.arcResponse({ timings: true, ssl: true, redirects: true });
      const [result] = await har.createRedirectEntries(request, rsp);
      assert.typeOf(result.request, 'object');
    });

    it('has the response property', async () => {
      const request = generator.http.history();
      const rsp = generator.http.response.arcResponse({ timings: true, ssl: true, redirects: true });
      const [result] = await har.createRedirectEntries(request, rsp);
      assert.typeOf(result.response, 'object');
    });

    it('has the response with the redirectURL property', async () => {
      const request = generator.http.history();
      const rsp = generator.http.response.arcResponse({ timings: true, ssl: true, redirects: true });
      const [result] = await har.createRedirectEntries(request, rsp);
      assert.equal(result.response.redirectURL, rsp.redirects[0].url);
    });
  });

  describe('createEntry()', () => {
    let har = /** @type HarTransformer */ (null);
    beforeEach(() => {
      har = new HarTransformer();
    });

    it('returns null for error response', async () => {
      const errorResponse = generator.http.response.arcErrorResponse();
      const tr = generator.http.transportRequest();
      const request = /** @type ArcBaseRequest */ ({
        transportRequest: tr,
        response: errorResponse,
        method: 'GET',
        url: 'https://api.com',
      });
      const result = await har.createEntry(request);
      assert.equal(result, null);
    });

    it('returns null when no transport request', async () => {
      const errorResponse = generator.http.response.arcErrorResponse();
      const request = /** @type ArcBaseRequest */ ({
        transportRequest: undefined,
        response: errorResponse,
        method: 'GET',
        url: 'https://api.com',
      });
      const result = await har.createEntry(request);
      assert.equal(result, null);
    });

    it('returns an array when redirects', async () => {
      const response = generator.http.response.arcResponse({ timings: true, ssl: true, redirects: true });
      const transportRequest = generator.http.transportRequest();
      const request = /** @type ArcBaseRequest */ ({
        transportRequest,
        response,
        method: 'GET',
        url: 'https://api.com',
      });
      const result = /** @type Entry[] */ (await har.createEntry(request));
      assert.typeOf(result, 'array', 'is an array');
      assert.equal(result.length, response.redirects.length + 1, 'has all entries');
    });

    it('has the startedDateTime property', async () => {
      const response = generator.http.response.arcResponse({ timings: true, ssl: true });
      const transportRequest = generator.http.transportRequest();
      const request = /** @type ArcBaseRequest */ ({
        transportRequest,
        response,
        method: 'GET',
        url: 'https://api.com',
      });
      const result = /** @type Entry */ (await har.createEntry(request));
      assert.equal(result.startedDateTime, new Date(transportRequest.startTime).toISOString());
    });

    it('has the time property', async () => {
      const response = generator.http.response.arcResponse({ timings: true, ssl: true });
      const transportRequest = generator.http.transportRequest();
      const request = /** @type ArcBaseRequest */ ({
        transportRequest,
        response,
        method: 'GET',
        url: 'https://api.com',
      });
      const result = /** @type Entry */ (await har.createEntry(request));
      assert.equal(result.time, response.loadingTime);
    });

    it('has the cache property', async () => {
      const response = generator.http.response.arcResponse({ timings: true, ssl: true });
      const transportRequest = generator.http.transportRequest();
      const request = /** @type ArcBaseRequest */ ({
        transportRequest,
        response,
        method: 'GET',
        url: 'https://api.com',
      });
      const result = /** @type Entry */ (await har.createEntry(request));
      assert.typeOf(result.cache, 'object');
    });

    it('has the timings property', async () => {
      const response = generator.http.response.arcResponse({ timings: true, ssl: true });
      const transportRequest = generator.http.transportRequest();
      const request = /** @type ArcBaseRequest */ ({
        transportRequest,
        response,
        method: 'GET',
        url: 'https://api.com',
      });
      const result = /** @type Entry */ (await har.createEntry(request));
      assert.deepEqual(result.timings, response.timings);
    });

    it('has the request property', async () => {
      const response = generator.http.response.arcResponse({ timings: true, ssl: true });
      const transportRequest = generator.http.transportRequest();
      const request = /** @type ArcBaseRequest */ ({
        transportRequest,
        response,
        method: 'GET',
        url: 'https://api.com',
      });
      const result = /** @type Entry */ (await har.createEntry(request));
      assert.typeOf(result.request, 'object');
    });

    it('has the response property', async () => {
      const response = generator.http.response.arcResponse({ timings: true, ssl: true });
      const transportRequest = generator.http.transportRequest();
      const request = /** @type ArcBaseRequest */ ({
        transportRequest,
        response,
        method: 'GET',
        url: 'https://api.com',
      });
      const result = /** @type Entry */ (await har.createEntry(request));
      assert.typeOf(result.response, 'object');
    });
  });

  describe('createEntry()', () => {
    let har = /** @type HarTransformer */ (null);
    beforeEach(() => {
      har = new HarTransformer();
    });

    it('returns an array when redirects', async () => {
      const response = generator.http.response.arcResponse({ timings: true, ssl: true, redirects: true });
      const transportRequest = generator.http.transportRequest();
      const request = /** @type ArcBaseRequest */ ({
        transportRequest,
        response,
        method: 'GET',
        url: 'https://api.com',
      });
      const result = await har.createEntries([request]);
      assert.typeOf(result, 'array', 'is an array');
      assert.equal(result.length, response.redirects.length + 1, 'has all entries');
    });

    it('returns an array for a single request', async () => {
      const response = generator.http.response.arcResponse({ timings: true, ssl: true });
      const transportRequest = generator.http.transportRequest();
      const request = /** @type ArcBaseRequest */ ({
        transportRequest,
        response,
        method: 'GET',
        url: 'https://api.com',
      });
      const result = await har.createEntries([request]);
      assert.typeOf(result, 'array', 'is an array');
      assert.equal(result.length, 1, 'has all entries');
    });

    it('ignores error requests', async () => {
      const response = generator.http.response.arcErrorResponse();
      const transportRequest = generator.http.transportRequest();
      const request = /** @type ArcBaseRequest */ ({
        transportRequest,
        response,
        method: 'GET',
        url: 'https://api.com',
      });
      const result = await har.createEntries([request]);
      assert.typeOf(result, 'array', 'is an array');
      assert.equal(result.length, 0, 'has no entries');
    });
  });

  describe('transform()', () => {
    let har = /** @type HarTransformer */ (null);
    beforeEach(() => {
      har = new HarTransformer();
    });
    
    it('returns the log object', async () => {
      const response = generator.http.response.arcResponse({ timings: true, ssl: true, redirects: true });
      const transportRequest = generator.http.transportRequest();
      const request = /** @type ArcBaseRequest */ ({
        transportRequest,
        response,
        method: 'GET',
        url: 'https://api.com',
      });
      const result = await har.transform([request]);
      assert.typeOf(result, 'object', 'is an object');
      assert.typeOf(result.log, 'object', 'has the log property');
      assert.typeOf(result.log.entries, 'array', 'has the entires');
    });

    it('creates entries for multiple requests', async () => {
      const input = [];
      let size = 0;
      Array(2).fill(0).forEach(() => {
        const response = generator.http.response.arcResponse({ timings: true, ssl: true, redirects: true });
        const transportRequest = generator.http.transportRequest();
        const request = generator.http.history();
        request.transportRequest = transportRequest;
        request.response = response;
        input.push(request);
        size += response.redirects.length + 1;
      });
      const result = await har.transform(input);
      assert.lengthOf(result.log.entries, size, 'has the entires');
    });
  });

  describe('[readRequestCookies]()', () => {
    let har = /** @type HarTransformer */ (null);
    beforeEach(() => {
      har = new HarTransformer();
    });

    it('returns empty array when no argument', () => {
      const result = har[readRequestCookies](undefined);
      assert.deepEqual(result, []);
    });

    it('returns empty array when the argument is not a string', () => {
      // @ts-ignore
      const result = har[readRequestCookies](false);
      assert.deepEqual(result, []);
    });

    it('returns empty array when no cookies in headers', () => {
      const result = har[readRequestCookies](`content-type: application/json`);
      assert.deepEqual(result, []);
    });

    it('returns empty array when cookie header is empty', () => {
      const result = har[readRequestCookies](`content-type: application/json\ncookie: `);
      assert.deepEqual(result, []);
    });

    it('returns the cookies', () => {
      const result = har[readRequestCookies](`content-type: application/json\ncookie: a=b; c=d`);
      assert.lengthOf(result, 2, 'has two cookies');
      assert.equal(result[0].name, 'a', 'cookie 1 has name');
      assert.equal(result[0].value, 'b', 'cookie 1 has value');
      assert.equal(result[1].name, 'c', 'cookie 2 has name');
      assert.equal(result[1].value, 'd', 'cookie 2 has value');
    });
  });

  describe('[readResponseCookies]()', () => {
    let har = /** @type HarTransformer */ (null);
    beforeEach(() => {
      har = new HarTransformer();
    });

    it('returns empty array when no argument', () => {
      const result = har[readResponseCookies](undefined);
      assert.deepEqual(result, []);
    });

    it('returns empty array when the argument is not a string', () => {
      // @ts-ignore
      const result = har[readResponseCookies](false);
      assert.deepEqual(result, []);
    });

    it('returns empty array when no cookies in headers', () => {
      const result = har[readResponseCookies](`content-type: application/json`);
      assert.deepEqual(result, []);
    });

    it('returns empty array when cookie header is empty', () => {
      const result = har[readResponseCookies](`content-type: application/json\nset-cookie: `);
      assert.deepEqual(result, []);
    });

    it('returns the cookies', () => {
      const result = har[readResponseCookies](`content-type: application/json\nset-cookie: rememberMe=1; domain=foo.com; path=/; max-age=100`);
      assert.lengthOf(result, 1, 'has a cookie');
      const [c] = result;
      assert.equal(c.name, 'rememberMe', 'has name');
      assert.equal(c.value, '1', 'has value');
      assert.equal(c.domain, 'foo.com', 'has domain');
      assert.equal(c.path, '/', 'has path');
      assert.typeOf(c.expires, 'string', 'has expires');
    });
  });
});
