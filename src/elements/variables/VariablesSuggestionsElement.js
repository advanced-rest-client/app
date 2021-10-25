/* eslint-disable class-methods-use-this */
import { LitElement, html } from 'lit-element';
import { OverlayMixin } from '@anypoint-web-components/awc';
import '@anypoint-web-components/awc/anypoint-listbox.js';
import '@anypoint-web-components/awc/anypoint-item.js';
import '@anypoint-web-components/awc/anypoint-item-body.js';
import { VariablesConsumerMixin, systemVariablesModel } from './VariablesConsumerMixin.js';
import elementStyles from './styles/Suggestions.js';

/** @typedef {import('lit-element').TemplateResult} TemplateResult */
/** @typedef {import('@advanced-rest-client/events').Variable.ARCVariable} ARCVariable */
/** @typedef {import('@anypoint-web-components/awc').AnypointListboxElement} AnypointListbox */

export const environmentTemplate = Symbol('environmentTemplate');
export const systemTemplate = Symbol('systemTemplate');
export const variablesTemplate = Symbol('variablesTemplate');
export const variableTemplate = Symbol('variableTemplate');
export const inputElement = Symbol('inputElement');
export const inputChanged = Symbol('inputChanged');
export const inputKeydownHandler = Symbol('inputKeydownHandler');
export const suggestionHandler = Symbol('suggestionHandler');
export const inputMeta = Symbol('inputMeta');
export const setInputMeta = Symbol('setInputMeta');
export const restoreInputMeta = Symbol('restoreInputMeta');

/**
 * An element that is an overlay that renders a list of variables for the current environment
 * and allows to select a variable to be inserted into a text field.
 */
export default class VariablesSuggestionsElement extends VariablesConsumerMixin(OverlayMixin(LitElement)) {
  static get styles() {
    return [elementStyles];
  }

  static get properties() {
    return {
      /**
       * Enables Anypoint theme
       */
      anypoint: { type: Boolean },
      /** 
       * The id to be set on the list element.
       * This can be used to manually set the id on the list element.
       */
      listId: { type: String },
      /** 
       * When set it dispatches the `select` event instead of updating the input value.
       * This is assumed as to be true when the `input` is not set.
       */
      preferEvent: { type: Boolean }
    }
  }

  /**
   * @returns {HTMLInputElement}
   */
  get input() {
    return this[inputElement];
  }

  /**
   * @param {HTMLInputElement} value The input element that is related to this autocomplete.
   */
  set input(value) {
    const old = this[inputElement];
    if (old === value) {
      return;
    }
    this[inputElement] = value;
    this[inputChanged](value, old);
  }

  constructor() {
    super();
    this.preferEvent = false;
    this.anypoint = false;
    const id = (Math.random() + 1).toString(36).substring(7).toUpperCase();
    /** @type string */
    this.listId = `VariablesSuggestions${id}`;
    this[inputKeydownHandler] = this[inputKeydownHandler].bind(this);
  }
  
  connectedCallback() {
    super.connectedCallback();
    this.reset();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.input = undefined;
  }

  /**
   * @param {HTMLInputElement=} value The new input set on this element
   * @param {HTMLInputElement=} old The previously set input.
   */
  [inputChanged](value, old) {
    if (old) {
      old.removeEventListener('keydown', this[inputKeydownHandler]);
      this[restoreInputMeta](old);
    }
    if (value) {
      value.addEventListener('keydown', this[inputKeydownHandler]);
      this[setInputMeta](value);
    }
  }

  /**
   * Caches original aria attributes and sets own aria attributes to the input.
   * @param {HTMLElement} input
   */
  [setInputMeta](input) {
    this[inputMeta] = {
      owns: input.getAttribute('aria-owns'),
      expanded: input.getAttribute('aria-expanded'),
      autocomplete: input.getAttribute('aria-autocomplete'),
      activedescendant: input.getAttribute('aria-activedescendant'),
    };
    input.setAttribute('aria-owns', this.listId);
    input.setAttribute('aria-expanded', String(this.opened || false));
    input.setAttribute('aria-autocomplete', 'none');
    input.setAttribute('aria-activedescendant', '');
  }

  /**
   * Restores the original ARIA values on the input.
   * 
   * @param {HTMLElement} input
   */
  [restoreInputMeta](input) {
    const meta = this[inputMeta];
    this[inputMeta] = undefined;
    if (meta.owns) {
      input.setAttribute('aria-owns', meta.owns);
    } else {
      input.removeAttribute('aria-owns');
    }
    if (meta.expanded) {
      input.setAttribute('aria-expanded', meta.expanded);
    } else {
      input.removeAttribute('aria-expanded');
    }
    if (meta.autocomplete) {
      input.setAttribute('aria-autocomplete', meta.autocomplete);
    } else {
      input.removeAttribute('aria-autocomplete');
    }
    if (meta.activedescendant) {
      input.setAttribute('aria-activedescendant', meta.activedescendant);
    } else {
      input.removeAttribute('aria-activedescendant');
    }
  }

