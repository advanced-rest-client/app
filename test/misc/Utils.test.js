/* eslint-disable no-script-url */
import { assert } from '@open-wc/testing';
import * as Utils  from '../../src/elements/authorization/Utils.js';

describe('Utils', () => {
  describe('normalizeType()', () => {
    it('returns when no argument', () => {
      const result = Utils.normalizeType(undefined);
      assert.isUndefined(result);
    });

    it('lowercase the input', () => {
      const result = Utils.normalizeType('BAsic');
      assert.equal(result, 'basic');
    });
  });
});
