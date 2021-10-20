import { assert } from '@open-wc/testing';
import { compareCookies, matchesDomain, matchesPath, getPath } from '../../src/lib/CookieUtils.js';

describe('Utils', () => {
  const baseUrl = 'http://bar.com/';
  describe('compareCookies()', () => {
    it('Returns false when domain do not match', () => {
      const a = { domain: 'a' };
      const b = { domain: 'b' };
      // @ts-ignore
      const result = compareCookies(a, b);
      assert.isFalse(result);
    });

    it('Returns false when path do not match', () => {
      const a = { domain: 'a', path: 'a' };
      const b = { domain: 'a', path: 'b' };
      // @ts-ignore
      const result = compareCookies(a, b);
      assert.isFalse(result);
    });

    it('Returns false when name do not match', () => {
      const a = { domain: 'a', path: 'a', name: 'a' };
      const b = { domain: 'a', path: 'a', name: 'b' };
      const result = compareCookies(a, b);
      assert.isFalse(result);
    });

    it('Returns true otherwise', () => {
      const a = { domain: 'a', path: 'a', name: 'a' };
      const b = { domain: 'a', path: 'a', name: 'a' };
      const result = compareCookies(a, b);
      assert.isTrue(result);
    });
  });

  describe('matchesDomain()', () => {
    it('returns false when no url', () => {
      assert.isFalse(matchesDomain('.api.com', undefined));
    });

    it('returns false when no argument', () => {
      const uri = new URL(baseUrl);
      assert.isFalse(matchesDomain('', uri));
    });

    it('returns true when domain are the same', () => {
      const uri = new URL(baseUrl);
      assert.isTrue(matchesDomain('bar.com', uri));
    });

    it('returns true when dot in argument and url is subdomain', () => {
      const uri = new URL('http://test.bar.com/');
      assert.isTrue(matchesDomain('.bar.com', uri));
    });

    it('returns false when dot in argument and url is deep subdomain', () => {
      const uri = new URL('http://other.test.bar.com/');
      assert.isFalse(matchesDomain('.bar.com', uri));
    });
  });

  describe('matchesPath()', () => {
    it('returns false when no url', () => {
      assert.isFalse(matchesPath('/', undefined, undefined));
    });

    it('returns true when no argument', () => {
      const uri = new URL(baseUrl);
      assert.isTrue(matchesPath('', uri, baseUrl));
    });

    it('returns true when paths are the same', () => {
      const uri = new URL(baseUrl);
      assert.isTrue(matchesPath('/', uri, baseUrl));
    });

    it('returns true when URL has single separator', () => {
      const url = `${baseUrl}test`;
      const uri = new URL(url);
      assert.isTrue(matchesPath('/', uri, url));
    });

    it('returns true when URL has deep path that is a match', () => {
      const url = `${baseUrl}test/other`;
      const uri = new URL(url);
      assert.isTrue(matchesPath('/', uri, url));
    });

    it('returns false when argument path is different', () => {
      const url = `${baseUrl}test/other`;
      const uri = new URL(url);
      assert.isFalse(matchesPath('/other', uri, url));
    });

    it('returns false when argument path is is higher', () => {
      const url = `${baseUrl}other`;
      const uri = new URL(url);
      assert.isFalse(matchesPath('/other/xyz', uri, url));
    });
  });

  describe('getPath()', () => {
    it('returns default value when no argument', () => {
      const result = getPath(undefined);
      assert.equal(result, '/');
    });

    it('returns default value when no absolute URL', () => {
      const result = getPath('api.com');
      assert.equal(result, '/');
    });

    it('returns default value when no path after separator domain', () => {
      const result = getPath('https://api.com');
      assert.equal(result, '/');
    });

    it('returns default value when no domain and path', () => {
      const result = getPath('https:///');
      assert.equal(result, '/');
    });

    it('returns default value when no path after domain', () => {
      const result = getPath('https://api.com/');
      assert.equal(result, '/');
    });

    it('returns path value', () => {
      const result = getPath('https://api.com/api/test/ignore');
      assert.equal(result, '/api/test');
    });

    it('ignores query string', () => {
      const result = getPath('https://api.com/api/?a=b');
      assert.equal(result, '/api');
    });

    it('ignores hash part of the url', () => {
      const result = getPath('https://api.com/api/#access_token=...');
      assert.equal(result, '/api');
    });
  });
});
