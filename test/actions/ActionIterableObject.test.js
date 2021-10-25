import { assert } from '@open-wc/testing';
import { ActionIterableObject } from '../../src/lib/actions/runner/ActionIterableObject.js';

/** @typedef {import('@advanced-rest-client/events').Actions.IteratorConfiguration} IteratorConfiguration */

describe('ActionIterableObject', () => {
  describe('constructor()', () => {
    const base = /** @type IteratorConfiguration */ (Object.freeze({
      path: 'test.path',
      operator: 'equal',
      condition: 'a condition',
    }));
    it('marks it invalid when missing the configuration', () => {
      // @ts-ignore
      const iterable = new ActionIterableObject({});
      assert.isFalse(iterable.valid);
    });

    it('marks it invalid when missing the path', () => {
      const init = { ...base };
      delete init.path;
      const iterable = new ActionIterableObject(init);
      assert.isFalse(iterable.valid);
    });

    it('marks it invalid when missing the operator', () => {
      const init = { ...base };
      delete init.operator;
      const iterable = new ActionIterableObject(init);
      assert.isFalse(iterable.valid);
    });

    it('marks it invalid when missing the condition', () => {
      const init = { ...base };
      delete init.condition;
      const iterable = new ActionIterableObject(init);
      assert.isFalse(iterable.valid);
    });

    it('marks it invalid when operator is invalid', () => {
      const init = { ...base };
      // @ts-ignore
      init.operator = 'test';
      const iterable = new ActionIterableObject(init);
      assert.isFalse(iterable.valid);
    });

    it('sets the path', () => {
      const iterable = new ActionIterableObject({ ...base });
      assert.deepEqual(iterable.path, ['test', 'path']);
    });

    it('sets the operator', () => {
      const iterable = new ActionIterableObject({ ...base });
      assert.equal(iterable.operator, base.operator);
    });

    it('sets the condition', () => {
      const iterable = new ActionIterableObject({ ...base });
      assert.equal(iterable.condition, base.condition);
    });
  });
});
