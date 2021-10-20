/**
@license
Copyright 2016 The Advanced REST client authors <arc@mulesoft.com>
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
import { html, LitElement } from 'lit-element';
import { ValidatableMixin, ControlStateMixin } from '@anypoint-web-components/awc';
import '@anypoint-web-components/awc/anypoint-input.js';
import '@anypoint-web-components/awc/anypoint-icon-button.js';
import '@anypoint-web-components/awc/anypoint-autocomplete.js';
import '@advanced-rest-client/icons/arc-icon.js';
import elementStyles from '../styles/ScopeSelector.js';

/** @typedef {import('lit-element').TemplateResult} TemplateResult */
/** @typedef {import('@anypoint-web-components/awc').Suggestion} Suggestion */
/** @typedef {import('./OAuth2ScopeSelectorElement').AllowedScope} AllowedScope */

/* eslint-disable class-methods-use-this */
/* eslint-disable no-plusplus */

export const scopesListTemplate = Symbol('scopesListTemplate');
export const scopeTemplate = Symbol('scopeTemplate');
export const inputTemplate = Symbol('inputTemplate');
export const invalidMessage = Symbol('invalidMessage');
export const inputTarget = Symbol('inputTarget');
export const autocompleteScopes = Symbol('autocompleteScopes');
export const autocompleteTemplate = Symbol('autocompleteTemplate');
export const notifyChanged = Symbol('notifyChanged');
export const valueHandler = Symbol('valueHandler');
export const autoValidateHandler = Symbol('autoValidateHandler');
export const findAllowedScopeIndex = Symbol('findAllowedScopeIndex');
export const computeAllowedIsObject = Symbol('computeAllowedIsObject');
export const computeItemDescription = Symbol('computeItemDescription');
export const suggestionSelected = Symbol('suggestionSelected');
export const keyDownHandler = Symbol('keyDownHandler');
export const appendScopeHandler = Symbol('appendScopeHandler');
export const invalidChangeHandler = Symbol('invalidChangeHandler');
export const invalidValue = Symbol('invalidValue');
export const allowedScopesValue = Symbol('allowedScopesValue');
export const allowedIsObject = Symbol('allowedIsObject');
export const normalizeScopes = Symbol('normalizeScopes');
export const removeScopeHandler = Symbol('removeScopeHandler');
export const valueValue = Symbol('valueValue');
export const clearValidation = Symbol('clearValidation');

/**
A selector for OAuth 2.0 scope. Provides the UI to enter a scope for OAuth 2.0 settings.

#### Example

```html
<oauth2-scope-selector></oauth2-scope-selector>
```

`allowed-scopes` attribute allows to provide a list of predefined scopes
supported by the endpoint. When the list is set, autocomplete is enabled.
Autocomplete is supported by `anypoint-autocomplete` element.

Setting `preventCustomScopes` disallows adding a scope that is not defined
in the `allowed-scopes` array. This can only work with `allowed-scopes` set

#### Example

```html
<oauth2-scope-selector preventCustomScopes allowedScopes='["email", "profile"]'></oauth2-scope-selector>
```

And in JavaScript

```javascript
var selector = document.querySelector('oauth2-scope-selector');
selector.allowedScopes = ['profile', 'email'];
```

## Adding scope documentation

`allowedScopes` property can be an list of object to present scope description
after it is selected. Object in the array has to contain `label` and `description` properties.
`label` is scope value.

### Example

```javascript
const scopes = [
  {
    'label': 'user',
    'description': 'Grants read/write access to profile info only. Note that this scope includes user:email and user:follow.'
  },
  {'label': 'user:email', 'description': 'Grants read access to a user\'s email addresses.'},
  {'label': 'user:follow', 'description': 'Grants access to follow or unfollow other users.'}
];
const selector = document.querySelector('oauth2-scope-selector');
selector.allowedScopes = scopes;
```

See demo page for example implementation.
@fires change When the scopes list changed.
@fires invalidchange
*/
export default class OAuth2ScopeSelectorElement extends ControlStateMixin(ValidatableMixin(LitElement)) {
  get styles() {
    return elementStyles;
  }

