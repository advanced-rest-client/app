/* eslint-disable lit-a11y/click-events-have-key-events */
/**
@license
Copyright 2018 The Advanced REST client authors <arc@mulesoft.com>
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
import { styleMap } from 'lit-html/directives/style-map.js';
import { ValidatableMixin, EventsTargetMixin } from '@anypoint-web-components/awc';
import '@advanced-rest-client/icons/arc-icon.js';
import '@anypoint-web-components/awc/anypoint-icon-button.js';
import '@anypoint-web-components/awc/anypoint-button.js';
import '@anypoint-web-components/awc/anypoint-input.js';
import '@anypoint-web-components/awc/anypoint-dropdown.js';
import '@anypoint-web-components/awc/anypoint-item.js';
import '@anypoint-web-components/awc/anypoint-item-body.js';
import '@anypoint-web-components/awc/anypoint-listbox.js';
import '@anypoint-web-components/awc/anypoint-collapse.js';
import { TelemetryEvents, RequestEvents, RequestEventTypes, ArcModelEvents, ArcModelEventTypes } from '@advanced-rest-client/events';
import classStyles from '../styles/UrlInputEditor.styles.js';
import { UrlParser } from '../../lib/UrlParser.js';
import '../../../define/url-params-editor.js';
import { encodeQueryString, decodeQueryString, cancelEvent, sortUrls } from '../../lib/Utils.js';
import {
  readAutocomplete,
  focusedValue,
  overlayOpenedValue,
  toggleSuggestions,
  shadowContainerOpened,
  shadowContainerHeight,
  paramsEditorTemplate,
  mainInputTemplate,
  shadowTemplate,
  urlAutocompleteTemplate,
  paramsResizeHandler,
  paramsClosedHandler,
  paramsOpenedHandler,
  inputHandler,
  toggleHandler,
  valueValue,
  notifyChange,
  extValueChangeHandler,
  keyDownHandler,
  decodeEncode,
  dispatchAnalyticsEvent,
  processUrlParams,
  autocompleteResizeHandler,
  setShadowHeight,
  mainFocusBlurHandler,
  autocompleteOpened,
  suggestionsValue,
  renderedSuggestions,
  suggestionsListTemplate,
  suggestionItemTemplate,
  previousValue,
  filterSuggestions,
  suggestionHandler,
  setSuggestionsWidth,
  autocompleteClosedHandler,
  suggestionsList,
  removeSuggestionHandler,
  clearSuggestionsHandler,
  urlHistoryDeletedHandler,
  urlHistoryDestroyedHandler,
} from './internals.js';

/* eslint-disable no-param-reassign */
/* eslint-disable no-plusplus */
/* eslint-disable no-continue */
/* eslint-disable class-methods-use-this */

/** @typedef {import('lit-element').TemplateResult} TemplateResult */
/** @typedef {import('@anypoint-web-components/awc').AnypointInputElement} AnypointInput */
/** @typedef {import('@anypoint-web-components/awc').AnypointListboxElement} AnypointListbox */
/** @typedef {import('@advanced-rest-client/events').RequestChangeEvent} RequestChangeEvent */
/** @typedef {import('@advanced-rest-client/events').ARCHistoryUrlDeletedEvent} ARCHistoryUrlDeletedEvent */
/** @typedef {import('@advanced-rest-client/events').ARCModelStateDeleteEvent} ARCModelStateDeleteEvent */
/** @typedef {import('@advanced-rest-client/events').UrlHistory.ARCUrlHistory} ARCUrlHistory */
/** @typedef {import('./UrlParamsEditorElement').UrlParamsEditorElement} UrlParamsEditorElement */

/**
 * The request URL editor
 *
 * The element renders an editor for a HTTP request editor.
 */
export default class UrlInputEditorElement extends EventsTargetMixin(ValidatableMixin(LitElement)) {
  static get styles() {
    return classStyles;
  }

  static get properties() {
    return {
      /**
       * Enables outlined theme.
       */
      outlined: { type: Boolean },
      /**
       * Enables compatibility with Anypoint components.
       */
      compatibility: { type: Boolean },
      /**  
       * The current URL value.
       */
      value: { type: String },
      /**
       * True if detailed editor is opened.
       */
      detailsOpened: { type: Boolean },
      /**
       * Default protocol for the URL if it's missing.
       */
      defaultProtocol: { type: String },
      /**
       * When set the editor is in read only mode.
       */
      readOnly: { type: Boolean },
    };
  }

