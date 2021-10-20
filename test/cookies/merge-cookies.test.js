import { assert } from '@open-wc/testing';
import { Cookies } from '../../index.js';

describe('Parse cookies with base URL', () => {
  let httpStr = 'rememberme=1; domain=foo.com;';
  httpStr += ' path=/; ssid=Hy1t5e#oj21.876aak;';
  const baseUrl = 'http://bar.com/';

  it('should merge when no old cookies', () => {
    const oldParser = new Cookies('', baseUrl);
    const newParser = new Cookies(httpStr, baseUrl);
    oldParser.merge(newParser);
    assert.lengthOf(oldParser.cookies, 2);
  });

  it('should merge when no new cookies, no old cookies', () => {
    const oldParser = new Cookies('', baseUrl);
    const newParser = new Cookies('', baseUrl);
    oldParser.merge(newParser);
    assert.lengthOf(oldParser.cookies, 0);
  });

  it('should merge when no new cookies', () => {
    const oldParser = new Cookies(httpStr, baseUrl);
    const newParser = new Cookies('', baseUrl);
    oldParser.merge(newParser);
    assert.lengthOf(oldParser.cookies, 2);
  });

  it('should merge different cookies', () => {
    const oldParser = new Cookies(httpStr, baseUrl);
    const newParser = new Cookies('test=value', baseUrl);
    oldParser.merge(newParser);
    assert.lengthOf(oldParser.cookies, 3);
  });

  it('should merge same cookies', (done) => {
    const pastCookies = new Cookies(httpStr, baseUrl);
    setTimeout(() => {
      const oldCookieCreationTime = pastCookies.cookies[1].created;
      const oldCookieLastAccessTime = pastCookies.cookies[1].lastAccess;
      const newParser = new Cookies('ssid=abc', baseUrl);
      pastCookies.merge(newParser);
      assert.lengthOf(pastCookies.cookies, 2, 'Old cookies are replaced');
      assert.equal(
        pastCookies.cookies[1].created,
        oldCookieCreationTime,
        "New cookie have old's creation time"
      );
      assert.notEqual(
        pastCookies.cookies[1].lastAccess,
        oldCookieLastAccessTime,
        "New cookie should not have old's last access time"
      );
      done();
    }, 1000);
  });

  it('should have new cookie value', () => {
    const oldParser = new Cookies(httpStr, baseUrl);
    const newParser = new Cookies('ssid=abc', baseUrl);
    oldParser.merge(newParser);
    assert.equal(oldParser.cookies[1].value, 'abc');
  });
});
