import { assert } from '@open-wc/testing';
import { ArcMock } from '@advanced-rest-client/arc-mock';
import { 
  isProjectRequest,
  hasTwoLines,
  computeA11yCommand,
  idsArrayEqual,
  validateRequestType,
  projectLegacySort,
  savedSort,
  projectsSortFn,
} from '../../src/lib/Utils.js';

describe('Utils', () => {
  const generator = new ArcMock();

  describe('isProjectRequest()', () => {
    const projectId = 'test-project';

    it('returns false when no project id', () => {
      const item = generator.http.saved();
      const result = isProjectRequest(item, undefined);
      assert.isFalse(result);
    });

    it('returns false when item has other projects', () => {
      const item = generator.http.saved();
      item.projects = ['other'];
      const result = isProjectRequest(item, projectId);
      assert.isFalse(result);
    });

    it('Returns true when project is on projects list', () => {
      const item = generator.http.saved();
      item.projects = [projectId];
      const result = isProjectRequest(item, projectId);
      assert.isTrue(result);
    });

    it('Returns true when project is set on legacyProject', () => {
      const item = generator.http.saved();
      // @ts-ignore
      item.legacyProject = projectId;
      const result = isProjectRequest(item, projectId);
      assert.isTrue(result);
    });
  });

  describe('hasTwoLines()', () => {
    it('returns true when no type', () => {
      // @ts-ignore
      const result = hasTwoLines('');
      assert.isTrue(result);
    });

    it('returns true when type is default', () => {
      const result = hasTwoLines('default');
      assert.isTrue(result);
    });

    it('returns true false type is not default', () => {
      const result = hasTwoLines('compact');
      assert.isFalse(result);
    });
  });

  describe('computeA11yCommand()', () => {
    it('returns passed letter with CMD/CTRL', () => {
      const result = computeA11yCommand('s');
      assert.isTrue(/(meta|ctrl)\+s/.test(result));
    });
  });

  describe('idsArrayEqual()', () => {
    it('Returns true when both undefined', () => {
      const result = idsArrayEqual(undefined, undefined);
      assert.isTrue(result);
    });

    it('Returns true when both empty', () => {
      const result = idsArrayEqual([], []);
      assert.isTrue(result);
    });

    it('Returns true when has the same order', () => {
      const result = idsArrayEqual(['a', 'b'], ['a', 'b']);
      assert.isTrue(result);
    });

    it('Returns false when not the same order', () => {
      const result = idsArrayEqual(['b', 'a'], ['a', 'b']);
      assert.isFalse(result);
    });

    it('Returns false when different size', () => {
      const result = idsArrayEqual(['a'], ['a', 'b']);
      assert.isFalse(result);
    });

    it('Returns false when A is undefined', () => {
      const result = idsArrayEqual(undefined, ['a', 'b']);
      assert.isFalse(result);
    });

    it('Returns false when B is undefined', () => {
      const result = idsArrayEqual(['a', 'b'], undefined);
      assert.isFalse(result);
    });
  });

  describe('validateRequestType()', () => {
    ['project', 'history', 'saved'].forEach((type) => {
      it(`passes validation for ${type}`, () => {
        // @ts-ignore
        validateRequestType(type);
      });
    });

    it('throws for unknown type', () => {
      assert.throws(() => {
        // @ts-ignore
        validateRequestType('other');
      });
    });
  });

  describe('projectLegacySort()', () => {
    it('returns 1 when a projectOrder is > than b projectOrder', () => {
      const result = projectLegacySort({
        projectOrder: 1
      }, {
        projectOrder: 0
      });
      assert.equal(result, 1);
    });

    it('Returns -1 when a projectOrder is < than b projectOrder', () => {
      const result = projectLegacySort({
        projectOrder: 0
      }, {
        projectOrder: 1
      });
      assert.equal(result, -1);
    });

    it('Returns 1 when a name is > than b name', () => {
      const result = projectLegacySort({
        projectOrder: 0,
        name: 'b'
      }, {
        projectOrder: 0,
        name: 'a'
      });
      assert.equal(result, 1);
    });

    it('Returns -1 when a name is < than b name', () => {
      const result = projectLegacySort({
        projectOrder: 0,
        name: 'a'
      }, {
        projectOrder: 0,
        name: 'b'
      });
      assert.equal(result, -1);
    });

    it('Returns 0 when objects equal', () => {
      const result = projectLegacySort({
        projectOrder: 0,
        name: 'a'
      }, {
        projectOrder: 0,
        name: 'a'
      });
      assert.equal(result, 0);
    });
  });

  describe('savedSort()', () => {
    let data;
    beforeEach(async () => {
      data = [{
        _id: '1',
        name: 'c'
      }, {
        _id: '2',
        name: 'a'
      }, {
        _id: '3',
        name: 'b'
      }];
    });

    it('Sorts the array', () => {
      data.sort(savedSort);
      assert.equal(data[0]._id, '2');
      assert.equal(data[1]._id, '3');
      assert.equal(data[2]._id, '1');
    });

    it('Returns 0 when times equal', () => {
      const a = {
        name: 'a',
        url: '',
        method: '',
      };
      const b = {
        name: 'a',
        url: '',
        method: '',
      };
      const result = savedSort(a, b);
      assert.equal(result, 0);
    });

    it('Returns -1 when A time is higher', () => {
      const a = {
        name: 'b',
        url: '',
        method: '',
      };
      const b = {
        name: 'a',
        url: '',
        method: '',
      };
      const result = savedSort(a, b);
      assert.equal(result, 1);
    });

    it('Returns 1 when B time is higher', () => {
      const a = {
        name: 'a',
        url: '',
        method: '',
      };
      const b = {
        name: 'b',
        url: '',
        method: '',
      };
      const result = savedSort(a, b);
      assert.equal(result, -1);
    });

    it('Returns -1 when A is missing name', () => {
      const a = {
        name: undefined,
        url: '',
        method: '',
      };
      const b = {
        name: 'b',
        url: '',
        method: '',
      };
      const result = savedSort(a, b);
      assert.equal(result, -1);
    });

    it('Returns 1 when B is missing name', () => {
      const a = {
        name: 'b',
        url: '',
        method: '',
      };
      const b = {
        name: undefined,
        url: '',
        method: '',
      };
      const result = savedSort(a, b);
      assert.equal(result, 1);
    });

    it('Returns 0 when A and B is missing name', () => {
      const a = {
        name: undefined,
        url: '',
        method: '',
      };
      const b = {
        name: undefined,
        url: '',
        method: '',
      };
      const result = savedSort(a, b);
      assert.equal(result, 0);
    });
  });

  describe('projectsSortFn()', () => {
    it('returns 1', () => {
      // @ts-ignore
      const result = projectsSortFn({ order: 1 }, { order: 0 });
      assert.equal(result, 1);
    });

    it('returns -1', () => {
      // @ts-ignore
      const result = projectsSortFn({ order: 0 }, { order: 1 });
      assert.equal(result, -1);
    });

    it('returns 0', () => {
      // @ts-ignore
      const result = projectsSortFn({ order: 0 }, { order: 0 });
      assert.equal(result, 0);
    });
  });
});