  get value() {
    return this[valueValue];
  }

  set value(value) {
    const old = this[valueValue];
    if (old === value) {
      return;
    }
    this[valueValue] = value;
    this.requestUpdate('value', old);
    this.dispatchEvent(new CustomEvent('change'));
  }

  /**
   * @returns {any} An icon name for the main input suffix icon
   */
  get inputIcon() {
    const { detailsOpened } = this;
    return detailsOpened ? 'close' : 'edit';
  }

  /**
   * @returns {string} A title for the main input suffix icon
   */
  get inputIconTitle() {
    const { detailsOpened } = this;
    return detailsOpened ? 'Close parameters editor' : 'Open parameters editor';
  }

  /**
   * @returns {AnypointListbox}
   */
  get [suggestionsList]() {
    const node = /** @type AnypointListbox */ (this.shadowRoot.querySelector('.url-autocomplete anypoint-listbox'));
    return node;
  }

  constructor() {
    super();
    this[extValueChangeHandler] = this[extValueChangeHandler].bind(this);
    this[keyDownHandler] = this[keyDownHandler].bind(this);
    this[urlHistoryDeletedHandler] = this[urlHistoryDeletedHandler].bind(this);
    this[urlHistoryDestroyedHandler] = this[urlHistoryDestroyedHandler].bind(this);

    this.defaultProtocol = 'http';
    this.value = 'http://';

    this.compatibility = false;
    this.readOnly = false;
    this.outlined = false;
    this[autocompleteOpened] = false;

    this[suggestionsValue] = /** @type ARCUrlHistory[] */ (undefined);
    this[renderedSuggestions] = /** @type ARCUrlHistory[] */ (undefined);
  }

  /**
   * @param {EventTarget} node
   */
  _attachListeners(node) {
    node.addEventListener(RequestEventTypes.State.urlChange, this[extValueChangeHandler]);
    node.addEventListener(ArcModelEventTypes.UrlHistory.State.delete, this[urlHistoryDeletedHandler]);
    node.addEventListener(ArcModelEventTypes.destroyed, this[urlHistoryDestroyedHandler]);
    this.addEventListener('keydown', this[keyDownHandler]);
  }

  /**
   * @param {EventTarget} node
   */
  _detachListeners(node) {
    node.removeEventListener(RequestEventTypes.State.urlChange, this[extValueChangeHandler]);
    node.removeEventListener(ArcModelEventTypes.UrlHistory.State.delete, this[urlHistoryDeletedHandler]);
    node.removeEventListener(ArcModelEventTypes.destroyed, this[urlHistoryDestroyedHandler]);
    this.removeEventListener('keydown', this[keyDownHandler]);
  }

  /**
   * A handler that is called on input
   */
  [notifyChange]() {
    RequestEvents.State.urlChange(this, this.value);
  }

  /**
   * A handler for the `url-value-changed` event.
   * If this element is not the source of the event then it will update the `value` property.
   * It's to be used besides the Polymer's data binding system.
   *
   * @param {RequestChangeEvent} e
   */
  [extValueChangeHandler](e) {
    if (e.composedPath()[0] === this || this.readOnly) {
      return;
    }
    const { changedProperty, changedValue } = e;
    if (changedProperty === 'url' && changedValue !== this.value) {
      this.value = changedValue;
    }
  }

  /**
   * Opens detailed view.
   */
  toggle() {
    this.detailsOpened = !this.detailsOpened;
    this.dispatchEvent(new CustomEvent('detailsopened'));
  }

  /**
   * HTTP encode query parameters
   */
  encodeParameters() {
    if (this.readOnly) {
      return;
    }
    this[decodeEncode]('encode');
    this[dispatchAnalyticsEvent]('Encode parameters');
  }

  /**
   * HTTP decode query parameters
   */
  decodeParameters() {
    if (this.readOnly) {
      return;
    }
    this[decodeEncode]('decode');
    this[dispatchAnalyticsEvent]('Decode parameters');
  }

