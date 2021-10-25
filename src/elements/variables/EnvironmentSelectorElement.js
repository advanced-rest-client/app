import { LitElement, html } from 'lit-element';
import '@anypoint-web-components/awc/anypoint-dropdown.js';
import '@anypoint-web-components/awc/anypoint-listbox.js';
import '@anypoint-web-components/awc/anypoint-icon-item.js';
import '@anypoint-web-components/awc/anypoint-input.js';
import '@anypoint-web-components/awc/anypoint-button.js';
import '@advanced-rest-client/icons/arc-icon.js';
import { VariablesConsumerMixin } from './VariablesConsumerMixin.js';
import elementStyles from './styles/Selector.js';
import commonStyles from './styles/Common.js';

export const envSelectorKeydownHandler = Symbol('envSelectorKeydownHandler');
export const envSelectorClickHandler = Symbol('envSelectorClickHandler');
export const labelTemplate = Symbol('labelTemplate');
export const dropdownTemplate = Symbol('dropdownTemplate');
export const envSelectorOpened = Symbol('envSelectorOpened');
export const envSelectorClosed = Symbol('envSelectorClosed');
export const envActivateHandler = Symbol('envActivateHandler');
export const envActionHandler = Symbol('envActionHandler');
export const envAddEditor = Symbol('envAddEditor');
export const envInputTemplate = Symbol('envInputTemplate');
export const envInputKeydownTemplate = Symbol('envInputKeydownTemplate');
export const envAddClickHandler = Symbol('envAddClickHandler');
export const envAddCancelHandler = Symbol('envAddCancelHandler');
export const listOptionsTemplate = Symbol('listOptionsTemplate');

/** @typedef {import('lit-element').TemplateResult} TemplateResult */
/** @typedef {import('@anypoint-web-components/awc').AnypointInputElement} AnypointInput */
/** @typedef {import('@advanced-rest-client/events').Variable.ARCEnvironment} ARCEnvironment */

export default class EnvironmentSelectorElement extends VariablesConsumerMixin(LitElement) {
  static get styles() {
    return [commonStyles, elementStyles];
  }

  static get properties() {
    return {
      /**
       * Enables Anypoint theme
       */
      anypoint: { type: Boolean },
      /**
       * Enables Material Design Outlined inputs
       */
      outlined: { type: Boolean },
    };
  }

  constructor() {
    super();
    this[envSelectorOpened] = false;
    this[envAddEditor] = false;
    this.anypoint = false;
    this.outlined = false;
  }

  /**
   * @param {KeyboardEvent} e
   */
  [envSelectorKeydownHandler](e) {
    if (['Space', 'Enter', 'NumpadEnter'].includes(e.code)) {
      this[envSelectorClickHandler]();
    }
  }

  [envSelectorClickHandler]() {
    this[envSelectorOpened] = true;
    this.requestUpdate();
  }

  /**
   * Handler for the drop down list close event.
   */
  [envSelectorClosed]() {
    this[envSelectorOpened] = false;
    this.requestUpdate();
  }

  /**
   * @param {CustomEvent} e
   */
  [envActivateHandler](e) {
    this[envSelectorOpened] = false;
    this.requestUpdate();
    const { selected, item } = e.detail;
    if (!selected && item.dataset.action) {
      this[envActionHandler](item.dataset.action);
      return;
    }
    this.selectEnvironment(selected);
  }

  /**
   * @param {string} action The action to perform
   */
  [envActionHandler](action) {
    if (action === 'add-environment') {
      this[envAddEditor] = true;
      this.requestUpdate();
    } else if (action === 'remove-environment') {
      this.removeEnvironment(this.environment._id);
    }
  }

  /**
   * The handler for the cancel adding new environment button.
   */
  [envAddCancelHandler]() {
    this[envAddEditor] = false;
    this.requestUpdate();
  }

