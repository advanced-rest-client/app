/* eslint-disable prefer-destructuring */
import { fixture, assert, aTimeout, html } from '@open-wc/testing';
import sinon from 'sinon';
import { ArcMock } from '@advanced-rest-client/arc-mock';
import { MockedStore, RequestModel, ProjectModel } from '@advanced-rest-client/idb-store';
import { ArcModelEvents, ArcModelEventTypes, ArcNavigationEventTypes, ProjectActions } from '@advanced-rest-client/events';
import * as internals from '../../src/elements/request/internals.js';
import '../../define/projects-menu.js';
import {
  openedProjectsValue,
  addProjectHandler,
  hoveredProjectValue,
  openingProjectTimeout,
  openProject,
} from '../../src/elements/menu/ProjectsMenuElement.js';

/** @typedef {import('../../').ProjectsMenuElement} ProjectsMenuElement */
/** @typedef {import('@advanced-rest-client/events').Project.ARCProject} ARCProject */
/** @typedef {import('@advanced-rest-client/events').ArcRequest.ARCSavedRequest} ARCSavedRequest */
/** @typedef {import('@anypoint-web-components/awc').AnypointMenuButtonElement} AnypointMenuButtonElement */

describe('ProjectsMenuElement', () => {
  const generator = new ArcMock();
  const store = new MockedStore();
  const requestModel = new RequestModel();
  const projectsModel = new ProjectModel();

  before(() => {
    requestModel.listen(window);
    projectsModel.listen(window);
  });

  after(() => {
    requestModel.unlisten(window);
    projectsModel.unlisten(window);
  });

  /**
   * @returns {Promise<ProjectsMenuElement>}
   */
  async function basicFixture() {
    return fixture(html`<projects-menu draggableEnabled noAutoProjects></projects-menu>`);
  }

  /**
   * @param {ProjectsMenuElement} element 
   * @param {number=} index 
   * @returns {Promise<AnypointMenuButtonElement>}
   */
  async function openMenu(element, index=0) {
    const target = element.shadowRoot.querySelectorAll('.project-item')[index];
    const event = new MouseEvent('mouseenter', {
      bubbles: true,
      cancelable: true,
    });
    target.dispatchEvent(event);
    await element.requestUpdate();
    const menu = target.querySelector('anypoint-menu-button');
    menu.opened = true;
    await aTimeout(0);
    return menu;
  }

  describe('constructor()', () => {
    let element = /** @type ProjectsMenuElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('sets dragOpenTimeout', () => {
      assert.equal(element.dragOpenTimeout, 700);
    });

    it('sets noAuto', () => {
      assert.equal(element.noAuto, true);
    });

    it('sets [openedProjectsValue]', () => {
      assert.deepEqual(element[openedProjectsValue], []);
    });
  });

  describe('empty data rendering', () => {
    let element = /** @type ProjectsMenuElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('renders empty info', () => {
      const node = element.shadowRoot.querySelector('.list-empty');
      assert.ok(node);
    });

    it('renders add project button', () => {
      const node = element.shadowRoot.querySelector('[data-action="add-project"]');
      assert.ok(node);
    });
  });

  describe('[addProjectHandler]()', () => {
    let element = /** @type ProjectsMenuElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
    });

    after(async () => {
      await store.destroySaved();
    });

    it('adds new project to the store', async () => {
      const spy = sinon.spy();
      element.addEventListener(ArcModelEventTypes.Project.update, spy);
      await element[addProjectHandler]();
      assert.isTrue(spy.called, 'the event was dispatched');
      assert.lengthOf(element.projects, 1, 'has newly created project');
    });
  })

  describe('project item mouse over / out', () => {
    before(async () => {
      await store.insertProjects();
    });

    after(async () => {
      await store.destroySaved();
    });

    let element = /** @type ProjectsMenuElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
      await element[internals.refreshProjectsList]();
      await element.requestUpdate();
    });

    it('sets [hoveredProjectValue] on mouse enter', () => {
      const target = element.shadowRoot.querySelector('.project-item');
      const event = new MouseEvent('mouseenter', {
        bubbles: true,
        cancelable: true,
      });
      target.dispatchEvent(event);
      assert.equal(element[hoveredProjectValue], 0);
    });

    it('sets hovered class name on mouse enter', async () => {
      const target = element.shadowRoot.querySelector('.project-item');
      const event = new MouseEvent('mouseenter', {
        bubbles: true,
        cancelable: true,
      });
      target.dispatchEvent(event);
      await element.requestUpdate();
      assert.isTrue(target.classList.contains('hovered'));
    });

    it('renders drop down menu after mouse enter', async () => {
      const target = element.shadowRoot.querySelector('.project-item');
      const event = new MouseEvent('mouseenter', {
        bubbles: true,
        cancelable: true,
      });
      target.dispatchEvent(event);
      await element.requestUpdate();
      const menu = target.querySelector('anypoint-menu-button');
      assert.ok(menu);
    });

    async function hoverItem(index=0) {
      const target = element.shadowRoot.querySelectorAll('.project-item')[index];
      const event = new MouseEvent('mouseenter', {
        bubbles: true,
        cancelable: true,
      });
      target.dispatchEvent(event);
      await element.requestUpdate();
      return target;
    }

    async function leaveItem(index=0) {
      const target = element.shadowRoot.querySelectorAll('.project-item')[index];
      const event = new MouseEvent('mouseleave', {
        bubbles: true,
        cancelable: true,
      });
      target.dispatchEvent(event);
      await element.requestUpdate();
      return target;
    }

    it('removes the menu after mouseleave event', async () => {
      await hoverItem();
      const target = await leaveItem();
      const menu = target.querySelector('anypoint-menu-button');
      assert.notOk(menu);
    });

    it('clears [hoveredProjectValue]', async () => {
      await hoverItem();
      await leaveItem();
      assert.isUndefined(element[hoveredProjectValue]);
    });

    it('ignores when the menu is opened', async () => {
      const target = await hoverItem();
      const menu = target.querySelector('anypoint-menu-button');
      menu.opened = true;
      await aTimeout(0);
      await leaveItem();
      assert.equal(element[hoveredProjectValue], 0);
    });
  });

  describe('menu item context actions', () => {
    before(async () => {
      await store.insertProjects();
    });

    after(async () => {
      await store.destroySaved();
    });

    let element = /** @type ProjectsMenuElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
      await element[internals.refreshProjectsList]();
      await element.requestUpdate();
    });

    it('dispatches open project details', async () => {
      const menu = await openMenu(element);
      const spy = sinon.spy();
      element.addEventListener(ArcNavigationEventTypes.navigateProject, spy);
      const item = /** @type HTMLElement */ (menu.querySelector('[data-action="open-project"]'));
      item.click();
      assert.isTrue(spy.called);
      assert.equal(spy.args[0][0].action, ProjectActions.open);
    });

    it('dispatches open project requests in workspace', async () => {
      const menu = await openMenu(element);
      const spy = sinon.spy();
      element.addEventListener(ArcNavigationEventTypes.navigateProject, spy);
      const item = /** @type HTMLElement */ (menu.querySelector('[data-action="open-all-workspace"]'));
      item.click();
      assert.isTrue(spy.called);
      assert.equal(spy.args[0][0].action, ProjectActions.addWorkspace);
    });

    it('dispatches open project requests in workspace and replace', async () => {
      const menu = await openMenu(element);
      const spy = sinon.spy();
      element.addEventListener(ArcNavigationEventTypes.navigateProject, spy);
      const item = /** @type HTMLElement */ (menu.querySelector('[data-action="replace-all-workspace"]'));
      item.click();
      assert.isTrue(spy.called);
      assert.equal(spy.args[0][0].action, ProjectActions.replaceWorkspace);
    });

    it('dispatches delete event', async () => {
      const menu = await openMenu(element);
      const spy = sinon.spy();
      element.addEventListener(ArcModelEventTypes.Project.delete, spy);
      const item = /** @type HTMLElement */ (menu.querySelector('[data-action="delete-project"]'));
      item.click();
      assert.isTrue(spy.called);
    });
  });

  describe('deleting a project', () => {
    after(async () => {
      await store.destroySaved();
    });

    let element = /** @type ProjectsMenuElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('deletes empty project', async () => {
      const project = generator.http.project();
      const rec = await ArcModelEvents.Project.update(document.body, project);
      assert.lengthOf(element.projects, 1, 'has created project');

      const spy = sinon.spy();
      element.addEventListener(ArcModelEventTypes.Project.delete, spy);
      const menu = await openMenu(element);
      const item = /** @type HTMLElement */ (menu.querySelector('[data-action="delete-project"]'));
      item.click();

      await spy.args[0][0].detail.result;

      let thrown = false;
      try {
        await ArcModelEvents.Project.read(document.body, rec.id);
      } catch (e) {
        thrown = true;
      }
      assert.isTrue(thrown);
    });

    it('deletes a project and its requests', async () => {
      const request = generator.http.saved();
      request._id = `request-${Date.now()}`
      const project = generator.http.project();
      project._id = `project-${Date.now()}`
      project.requests = [request._id];
      request.projects = [project._id];

      await ArcModelEvents.Project.update(document.body, project);
      const rRec = await ArcModelEvents.Request.update(document.body, 'saved', request);
      assert.lengthOf(element.projects, 1, 'has created project');
      assert.lengthOf(element.requests, 1, 'has created request');

      const spy = sinon.spy();
      element.addEventListener(ArcModelEventTypes.Project.delete, spy);
      const menu = await openMenu(element);
      const item = /** @type HTMLElement */ (menu.querySelector('[data-action="delete-project"]'));
      item.click();

      await spy.args[0][0].detail.result;

      let thrown = false;
      try {
        await ArcModelEvents.Request.read(document.body, 'saved', rRec.id);
      } catch (e) {
        thrown = true;
      }
      assert.isTrue(thrown);
    });
  });

  describe('[projectDragStartHandler]()', () => {
    before(async () => {
      await store.insertProjects();
    });

    after(async () => {
      await store.destroySaved();
    });

    let element = /** @type ProjectsMenuElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
      element.draggableEnabled = true;
      await element[internals.refreshProjectsList]();
      await element.requestUpdate();
    });

    it('has data on the data transfer object', () => {
      const e = new DragEvent('dragstart', {
        dataTransfer: new DataTransfer(),
        cancelable: true,
        bubbles: true,
      });
      const target = element.shadowRoot.querySelector('.project-item');
      target.dispatchEvent(e);
      const dt = e.dataTransfer;
      assert.equal(dt.getData('arc/id'), element.projects[0]._id, 'has arc/id');
      assert.equal(dt.getData('arc/type'), 'project', 'has arc/type');
      assert.equal(dt.getData('arc/source'), 'projects-menu', 'has arc/source');
      assert.equal(dt.getData('arc/project'), '1', 'has arc/project');
    });

    it('ignores when not enabled', () => {
      element.draggableEnabled = false;
      const e = new DragEvent('dragstart', {
        dataTransfer: new DataTransfer(),
        cancelable: true,
        bubbles: true,
      });
      const target = element.shadowRoot.querySelector('.project-item');
      target.dispatchEvent(e);
      const dt = e.dataTransfer;
      assert.equal(dt.getData('arc/id'), '');
    });
  });

  describe('[projectDragOverHandler]()', () => {
    before(async () => {
      await store.insertProjects();
    });

    after(async () => {
      await store.destroySaved();
    });

    let element = /** @type ProjectsMenuElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
      element.draggableEnabled = true;
      await element[internals.refreshProjectsList]();
      await element.requestUpdate();
    });

    it('adds drop-target to the target', () => {
      const dt = new DataTransfer();
      dt.setData('arc/request', 'some-id');
      const e = new DragEvent('dragover', {
        dataTransfer: dt,
        cancelable: true,
        bubbles: true,
      });
      const target = element.shadowRoot.querySelector('.project-item');
      target.dispatchEvent(e);
      assert.isTrue(target.classList.contains('drop-target'));
    });

    it('sets [openingProjectTimeout]', () => {
      const dt = new DataTransfer();
      dt.setData('arc/request', 'some-id');
      const e = new DragEvent('dragover', {
        dataTransfer: dt,
        cancelable: true,
        bubbles: true,
      });
      const target = element.shadowRoot.querySelector('.project-item');
      target.dispatchEvent(e);
      assert.typeOf(element[openingProjectTimeout], 'number');
    });

    it('ignores setting [openingProjectTimeout] when already opened', () => {
      element[openedProjectsValue] = [element.projects[0]._id];
      const dt = new DataTransfer();
      dt.setData('arc/request', 'some-id');
      const e = new DragEvent('dragover', {
        dataTransfer: dt,
        cancelable: true,
        bubbles: true,
      });
      const target = element.shadowRoot.querySelector('.project-item');
      target.dispatchEvent(e);
      assert.isUndefined(element[openingProjectTimeout]);
    });

    it('ignores setting [openingProjectTimeout] when timeout is set', () => {
      element[openingProjectTimeout] = 10;
      const dt = new DataTransfer();
      dt.setData('arc/request', 'some-id');
      const e = new DragEvent('dragover', {
        dataTransfer: dt,
        cancelable: true,
        bubbles: true,
      });
      const target = element.shadowRoot.querySelector('.project-item');
      target.dispatchEvent(e);
      assert.equal(element[openingProjectTimeout], 10);
    });

    it('ignores when not enabled', () => {
      element.draggableEnabled = false;
      const dt = new DataTransfer();
      dt.setData('arc/request', 'some-id');
      const e = new DragEvent('dragover', {
        dataTransfer: dt,
        cancelable: true,
        bubbles: true,
      });
      const target = element.shadowRoot.querySelector('.project-item');
      target.dispatchEvent(e);
      assert.isFalse(target.classList.contains('drop-target'));
    });

    it('ignores when not a request', () => {
      const dt = new DataTransfer();
      dt.setData('arc/project', 'some-id');
      const e = new DragEvent('dragover', {
        dataTransfer: dt,
        cancelable: true,
        bubbles: true,
      });
      const target = element.shadowRoot.querySelector('.project-item');
      target.dispatchEvent(e);
      assert.isFalse(target.classList.contains('drop-target'));
    });
  });

  describe('[projectDragLeaveHandler]()', () => {
    before(async () => {
      await store.insertProjects();
    });

    after(async () => {
      await store.destroySaved();
    });

    let element = /** @type ProjectsMenuElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
      element.draggableEnabled = true;
      await element[internals.refreshProjectsList]();
      await element.requestUpdate();
    });

    it('removes drop-target from the target', () => {
      const dt = new DataTransfer();
      dt.setData('arc/request', 'some-id');
      const e = new DragEvent('dragleave', {
        dataTransfer: dt,
        cancelable: true,
        bubbles: true,
      });
      const target = element.shadowRoot.querySelector('.project-item');
      target.classList.add('drop-target');
      target.dispatchEvent(e);
      assert.isFalse(target.classList.contains('drop-target'));
    });

    it('ignores when not enabled', () => {
      element.draggableEnabled = false;
      const dt = new DataTransfer();
      dt.setData('arc/request', 'some-id');
      const e = new DragEvent('dragleave', {
        dataTransfer: dt,
        cancelable: true,
        bubbles: true,
      });
      const target = element.shadowRoot.querySelector('.project-item');
      target.classList.add('drop-target');
      target.dispatchEvent(e);
      assert.isTrue(target.classList.contains('drop-target'));
    });

    it('ignores when not a request', () => {
      const dt = new DataTransfer();
      dt.setData('arc/project', 'some-id');
      const e = new DragEvent('dragleave', {
        dataTransfer: dt,
        cancelable: true,
        bubbles: true,
      });
      const target = element.shadowRoot.querySelector('.project-item');
      target.classList.add('drop-target');
      target.dispatchEvent(e);
      assert.isTrue(target.classList.contains('drop-target'));
    });
  });

  describe('[projectDropHandler]()', () => {
    before(async () => {
      await store.insertProjects();
    });

    after(async () => {
      await store.destroySaved();
    });

    let element = /** @type ProjectsMenuElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
      element.draggableEnabled = true;
      await element[internals.refreshProjectsList]();
      await element.requestUpdate();
    });

    it('adds a saved request to the project', async () => {
      const request = generator.http.saved();
      request._id = `request-${Date.now()}`
      const rRec = await ArcModelEvents.Request.update(document.body, 'saved', request);

      const spy = sinon.spy();
      element.addEventListener(ArcModelEventTypes.Project.addTo, spy);
      const dt = new DataTransfer();
      dt.setData('arc/request', rRec.id);
      dt.setData('arc/id', rRec.id);
      dt.setData('arc/type', 'saved');
      const e = new DragEvent('drop', {
        dataTransfer: dt,
        cancelable: true,
        bubbles: true,
      });
      const target = element.shadowRoot.querySelector('.project-item');
      target.dispatchEvent(e);

      assert.isTrue(spy.called);

      await spy.args[0][0].detail.result;
      const dbRequest = /** @type ARCSavedRequest */ (await ArcModelEvents.Request.read(document.body, 'saved', rRec.id));
      assert.deepEqual(dbRequest.projects, [element.projects[0]._id])
    });

    it('adds a project request to another project', async () => {
      const request = generator.http.saved()
      request._id = `request-${Date.now()}`
      request.projects = ['another'];
      const rRec = await ArcModelEvents.Request.update(document.body, 'saved', request);

      const spy = sinon.spy();
      element.addEventListener(ArcModelEventTypes.Project.addTo, spy);
      const dt = new DataTransfer();
      dt.setData('arc/request', rRec.id);
      dt.setData('arc/id', rRec.id);
      dt.setData('arc/type', 'saved');
      const e = new DragEvent('drop', {
        dataTransfer: dt,
        cancelable: true,
        bubbles: true,
      });
      const target = element.shadowRoot.querySelector('.project-item');
      target.dispatchEvent(e);

      assert.isTrue(spy.called);

      await spy.args[0][0].detail.result;
      const dbRequest = /** @type ARCSavedRequest */ (await ArcModelEvents.Request.read(document.body, 'saved', rRec.id));
      assert.deepEqual(dbRequest.projects, ['another', element.projects[0]._id])
    });

    // not sure how to mock this...
    it.skip('moves request from one project to another', async () => {
      const request = generator.http.saved()
      request._id = `request-${Date.now()}`
      request.projects = ['another'];
      const rRec = await ArcModelEvents.Request.update(document.body, 'saved', request);

      const spy = sinon.spy();
      element.addEventListener(ArcModelEventTypes.Project.addTo, spy);
      const dt = new DataTransfer();
      dt.setData('arc/request', rRec.id);
      dt.setData('arc/id', rRec.id);
      dt.setData('arc/type', 'saved');
      // @ts-ignore
      dt.dropEffect = 'copyMove';
      const e = new DragEvent('drop', {
        dataTransfer: dt,
        cancelable: true,
        bubbles: true,
        ctrlKey: true,
      });
      const target = element.shadowRoot.querySelector('.project-item');
      target.dispatchEvent(e);

      assert.isTrue(spy.called);

      await spy.args[0][0].detail.result;
      const dbRequest = /** @type ARCSavedRequest */ (await ArcModelEvents.Request.read(document.body, 'saved', rRec.id));
      assert.deepEqual(dbRequest.projects, [element.projects[0]._id])
    });

    it('ignores when not arc request', async () => {
      const request = generator.http.saved()
      request._id = `request-${Date.now()}`
      const rRec = await ArcModelEvents.Request.update(document.body, 'saved', request);

      const spy = sinon.spy();
      element.addEventListener(ArcModelEventTypes.Project.addTo, spy);
      const dt = new DataTransfer();      
      dt.setData('arc/id', rRec.id);
      dt.setData('arc/type', 'saved');
      const e = new DragEvent('drop', {
        dataTransfer: dt,
        cancelable: true,
        bubbles: true,
      });
      const target = element.shadowRoot.querySelector('.project-item');
      target.dispatchEvent(e);

      assert.isFalse(spy.called);
    });

    it('ignores when no id on the request', async () => {
      const request = generator.http.saved()
      request._id = `request-${Date.now()}`
      const rRec = await ArcModelEvents.Request.update(document.body, 'saved', request);

      const spy = sinon.spy();
      element.addEventListener(ArcModelEventTypes.Project.addTo, spy);
      const dt = new DataTransfer();      
      dt.setData('arc/request', rRec.id);
      dt.setData('arc/type', 'saved');
      const e = new DragEvent('drop', {
        dataTransfer: dt,
        cancelable: true,
        bubbles: true,
      });
      const target = element.shadowRoot.querySelector('.project-item');
      target.dispatchEvent(e);

      assert.isFalse(spy.called);
    });

    it('ignores when no request type', async () => {
      const request = generator.http.saved()
      request._id = `request-${Date.now()}`
      const rRec = await ArcModelEvents.Request.update(document.body, 'saved', request);

      const spy = sinon.spy();
      element.addEventListener(ArcModelEventTypes.Project.addTo, spy);
      const dt = new DataTransfer();      
      dt.setData('arc/request', rRec.id);
      dt.setData('arc/id', rRec.id);
      const e = new DragEvent('drop', {
        dataTransfer: dt,
        cancelable: true,
        bubbles: true,
      });
      const target = element.shadowRoot.querySelector('.project-item');
      target.dispatchEvent(e);

      assert.isFalse(spy.called);
    });

    it('removes class from the target', async () => {
      const request = generator.http.saved()
      request._id = `request-${Date.now()}`
      request.projects = ['another'];
      const rRec = await ArcModelEvents.Request.update(document.body, 'saved', request);

      const spy = sinon.spy();
      element.addEventListener(ArcModelEventTypes.Project.addTo, spy);
      const dt = new DataTransfer();
      dt.setData('arc/request', rRec.id);
      dt.setData('arc/id', rRec.id);
      dt.setData('arc/type', 'saved');
      const e = new DragEvent('drop', {
        dataTransfer: dt,
        cancelable: true,
        bubbles: true,
      });
      const target = element.shadowRoot.querySelector('.project-item');
      target.classList.add('drop-target');
      target.dispatchEvent(e);

      await spy.args[0][0].detail.result;
      
      assert.isFalse(target.classList.contains('drop-target'))
    });
  });

  describe('[toggleOpen]()', () => {
    before(async () => {
      await store.insertSaved(30, 5, {
        forceProject: true,
      });
    });

    after(async () => {
      await store.destroySaved();
    });

    let element = /** @type ProjectsMenuElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
      element.draggableEnabled = true;
      await element[internals.refreshProjectsList]();
      await element.requestUpdate();
    });

    it('reads requests when opening', async () => {
      const spy = sinon.spy();
      element.addEventListener(ArcModelEventTypes.Request.readBulk, spy);

      const target = /** @type HTMLElement */ (element.shadowRoot.querySelector('.project-item'));
      target.click();

      assert.isTrue(spy.called);

      await spy.args[0][0];
    });

    it('calls [openProject] when opening a project', async () => {
      const spy1 = sinon.spy();
      const spy2 = sinon.spy(element, openProject);
      element.addEventListener(ArcModelEventTypes.Request.readBulk, spy1);

      const target = /** @type HTMLElement */ (element.shadowRoot.querySelector('.project-item'));
      target.click();

      await spy1.args[0][0];
      assert.isTrue(spy2.called);
    });

    it('toggles back a project', async () => {
      element[openedProjectsValue] = [element.projects[0]._id];
      
      const target = /** @type HTMLElement */ (element.shadowRoot.querySelector('.project-item'));
      target.click();

      assert.deepEqual(element[openedProjectsValue], []);
    });
  });

  describe('[openProject]()', () => {
    before(async () => {
      await store.insertSaved(30, 5, {
        forceProject: true,
      });
    });

    after(async () => {
      await store.destroySaved();
    });

    let element = /** @type ProjectsMenuElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
      element.draggableEnabled = true;
      await element[internals.refreshProjectsList]();
      await element.requestUpdate();
    });

    it('reads requests for the project', async () => {
      const spy = sinon.spy();
      element.addEventListener(ArcModelEventTypes.Request.readBulk, spy);
      const project = element.projects.find((p) => !!(p.requests && p.requests.length));
      await element[openProject](project._id);
      assert.isTrue(spy.called);
    });

    it('adds project to opened list', async () => {
      const project = element.projects[0];
      await element[openProject](project._id);
      assert.include(element[openedProjectsValue], project._id);
    });

    it('adds requests to the requests list', async () => {
      const project = element.projects.find((p) => !!(p.requests && p.requests.length));
      await element[openProject](project._id);
      assert.lengthOf(element.requests, project.requests.length);
    });
  });

  describe('[openRequestHandler]()', () => {
    before(async () => {
      await store.insertSaved(30, 5, {
        forceProject: true,
      });
    });

    after(async () => {
      await store.destroySaved();
    });

    let element = /** @type ProjectsMenuElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
      element.draggableEnabled = true;
      await element[internals.refreshProjectsList]();
      await element.requestUpdate();
    });

    it('dispatches navigation event when request item clicked ', async () => {
      const project = element.projects.find((p) => !!(p.requests && p.requests.length));
      await element[openProject](project._id);

      const spy = sinon.spy();
      element.addEventListener(ArcNavigationEventTypes.navigateRequest, spy);

      const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('.request-list-item'));
      node.click();

      assert.isTrue(spy.called);
    });
  });

  describe('invalid requests', () => {
    let dbProject;
    before(async () => {
      const result = await store.insertSaved(2, 1, {
        forceProject: true,
      });
      dbProject = result.projects[0];
      dbProject.requests.unshift('invalid');
      await store.updateObject('legacy-projects', dbProject);
    });

    after(async () => {
      await store.destroySaved();
    });

    let element = /** @type ProjectsMenuElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
      element.draggableEnabled = true;
      await element[internals.refreshProjectsList]();
      await element.requestUpdate();
      await element[openProject](dbProject._id);
    });

    it('renders invalid request item', () => {
      const nodes = element.shadowRoot.querySelectorAll('.unknown-entry');
      assert.lengthOf(nodes, 1);
    });

    it('invalid entry has data attributes', () => {
      const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('.unknown-entry anypoint-button'));
      assert.equal(node.dataset.id, 'invalid', 'has request id');
      assert.equal(node.dataset.project, dbProject._id, 'has project id');
    });

    it('removes invalid entry from the project', async () => {
      const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('.unknown-entry anypoint-button'));
      const spy = sinon.spy();
      element.addEventListener(ArcModelEventTypes.Project.update, spy);
      node.click();
      assert.isTrue(spy.calledOnce);
      await spy.args[0][0].detail.result;
      const project = await ArcModelEvents.Project.read(document.body, dbProject._id);
      assert.notInclude(project.requests, 'invalid');
    });
  });

  describe('[listDragOverHandler]()', () => {
    let dbProject;
    before(async () => {
      const result = await store.insertSaved(2, 1, {
        forceProject: true,
      });
      dbProject = result.projects[0];
    });

    after(async () => {
      await store.destroySaved();
    });

    let element = /** @type ProjectsMenuElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
      element.draggableEnabled = true;
      await element[internals.refreshProjectsList]();
      await element.requestUpdate();
      await element[openProject](dbProject._id);
    });

    function dispatch(target, isAbove = true, id = 'some-id') {
      const rect = target.getClientRects()[0];
      const dt = new DataTransfer();
      if (id) {
        dt.setData('arc/request', id);
      }
      const e = new DragEvent('dragover', {
        dataTransfer: dt,
        cancelable: true,
        bubbles: true,
        clientX: rect.left,
        clientY: isAbove ? rect.top + 5 : rect.bottom - 5,
      });
      target.dispatchEvent(e);
      return target;
    }

    it('adds drop-above class to the over item', () => {
      const target = /** @type HTMLElement */ (element.shadowRoot.querySelector('.request-list-item'));
      dispatch(target);
      assert.include(target.className, 'drop-above');
    });

    it('removes drop-below if present', () => {
      const target = /** @type HTMLElement */ (element.shadowRoot.querySelector('.request-list-item'));
      target.classList.add('drop-below');
      dispatch(target);
      assert.notInclude(target.className, 'drop-below');
    });

    it('adds drop-below class to the over item', () => {
      const target = /** @type HTMLElement */ (element.shadowRoot.querySelector('.request-list-item'));
      dispatch(target, false);
      assert.include(target.className, 'drop-below');
    });

    it('removes drop-above if present', () => {
      const target = /** @type HTMLElement */ (element.shadowRoot.querySelector('.request-list-item'));
      target.classList.add('drop-above');
      dispatch(target, false);
      assert.notInclude(target.className, 'drop-above');
    });

    it('ignores when dragging not enabled', () => {
      element.draggableEnabled = false;
      const target = /** @type HTMLElement */ (element.shadowRoot.querySelector('.request-list-item'));
      dispatch(target);
      assert.notInclude(target.className, 'drop-above');
    });

    it('ignores when no id', () => {
      const target = /** @type HTMLElement */ (element.shadowRoot.querySelector('.request-list-item'));
      dispatch(target, true, null);
      assert.notInclude(target.className, 'drop-above');
    });
  });

  describe('[listDragLeaveHandler]()', () => {
    let dbProject;
    before(async () => {
      const result = await store.insertSaved(2, 1, {
        forceProject: true,
      });
      dbProject = result.projects[0];
    });

    after(async () => {
      await store.destroySaved();
    });

    let element = /** @type ProjectsMenuElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
      element.draggableEnabled = true;
      await element[internals.refreshProjectsList]();
      await element.requestUpdate();
      await element[openProject](dbProject._id);
    });

    function dispatch(target, id = 'some-id') {
      const dt = new DataTransfer();
      if (id) {
        dt.setData('arc/request', id);
      }
      const e = new DragEvent('dragleave', {
        dataTransfer: dt,
        cancelable: true,
        bubbles: true,
      });
      target.dispatchEvent(e);
      return target;
    }

    it('removes "drop-above" class', () => {
      const target = /** @type HTMLElement */ (element.shadowRoot.querySelector('.request-list-item'));
      target.classList.add('drop-above');
      dispatch(target);
      assert.notInclude(target.className, 'drop-above');
    });

    it('removes "drop-below" class', () => {
      const target = /** @type HTMLElement */ (element.shadowRoot.querySelector('.request-list-item'));
      target.classList.add('drop-below');
      dispatch(target);
      assert.notInclude(target.className, 'drop-below');
    });

    it('ignores when dragging not enabled', () => {
      element.draggableEnabled = false;
      const target = /** @type HTMLElement */ (element.shadowRoot.querySelector('.request-list-item'));
      target.classList.add('drop-below');
      dispatch(target);
      assert.include(target.className, 'drop-below');
    });

    it('ignores when no id', () => {
      const target = /** @type HTMLElement */ (element.shadowRoot.querySelector('.request-list-item'));
      target.classList.add('drop-below');
      dispatch(target, null);
      assert.include(target.className, 'drop-below');
    });
  });

  describe('[listDropHandler]()', () => {
    let dbProject;
    before(async () => {
      const result = await store.insertSaved(2, 1, {
        forceProject: true,
      });
      dbProject = result.projects[0];
    });

    after(async () => {
      await store.destroySaved();
    });

    let element = /** @type ProjectsMenuElement */ (null);
    let requestId;
    beforeEach(async () => {
      element = await basicFixture();
      element.draggableEnabled = true;
      await element[internals.refreshProjectsList]();
      await element.requestUpdate();
      await element[openProject](dbProject._id);
      const request = generator.http.saved()
      requestId = (await ArcModelEvents.Request.update(document.body, 'saved', request)).id;
    });

    function dispatch(target, id, projectId) {
      const dt = new DataTransfer();
      if (id) {
        dt.setData('arc/request', id);
        dt.setData('arc/id', id);
      }
      dt.setData('arc/type', 'saved');
      if (projectId) {
        dt.setData('arc/project-request', projectId);
      }
      const e = new DragEvent('drop', {
        dataTransfer: dt,
        cancelable: true,
        bubbles: true,
      });
      target.dispatchEvent(e);
    }

    it('adds non-project request above the drop target', async () => {
      const target = /** @type HTMLElement */ (element.shadowRoot.querySelector('.request-list-item'));
      target.classList.add('drop-above');
      const spy = sinon.spy();
      element.addEventListener(ArcModelEventTypes.Project.addTo, spy);
      dispatch(target, requestId, '');
      assert.isTrue(spy.calledOnce, 'project update event is dispatched');
      await spy.args[0][0].detail.result;
      const project = await ArcModelEvents.Project.read(document.body, dbProject._id);
      assert.include(project.requests[0], requestId);
    });

    it('adds non-project request below the drop target', async () => {
      const target = /** @type HTMLElement */ (element.shadowRoot.querySelector('.request-list-item'));
      target.classList.add('drop-below');
      const spy = sinon.spy();
      element.addEventListener(ArcModelEventTypes.Project.addTo, spy);
      dispatch(target, requestId, '');
      assert.isTrue(spy.calledOnce, 'project update event is dispatched');
      await spy.args[0][0].detail.result;
      const project = await ArcModelEvents.Project.read(document.body, dbProject._id);
      assert.include(project.requests[1], requestId);
    });

    it('rearranges items inside the project', async () => {
      const targets = /** @type HTMLElement[] */ (Array.from(element.shadowRoot.querySelectorAll('.request-list-item')));
      const [target] = targets;
      const source = targets[1];
      target.classList.add('drop-above');
      const spy = sinon.spy();
      element.addEventListener(ArcModelEventTypes.Project.update, spy);
      const sid = source.dataset.id;
      const tid = target.dataset.id;
      dispatch(target, sid, dbProject._id);
      assert.isTrue(spy.calledOnce, 'project update event is dispatched');
      await spy.args[0][0].detail.result;
      const project = await ArcModelEvents.Project.read(document.body, dbProject._id);
      assert.equal(project.requests[0], sid, 'dragged item (source) is moved above');
      assert.equal(project.requests[1], tid, 'drop target item is moved to the second place');
    });

    it('does nothing when draggable ios not enabled', async () => {
      element.draggableEnabled = false;
      const target = /** @type HTMLElement */ (element.shadowRoot.querySelector('.request-list-item'));
      target.classList.add('drop-above');
      const spy = sinon.spy();
      element.addEventListener(ArcModelEventTypes.Project.addTo, spy);
      dispatch(target, requestId, '');
      assert.isFalse(spy.calledOnce, 'event is not dispatched');
    });

    it('does nothing has no request', async () => {
      const target = /** @type HTMLElement */ (element.shadowRoot.querySelector('.request-list-item'));
      target.classList.add('drop-above');
      const spy = sinon.spy();
      element.addEventListener(ArcModelEventTypes.Project.addTo, spy);
      const dt = new DataTransfer();
      dt.setData('arc/id', requestId);
      dt.setData('arc/type', 'saved');
      const e = new DragEvent('drop', {
        dataTransfer: dt,
        cancelable: true,
        bubbles: true,
      });
      target.dispatchEvent(e);
      assert.isFalse(spy.calledOnce, 'event is not dispatched');
    });
  });

  describe('[dragStartHandler]()', () => {
    let dbProject;
    before(async () => {
      const result = await store.insertSaved(2, 1, {
        forceProject: true,
      });
      dbProject = result.projects[0];
    });

    after(async () => {
      await store.destroySaved();
    });

    let element = /** @type ProjectsMenuElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
      element.draggableEnabled = true;
      await element[internals.refreshProjectsList]();
      await element.requestUpdate();
      await element[openProject](dbProject._id);
    });

    function dispatch(target) {
      const e = new DragEvent('dragstart', {
        dataTransfer: new DataTransfer(),
        cancelable: true,
        bubbles: true,
      });
      target.dispatchEvent(e);
      return e;
    }

    it('adds arc/project-request type', async () => {
      const target = /** @type HTMLElement */ (element.shadowRoot.querySelector('.request-list-item'));
      const e = dispatch(target);
      const pid = e.dataTransfer.getData('arc/project-request');
      assert.equal(pid, target.dataset.project);
    });

    it('adds parent types', async () => {
      const target = /** @type HTMLElement */ (element.shadowRoot.querySelector('.request-list-item'));
      const e = dispatch(target);
      const type = e.dataTransfer.getData('arc/type');
      assert.equal(type, 'saved');
    });
  });
});
