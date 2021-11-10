/* eslint-disable class-methods-use-this */
import { html } from 'lit-html';
import { EventTypes, Events } from '@advanced-rest-client/events'
import { ApplicationScreen } from './ApplicationScreen.js';

/** @typedef {import('lit-html').TemplateResult} TemplateResult */
/** @typedef {import('@advanced-rest-client/events').Search.FindInPageOptions} FindInPageOptions */

export const contentSearchInputHandler = Symbol('contentSearchInputHandler');
export const searchBarSuffixTemplate = Symbol('searchBarSuffixTemplate');
export const keydownHandler = Symbol('keydownHandler');
export const searchResultHandler = Symbol('searchResultHandler');

/**
 * A page that is opened in the Application's search bar.
 * Communicates with the back end via the DOM events.
 */
export class SearchBar extends ApplicationScreen {
  constructor() {
    super();

    this.initObservableProperties(
      'searchBarQuery', 'searchBarCount', 'searchBarOrdinal'
    );
    /** 
     * @type {number}
     */
    this.searchBarCount = undefined;
    /** 
     * @type {number}
     */
    this.searchBarOrdinal = undefined;
    /** 
     * @type {string}
     */
    this.searchBarQuery = undefined;

    this[searchResultHandler] = this[searchResultHandler].bind(this);
  }

  async initialize() {
    this.eventTarget.addEventListener(EventTypes.Search.State.foundInPage, this[searchResultHandler]);
    await this.loadTheme();
    this.render();
  }

  /**
   * @param {CustomEvent} e 
   */
  [searchResultHandler](e) {
    const { matches, activeMatchOrdinal } = e.detail;
    this.searchBarCount = matches;
    this.searchBarOrdinal = activeMatchOrdinal;
  }

  /**
   * @param {Event} e 
   */
  [contentSearchInputHandler](e) {
    const input = /** @type HTMLInputElement */ (e.target);
    const { value } = input;
    this.searchBarQuery = value;
    if (value) {
      Events.Search.find(this.eventTarget, value);
    } else {
      Events.Search.clear(this.eventTarget)
    }
  }

  /**
   * @param {KeyboardEvent} e
   */
   [keydownHandler](e) {
    if (e.code === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      this.close();
    } else if (e.code === 'Enter') {
      this.findNext();
    }
  }

  /**
   * Dispatches the find event to the backend
   */
  findNext() {
    const { searchBarQuery } = this;
    if (!searchBarQuery) {
      return;
    }
    const opts = /** @type FindInPageOptions */ ({
      findNext: true,
      forward: true
    });
    Events.Search.find(this.eventTarget, searchBarQuery, opts);
  }

  /**
   * Dispatches the find event to the backend
   */
  findPrevious() {
    const { searchBarQuery } = this;
    if (!searchBarQuery) {
      return;
    }
    const opts = /** @type FindInPageOptions */ ({
      findNext: true,
      forward: false
    });
    Events.Search.find(this.eventTarget, searchBarQuery, opts);
  }

  close() {
    window.close();
  }

  appTemplate() {
    const { searchBarQuery } = this;
    return html`
    <anypoint-input
      nolabelfloat
      outlined
      @input="${this[contentSearchInputHandler]}"
      @keydown="${this[keydownHandler]}"
    >
      ${this[searchBarSuffixTemplate]()}
      <label slot="label">Search text</label>
    </anypoint-input>
    <div class="controls">
      <anypoint-icon-button
        title="Previous"
        aria-label="Activate to highlight previous result"
        @click="${this.findPrevious}"
        ?disabled="${!searchBarQuery}"
      >
        <arc-icon icon="keyboardArrowUp"></arc-icon>
      </anypoint-icon-button>
      <anypoint-icon-button
        title="Next"
        aria-label="Activate to highlight next result"
        @click="${this.findNext}"
        ?disabled="${!searchBarQuery}"
      >
        <arc-icon icon="keyboardArrowDown"></arc-icon>
      </anypoint-icon-button>
      <anypoint-icon-button
        title="Close"
        aria-label="Activate to close search"
        @click="${this.close}"
      >
        <arc-icon icon="close" class="close-icon"></arc-icon>
      </anypoint-icon-button>
    </div>
    `;
  }

  /**
   * @returns {TemplateResult|string} The template for search bar counters, when has search results
   */
  [searchBarSuffixTemplate]() {
    const { searchBarQuery, searchBarCount=0, searchBarOrdinal=0 } = this;
    if (!searchBarQuery) {
      return '';
    }
    return html`<div slot="suffix" class="counters">${searchBarOrdinal}/${searchBarCount}</div>`;
  }
}
