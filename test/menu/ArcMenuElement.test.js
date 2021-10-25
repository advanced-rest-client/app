import { ArcNavigationEventTypes } from '@advanced-rest-client/events';
import { fixture, assert, nextFrame } from '@open-wc/testing';
import sinon from 'sinon';
import '../../define/arc-menu.js';
import {
  refreshList,
  updateSelectionIfNeeded,
  historyChanged,
  findTab,
  dragoverHandler,
  cancelDragTimeout,
  dragTypeCallbackValue,
  dragOverTimeoutValue,
  openMenuDragOver,
	MenuTypes,
} from '../../src/elements/menu/ArcMenuElement.js';

/** @typedef {import('../../').ArcMenuElement} ArcMenuElement */
/** @typedef {import('../../').HistoryMenuElement} HistoryMenuElement */

describe('ArcMenuElement', () => {
  /**
   * @returns {Promise<ArcMenuElement>}
   */
  async function basicFixture() {
    return fixture(`<arc-menu></arc-menu>`);
  }

  /**
   * @returns {Promise<ArcMenuElement>}
   */
  async function historyFixture() {
    return fixture(`<arc-menu history></arc-menu>`);
  }
  /**
   * @returns {Promise<ArcMenuElement>}
   */
  async function savedFixture() {
    return fixture(`<arc-menu selected="0"></arc-menu>`);
  }
  /**
   * @returns {Promise<ArcMenuElement>}
   */
  async function projectsFixture() {
    return fixture(`<arc-menu selected="1"></arc-menu>`);
  }
  /**
   * @returns {Promise<ArcMenuElement>}
   */
  async function apisFixture() {
    return fixture(`<arc-menu selected="2"></arc-menu>`);
  }
  /**
   * @returns {Promise<ArcMenuElement>}
   */
  async function noHistoryFixture() {
    return fixture(`<arc-menu history hideHistory></arc-menu>`);
  }
  /**
   * @returns {Promise<ArcMenuElement>}
   */
  async function noSavedFixture() {
    return fixture(`<arc-menu history hideSaved></arc-menu>`);
  }
  /**
   * @returns {Promise<ArcMenuElement>}
   */
  async function noProjectsFixture() {
    return fixture(`<arc-menu history hideProjects></arc-menu>`);
  }
  /**
   * @returns {Promise<ArcMenuElement>}
   */
  async function noApisFixture() {
    return fixture(`<arc-menu history hideApis></arc-menu>`);
  }
  /**
   * @returns {Promise<ArcMenuElement>}
   */
  async function popupsFixture() {
    return fixture(`<arc-menu history popup></arc-menu>`);
  }
  /**
   * @returns {Promise<ArcMenuElement>}
   */
  async function draggableFixture() {
    return fixture(`<arc-menu history dataTransfer></arc-menu>`);
  }

  describe('basics', () => {
    it('opens default menu', async () => {
      const element = await historyFixture();
      const node = element.shadowRoot.querySelector('history-menu');
      assert.ok(node);
    });

    it('opens saved menu', async () => {
      const element = await savedFixture();
      const node = element.shadowRoot.querySelector('saved-menu');
      assert.ok(node);
    });

    it('opens projects menu', async () => {
      const element = await projectsFixture();
      const node = element.shadowRoot.querySelector('projects-menu');
      assert.ok(node);
    });

    it('opens APIs menu', async () => {
      const element = await apisFixture();
      const node = element.shadowRoot.querySelector('rest-api-menu');
      assert.ok(node);
    });
  });

  describe('history hidden', () => {
    let element = /** @type ArcMenuElement */ (null);
    beforeEach(async () => {
      element = await noHistoryFixture();
    });

    it('selects saved menu by default', () => {
      assert.equal(element.selected, 1);
    });

    it('selects projects menu when saved is also hidden', async () => {
      element.hideSaved = true;
      await nextFrame();
      assert.equal(element.selected, 2);
    });

    it('history is hidden when historyHidden is set', async () => {
      element.selected = 0;
      await nextFrame();
      const node = element.shadowRoot.querySelector('history-menu');
      assert.notOk(node);
    });

    it('history tab is hidden', () => {
      const node = element.shadowRoot.querySelectorAll('.rail .menu-item')[0];
      assert.isTrue(node.hasAttribute('hidden'));
    });
  });

  describe('saved hidden', () => {
    let element = /** @type ArcMenuElement */ (null);
    beforeEach(async () => {
      element = await noSavedFixture();
    });

    it('Keeps default selection', () => {
      assert.equal(element.selected, 0);
    });

    it('Saved panel is not rendered', async () => {
      element.selected = 1;
      await nextFrame();
      const node = element.shadowRoot.querySelector('saved-menu');
      assert.notOk(node);
    });

    it('Saved tab is hidden', () => {
      const node = element.shadowRoot.querySelectorAll('.rail .menu-item')[1];
      assert.isTrue(node.hasAttribute('hidden'));
    });
  });

  describe('projects hidden', () => {
    let element = /** @type ArcMenuElement */ (null);
    beforeEach(async () => {
      element = await noProjectsFixture();
    });

    it('Keeps default selection', () => {
      assert.equal(element.selected, 0);
    });

    it('projects panel is not rendered', async () => {
      element.selected = 2;
      await nextFrame();
      const node = element.shadowRoot.querySelector('projects-menu');
      assert.notOk(node);
    });

    it('Saved tab is hidden', () => {
      const node = element.shadowRoot.querySelectorAll('.rail .menu-item')[2];
      assert.isTrue(node.hasAttribute('hidden'));
    });
  });

  describe('apis hidden', () => {
    let element = /** @type ArcMenuElement */ (null);
    beforeEach(async () => {
      element = await noApisFixture();
    });

    it('Keeps default selection', () => {
      assert.equal(element.selected, 0);
    });

    it('projects panel is not rendered', async () => {
      element.selected = 3;
      await nextFrame();
      const node = element.shadowRoot.querySelector('rest-api-menu');
      assert.notOk(node);
    });

    it('Saved tab is hidden', () => {
      const node = element.shadowRoot.querySelectorAll('.rail .menu-item')[3];
      assert.isTrue(node.hasAttribute('hidden'));
    });
  });

  describe('Panels navigation', () => {
    let element = /** @type ArcMenuElement */ (null);
    beforeEach(async () => {
      element = await historyFixture();
    });

    it('open history button dispatches the event', () => {
      const spy = sinon.spy();
      element.addEventListener(ArcNavigationEventTypes.navigate, spy);
      const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('.list[data-type="history"] [data-action="open-panel"]'));
      node.click();
      assert.isTrue(spy.called);
      assert.equal(spy.args[0][0].route, 'history');
    });

    it('open saved button dispatches the event', async () => {
      element.selected = 1;
      await nextFrame();
      const spy = sinon.spy();
      element.addEventListener(ArcNavigationEventTypes.navigate, spy);
      const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('.list[data-type="saved"] [data-action="open-panel"]'));
      node.click();
      assert.isTrue(spy.called);
      assert.equal(spy.args[0][0].route, 'saved');
    });

    it('dispatches the event when explore button is clicked', async () => {
      element.selected = 3;
      await nextFrame();
      const spy = sinon.spy();
      element.addEventListener(ArcNavigationEventTypes.navigate, spy);
      const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('.list[data-type="apiDocs"] [data-action="explore"]'));
      node.click();
      assert.isTrue(spy.called);
      assert.equal(spy.args[0][0].route, 'exchange-search');
    });
  });

  describe('refreshing panels', () => {
    let element = /** @type ArcMenuElement */ (null);
    beforeEach(async () => {
      element = await historyFixture();
    });

    it('[refreshList]() calls refresh() on a panel', () => {
      const panel = element.shadowRoot.querySelector('history-menu');
      const spy = sinon.spy(panel, 'refresh');
      element[refreshList]('history-menu');
      assert.isTrue(spy.called);
    });

    it('does nothing when panel do not exist', () => {
      element[refreshList]('other-menu');
      // no error, coverage
    });

    it('refreshHistory() calls [refreshList]() with argument', async () => {
      element.selected = 0;
      await nextFrame();
      const spy = sinon.spy(element, refreshList);
      element.refreshHistory();
      assert.isTrue(spy.called);
      assert.equal(spy.args[0][0], 'history-menu');
    });

    it('calls [refreshList]() from refresh history button', () => {
      const spy = sinon.spy(element, refreshList);
      const node = /** @type HTMLElement */ (element.shadowRoot.querySelector(`.list[data-type="${MenuTypes.history}"] [data-action="refresh"]`));
      node.click();
      assert.isTrue(spy.called);
      assert.equal(spy.args[0][0], 'history-menu');
    });

    it('refreshSavedList() calls [refreshList]() with argument', () => {
      const spy = sinon.spy(element, refreshList);
      element.refreshSaved();
      assert.isTrue(spy.called);
      assert.equal(spy.args[0][0], 'saved-menu');
    });

    it('calls [refreshList]() from refresh saved button', async () => {
      element.selected = 1;
      await nextFrame();
      const spy = sinon.spy(element, refreshList);
      const node = /** @type HTMLElement */ (element.shadowRoot.querySelector(`.list[data-type="${MenuTypes.saved}"] [data-action="refresh"]`));
      node.click();
      assert.isTrue(spy.called);
      assert.equal(spy.args[0][0], 'saved-menu');
    });

    it('refreshProjectsList() calls [refreshList]() with argument', () => {
      const spy = sinon.spy(element, refreshList);
      element.refreshProjects();
      assert.isTrue(spy.called);
      assert.equal(spy.args[0][0], 'projects-menu');
    });

    it('calls [refreshList]() from refresh projects button', async () => {
      element.selected = 2;
      await nextFrame();
      const spy = sinon.spy(element, refreshList);
      const node = /** @type HTMLElement */ (element.shadowRoot.querySelector(`.list[data-type="${MenuTypes.projects}"] [data-action="refresh"]`));
      node.click();
      assert.isTrue(spy.called);
      assert.equal(spy.args[0][0], 'projects-menu');
    });

    it('refreshApisList() calls [refreshList]() with argument', () => {
      const spy = sinon.spy(element, refreshList);
      element.refreshApiDocs();
      assert.isTrue(spy.called);
      assert.equal(spy.args[0][0], 'rest-api-menu');
    });

    it('calls [refreshList]() from refresh apis button', async () => {
      element.selected = 3;
      await nextFrame();
      const spy = sinon.spy(element, refreshList);
      const node = /** @type HTMLElement */ (element.shadowRoot.querySelector(`.list[data-type="${MenuTypes.apiDocs}"] [data-action="refresh"]`));
      node.click();
      assert.isTrue(spy.called);
      assert.equal(spy.args[0][0], 'rest-api-menu');
    });
  });

  describe('menu popup', () => {
    let element = /** @type ArcMenuElement */ (null);
    beforeEach(async () => {
      element = await popupsFixture();
    });

    it('dispatches history popup event', () => {
      const spy = sinon.spy();
      element.addEventListener(ArcNavigationEventTypes.popupMenu, spy);
      element.popupHistory();
      assert.isTrue(spy.called);
    });

    it('ignores history popup event when no popup', () => {
      element.popup = false;
      const spy = sinon.spy();
      element.addEventListener(ArcNavigationEventTypes.popupMenu, spy);
      element.popupHistory();
      assert.isFalse(spy.called);
    });

    it('dispatches the event from history panel', async () => {
      element.selected = 0;
      await element.requestUpdate();
      const spy = sinon.spy();
      element.addEventListener(ArcNavigationEventTypes.popupMenu, spy);
      const node = /** @type HTMLElement */ (element.shadowRoot.querySelector(`.list[data-type="${MenuTypes.history}"] [data-action="popup"]`));
      node.click();
      assert.isTrue(spy.called);
    });

    it('dispatches saved popup event', () => {
      const spy = sinon.spy();
      element.addEventListener(ArcNavigationEventTypes.popupMenu, spy);
      element.popupSaved();
      assert.isTrue(spy.called);
    });

    it('ignores saved popup event when no popups', () => {
      element.popup = false;
      const spy = sinon.spy();
      element.addEventListener(ArcNavigationEventTypes.popupMenu, spy);
      element.popupSaved();
      assert.isFalse(spy.called);
    });

    it('dispatches the event from saved panel', async () => {
      element.selected = 1;
      await element.requestUpdate();
      const spy = sinon.spy();
      element.addEventListener(ArcNavigationEventTypes.popupMenu, spy);
      const node = /** @type HTMLElement */ (element.shadowRoot.querySelector(`.list[data-type="${MenuTypes.saved}"] [data-action="popup"]`));
      node.click();
      assert.isTrue(spy.called);
    });

    it('dispatches projects popup event', () => {
      const spy = sinon.spy();
      element.addEventListener(ArcNavigationEventTypes.popupMenu, spy);
      element.popupProjects();
      assert.isTrue(spy.called);
    });

    it('ignores projects popup event when popup is not set', () => {
      element.popup = false;
      const spy = sinon.spy();
      element.addEventListener(ArcNavigationEventTypes.popupMenu, spy);
      element.popupProjects();
      assert.isFalse(spy.called);
    });

    it('dispatches the event from projects panel', async () => {
      element.selected = 2;
      await element.requestUpdate();
      const spy = sinon.spy();
      element.addEventListener(ArcNavigationEventTypes.popupMenu, spy);
      const node = /** @type HTMLElement */ (element.shadowRoot.querySelector(`.list[data-type="${MenuTypes.projects}"] [data-action="popup"]`));
      node.click();
      assert.isTrue(spy.called);
    });

    it('dispatches rest apis popup event', () => {
      const spy = sinon.spy();
      element.addEventListener(ArcNavigationEventTypes.popupMenu, spy);
      element.popupApiDocs();
      assert.isTrue(spy.called);
    });

    it('ignores rest apis popup event when popup is not set', () => {
      element.popup = false;
      const spy = sinon.spy();
      element.addEventListener(ArcNavigationEventTypes.popupMenu, spy);
      element.popupApiDocs();
      assert.isFalse(spy.called);
    });

    it('dispatches the event from rest apis panel', async () => {
      element.selected = 3;
      await element.requestUpdate();
      const spy = sinon.spy();
      element.addEventListener(ArcNavigationEventTypes.popupMenu, spy);
      const node = /** @type HTMLElement */ (element.shadowRoot.querySelector(`.list[data-type="${MenuTypes.apiDocs}"] [data-action="popup"]`));
      node.click();
      assert.isTrue(spy.called);
    });
  });

  describe('auto change selection', () => {
    let element = /** @type ArcMenuElement */ (null);
    beforeEach(async () => {
      element = await historyFixture();
    });

    it('calls [updateSelectionIfNeeded]() with an argument when no value', () => {
      const spy = sinon.spy(element, updateSelectionIfNeeded);
      element[historyChanged](false, true);
      assert.isTrue(spy.called);
      assert.equal(spy.args[0][0], 0);
    });

    // it('sets selection to 0 when re-enabling history', () => {
    //   element.history = false;
    //   element.selected = 1;
    //   element[historyChanged](true, false);
    //   assert.equal(element.selected, 0);
    // });
  });

  describe('findTab()', () => {
    let element = /** @type ArcMenuElement */ (null);
    beforeEach(async () => {
      element = await historyFixture();
    });

    it('returns the element from path', () => {
      const node = element.shadowRoot.querySelector('.rail .menu-item');
      assert.ok(node);
      const e = {
        composedPath: () => [document.createElement('span'), node],
      };
      // @ts-ignore
      const result = findTab(e);
      assert.isTrue(node === result);
    });

    it('return undefined when nod is not found', () => {
      const e = {
        composedPath: () => [document.createElement('span')]
      };
      // @ts-ignore
      const result = findTab(e);
      assert.isUndefined(result);
    });
  });

  describe('[dragoverHandler]()', () => {
    let element = /** @type ArcMenuElement */ (null);
    beforeEach(async () => {
      element = await draggableFixture();
      element.dragOpenTimeout = 1;
    });

    function dispatchEvent(types=['arc/request'], type='saved') {
      const selector = `.rail .menu-item[data-type="${type}"]`;
      const node = element.shadowRoot.querySelector(selector);
      const dataTransfer = new DataTransfer();
      const e = new DragEvent('dragover', {
        dataTransfer,
        bubbles: true,
        cancelable: true,
      });
      types.forEach((t) => {
        dataTransfer.setData(t, 'test');
      });
      node.dispatchEvent(e);
      return e;
    }

    it('ignores event when dataTransfer is not set', () => {
      const e = dispatchEvent();
      element.dataTransfer = false;
      element[dragoverHandler](e);
      // no error
    });

    it('ignores event when arc/request is not set', () => {
      const e = dispatchEvent(['some/mime']);
      assert.isFalse(e.defaultPrevented);
    });

    it('cancels the the event when supported', () => {
      const e = dispatchEvent();
      assert.isTrue(e.defaultPrevented);
    });

    it('ignores the event when not supported', async () => {
      element.selected = 1;
      await element.requestUpdate();
      const e = dispatchEvent(undefined, 'history');
      assert.isFalse(e.defaultPrevented);
    });

    it('cancels drag timeout', () => {
      const spy = sinon.spy(element, cancelDragTimeout);
      dispatchEvent();
      assert.isTrue(spy.called);
    });

    it('ignores the event when timeout is already set', () => {
      element[dragTypeCallbackValue] = 'saved';
      const spy = sinon.spy(element, cancelDragTimeout);
      dispatchEvent();
      assert.isFalse(spy.called);
    });

    it('cancels the timer when drag type changes', () => {
      element[dragTypeCallbackValue] = 'saved';
      const spy = sinon.spy(element, cancelDragTimeout);
      dispatchEvent(undefined, 'projects');
      assert.isTrue(spy.called);
    });

    it('Sets [dragTypeCallbackValue]', () => {
      dispatchEvent();
      assert.equal(element[dragTypeCallbackValue], 'saved');
    });

    it('Sets [dragOverTimeoutValue]', () => {
      dispatchEvent();
      assert.typeOf(element[dragOverTimeoutValue], 'number');
    });

    it('skips action when saved type and selected', async () => {
      element.selected = 1;
      await element.requestUpdate();
      dispatchEvent();
      assert.isUndefined(element[dragOverTimeoutValue]);
    });

    it('skips action when project type and selected', async () => {
      element.selected = 2;
      await element.requestUpdate();
      dispatchEvent(undefined, 'projects');
      assert.isUndefined(element[dragOverTimeoutValue]);
    });
  });

  describe('[dragleaveHandler]()', () => {
    let element = /** @type ArcMenuElement */ (null);
    beforeEach(async () => {
      element = await draggableFixture();
    });

    function dispatch(target, types=['arc/request']) {
      const selector = '.rail .menu-item[data-type="saved"]';
      const node = target.shadowRoot.querySelector(selector);
      const dataTransfer = new DataTransfer();
      const e = new DragEvent('dragleave', {
        dataTransfer,
        bubbles: true,
        cancelable: true,
      });
      types.forEach((t) => {
        dataTransfer.setData(t, 'test');
      });
      node.dispatchEvent(e);
      return e;
    }

    it('ignores event when dataTransfer is not set', () => {
      element.dataTransfer = false;
      const e = dispatch(element);
      assert.isFalse(e.defaultPrevented);
    });

    it('ignores event when arc/request is not set', () => {
      const e = dispatch(element, ['other']);
      assert.isFalse(e.defaultPrevented);
    });

    it('cancels the event', () => {
      const e = dispatch(element);
      assert.isTrue(e.defaultPrevented);
    });

    it('calls [cancelDragTimeout]()', () => {
      const spy = sinon.spy(element, cancelDragTimeout);
      dispatch(element);
      assert.isTrue(spy.called);
    });
  });

  describe('[cancelDragTimeout]()', () => {
    let element = /** @type ArcMenuElement */ (null);
    beforeEach(async () => {
      element = await draggableFixture();
    });

    it('clears timeout when set', () => {
      element[dragOverTimeoutValue] = 1;
      element[cancelDragTimeout]();
      assert.isUndefined(element[dragOverTimeoutValue]);
    });

    it('clears [dragTypeCallbackValue]', () => {
      element[dragOverTimeoutValue] = 1;
      element[dragTypeCallbackValue] = 'saved';
      element[cancelDragTimeout]();
      assert.isUndefined(element[dragTypeCallbackValue]);
    });

    it('only clears [dragTypeCallbackValue]', () => {
      element[dragTypeCallbackValue] = 'saved';
      element[cancelDragTimeout]();
      assert.isUndefined(element[dragTypeCallbackValue]);
    });
  });

  describe('[openMenuDragOver]()', () => {
    let element = /** @type ArcMenuElement */ (null);
    beforeEach(async () => {
      element = await draggableFixture();
    });

    it('ignores event when dataTransfer is not set', () => {
      element.dataTransfer = false;
      element[dragTypeCallbackValue] = 'saved';
      element[openMenuDragOver]();
      assert.equal(element[dragTypeCallbackValue], 'saved');
    });

    it('calls [cancelDragTimeout]()', () => {
      const spy = sinon.spy(element, cancelDragTimeout);
      element[dragTypeCallbackValue] = 'history';
      element[openMenuDragOver]();
      assert.isTrue(spy.called);
    });

    it('selects saved tab', () => {
      element[dragTypeCallbackValue] = 'saved';
      element[openMenuDragOver]();
      assert.equal(element.selected, 1);
    });

    it('selects projects tab', () => {
      element[dragTypeCallbackValue] = 'projects';
      element[openMenuDragOver]();
      assert.equal(element.selected, 2);
    });

    it('ignores other types', () => {
      element[openMenuDragOver]();
      assert.equal(element.selected, 0);
    });

    it('dispatches the selected event', async () => {
      const spy = sinon.spy();
      element.addEventListener('selected', spy);
      element[dragTypeCallbackValue] = 'saved';
      element[openMenuDragOver]();
      assert.isTrue(spy.called);
    });
  });

  describe('#minimized', () => {
    let element = /** @type ArcMenuElement */ (null);
    beforeEach(async () => {
      element = await historyFixture();
    });

    it('does not render the menu content when set', async () => {
      element.minimized = true;
      await element.updateComplete;
      const content = element.shadowRoot.querySelector('.content');
      assert.isTrue(content.hasAttribute('hidden'));
    });

    it('toggles minimized when clicking on a selected rail tile', () => {
      const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('.rail .menu-item'));
      node.click();
      assert.isTrue(element.minimized);
    });

    it('maximizes the menu when selecting another rail item', async () => {
      element.minimized = true;
      await element.updateComplete;
      const items = element.shadowRoot.querySelectorAll('.rail .menu-item');
      const node = /** @type HTMLElement */ (items[1]);
      node.click();
      assert.isFalse(element.minimized);
    });

    it('dispatches the minimized event', () => {
      const spy = sinon.spy();
      element.addEventListener('minimized', spy);
      const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('.rail .menu-item'));
      node.click();
      assert.isTrue(spy.called);
    });
  });

  describe('rail selection', () => {
    let element = /** @type ArcMenuElement */ (null);
    beforeEach(async () => {
      element = await historyFixture();
    });

    it('has selected history by default', () => {
      const node = /** @type HTMLElement */ (element.shadowRoot.querySelector(`.menu-item[data-type="${MenuTypes.history}"]`));
      assert.isTrue(node.classList.contains('selected'));
    });

    it('has selected saved rails', async () => {
      element.selected = 1;
      await nextFrame();
      const node = /** @type HTMLElement */ (element.shadowRoot.querySelector(`.menu-item[data-type="${MenuTypes.saved}"]`));
      assert.isTrue(node.classList.contains('selected'));
    });

    it('has selected projects rails', async () => {
      element.selected = 2;
      await nextFrame();
      const node = /** @type HTMLElement */ (element.shadowRoot.querySelector(`.menu-item[data-type="${MenuTypes.projects}"]`));
      assert.isTrue(node.classList.contains('selected'));
    });

    it('has selected apiDocs rails', async () => {
      element.selected = 3;
      await nextFrame();
      const node = /** @type HTMLElement */ (element.shadowRoot.querySelector(`.menu-item[data-type="${MenuTypes.apiDocs}"]`));
      assert.isTrue(node.classList.contains('selected'));
    });

    it('dispatches the selected event', async () => {
      const spy = sinon.spy();
      element.addEventListener('selected', spy);
      const node = /** @type HTMLElement */ (element.shadowRoot.querySelector(`.menu-item[data-type="${MenuTypes.saved}"]`));
      node.click();
      await nextFrame();
      assert.isTrue(spy.called);
    });
  });

  describe('rail selection without history', () => {
    let element = /** @type ArcMenuElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('has selected saved by default', async () => {
      const node = /** @type HTMLElement */ (element.shadowRoot.querySelector(`.menu-item[data-type="${MenuTypes.saved}"]`));
      assert.isTrue(node.classList.contains('selected'));
    });

    it('has selected projects rails', async () => {
      element.selected = 1;
      await nextFrame();
      const node = /** @type HTMLElement */ (element.shadowRoot.querySelector(`.menu-item[data-type="${MenuTypes.projects}"]`));
      assert.isTrue(node.classList.contains('selected'));
    });

    it('has selected apiDocs rails', async () => {
      element.selected = 2;
      await nextFrame();
      const node = /** @type HTMLElement */ (element.shadowRoot.querySelector(`.menu-item[data-type="${MenuTypes.apiDocs}"]`));
      assert.isTrue(node.classList.contains('selected'));
    });
  });
});
