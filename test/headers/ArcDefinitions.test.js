import { assert } from '@open-wc/testing';
import {
  queryRequestHeaders,
  queryResponseHeaders,
  queryHeaders,
  getStatusCode,
} from '../../src/elements/headers/ArcDefinitionsElement.js';

describe('ArcDefinitions interface', () => {
  describe('queryRequestHeaders()', () => {
    it('returns a value', () => {
      const result = queryRequestHeaders('accept');
      assert.typeOf(result, 'array', 'returns an array');
      assert.lengthOf(result, 4, 'array has 4 items');
    });
  });
  describe('queryResponseHeaders()', () => {
    it('returns a value', () => {
      const result = queryResponseHeaders('accept');
      assert.typeOf(result, 'array', 'returns an array');
      assert.lengthOf(result, 1, 'array has 1 items');
    });
  });

  describe('queryHeaders()', () => {
    it('returns all request headers', () => {
      const result = queryHeaders('', 'request');
      assert.typeOf(result, 'array', 'returns an array');
      assert.lengthOf(result, 29, 'array has 29 items');
    });

    it('returns all response headers', () => {
      const result = queryHeaders('', 'response');
      assert.typeOf(result, 'array', 'returns an array');
      assert.lengthOf(result, 31, 'array has 31 items');
    });

    it('filters the result', () => {
      const result = queryHeaders('content', 'request');
      assert.typeOf(result, 'array', 'returns an array');
      assert.lengthOf(result, 2, 'array has 2 items');
    });

    it('filters case insensitive', () => {
      const result = queryHeaders('ConTent', 'request');
      assert.typeOf(result, 'array', 'returns an array');
      assert.lengthOf(result, 2, 'array has 2 items');
    });
  });

  describe('getStatusCode()', () => {
    it('returns all status codes', () => {
      const result = getStatusCode();
      assert.typeOf(result, 'array', 'returns an array');
      assert.lengthOf(result, 57, 'array has 57 items');
    });

    it('returns specific statu code', () => {
      const result = getStatusCode(201);
      assert.typeOf(result, 'object', 'returns an object');
      assert.equal(result.key, 201, 'item has key property');
    });

    it('accepts numeric string argument', () => {
      const result = getStatusCode('201');
      assert.typeOf(result, 'object', 'returns an object');
      assert.equal(result.key, 201, 'item has key property');
    });

    it('returns null for invalid attribute', () => {
      const result = getStatusCode('test');
      assert.equal(result, null);
    });

    it('returns null id status not found', () => {
      const result = getStatusCode(600);
      assert.equal(result, null);
    });
  });
});
