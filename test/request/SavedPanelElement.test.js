import { fixture, assert, html, oneEvent, nextFrame } from '@open-wc/testing';
import { ArcModelEvents, ArcModelEventTypes } from '@advanced-rest-client/events';
import sinon from 'sinon';
import { RequestModel, ProjectModel, MockedStore } from '@advanced-rest-client/idb-store'
import '../../define/saved-panel.js'
import * as internals from '../../src/elements/request/internals.js';
import { 
  projectSelectorOpenedValue, 
  projectAddKeydown, 
  addSelectedProject,
  cancelAddProject,
  projectOverlayClosed,
} from '../../src/elements/request/SavedPanelElement.js';

/** @typedef {import('../../').SavedPanelElement} SavedPanelElement */
/** @typedef {import('@advanced-rest-client/events').ArcRequest.ARCSavedRequest} ARCSavedRequest */
/** @typedef {import('lit-html').TemplateResult} TemplateResult */
/** @typedef {import('@anypoint-web-components/awc').AnypointChipInputElement} AnypointChipInput */

describe('SavedPanelElement', () => {
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
   * @returns {TemplateResult}
   */
  function modelTemplate() {
    return html`<saved-panel></saved-panel>`;
  }

  /**
   * @returns {Promise<SavedPanelElement>}
   */
  async function afterQueryFixture() {
    const element = /** @type SavedPanelElement */ (await fixture(modelTemplate()));
    // the query could potentially start already
    if (!element.querying) {
      await oneEvent(element, 'queryingchange');
    }
    await oneEvent(element, 'queryingchange');
    await nextFrame();
    return element;
  }

  describe('content actions', () => {
    before(async () => {
      await store.insertSaved(20, 1);
    });
    
    after(async () => {
      await store.destroySaved();
    });

    let element = /** @type SavedPanelElement */(null);
    beforeEach(async () => {
      element = await afterQueryFixture();
    });

    it('triggers add to project flow', () => {
      const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('[data-action="project-add"]'));
      node.click();
      assert.isTrue(element[projectSelectorOpenedValue]);
    });

    it('calls parent action', () => {
      const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('[data-action="toggle-all"]'));
      node.click();
      assert.isTrue(element[internals.toggleSelectAllValue]);
    });
  });

  describe('[projectAddKeydown]', () => {
    let element = /** @type SavedPanelElement */(null);
    beforeEach(async () => {
      element = await afterQueryFixture();
      element[projectSelectorOpenedValue] = true;
      await nextFrame();
    });

    it('calls [projectAddKeydown] with ctrl key', () => {
      const spy = sinon.spy(element, addSelectedProject);
      const e = new KeyboardEvent('keydown', {
        key: 'Enter',
        ctrlKey: true,
      });
      element[projectAddKeydown](e);
      assert.isTrue(spy.calledOnce);
    });

    it('calls [projectAddKeydown] with meta key', () => {
      const spy = sinon.spy(element, addSelectedProject);
      const e = new KeyboardEvent('keydown', {
        key: 'Enter',
        metaKey: true,
      });
      element[projectAddKeydown](e);
      assert.isTrue(spy.calledOnce);
    });

    it('ignores when no meta and ctrl keys', () => {
      const spy = sinon.spy(element, addSelectedProject);
      const e = new KeyboardEvent('keydown', {
        key: 'Enter',
      });
      element[projectAddKeydown](e);
      assert.isFalse(spy.called);
    });

    it('ignores when not enter key', () => {
      const spy = sinon.spy(element, addSelectedProject);
      const e = new KeyboardEvent('keydown', {
        key: 'C',
        ctrlKey: true,
      });
      element[projectAddKeydown](e);
      assert.isFalse(spy.called);
    });
  });

  describe('[cancelAddProject]', () => {
    let element = /** @type SavedPanelElement */(null);
    beforeEach(async () => {
      element = await afterQueryFixture();
      element[projectSelectorOpenedValue] = true;
      await nextFrame();
    });

    it('resets the [projectSelectorOpenedValue] property', () => {
      element[cancelAddProject]();
      assert.isFalse(element[projectSelectorOpenedValue]);
    });

    it('calls the function from the button', () => {
      const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('[data-action="cancel-add-project"]'))
      node.click();
      assert.isFalse(element[projectSelectorOpenedValue]);
    });
  });

  describe('[projectOverlayClosed]', () => {
    let element = /** @type SavedPanelElement */(null);
    beforeEach(async () => {
      element = await afterQueryFixture();
      element[projectSelectorOpenedValue] = true;
      await nextFrame();
    });

    it('resets the [projectSelectorOpenedValue] property', () => {
      element[projectOverlayClosed]();
      assert.isFalse(element[projectSelectorOpenedValue]);
    });
  });

  describe('project selector rendering', () => {
    let element = /** @type SavedPanelElement */(null);
    beforeEach(async () => {
      element = await afterQueryFixture();
    });

    it('has the projects chip input', () => {
      const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('[name="projects"]'))
      assert.ok(node);
    });
  });

  describe('[addSelectedProject]()', () => {
    let projectId;
    let ids;
    before(async () => {
      const result = await store.insertSaved(20, 0);
      assert.lengthOf(result.projects, 0);
      ids = result.requests.map((item) => item._id);
      const r2 = await store.insertProjects(1);
      projectId = r2[0]._id;
    });
    
    after(async () => {
      await store.destroySaved();
    });

    let element = /** @type SavedPanelElement */(null);
    beforeEach(async () => {
      element = await afterQueryFixture();
      element[projectSelectorOpenedValue] = true;
      await nextFrame();
    });

    it('does nothing when no project input value', () => {
      const spy = sinon.spy();
      element.addEventListener(ArcModelEventTypes.Request.updateBulk, spy);
      element[addSelectedProject]();
      assert.isFalse(spy.called);
    });

    it('does nothing when no selection', async () => {
      const chip = /** @type AnypointChipInput */ element.shadowRoot.querySelector('[name="projects"]');
      // @ts-ignore
      chip.chipsValue = [projectId];
      const spy = sinon.spy();
      element.addEventListener(ArcModelEventTypes.Request.updateBulk, spy);
      await element[addSelectedProject]();
      assert.isFalse(spy.called);
    });

    it('adds selected to project', async () => {
      const chip = /** @type AnypointChipInput */ element.shadowRoot.querySelector('[name="projects"]');
      // @ts-ignore
      chip.chipsValue = [projectId];
      const selected = [ids[0], ids[1]];
      element.selectedItems = selected;
      await element[addSelectedProject]();
      const items = /** @type ARCSavedRequest[]  */ (await ArcModelEvents.Request.readBulk(element, 'saved', selected));
      assert.deepEqual(items[0].projects, [projectId]);
      assert.deepEqual(items[1].projects, [projectId]);
    });

    it('does not add already existing projects', async () => {
      const chip = /** @type AnypointChipInput */ element.shadowRoot.querySelector('[name="projects"]');
      // @ts-ignore
      chip.chipsValue = [projectId];
      const selected = [ids[0], ids[2]];
      element.selectedItems = selected;
      await element[addSelectedProject]();
      const items = /** @type ARCSavedRequest[]  */ (await ArcModelEvents.Request.readBulk(element, 'saved', selected));
      assert.deepEqual(items[0].projects, [projectId]);
      assert.deepEqual(items[1].projects, [projectId]);
    });

    it('creates a new project in the store', async () => {
      const chip = /** @type AnypointChipInput */ element.shadowRoot.querySelector('[name="projects"]');
      // @ts-ignore
      chip.chipsValue = ['test project'];
      const selected = [ids[3]];
      element.selectedItems = selected;
      await element[addSelectedProject]();
      const items = /** @type ARCSavedRequest[]  */ (await ArcModelEvents.Request.readBulk(element, 'saved', selected));
      assert.lengthOf(items[0].projects, 1);
      const [pid] = items[0].projects;
      const created = await ArcModelEvents.Project.read(element, pid);
      assert.typeOf(created, 'object');
      assert.equal(created.name, 'test project');
      assert.deepEqual(created.requests, selected);
    });
  });
});