  static get properties() {
    return {
      /**
       * List of scopes entered by the user. It can be used it pre-select scopes
       * by providing an array with scope values.
       */
      value: { type: Array },
      /**
       * Form input name
       */
      name: { type: String },
      /**
       * Current value entered by the user. This is not a scope and it is not
       * yet in the scopes list. User has to accept the scope before it become
       * available in the scopes list.
       */
      currentValue: { type: String },
      /**
       * List of available scopes.
       * It can be either list of string or list of object. If this is the
       * list of object then this expects to each object contain a `label`
       * and `description` keys.
       *
       * ### Example
       * ```
       * {
       *   'label': 'user',
       *   'description': 'Grants read/write access to profile info only. '
       * }
       * ```
       * When the description is provided it will be displayed below the name
       * of the scope.
       */
      allowedScopes: { type: Array },
      // If true then scopes that are in the `allowedScopes` list will be
      // allowed to be add.
      preventCustomScopes: { type: Boolean },
      /**
       * Set to true to auto-validate the input value when it changes.
       */
      autoValidate: { type: Boolean },
      /**
       * Returns true if the value is invalid.
       *
       * If `autoValidate` is true, the `invalid` attribute is managed automatically,
       * which can clobber attempts to manage it manually.
       */
      invalid: { type: Boolean, reflect: true },
      /**
       * Set to true to mark the input as required.
       */
      required: { type: Boolean },
      /**
       * When set the editor is in read only mode.
       */
      readOnly: { type: Boolean },
      /**
       * When set the editor is in disabled mode.
       */
      disabled: { type: Boolean },
      /**
       * Enables Anypoint theme.
       */
      anypoint: { type: Boolean },
      /**
       * Enables Material Design outlined style
       */
      outlined: { type: Boolean }
    };
  }

  get value() {
    return this[valueValue];
  }

  set value(value) {
    const old = this[valueValue];
    /* istanbul ignore if */
    if (old === value) {
      return;
    }
    this[valueValue] = value;
    this.requestUpdate('value', old);
    this[autoValidateHandler](this.autoValidate);
  }

  get allowedScopes() {
    return this[allowedScopesValue];
  }

  set allowedScopes(value) {
    const old = this[allowedScopesValue];
    /* istanbul ignore if */
    if (old === value) {
      return;
    }
    this[allowedScopesValue] = value;
    this[allowedIsObject] = this[computeAllowedIsObject](value);
    this[autocompleteScopes] = this[normalizeScopes](value);
    this.requestUpdate();
  }

  get invalid() {
    return this[invalidValue];
  }

  set invalid(value) {
    const old = this[invalidValue];
    /* istanbul ignore if */
    if (old === value) {
      return;
    }
    this[invalidValue] = value;
    this.requestUpdate('invalid', old);
    this[invalidChangeHandler](value);
    this.dispatchEvent(new CustomEvent('invalidchange', {
      detail: {
        value
      }
    }));
  }

  constructor() {
    super();

    this.value = [];
    this.readOnly = false;
    this.outlined = false;
    this.anypoint = false;
    this.autoValidate = false;
    this.required = false;
    this.preventCustomScopes = false;
    this.name = undefined;
    /** @type {string} */ 
    this[invalidMessage] = undefined;
  }

  firstUpdated() {
    this[inputTarget] = /** @type HTMLElement */ (this.shadowRoot.querySelector('.scope-input'));
    this.requestUpdate();
  }

  /**
   * Called by the `invalid` property setter when the change.
   * @param {boolean} invalid 
   */
  [invalidChangeHandler](invalid) {
    this.setAttribute('aria-invalid', String(invalid));
  }

  [clearValidation]() {
    this[invalidMessage] = undefined;
    this.invalid = false;
    this.requestUpdate();
  }

  /**
   * Adds the currently entered scope value to the scopes list.
   */
  [appendScopeHandler]() {
    const value = this.currentValue;
    if (!value) {
      this[invalidMessage] = 'Scope value is required';
      this.invalid = true;
      this.requestUpdate();
      return;
    }
    this[clearValidation]();
    this.currentValue = '';
    this.add(value);
  }

  /**
   * Remove scope button click handler
   * @param {PointerEvent} e 
   */
  [removeScopeHandler](e) {
    const node = /** @type HTMLElement */ (e.currentTarget);
    const index = Number(node.dataset.index);
    if (Number.isNaN(index) || !this.value) {
      return;
    }
    this.value.splice(index, 1);
    this[notifyChanged]();
    this.requestUpdate();
    if (this.autoValidate) {
      this.validate(this.value);
    }
  }

