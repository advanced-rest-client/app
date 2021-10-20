import {TemplateResult, CSSResult, LitElement} from 'lit-element';
import {ValidatableMixin, ControlStateMixin, AnypointInputElement, Suggestion} from '@anypoint-web-components/awc';

export declare const scopesListTemplate: unique symbol;
export declare const scopeTemplate: unique symbol;
export declare const inputTemplate: unique symbol;
export declare const invalidMessage: unique symbol;
export declare const inputTarget: unique symbol;
export declare const autocompleteScopes: unique symbol;
export declare const autocompleteTemplate: unique symbol;
export declare const notifyChanged: unique symbol;
export declare const valueHandler: unique symbol;
export declare const autoValidateHandler: unique symbol;
export declare const findAllowedScopeIndex: unique symbol;
export declare const computeAllowedIsObject: unique symbol;
export declare const computeItemDescription: unique symbol;
export declare const suggestionSelected: unique symbol;
export declare const keyDownHandler: unique symbol;
export declare const appendScopeHandler: unique symbol;
export declare const invalidChangeHandler: unique symbol;
export declare const invalidValue: unique symbol;
export declare const allowedScopesValue: unique symbol;
export declare const allowedIsObject: unique symbol;
export declare const normalizeScopes: unique symbol;
export declare const removeScopeHandler: unique symbol;
export declare const valueValue: unique symbol;

export declare interface AllowedScope {
  label: string;
  description?: string;
}

/**
 * A selector for OAuth 2.0 scope. Provides the UI to enter a scope for OAuth 2.0 settings.
 *
 * #### Example
 *
 * ```html
 * <oauth2-scope-selector></oauth2-scope-selector>
 * ```
 *
 * `allowed-scopes` attribute allows to provide a list of predefined scopes
 * supported by the endpoint. When the list is set, autocomplete is enabled.
 * Autocomplete is supported by `anypoint-autocomplete` element.
 *
 * Setting `preventCustomScopes` disallows adding a scope that is not defined
 * in the `allowed-scopes` array. This can only work with `allowed-scopes` set
 *
 * #### Example
 *
 * ```html
 * <oauth2-scope-selector preventCustomScopes allowedScopes='["email", "profile"]'></oauth2-scope-selector>
 * ```
 *
 * And in JavaScript
 *
 * ```javascript
 * var selector = document.querySelector('oauth2-scope-selector');
 * selector.allowedScopes = ['profile', 'email'];
 * ```
 *
 * ## Adding scope documentation
 *
 * `allowedScopes` property can be an list of object to present scope description
 * after it is selected. Object in the array has to contain `label` and `description` properties.
 * `label` is scope value.
 *
 * ### Example
 *
 * ```javascript
 * const scopes = [
 *   {
 *     'label': 'user',
 *     'description': 'Grants read/write access to profile info only. Note that this scope includes user:email and user:follow.'
 *   },
 *   {'label': 'user:email', 'description': 'Grants read access to a user\'s email addresses.'},
 *   {'label': 'user:follow', 'description': 'Grants access to follow or unfollow other users.'}
 * ];
 * const selector = document.querySelector('oauth2-scope-selector');
 * selector.allowedScopes = scopes;
 * ```
 *
 * See demo page for example implementation.
 * 
 * @fires change When the scopes list changed. Non bubbling.
 * @fires invalidchange When the invalid value change. Non bubbling.
 */
export default class OAuth2ScopeSelectorElement extends ControlStateMixin(ValidatableMixin(LitElement)) {
  get styles(): CSSResult;

