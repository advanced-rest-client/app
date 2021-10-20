import { assert } from '@open-wc/testing';
import './monaco-loader.js';
import { 
  encodeUrlEncoded, 
  encodeQueryString, 
  modelItemToFormDataString, 
  decodeUrlEncoded, 
  formArrayToString,
  decodeQueryString,
} from '../../src/elements/body/UrlEncodeUtils.js';

/** @typedef {import('@advanced-rest-client/events').ApiTypes.ApiType} ApiType */

describe('UrlEncodeUtils', () => {
  describe('URL encoder', () => {
    it('encodes a string', () => {
      const src = 'test=encoded value&encoded name=encoded value';
      const compare = 'test=encoded+value&encoded+name=encoded+value';
      const result = encodeUrlEncoded(src);
      assert.equal(result, compare);
    });
  
    it('encodes a string with repeatable parameters', () => {
      const src = 'test=encoded value&test=other value&encoded name=encoded value';
      const compare = 'test=encoded+value&test=other+value&encoded+name=encoded+value';
      const result = encodeUrlEncoded(src);
      assert.equal(result, compare);
    });
  
    it('encodes an array', () => {
      const src = [{
        'name': 'test',
        'value': 'encoded value'
      }, {
        'name': 'encoded name',
        'value': 'encoded value'
      }];
      const compare = [{
        'name': 'test',
        'value': 'encoded+value'
      }, {
        'name': 'encoded+name',
        'value': 'encoded+value'
      }];
      const str = encodeUrlEncoded(src);
      assert.deepEqual(str, compare);
    });
  
    it('encodes an array with array value', () => {
      const src = [{
        'name': 'test',
        'value': ['encoded value', 'other value']
      }, {
        'name': 'encoded name',
        'value': 'encoded value'
      }];
      const compare = [{
        'name': 'test',
        'value': ['encoded+value', 'other+value']
      }, {
        'name': 'encoded+name',
        'value': 'encoded+value'
      }];
      const result = encodeUrlEncoded(src);
      assert.deepEqual(result, compare);
    });
  
    it('encodes a query string', () => {
      const query = '/test path/?param name=param value';
      const encoded = encodeQueryString(query);
      // path will be encoded, this function encodes query params only.
      const compare = '%2Ftest+path%2F%3Fparam+name%3Dparam+value';
      assert.equal(encoded, compare);
    });
  });

  describe('URL decoder', () => {
    it('Decode encoded string', () => {
      const compare = 'test=encoded value&encoded name=encoded value';
      const src = 'test=encoded+value&encoded+name=encoded+value';
      const result = decodeUrlEncoded(src);
      assert.equal(result, compare);
    });
  
    it('Decode encoded string with repeatable parameters', () => {
      const compare = 'test=encoded value&test=other value&encoded name=encoded value';
      const src = 'test=encoded+value&encoded+name=encoded+value&test=other+value';
      const result = decodeUrlEncoded(src);
      assert.equal(result, compare);
    });
  
    it('Decodes encoded array', () => {
      const compare = [{
        'name': 'test',
        'value': 'encoded value'
      }, {
        'name': 'encoded name',
        'value': 'encoded value'
      }];
      const input = [{
        'name': 'test',
        'value': 'encoded+value'
      }, {
        'name': 'encoded+name',
        'value': 'encoded+value'
      }];
      const result = decodeUrlEncoded(input);
      assert.deepEqual(result, compare);
    });
  
    it('Decodes encoded array with array value', () => {
      const compare = [{
        'name': 'test',
        'value': 'encoded value'
      }, {
        'name': 'encoded name',
        'value': ['encoded value', 'other value']
      }];
      const src = [{
        'name': 'test',
        'value': 'encoded+value'
      }, {
        'name': 'encoded+name',
        'value': ['encoded+value', 'other+value']
      }];
      const str = decodeUrlEncoded(src);
      assert.deepEqual(str, compare);
    });
  });

  describe('modelItemToFormDataString()', () => {
    it('returns undefined when item is not enabled', () => {
      const result = modelItemToFormDataString({
        enabled: false,
        name: '',
        value: '',
      });
      assert.isUndefined(result);
    });

    it('returns undefined when no name and value', () => {
      const result = modelItemToFormDataString({
        name: '',
        value: ''
      });
      assert.isUndefined(result);
    });

    it('returns undefined when no value value and no required', () => {
      const result = modelItemToFormDataString({
        name: 'test',
        value: '',
        required: false
      });
      assert.isUndefined(result);
    });

    it('returns a string', () => {
      const result = modelItemToFormDataString({
        name: 'test',
        value: 'value'
      });
      assert.typeOf(result, 'string');
    });

    it('always returns a string', () => {
      const result = modelItemToFormDataString({
        name: 'test',
        value: true
      });
      assert.equal(result, 'test=true');
    });

    it('processes array values', () => {
      const result = modelItemToFormDataString({
        name: 'test',
        value: ['a', 'b']
      });
      assert.equal(result, 'test=a&test=b');
    });
  });

  describe('Array to string', () => {
    it('Create payload string from an array', () => {
      const list = [{
        'name': 'test',
        'value': 'encoded value'
      }, {
        'name': 'encoded name',
        'value': 'encoded value'
      }];
      const compare = 'test=encoded value&encoded name=encoded value';
      const str = formArrayToString(list);
      assert.equal(str, compare);
    });
  
    it('Empty model returns empty string', () => {
      const list = [{
        'name': '',
        'value': ''
      }];
      const str = formArrayToString(list);
      assert.equal(str, '');
    });
  
    it('Should create www-urlencoded string from array', () => {
      const list = [{
        'name': 'test',
        'value': 'encoded value'
      }, {
        'name': 'encoded name',
        'value': 'encoded value'
      }];
      const compare = 'test=encoded+value&encoded+name=encoded+value';
      const str = formArrayToString(/** @type ApiType[] */ (encodeUrlEncoded(list)));
      assert.equal(str, compare);
    });
  
    it('Should create payload string from array with array value', () => {
      const list = [{
        'name': 'test',
        'value': ['encoded value', 'other value']
      }, {
        'name': 'encoded name',
        'value': 'encoded value'
      }];
      const compare = 'test=encoded value&test=other value&encoded name=encoded value';
      const str = formArrayToString(list);
      assert.equal(str, compare);
    });
  });

  describe('encodeQueryString()', () => {
    it('returns undefined when no input', () => {
      const result = encodeQueryString(undefined);
      assert.isUndefined(result);
    });
  });

  describe('decodeQueryString()', () => {
    it('returns undefined when no input', () => {
      const result = decodeQueryString(undefined);
      assert.isUndefined(result);
    });
  });
});
