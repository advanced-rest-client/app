import { fixture, assert, html } from '@open-wc/testing';
import sinon from 'sinon';
import '../../define/workspace-tab.js';

/** @typedef {import('../../index').WorkspaceTabElement} WorkspaceTabElement */

describe('WorkspaceTabElement', () => {
  /**
   * @returns {Promise<WorkspaceTabElement>}
   */
  async function basicFixture() {
    return fixture(html`
      <workspace-tab>Label</workspace-tab>
    `);
  }

  describe('closing with the middle click', () => {
    /** @type WorkspaceTabElement */
    let element;

    beforeEach(async () => { element = await basicFixture(); });

    it('dispatches the close event when the middle button is clicked', () => {
      const spy = sinon.spy();
      element.addEventListener('close', spy);
      const e = new PointerEvent('pointerdown', {
        button: 1,
        buttons: 4,
      });
      element.dispatchEvent(e);
      assert.isTrue(spy.calledOnce);
    });

    it('ignores other button configurations', () => {
      const spy = sinon.spy();
      element.addEventListener('close', spy);
      const e = new PointerEvent('pointerdown', {
        button: 0,
        buttons: 1,
      });
      element.dispatchEvent(e);
      assert.isFalse(spy.called);
    });
  });

  describe('closing with the gesture', () => {
    /** @type WorkspaceTabElement */
    let element;

    beforeEach(async () => { element = await basicFixture(); });

    it('dispatches the close event when 3 finger click', () => {
      const spy = sinon.spy();
      element.addEventListener('close', spy);
      const touches = /** @type Touch[] */ ([
        new Touch({
          identifier: 1234567890,
          target: element,
        }),
        new Touch({
          identifier: 1234567890,
          target: element,
        }),
        new Touch({
          identifier: 1234567890,
          target: element,
        }),
      ]);
      const e = new TouchEvent('touchstart', {
        targetTouches: touches,
      });
      element.dispatchEvent(e);
      assert.isTrue(spy.calledOnce);
    });

    it('ignores other touches', () => {
      const spy = sinon.spy();
      element.addEventListener('close', spy);
      const touches = /** @type Touch[] */ ([
        new Touch({
          identifier: 1234567890,
          target: element,
        }),
        new Touch({
          identifier: 1234567890,
          target: element,
        }),
      ]);
      const e = new TouchEvent('touchstart', {
        targetTouches: touches,
      });
      element.dispatchEvent(e);
      assert.isFalse(spy.called);
    });
  });
});
