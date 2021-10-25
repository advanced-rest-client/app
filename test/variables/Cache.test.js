import { assert } from '@open-wc/testing';
import { find, store, clear } from '../../src/lib/variables/Cache.js';

describe('Cache', () => {
  const target1 = Object();
  const target2 = Object();

  describe('store()', () => {
    const key = 'abc';
    const group = '1';

    afterEach(() => {
      clear(target1);
      clear(target2);
    });

    it('stores data in cache', () => {
      store(target1, key, group, 'test');
      const value = find(target1, key, group);
      assert.equal(value, 'test');
    });

    it('stores multiple values', () => {
      store(target1, key, '2', 'other');
      const value = find(target1, key, '2');
      assert.equal(value, 'other');
    });

    it('uses different keys', () => {
      store(target1, 'my-key', '2', 'other');
      const value = find(target1, 'my-key', '2');
      assert.equal(value, 'other');
    });

    it('handles multiple objects', () => {
      store(target1, key, group, 'test-1');
      store(target2, key, group, 'test-2');
      const value1 = find(target1, key, group);
      assert.equal(value1, 'test-1', 'stores for first target');
      const value2 = find(target2, key, group);
      assert.equal(value2, 'test-2', 'stores for other target');
    });
  });

  describe('find()', () => {
    const key = 'abc';
    const group = '1';

    afterEach(() => {
      clear(target1);
      clear(target2);
    });

    it('returns null when no stored data', () => {
      const value = find(target1, key, group);
      assert.equal(value, null);
    });

    it('returns null when no value for the key', () => {
      store(target1, 'my-key', '2', 'other');
      const value = find(target1, key, group);
      assert.equal(value, null);
    });

    it('returns null when no value for the group', () => {
      store(target1, key, '2', 'other');
      const value = find(target1, key, group);
      assert.equal(value, null);
    });

    it('returns the value', () => {
      store(target1, key, group, 'test');
      const value = find(target1, key, group);
      assert.equal(value, 'test');
    });
  });

  describe('clear()', () => {
    const key = 'abc';
    const group = '1';

    it('clears data for a target', () => {
      store(target1, key, group, 'test');
      clear(target1);
      const value = find(target1, key, group);
      assert.equal(value, null);
    });

    it('clears data for the passed target only', () => {
      store(target1, key, group, 'test');
      store(target2, key, group, 'test');
      clear(target1);
      const value = find(target2, key, group);
      assert.equal(value, 'test');
    });
  });
});
