import { assert } from '@open-wc/testing';
import { Cookies } from '../../index.js';

describe('Parse cookies', () => {
  let httpStr = 'rememberme=1; domain=foo.com;';
  httpStr += ' path=/; ssid=Hy1t5e#oj21.876aak;';

  it('should parse empty string', () => {
    const cookieStr = '';
    const parser = new Cookies(cookieStr);
    assert.typeOf(parser.cookies, 'array');
    assert.deepEqual(parser.cookies, []);
  });

  it('should parse basic Set-Cookie string', () => {
    const parser = new Cookies('cookie=value');
    assert.typeOf(parser.cookies, 'array');
    assert.lengthOf(parser.cookies, 1);
    assert.equal(parser.cookies[0].name, 'cookie');
    assert.equal(parser.cookies[0].value, 'value');
  });

  it('should parse Set-Cookie string', () => {
    const parser = new Cookies(httpStr);
    assert.typeOf(parser.cookies, 'array');
    assert.lengthOf(parser.cookies, 2);
  });

  it('should set cookie names', () => {
    const parser = new Cookies(httpStr);
    assert.equal(parser.cookies[0].name, 'rememberme');
    assert.equal(parser.cookies[1].name, 'ssid');
  });

  it('should set cookie values', () => {
    const parser = new Cookies(httpStr);
    assert.equal(parser.cookies[0].value, '1');
    assert.equal(parser.cookies[1].value, 'Hy1t5e#oj21.876aak');
  });

  it('should set domains and paths', () => {
    const parser = new Cookies(httpStr);
    assert.equal(parser.cookies[0].domain, 'foo.com');
    assert.equal(parser.cookies[0].path, '/');
    assert.isUndefined(parser.cookies[1].domain);
    assert.isUndefined(parser.cookies[1].path);
  });

  it('should set created and lastAccess properties', () => {
    const parser = new Cookies(httpStr);
    assert.typeOf(parser.cookies[0].created, 'number');
    assert.typeOf(parser.cookies[0].lastAccess, 'number');
  });

  it('should set expires from max-age', () => {
    const str = 'rememberme=1; domain=foo.com; path=/; max-age=100';
    const parser = new Cookies(str);
    const future = Date.now() + 100000;
    const cookie = parser.cookies[0];
    assert.approximately(cookie.expires, future, 10);
    assert.isTrue(cookie.persistent, 'The persistent flag is not set to true');
    cookie.maxAge = 0;
    assert.equal(
      parser.cookies[0].expires,
      -8640000000000000,
      'Do not set max date'
    );
  });

  it('should set cookie header string', () => {
    const parser = new Cookies(httpStr);
    const c0clientStr = parser.cookies[0].toHeader();
    const c1clientStr = parser.cookies[1].toHeader();
    const clientStr = `${c0clientStr}; ${c1clientStr}`;
    assert.equal(parser.toString(), clientStr, 'Set-Cookie string is invalid');
    assert.equal(
      parser.toString(true),
      'rememberme=1; ssid=Hy1t5e#oj21.876aak',
      'Cookie string is invalid'
    );
  });
});
