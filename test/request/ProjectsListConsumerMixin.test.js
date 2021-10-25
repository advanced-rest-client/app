import { fixture, assert, aTimeout, oneEvent } from '@open-wc/testing';
import sinon from 'sinon';
import { ArcMock } from '@advanced-rest-client/arc-mock';
import { ImportEvents, ArcModelEvents } from '@advanced-rest-client/events';
import { RequestModel, ProjectModel, MockedStore } from '@advanced-rest-client/idb-store'
import './projects-consumer-element.js';
import {
  projectsValue,
  computeProjectsAutocomplete,
  computeProjectSelection,
  refreshProjectsList,
  makingProjectsQueryValue,
} from '../../src/elements/request/internals.js';

/** @typedef {import('./projects-consumer-element').ProjectsConsumerElement} ProjectsConsumerElement */

describe('ProjectsListConsumerMixin', () => {
  const generator = new ArcMock();
  const store = new MockedStore();
  const projectModel = new ProjectModel();
  const requestModel = new RequestModel();

  before(() => {
    projectModel.listen(window);
    requestModel.listen(window);
  });

  after(() => {
    projectModel.unlisten(window);
    requestModel.unlisten(window);
  });

  /**
   * @returns {Promise<ProjectsConsumerElement>}
   */
  async function basicFixture() {
    return fixture(`<projects-consumer-element noautoprojects></projects-consumer-element>`);
  }

  /**
   * @returns {Promise<ProjectsConsumerElement>}
   */
  async function projectsFixture() {
    const elm = /** @type ProjectsConsumerElement */ (await fixture(`<projects-consumer-element></projects-consumer-element></div>`));
    if (elm.projects) {
      return elm;
    }
    await oneEvent(elm, 'projectschange');
    return elm;
  }

  describe('[dataImportHandler]()', () => {
    let element = /** @type ProjectsConsumerElement */(null);
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Calls refreshProjects() when import event is dispatched', async () => {
      let called = false;
      element.refreshProjects = async () => { called = true };
      ImportEvents.dataImported(document.body);
      await aTimeout(0);
      assert.isTrue(called);
    });
  });

  describe('[dataDestroyHandler]()', () => {
    let element = /** @type ProjectsConsumerElement */(null);
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('resets projects with "legacy-projects" datastore', () => {
      element[projectsValue] = generator.http.listProjects();
      ArcModelEvents.destroyed(document.body, 'legacy-projects');
      assert.isUndefined(element[projectsValue]);
    });

    it('resets projects with "all" datastore', () => {
      element[projectsValue] = generator.http.listProjects();
      ArcModelEvents.destroyed(document.body, 'all');
      assert.isUndefined(element[projectsValue]);
    });

    it('resets projects with "projects" datastore', () => {
      element[projectsValue] = generator.http.listProjects();
      ArcModelEvents.destroyed(document.body, 'projects');
      assert.isUndefined(element[projectsValue]);
    });

    it('ignores other stores', () => {
      element[projectsValue] = generator.http.listProjects();
      ArcModelEvents.destroyed(document.body, 'saved');
      assert.typeOf(element[projectsValue], 'array');
    });
  });

  describe('[computeProjectsAutocomplete]()', () => {
    let element = /** @type ProjectsConsumerElement */(null);
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('returns undefined when no argument', () => {
      const result = element[computeProjectsAutocomplete](undefined);
      assert.isUndefined(result);
    });

    it('returns undefined when passed array is empty', () => {
      const result = element[computeProjectsAutocomplete]([]);
      assert.isUndefined(result);
    });

    it('returns undefined when argument is not an array', () => {
      // @ts-ignore
      const result = element[computeProjectsAutocomplete](123);
      assert.isUndefined(result);
    });

    it('Returns list of suggestions', () => {
      const result = element[computeProjectsAutocomplete]([{
        name: 't1',
        _id: 'i1',
        order: 1
      }, {
        name: 't2',
        _id: 'i2',
        order: 2
      }]);
      assert.deepEqual(result, [{
        value: 't1',
        id: 'i1'
      }, {
        value: 't2',
        id: 'i2'
      }]);
    });  
  });

  describe('[computeProjectSelection]()', () => {
    let element = /** @type ProjectsConsumerElement */(null);
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Returns object when no argument', () => {
      const result = element[computeProjectSelection](undefined);
      assert.typeOf(result, 'object');
    });

    it('Returns object when argument is empty', () => {
      const result = element[computeProjectSelection]([]);
      assert.typeOf(result, 'object');
    });

    it('Object has empty "add" list', () => {
      const result = element[computeProjectSelection]([]);
      assert.typeOf(result.add, 'array');
      assert.lengthOf(result.add, 0);
    });

    it('Object has empty "existing" list', () => {
      const result = element[computeProjectSelection]([]);
      assert.typeOf(result.existing, 'array');
      assert.lengthOf(result.existing, 0);
    });

    it('Add projects to "add" property when projects do not exist', () => {
      const result = element[computeProjectSelection](['a', 'b']);
      assert.deepEqual(result.add, ['a', 'b']);
      assert.lengthOf(result.existing, 0);
    });

    it('Skips empty names', () => {
      const result = element[computeProjectSelection](['a', '', 'b']);
      assert.deepEqual(result.add, ['a', 'b']);
      assert.lengthOf(result.existing, 0);
    });

    it('Add projects to "existing" property when projects exist', () => {
      element[projectsValue] = [{
        name: 'a',
        _id: 'aId'
      }, {
        name: 'b',
        _id: 'bId'
      }];
      const result = element[computeProjectSelection](['aId', 'bId']);
      assert.deepEqual(result.existing, ['aId', 'bId']);
      assert.lengthOf(result.add, 0);
    });
  });

  describe('refreshProjects()', () => {
    let element = /** @type ProjectsConsumerElement */(null);
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('eventually calls [refreshProjectsList]()', async () => {
      let called = false;
      element[refreshProjectsList] = async () => { called = true };
      element.refreshProjects();
      await aTimeout(0);
      assert.isTrue(called);
    });

    it('Sets [makingProjectsQueryValue] flag', async () => {
      element[refreshProjectsList] = async () => { };
      element.refreshProjects();
      assert.isTrue(element[makingProjectsQueryValue]);
      await aTimeout(0);
    });

    it('Clears [makingProjectsQueryValue] flag after callback', async () => {
      element[refreshProjectsList] = async () => { };
      element.refreshProjects();
      await aTimeout(0);
      assert.isFalse(element[makingProjectsQueryValue]);
    });

    it('does nothing when [makingProjectsQueryValue] flag is set', async () => {
      let called = false;
      element[refreshProjectsList] = async () => { called = true };
      element[makingProjectsQueryValue] = true;
      element.refreshProjects();
      await aTimeout(0);
      assert.isFalse(called);
    });
  });

  describe('[refreshProjectsList]()', () => {
    let element = /** @type ProjectsConsumerElement */(null);
    beforeEach(async () => {
      element = await basicFixture();
    });

    before(async () => {
      await store.insertProjects(20, {
        autoRequestId: true,
      });
    });

    after(async () => {
      await store.destroySaved();
    });

    it('updates projects list', async () => {
      element[refreshProjectsList]();
      await oneEvent(element, 'projectschange');
      assert.typeOf(element.projects, 'array');
      assert.lengthOf(element.projects, 20);
    });

    it('calls notifyResize()', async () => {
      // @ts-ignore
      element.notifyResize = () => {};
      // @ts-ignore
      const spy = sinon.spy(element, 'notifyResize');
      element[refreshProjectsList]();
      await oneEvent(element, 'projectschange');
      await aTimeout(0);
      assert.isTrue(spy.called);
    });

    it('sets hasProjects property', async () => {
      element[refreshProjectsList]();
      await oneEvent(element, 'projectschange');
      assert.isTrue(element.hasProjects);
    });
  });

  describe('[projectChangeHandler]()', () => {
    let element = /** @type ProjectsConsumerElement */(null);
    beforeEach(async () => {
      element = await projectsFixture();
    });

    before(async () => {
      await store.insertProjects(20, {
        autoRequestId: true,
      });
    });

    after(async () => {
      await store.destroySaved();
    });

    it('updates project on the list of projects', async () => {
      const project = { ...element.projects[0] };
      project.name = 'test-name';
      const record = {
        id: project._id,
        rev: project._rev,
        item: project,
      };
      ArcModelEvents.Project.State.update(document.body, record);
      assert.equal(element.projects[0].name, 'test-name');
    });

    it('adds new project to the list', async () => {
      const project = generator.http.project();
      const record = {
        id: project._id,
        rev: 'test-rev',
        item: project,
      };
      ArcModelEvents.Project.State.update(document.body, record);
      assert.isTrue(element.projects.some((p) => p._id === project._id));
    });

    it('adds new project when no projects', async () => {
      element[projectsValue] = undefined;
      const project = generator.http.project();
      const record = {
        id: project._id,
        rev: 'test-rev',
        item: project,
      };
      ArcModelEvents.Project.State.update(document.body, record);
      assert.typeOf(element.projects, 'array');
      assert.lengthOf(element.projects, 1);
    });
    
    it('reads project data when missing', async () => {
      const projects = await store.insertProjects(1);
      const record = {
        id: projects[0]._id,
        rev: projects[0]._rev,
      };
      ArcModelEvents.Project.State.update(document.body, record);
      await oneEvent(element, 'projectschange');
      assert.isTrue(element.projects.some((p) => p._id === projects[0]._id));
    });
  });

  describe('[projectDeleteHandler]()', () => {
    let element = /** @type ProjectsConsumerElement */(null);
    beforeEach(async () => {
      element = await projectsFixture();
    });

    before(async () => {
      await store.insertProjects(20, { autoRequestId: true });
    });

    after(async () => {
      await store.destroySaved();
    });

    it('removes a project from the list', () => {
      const project = { ...element.projects[0] };
      ArcModelEvents.Project.State.delete(document.body, project._id, project._rev);
      assert.isFalse(element.projects.some((p) => p._id === project._id));
    });

    it('sets hasProjects to false when removing last project', () => {
      const project = { ...element.projects[0] };
      element[projectsValue] = [element.projects[0]];
      ArcModelEvents.Project.State.delete(document.body, project._id, project._rev);
      assert.isFalse(element.hasProjects);
    });
    
    it('ignores when no projects', () => {
      const project = { ...element.projects[0] };
      element[projectsValue] = undefined;
      ArcModelEvents.Project.State.delete(document.body, project._id, project._rev);
      assert.isUndefined(element.projects);
    });

    it('ignores when unknown project', () => {
      ArcModelEvents.Project.State.delete(document.body, 'a', 'b');
      assert.isFalse(element.projects.some((p) => p._id === 'a'));
    });
  });
});
