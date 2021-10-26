import { fixture, assert, html } from '@open-wc/testing';
import '../../define/arc-websocket-logs.js';

/** @typedef {import('../../index').ArcWebsocketLogsElement} ArcWebsocketLogsElement */

describe('ArcWebsocketLogsElement', () => {
  /**
   * @returns {Promise<ArcWebsocketLogsElement>}
   */
  async function basicFixture() {
    return fixture(html`<arc-websocket-logs></arc-websocket-logs>`);
  }

  describe('constructor()', () => {
    let element = /** @type ArcWebsocketLogsElement */ (null);
    beforeEach(async () => { element = await basicFixture(); });

    it('has undefined connectionResult', () => {
      assert.isUndefined(element.connectionResult);
    });
  });
});