  /**
   * @param {KeyboardEvent} e
   */
  [envInputKeydownTemplate](e) {
    if (['Enter', 'NumpadEnter'].includes(e.code)) {
      this[envAddClickHandler]();
    }
  }

  [envAddClickHandler]() {
    const input = /** @type AnypointInput */ (this.shadowRoot.querySelector('#envNameInput'));
    const { value } = input;
    this[envAddCancelHandler]();
    if (!value) {
      return;
    }
    this.addEnvironment(value);
  }

  /**
   * @returns {TemplateResult} The main template
   */
  render() {
    return html`
    <div class="section-title">Current environment</div>
    ${this[labelTemplate]()}
    ${this[dropdownTemplate]()}
    ${this[envInputTemplate]()}
    `;
  }

  /**
   * @returns {TemplateResult} The template for the drop down label.
   */
  [labelTemplate]() {
    const { environmentLabel } = this;
    return html`
    <div 
      class="environment-selector"
      tabindex="0"
      @click="${this[envSelectorClickHandler]}"
      @keydown="${this[envSelectorKeydownHandler]}"
      ?hidden="${this[envAddEditor]}"
    >
      <span class="label">${environmentLabel}</span>
      <arc-icon icon="expandMore"></arc-icon>
    </div>`;
  }

  /**
   * @returns {TemplateResult} The template for the drop down menu with environment options.
   */
  [dropdownTemplate]() {
    return html`
    <anypoint-dropdown 
      .opened="${this[envSelectorOpened]}" 
      .positionTarget="${this}" 
      verticalAlign="top"
      @closed="${this[envSelectorClosed]}"
      @activate="${this[envActivateHandler]}"
    >
      <anypoint-listbox 
        fallbackSelection="" 
        attrForSelected="data-id" 
        slot="dropdown-content" 
        selectable="anypoint-icon-item"
        class="env-list"
        ?anypoint="${this.anypoint}"
      >
        ${this[listOptionsTemplate]()}
      </anypoint-listbox>
    </anypoint-dropdown>
    `;
  }
  
  /**
   * @returns {TemplateResult} The template for the drop down list options
   */
  [listOptionsTemplate]() {
    const { environments=[], environment } = this;
    return html`
    <anypoint-icon-item data-id="" ?anypoint="${this.anypoint}">Default</anypoint-icon-item>
    ${environments.map((item) => html`<anypoint-icon-item data-id="${item._id}" ?anypoint="${this.anypoint}">${item.name}</anypoint-icon-item>`)}
    <div class="separator"></div>
    <anypoint-icon-item data-action="add-environment" ?anypoint="${this.anypoint}">
      <arc-icon slot="item-icon" icon="addCircleOutline"></arc-icon>
      Add environment
    </anypoint-icon-item>
    ${environment ? html`
    <anypoint-icon-item data-action="remove-environment" ?anypoint="${this.anypoint}">
      <arc-icon slot="item-icon" icon="removeCircleOutline"></arc-icon>
      Delete this environment
    </anypoint-icon-item>` : ''}
    `;
  }

  /**
   * @returns {TemplateResult|string} The template for the new environment name input.
   */
  [envInputTemplate]() {
    if (!this[envAddEditor]) {
      return '';
    }
    return html`
    <div class="env-input-wrapper">
      <anypoint-input 
        noLabelFloat 
        id="envNameInput" 
        required 
        autoValidate 
        invalidMessage="The name is required"
        ?anypoint="${this.anypoint}"
        @keydown="${this[envInputKeydownTemplate]}"
      >
        <label slot="label">Environment name</label>
      </anypoint-input>
      <anypoint-button data-action="save" emphasis="medium" @click="${this[envAddClickHandler]}" ?anypoint="${this.anypoint}">Save</anypoint-button>
      <anypoint-button data-action="cancel" @click="${this[envAddCancelHandler]}" ?anypoint="${this.anypoint}">Cancel</anypoint-button>
    </div>
    `;
  }
}
