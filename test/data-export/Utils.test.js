import { assert } from '@open-wc/testing';
import {
  generateFileName,
} from '../../src/lib/Utils.js';

describe('Utils', () => {
  describe('generateFileName()', () => {
    const date = new Date();

    it('returns a string', () => {
      const result = generateFileName();
      assert.typeOf(result, 'string');
    });

    it('has the prefix', () => {
      const result = generateFileName();
      assert.include(result, 'arc-data-export-');
    });

    it('has the extension', () => {
      const result = generateFileName();
      assert.include(result, '.json');
    });

    it('has the day', () => {
      const result = generateFileName();
      const day = date.getDate();
      assert.include(result, `-${day}-`);
    });

    it('has the month', () => {
      const result = generateFileName();
      const month = date.getMonth();
      assert.include(result, `-${month + 1}-`);
    });

    it('has the year', () => {
      const result = generateFileName();
      const year = date.getFullYear();
      assert.include(result, `-${year}.`);
    });
  });
});
