import { fixture, assert, html, nextFrame } from '@open-wc/testing';
import sinon from 'sinon';
import { ArcMock } from '@advanced-rest-client/arc-mock';
import { WorkspaceEventTypes } from '@advanced-rest-client/events';
import { BodyProcessor } from '@advanced-rest-client/libs';
import { loadMonaco } from '../MonacoSetup.js';
import { tabsValue, requestsValue, workspaceValue } from '../../src/elements/request/ArcRequestWorkspaceElement.js';
import '../../define/arc-request-workspace.js';

/** @typedef {import('@advanced-rest-client/events').Workspace.DomainWorkspace} DomainWorkspace */
/** @typedef {import('@advanced-rest-client/events').Workspace.WorkspaceRequestUnion} WorkspaceRequestUnion */
/** @typedef {import('@advanced-rest-client/events').WorkspaceReadEvent} WorkspaceReadEvent */
/** @typedef {import('../../index').ArcRequestWorkspaceElement} ArcRequestWorkspaceElement */

describe('ArcRequestWorkspaceElement', () => {
  const gen = new ArcMock();

  /**
   * @returns {Promise<ArcRequestWorkspaceElement>}
   */
  async function basicFixture() {
    return fixture(html`
      <arc-request-workspace></arc-request-workspace>
    `);
  }

  before(async () => loadMonaco());

  describe('restoring workspace state', () => {
    /** @type ArcRequestWorkspaceElement */
    let element;

    beforeEach(async () => { 
      element = await basicFixture();
      const requests = gen.http.listHistory(2);
      const workspace = /** @type DomainWorkspace */ ({
        kind: 'ARC#DomainWorkspace',
        id: '1234',
        requests,
        selected: 0,
      });
      element.setWorkspace(workspace);
      await nextFrame();
    });

    it('restores a default state when event not handled', async () => {
      await element.restore();
      assert.lengthOf(element[tabsValue], 1, 'replaces current tabs with a default set');
      const [tab] = element[tabsValue];
      assert.typeOf(tab.id, 'string', 'the tab has the id');
      assert.equal(tab.label, 'New request', 'the tab has the label');
      assert.lengthOf(element[requestsValue], 1, 'replaces current requests with a default set');
      const [request] = element[requestsValue];
      assert.equal(request.tab, tab.id, 'has the tab id');
      assert.typeOf(request.id, 'string', 'the request has the id');
      assert.typeOf(request.request, 'object', 'the request has the request');
    });

    it('restores the workspace from the event', async () => {
      /**
       * @param {WorkspaceReadEvent} e
       */
      function handler(e) {
        const requests = gen.http.listHistory(4);
        const workspace = /** @type DomainWorkspace */ ({
          kind: 'ARC#DomainWorkspace',
          id: '5678',
          requests,
          selected: 1,
          meta: {
            description: 'test',
          }
        });
        e.detail.result = Promise.resolve(workspace);
      }
      element.addEventListener(WorkspaceEventTypes.read, handler, { once: true });
      
      await element.restore();
      assert.lengthOf(element[tabsValue], 4, 'replaces current tabs with restored value');
      assert.equal(element[workspaceValue].id, '5678', 'restores the workspace object');
    });

    it('generates a new workspace id when missing', async () => {
      /**
       * @param {WorkspaceReadEvent} e
       */
      function handler(e) {
        const requests = gen.http.listHistory(1);
        const workspace = /** @type DomainWorkspace */ ({
          kind: 'ARC#DomainWorkspace',
          id: undefined,
          requests,
          selected: 1,
          meta: {
            description: 'test',
          }
        });
        e.detail.result = Promise.resolve(workspace);
      }
      element.addEventListener(WorkspaceEventTypes.read, handler, { once: true });
      
      await element.restore();
      assert.typeOf(element[workspaceValue].id, 'string');
    });

    it('restores the body when restoring the workspace', async () => {
      /**
       * @param {WorkspaceReadEvent} e
       */
      function handler(e) {
        const requests = gen.http.listHistory(2);
        const workspace = /** @type DomainWorkspace */ ({
          kind: 'ARC#DomainWorkspace',
          id: 'abc',
          requests,
        });
        e.detail.result = Promise.resolve(workspace);
      }
      element.addEventListener(WorkspaceEventTypes.read, handler, { once: true });
      const spy = sinon.spy(BodyProcessor, 'restoreRequest');
      await element.restore();
      // @ts-ignore
      BodyProcessor.restoreRequest.restore();
      assert.equal(spy.callCount, 2);
    });
  });

  describe('closing panels from a tab click', () => {
    /** @type ArcRequestWorkspaceElement */
    let element;

    beforeEach(async () => { 
      element = await basicFixture();
      const requests = gen.http.listHistory(2);
      const workspace = /** @type DomainWorkspace */ ({
        kind: 'ARC#DomainWorkspace',
        id: '1234',
        requests,
      });
      element.setWorkspace(workspace);
      await nextFrame();
    });

    it('closes a panel', async () => {
      const lengthBefore = element[requestsValue].length;
      const tab = /** @type HTMLElement */ (element.shadowRoot.querySelector('workspace-tab'));
      tab.dispatchEvent(new Event('close'));
      const lengthAfter = element[requestsValue].length;
      assert.notEqual(lengthAfter, lengthBefore);
    });

    it('closes a tab', async () => {
      const lengthBefore = element[tabsValue].length;
      const tab = /** @type HTMLElement */ (element.shadowRoot.querySelector('workspace-tab'));
      tab.dispatchEvent(new Event('close'));
      const lengthAfter = element[tabsValue].length;
      assert.notEqual(lengthAfter, lengthBefore);
    });

    it('closes the panel that corresponds to the tab', async () => {
      const { id } = element[requestsValue][0];
      const tab = /** @type HTMLElement */ (element.shadowRoot.querySelector('workspace-tab'));
      tab.dispatchEvent(new Event('close'));
      assert.notEqual(element[requestsValue][0].id, id);
    });

    it('closes the tab', async () => {
      const { id } = element[tabsValue][0];
      const tab = /** @type HTMLElement */ (element.shadowRoot.querySelector('workspace-tab'));
      tab.dispatchEvent(new Event('close'));
      assert.notEqual(element[tabsValue][0].id, id);
    });
  });
});
