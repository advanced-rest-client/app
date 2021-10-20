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
import { LitElement, TemplateResult, CSSResult } from 'lit-element';
import { AnypointInputElement, OverlayMixin, AnypointAutocompleteElement } from '@anypoint-web-components/awc';

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

/**
 * An element to display a dialog to enter an URL with auto hints
 *
 * ### Example
 *
 * ```html
 * <web-url-input purpose="open-browser"></web-url-input>
 * ```
 *
 * @fires suggestionsopenedchange
 * @fires input
 * @fires arcnavigateexternal
 */
export default class WebUrlInputElement extends OverlayMixin(LitElement) {
  static readonly styles: CSSResult;

  /**
   * The current URL value.
   * @attribute
   */
  value: string;
  [valueValue]: string;
  /**
   * Input target for the `anypoint-autocomplete` element.
   */
  [autocompleteTarget]: AnypointInputElement;
  /** 
   * True when the suggestions for the URL is opened.
   */
  suggestionsOpened: boolean;
  [suggestionsOpenedValue]: boolean;
  /**
   * A value to be set in the detail object of the main action custom event.
   * The editor can server different purposes. Re-set the purpose to inform
   * the application about purpose of the event.
   * @attribute
   */
  purpose?: string;
  /**
   * Enables compatibility with Anypoint platform
   */
  compatibility: boolean;
  /**
   * Enables Material Design Outlined inputs
   */
  outlined: boolean;

  get [autocompleteRef](): AnypointAutocompleteElement;
  /**
   * true when the confirm button is rendered disabled
   */
  get confirmDisabled(): boolean;

  [autocompleteOpenedValue]: boolean;

  constructor();

  connectedCallback(): void;

  disconnectedCallback(): void;

  firstUpdated(): void;

  /**
   * Handler for the query event coming from the autocomplete.
   * It makes the query to the data store for history data.
   */
  [autocompleteQueryHandler](e: CustomEvent): void;

  /**
   * Queries the data model for history data and sets the suggestions
   * @param q User query from the input field
   */
  [readAutocomplete](q: string): Promise<void>;

  [autocompleteOpenedHandler](e: Event): void;

  [autocompleteClosedHandler](e: Event): void;

  /**
   * A handler for keyboard key down event bubbling through this element.
   * If the target is the input and the key is Enter key then it calls
   * `_onEnter()` function
   */
  [keyDownHandler](e: KeyboardEvent): void;

  /**
   * A handler called when the user press "enter" in any of the form fields.
   * This will send an `open-web-url` event.
   */
  [enterHandler](): void;

  /**
   * Sets value of the control when input value changes
   */
  [inputHandler](e: CustomEvent): void;

  /**
   * Overrides from ArcOverlayMixin
   */
  _onCaptureEsc(e: Event): void;

  /**
   * Handler for `opened-changed` event dispatched from the autocomplete.
   */
  [suggestionsOpenedHandler](e: CustomEvent): void;

  /**
   * Controls open/close behavior when the transition animations ends
   */
  [transitionEndHandler](e: TransitionEvent): void;

  render(): TemplateResult;
  /**
   * Template for the main input
   */
  [inputTemplate](): TemplateResult;
  /**
   * @returns {TemplateResult} Template for the autocomplete element
   */
  [autocompleteTemplate](): TemplateResult;
  /**
   * @returns {TemplateResult} Template for the confirm button
   */
  [confirmButtonTemplate](): TemplateResult;
}
