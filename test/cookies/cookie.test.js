import { assert } from '@open-wc/testing';
import { Cookie } from '../../index.js';

describe('Cookie', () => {
  describe('Basics', () => {
    const name = 'c-name';
    const value = 'c-value';

    it('Cookie is not persistent when created without expiry time', () => {
      const instance = new Cookie(name, value);
      assert.isFalse(instance.persistent);
    });

    it('Cookie has the biggest possible expiry date', () => {
      const instance = new Cookie(name, value);
      const compare = new Date(8640000000000000).getTime();
      assert.equal(instance.expires, compare);
    });

    it('Has created time', () => {
      const instance = new Cookie(name, value);
      assert.typeOf(instance.created, 'number');
    });

    it('Has lastAccess time equal to create time', () => {
      const instance = new Cookie(name, value);
      assert.equal(instance.lastAccess, instance.created);
    });

    it('Sets expires from max-age property', () => {
      const instance = new Cookie(name, value, {
        'max-age': 100,
      });
      assert.equal(instance.expires, Date.now() + 100000);
    });

    it('Max-age sets cookie persistent', () => {
      const instance = new Cookie(name, value, {
        'max-age': 100,
      });
      assert.isTrue(instance.persistent);
    });

    it('Negative max-age sets lowest possible expiry date', () => {
      const instance = new Cookie(name, value, {
        'max-age': -100,
      });
      const compare = new Date(-8640000000000000).getTime();
      assert.equal(instance.expires, compare);
    });

    it('Creates header string', () => {
      const instance = new Cookie(name, value);
      const result = instance.toHeader();
      assert.equal(result.indexOf('c-name=c-value; expires='), 0);
    });
  });
  /* eslint-disable no-new */
  describe('constructor()', () => {
    const invalid = `test${String.fromCharCode(0x1f)}`;
    const name = 'test-cookie';
    const value = 'test-value';

    it('throws an error for invalid name', () => {
      assert.throws(() => {
        new Cookie(invalid, '');
      });
    });

    it('throws an error for invalid value', () => {
      assert.throws(() => {
        new Cookie(name, invalid);
      });
    });

    it('throws an error for invalid path', () => {
      assert.throws(() => {
        new Cookie(name, value, {
          path: invalid,
        });
      });
    });

    it('throws an error for invalid domain', () => {
      assert.throws(() => {
        new Cookie(name, value, {
          domain: invalid,
        });
      });
    });

    it('sets default "value"', () => {
      const instance = new Cookie(name);
      assert.equal(instance.value, '');
    });

    it('sets "max-age" as maxAge', () => {
      const instance = new Cookie(name, value, {
        'max-age': 0,
      });
      assert.equal(instance.maxAge, 0);
      assert.equal(instance['max-age'], 0);
    });

    it('sets "expires" from property', () => {
      const instance = new Cookie(name, value, {
        expires: 10,
      });
      assert.equal(instance.expires, 10);
    });

    it('sets default "expires"', () => {
      const instance = new Cookie(name, value);
      assert.isAbove(instance.expires, 1);
    });

    it('sets "domain" from property', () => {
      const instance = new Cookie(name, value, {
        domain: 'api.com',
      });
      assert.equal(instance.domain, 'api.com');
    });

    it('sets "hostOnly" whn no domain', () => {
      const instance = new Cookie(name, value, {});
      assert.isFalse(instance.hostOnly);
    });

    it('sets "path" from property', () => {
      const instance = new Cookie(name, value, {
        path: '/',
      });
      assert.equal(instance.path, '/');
    });

    it('sets "secure" from property', () => {
      const instance = new Cookie(name, value, {
        secure: true,
      });
      assert.isTrue(instance.secure);
    });

    it('sets "httpOnly" from property', () => {
      const instance = new Cookie(name, value, {
        httpOnly: true,
      });
      assert.isTrue(instance.httpOnly);
    });
  });

  describe('#maxAge', () => {
    let instance;
    beforeEach(() => {
      instance = new Cookie('test');
    });

    it('ignores non-numeric values', () => {
      instance.maxAge = 'test';
      assert.isUndefined(instance.maxAge);
    });

    it('sets the value', () => {
      instance.maxAge = 10;
      assert.equal(instance.maxAge, 10);
    });

    it('sets expires value for maxAge 0', () => {
      instance.maxAge = 0;
      assert.isBelow(instance.expires, -1);
    });

    it('sets expires value for maxAge -1', () => {
      instance.maxAge = -1;
      assert.isBelow(instance.expires, -1);
    });

    it('sets expires value for maxAge 1', () => {
      instance.maxAge = 1;
      assert.isAbove(instance.expires, Date.now());
    });

    it('sets persistent flag', () => {
      instance.maxAge = 1;
      assert.isTrue(instance.persistent);
    });
  });

  describe('#expires', () => {
    let instance;
    beforeEach(() => {
      instance = new Cookie('test');
    });

    it('sets expires from Date', () => {
      const now = new Date();
      const time = now.getTime();
      instance.expires = now;
      assert.equal(instance.expires, time);
    });

    it('sets expires from timestamp', () => {
      const now = Date.now();
      instance.expires = now;
      assert.equal(instance.expires, now);
    });

    it('sets expires from timestamp string', () => {
      const now = new Date();
      const time = now.getTime();
      instance.expires = now.toISOString();
      assert.equal(instance.expires, time);
    });

    it('sets expires to 0 when invalid date', () => {
      instance.expires = 'test';
      assert.equal(instance.expires, 0);
    });

    it('sets persistent flag', () => {
      instance.expires = Date.now();
      assert.isTrue(instance.persistent);
    });
  });

  describe('#domain', () => {
    let instance;
    beforeEach(() => {
      instance = new Cookie('test');
    });

    it('sets domain from the argument', () => {
      const value = 'api.com';
      instance.domain = value;
      assert.equal(instance.domain, value);
    });

    it('sets hostOnly flag when argument', () => {
      const value = 'api.com';
      instance.domain = value;
      assert.isTrue(instance.hostOnly);
    });

    it('sets hostOnly flag when no argument', () => {
      instance.domain = undefined;
      assert.isFalse(instance.hostOnly);
    });
  });

  describe('toString()', () => {
    let instance;
    beforeEach(() => {
      instance = new Cookie('test-name', 'test-value');
    });

    it('returns cookie header string', () => {
      const result = instance.toString();
      assert.equal(result, 'test-name=test-value');
    });
  });

  describe('toHeader()', () => {
    let instance;
    const base =
      'test-name=test-value; expires=Sat, 13 Sep 275760 00:00:00 GMT';
    beforeEach(() => {
      instance = new Cookie('test-name', 'test-value');
    });

    it('returns cookie header string', () => {
      const result = instance.toHeader();
      assert.equal(result, base);
    });

    it('adds path', () => {
      instance.path = '/api';
      const result = instance.toHeader();
      assert.equal(result, `${base}; path=/api`);
    });

    it('adds domain', () => {
      instance.domain = 'api.com';
      const result = instance.toHeader();
      assert.equal(result, `${base}; domain=api.com`);
    });

    it('adds httpOnly', () => {
      instance.httpOnly = true;
      const result = instance.toHeader();
      assert.equal(result, `${base}; httpOnly=true`);
    });
  });

  describe('toJSON()', () => {
    let instance;
    beforeEach(() => {
      instance = new Cookie('test-name', 'test-value');
    });

    it('does not contain properties with "_"', () => {
      const result = instance.toJSON();
      const keys = Object.keys(result);
      const has = keys.some((i) => i.indexOf('_') === 0);
      assert.isFalse(has, 'has no underscores');
    });
  });
});