  /**
   * Dispatches analytics event with "event" type.
   * @param {String} label A label to use with GA event
   */
  [dispatchAnalyticsEvent](label) {
    const init = {
      category: 'Request view',
      action: 'URL editor',
      label,
    }
    TelemetryEvents.event(this, init);
  }

  /**
   * HTTP encode or decode query parameters depending on [type].
   *
   * @param {string} type
   */
  [decodeEncode](type) {
    const url = this.value;
    if (!url) {
      return;
    }
    const parser = new UrlParser(url);
    this[processUrlParams](parser, type);
    this.value = parser.value;
    this[notifyChange]();
  }


  /**
   * Processes query parameters and path value by `processFn`.
   * The function has to be available on this instance.
   * @param {UrlParser} parser Instance of UrlParser
   * @param {string} processFn Function name to call on each parameter
   */
  [processUrlParams](parser, processFn) {
    const decoded = parser.searchParams.map((item) => {
      let key;
      let value;
      if (processFn === 'encode') {
        key = encodeQueryString(item[0], true);
        value = encodeQueryString(item[1], true);
      } else {
        key = decodeQueryString(item[0], true);
        value = decodeQueryString(item[1], true);
      }
      return [key, value];
    });
    parser.searchParams = decoded;
    const { path } = parser;
    if (path && path.length) {
      const parts = path.split('/');
      let tmp = '/';
      for (let i = 0, len = parts.length; i < len; i++) {
        let part = parts[i];
        if (!part) {
          continue;
        }
        if (processFn === 'encode') {
          part = encodeQueryString(part, false);
        } else {
          part = decodeQueryString(part, false);
        }
        tmp += part;
        if (i + 1 !== len) {
          tmp += '/';
        }
      }
      parser.path = tmp;
    }
  }

  /**
   * Queries the data model for history data and sets the suggestions
   * @param {string} q User query from the input field
   * @return {Promise<void>}
   */
  async [readAutocomplete](q) {
    try {
      this[suggestionsValue] = /** @type ARCUrlHistory[] */ (await ArcModelEvents.UrlHistory.query(this, q));
    } catch (e) {
      this[suggestionsValue] = /** @type ARCUrlHistory[] */ (undefined);
    }
  }

  /**
   * @param {KeyboardEvent} e
   */
  [keyDownHandler](e) {
    const target = /** @type HTMLElement */ (e.composedPath()[0]);
    if (!target || target.nodeName !== 'INPUT') {
      return;
    }
    if (!this[autocompleteOpened] && ['Enter', 'NumpadEnter'].includes(e.code)) {
      RequestEvents.send(this);
    } else if (this[autocompleteOpened] && target.classList.contains('main-input')) {
      const { code } = e;
      if (code === 'ArrowUp') {
        e.preventDefault();
        this[suggestionsList].highlightPrevious();
      } else if (code === 'ArrowDown') {
        e.preventDefault();
        this[suggestionsList].highlightNext();
      } else if (['Enter', 'NumpadEnter'].includes(code)) {
        e.preventDefault();
        const node = this[suggestionsList];
        const { highlightedItem } = node;
        if (!highlightedItem) {
          RequestEvents.send(this);
          this[toggleSuggestions](false);
        } else {
          const index = node.indexOf(highlightedItem);
          node.select(index);
        }
      }
    }
  }

  /**
   * Validates the element.
   * @return {boolean}
   */
  _getValidity() {
    if (this.detailsOpened) {
      const element = /** @type UrlParamsEditorElement */ (this.shadowRoot.querySelector('url-params-editor'));
      return element.validate(this.value);
    }
    const element = /** @type HTMLInputElement */ (this.shadowRoot.querySelector('.main-input'));
    return element.validity.valid;
  }

  /**
   * @param {Event} e A handler for either main input or the details editor value change
   */
  [inputHandler](e) {
    if (this.readOnly) {
      return;
    }
    const node = /** @type HTMLInputElement */ (e.target);
    this[previousValue] = this.value;
    this.value = node.value;
    this[notifyChange]();
    if (node.classList.contains('main-input')) {
      this.renderSuggestions();
    }
  }

