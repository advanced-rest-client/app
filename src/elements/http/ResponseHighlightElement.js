/* eslint-disable lit-a11y/click-events-have-key-events */
/* eslint-disable class-methods-use-this */
/**
@license
Copyright 2018 The Advanced REST Client authors
Licensed under the Apache License, Version 2.0 (the "License"); you may not
use this file except in compliance with the License. You may obtain a copy of
the License at
http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
License for the specific language governing permissions and limitations under
the License.
*/
import { LitElement, html } from 'lit-element';
import { classMap } from 'lit-html/directives/class-map.js';
import { WorkspaceEvents, UiEvents } from '@advanced-rest-client/events';
import 'prismjs/prism.js';
import 'prismjs/components/prism-json.js';
import 'prismjs/components/prism-javascript.js';
import 'prismjs/components/prism-markdown.js';
import 'prismjs/components/prism-markup.js';
import 'prismjs/components/prism-yaml.js';
import 'prismjs/components/prism-xml-doc.js';
import 'prismjs/plugins/autolinker/prism-autolinker.js';
import '../../lib/PrismMatchBraces.js';
import '../../lib/PrismFolding.js';
import '../../lib/PrismLineNumbers.js';
import prismStyles from '../styles/Prism.styles.js';
import elementStyles from '../styles/Highlight.styles.js';
import {
  codeValue,
  outputElement,
  highlightResults,
  contentTypeValue,
  highlightResponse,
  highlightDebounce,
  tokenize,
  detectLang,
  contentTypeToLang,
  responseClickHandler,
  pendingViewUpdate,
  activeValue,
  contextMenuHandler,
  formatJson,
} from './internals.js';

/* global Prism */

/**
 * Response syntax highlighting via Prism
 *
 */
export default class ResponseHighlightElement extends LitElement {
  get styles() {
    return [prismStyles, elementStyles];
  }

  render() {
    const classes = {
      'line-numbers': this.lines,
    }
    return html`
    <style>${this.styles}</style>
    <pre class="parsed-content match-braces ${classMap(classes)}" @contextmenu="${this[contextMenuHandler]}">
      <code id="output" class="language-" @click="${this[responseClickHandler]}"></code>
    </pre>
    `;
  }

  static get properties() {
    return {
      /**
       * Body to be rendered
       */
      code: { type: String },
      /**
       * Prism supported language.
       */
      lang: { type: String },
      /** 
       * Whether or not to add lines counter.
       */
      lines: { type: Boolean },
      /** 
       * Whether the view is currently being rendered or not.
       * When the view is active (in the DOM) but not rendered the 
       * line numbers won't be computed properly because they are not rendered.
       * By changing this status (from `false` to `true`) the element will force
       * line numbers recalculation.
       * 
       * It may always stay not set or false, in which case it has no effect,.
       */
      active: { type: Boolean, }
    };
  }

  get code() {
    return this[codeValue];
  }

  set code(value) {
    const old = this[codeValue];
    /* istanbul ignore if */
    if (old === value) {
      return;
    }
    this.reset();
    this[codeValue] = value;
    this[highlightResponse]();
  }

  /**
   * @returns {string}
   */
  get lang() {
    return this[contentTypeValue];
  }

  set lang(value) {
    const old = this[contentTypeValue];
    /* istanbul ignore if */
    if (old === value) {
      return;
    }
    this[contentTypeValue] = value;
    this[highlightResponse]();
  }

  get active() {
    return this[activeValue];
  }

  set active(value) {
    const old = this[activeValue];
    /* istanbul ignore if */
    if (old === value) {
      return;
    }
    this[activeValue] = value;
    if (value && this[pendingViewUpdate]) {
      this[pendingViewUpdate] = false;
      const out = this[outputElement];
      if (out) {
        Prism.plugins.lineNumbers.resize(out.parentElement);
      }
    }
  }

  get [outputElement]() {
    return this.shadowRoot.querySelector('code');
  }

  constructor() {
    super();
    this.lines = false;
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    Prism.plugins.codeFolding.removeListeners(this[outputElement]);
  }

  firstUpdated() {
    /* istanbul ignore if */
    if (this[highlightResults]) {
      this[outputElement].innerHTML += this[highlightResults];
      this[highlightResults] = undefined;
    }
  }

  /**
   * Resets the state of the renderer to the initial state.
   */
  reset() {
    const node = this[outputElement];
    if (node) {
      node.innerHTML = '';
    }
  }

  /**
   * When supported it formats the current output.
   */
  format() {
    const { code, lang } = this;
    if (!code || typeof code !== 'string' || !lang) {
      return;
    }
    if (lang.includes('json')) {
      this[formatJson](code);
    }
  }
  
