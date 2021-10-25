/* eslint-disable class-methods-use-this */
import { LitElement, html } from 'lit-element';
import { OverlayMixin } from '@anypoint-web-components/awc';
import '@anypoint-web-components/awc/anypoint-switch.js';
import '@anypoint-web-components/awc/anypoint-button.js';
import { VariablesConsumerMixin, systemVariablesModel } from './VariablesConsumerMixin.js';
import elementStyles from './styles/Overlay.js';
import '../../../define/variables-list.js';
import '../../../define/environment-selector.js';

/** @typedef {import('lit-element').TemplateResult} TemplateResult */

export const infoTemplate = Symbol('infoTemplate');
export const selectorTemplate = Symbol('selectorTemplate');
export const listTemplate = Symbol('listTemplate');
export const systemListTemplate = Symbol('systemListTemplate');
export const footerTemplate = Symbol('footerTemplate');
export const systemVariablesToggleTemplate = Symbol('systemVariablesToggleTemplate');
export const closeHandler = Symbol('closeHandler');
export const systemVarsToggleHandler = Symbol('systemVarsToggleHandler');
export const listResizeHandler = Symbol('listResizeHandler');

/**
 * `Renders an overlay with variables information.
 */
export default class VariablesOverlayElement extends VariablesConsumerMixin(OverlayMixin(LitElement)) {
  static get styles() {
    return [elementStyles];
  }

  static get properties() {
    return {
      /** 
       * When set it renders the real values for the variables instead of masked values.
       */
      renderValues: { type: Boolean, },
      /**
       * Enables Anypoint theme
       */
      anypoint: { type: Boolean },
      /**
       * Enables Material Design Outlined inputs
       */
      outlined: { type: Boolean },
    }
  }

  constructor() {
    super();
    this.renderValues = false;
    this.anypoint = false;
    this.outlined = false;
  }
  
  connectedCallback() {
    super.connectedCallback();
    this.reset();
  }

  /**
   * Refreshes the current environment and list of available environments
   */
  async reset() {
    await this.refreshEnvironment();
    await this.refreshEnvironments();
    this.dispatchEvent(new CustomEvent('ready'));
  }

  /**
   * @param {Event} e
   */
  async [systemVarsToggleHandler](e) {
    const input = /** @type HTMLInputElement */ (e.target);
    await this.toggleSystemVariables(input.checked);
    this.notifyResize();
    this.refit();
  }

  [closeHandler]() {
    this.close();
  }

  /**
   * Re fits the overlay when the list resize.
   */
  [listResizeHandler]() {
    if (this.opened) {
      this.refit();
    }
  }

  /**
   * @returns {TemplateResult} The main template.
   */
  render() {
    return html`
    ${this[infoTemplate]()}
    ${this[selectorTemplate]()}
    <div class="vars-container">
    ${this[listTemplate]()}
    ${this[systemListTemplate]()}
    </div>
    ${this[footerTemplate]()}
    `;
  }

  /**
   * @returns {TemplateResult} The template for the introduction message.
   */
  [infoTemplate]() {
    return html`
    <p class="intro">
      An environment holds variables that can be inserted into any part of a request at run time. 
      Create different environments to easily switch variable values.
    </p>
    `;
  }

  /**
   * @returns {TemplateResult} The template for the environment selector
   */
  [selectorTemplate]() {
    return html`
    <environment-selector
      .environment="${this.environment}"
      .environments="${this.environments}"
      .anypoint="${this.anypoint}"
      .outlined="${this.outlined}"
    ></environment-selector>`;
  }

  /**
   * @returns {TemplateResult} The template for the variables list
   */
  [listTemplate]() {
    return html`
    <variables-list
      .variables="${this.variables}"
      .environment="${this.environmentNameValue}"
      .renderValues="${this.renderValues}"
      .anypoint="${this.anypoint}"
      .outlined="${this.outlined}"
      class="environment-variables"
      @resize="${this[listResizeHandler]}"
    ></variables-list>`;
  }

  /**
   * @returns {TemplateResult|string} The template for the system variables list
   */
  [systemListTemplate]() {
    const { systemVariablesEnabled } = this;
    if (!systemVariablesEnabled) {
      return '';
    }
    const model = this[systemVariablesModel];
    return html`
    <variables-list
      .variables="${model}"
      system
      .renderValues="${this.renderValues}"
      .anypoint="${this.anypoint}"
      .outlined="${this.outlined}"
      class="system-variables"
    ></variables-list>`;
  }

  [footerTemplate]() {
    return html`
    <div class="overlay-footer">
      ${this[systemVariablesToggleTemplate]()}
      <anypoint-button @click="${this[closeHandler]}">Close</anypoint-button>
    </div>
    `;
  }

  [systemVariablesToggleTemplate]() {
    const { systemVariablesEnabled } = this;
    return html`
    <anypoint-switch .checked="${systemVariablesEnabled}" @change="${this[systemVarsToggleHandler]}">Use system variables</anypoint-switch>
    `;
  }
}
