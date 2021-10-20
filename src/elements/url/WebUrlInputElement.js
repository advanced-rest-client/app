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
import { OverlayMixin } from '@anypoint-web-components/awc';
import '@anypoint-web-components/awc/anypoint-input.js';
import '@anypoint-web-components/awc/anypoint-button.js';
import '@anypoint-web-components/awc/anypoint-autocomplete.js';
import { ArcNavigationEvents, ArcModelEvents } from '@advanced-rest-client/events';
import {
  autocompleteTarget,
  inputTemplate,
  autocompleteTemplate,
  confirmButtonTemplate,
  readAutocomplete,
  autocompleteQueryHandler,
  suggestionsOpenedHandler,
  suggestionsOpenedValue,
  autocompleteRef,
  keyDownHandler,
  enterHandler,
  inputHandler,
  valueValue,
  transitionEndHandler,
  autocompleteOpenedValue,
  autocompleteClosedHandler,
  autocompleteOpenedHandler,
} from './internals.js';
import styles from '../styles/WebUrlInput.styles.js';
import { cancelEvent } from '../../lib/Utils.js';

/** @typedef {import('lit-html').TemplateResult} TemplateResult */
/** @typedef {import('@anypoint-web-components/awc').AnypointAutocompleteElement} AnypointAutocompleteElement */
/** @typedef {import('@anypoint-web-components/awc').AnypointInputElement} AnypointInput */
/** @typedef {import('@anypoint-web-components/awc').AnypointDropdownElement} AnypointDropdown */

/**
 * An element to display a dialog to enter an URL with auto hints
 *
 * ### Example
 *
 * ```html
 * <web-url-input purpose="open-browser"></web-url-input>
 * ```
 */
export default class WebUrlInputElement extends OverlayMixin(LitElement) {
  static get styles() {
    return styles;
  }

