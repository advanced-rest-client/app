import { fixture, assert, html, aTimeout } from '@open-wc/testing';
import { ArcMock } from '@advanced-rest-client/arc-mock';
import { ProjectModel, MockedStore } from '@advanced-rest-client/idb-store';
import { ArcModelEventTypes } from '@advanced-rest-client/events';
import sinon from 'sinon';
import { loadMonaco } from '../MonacoSetup.js';
import { saveHandler, savingValue } from '../../src/elements/legacy-project/ProjectMetaEditorElement.js';
import '../../define/project-meta-editor.js';

/** @typedef {import('../../').ProjectMetaEditorElement} ProjectMetaEditorElement */

describe('ProjectMetaEditorElement', () => {
  const generator = new ArcMock();
  const store = new MockedStore();
  const model = new ProjectModel();

  /**
   * @param {any=} project
   * @returns {Promise<ProjectMetaEditorElement>}
   */
  async function basicFixture(project) {
    return fixture(html`<project-meta-editor .project="${project}"></project-meta-editor>`);
  }

  before(async () => {
    await loadMonaco();
    model.listen(window);
  });

  after(() => {
    model.unlisten(window);
  });

  describe('#project', () => {
    let element = /** @type ProjectMetaEditorElement */ (null);
    let project;
    beforeEach(async () => {
      project = generator.http.project();
      element = await basicFixture();
    });

    it('sets the name property', () => {
      project.name = 'test-name';
      element.project = project;
      assert.equal(element.name, 'test-name');
    });

    it('clears the name when clearing the project', () => {
      project.name = 'test-name';
      element.project = project;
      element.project = undefined;
      assert.isUndefined(element.name);
    });

    it('sets the description property', () => {
      project.description = 'test-description';
      element.project = project;
      assert.equal(element.description, 'test-description');
    });

    it('clears the description property when clearing the project', () => {
      project.description = 'test-description';
      element.project = project;
      element.project = undefined;
      assert.equal(element.description, '');
    });
  });

  describe('Form rendering', () => {
    let element = /** @type ProjectMetaEditorElement */ (null);
    beforeEach(async () => {
      const project = generator.http.project();
      element = await basicFixture(project);
    });

    it('has the name input', () => {
      const input = element.shadowRoot.querySelector('anypoint-input[name="name"]');
      assert.ok(input);
    });

    it('name input change changes the name property', () => {
      const input = /** @type HTMLInputElement */ (element.shadowRoot.querySelector('anypoint-input[name="name"]'));
      input.value = 'test project';
      input.dispatchEvent(new Event('change'));
      assert.equal(element.name, 'test project');
    });

    it('has the monaco container', () => {
      const node = element.shadowRoot.querySelector('.monaco-wrap');
      assert.ok(node);
    });

    it('has the actions bar', () => {
      const node = element.shadowRoot.querySelector('.actions');
      assert.ok(node);
    });

    it('has the cancel button', () => {
      const button = element.shadowRoot.querySelector('.actions [data-action="cancel"]');
      assert.ok(button);
    });

    it('has the save button', () => {
      const button = element.shadowRoot.querySelector('.actions [data-action="save"]');
      assert.ok(button);
    });
  });

  describe('cancel()', () => {
    let element = /** @type ProjectMetaEditorElement */ (null);
    beforeEach(async () => {
      const project = generator.http.project();
      element = await basicFixture(project);
    });

    it('dispatched the close event', () => {
      const spy = sinon.spy();
      element.addEventListener('close', spy);
      element.cancel();
      assert.isTrue(spy.called);
    });

    it('calls the action from the cancel action button', () => {
      const button = /** @type HTMLElement */ (element.shadowRoot.querySelector('.actions [data-action="cancel"]'));
      const spy = sinon.spy();
      element.addEventListener('close', spy);
      button.click();
      assert.isTrue(spy.called);
    });
  });

  describe('save action', () => {
    let element = /** @type ProjectMetaEditorElement */ (null);
    let project;
    beforeEach(async () => {
      [project] = (await store.insertProjects(1));
      element = await basicFixture(project);
    });

    it('updates the model', async () => {
      const spy = sinon.spy();
      element.addEventListener(ArcModelEventTypes.Project.update, spy);
      const button = /** @type HTMLElement */ (element.shadowRoot.querySelector('.actions [data-action="save"]'));
      button.click();
      assert.isTrue(spy.called);
      await aTimeout(0);
    });

    it('disables the buttons for the save action', async () => {
      const promise = element[saveHandler]();
      assert.isTrue(element[savingValue], 'buttons are disabled');
      await promise;
      assert.isFalse(element[savingValue], 'buttons are restored');
    });
  });
});
