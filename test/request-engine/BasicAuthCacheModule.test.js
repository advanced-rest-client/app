import { assert } from '@open-wc/testing';
import * as Cache from '../../src/request-modules/BasicAuthCache.js';

describe('BasicAuthCache module', () => {
  describe('computeUrlPath()', () => {
    it('returns empty string when no input', () => {
      const result = Cache.computeUrlPath(undefined);
      assert.strictEqual(result, '');
    });

    it('removes the hash part of the URL', () => {
      const result = Cache.computeUrlPath('https://api.com/path/to#abc');
      assert.strictEqual(result, 'https://api.com/path/to');
    });

    it('removes the hash query of the URL', () => {
      const result = Cache.computeUrlPath('https://api.com/path/to?abc=tets');
      assert.strictEqual(result, 'https://api.com/path/to');
    });

    it('returns the same input when invalid', () => {
      const result = Cache.computeUrlPath('index.html');
      assert.strictEqual(result, 'index.html');
    });
  });

  describe('updateCache() and findCachedAuthData()', () => {
    const authData = { username: 'x' };

    it('adds to a new type', () => {
      Cache.updateCache('a', 'https://domain.com', authData);
      const result = Cache.findCachedAuthData('a', 'https://domain.com');
      assert.deepEqual(result, authData);
    });

    it('updates existing type', () => {
      const otherData = { username: 'y' };
      Cache.updateCache('a', 'https://domain.com', authData);
      Cache.updateCache('a', 'https://domain.com', otherData);
      const result = Cache.findCachedAuthData('a', 'https://domain.com');
      assert.deepEqual(result, otherData);
    });

    it('applies normalized URL', () => {
      const otherData = { username: 'y' };
      Cache.updateCache('a', 'https://domain.com/path?a=b#123', authData);
      Cache.updateCache('a', 'https://domain.com/path#678', otherData);
      const result = Cache.findCachedAuthData('a', 'https://domain.com/path');
      assert.deepEqual(result, otherData);
    });

    it('returns undefined when data not found', () => {
      const result = Cache.findCachedAuthData('a', 'https://api.com/test');
      assert.isUndefined(result);
    });
  });
});
