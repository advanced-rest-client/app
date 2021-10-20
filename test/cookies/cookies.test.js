import { assert } from '@open-wc/testing';
import { Cookies } from '../../index.js';

describe('Cookies', () => {
  let httpStr = 'rememberme=1; domain=foo.com;';
  httpStr += ' path=/; ssid=Hy1t5e#oj21.876aak;';
  const baseUrl = 'http://bar.com/';

  describe('constructor()', () => {
    it('sets default cookie value', () => {
      const instance = new Cookies(undefined, baseUrl);
      assert.lengthOf(instance.cookies, 0);
    });

    it('sets cookie http string', () => {
      const instance = new Cookies(httpStr, baseUrl);
      assert.lengthOf(instance.cookies, 2);
    });

    it('sets url', () => {
      const instance = new Cookies(httpStr, baseUrl);
      assert.equal(instance.url, baseUrl);
    });
  });

  describe('get()', () => {
    let instance;
    beforeEach(() => {
      instance = new Cookies(httpStr, baseUrl);
    });

    it('returns a cookie by name', () => {
      const c1 = instance.get('rememberme');
      assert.equal(c1.value, '1');
      const c2 = instance.get('ssid');
      assert.equal(c2.value, 'Hy1t5e#oj21.876aak');
    });

    it('returns undefined when no cookie', () => {
      const c1 = instance.get('not-exists');
      assert.notOk(c1);
    });
  });

  describe('set()', () => {
    let instance;
    beforeEach(() => {
      instance = new Cookies(httpStr, baseUrl);
    });

    it('adds a new cookie', () => {
      instance.set('x-new', 'value');
      assert.lengthOf(instance.cookies, 3);
    });

    it('updates existing cookie', () => {
      instance.set('rememberme', '0');
      assert.lengthOf(instance.cookies, 2);
      assert.equal(instance.cookies[1].value, '0');
    });
  });

  describe('toString()', () => {
    let instance;
    beforeEach(() => {
      instance = new Cookies(httpStr, baseUrl);
    });

    it('returns a string', () => {
      const result = instance.toString();
      assert.typeOf(result, 'string');
    });

    it('has full server header ', () => {
      const result = instance.toString();
      assert.include(
        result,
        'rememberme=1; expires=Sat, 13 Sep 275760 00:00:00 GMT; path=/; domain=foo.com;',
        'has complex cookie'
      );
      assert.include(
        result,
        'ssid=Hy1t5e#oj21.876aak; expires=',
        'has simple cookie'
      );
    });

    it('has client header ', () => {
      const result = instance.toString(true);
      assert.include(result, 'rememberme=1; ssid=Hy1t5e#oj21.876aak');
    });
  });

  describe('filter()', () => {
    const cookies = [
      'a=b; domain=foo.com; path=/;',
      'c=d; domain=foo.com; path=/test/path;',
      'e=f; domain=bar.com; path=/;',
      'g=h; domain=bar.com; path=/test/path;',
      'i=j; domain=sub.bar.com; path=/;',
      'k=l; domain=sub.bar.com; path=/test/path;',
      'm=n;',
    ];

    it('returns empty array when no URL', () => {
      const str = cookies.slice(0, 4).join(' ');
      const instance = new Cookies(str);
      const result = instance.filter();
      assert.deepEqual(result, []);
    });

    it('removes cookies that does not match the domain', () => {
      const str = cookies.slice(0, 4).join(' ');
      const instance = new Cookies(str, 'http://foo.com/');
      instance.filter();
      assert.lengthOf(instance.cookies, 1);
      assert.equal(instance.cookies[0].name, 'a');
    });

    it('returns removed cookies', () => {
      const str = cookies.slice(0, 4).join(' ');
      const instance = new Cookies(str, 'http://foo.com/');
      const result = instance.filter();
      assert.lengthOf(result, 3);
      assert.equal(result[0].name, 'c');
      assert.equal(result[1].name, 'e');
      assert.equal(result[2].name, 'g');
    });

    it('removes cookies when path does not match (sub path)', () => {
      const str = cookies.slice(0, 2).join(' ');
      const instance = new Cookies(str, 'http://foo.com/');
      const result = instance.filter();
      assert.lengthOf(result, 1);
      assert.equal(result[0].name, 'c');
    });

    it('keeps cookies for the parent path', () => {
      const str = cookies.slice(0, 2).join(' ');
      const instance = new Cookies(str, 'http://foo.com/test/path/');
      const result = instance.filter();
      assert.lengthOf(result, 0);
      assert.lengthOf(instance.cookies, 2);
    });

    it('removes cookies for different path', () => {
      const str = cookies.slice(0, 2).join(' ');
      const instance = new Cookies(str, 'http://foo.com/other/');
      const result = instance.filter();
      assert.lengthOf(result, 1);
      assert.lengthOf(instance.cookies, 1);
      assert.equal(result[0].name, 'c');
    });

    it('includes the trailing slash', () => {
      const str = cookies.slice(0, 2).join(' ');
      const instance = new Cookies(str, 'http://foo.com/other');
      const result = instance.filter();
      assert.lengthOf(result, 1);
      assert.lengthOf(instance.cookies, 1);
      assert.equal(result[0].name, 'c');
    });

    it('removes parent domain cookies', () => {
      const str = cookies.slice(0, 2).join(' ');
      const instance = new Cookies(str, 'http://sub.foo.com/');
      const result = instance.filter();
      assert.lengthOf(result, 2);
      assert.lengthOf(instance.cookies, 0);
    });

    it('keeps sub domain cookies', () => {
      const str = cookies.slice(4, 6).join(' ');
      const instance = new Cookies(str, 'http://sub.bar.com/');
      const result = instance.filter();
      assert.lengthOf(result, 1);
      assert.equal(result[0].name, 'k');
      assert.lengthOf(instance.cookies, 1);
    });

    it('add cookie path if missing', () => {
      const instance = new Cookies(cookies[6], 'http://bar.com/');
      instance.cookies[0].path = '';
      const result = instance.filter();
      assert.lengthOf(result, 0);
      assert.equal(instance.cookies[0].path, '/');
    });

    it('add cookie domain if missing', () => {
      const instance = new Cookies(cookies[6], 'http://bar.com/');
      instance.cookies[0].domain = '';
      const result = instance.filter();
      assert.lengthOf(result, 0);
      assert.equal(instance.cookies[0].domain, 'bar.com');
    });

    it('sets hostOnly if domain missing', () => {
      const instance = new Cookies(cookies[6], 'http://bar.com/');
      instance.cookies[0].domain = '';
      instance.cookies[0].hostOnly = false;
      const result = instance.filter();
      assert.lengthOf(result, 0);
      assert.isTrue(instance.cookies[0].hostOnly);
    });
  });
});
