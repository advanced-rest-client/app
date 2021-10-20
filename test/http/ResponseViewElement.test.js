/* eslint-disable no-param-reassign */
import { fixture, assert, html, nextFrame, oneEvent } from '@open-wc/testing';
import { DataExportEventTypes, WorkspaceEventTypes } from '@advanced-rest-client/events';
import { ArcMock } from '@advanced-rest-client/arc-mock';
import sinon from 'sinon';
import { availableTabs } from '../../src/elements/http/ResponseViewElement.js';
import '../../define/response-view.js';

/** @typedef {import('../../index').ResponseViewElement} ResponseViewElement */
/** @typedef {import('@advanced-rest-client/events').ArcResponse.Response} Response */
/** @typedef {import('@advanced-rest-client/events').ArcResponse.ErrorResponse} ErrorResponse */
/** @typedef {import('@advanced-rest-client/events').ArcRequest.TransportRequest} TransportRequest */
/** @typedef {import('@advanced-rest-client/events').ArcRequest.ArcBaseRequest} ArcBaseRequest */

describe('ResponseViewElement', () => {
  const generator = new ArcMock();
  /**
   * @returns {Promise<ResponseViewElement>}
   */
  async function basicFixture() {
    return fixture(`<response-view></response-view>`);
  }

  /**
   * @param {ArcBaseRequest} request
   * @returns {Promise<ResponseViewElement>}
   */
  async function dataFixture(request) {
    return fixture(html`<response-view .request="${request}" .response="${request && request.response}"></response-view>`);
  }

  /**
   * @returns {Promise<ResponseViewElement>}
   */
  async function autoFixture() {
    const r = generator.http.history();
    const request = /** @type TransportRequest */ ({
      url: r.url,
      method: r.method,
      startTime: Date.now() - 1000,
      endTime: Date.now(),
      httpMessage: 'Not available',
      headers: generator.http.headers.headers('request'),
    });
    const response = generator.http.response.arcResponse({ timings: true, ssl: true, redirects: true,  });
    r.transportRequest = request;
    r.response = response;
    return dataFixture(r);
  }

  /**
   * @returns {Promise<ResponseViewElement>}
   */
  async function responsePayloadFixture(responseMeta) {
    const r = generator.http.history();
    const request = /** @type TransportRequest */ ({
      url: r.url,
      method: r.method,
      startTime: Date.now() - 1000,
      endTime: Date.now(),
      httpMessage: 'Not available',
      headers: generator.http.headers.headers('request'),
    });
    const response = generator.http.response.arcResponse({ timings: true, ssl: true, redirects: true });
    if (!response.payload) {
      response.payload = 'test';
    }
    r.transportRequest = request;
    r.response = response;
    if (responseMeta) {
      const {loadingTime, status, statusText} = responseMeta
      r.response.loadingTime = loadingTime;
      r.response.status = status;
      r.response.statusText = statusText;
    }
    return dataFixture(r);
  }

  function rand(length, current='') {
    return length ? rand(--length, "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz".charAt(Math.floor(Math.random() * 60)) + current) : current;
  }

  /**
   * @returns {Promise<ResponseViewElement>}
   */
  async function responseSizeFixture(size=4089) {
    const r = generator.http.history();
    const request = /** @type TransportRequest */ ({
      url: r.url,
      method: r.method,
      startTime: Date.now() - 1000,
      endTime: Date.now(),
      httpMessage: 'Not available',
      headers: generator.http.headers.headers('request'),
    });
    const response = generator.http.response.arcResponse({ timings: true, ssl: true, redirects: true });
    const body = rand(size);
    response.payload = body;
    response.size = {
      response: size,
      request: request.httpMessage.length,
    };
    r.transportRequest = request;
    r.response = response;
    return fixture(html`<response-view .request="${r}" .response="${response}" forceRawSize="1" warningResponseMaxSize="2"></response-view>`);
  }

  const allPanels = ['response', 'timings', 'headers', 'redirects', 'raw'];

  describe('#active', () => {
    let element = /** @type ResponseViewElement */ (null);
    beforeEach(async () => { element = await basicFixture(); } );

    it('returns the active tab', () => {
      assert.deepEqual(element.active, ['response']);
    });

    it('ignores invalid parameters', () => {
      // @ts-ignore
      element.active = 'test';
      assert.deepEqual(element.active, ['response']);
    });

    it('sets only tabs defined in the supported list', () => {
      element.active = ['a', 'timings', 'b', 'c'];
      assert.deepEqual(element.active, ['timings']);
    });

    it('clear the list with "undefined"', () => {
      element.active = undefined;
      assert.deepEqual(element.active, []);
    });

    it('clear the list with "null"', () => {
      element.active = null;
      assert.deepEqual(element.active, []);
    });
  });

  describe('#selected', () => {
    let element = /** @type ResponseViewElement */ (null);
    beforeEach(async () => { element = await basicFixture(); } );

    it('returns the selected tab', () => {
      assert.equal(element.selected, 'response');
    });

    it('ignores the same value', () => {
      element.selected = 'response';
      assert.equal(element.selected, 'response');
    });

    it('sets only supported tab', () => {
      element.selected = 'invalid';
      assert.equal(element.selected, 'response');
    });

    it('sets a new tab', () => {
      element.selected = 'timings';
      assert.equal(element.selected, 'timings');
    });
  });

  describe('empty editor', () => {
    let element = /** @type ResponseViewElement */ (null);
    beforeEach(async () => { element = await basicFixture(); } );

    it('has default tabs list', () => {
      assert.deepEqual(element.active, ['response']);
    });

    it('has default opened panel', () => {
      assert.deepEqual(element.selected, 'response');
    });

    it('has disabled "close" button', () => {
      const button = /** @type HTMLButtonElement */ (element.shadowRoot.querySelector('.clear-button'));
      assert.isTrue(button.disabled);
    });

    it('has "empty-screen" panel opened', () => {
      const node = element.shadowRoot.querySelector('.empty-screen');
      assert.ok(node);
    });

    it('has no selected panel', () => {
      const node = element.shadowRoot.querySelector('#panel-response');
      assert.notOk(node);
    });
  });

  describe('tabs rendering', () => {
    let element = /** @type ResponseViewElement */ (null);
    beforeEach(async () => { element = await autoFixture(); } );

    it('renders tabs defined in the "active" property', async () => {
      element.active = ['timings', 'headers'];
      await nextFrame();
      const nodes = element.shadowRoot.querySelectorAll('.tabs .tab');
      assert.lengthOf(nodes, 2);
    });

    it('selects a tab via #selected', async () => {
      element.active = ['response', 'timings', 'headers'];
      element.selected = 'timings';
      await nextFrame();
      const node = element.shadowRoot.querySelector('#panel-tab-timings');
      assert.isTrue(node.classList.contains('selected'), 'the tab has the selection');
      const nodes = element.shadowRoot.querySelectorAll('.tabs .tab.selected');
      assert.lengthOf(nodes, 1, 'is the only selection');
    });

    it('selects a tab via tab click', async () => {
      element.active = ['response', 'timings', 'headers'];
      await nextFrame();
      const node = /** @type HTMLDivElement */ (element.shadowRoot.querySelector('#panel-tab-timings'));
      node.click();
      await nextFrame();
      assert.equal(element.selected, 'timings');
      assert.isTrue(node.classList.contains('selected'), 'the tab has the selection');
      const nodes = element.shadowRoot.querySelectorAll('.tabs .tab.selected');
      assert.lengthOf(nodes, 1, 'is the only selection');
    });

    it('selects an opened tab via menu item click', async () => {
      element.active = ['response', 'timings', 'headers'];
      await nextFrame();
      const item = /** @type HTMLElement */ (element.shadowRoot.querySelector('.tabs anypoint-item[data-id="timings"]'));
      item.click();
      await nextFrame();
      const node = /** @type HTMLDivElement */ (element.shadowRoot.querySelector('#panel-tab-timings'));
      assert.equal(element.selected, 'timings');
      assert.isTrue(node.classList.contains('selected'), 'the tab has the selection');
      const nodes = element.shadowRoot.querySelectorAll('.tabs .tab.selected');
      assert.lengthOf(nodes, 1, 'is the only selection');
    });

    it('opens a tab from the menu item selection', async () => {
      const item = /** @type HTMLElement */ (element.shadowRoot.querySelector('.tabs anypoint-item[data-id="redirects"]'));
      item.click();
      await nextFrame();
      const node = /** @type HTMLDivElement */ (element.shadowRoot.querySelector('#panel-tab-redirects'));
      assert.equal(element.selected, 'redirects');
      assert.isTrue(node.classList.contains('selected'), 'the tab has the selection');
      const nodes = element.shadowRoot.querySelectorAll('.tabs .tab.selected');
      assert.lengthOf(nodes, 1, 'is the only selection');
    });
  });

  describe('panels rendering', () => {
    let element = /** @type ResponseViewElement */ (null);
    beforeEach(async () => { element = await autoFixture(); } );

    it('renders the "response" panel by default', async () => {
      const panel = element.shadowRoot.querySelector('#panel-response');
      assert.ok(panel, 'has the panel');
      assert.isFalse(panel.hasAttribute('hidden'), 'panel is not hidden');
    });

    it('renders the "timings" panel after selection', async () => {
      element.active = ['timings'];
      element.selected = 'timings';
      await nextFrame();
      const panel = element.shadowRoot.querySelector('#panel-timings');
      assert.ok(panel, 'has the panel');
      assert.isFalse(panel.hasAttribute('hidden'), 'panel is not hidden');
    });

    it('renders the "headers" panel after selection', async () => {
      element.active = ['headers'];
      element.selected = 'headers';
      await nextFrame();
      const panel = element.shadowRoot.querySelector('#panel-headers');
      assert.ok(panel, 'has the panel');
      assert.isFalse(panel.hasAttribute('hidden'), 'panel is not hidden');
    });

    it('renders the "redirects" panel after selection', async () => {
      element.active = ['redirects'];
      element.selected = 'redirects';
      await nextFrame();
      const panel = element.shadowRoot.querySelector('#panel-redirects');
      assert.ok(panel, 'has the panel');
      assert.isFalse(panel.hasAttribute('hidden'), 'panel is not hidden');
    });

    it('renders the "raw" panel after selection', async () => {
      element.active = ['raw'];
      element.selected = 'raw';
      await nextFrame();
      const panel = element.shadowRoot.querySelector('#panel-raw');
      assert.ok(panel, 'has the panel');
      assert.isFalse(panel.hasAttribute('hidden'), 'panel is not hidden');
      const bodyPanel = panel.querySelector('response-body');
      assert.isTrue(bodyPanel.rawOnly, 'The body panel is set to render raw view only')
    });

    it('renders only a single panel', async () => {
      element.active = allPanels;
      element.selected = 'redirects';
      await nextFrame();
      const panel = element.shadowRoot.querySelector('#panel-redirects');
      assert.ok(panel, 'has the panel');
      assert.isFalse(panel.hasAttribute('hidden'), 'panel is not hidden');
      const other = element.shadowRoot.querySelectorAll('.panel:not(#panel-redirects)');
      Array.from(other).forEach((item) => {
        assert.isTrue(item.hasAttribute('hidden'), 'panel is hidden');
      });
    });
  });


  describe('error rendering', () => {
    it('renders the error message when error', async () => {
      const r = generator.http.history();
      const request = /** @type TransportRequest */ ({
        url: r.url,
        method: r.method,
        startTime: Date.now() - 1000,
        endTime: Date.now(),
        httpMessage: 'Not available',
        headers: generator.http.headers.headers('request'),
      });
      const response = generator.http.response.arcErrorResponse();
      r.transportRequest = request;
      r.response = response;
      const element = await dataFixture(r);
      const errorElement = element.shadowRoot.querySelector('response-error');
      assert.ok(errorElement);
    });

    it('renders the response view when has error and a payload', async () => {
      const r = generator.http.history();
      const request = /** @type TransportRequest */ ({
        url: r.url,
        method: r.method,
        startTime: Date.now() - 1000,
        endTime: Date.now(),
        httpMessage: 'Not available',
        headers: generator.http.headers.headers('request'),
      });
      const response = generator.http.response.arcErrorResponse();
      response.payload = 'test-body';
      r.transportRequest = request;
      r.response = response;
      const element = await dataFixture(r);
      const errorElement = element.shadowRoot.querySelector('response-error');
      assert.notOk(errorElement, 'response-error is not rendered');
      const bodyElement = element.shadowRoot.querySelector('response-body');
      assert.ok(bodyElement, 'response-body is rendered');
    });
  });

  describe('Response rendering limits', () => {
    describe('Size limit warning message', () => {
      let element = /** @type ResponseViewElement */ (null);
      beforeEach(async () => { element = await responseSizeFixture(); } );

      it('renders the warning message', () => {
        const node = element.shadowRoot.querySelector('.size-warning');
        assert.ok(node, 'has the warning message');
      });

      it('renders the "render" button', () => {
        const node = element.shadowRoot.querySelector('.size-warning anypoint-button');
        assert.ok(node, 'has the render button');
      });

      it('renders the response when the "render" button is activated', async () => {
        const button = /** @type HTMLElement */ (element.shadowRoot.querySelector('.size-warning anypoint-button'));
        button.click();
        await nextFrame();
        const node = element.shadowRoot.querySelector('.response-wrapper response-body');
        assert.ok(node, 'has the parsed panel');
      });
    });

    describe('Raw only limit', () => {
      let element = /** @type ResponseViewElement */ (null);
      beforeEach(async () => { element = await responseSizeFixture(1025); } );

      it('sets the rawOnly on the body view', () => {
        const node = element.shadowRoot.querySelector('response-body');
        assert.isTrue(node.rawOnly);
      });
    });
  });

  describe('closing a tab/panel', () => {
    let element = /** @type ResponseViewElement */ (null);
    beforeEach(async () => { 
      element = await autoFixture();
      element.active = allPanels;
      await nextFrame();
    });

    it('closes an active panel', async () => {
      const button = /** @type HTMLElement */ (element.shadowRoot.querySelector('#panel-tab-response .tab-close'));
      button.click();
      assert.deepEqual(element.active, ['timings', 'headers', 'redirects', 'raw']);
    });

    it('closes an other panel', async () => {
      const button = /** @type HTMLElement */ (element.shadowRoot.querySelector('#panel-tab-timings .tab-close'));
      button.click();
      assert.deepEqual(element.active, ['response', 'headers', 'redirects', 'raw']);
    });

    it('changes the active panel when first tab', async () => {
      const button = /** @type HTMLElement */ (element.shadowRoot.querySelector('#panel-tab-response .tab-close'));
      button.click();
      assert.equal(element.selected, 'timings');
    });

    it('changes the active panel when not the first tab', async () => {
      element.selected = 'headers';
      const button = /** @type HTMLElement */ (element.shadowRoot.querySelector('#panel-tab-headers .tab-close'));
      button.click();
      assert.equal(element.selected, 'timings');
    });

    it('does not change selection when closing unselected tab', async () => {
      const button = /** @type HTMLElement */ (element.shadowRoot.querySelector('#panel-tab-headers .tab-close'));
      button.click();
      assert.equal(element.selected, 'response');
    });

    it('dispatches "activechange" event', async () => {
      const spy = sinon.spy();
      element.addEventListener('activechange', spy);
      const button = /** @type HTMLElement */ (element.shadowRoot.querySelector('#panel-tab-headers .tab-close'));
      button.click();
      assert.isTrue(spy.called);
    });

    it('dispatches "selectedchange" event when closing selected tab', async () => {
      const spy = sinon.spy();
      element.addEventListener('selectedchange', spy);
      const button = /** @type HTMLElement */ (element.shadowRoot.querySelector('#panel-tab-response .tab-close'));
      button.click();
      assert.isTrue(spy.called);
    });

    it('does not dispatch "selectedchange" event when closing unselected tab', async () => {
      const spy = sinon.spy();
      element.addEventListener('selectedchange', spy);
      const button = /** @type HTMLElement */ (element.shadowRoot.querySelector('#panel-tab-headers .tab-close'));
      button.click();
      assert.isFalse(spy.called);
    });
  });

  describe('cleaning the results', () => {
    let element = /** @type ResponseViewElement */ (null);
    beforeEach(async () => { 
      element = await autoFixture();
      element.active = allPanels;
      await nextFrame();
    });

    it('cleans up the element properties', async () => {
      const button = /** @type HTMLElement */ (element.shadowRoot.querySelector('.clear-button'));
      button.click();
      assert.isUndefined(element.request, 'request is cleared');
    });

    it('renders an empty panel', async () => {
      const button = /** @type HTMLElement */ (element.shadowRoot.querySelector('.clear-button'));
      button.click();
      await nextFrame();
      const panel = /** @type HTMLElement */ (element.shadowRoot.querySelector('.empty-screen'));
      assert.ok(panel);
    });
  });

  describe('redirect links handling', () => {
    let element = /** @type ResponseViewElement */ (null);
    let anchor = /** @type HTMLAnchorElement */ (null);
    let span = /** @type HTMLSpanElement */ (null);
    beforeEach(async () => { 
      element = await autoFixture();
      element.active = allPanels;
      element.selected = 'redirects';
      await nextFrame();
      anchor = document.createElement('a');
      anchor.href = 'https://domain.com/';
      element.shadowRoot.querySelector('.redirect-value').append(anchor);
      span = document.createElement('span');
      element.shadowRoot.querySelector('.redirect-value').append(span);
    });

    it('dispatches append request event when clicking on an anchor', () => {
      const spy = sinon.spy();
      element.addEventListener(WorkspaceEventTypes.appendRequest, spy);
      anchor.click();
      assert.isTrue(spy.called);
    });

    it('ignores other elements', () => {
      const spy = sinon.spy();
      element.addEventListener(WorkspaceEventTypes.appendRequest, spy);
      span.click();
      assert.isFalse(spy.called);
    });

    it('stops the click event', () => {
      const spy = sinon.spy();
      element.addEventListener('click', spy);
      anchor.click();
      assert.isFalse(spy.called);
    });
  });

  describe('content actions', () => {
    let element = /** @type ResponseViewElement */ (null);
    beforeEach(async () => { 
      element = await responsePayloadFixture();
    });

    it('dispatches file save event', () => {
      const spy = sinon.spy();
      element.addEventListener(DataExportEventTypes.fileSave, spy);
      const button = /** @type HTMLElement */ (element.shadowRoot.querySelector('anypoint-icon-item[data-id="save"]'));
      button.click();
      assert.isTrue(spy.called);
    });

    it('has the content type', () => {
      element.request.response.headers = 'content-type: application/json';
      const spy = sinon.spy();
      element.addEventListener(DataExportEventTypes.fileSave, spy);
      const button = /** @type HTMLElement */ (element.shadowRoot.querySelector('anypoint-icon-item[data-id="save"]'));
      button.click();
      const { providerOptions } = spy.args[0][0];
      assert.equal(providerOptions.contentType, 'application/json');
    });

    it('has the default content type', () => {
      element.request.response.headers = 'accept: application/json';
      const spy = sinon.spy();
      element.addEventListener(DataExportEventTypes.fileSave, spy);
      const button = /** @type HTMLElement */ (element.shadowRoot.querySelector('anypoint-icon-item[data-id="save"]'));
      button.click();
      const { providerOptions } = spy.args[0][0];
      assert.equal(providerOptions.contentType, 'text/plain');
    });

    it('has the file extension', () => {
      element.request.response.headers = 'content-type: application/json';
      const spy = sinon.spy();
      element.addEventListener(DataExportEventTypes.fileSave, spy);
      const button = /** @type HTMLElement */ (element.shadowRoot.querySelector('anypoint-icon-item[data-id="save"]'));
      button.click();
      const { providerOptions } = spy.args[0][0];
      assert.include(providerOptions.file, '.json');
    });

    it('saves the response as HAR', async () => {
      const button = /** @type HTMLElement */ (element.shadowRoot.querySelector('anypoint-icon-item[data-id="har"]'));
      button.click();
      const e = await oneEvent(element, DataExportEventTypes.fileSave);
      // @ts-ignore
      const { providerOptions, data } = e;
      assert.typeOf(data, 'string', 'has the data on the event');
      assert.equal(providerOptions.contentType, 'application/json', 'has the content type');
      assert.equal(providerOptions.file, 'response-body.har', 'has the file name');
    });
  });

  describe('#types', () => {
    let element = /** @type ResponseViewElement */ (null);
    beforeEach(async () => { element = await autoFixture(); } );

    it('has the default list of panels', () => {
      assert.deepEqual(element.effectivePanels, availableTabs);
    });

    it('renders all tab options by default', () => {
      const nodes = element.shadowRoot.querySelectorAll('.tabs-menu anypoint-item');
      assert.lengthOf(nodes, 5);
    });

    it('computes a single panel option', () => {
      element.types = 'timings';
      assert.lengthOf(element.effectivePanels, 1, 'has single effectivePanel');
      assert.equal(element.effectivePanels[0].id, 'timings');
    });

    it('renders a single tab option', async () => {
      element.types = 'timings';
      await nextFrame();
      const nodes = element.shadowRoot.querySelectorAll('.tabs-menu anypoint-item');
      assert.lengthOf(nodes, 1);
    });

    it('computes a multi panel option', () => {
      element.types = 'timings,headers';
      assert.lengthOf(element.effectivePanels, 2, 'has 2 effectivePanels');
      assert.equal(element.effectivePanels[0].id, 'timings');
      assert.equal(element.effectivePanels[1].id, 'headers');
    });

    it('renders a single tab option', async () => {
      element.types = 'timings,headers';
      await nextFrame();
      const nodes = element.shadowRoot.querySelectorAll('.tabs-menu anypoint-item');
      assert.lengthOf(nodes, 2);
    });

    it('ignores invalid options', () => {
      element.types = 'timings,some,headers';
      assert.lengthOf(element.effectivePanels, 2, 'has 2 effectivePanels');
      assert.equal(element.effectivePanels[0].id, 'timings');
      assert.equal(element.effectivePanels[1].id, 'headers');
    });
  });

  describe('a11y', () => {
    describe('tabs a11y', () => {
      let element = /** @type ResponseViewElement */ (null);
      let tabs = /** @type HTMLDivElement */ (null);
      beforeEach(async () => { 
        element = await responsePayloadFixture();
        element.active = allPanels;
        tabs = element.shadowRoot.querySelector('.tabs');
      });

      it('selects previous tab when ArrowLeft', async () => {
        element.selected = 'timings';
        await nextFrame();
        const e = new KeyboardEvent('keydown', {
          code: 'ArrowLeft',
          key: 'ArrowLeft',
        });
        tabs.dispatchEvent(e);
        await nextFrame();
        assert.equal(element.selected, 'response');
        const panel = element.shadowRoot.querySelector('#panel-response');
        assert.ok(panel);
      });

      it('selects last tab when ArrowLeft on first', async () => {
        const e = new KeyboardEvent('keydown', {
          code: 'ArrowLeft',
          key: 'ArrowLeft',
        });
        tabs.dispatchEvent(e);
        await nextFrame();
        assert.equal(element.selected, 'raw');
        const panel = element.shadowRoot.querySelector('#panel-redirects');
        assert.ok(panel);
      });

      it('dispatches the selectedchange event', async () => {
        const e = new KeyboardEvent('keydown', {
          code: 'ArrowLeft',
          key: 'ArrowLeft',
        });
        const spy = sinon.spy();
        element.addEventListener('selectedchange', spy)
        tabs.dispatchEvent(e);
        await nextFrame();
        assert.isTrue(spy.called);
      });

      it('selects next tab when ArrowRight', async () => {
        const e = new KeyboardEvent('keydown', {
          code: 'ArrowRight',
          key: 'ArrowRight',
        });
        tabs.dispatchEvent(e);
        await nextFrame();
        assert.equal(element.selected, 'timings');
        const panel = element.shadowRoot.querySelector('#panel-timings');
        assert.ok(panel);
      });

      it('selects first tab when ArrowRight on the last', async () => {
        element.selected = 'raw';
        await nextFrame();
        const e = new KeyboardEvent('keydown', {
          code: 'ArrowRight',
          key: 'ArrowRight',
        });
        tabs.dispatchEvent(e);
        await nextFrame();
        assert.equal(element.selected, 'response');
        const panel = element.shadowRoot.querySelector('#panel-response');
        assert.ok(panel);
      });

      it('dispatches the selectedchange event', async () => {
        await nextFrame();
        const e = new KeyboardEvent('keydown', {
          code: 'ArrowRight',
          key: 'ArrowRight',
        });
        const spy = sinon.spy();
        element.addEventListener('selectedchange', spy)
        tabs.dispatchEvent(e);
        await nextFrame();
        assert.isTrue(spy.called);
      });
    });
    
    describe('automated tests', () => {
      let element = /** @type ResponseViewElement */ (null);
      beforeEach(async () => { 
        element = await responsePayloadFixture();
      });

      it('passes automated test', async () => {
        await assert.isAccessible(element, {
          ignoredRules: ['color-contrast' , 'aria-allowed-attr']
        });
      });
    });
  });

  describe('response meta rendering', () => {
    let element = /** @type ResponseViewElement */ (null);
    beforeEach(async () => {
      const responseMeta = {loadingTime: 2489.42342111, status: 200, statusText: 'ok'}
      element = await responsePayloadFixture(responseMeta);
    } );

    it('renders response meta', async () => {
      const responseMeta = element.shadowRoot.querySelector('.response-meta');
      assert.ok(responseMeta, 'has response meta');
    });

    it('renders status', async () => {
      const statusContainer = element.shadowRoot.querySelector('.status-line');
      assert.ok(statusContainer, 'has status');
    });

    it('renders status code', async () => {
      const status = /** @type HTMLElement */ (element.shadowRoot.querySelector('.code'));
      assert.ok(status, 'has status code');
      assert.equal(status.innerText, '200');
    });

    it('renders status msg', async () => {
      const status = /** @type HTMLElement */ (element.shadowRoot.querySelector('.status-line .message'));
      assert.ok(status, 'has status msg');
      assert.equal(status.innerText, 'ok');
    });

    it('renders loading time', async () => {
      const time = /** @type HTMLElement */ (element.shadowRoot.querySelector('.loading-time-label'));
      assert.ok(time, 'has status msg');
      assert.equal(time.innerText, 'Time: 2489.42342 ms');
    });
  });

  describe('get hasResponse', () => {
    let element = /** @type ResponseViewElement */ (null);
    beforeEach(async () => { 
      element = await basicFixture();
      await nextFrame();
    });

    it('should return false if there is a response but no request', () => {
      // @ts-ignore
      element.response = {};
      assert.isFalse(element.hasResponse);
    });

    it('should return false if there is no response and no request', () => {
      // @ts-ignore
      assert.isFalse(element.hasResponse);
    });

    it('should return false if there is a request but no response', () => {
      // @ts-ignore
      element.request = {};
      assert.isFalse(element.hasResponse);
    });

    it('should return true if there is a request and response', () => {
      // @ts-ignore
      element.request = {};
      // @ts-ignore
      element.response = {};
      assert.isTrue(element.hasResponse);
    });
  });
});
