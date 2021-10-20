import { assert } from '@open-wc/testing';
import { Cookies } from '../../index.js';

describe('Parse cookies with base URL', () => {
  let httpStr = 'rememberme=1; domain=foo.com;';
  httpStr += ' path=/; ssid=Hy1t5e#oj21.876aak;';
  const baseUrl = 'http://bar.com/';

  it("should set empty cookie's attributes domain and path", () => {
    const parser = new Cookies(httpStr, baseUrl);
    const cookie = parser.cookies[1];
    assert.equal(cookie.domain, 'bar.com', 'Do not set cookie domain');
    assert.equal(cookie.path, '/', 'Do not set cookie path');
  });

  it('should remove not matched cookies', () => {
    const parser = new Cookies(httpStr, baseUrl);
    const removed = parser.filter();
    assert.lengthOf(parser.cookies, 1, 'Remaining 1 cookie');
    assert.typeOf(removed, 'array', 'Removed is an array');
    assert.lengthOf(removed, 1, 'Removed has 1 item');
    assert.equal(removed[0].name, 'rememberme');
  });

  it('should not remove not expired cookies', () => {
    const parser = new Cookies(httpStr, baseUrl);
    const removed = parser.clearExpired();
    assert.lengthOf(parser.cookies, 2, 'Remaining 2 cookies');
    assert.typeOf(removed, 'array', 'Removed is an array');
    assert.lengthOf(removed, 0, 'Removed should be an empty array');
  });

  it('should remove expired cookies set by `expires`', () => {
    const exp = new Date(Date.now() - 100).toUTCString();
    const str = `${httpStr} expires=${exp}`;
    const parser = new Cookies(str, baseUrl);
    const removed = parser.clearExpired();
    assert.lengthOf(
      parser.cookies,
      1,
      'Did not removed expired cookie set by `expires` attribute'
    );
    assert.typeOf(removed, 'array', 'Removed is an array');
    assert.lengthOf(removed, 1, 'Removed has 1 item');
    assert.equal(removed[0].name, 'ssid');
  });

  it('should remove expired cookies set by `max-age`', (done) => {
    const str = `${httpStr} max-age=1`;
    const parser = new Cookies(str, baseUrl);
    setTimeout(() => {
      const removed = parser.clearExpired();
      assert.lengthOf(
        parser.cookies,
        1,
        'Did not removed expired cookie set by `max-age` attribute'
      );
      assert.typeOf(removed, 'array', 'Removed is an array');
      assert.lengthOf(removed, 1, 'Removed has 1 item');
      assert.equal(removed[0].name, 'ssid');
      done();
    }, 1100); // max-age + 100ms
  });
});