  /**
   * @param {PointerEvent} e
   */
  [toggleHandler](e) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    this.toggle();
  }

  /**
   * @param {Event} e
   */
  [mainFocusBlurHandler](e) {
    this[focusedValue] = e.type === 'focus';
    this.requestUpdate();
    if (this[focusedValue] && !this[autocompleteOpened] && !this.detailsOpened) {
      this.renderSuggestions();
    }
  }

  /**
   * Triggers URL suggestions rendering.
   * If there are suggestions to render this will enable the dropdown.
   */
  async renderSuggestions() {
    const { value='' } = this;
    if (this[previousValue] && value.startsWith(this[previousValue])) {
      this[filterSuggestions]();
      return;
    }
    await this[readAutocomplete](value);
    this[filterSuggestions](); 
  }

  /**
   * Performs the query on the current suggestions and, if any, renders them.
   */
  async [filterSuggestions]() {
    const items = this[suggestionsValue];
    if (!Array.isArray(items) || !items.length) {
      this[toggleSuggestions](false);
      return;
    }
    const { value='' } = this;
    const query = String(value).toLowerCase();
    const rendered = items.filter(i => i.url.toLowerCase().includes(query));
    if (!rendered.length) {
      this[toggleSuggestions](false);
      return;
    }
    if (rendered.length === 1 && rendered[0].url.toLowerCase() === query) {
      this[toggleSuggestions](false);
      return;
    }
    sortUrls(rendered, query);
    this[renderedSuggestions] = rendered;
    this[toggleSuggestions](true);
    await this.requestUpdate();
    const node = this.shadowRoot.querySelector('anypoint-dropdown');
    node.refit();
    node.notifyResize();
    this[setSuggestionsWidth]();
  }

  /**
   * @param {boolean} opened
   */
  [toggleSuggestions](opened) {
    if (!opened) {
      const element = /** @type HTMLInputElement */ (this.shadowRoot.querySelector('.main-input'));
      element.focus();
    }
    if (this[overlayOpenedValue] !== opened) {
      this[overlayOpenedValue] = opened;
      this[autocompleteOpened] = opened;
      this.requestUpdate();
    }
    if (!opened && this[shadowContainerOpened]) {
      this[shadowContainerOpened] = false;
      this[shadowContainerHeight] = 0;
      this.requestUpdate();
    }
  }

  [autocompleteResizeHandler]() {
    if (!this[overlayOpenedValue]) {
      return;
    }
    const node = this.shadowRoot.querySelector('.url-autocomplete');
    const input = this.shadowRoot.querySelector('.input-wrapper');
    const rect1 = node.getBoundingClientRect();
    const rect2 = input.getBoundingClientRect();
    const total = rect1.height + rect2.height;
    if (!total) {
      return;
    }
    this[setShadowHeight](total);
  }

  /**
   * @param {Event} e 
   */
  [suggestionHandler](e) {
    const list = /** @type AnypointListbox */ (e.target);
    const { selected } = list;
    list.selected = undefined;
    if (selected === -1 || selected === null || selected === undefined) {
      return;
    }
    const item = this[renderedSuggestions][selected];
    if (!item) {
      return;
    }
    this.value = item.url;
    this[toggleSuggestions](false);
    this[notifyChange]();
  }

  /**
   * Sets the width of the suggestions container so it renders
   * the URL suggestions in the full width of the input container.
   */
  [setSuggestionsWidth]() {
    const rect = this.getBoundingClientRect();
    const { width } = rect;
    if (!width) {
      return;
    }
    this[suggestionsList].style.width = `${width}px`;
  }

  /**
   * A handler for the close event dispatched by the suggestions drop down.
   * Closes the suggestions (sets the state) and cancels the event.
   * @param {Event} e 
   */
  [autocompleteClosedHandler](e) {
    cancelEvent(e);
    this[toggleSuggestions](false);
  }

  /**
   * Sets a height on the shadow background element.
   * @param {number} height
   */
  [setShadowHeight](height) {
    this[shadowContainerHeight] = height;
    this[shadowContainerOpened] = true;
    this.requestUpdate();
  }

  /**
   * @param {Event} e 
   */
  [paramsOpenedHandler](e) {
    cancelEvent(e);
    const node = /** @type UrlParamsEditorElement */ (e.target);
    requestAnimationFrame(() => {
      if (!this.detailsOpened) {
        return;
      }
      const input = this.shadowRoot.querySelector('.input-wrapper');
      const rect1 = node.getBoundingClientRect();
      const rect2 = input.getBoundingClientRect();
      const total = rect1.height + rect2.height;
      if (!total) {
        return;
      }
      this[overlayOpenedValue] = true;
      this[setShadowHeight](total);
    });
  }

  /**
   * @param {Event} e 
   */
  [paramsClosedHandler](e) {
    cancelEvent(e);
    this[overlayOpenedValue] = false;
    this[shadowContainerOpened] = false;
    this[shadowContainerHeight] = 0;
    this.detailsOpened = false;
    this.requestUpdate();
  }

  /**
   * @param {Event} e 
   */
  async [paramsResizeHandler](e) {
    if (this.detailsOpened) {
      this[paramsOpenedHandler](e);
    }
  }

  /**
   * Removes the rendered suggestion from the store and from the currently rendered list.
   * @param {Event} e 
   */
  async [removeSuggestionHandler](e) {
    e.preventDefault();
    e.stopPropagation();
    const node = /** @type HTMLElement */ (e.target);
    const { id } = node.dataset;
    if (!id) {
      return;
    }
    await ArcModelEvents.UrlHistory.delete(this, id);
  }

  /**
   * Removes all stored history URLs.
   * @param {Event} e 
   */
  async [clearSuggestionsHandler](e) {
    e.preventDefault();
    e.stopPropagation();
    await ArcModelEvents.destroy(this, ['url-history']);
  }

  /**
   * @param {ARCHistoryUrlDeletedEvent} e 
   */
  [urlHistoryDeletedHandler](e) {
    const { id } = e;
    const items = /** @type ARCUrlHistory[] */ (this[suggestionsValue]);
    if (!Array.isArray(items)) {
      return;
    }
    const index = items.findIndex(i => i._id === id);
    items.splice(index, 1);
    if (this[autocompleteOpened]) {
      this[filterSuggestions]();
    }
  }

  /**
   * @param {ARCModelStateDeleteEvent} e 
   */
  [urlHistoryDestroyedHandler](e) {
    const { store } = e;
    if (!['all', 'url-history'].includes(store)) {
      return;
    }
    this[suggestionsValue] = /** @type ARCUrlHistory[] */ (undefined);
    this[renderedSuggestions] = /** @type ARCUrlHistory[] */ (undefined);
    this[toggleSuggestions](false);
  }

  render() {
    const focused = this[focusedValue];
    const overlay = this[overlayOpenedValue];
    const acOpened = this[autocompleteOpened];
    const classes = {
      container: true,
      focused,
      overlay,
      autocomplete: acOpened,
    };
    return html`
    ${this[shadowTemplate]()}
    <div class="${classMap(classes)}">
      ${this[mainInputTemplate]()}  
      ${this[paramsEditorTemplate]()}
    </div>`;
  }

  /**
   * @returns {TemplateResult} A template for the main input element
   */
  [mainInputTemplate]() {
    const { inputIcon, inputIconTitle, value } = this;
    const acOpened = this[autocompleteOpened];
    const iconClasses = {
      'toggle-icon': true,
      disabled: acOpened,
    };
    return html`
    <div class="input-wrapper">
      <input 
        .value="${value}" 
        class="main-input"
        required
        placeholder="Request URL"
        id="mainInput"
        autocomplete="off"
        spellcheck="false"
        @focus="${this[mainFocusBlurHandler]}"
        @blur="${this[mainFocusBlurHandler]}"
        @input="${this[inputHandler]}"
        aria-label="The URL value"
      />
      <arc-icon 
        icon="${inputIcon}"
        title="${inputIconTitle}"
        class="${classMap(iconClasses)}"
        @click="${this[toggleHandler]}"
      ></arc-icon>
    </div>
    ${this[urlAutocompleteTemplate]()}
    `;
  }

  /**
   * @returns {TemplateResult} A template for the autocomplete element
   */
  [urlAutocompleteTemplate]() {
    const { detailsOpened, compatibility } = this;
    let opened = this[autocompleteOpened];
    if (opened && detailsOpened) {
      opened = false;
    }
    if (opened && (!this[renderedSuggestions] || !this[renderedSuggestions].length)) {
      opened = false;
    }
    return html`
    <anypoint-dropdown
      class="url-autocomplete"
      fitPositionTarget
      .positionTarget="${this}"
      verticalAlign="top"
      horizontalAlign="left"
      verticalOffset="45"
      .opened="${opened}"
      noAutofocus
      noCancelOnOutsideClick
      @resize="${this[autocompleteResizeHandler]}"
      @overlay-opened="${cancelEvent}"
      @overlay-closed="${cancelEvent}"
      @iron-overlay-opened="${cancelEvent}"
      @iron-overlay-closed="${cancelEvent}"
      @opened="${cancelEvent}"
      @closed="${this[autocompleteClosedHandler]}"
    >
      <div class="suggestions-container" slot="dropdown-content">
        <anypoint-listbox
          aria-label="Use arrows and enter to select list item. Escape to close the list."
          selectable="anypoint-item"
          useAriaSelected
          @select="${this[suggestionHandler]}"
          ?compatibility="${compatibility}"
        >
          ${this[suggestionsListTemplate]()}
        </anypoint-listbox>
        <p class="clear-all-history">
          <span class="clear-all-history-label" @click="${this[clearSuggestionsHandler]}">Clear all history</span>
        </p>
      </div>
    </anypoint-dropdown>
    `;
  }

  /**
   * @returns {TemplateResult[]|string} The template for the suggestions list.
   */
  [suggestionsListTemplate]() {
    const items = this[renderedSuggestions];
    if (!Array.isArray(items) || !items.length) {
      return '';
    }
    return items.map(i => this[suggestionItemTemplate](i));
  }

  /**
   * @param {ARCUrlHistory} item 
   * @returns {TemplateResult} The template for an URL suggestion item.
   */
  [suggestionItemTemplate](item) {
    const { url, _id } = item;
    // this has a11y rule disabled because we are not planning to make this so complex to use
    // where you can switch between the list context to a button context.
    return html`
    <anypoint-item ?compatibility="${this.compatibility}">
      <div>${url}</div>
      <span 
        class="remove-suggestion" 
        data-id="${_id}" 
        @click="${this[removeSuggestionHandler]}"
      >Remove</span>
    </anypoint-item>`;
  }

  /**
   * @returns {TemplateResult} A template for the background shadow below
   * the main input and the overlays
   */
  [shadowTemplate]() {
    const opened = this[shadowContainerOpened];
    const styles = { height: `0px` };
    if (this[shadowContainerHeight] !== undefined) {
      styles.height = `${this[shadowContainerHeight]}px`
    }
    const classes = {
      'content-shadow': true,
      opened,
    };
    return html`
    <div class="${classMap(classes)}" style=${styleMap(styles)}></div>
    `;
  }

  /**
   * @returns {TemplateResult} A template for query parameters overlay
   */
  [paramsEditorTemplate]() {
    const {
      compatibility,
      readOnly,
      outlined,
      detailsOpened,
      value
    } = this;
    return html`
    <url-params-editor
      class="params-editor"
      fitPositionTarget
      horizontalAlign="left"
      verticalAlign="top"
      .positionTarget="${this}"
      noOverlap
      .value="${value}"
      noCancelOnOutsideClick
      @urlencode="${this.encodeParameters}"
      @urldecode="${this.decodeParameters}"
      @change="${this[inputHandler]}"
      ?compatibility="${compatibility}"
      ?outlined="${outlined}"
      ?readOnly="${readOnly}"
      ?opened="${detailsOpened}"
      @opened="${this[paramsOpenedHandler]}"
      @closed="${this[paramsClosedHandler]}"
      @overlay-closed="${cancelEvent}"
      @overlay-opened="${cancelEvent}"
      @iron-overlay-closed="${cancelEvent}"
      @iron-overlay-opened="${cancelEvent}"
      @resize="${this[paramsResizeHandler]}"
    ></url-params-editor>
    `;
  }
}