  /**
   * @param {boolean} value
   */
  _openedChanged(value) {
    const { input } = this;
    super._openedChanged(value);
    if (!input) {
      return;
    }
    input.setAttribute('aria-expanded', String(value || false));
  }

  /**
   * @param {KeyboardEvent} e
   */
  [inputKeydownHandler](e) {
    if (!this.opened) {
      return;
    }
    if (e.code === 'ArrowUp') {
      e.preventDefault();
      const list = this.shadowRoot.querySelector('anypoint-listbox');
      list.highlightPrevious();
    } else if (e.code === 'ArrowDown') {
      e.preventDefault();
      const list = this.shadowRoot.querySelector('anypoint-listbox');
      list.highlightNext();
    } else if (e.code === 'Enter') {
      e.preventDefault();
      const list = this.shadowRoot.querySelector('anypoint-listbox');
      if (!list.highlightedItem) {
        list.select(0);
      } else {
        const index = list.indexOf(list.highlightedItem);
        list.select(index);
      }
      /** @type HTMLInputElement */ (e.target).focus();
    }
  }

  /**
   * @param {Event} e
   */
  [suggestionHandler](e) {
    e.stopPropagation();
    const list = /** @type AnypointListbox */ (e.target);
    const item = /** @type HTMLElement */ (list.selectedItem);
    if (!item || !item.dataset.name) {
      return;
    }
    const { input } = this;
    const { name } = item.dataset;
    list.selected = undefined;
    this.opened = false;
    if (!input || this.preferEvent) {
      this.dispatchEvent(new CustomEvent('select', {
        detail: name,
      }));
      return;
    }
    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;
    const { value } = input;
    const pre = value.substr(0, start);
    const suf = value.substr(end);
    const variable = `{${name}}`
    const updated = `${pre}${variable}${suf}`;
    input.value = updated;
    // regular input event bubbles. In anypoint input this is required as this
    // `input` is a reference to the inner input element.
    input.dispatchEvent(new Event('input', { bubbles: true, composed: true, }));
    input.dispatchEvent(new Event('change'));
  }

  /**
   * Refreshes the current environment and list of available environments
   */
  async reset() {
    await this.refreshEnvironment();
    this.dispatchEvent(new CustomEvent('ready'));
  }

  /**
   * @returns {TemplateResult} The main template.
   */
  render() {
    const { anypoint, listId } = this;
    return html`
    <anypoint-listbox 
      selectable="anypoint-item" 
      ?anypoint="${anypoint}"
      @select="${this[suggestionHandler]}"
      role="listbox"
      id="${listId}"
    >
      ${this[environmentTemplate]()}
      ${this[systemTemplate]()}
    </anypoint-listbox>
    `;
  }

  /**
   * @returns {TemplateResult} The template for environment variables list items
   */
  [environmentTemplate]() {
    const variables = (this.variables || []).filter(i => i.enabled !== false);
    const hasVariables = Array.isArray(variables) && !!variables.length;
    return html`
    <div class="section-label environment">Environment variables</div>
    ${hasVariables ? this[variablesTemplate](variables) : html`<p class="empty-info variables">No environment variables defined.</p>`}
    `;
  }

  /**
   * @returns {TemplateResult|string} The template for system variables list items
   */
  [systemTemplate]() {
    const { systemVariablesEnabled } = this;
    if (!systemVariablesEnabled) {
      return '';
    }
    const model = (this[systemVariablesModel] || []).filter(i => i.enabled !== false);
    const hasVariables = !!model.length;
    return html`
    <div class="section-label system">System variables</div>
    ${hasVariables ? this[variablesTemplate](model) : html`<p class="empty-info system">No system variables defined.</p>`}
    `;
  }

  /**
   * @param {ARCVariable[]} items The variables to render. This should only by enabled variables.
   * @returns {TemplateResult[]} The templates for each variable item.
   */
  [variablesTemplate](items) {
    return items.map(item => this[variableTemplate](item));
  }

  /**
   * @param {ARCVariable} item The variable to render.
   * @returns {TemplateResult} The template for the variable.
   */
  [variableTemplate](item) {
    const { anypoint } = this;
    const { name, description } = item;
    const hasTwo = !!description;
    return html`
    <anypoint-item data-name="${name}" ?anypoint="${anypoint}">
      <anypoint-item-body ?twoline="${hasTwo}" ?anypoint="${anypoint}">
        <div>${name}</div>
        ${hasTwo ? html`<div data-secondary>${description}</div>` : ''}
      </anypoint-item-body>
    </anypoint-item>
    `;
  }
}
