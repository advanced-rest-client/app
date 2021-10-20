import { assert } from '@open-wc/testing';
import { ArcHeaders } from '../../index.js';

describe('ArcHeaders tests', () => {
  [
    ['String', 'x-a:a\nx-b:b\nc:c', 3, ['x-a', 'x-b', 'c'], ['a', 'b', 'c']],
    ['Map', {
      'x-a': 'a',
      'x-b': 'b',
      'c': 'c',
    }, 3, ['x-a', 'x-b', 'c'], ['a', 'b', 'c']],
    ['Array', [['x-a', 'a'], ['x-b', 'b'], ['c', 'c']], 3, ['x-a', 'x-b', 'c'], ['a', 'b', 'c']],
    ['undefined', undefined, 0, [], []],
  ].forEach((item) => {
    describe(`${item[0]} input`, () => {
      it(`Parses ${item[0]} as an input`, () => {
        const instance = new ArcHeaders(item[1]);
        assert.lengthOf(Object.keys(instance.map), Number(item[2]));
      });

      it('Has correct list of headers', () => {
        const instance = new ArcHeaders(item[1]);
        const keys = Object.keys(instance.map);
        keys.forEach((key) => {
          assert.notEqual(/** @type string[] */ (item[3]).indexOf(key), -1);
        });
        keys.forEach((key) => {
          assert.notEqual(/** @type string[] */ (item[4]).indexOf(instance.map[key].value), -1);
        });
      });
    });
  });

  describe('append()', () => {
    it('Appends an item that does not exists', () => {
      const instance = new ArcHeaders();
      instance.append('name', 'value');
      assert.equal(instance.map.name.value, 'value');
      assert.equal(instance.map.name.name, 'name');
    });

    it('Updates existing item', () => {
      const instance = new ArcHeaders();
      instance.append('name', 'value');
      instance.append('name', 'other-value');
      assert.equal(instance.map.name.value, 'value,other-value');
    });

    it('Normalizes keys', () => {
      const instance = new ArcHeaders();
      instance.append('AbCd', 'value');
      assert.ok(instance.map.abcd);
    });
  });

  describe('set()', () => {
    it('Sets an item that does not exists', () => {
      const instance = new ArcHeaders();
      instance.set('name', 'value');
      assert.equal(instance.map.name.value, 'value');
      assert.equal(instance.map.name.name, 'name');
    });

    it('Replaces existing item', () => {
      const instance = new ArcHeaders();
      instance.set('name', 'value');
      instance.set('name', 'other-value');
      assert.equal(instance.map.name.value, 'other-value');
    });

    it('Normalizes keys', () => {
      const instance = new ArcHeaders();
      instance.set('AbCd', 'value');
      assert.ok(instance.map.abcd);
    });
  });

  describe('delete()', () => {
    it('Ignores item that does not exists', () => {
      const instance = new ArcHeaders('a: b');
      instance.delete('x');
      assert.ok(instance.map.a);
    });

    it('Removes existing item', () => {
      const instance = new ArcHeaders('a: b');
      instance.delete('a');
      assert.lengthOf(Object.keys(instance.map), 0);
    });

    it('Normalizes keys', () => {
      const instance = new ArcHeaders('AbCd: xxx');
      instance.delete('aBcD');
      assert.lengthOf(Object.keys(instance.map), 0);
    });
  });

  describe('get()', () => {
    it('Returns undefined for non existing item', () => {
      const instance = new ArcHeaders('a: b');
      const result = instance.get('x');
      assert.isUndefined(result);
    });

    it('Returns value for existing item', () => {
      const instance = new ArcHeaders('a: b');
      const result = instance.get('a');
      assert.equal(result, 'b');
    });

    it('Normalizes keys', () => {
      const instance = new ArcHeaders('AbCd: xxx');
      const result = instance.get('aBcD');
      assert.equal(result, 'xxx');
    });
  });

  describe('has()', () => {
    it('Returns false for non existing item', () => {
      const instance = new ArcHeaders('a: b');
      const result = instance.has('x');
      assert.isFalse(result);
    });

    it('Returns value for existing item', () => {
      const instance = new ArcHeaders('a: b');
      const result = instance.has('a');
      assert.isTrue(result);
    });

    it('Normalizes keys', () => {
      const instance = new ArcHeaders('AbCd: xxx');
      const result = instance.has('aBcD');
      assert.isTrue(result);
    });
  });

  describe('forEach()', () => {
    const input = 'AbCd: Test\nMy_Test: header';
    const keys = ['AbCd', 'My_Test'];
    const values = ['Test', 'header'];
    it('Iterates over items', () => {
      const instance = new ArcHeaders(input);
      instance.forEach((value, name) => {
        assert.notEqual(keys.indexOf(name), -1, `${name} is a name`);
        assert.notEqual(values.indexOf(value), -1, `${value} is a value`);
      });
    });
  });

  describe('toString()', () => {
    const input = 'My_Test: header\nAbCd: Test';
    it('Returns HTTP string', () => {
      const instance = new ArcHeaders(input);
      const result = instance.toString();
      assert.equal(result, input);
    });

    it('Returns HTTP string with multiple values', () => {
      const instance = new ArcHeaders(input);
      instance.append('abcd', 'test');
      const result = instance.toString();
      assert.equal(result, `${input},test`);
    });
  });

  describe('keys()', () => {
    const input = 'My_Test: header\nAbCd: Test';
    it('Is a generator', () => {
      const instance = new ArcHeaders(input);
      const result = instance.keys();
      assert.ok(result.next);
      const next = result.next();
      assert.isFalse(next.done);
    });

    it('can iterate over the keys', () => {
      const instance = new ArcHeaders(input);
      const allowed = ['My_Test', 'AbCd'];
      for (const key of instance.keys()) {
        assert.notEqual(allowed.indexOf(key), -1);
      }
    });
  });

  describe('values()', () => {
    const input = 'My_Test: header\nAbCd: Test';
    it('Is a generator', () => {
      const instance = new ArcHeaders(input);
      const result = instance.values();
      assert.ok(result.next);
      const next = result.next();
      assert.isFalse(next.done);
    });

    it('Can iterate over the values', () => {
      const instance = new ArcHeaders(input);
      const allowed = ['header', 'Test'];
      for (const key of instance.values()) {
        assert.notEqual(allowed.indexOf(key), -1);
      }
    });
  });

  describe('entries()', () => {
    const input = 'My_Test: header\nAbCd: Test';
    it('Is a generator', () => {
      const instance = new ArcHeaders(input);
      const result = instance.entries();
      assert.ok(result.next);
      const next = result.next();
      assert.isFalse(next.done);
    });

    it('Can iterate over the entries', () => {
      const instance = new ArcHeaders(input);
      const allowedKeys = ['My_Test', 'AbCd'];
      const allowedValues = ['header', 'Test'];
      for (const [key, value] of instance.entries()) {
        assert.notEqual(allowedKeys.indexOf(key), -1);
        assert.notEqual(allowedValues.indexOf(value), -1);
      }
    });
  });

  describe('Symbol.iterator', () => {
    const input = 'My_Test: header\nAbCd: Test';

    it('Can iterate over the object', () => {
      const instance = new ArcHeaders(input);
      const allowedKeys = ['My_Test', 'AbCd'];
      const allowedValues = ['header', 'Test'];
      for (const [key, value] of instance) {
        assert.notEqual(allowedKeys.indexOf(key), -1);
        assert.notEqual(allowedValues.indexOf(value), -1);
      }
    });
  });
});