  static get properties() {
    return {
      /**  
       * The current URL value.
       */
      value: { type: String },
      /** 
       * True when the suggestions for the URL is opened.
       */
      suggestionsOpened: { type: Boolean },
      /**
       * A value to be set in the detail object of the main action custom event.
       * The editor can server different purposes. Re-set the purpose to inform
       * the application about purpose of the event.
       */
      purpose: { type: String },
      /**
       * Enables compatibility with Anypoint platform
       */
      compatibility: { type: Boolean },
      /**
       * Enables Material Design Outlined inputs
       */
      outlined: { type: Boolean },
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
  }

  get suggestionsOpened() {
    return this[suggestionsOpenedValue];
  }

  set suggestionsOpened(value) {
    const old = this[suggestionsOpenedValue];
    if (old === value) {
      return;
    }
    this[suggestionsOpenedValue] = value;
    this.requestUpdate('suggestionsOpened', old);
  }

  /**
   * @return {AnypointAutocompleteElement}
   */
  get [autocompleteRef]() {
    return this.shadowRoot.querySelector('anypoint-autocomplete');
  }

  /**
   * @returns {boolean} true when the confirm button is rendered disabled
   */
  get confirmDisabled() {
    const { value } = this;
    return !value;
  }

  constructor() {
    super();
    this[keyDownHandler] = this[keyDownHandler].bind(this);
    this[transitionEndHandler] = this[transitionEndHandler].bind(this);
    this.compatibility = false;
    this.outlined = false;
    this.purpose = undefined;
    this[autocompleteOpenedValue] = false;
  }

  connectedCallback() {
    if (super.connectedCallback) {
      super.connectedCallback();
    }
    this.addEventListener('keydown', this[keyDownHandler]);
    this.addEventListener('transitionend', this[transitionEndHandler]);
  }

  disconnectedCallback() {
    if (super.disconnectedCallback) {
      super.disconnectedCallback();
    }
    this.removeEventListener('keydown', this[keyDownHandler]);
    this.removeEventListener('transitionend', this[transitionEndHandler]);
  }

  firstUpdated() {
    this[autocompleteTarget] = /** @type AnypointInput */ (this.shadowRoot.querySelector('.main-input'));
  }

  /**
   * Handler for the query event coming from the autocomplete.
   * It makes the query to the data store for history data.
   * @param {CustomEvent} e
   */
  [autocompleteQueryHandler](e) {
    e.preventDefault();
    e.stopPropagation();
    if (!e.detail.value) {
      const node = /** @type AnypointAutocompleteElement */ (e.target);
      setTimeout(() => {
        node.source = [];
      });
      return;
    }
    this[readAutocomplete](e.detail.value);
  }

  /**
   * Queries the data model for history data and sets the suggestions
   * @param {string} q User query from the input field
   * @return {Promise<void>}
   */
  async [readAutocomplete](q) {
    const ref = this[autocompleteRef];
    try {
      const result = await ArcModelEvents.UrlHistory.query(this, q);
      const suggestions = (result || []).map((item) => item.url);
      ref.source = suggestions;
    } catch (e) {
      ref.source = [];
    }
    await ref.updateComplete;
    const dd = /** @type AnypointDropdown */ (ref.querySelector('anypoint-dropdown'));
    dd.refit();
  }

  /**
   * @param {Event} e 
   */
  [autocompleteOpenedHandler](e) {
    cancelEvent(e);
    this[autocompleteOpenedValue] = true;
  }

  /**
   * @param {Event} e 
   */
  [autocompleteClosedHandler](e) {
    cancelEvent(e);
    this[autocompleteOpenedValue] = false;
  }

  /**
   * A handler for keyboard key down event bubbling through this element.
   * If the target is the input and the key is Enter key then it calls
   * `[enterHandler]()` function
   * @param {KeyboardEvent} e
   */
  [keyDownHandler](e) {
    const target = /** @type HTMLElement */ (e.composedPath()[0]);
    if (target.nodeName !== 'INPUT') {
      return;
    }
    if (['Enter', 'NumpadEnter'].includes(e.code) && !this[autocompleteOpenedValue]) {
      this[enterHandler]();
    }
  }

  /**
   * A handler called when the user press "enter" in any of the form fields.
   * This will send an `open-web-url` event.
   */
  [enterHandler]() {
    if (this.suggestionsOpened) {
      return;
    }
    ArcNavigationEvents.navigateExternal(this, this.value, {
      purpose: this.purpose,
    });
    this.opened = false;
  }

  /**
   * Sets value of the control when input value changes
   * @param {CustomEvent} e
   */
  [inputHandler](e) {
    const input = /** @type AnypointInput */ (e.target);
    this.value = input.value;
    this.dispatchEvent(new CustomEvent('input'));
  }

  /**
   * Overrides from ArcOverlayMixin
   * @param {!Event} e
   */
  _onCaptureEsc(e) {
    if (this.suggestionsOpened) {
      return;
    }
    super._onCaptureEsc(e);
  }

  /**
   * Handler for `opened-changed` event dispatched from the autocomplete.
   * @param {CustomEvent} e
   */
  [suggestionsOpenedHandler](e) {
    this.suggestionsOpened = /** @type AnypointAutocompleteElement */ (e.target).opened;
    this.dispatchEvent(new CustomEvent('suggestionsopenedchange'));
  }

  _renderOpened() {
    this.classList.add('opened');
  }

  _renderClosed() {
    this.classList.remove('opened');
  }

  /**
   * Controls open/close behavior when the transition animations ends
   * @param {TransitionEvent} e
   */
  [transitionEndHandler](e) {
    if (e.propertyName !== 'transform') {
      return;
    }
    if (this.opened) {
      this._finishRenderOpened();
    } else {
      this._finishRenderClosed();
    }
  }

  render() {
    return html`
    <div class="inputs">
      <div class="listbox-wrapper">
        ${this[inputTemplate]()}
        ${this[autocompleteTemplate]()}
      </div>
      ${this[confirmButtonTemplate]()}
    </div>`;
  }

  /**
   * @returns {TemplateResult} Template for the main input
   */
  [inputTemplate]() {
    const { value = '', compatibility, outlined } = this;
    return html`
    <anypoint-input
      .value="${value}"
      @input="${this[inputHandler]}"
      ?compatibility="${compatibility}"
      ?outlined="${outlined}"
      class="main-input"
      type="url"
      required
      autoValidate
      invalidMessage="The URL is required"
    >
      <label slot="label">Enter URL</label>
    </anypoint-input>
    `;
  }

  /**
   * @returns {TemplateResult} Template for the autocomplete element
   */
  [autocompleteTemplate]() {
    const { compatibility } = this;
    const target = this[autocompleteTarget];
    const offset = compatibility ? 40 : 56;
    return html`
    <anypoint-autocomplete
      loader
      openOnfocus
      .verticalOffset="${offset}"
      @query="${this[autocompleteQueryHandler]}"
      .target="${target}"
      ?compatibility="${compatibility}"
      @openedchange="${this[suggestionsOpenedHandler]}"
      @closed="${this[autocompleteClosedHandler]}"
      @overlay-closed="${cancelEvent}"
      @iron-overlay-closed="${cancelEvent}"
      @opened="${this[autocompleteOpenedHandler]}"
      @overlay-opened="${cancelEvent}"
      @iron-overlay-opened="${cancelEvent}"
    ></anypoint-autocomplete>
    `;
  }

  /**
   * @returns {TemplateResult} Template for the confirm button
   */
  [confirmButtonTemplate]() {
    const { compatibility, confirmDisabled } = this;    
    return html`
    <anypoint-button
      ?compatibility="${compatibility}"
      @click="${this[enterHandler]}"
      ?disabled="${confirmDisabled}"
      emphasis="high"
      class="action-button"
    >Open</anypoint-button>
    `;
  }
}
