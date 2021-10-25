import { LitElement, html } from 'lit-element';
import { classMap } from 'lit-html/directives/class-map.js';
import { ArcModelEvents } from '@advanced-rest-client/events';
import { ResizableMixin } from '@anypoint-web-components/awc';
import '@anypoint-web-components/awc/anypoint-input.js';
import '@anypoint-web-components/awc/anypoint-masked-input.js';
import '@anypoint-web-components/awc/anypoint-button.js';
import '@anypoint-web-components/awc/anypoint-icon-button.js';
import '@anypoint-web-components/awc/anypoint-switch.js';
import elementStyles from './styles/ListView.js';
import commonStyles from './styles/Common.js';
import { variableValueLabel } from '../../lib/Utils.js';

export const variableEditorTemplate = Symbol('variableEditorTemplate');
export const varAddHandler = Symbol('varAddHandler');
export const editedVariable = Symbol('editedVariable');
export const editVariableHandler = Symbol('editVariableHandler');
export const toggleVariableHandler = Symbol('toggleVariableHandler');
export const variableInputHandler = Symbol('variableInputHandler');
export const variableEditorCloseHandler = Symbol('variableEditorCloseHandler');
export const visibilityToggleHandler = Symbol('visibilityToggleHandler');
export const deleteVariableHandler = Symbol('deleteVariableHandler');
export const variablesListTemplate = Symbol('variablesListTemplate');
export const variablesItemTemplate = Symbol('variablesItemTemplate');
export const listActionsTemplate = Symbol('listActionsTemplate');

/** @typedef {import('lit-element').TemplateResult} TemplateResult */
/** @typedef {import('@anypoint-web-components/awc').AnypointInputElement} AnypointInput */
/** @typedef {import('@advanced-rest-client/events').Variable.ARCVariable} ARCVariable */

export default class VariablesListElement extends ResizableMixin(LitElement) {
  static get styles() {
    return [commonStyles, elementStyles];
  }

  static get properties() {
    return { 
      /** 
       * The list of variables to render.
       */
      variables: { type: Array },
      /**
       * Enables anypoint with Anypoint platform
       */
      anypoint: { type: Boolean },
      /**
       * Enables Material Design Outlined inputs
       */
      outlined: { type: Boolean },
      /** 
       * When set it renders the real values for the variables instead of masked values.
       */
      renderValues: { type: Boolean, },
      /** 
       * The name of the environment that these variables belongs to.
       */
      environment: { type: String },
      /** 
       * WHen set it renders a list of system variables.
       */
      system: { type: Boolean },
    };
  }

  get titleValue() {
    return this.system ? 'System variables' : 'Variables';
  }

  constructor() {
    super();
    this.renderValues = false;
    this.anypoint = false;
    this.outlined = false;
    this.system = false;
    /**
     * The ID of the variable in the edit mode.
     * @type {string}
     */
    this[editedVariable] = undefined;
    /**
     * @type {ARCVariable[]}
     */
    this.variables = undefined;
    /**
     * @type {string}
     */
    this.environment = undefined;
  }

  /**
   * A handler for the variable add button click
   */
  async [varAddHandler]() {
    const { environment, system } = this;
    if (system) {
      return;
    }
    const record = await ArcModelEvents.Variable.update(this, {
      environment,
      name: 'newVariable',
      value: '',
      enabled: false,
    });
    this[editedVariable] = record.id;
    await this.requestUpdate();
    this.notifyResize();
    const editor = this.shadowRoot.querySelector('.var-editor');
    if (editor) {
      editor.scrollIntoView();
    }
  }

  /**
   * Toggles visibility of the variable values.
   */
  [visibilityToggleHandler]() {
    this.renderValues = !this.renderValues;
  }

  /**
   * A handler for the click event on the variable edit icon.
   * Sets state to edit this variable
   * @param {PointerEvent} e
   */
  async [editVariableHandler](e) {
    if (this.system) {
      return;
    }
    const node = /** @type HTMLElement */ (e.currentTarget);
    const { id } = node.dataset;
    this[editedVariable] = id;
    await this.requestUpdate();
    this.notifyResize();
  }

  /**
   * Handler for the variable toggle change
   * @param {CustomEvent} e
   */
  [toggleVariableHandler](e) {
    const node = /** @type HTMLInputElement */ (e.currentTarget);
    const { id } = node.dataset;
    const { checked } = node;
    const variable = this.variables.find((item) => item._id === id);
    if (variable.enabled === checked) {
      return;
    }
    variable.enabled = checked;
    ArcModelEvents.Variable.update(this, variable);
  }

  /**
   * Handler for one of the variable inputs value change
   * @param {Event} e
   */
  [variableInputHandler](e) {
    const node = /** @type HTMLInputElement */ (e.currentTarget);
    const { id } = node.dataset;
    const { value } = node;
    const variable = this.variables.find((item) => item._id === id);
    variable[node.name] = value;
    ArcModelEvents.Variable.update(this, variable);
  }

