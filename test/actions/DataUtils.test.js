import { assert } from '@open-wc/testing';
import { readBodyString, getPayloadValue } from '../../src/lib/actions/runner/DataUtils.js';

const hasTextEncoder = typeof TextEncoder !== 'undefined';

describe('DataUtils', () => {
  describe('readBodyString()', () => {
    it('returns the same value for string', () => {
      const input = 'test';
      const output = readBodyString(input);
      assert.isTrue(input === output);
    });

    it('returns the same value for undefined', () => {
      const input = undefined;
      const output = readBodyString(input);
      assert.equal(output, 'undefined');
    });

    it('returns undefined for a blob', () => {
      const input = new Blob(['test'], { type: 'test/plain' });
      const output = readBodyString(input);
      assert.isUndefined(output);
    });


    (hasTextEncoder ? it : it.skip)('returns string for Uint8Array', () => {
      const string = 'test encoded value';
      const textEncoder = new TextEncoder();
      const result = readBodyString(textEncoder.encode(string));
      assert.equal(result, string);
    });

    (hasTextEncoder ? it : it.skip)('returns string for meta data (ArrayBuffer)', () => {
      const string = 'test encoded value';
      const textEncoder = new TextEncoder();
      const input = {
        data: textEncoder.encode(string).buffer,
        type: 'Buffer'
      };
      // @ts-ignore
      const result = readBodyString(input);
      assert.equal(result, string);
    });
  });

  describe('getPayloadValue()', () => {
    it('returns the stringified input when no path', () => {
      const input = new Blob(['test'], { type: 'test/plain' });
      const result = getPayloadValue(input, 'test/plain', []);
      assert.equal(result, '[object Blob]');
    });

    it('returns undefined for incompatible type', () => {
      const input = new Blob(['test'], { type: 'test/plain' });
      const result = getPayloadValue(input, 'test/plain', ['path']);
      assert.isUndefined(result);
    });
  });
});
