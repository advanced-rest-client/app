import { assert } from '@open-wc/testing';
import { encodeQueryString, decodeQueryString } from '../../src/lib/Utils.js';

describe('Utils', () => {
  describe('encodeQueryString()', () => {
    it('Returns empty string when argument is empty', () => {
      const result = encodeQueryString('', true);
      assert.equal(result, '');
    });

    it('Returns empty string when argument is empty', () => {
      const result = encodeQueryString('', true);
      assert.equal(result, '');
    });

    it('URL encodes string', () => {
      const result = encodeQueryString(';This / is? &test:= + $ , #', true);
      assert.equal(result, '%3BThis+%2F+is%3F+%26test%3A%3D+%2B+%24+%2C+%23');
    });
  });

  describe('decodeQueryString()', () => {
    it('Returns empty string when argument is empty', () => {
      const result = decodeQueryString('', true);
      assert.equal(result, '');
    });

    it('Returns empty string when argument is empty', () => {
      const result = decodeQueryString('', true);
      assert.equal(result, '');
    });

    it('URL encodes string', () => {
      const result = decodeQueryString('%3BThis+%2F+is%3F+%26test%3A%3D+%2B+%24+%2C+%23', true);
      assert.equal(result, ';This / is? &test:= + $ , #');
    });
  });
});