  /**
   * Removes the variable from the environment
   * @param {PointerEvent} e
   */
  async [deleteVariableHandler](e) {
    const node = /** @type HTMLElement */ (e.currentTarget);
    const { id } = node.dataset;
    await ArcModelEvents.Variable.delete(this, id);
    await this.requestUpdate();
    this.notifyResize();
  }

  /**
   * A handler for the variable editor close button click.
   */
  async [variableEditorCloseHandler]() {
    this[editedVariable] = undefined;
    await this.requestUpdate();
    this.notifyResize();
  }

  render() {
    const icon = this.renderValues ? 'visibilityOff' : 'visibility';
    return html`
    <div class="vars-title-line">
      <div class="section-title">${this.titleValue}</div>
      ${this.system ? '' : html`<anypoint-icon-button 
        title="Add a variable" 
        aria-label="Activate to add a new variable"
        @click="${this[varAddHandler]}"
        data-action="add-variables"
      >
        <arc-icon icon="addCircleOutline"></arc-icon>
      </anypoint-icon-button>`}
      <anypoint-icon-button 
        title="Toggle values visibility" 
        aria-label="Activate to toggle variables visibility"
        @click="${this[visibilityToggleHandler]}"
        data-action="toggle-visibility"
      >
        <arc-icon icon="${icon}"></arc-icon>
      </anypoint-icon-button>
    </div>
    ${this[variablesListTemplate]()}
    `;
  }

  /**
   * @returns {TemplateResult} The template for the variables list.
   */
  [variablesListTemplate]() {
    const { variables } = this;
    if (!Array.isArray(variables) || !variables.length) {
      return html`
      <p class="empty-info">
        This environment has no variables.
      </p>
      `;
    }
    return html`
    <ul class="var-list">
    ${variables.map((item) => this[variablesItemTemplate](item))}
    </ul>
    `;
  }

  /**
   * @param {ARCVariable} item The variable to render.
   * @returns {TemplateResult} The template for the variable line or variable editor
   */
  [variablesItemTemplate](item) {
    if (!this.system && this[editedVariable] === item._id) {
      return this[variableEditorTemplate](item);
    }
    const classes = {
      disabled: !item.enabled,
      'var-item': true,
    };
    return html`
    <li class=${classMap(classes)}>
      <span class="var-name">${item.name}</span>
      <span class="var-value">${variableValueLabel(item.value, !this.renderValues)}</span>
      ${this[listActionsTemplate](item)}
    </li>`;
  }

  /**
   * @param {ARCVariable} item The variable to render.
   * @returns {TemplateResult|string}} The template for list item actions
   */
  [listActionsTemplate](item) {
    if (this.system) {
      return '';
    }
    return html`
    <div class="var-list-actions">
      <anypoint-icon-button 
        class="edit-icon" 
        title="Edit the variable" 
        aria-label="Activate to edit the variable"
        data-id="${item._id}"
        data-action="edit"
        @click="${this[editVariableHandler]}"
      >
        <arc-icon icon="edit"></arc-icon>
      </anypoint-icon-button>
      <anypoint-icon-button 
        class="delete-icon" 
        title="Delete the variable" 
        aria-label="Activate to remove the variable"
        data-id="${item._id}"
        data-action="remove"
        @click="${this[deleteVariableHandler]}"
      >
        <arc-icon icon="removeCircleOutline"></arc-icon>
      </anypoint-icon-button>
    </div>`;
  }

  /**
   * @param {ARCVariable} item The variable to render.
   * @returns {TemplateResult} The template for the variables editor
   */
  [variableEditorTemplate](item) {
    const { anypoint, outlined } = this;
    return html`
    <li class="var-editor">
      <anypoint-switch
        .checked="${item.enabled}"
        @change="${this[toggleVariableHandler]}"
        ?anypoint="${anypoint}"
        title="Toggle variable enabled"
        aria-label="Toggle variable enabled state"
        name="enabled"
        data-id="${item._id}"
      ></anypoint-switch>
      <anypoint-input
        class="variable-name"
        .value="${item.name}"
        name="name"
        @change="${this[variableInputHandler]}"
        noLabelFloat
        autoValidate
        required
        allowedPattern="[a-zA-Z0-9_]"
        preventInvalidInput
        invalidMessage="Variable name is not valid"
        ?anypoint="${anypoint}"
        ?outlined="${outlined}"
        data-id="${item._id}"
      >
        <label slot="label">Variable name</label>
      </anypoint-input>
      <anypoint-masked-input
        class="variable-value"
        .value="${item.value}"
        name="value"
        @change="${this[variableInputHandler]}"
        noLabelFloat
        autoValidate
        required
        ?anypoint="${anypoint}"
        ?outlined="${outlined}"
        data-id="${item._id}"
        .visible="${this.renderValues}"
      >
        <label slot="label">Variable value</label>
      </anypoint-masked-input>
      <anypoint-button 
        ?anypoint="${anypoint}"
        @click="${this[variableEditorCloseHandler]}"
        data-action="close-editor"
      >Close</anypoint-button>
    </li>
    `;
  }
}
