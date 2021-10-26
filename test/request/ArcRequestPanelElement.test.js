/* eslint-disable no-continue */
import { fixture, assert, html, nextFrame } from '@open-wc/testing';
import { ArcMock } from '@advanced-rest-client/arc-mock';
import sinon from 'sinon';
import { ArcModelEvents, ArcModelEventTypes, TransportEvents } from '@advanced-rest-client/events';
import { loadMonaco } from '../MonacoSetup.js';
import '../../define/arc-request-panel.js';

/** @typedef {import('@advanced-rest-client/events').ArcRequest.ArcEditorRequest} ArcEditorRequest */
/** @typedef {import('@advanced-rest-client/events').ArcRequest.ARCSavedRequest} ARCSavedRequest */
/** @typedef {import('../../index').ArcRequestPanelElement} ArcRequestPanelElement */

describe('ArcRequestPanelElement', () => {
  const gen = new ArcMock();

  /**
   * @param {ArcEditorRequest=} request
   * @returns {Promise<ArcRequestPanelElement>}
   */
  async function basicFixture(request) {
    return fixture(html`
      <arc-request-panel .editorRequest="${request}"></arc-request-panel>
    `);
  }

  /**
   * @returns {Promise<ArcRequestPanelElement>}
   */
  async function defaultFixture() {
    return fixture(html`
      <arc-request-panel></arc-request-panel>
    `);
  }

  before(async () => loadMonaco());

  describe('send()', () => {
    let element = /** @type ArcRequestPanelElement */ (null);
    beforeEach(async () => {
      const request = gen.http.history();
      element = await basicFixture({
        id: '1',
        request,
      });
    });

    it('calls the send() function on the editor', () => {
      const editor = element.shadowRoot.querySelector('arc-request-editor');
      const spy = sinon.spy(editor, 'send');
      element.send();
      assert.isTrue(spy.called);
    });
  });

  describe('abort()', () => {
    let element = /** @type ArcRequestPanelElement */ (null);
    beforeEach(async () => {
      const request = gen.http.history();
      element = await basicFixture({
        id: '1',
        request,
      });
    });

    it('calls the abort() function on the editor', () => {
      const editor = element.shadowRoot.querySelector('arc-request-editor');
      const spy = sinon.spy(editor, 'abort');
      element.abort();
      assert.isTrue(spy.called);
    });

    it('clears the loading flag', () => {
      element.loading = true;
      element.abort();
      assert.isFalse(element.loading);
    });

    it('clears the progressMessage property', () => {
      element.progressMessage = 'test';
      element.abort();
      assert.equal(element.progressMessage, '');
    });
  });

  describe('#boundEvents', () => {
    let element = /** @type ArcRequestPanelElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('sets the eventsTarget to self', () => {
      element.boundEvents = true;
      assert.isTrue(element.eventsTarget === element);
    });

    it('restores it back to the window object', () => {
      element.boundEvents = true;
      element.boundEvents = false;
      assert.isTrue(element.eventsTarget === window);
    });
  });

  describe('#editor', () => {
    let element = /** @type ArcRequestPanelElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('return the element', () => {
      const editor = element.shadowRoot.querySelector('arc-request-editor');
      assert.isTrue(element.editor === editor);
    });
  });

  describe('constructor()', () => {
    let element = /** @type ArcRequestPanelElement */ (null);
    beforeEach(async () => {
      element = await defaultFixture();
    });

    it('sets the default request', () => {
      assert.typeOf(element.editorRequest, 'object', 'has the editorRequest');
      assert.typeOf(element.editorRequest.request, 'object', 'has the editorRequest.request');
    });

    it('sets the loading flag', () => {
      assert.isFalse(element.loading);
    });
  });

  describe('keyboard support', () => {
    let element = /** @type ArcRequestPanelElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('aborts on Escape key and when loading', () => {
      element.loading = true;
      const spy = sinon.spy(element, 'abort');
      const e = new KeyboardEvent('keydown', {
        code: 'Escape',
      });
      element.dispatchEvent(e);
      assert.isTrue(spy.called);
    });

    it('ignores Escape key when not loading', () => {
      element.loading = false;
      const spy = sinon.spy(element, 'abort');
      const e = new KeyboardEvent('keydown', {
        code: 'Escape',
      });
      element.dispatchEvent(e);
      assert.isFalse(spy.called);
    });

    it('sends the request on ctrl + Enter', () => {
      const spy = sinon.spy(element, 'send');
      const e = new KeyboardEvent('keydown', {
        code: 'Enter',
        ctrlKey: true,
      });
      element.dispatchEvent(e);
      assert.isTrue(spy.called);
    });

    it('sends the request on meta + Enter', () => {
      const spy = sinon.spy(element, 'send');
      const e = new KeyboardEvent('keydown', {
        code: 'Enter',
        metaKey: true,
      });
      element.dispatchEvent(e);
      assert.isTrue(spy.called);
    });

    it('ignores Enter when no modifier', () => {
      const spy = sinon.spy(element, 'send');
      const e = new KeyboardEvent('keydown', {
        code: 'Enter',
      });
      element.dispatchEvent(e);
      assert.isFalse(spy.called);
    });
  });

  describe('Deleting a saved request', () => {
    let element = /** @type ArcRequestPanelElement */ (null);
    let request = /** @type ARCSavedRequest */ (null);
    beforeEach(async () => {
      request = /** @type ARCSavedRequest */ (gen.http.saved());
      request._id = 'test-id';
      request._rev = 'test-rev';
      element = await basicFixture({
        id: '1',
        request,
      });
    });

    it('removes data store identifiers', () => {
      ArcModelEvents.Request.State.delete(document.body, 'saved', request._id, request._rev);
      const er = /** @type ARCSavedRequest */ (element.editorRequest.request);
      assert.isUndefined(er._id, 'id is removed');
      assert.isUndefined(er._rev, 'rev is removed');
    });

    it('sets a copy of the original object', () => {
      ArcModelEvents.Request.State.delete(document.body, 'saved', request._id, request._rev);
      assert.typeOf(request._id, 'string');
    });

    it('notifies change', () => {
      const spy = sinon.spy();
      element.addEventListener('change', spy);
      ArcModelEvents.Request.State.delete(document.body, 'saved', request._id, request._rev);
      assert.isTrue(spy.called);
    });

    it('ignores other requests', () => {
      const spy = sinon.spy();
      element.addEventListener('change', spy);
      ArcModelEvents.Request.State.delete(document.body, 'saved', 'other', 'other');
      assert.isFalse(spy.called);
    });
  });

  describe('Transport request event', () => {
    let element = /** @type ArcRequestPanelElement */ (null);
    let request = /** @type ARCSavedRequest */ (null);
    beforeEach(async () => {
      request = /** @type ARCSavedRequest */ (gen.http.saved());
      element = await basicFixture({
        id: '1',
        request,
      });
    });

    it('sets the loading state', () => {
      TransportEvents.request(window, {
        id: '1',
        request,
      });
      assert.isTrue(element.loading);
    });

    it('sets the progressMessage', () => {
      TransportEvents.request(window, {
        id: '1',
        request,
      });
      assert.equal(element.progressMessage, 'Preparing the request...');
    });

    it('ignores other requests', () => {
      TransportEvents.request(window, {
        id: '2',
        request,
      });
      assert.isFalse(element.loading);
    });
  });

  describe('Transport response event', () => {
    let element = /** @type ArcRequestPanelElement */ (null);
    let request = /** @type ARCSavedRequest */ (null);
    beforeEach(async () => {
      request = /** @type ARCSavedRequest */ (gen.http.saved());
      element = await basicFixture({
        id: '1',
        request,
      });
    });

    it('re-sets the loading state', () => {
      element.loading = true;
      const rsp = gen.http.response.arcResponse();
      TransportEvents.response(window, '1', request, { ...request, endTime: 1, startTime: 0, httpMessage: '', }, rsp);
      assert.isFalse(element.loading);
    });

    it('re-sets the progressMessage', () => {
      element.progressMessage = 'Preparing the request...';
      const rsp = gen.http.response.arcResponse();
      TransportEvents.response(window, '1', request, { ...request, endTime: 1, startTime: 0, httpMessage: '', }, rsp);
      assert.equal(element.progressMessage, '');
    });

    it('sets the response on the request object', () => {
      const rsp = gen.http.response.arcResponse();
      TransportEvents.response(window, '1', request, { ...request, endTime: 1, startTime: 0, httpMessage: '', }, rsp);
      assert.deepEqual(element.editorRequest.request.response, rsp);
    });

    it('sets the transportRequest on the request object', () => {
      const rsp = gen.http.response.arcResponse();
      const transportRequest = { ...request, endTime: 1, startTime: 0, httpMessage: '', };
      TransportEvents.response(window, '1', request, transportRequest, rsp);
      assert.deepEqual(element.editorRequest.request.transportRequest, transportRequest);
    });

    it('ignores other requests', () => {
      element.loading = true;
      const rsp = gen.http.response.arcResponse();
      TransportEvents.response(window, '2', request, { ...request, endTime: 1, startTime: 0, httpMessage: '', }, rsp);
      assert.isTrue(element.loading);
    });

    it('notifies change', () => {
      const spy = sinon.spy();
      element.addEventListener('change', spy);
      const rsp = gen.http.response.arcResponse();
      TransportEvents.response(window, '1', request, { ...request, endTime: 1, startTime: 0, httpMessage: '', }, rsp);
      assert.isTrue(spy.called);
    });
  });

  describe('changing editor properties', () => {
    let element = /** @type ArcRequestPanelElement */ (null);
    let request = /** @type ARCSavedRequest */ (null);
    beforeEach(async () => {
      request = /** @type ARCSavedRequest */ (gen.http.saved());
      element = await basicFixture({
        id: '1',
        request,
      });
    });

    it('updates the editorRequest value', () => {
      const editor = element.shadowRoot.querySelector('arc-request-editor');
      editor.payload = 'test-value';
      editor.dispatchEvent(new Event('change'));
      assert.equal(element.editorRequest.request.payload, 'test-value');
    });

    it('notifies change', () => {
      const spy = sinon.spy();
      element.addEventListener('change', spy);
      const editor = element.shadowRoot.querySelector('arc-request-editor');
      editor.payload = 'test-value';
      editor.dispatchEvent(new Event('change'));
      assert.isTrue(spy.called);
    });
  });

  describe('clearing editor request', () => {
    let element = /** @type ArcRequestPanelElement */ (null);
    let request = /** @type ARCSavedRequest */ (null);
    beforeEach(async () => {
      request = /** @type ARCSavedRequest */ (gen.http.saved());
      element = await basicFixture({
        id: '1',
        request,
      });
    });

    it('updates the editorRequest value', () => {
      const editor = element.shadowRoot.querySelector('arc-request-editor');
      editor.reset();
      assert.equal(element.editorRequest.request.url, '');
    });

    it('notifies change', () => {
      const spy = sinon.spy();
      element.addEventListener('change', spy);
      const editor = element.shadowRoot.querySelector('arc-request-editor');
      editor.reset();
      assert.isTrue(spy.called);
    });
  });

  describe('clearing response', () => {
    let element = /** @type ArcRequestPanelElement */ (null);
    let request = /** @type ARCSavedRequest */ (null);
    beforeEach(async () => {
      request = /** @type ARCSavedRequest */ (gen.http.saved());
      element = await basicFixture({
        id: '1',
        request,
      });
    });

    it('clears the transportRequest property', async () => {
      const rsp = gen.http.response.arcResponse();
      const transportRequest = { ...request, endTime: 1, startTime: 0, httpMessage: '', };
      TransportEvents.response(window, '1', request, transportRequest, rsp);
      await nextFrame();
      const editor = element.shadowRoot.querySelector('response-view');
      editor.dispatchEvent(new Event('clear'));
      
      assert.isUndefined(element.editorRequest.request.transportRequest);
    });

    it('clears the response property', async () => {
      const rsp = gen.http.response.arcResponse();
      const transportRequest = { ...request, endTime: 1, startTime: 0, httpMessage: '', };
      TransportEvents.response(window, '1', request, transportRequest, rsp);
      await nextFrame();
      const editor = element.shadowRoot.querySelector('response-view');
      editor.dispatchEvent(new Event('clear'));
      
      assert.isUndefined(element.editorRequest.request.response);
    });

    it('notifies change', () => {
      const spy = sinon.spy();
      element.addEventListener('change', spy);
      const editor = element.shadowRoot.querySelector('response-view');
      editor.dispatchEvent(new Event('clear'));
      assert.isTrue(spy.called);
    });
  });

  describe('saveAction()', () => {
    let element = /** @type ArcRequestPanelElement */ (null);
    let request = /** @type ARCSavedRequest */ (null);
    beforeEach(async () => {
      request = /** @type ARCSavedRequest */ (gen.http.saved());
      request._id = 'test-id';
      request._rev = 'test-rev';
      element = await basicFixture({
        id: '1',
        request,
      });
    });

    it('saves already saved request', () => {
      const spy = sinon.spy();
      element.addEventListener(ArcModelEventTypes.Request.store, spy);
      element.saveAction();
      assert.isTrue(spy.called);
    });

    it('opens the meta editor when a history item', () => {
      /** @type ARCSavedRequest */ (element.editorRequest.request).type = 'history';
      const spy = sinon.spy();
      element.addEventListener(ArcModelEventTypes.Request.store, spy);
      element.saveAction();
      assert.isFalse(spy.called, 'the event is not called');
      assert.isTrue(element.requestMetaOpened, 'meta editor is opened');
    });

    it('opens the meta editor when no id', () => {
      delete /** @type ARCSavedRequest */ (element.editorRequest.request)._id;
      const spy = sinon.spy();
      element.addEventListener(ArcModelEventTypes.Request.store, spy);
      element.saveAction();
      assert.isFalse(spy.called, 'the event is not called');
      assert.isTrue(element.requestMetaOpened, 'meta editor is opened');
    });
  });

  describe('saveAsAction()', () => {
    let element = /** @type ArcRequestPanelElement */ (null);
    let request = /** @type ARCSavedRequest */ (null);
    beforeEach(async () => {
      request = /** @type ARCSavedRequest */ (gen.http.saved());
      request._id = 'test-id';
      request._rev = 'test-rev';
      element = await basicFixture({
        id: '1',
        request,
      });
    });

    it('opens the meta editor', () => {
      element.saveAsAction();
      assert.isTrue(element.requestMetaOpened);
    });

    it('sets the saveAs property on the meta editor', () => {
      element.saveAsAction();
      const editor = element.shadowRoot.querySelector('request-meta-editor');
      assert.isTrue(editor.saveAs);
    });
  });
});