  /**
   * List of scopes entered by the user. It can be used it pre-select scopes
   * by providing an array with scope values.
   */
  value: string[];
  /**
   * Form input name
   * @attribute
   */
  name: string;
  /**
   * Current value entered by the user. This is not a scope and it is not
   * yet in the scopes list. User has to accept the scope before it become
   * available in the scopes list.
   * @attribute
   */
  currentValue: string;
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
  allowedScopes?: string[]|AllowedScope[];
  /**
   * allowed to be add.
   * @attribute
   */
  preventCustomScopes: boolean;
  /**
   * Set to true to auto-validate the input value when it changes.
   * @attribute
   */
  autoValidate: boolean;
  /**
   * Returns true if the value is invalid.
   *
   * If `autoValidate` is true, the `invalid` attribute is managed automatically,
   * which can clobber attempts to manage it manually.
   * @attribute
   */
  invalid: boolean;
  /**
   * Set to true to mark the input as required.
   * @attribute
   */
  required: boolean;
  /**
   * When set the editor is in read only mode.
   * @attribute
   */
  readOnly: boolean;
  /**
   * When set the editor is in disabled mode.
   * @attribute
   */
  disabled: boolean;
  /**
   * Enables Anypoint theme.
   * @attribute
   */
  anypoint: boolean;
  /**
   * Enables Material Design outlined style
   * @attribute
   */
  outlined: boolean;
  get [invalidMessage](): string|undefined;
  [valueValue]: string[];
  [allowedScopesValue]?: string[]|AllowedScope[];
  [allowedIsObject]: boolean;
  [autocompleteScopes]: boolean;
  [invalidValue]: boolean;
  [inputTarget]: AnypointInputElement;

  /**
   * Called by the `invalid` property setter when the change.
   */
  [invalidChangeHandler](invalid: boolean): void;
  /**
   * Adds the currently entered scope value to the scopes list.
   */
  [appendScopeHandler](): void;

  /**
   * Remove scope button click handler
   */
  [removeScopeHandler](e: PointerEvent): void;

  /**
   * Handler for the `anypoint-autocomplete` selected event.
   */
  [suggestionSelected](e: CustomEvent): void;

  /**
   * Adds a scope to the list. The same as pushing item to the `scopes`
   * array but it will check for duplicates first.
   *
   * @param scope Scope value to add
   */
  add(scope: string|Suggestion): void;

  /**
   * Finds an index if the `scope` in the `allowedScopes` list.
   *
   * @param {string} scope A scope value (label) to find.
   * @return {number} An index of scope or `-1` if not found.
   */
  [findAllowedScopeIndex](scope: string): number;

  /**
   * A handler for the input's key down event. Handles ENTER press.
   */
  [keyDownHandler](e: KeyboardEvent): void;

  /**
   * Normalizes scopes to use it with autocomplete element.
   *
   * @param scopes List of autocomplete values. Can be list of
   * strings or objects
   * @returns Normalized scopes list for autocomplete.
   */
  [normalizeScopes](scopes: AllowedScope[]): Suggestion[]|undefined;

  /**
   * Compute function for the [allowedIsObject]. Check first item of the
   * `allowedScopes` array if it is an object (return `true`) or
   * string (return `false`);
   */
  [computeAllowedIsObject](allowedScopes: string|AllowedScope[]): boolean;

  /**
   * Returns a description for the selected scope.
   *
   * @param scope Scope name
   * @param isObject True if allowed scopes is an object.
   * @returns Description of the scope or `` (empty string) if the item do not exists.
   */
  [computeItemDescription](scope: string, isObject: boolean): string;

  /**
   * Returns false if the element is required and does not have a selection,
   * and true otherwise.
   *
   * @return true if `required` is false, or if `required` is true
   * and the element has a valid selection.
   */
  _getValidity(): boolean;

  /**
   * 
   * @param auto The current state of the autoValidate property
   */
  [autoValidateHandler](auto: boolean): void;

  /**
   * Handler for the input event from the text field.
   */
  [valueHandler](e: Event): void;

  [notifyChanged](): void;

  render(): TemplateResult;

  /**
   * @returns The template for the scopes list
   */
  [scopesListTemplate](): TemplateResult|string;

  /**
   * @param scope The scope name to render.
   * @param index THe scope's index on the value array
   * @returns The template for the scope list item.
   */
  [scopeTemplate](scope: string, index: number): TemplateResult;

  /**
   * @returns The template for the main input
   */
  [inputTemplate](): TemplateResult;

  /**
   * @returns THe template for the autocomplete element, if needed.
   */
  [autocompleteTemplate](): TemplateResult|string;
}

export declare interface OAuth2ScopeSelector extends ValidatableMixin, ControlStateMixin, LitElement {

}