  /**
   * Handler for the `anypoint-autocomplete` selected event.
   *
   * @param {CustomEvent} e
   */
  [suggestionSelected](e) {
    e.preventDefault();
    if (!e.detail) {
      return;
    }
    const scope = e.detail.value;
    this.add(scope);
    setTimeout(() => {
      this.currentValue = '';
    });
  }

  /**
   * Adds a scope to the list. The same as pushing item to the `scopes`
   * array but it will check for duplicates first.
   *
   * @param {string|Suggestion} scope Scope value to add
   */
  add(scope) {
    const scopeValue = typeof scope === 'string' ? scope : scope.value;
    if (!scopeValue) {
      return;
    }
    if (!this.value) {
      this.value = [];
    }
    const all = this.value;
    let index = all.indexOf(scopeValue);
    if (index !== -1) {
      return;
    }
    const as = this.allowedScopes;
    if (as && as.length) {
      index = this[findAllowedScopeIndex](scopeValue);
      if (index === -1 && this.preventCustomScopes) {
        this[invalidMessage] = 'Entered value is not allowed';
        this.invalid = true;
        this.requestUpdate();
        return;
      }
    }
    this[clearValidation]();
    all.push(scopeValue);
    this[notifyChanged]();
    this.requestUpdate();
  }

  /**
   * Finds an index if the `scope` in the `allowedScopes` list.
   *
   * @param {string} scope A scope value (label) to find.
   * @return {number} An index of scope or `-1` if not found.
   */
  [findAllowedScopeIndex](scope) {
    let index = -1;
    const scopes = this.allowedScopes;
    if (!scopes || !scopes.length || !scope) {
      return index;
    }
    if (this[allowedIsObject]) {
      index = scopes.findIndex((item) => item.label === scope);
    } else {
      index = this.allowedScopes.indexOf(scope);
    }
    return index;
  }

  /**
   * A handler for the input's key down event. Handles ENTER press.
   * @param {KeyboardEvent} e 
   */
  [keyDownHandler](e) {
    if (e.key !== 'Enter') {
      return;
    }
    const ac = this.shadowRoot.querySelector('anypoint-autocomplete');
    if (ac && ac.opened) {
      return;
    }
    this[appendScopeHandler]();
    this.currentValue = '';
  }

  /**
   * Normalizes scopes to use it with autocomplete element.
   *
   * @param {AllowedScope[]} scopes List of autocomplete values. Can be list of
   * strings or objects
   * @return {Suggestion[]|undefined} Normalized scopes list for autocomplete.
   */
  [normalizeScopes](scopes) {
    if (!scopes || !scopes.length) {
      return undefined;
    }
    return scopes.map((item) => {
      if (typeof item === 'string') {
        return {
          value: item,
        };
      }
      const suggestion = /** @type Suggestion */ ({
        label: item.label,
        value: item.label,
        description: item.description,
      });
      return suggestion;
    });
  }

  /**
   * Compute function for the [allowedIsObject]. Check first item of the
   * `allowedScopes` array if it is an object (return `true`) or
   * string (return `false`);
   * @param {string|AllowedScope[]} allowedScopes
   * @return {boolean}
   */
  [computeAllowedIsObject](allowedScopes) {
    if (!allowedScopes || !allowedScopes.length) {
      return false;
    }
    const first = allowedScopes[0];
    return typeof first !== 'string';
  }

  /**
   * Returns a description for the selected scope.
   *
   * @param {string} scope Scope name
   * @param {boolean} isObject True if allowed scopes is an object.
   * @return {string} Description of the scope or `` (empty string) if the
   * item do not exists.
   */
  [computeItemDescription](scope, isObject) {
    if (!isObject) {
      return '';
    }
    const index = this[findAllowedScopeIndex](scope);
    if (index === -1) {
      return '';
    }
    return this.allowedScopes[index].description;
  }

