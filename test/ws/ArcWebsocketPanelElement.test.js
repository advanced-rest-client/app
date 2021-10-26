import { fixture, assert, html, oneEvent, nextFrame } from '@open-wc/testing';
import { loadMonaco } from '../MonacoSetup.js';
import '../../define/arc-websocket-panel.js';
import env from './env.js';

/** @typedef {import('../../index').ArcWebsocketPanelElement} ArcWebsocketPanelElement */
/** @typedef {import('@advanced-rest-client/events').WebSocket.WebsocketEditorRequest} WebsocketEditorRequest */

describe('ArcWebsocketPanelElement', () => {
  /**
   * @returns {Promise<ArcWebsocketPanelElement>}
   */
  async function basicFixture() {
    return fixture(html`<arc-websocket-panel></arc-websocket-panel>`);
  }

  /**
   * @param {WebsocketEditorRequest} request
   * @returns {Promise<ArcWebsocketPanelElement>}
   */
  async function requestFixture(request) {
    return fixture(html`<arc-websocket-panel .editorRequest="${request}"></arc-websocket-panel>`);
  }

  const { port } = env;

  before(async () => { await loadMonaco() });

  describe('constructor()', () => {
    let element = /** @type ArcWebsocketPanelElement */ (null);
    beforeEach(async () => { element = await basicFixture(); });

    it('has the default editorRequest', () => {
      assert.typeOf(element.editorRequest, 'object');
    });

    it('has the default loading property', () => {
      assert.isFalse(element.loading);
    });

    it('has the default anypoint property', () => {
      assert.isFalse(element.anypoint);
    });

    it('has the default outlined property', () => {
      assert.isFalse(element.outlined);
    });

    it('has the default exportOptionsOpened property', () => {
      assert.isFalse(element.exportOptionsOpened);
    });
  });

  /**
   * @return {WebsocketEditorRequest} 
   */
  function baseRequest() {
    return /** @type WebsocketEditorRequest */ ({
      id: '1',
      request: {
        kind: 'ARC#WebsocketRequest',
        url: `ws://localhost:${port}`,
        payload: 'test',
      },
    });
  }

  describe('making a connection', () => {
    /** @type ArcWebsocketPanelElement */
    let element;
    /** @type WebsocketEditorRequest */
    let request;
    beforeEach(async () => {
      request = baseRequest();
      element = await requestFixture(request); 
    });

    it('connects to the server', async () => {
      element.connect();
      const loadingState = element.loading;
      await oneEvent(element, 'connected');
      assert.isTrue(loadingState, 'set loading during the connection');
      assert.isFalse(element.loading, 'resets the loading state');
      assert.isTrue(element.connected, 'sets the connected state');
      assert.typeOf(element.result, 'object', 'creates the result object')
      assert.typeOf(element.result.created, 'number', 'has the result.created property')
      assert.equal(element.result.size, 0, 'has the result.size property')
      assert.deepEqual(element.result.logs, [], 'has the result.logs property')
      assert.isUndefined(element.result.updated, 'has no result.updated property')
      element.disconnect();
      await oneEvent(element, 'disconnected');
    });

    it('sends the message to the server', async () => {
      element.connect();
      await oneEvent(element, 'connected');
      await nextFrame();
      element.send();

      const { result } = element;
      assert.equal(result.size, 4, 'has the updated result.size property');
      assert.lengthOf(result.logs, 1, 'has the sent message log');
      assert.typeOf(result.updated, 'number', 'has the result.updated property');

      const [log] = result.logs;
      assert.typeOf(log.created, 'number', 'has the log.created')
      assert.strictEqual(log.direction, 'out', 'has the log.direction')
      assert.strictEqual(log.message, 'test', 'has the log.message')
      assert.strictEqual(log.size, 4, 'has the log.size')

      element.disconnect();
      await oneEvent(element, 'disconnected');
    });

    it('receives a message from the server', async () => {
      element.connect();
      await oneEvent(element, 'connected');
      await nextFrame();
      element.send();
      
      await oneEvent(element, 'message');
      // the dev server returns the same message.

      const { result } = element;
      assert.equal(result.size, 8, 'has the updated result.size property');
      assert.lengthOf(result.logs, 2, 'has the sent message log');
      assert.typeOf(result.updated, 'number', 'has the result.updated property');

      const log = result.logs[1];
      assert.typeOf(log.created, 'number', 'has the log.created')
      assert.strictEqual(log.direction, 'in', 'has the log.direction')
      assert.strictEqual(log.message, 'test', 'has the log.message')
      assert.strictEqual(log.size, 4, 'has the log.size')

      element.disconnect();
      await oneEvent(element, 'disconnected');
    });
  });
});
