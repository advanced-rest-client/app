import { assert } from '@open-wc/testing';
import * as ConditionRunner from '../../src/lib/actions/runner/ConditionRunner.js';

/** @typedef {import('@advanced-rest-client/events').Actions.IteratorConfiguration} IteratorConfiguration */

describe('ConditionRunner', () => {
  const EQ_OP = 'equal';
  const NEQ_OP = 'not-equal';
  const GT_OP = 'greater-than';
  const GTE_OP = 'greater-than-equal';
  const LT_OP = 'less-than';
  const LTE_OP = 'less-than-equal';
  const CO_OP = 'contains';
  const RE_OP = 'regex';
  
  describe('isEqual()', () => {
    it('"a" equals "a"', () => {
      const result = ConditionRunner.isEqual('a', 'a');
      assert.isTrue(result);
    });

    it('"12" equals "12"', () => {
      const result = ConditionRunner.isEqual('12', '12');
      assert.isTrue(result);
    });

    it('"12" equals 12', () => {
      const result = ConditionRunner.isEqual('12', 12);
      assert.isTrue(result);
    });

    it('true equals true', () => {
      const result = ConditionRunner.isEqual(true, true);
      assert.isTrue(result);
    });

    it('"true" equals true', () => {
      const result = ConditionRunner.isEqual('true', true);
      assert.isTrue(result);
    });

    it('true equals "true"', () => {
      const result = ConditionRunner.isEqual(true, 'true');
      assert.isTrue(result);
    });

    it('false equals false', () => {
      const result = ConditionRunner.isEqual(false, false);
      assert.isTrue(result);
    });

    it('"false" equals false', () => {
      const result = ConditionRunner.isEqual('false', false);
      assert.isTrue(result);
    });

    it('false equals "false"', () => {
      const result = ConditionRunner.isEqual(false, 'false');
      assert.isTrue(result);
    });

    it('"a" not equals "b"', () => {
      const result = ConditionRunner.isEqual('a', 'b');
      assert.isFalse(result);
    });

    it('12 equals "12"', () => {
      const result = ConditionRunner.isEqual(12, '12');
      assert.isTrue(result);
    });

    it('undefined equals "a"', () => {
      const result = ConditionRunner.isEqual(undefined, 'a');
      assert.isFalse(result);
    });

    it('"a" equals undefined', () => {
      const result = ConditionRunner.isEqual('a', undefined);
      assert.isFalse(result);
    });
  });

  describe('isNotEqual()', () => {
    it('"a" not equals "a"', () => {
      const result = ConditionRunner.isNotEqual('a', 'a');
      assert.isFalse(result);
    });

    it('"12" not equals "12"', () => {
      const result = ConditionRunner.isNotEqual('12', '12');
      assert.isFalse(result);
    });

    it('"12" not equals 12', () => {
      const result = ConditionRunner.isNotEqual('12', 12);
      assert.isFalse(result);
    });

    it('true not equals true', () => {
      const result = ConditionRunner.isNotEqual(true, true);
      assert.isFalse(result);
    });

    it('"true" not equals true', () => {
      const result = ConditionRunner.isNotEqual('true', true);
      assert.isFalse(result);
    });

    it('true not equals "true"', () => {
      const result = ConditionRunner.isNotEqual(true, 'true');
      assert.isFalse(result);
    });

    it('false not equals false', () => {
      const result = ConditionRunner.isNotEqual(false, false);
      assert.isFalse(result);
    });

    it('"false" not equals false', () => {
      const result = ConditionRunner.isNotEqual('false', false);
      assert.isFalse(result);
    });

    it('false not equals "false"', () => {
      const result = ConditionRunner.isNotEqual(false, 'false');
      assert.isFalse(result);
    });

    it('"a" not equals "b"', () => {
      const result = ConditionRunner.isNotEqual('a', 'b');
      assert.isTrue(result);
    });

    it('12 not equals "12"', () => {
      const result = ConditionRunner.isNotEqual(12, '12');
      assert.isFalse(result);
    });

    it('undefined not equals "a"', () => {
      const result = ConditionRunner.isNotEqual(undefined, 'a');
      assert.isTrue(result);
    });

    it('"a" not equals undefined', () => {
      const result = ConditionRunner.isNotEqual('a', undefined);
      assert.isTrue(result);
    });
  });

  describe('isLessThan()', () => {
    it('1 less than 2', () => {
      const result = ConditionRunner.isLessThan(1, 2);
      assert.isTrue(result);
    });

    it('1 less than 1', () => {
      const result = ConditionRunner.isLessThan(1, 1);
      assert.isFalse(result);
    });

    it('"1" less than "2"', () => {
      const result = ConditionRunner.isLessThan('1', '2');
      assert.isTrue(result);
    });

    it('2 less than 1', () => {
      const result = ConditionRunner.isLessThan(2, 1);
      assert.isFalse(result);
    });

    it('"2" less than "1"', () => {
      const result = ConditionRunner.isLessThan('2', '1');
      assert.isFalse(result);
    });

    it('"a" less than "b"', () => {
      const result = ConditionRunner.isLessThan('a', 'b');
      assert.isFalse(result);
    });

    it('"b" less than "a"', () => {
      const result = ConditionRunner.isLessThan('a', 'b');
      assert.isFalse(result);
    });

    it('false less than true', () => {
      const result = ConditionRunner.isLessThan(false, true);
      assert.isTrue(result);
    });

    it('true less than false', () => {
      const result = ConditionRunner.isLessThan(true, false);
      assert.isFalse(result);
    });

    it('undefined less than "a"', () => {
      const result = ConditionRunner.isLessThan(undefined, 'a');
      assert.isFalse(result);
    });

    it('"a" less than undefined', () => {
      const result = ConditionRunner.isLessThan('a', undefined);
      assert.isFalse(result);
    });
  });

  describe('isLessThanEqual()', () => {
    it('1 less than or equal 2', () => {
      const result = ConditionRunner.isLessThanEqual(1, 2);
      assert.isTrue(result);
    });

    it('1 less than or equal 1', () => {
      const result = ConditionRunner.isLessThanEqual(1, 1);
      assert.isTrue(result);
    });

    it('"1" less than or equal "2"', () => {
      const result = ConditionRunner.isLessThanEqual('1', '2');
      assert.isTrue(result);
    });

    it('"1" less than or equal "1"', () => {
      const result = ConditionRunner.isLessThanEqual('1', '1');
      assert.isTrue(result);
    });

    it('2 less than or equal 1', () => {
      const result = ConditionRunner.isLessThanEqual(2, 1);
      assert.isFalse(result);
    });

    it('"2" less than or equal "1"', () => {
      const result = ConditionRunner.isLessThanEqual('2', '1');
      assert.isFalse(result);
    });

    it('"a" less than or equal "b"', () => {
      const result = ConditionRunner.isLessThanEqual('a', 'b');
      assert.isFalse(result);
    });

    it('"b" less than or equal "a"', () => {
      const result = ConditionRunner.isLessThanEqual('a', 'b');
      assert.isFalse(result);
    });

    it('false less than or equal true', () => {
      const result = ConditionRunner.isLessThanEqual(false, true);
      assert.isTrue(result);
    });

    it('false less than or equal false', () => {
      const result = ConditionRunner.isLessThanEqual(false, false);
      assert.isTrue(result);
    });

    it('true less than or equal true', () => {
      const result = ConditionRunner.isLessThanEqual(true, true);
      assert.isTrue(result);
    });

    it('true less than or equal false', () => {
      const result = ConditionRunner.isLessThanEqual(true, false);
      assert.isFalse(result);
    });

    it('undefined less than or equal "a"', () => {
      const result = ConditionRunner.isLessThanEqual(undefined, 'a');
      assert.isFalse(result);
    });

    it('"a" less than or equal undefined', () => {
      const result = ConditionRunner.isLessThanEqual('a', undefined);
      assert.isFalse(result);
    });
  });

  describe('isGreaterThan()', () => {
    it('1 greater than 2', () => {
      const result = ConditionRunner.isGreaterThan(1, 2);
      assert.isFalse(result);
    });

    it('1 greater than 1', () => {
      const result = ConditionRunner.isGreaterThan(1, 1);
      assert.isFalse(result);
    });

    it('"1" greater than "2"', () => {
      const result = ConditionRunner.isGreaterThan('1', '2');
      assert.isFalse(result);
    });

    it('2 greater than 1', () => {
      const result = ConditionRunner.isGreaterThan(2, 1);
      assert.isTrue(result);
    });

    it('"2" greater than "1"', () => {
      const result = ConditionRunner.isGreaterThan('2', '1');
      assert.isTrue(result);
    });

    it('"a" greater than "b"', () => {
      const result = ConditionRunner.isGreaterThan('a', 'b');
      assert.isFalse(result);
    });

    it('"b" less than "a"', () => {
      const result = ConditionRunner.isGreaterThan('a', 'b');
      assert.isFalse(result);
    });

    it('false greater than true', () => {
      const result = ConditionRunner.isGreaterThan(false, true);
      assert.isFalse(result);
    });

    it('true greater than false', () => {
      const result = ConditionRunner.isGreaterThan(true, false);
      assert.isTrue(result);
    });

    it('false greater than false', () => {
      const result = ConditionRunner.isGreaterThan(false, false);
      assert.isFalse(result);
    });

    it('true greater than true', () => {
      const result = ConditionRunner.isGreaterThan(true, true);
      assert.isFalse(result);
    });

    it('undefined greater than "a"', () => {
      const result = ConditionRunner.isGreaterThan(undefined, 'a');
      assert.isFalse(result);
    });

    it('"a" greater than undefined', () => {
      const result = ConditionRunner.isGreaterThan('a', undefined);
      assert.isFalse(result);
    });
  });

  describe('isGreaterThanEqual()', () => {
    it('1 greater than or equal 2', () => {
      const result = ConditionRunner.isGreaterThanEqual(1, 2);
      assert.isFalse(result);
    });

    it('1 greater than or equal 1', () => {
      const result = ConditionRunner.isGreaterThanEqual(1, 1);
      assert.isTrue(result);
    });

    it('"1" greater than or equal "2"', () => {
      const result = ConditionRunner.isGreaterThanEqual('1', '2');
      assert.isFalse(result);
    });

    it('2 greater than or equal 1', () => {
      const result = ConditionRunner.isGreaterThanEqual(2, 1);
      assert.isTrue(result);
    });

    it('"2" greater than or equal "1"', () => {
      const result = ConditionRunner.isGreaterThanEqual('2', '1');
      assert.isTrue(result);
    });

    it('"2" greater than or equal "2"', () => {
      const result = ConditionRunner.isGreaterThanEqual('2', '2');
      assert.isTrue(result);
    });

    it('"a" greater than or equal "b"', () => {
      const result = ConditionRunner.isGreaterThanEqual('a', 'b');
      assert.isFalse(result);
    });

    it('"b" less than or equal "a"', () => {
      const result = ConditionRunner.isGreaterThanEqual('a', 'b');
      assert.isFalse(result);
    });

    it('false greater than or equal true', () => {
      const result = ConditionRunner.isGreaterThanEqual(false, true);
      assert.isFalse(result);
    });

    it('true greater than or equal false', () => {
      const result = ConditionRunner.isGreaterThanEqual(true, false);
      assert.isTrue(result);
    });

    it('false greater than or equal false', () => {
      const result = ConditionRunner.isGreaterThanEqual(false, false);
      assert.isTrue(result);
    });

    it('true greater than or equal true', () => {
      const result = ConditionRunner.isGreaterThanEqual(true, true);
      assert.isTrue(result);
    });

    it('undefined less than or equal "a"', () => {
      const result = ConditionRunner.isGreaterThanEqual(undefined, 'a');
      assert.isFalse(result);
    });

    it('"a" less than or equal undefined', () => {
      const result = ConditionRunner.isGreaterThanEqual('a', undefined);
      assert.isFalse(result);
    });
  });

  describe('contains()', () => {
    describe('Strings', () => {
      it('abc contains a', () => {
        const result = ConditionRunner.contains('abc', 'a');
        assert.isTrue(result);
      });

      it('abc contains c', () => {
        const result = ConditionRunner.contains('abc', 'c');
        assert.isTrue(result);
      });

      it('abc does not contains d', () => {
        const result = ConditionRunner.contains('abc', 'd');
        assert.isFalse(result);
      });

      it('abc does not contains undefined', () => {
        const result = ConditionRunner.contains('abc', undefined);
        assert.isFalse(result);
      });

      it('undefined does not contains a', () => {
        const result = ConditionRunner.contains(undefined, 'a');
        assert.isFalse(result);
      });
    });

    describe('Arrays', () => {
      const value = ['a', 'b', 'c', 1, 2];
      it('[a,b,c,1,2,3] contains "a"', () => {
        const result = ConditionRunner.contains(value, 'a');
        assert.isTrue(result);
      });

      it('[a,b,c,1,2,3] contains "c"', () => {
        const result = ConditionRunner.contains(value, 'c');
        assert.isTrue(result);
      });

      it('[a,b,c,1,2,3] contains 1', () => {
        const result = ConditionRunner.contains(value, 1);
        assert.isTrue(result);
      });

      it('[a,b,c,1,2,3] contains "2"', () => {
        const result = ConditionRunner.contains(value, '2');
        assert.isTrue(result);
      });

      it('[a,b,c,1,2,3] does not contains d', () => {
        const result = ConditionRunner.contains(value, 'd');
        assert.isFalse(result);
      });

      it('[a,b,c,1,2,3] does not contains undefined', () => {
        const result = ConditionRunner.contains(value, undefined);
        assert.isFalse(result);
      });

      it('undefined does not contains a', () => {
        const result = ConditionRunner.contains(undefined, 'a');
        assert.isFalse(result);
      });
    });

    describe('Object', () => {
      const sym = Symbol('foo');
      const value = {
        a: 'a',
        b: 'b',
        c: 'c',
        1: '1',
        2: '2',
        3: '3'
      };
      before(() => {
        value[sym] = 'sym';
      });

      it('Object contains "a"', () => {
        const result = ConditionRunner.contains(value, 'a');
        assert.isTrue(result);
      });

      it('Object contains "c"', () => {
        const result = ConditionRunner.contains(value, 'a');
        assert.isTrue(result);
      });

      it('Object contains "1"', () => {
        const result = ConditionRunner.contains(value, '1');
        assert.isTrue(result);
      });

      it('Object contains 1', () => {
        const result = ConditionRunner.contains(value, 1);
        assert.isTrue(result);
      });

      it('Object contains Symbol', () => {
        const result = ConditionRunner.contains(value, sym);
        assert.isTrue(result);
      });

      it('Object does not contains d', () => {
        const result = ConditionRunner.contains(value, 'd');
        assert.isFalse(result);
      });

      it('Object does not contains undefined', () => {
        const result = ConditionRunner.contains(value, undefined);
        assert.isFalse(result);
      });

      it('undefined does not contains a', () => {
        const result = ConditionRunner.contains(undefined, 'a');
        assert.isFalse(result);
      });
    });

    describe('Other types', () => {
      it('False for boolean value', () => {
        const result = ConditionRunner.contains(true, true);
        assert.isFalse(result);
      });

      it('False for undefined value', () => {
        const result = ConditionRunner.contains(undefined, undefined);
        assert.isFalse(result);
      });

      it('False for null value', () => {
        const result = ConditionRunner.contains(null, null);
        assert.isFalse(result);
      });

      it('False for Symbol value', () => {
        const symbol = Symbol('a');
        const result = ConditionRunner.contains(symbol, symbol);
        assert.isFalse(result);
      });
    });
  });

  describe('isRegex()', () => {
    it('returns true when matches', () => {
      const result = ConditionRunner.isRegex('make my day', 'make');
      assert.isTrue(result);
    });

    it('returns true when matches multiline', () => {
      const result = ConditionRunner.isRegex(`Please,
        make my day`, 'make');
      assert.isTrue(result);
    });

    it('is case sensitive', () => {
      const result = ConditionRunner.isRegex(`Please,
        make my day`, 'Make');
      assert.isFalse(result);
    });

    it('returns false when no match', () => {
      const result = ConditionRunner.isRegex(`make my day`, 'other');
      assert.isFalse(result);
    });

    it('returns false when invalid regexp', () => {
      const result = ConditionRunner.isRegex(`make my day`, '[a-z');
      assert.isFalse(result);
    });
  });

  describe('checkCondition()', () => {
    it('true for equal action', () => {
      const result = ConditionRunner.checkCondition(1, EQ_OP, 1);
      assert.isTrue(result);
    });

    it('false for equal action', () => {
      const result = ConditionRunner.checkCondition(1, EQ_OP, 2);
      assert.isFalse(result);
    });

    it('true for not equal action', () => {
      const result = ConditionRunner.checkCondition(2, NEQ_OP, 1);
      assert.isTrue(result);
    });

    it('false for not equal action', () => {
      const result = ConditionRunner.checkCondition(1, NEQ_OP, 1);
      assert.isFalse(result);
    });

    it('true for less than action', () => {
      const result = ConditionRunner.checkCondition(1, LT_OP, 2);
      assert.isTrue(result);
    });

    it('false for less than action', () => {
      const result = ConditionRunner.checkCondition(2, LT_OP, 1);
      assert.isFalse(result);
    });

    it('true for less than or equal action', () => {
      const result = ConditionRunner.checkCondition(2, LTE_OP, 2);
      assert.isTrue(result);
    });

    it('false for less than or equal action', () => {
      const result = ConditionRunner.checkCondition(2, LTE_OP, 1);
      assert.isFalse(result);
    });

    it('true for greater than action', () => {
      const result = ConditionRunner.checkCondition(2, GT_OP, 1);
      assert.isTrue(result);
    });

    it('false for greater than action', () => {
      const result = ConditionRunner.checkCondition(1, GT_OP, 2);
      assert.isFalse(result);
    });

    it('true for greater than or equal action', () => {
      const result = ConditionRunner.checkCondition(2, GTE_OP, 2);
      assert.isTrue(result);
    });

    it('false for greater than or equal action', () => {
      const result = ConditionRunner.checkCondition(1, GTE_OP, 2);
      assert.isFalse(result);
    });

    it('true for contains action', () => {
      const result = ConditionRunner.checkCondition('abc', CO_OP, 'a');
      assert.isTrue(result);
    });

    it('false for contains action', () => {
      const result = ConditionRunner.checkCondition('abc', CO_OP, 'd');
      assert.isFalse(result);
    });

    it('true for regex action', () => {
      const result = ConditionRunner.checkCondition('abc', RE_OP, 'a');
      assert.isTrue(result);
    });

    it('false for regex action', () => {
      const result = ConditionRunner.checkCondition('abc', RE_OP, 'd');
      assert.isFalse(result);
    });
  });
});
