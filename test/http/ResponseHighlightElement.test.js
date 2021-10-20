import sinon from 'sinon';
import { fixture, assert, aTimeout, html } from '@open-wc/testing';
import { WorkspaceEventTypes, UiEventTypes } from '@advanced-rest-client/events';
import '../../define/response-highlight.js';
import { 
  outputElement,
  detectLang,
  contentTypeToLang,
  pendingViewUpdate,
} from '../../src/elements/http/internals.js';

/** @typedef {import('../../index').ResponseHighlightElement} ResponseHighlightElement */

describe('ResponseHighlightElement', () => {
  /**
   * @returns {Promise<ResponseHighlightElement>}
   */
  async function basicFixture() {
    return fixture(`<response-highlight></response-highlight>`);
  }

  /**
   * @returns {Promise<ResponseHighlightElement>}
   */
  async function markdownFixture() {
    return fixture(`<response-highlight lang="markdown"></response-highlight>`);
  }

  /**
   * @returns {Promise<ResponseHighlightElement>}
   */
  async function xmlFixture() {
    return fixture(`<response-highlight lang="xml"></response-highlight>`);
  }

  /**
   * @returns {Promise<ResponseHighlightElement>}
   */
  async function fullFixture() {
    return fixture(`<response-highlight lang="json" code='{"test": true}'></response-highlight>`);
  }

  /**
   * @returns {Promise<ResponseHighlightElement>}
   */
  async function jsonNpFixture() {
    const code = `)]}',\n{"test": true}`;
    return fixture(html`<response-highlight lang="json" code=${code}></response-highlight>`);
  }

  const CRLF = /\r\n/g;
  function normalizeString(str) {
    return str.replace(CRLF, '\n');
  }

  describe('settings code before initialization', () => {
    it('renders the code in the output', async () => {
      const element = await fixture(`<response-highlight code='{"test":true}' lang="json"></response-highlight>`);
      await aTimeout(0);
      const out = element[outputElement];
      const txt = out.textContent;
      assert.equal(txt, '{\n  "test": true\n}');
    });
  });

  describe('Parsing', () => {
    beforeEach(() => {
      // @ts-ignore
      Prism.plugins.matchBraces.resetIndex();
    });
    
    it('Parses XML', async () => {
      const element = await xmlFixture();
      const code = '<Person>true</Person>';
      element.code = code;
      await aTimeout(0);
      let compare = '<code class="language-"  id="output">';
      compare += '<span class="token tag"><span class="token tag">';
      compare += '<span class="token punctuation">&lt;</span>Person</span>';
      compare += '<span class="token punctuation">&gt;</span></span>true';
      compare += '<span class="token tag"><span class="token tag">';
      compare += '<span class="token punctuation">&lt;/</span>';
      compare += 'Person</span><span class="token punctuation">&gt;</span></span>';
      compare += '</code>';
      assert.dom.equal(element[outputElement], compare, { ignoreAttributes: ['aria-label'] });
    });

    it('renders predefined json', async () => {
      const element = await fullFixture();
      await aTimeout(0);
      const compare =
        '<code class="language- toggle-padding" id="output">' + 
        '<span class="toggle-target opened" title="Toggle visibility" aria-label="Activate to toggle visibility of the lines"></span>' + 
        '<span class="token punctuation brace-curly brace-open brace-level-1" id="pair-0-close" data-open="pair-0-open">{</span>' + 
        '<span class="token property">"test"</span><span class="token operator">:</span> <span class="token boolean">true</span>' + 
        '<span class="token punctuation brace-curly brace-close brace-level-1" id="pair-0-open" data-close="pair-0-close">}</span>' +
        '</code>';
      assert.dom.equal(element[outputElement], compare, { ignoreAttributes: ['aria-label'] });
    });
  });

  describe('Anchors handling', () => {
    let element = /** @type ResponseHighlightElement */ (null);
    let code = '# Test highlight\nHello world!\n';
    code += '[link](https://domain.com/)';

    before(async () => {
      element = await markdownFixture();
      element.code = code;
      await aTimeout(0);
    });

    it('Dispatches url-change-action custom event', (done) => {
      const anchor = element[outputElement].querySelector('a');
      element.addEventListener(WorkspaceEventTypes.appendRequest, function clb(e) {
        element.removeEventListener(WorkspaceEventTypes.appendRequest, clb);
        // @ts-ignore
        assert.equal(normalizeString(e.detail.request.url), 'https://domain.com/');
        done();
      });
      anchor.click();
    });
  });

  describe('[detectLang]()', () => {
    let element = /** @type ResponseHighlightElement */ (null);
    beforeEach(async () => {
      element = await markdownFixture();
    });

    it('returns JS grammar when no lang', () => {
      /* global Prism */
      const result = element[detectLang]('{}', undefined);
      // @ts-ignore
      assert.isTrue(result === Prism.languages.javascript);
    });

    it('returns Markup grammar when no lang', () => {
      const result = element[detectLang]('<html>', undefined);
      // @ts-ignore
      assert.isTrue(result === Prism.languages.markup);
    });

    ['js', 'esm', 'mj'].forEach((item) => {
      it(`returns JS grammar for ${item}`, () => {
        const result = element[detectLang]('{}', item);
        // @ts-ignore
        assert.isTrue(result === Prism.languages.javascript);
      });
    });

    ['c'].forEach((item) => {
      it(`returns C grammar for ${item}`, () => {
        const result = element[detectLang]('{}', item);
        // @ts-ignore
        assert.isTrue(result === Prism.languages.clike);
      });
    });

    it('returns default grammar', () => {
      const result = element[detectLang]('<html>', 'test');
      // @ts-ignore
      assert.isTrue(result === Prism.languages.markup);
    });
  });

  describe('[contentTypeToLang]()', () => {
    let element = /** @type ResponseHighlightElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
    });

    [
      ['text/html', 'html'],
      ['application/json', 'json'],
      ['application/x-json', 'json'],
      ['application/javascript', 'javascript'],
      ['application/markdown', 'markdown'],
      ['application/svg', 'svg'],
      ['image/svg+xml', 'svg'],
      ['application/xml+svg', 'svg'],
      ['application/xml', 'xml'],
      ['text/xml', 'xml'],
      ['default', 'default'],
    ].forEach(([contentType, lang]) => {
      it(`returns ${lang} for ${contentType}`, () => {
        const result = element[contentTypeToLang](contentType);
        assert.equal(result, lang);
      });
    });
  });

  describe('#active', () => {
    let element = /** @type ResponseHighlightElement */ (null);
    beforeEach(async () => {
      element = await fullFixture();
      await aTimeout(0);
    });

    it('sets [pendingViewUpdate] property when not active', () => {
      assert.isTrue(element[pendingViewUpdate]);
    });

    it('clears the [pendingViewUpdate] property when active is set', () => {
      element.active = true;
      assert.isFalse(element[pendingViewUpdate]);
    });

    it('calls the resize function on the Prism plugin', () => {
      // @ts-ignore
      const spy = sinon.spy(Prism.plugins.lineNumbers, 'resize');
      element.active = true;
      // @ts-ignore
      Prism.plugins.lineNumbers.resize.restore();
      assert.isTrue(spy.called);
    });

    it('does nothing whet setting false', () => {
      element.active = true;
      element[pendingViewUpdate] = false;
      // @ts-ignore
      const spy = sinon.spy(Prism.plugins.lineNumbers, 'resize');
      element.active = false;
      // @ts-ignore
      Prism.plugins.lineNumbers.resize.restore();
      assert.isFalse(spy.called);
    });
  });

  describe('format()', () => {
    let element = /** @type ResponseHighlightElement */ (null);
    beforeEach(async () => {
      element = await fullFixture();
      await aTimeout(0);
    });

    it('formats the JSON output', () => {
      element.format();
      const text = element[outputElement].innerText.trim();
      assert.equal(text, '{\n  "test": true\n}');
    });

    it('does nothing for unsupported type', async () => {
      element.lang = 'application/xml';
      await aTimeout(0);
      element.format();
      const text = element[outputElement].innerText.trim();
      assert.equal(text, '{"test": true}');
    });
  });

  describe('Context menu', () => {
    let element = /** @type ResponseHighlightElement */ (null);
    beforeEach(async () => {
      element = await fullFixture();
      await aTimeout(0);
    });

    it('dispatches the event when context menu triggered', () => {
      const spy = sinon.spy();
      element.addEventListener(UiEventTypes.contextMenu, spy);
      const node = element.shadowRoot.querySelector('.parsed-content');
      node.dispatchEvent(new MouseEvent('contextmenu', { clientX: 100, clientY: 100 }));
      assert.isTrue(spy.calledOnce);
    });

    it('he event has the detail properties', () => {
      const spy = sinon.spy();
      element.addEventListener(UiEventTypes.contextMenu, spy);
      const node = element.shadowRoot.querySelector('.parsed-content');
      node.dispatchEvent(new MouseEvent('contextmenu', { clientX: 100, clientY: 100 }));
      const { detail } = spy.args[0][0];
      assert.ok(detail.mouseEvent, 'has the original event');
      assert.equal(detail.selector, 'response-highlighter', 'has the "selector" property');
      assert.isTrue(detail.target === element, 'has the "target" property');
    });
  });

  describe('JSON NP parsing', () => {
    beforeEach(() => {
      // @ts-ignore
      Prism.plugins.matchBraces.resetIndex();
    });
    
    it('renders json without the JSON vulnerability fix', async () => {
      const element = await jsonNpFixture();
      await aTimeout(0);
      const compare =
        '<code class="language- toggle-padding" id="output">' + 
        '<span class="toggle-target opened" title="Toggle visibility" aria-label="Activate to toggle visibility of the lines"></span>' + 
        '<span class="token punctuation brace-curly brace-open brace-level-1" id="pair-0-close" data-open="pair-0-open">{</span>' + 
        '<span class="token property">"test"</span><span class="token operator">:</span> <span class="token boolean">true</span>' + 
        '<span class="token punctuation brace-curly brace-close brace-level-1" id="pair-0-open" data-close="pair-0-close">}</span>' +
        '</code>';
      assert.dom.equal(element[outputElement], compare, { ignoreAttributes: ['aria-label'] });
    });
  });
});