  /**
   * Highligh the code.
   */
  [highlightResponse]() {
    const { code, lang } = this;
    if (!code || !lang) {
      return;
    }
    this.reset();
    if (this[highlightDebounce]) {
      return;
    }
    this[highlightDebounce] = true;
    setTimeout(() => {
      this[highlightDebounce] = false;
      this[tokenize](this.code, this.lang);
    });
  }

  /**
   * Runs the prism tokenization and writes results into the renderer.
   * @param {string} code The code to tokenize
   * @param {string} lang Code's content type.
   */
  [tokenize](code, lang) {
    const element = this[outputElement];
    if (element) {
      element.innerHTML = '';
      if (Prism.plugins.codeFolding) {
        Prism.plugins.codeFolding.removeListeners(element);
      }
    }
    let body = code;
    if ((lang || '').includes('json')) {
      try {
        body = this.cleanJsonNp(body);
        const parsed = JSON.parse(body);
        body = JSON.stringify(parsed, null, 2);
      } catch (e) {
        // ...
      }
    }
    const grammar = this[detectLang](body, lang);
    const env = {
      code: body,
      grammar,
      language: lang,
      element,
    };
    // @ts-ignore
    Prism.hooks.run('before-highlight', env);
    // @ts-ignore
    const result = Prism.highlight(body, grammar, lang);
    /* istanbul ignore else */
    if (element) {
      element.innerHTML += result;
    } else {
      if (!this[highlightResults]) {
        this[highlightResults] = '';
      }
      this[highlightResults] += result;
    }
    // @ts-ignore
    Prism.hooks.run('complete', env);
    if (!this.active) {
      this[pendingViewUpdate] = true;
    }
  }

  /**
   * Handler for click events.
   * It dispatches `url-change-action` custom event when a link is clicked.
   *
   * @param {PointerEvent} e
   */
  [responseClickHandler](e) {
    const node = /** @type HTMLAnchorElement */ (e.target);
    if (node.nodeName !== 'A') {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    const url = node.href;
    WorkspaceEvents.appendRequest(this, {
      url,
      method: 'GET',
    });
  }

  /**
   * Picks a Prism formatter based on the `lang` hint and `code`.
   *
   * @param {string} code The source being highlighted.
   * @param {string=} lang A language hint (e.g. ````LANG`).
   * @returns {object}
   */
  [detectLang](code, lang) {
    if (!lang) {
      // Stupid simple detection if we have no lang, courtesy of:
      // https://github.com/robdodson/mark-down/blob/ac2eaa/mark-down.html#L93-101
      // @ts-ignore
      return code.match(/^\s*</) ? Prism.languages.markup : Prism.languages.javascript;
    }
    const mapped = this[contentTypeToLang](lang);
    // @ts-ignore
    if (Prism.languages[mapped]) {
      // @ts-ignore
      return Prism.languages[mapped];
    }
    switch (lang.substr(0, 2)) {
      case 'js':
      case 'es':
      case 'mj':
        // @ts-ignore
        return Prism.languages.javascript;
      case 'c':
        // @ts-ignore
        return Prism.languages.clike;
      default:
        // The assumption is that you're mostly documenting HTML when in HTML.
        // @ts-ignore
        return Prism.languages.markup;
    }
  }

  /**
   * Maps popular content type values to a Prism language.
   * @param {string} type Response content type
   * @returns {string} The same content type or language name if found mapping.
   */
  [contentTypeToLang](type) {
    switch (type) {
      case 'text/html': return 'html';
      case 'application/json':
      case 'application/x-json': return 'json';
      case 'application/javascript': return 'javascript';
      case 'application/markdown': return 'markdown';
      case 'application/svg':
      case 'image/svg+xml':
      case 'application/xml+svg': return 'svg';
      case 'application/xml':
      case 'text/xml': return 'xml';
      default: return type;
    }
  }

  /**
   * Handles the `contextmenu` event and dispatches internal event to be handled by the hosting application.
   * @param {MouseEvent} e 
   */
  [contextMenuHandler](e) {
    const selection = window.getSelection();
    if (selection.type === 'Range') {
      return;
    }
    const { code, lang } = this;
    UiEvents.contextMenu(this, {
      mouseEvent: e,
      selector: 'response-highlighter',
      target: this,
      args: {
        code, lang,
      },
    });
  }

  /**
   * Formats the current code as JSON string and re-renders the view.
   * @param {string} code
   */
  [formatJson](code = '') {
    const value = this.cleanJsonNp(code);
    try {
      const parsed = JSON.parse(value);
      const formatted = JSON.stringify(parsed, null, 2);
      const { lang } = this;
      this[tokenize](formatted, lang);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    }
  }

  /**
   * Removes the `)]}',\n` from the code.
   * @param {string} code
   * @returns {string}
   */
  cleanJsonNp(code = '') {
    let value = code.trim();
    // https://github.com/advanced-rest-client/arc-electron/issues/197
    if (value.startsWith(')]}\',')) {
      value = value.substr(5);
    }
    value = value.trim();
    return value;
  }
}
