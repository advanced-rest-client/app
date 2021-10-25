import { assert } from '@open-wc/testing';
import { JsonExtractor } from '../../src/lib/actions/runner/JsonExtractor.js';
import { ActionIterableObject } from '../../src/lib/actions/runner/ActionIterableObject.js';

/** @typedef {import('@advanced-rest-client/events').Actions.IteratorConfiguration} IteratorConfiguration */

describe('JsonExtractor', () => {
  describe('Constructor', () => {
    const json = '{"test": true}';
    const path = 'a.b.b';
    const iterator =  /** @type IteratorConfiguration */ ({
      operator: 'equal',
      condition: 'test',
      path: 'properties.*.first'
    });

    it('sets _data property', () => {
      const instance = new JsonExtractor(json, path, iterator);
      assert.typeOf(instance._data, 'object');
    });

    it('sets _path property when set', () => {
      const instance = new JsonExtractor(json, path, iterator);
      assert.typeOf(instance._path, 'array');
      assert.lengthOf(instance._path, 3);
    });

    it('_path is undefined when missing', () => {
      const instance = new JsonExtractor(json, undefined, iterator);
      assert.isUndefined(instance._path);
    });

    it('sets _iterator property', () => {
      const instance = new JsonExtractor(json, path, iterator);
      assert.isTrue(instance._iterator instanceof ActionIterableObject);
    });
  });

  describe('_processJson()', () => {
    const json = '{"test": true}';
    const path = 'a.b.b';
    const iterator =  /** @type IteratorConfiguration */ ({
      operator: 'equal',
      condition: 'test',
      path: 'properties.*.first'
    });

    it('returns undefined when no argument', () => {
      const instance = new JsonExtractor(json, path, iterator);
      const result = instance._processJson(undefined);
      assert.isUndefined(result);
    });

    it('returns undefined when argument is a number', () => {
      const instance = new JsonExtractor(json, path, iterator);
      const result = instance._processJson(5);
      assert.isUndefined(result);
    });

    it('returns undefined when argument is a boolean', () => {
      const instance = new JsonExtractor(json, path, iterator);
      const result = instance._processJson(true);
      assert.isUndefined(result);
    });

    it('returns undefined when argument cannot be parsed', () => {
      const instance = new JsonExtractor(json, path, iterator);
      const result = instance._processJson('{"test');
      assert.isUndefined(result);
    });

    it('returns passed argument if not string', () => {
      const instance = new JsonExtractor(json, path, iterator);
      const result = instance._processJson({ test: 'value' });
      assert.deepEqual(result, { test: 'value' });
    });

    it('returns an object', () => {
      const instance = new JsonExtractor(json, path, iterator);
      const result = instance._processJson(json);
      assert.deepEqual(result, {
        test: true
      });
    });

    it('returns an array', () => {
      const instance = new JsonExtractor(json, path, iterator);
      const result = instance._processJson('["a"]');
      assert.deepEqual(result, ['a']);
    });
  });

  describe('extract()', () => {
    describe('Object json', () => {
      const data = `
      {
        "items": [{
          "id": "id1",
          "name": {
            "first": "Test"
          }
        }, {
          "id": "id2",
          "name": {
            "first": "Brown"
          }
        }],
        "nextPageToken": "testToken",
        "deep": {
          "object": {
            "value": "true"
          }
        }
      }
      `;
      let extractor = /** @type JsonExtractor */ (null);
      it('reads first level value', () => {
        extractor = new JsonExtractor(data, 'nextPageToken');
        const result = extractor.extract();
        assert.equal(result, 'testToken');
      });

      it('reads deep object value', () => {
        extractor = new JsonExtractor(data, 'deep.object.value');
        const result = extractor.extract();
        assert.equal(result, 'true');
      });

      it('reads array value', () => {
        extractor = new JsonExtractor(data, 'items.1.id');
        const result = extractor.extract();
        assert.equal(result, 'id2');
      });

      it('reads array deep value', () => {
        extractor = new JsonExtractor(data, 'items.1.name.first');
        const result = extractor.extract();
        assert.equal(result, 'Brown');
      });

      it('returns undefined for unknown path', () => {
        extractor = new JsonExtractor(data, 'items.2.name.first');
        const result = extractor.extract();
        assert.isUndefined(result);
      });

      it('returns undefined for unknown json', () => {
        extractor = new JsonExtractor(undefined, 'items.2.name.first');
        const result = extractor.extract();
        assert.isUndefined(result, 'Brown');
      });
    });

    describe('array JSON', () => {
      const data = [
        {
          id: 'id1',
          name: {
            first: 'Test',
            last: 'Name'
          }
        },
        {
          id: 'id2',
          name: {
            first: 'Brown',
            last: 'test2'
          }
        }
      ];
      let extractor;
      it('reads array value without iterator', () => {
        extractor = new JsonExtractor(data, '0.id');
        const result = extractor.extract();
        assert.equal(result, 'id1');
      });

      it('reads deep array value without iterator', () => {
        extractor = new JsonExtractor(data, '0.name.first');
        const result = extractor.extract();
        assert.equal(result, 'Test');
      });

      it('returns undefined when path not found', () => {
        extractor = new JsonExtractor(data, '0.name.something');
        const result = extractor.extract();
        assert.isUndefined(result);
      });
    });
  });

  describe('Iterators', () => {
    describe('object value - old paths resolver', () => {
      const data = `
      {
        "items": [{
          "id": "id1",
          "name": {
            "first": "Test",
            "last": "Last test"
          }
        }, {
          "id": "id2",
          "name": {
            "first": "Adam",
            "last": "Brown"
          }
        }]
      }
      `;
      const iterator = /** @type IteratorConfiguration */ ({
        path: 'items.*.name.last',
        operator: 'equal',
        condition: 'Brown'
      });
      let extractor = /** @type JsonExtractor */ (null);
      it('reads iterable value', () => {
        extractor = new JsonExtractor(data, 'id', iterator);
        const result = extractor.extract();
        assert.equal(result, 'id2');
      });

      it('Reads iterable deep value', () => {
        extractor = new JsonExtractor(data, 'name.first', iterator);
        const result = extractor.extract();
        assert.equal(result, 'Adam');
      });
    });

    describe('object value - new paths resolver', () => {
      const data = `
      {
        "items": [{
          "id": "id1",
          "name": {
            "first": "Test",
            "last": "Last test"
          }
        }, {
          "id": "id2",
          "name": {
            "first": "Adam",
            "last": "Brown"
          }
        }]
      }
      `;
      const iterator = /** @type IteratorConfiguration */ ({
        path: 'name.last',
        operator: 'equal',
        condition: 'Brown'
      });
      let extractor = /** @type JsonExtractor */ (null);

      it('reads iterable value', () => {
        extractor = new JsonExtractor(data, 'items.*.id', iterator);
        const result = extractor.extract();
        assert.equal(result, 'id2');
      });

      it('reads iterable deep value', () => {
        extractor = new JsonExtractor(data, 'items.*.name.first', iterator);
        const result = extractor.extract();
        assert.equal(result, 'Adam');
      });
    });

    describe('array value - old paths resolver', () => {
      const data = [
        {
          id: 'id1',
          name: {
            first: 'Test',
            last: 'Name'
          }
        },
        {
          id: 'id2',
          name: {
            first: 'Brown',
            last: 'test2'
          }
        }
      ];
      const iterator = /** @type IteratorConfiguration */ ({
        path: '*.name.first',
        operator: 'equal',
        condition: 'Brown'
      });
      let extractor = /** @type JsonExtractor */ (null);
      it('Reads simple path value', () => {
        extractor = new JsonExtractor(data, 'id', iterator);
        const result = extractor.extract();
        assert.equal(result, 'id2');
      });

      it('Reads deep path value', () => {
        extractor = new JsonExtractor(data, 'name.last', iterator);
        const result = extractor.extract();
        assert.equal(result, 'test2');
      });
    });

    describe('array value - new paths resolver', () => {
      const data = [
        {
          id: 'id1',
          name: {
            first: 'Test',
            last: 'Name'
          }
        },
        {
          id: 'id2',
          name: {
            first: 'Brown',
            last: 'test2'
          }
        }
      ];
      const iterator = /** @type IteratorConfiguration */ ({
        path: 'name.first',
        operator: 'equal',
        condition: 'Brown'
      });
      let extractor = /** @type JsonExtractor */ (null);
      it('Reads simple path value', () => {
        extractor = new JsonExtractor(data, '*.id', iterator);
        const result = extractor.extract();
        assert.equal(result, 'id2');
      });

      it('reads deep path value', () => {
        extractor = new JsonExtractor(data, '*.name.last', iterator);
        const result = extractor.extract();
        assert.equal(result, 'test2');
      });
    });

    describe('iteration over objects - old paths resolver', () => {
      const data = {
        id: 'id1',
        properties: {
          first: 'Test',
          last: 'Name',
          id: 'testId'
        },
        deep: {
          value: {
            properties: {
              first: 'Test',
              last: 'Name',
              id: 'testId2'
            }
          }
        }
      };
      const iterator = /** @type IteratorConfiguration */ ({
        path: 'properties.*.first',
        operator: 'equal',
        condition: 'Test'
      });
      let extractor = /** @type JsonExtractor */ (null);
      it('Reads simple path value', () => {
        extractor = new JsonExtractor(data, 'id', iterator);
        const result = extractor.extract();
        assert.equal(result, 'testId');
      });

      it('Reads complex path value', () => {
        iterator.path = 'deep.value.properties.*.first';
        extractor = new JsonExtractor(data, 'id', iterator);
        const result = extractor.extract();
        assert.equal(result, 'testId2');
      });
    });

    describe('iteration over objects - new paths resolver', () => {
      const data = {
        id: 'id1',
        properties: {
          first: 'Test',
          last: 'Name',
          id: 'testId'
        },
        deep: {
          value: {
            properties: {
              first: 'Test',
              last: 'Name',
              id: 'testId2'
            }
          }
        }
      };
      const iterator = /** @type IteratorConfiguration */ ({
        path: 'first',
        operator: 'equal',
        condition: 'Test'
      });
      let extractor = /** @type JsonExtractor */ (null);
      it('Reads simple path value', () => {
        extractor = new JsonExtractor(data, 'properties.*.id', iterator);
        const result = extractor.extract();
        assert.equal(result, 'testId');
      });

      it('reads complex path value', () => {
        extractor = new JsonExtractor(data, 'deep.value.properties.*.id', iterator);
        const result = extractor.extract();
        assert.equal(result, 'testId2');
      });
    });
  });
});