  /**
   * Returns false if the element is required and does not have a selection,
   * and true otherwise.
   *
   * @return {boolean} true if `required` is false, or if `required` is true
   * and the element has a valid selection.
   */
  _getValidity() {
    const {
      value,
      disabled,
      required,
      allowedScopes
    } = this;
    const hasValue = !!(value && value.length);
    const valid = disabled || !required || (required && hasValue);
    if (!valid || !hasValue || !allowedScopes) {
      return valid;
    }
    for (let i = 0, len = value.length; i < len; i++) {
      const scope = value[i];
      const index = this[findAllowedScopeIndex](scope);
      if (index === -1) {
        return false;
      }
    }
    return true;
  }

  /**
   * 
   * @param {boolean} auto The current state of the autoValidate property
   */
  [autoValidateHandler](auto) {
    if (auto) {
      this.invalid = !this._getValidity();
    }
  }

  /**
   * Handler for the input event from the text field.
   * @param {Event} e 
   */
  [valueHandler](e) {
    const input = /** @type HTMLInputElement */ (e.target);
    this.currentValue = input.value;
  }

  [notifyChanged]() {
    this.dispatchEvent(new CustomEvent('change'));
  }

  render() {
    return html `<style>${this.styles}</style>
    <div class="container">
      <label class="form-label">Scopes</label>
      <div class="input-container">
        ${this[inputTemplate]()}
        ${this[autocompleteTemplate]()}
      </div>
      ${this[scopesListTemplate]()}
    </div>`;
  }

  /**
   * @returns {TemplateResult|string} The template for the scopes list
   */
  [scopesListTemplate]() {
    const { value } = this;
    if (!value || !value.length) {
      return '';
    }
    return html`
    <ul class="scopes-list">
      ${value.map((item, index) => this[scopeTemplate](item, index))}
    </ul>
    `;
  }

  /**
   * @param {string} scope The scope name to render.
   * @param {number} index THe scope's index on the value array
   * @returns {TemplateResult} The template for the scope list item.
   */
  [scopeTemplate](scope, index) {
    const { readOnly, disabled } = this;
    const isObject = this[allowedIsObject];
    return html`
    <li class="scope-item" ?data-two-line="${isObject}">
      <div class="scope-display">
        <div class="scope-item-label">${scope}</div>
        <div data-secondary="">${this[computeItemDescription](scope, isObject)}</div>
      </div>
      <anypoint-icon-button
        class="delete-icon"
        data-index="${index}"
        data-action="remove-scope"
        @click="${this[removeScopeHandler]}"
        ?disabled="${readOnly || disabled}"
        aria-label="Press to remove this scope from the list"
        title="Remove scope"
      >
        <arc-icon icon="removeCircleOutline" class="icon"></arc-icon>
      </anypoint-icon-button>
    </li>
    `;
  }

  /**
   * @returns {TemplateResult} The template for the main input
   */
  [inputTemplate]() {
    const {
      name,
      invalid,
      currentValue,
      readOnly,
      anypoint,
      outlined,
      disabled,
    } = this;
    const message = this[invalidMessage];
    return html`
    <anypoint-input
      name="${name}"
      ?invalid="${invalid}"
      class="scope-input"
      .value="${currentValue}"
      ?readOnly="${readOnly}"
      ?disabled="${disabled}"
      ?outlined="${outlined}"
      ?anypoint="${anypoint}"
      title="Enter authorization scopes for this API endpoint"
      .invalidMessage="${message}"
      @input="${this[valueHandler]}"
      @keydown="${this[keyDownHandler]}"
    >
      <label slot="label">Scope value</label>
      <anypoint-icon-button
        class="add-button"
        data-action="add-scope"
        slot="suffix"
        @click="${this[appendScopeHandler]}"
        ?disabled="${readOnly || disabled}"
        aria-label="Press to add current scope to the list"
        title="Add scope"
      >
        <arc-icon icon="addCircleOutline" class="icon"></arc-icon>
      </anypoint-icon-button>
    </anypoint-input>`;
  }

  /**
   * @returns {TemplateResult|string} THe template for the autocomplete element, if needed.
   */
  [autocompleteTemplate]() {
    const source = this[autocompleteScopes];
    const target = this[inputTarget];
    if (!target || !Array.isArray(source) || !source.length) {
      return '';
    }
    const { anypoint } = this;
    return html`
    <anypoint-autocomplete
      .target="${target}"
      .source="${source}"
      ?anypoint="${anypoint}"
      @selected="${this[suggestionSelected]}"
    ></anypoint-autocomplete>`;
  }
}
