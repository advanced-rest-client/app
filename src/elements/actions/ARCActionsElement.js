/* eslint-disable class-methods-use-this */
import { html, css, LitElement } from 'lit-element';
import '@anypoint-web-components/awc/anypoint-tabs.js';
import '@anypoint-web-components/awc/anypoint-tab.js';
import '../../../define/arc-actions-panel.js';
import {
  tabHandler,
  actionsHandler,
  notifyChange,
  tabsTpl,
  requestActionsTpl,
  responseActionsTpl,
  panelTpl,
} from './internals.js';

export const conditionChangeEvent = 'change';
export const selectedChangeEvent = 'selectedchange';
export const requestConditionsValue = Symbol('requestConditionsValue');
export const responseConditionsValue = Symbol('responseConditionsValue');
export const tutorialTemplate = Symbol('tutorialTemplate');
export const onChangeValue = Symbol('onChangeValue');
export const onSelectedValue = Symbol('onSelectedValue');

/** @typedef {import('lit-element').TemplateResult} TemplateResult */
/** @typedef {import('@advanced-rest-client/events').Actions.OperatorEnum} OperatorEnum */
/** @typedef {import('@anypoint-web-components/awc').AnypointTabsElement} AnypointTabsElement */
/** @typedef {import('./ARCActionsPanelElement').default} ARCActionsPanelElement */
/** @typedef {import('../../lib/actions/ArcAction').ArcAction} ArcAction */
/** @typedef {import('../../lib/actions/ActionCondition').ActionCondition} ActionCondition */

/**
 * An HTML element that renders a panel with request and response
 * actions.
 */
export default class ARCActionsElement extends LitElement {
  static get styles() {
    return css`
      :host {
        display: block;
      }
    `;
  }

  static get properties() {
    return {
      /**
       * Enables Anypoint theme
       */
      anypoint: { type: Boolean, reflect: true },
      /**
       * Enables outlined MD theme
       */
      outlined: { type: Boolean, reflect: true },
      /**
       * Currently selected tab.
       */
      selected: { type: Number, reflect: true }
    };
  }

  /**
   * A list of request conditions and actions.
   * @return {ActionCondition[]}
   */
  get request() {
    return this[requestConditionsValue];
  }

  /**
   * @param {ActionCondition[]} value List of request actions to render.
   */
  set request(value) {
    const old = this[requestConditionsValue];
    if (old === value) {
      return;
    }
    this[requestConditionsValue] = value;
    this.requestUpdate();
  }

  /**
   * A list of response conditions and actions.
   * @return {ActionCondition[]}
   */
  get response() {
    return this[responseConditionsValue];
  }

  /**
   * @param {ActionCondition[]} value List of request actions to render.
   */
  set response(value) {
    const old = this[responseConditionsValue];
    if (old === value) {
      return;
    }
    this[responseConditionsValue] = value;
    this.requestUpdate();
  }

  get onchange() {
    return this[onChangeValue];
  }

  set onchange(value) {
    const old = this[onChangeValue];
    this[onChangeValue] = null;
    if (old) {
      this.removeEventListener(conditionChangeEvent, old);
    }
    if (typeof value !== 'function') {
      return;
    }
    this[onChangeValue] = value;
    this.addEventListener(conditionChangeEvent, value);
  }

  get onselectedchange() {
    return this[onSelectedValue];
  }

  set onselectedchange(value) {
    const old = this[onSelectedValue];
    this[onSelectedValue] = null;
    if (old) {
      this.removeEventListener(selectedChangeEvent, old);
    }
    if (typeof value !== 'function') {
      return;
    }
    this[onSelectedValue] = value;
    this.addEventListener(selectedChangeEvent, value);
  }

  constructor() {
    super();
    this.selected = 0;
    this.anypoint = false;
    this.outlined = false;
    /**
     * @type {ActionCondition[]}
     */
    this[requestConditionsValue] = null;
    /**
     * @type {ActionCondition[]}
     */
    this[responseConditionsValue] = null;
  }

  /**
   * @param {Event} e 
   */
  [tabHandler](e) {
    this.selected = /** @type number */ (/** @type AnypointTabsElement */ (e.target).selected);
    this.dispatchEvent(new Event(selectedChangeEvent));
  }

  /**
   * @param {Event} e 
   */
  [actionsHandler](e) {
    const panel = /** @type ARCActionsPanelElement */ (e.target);
    const { conditions, type } = panel;
    this[type] = conditions;
    this[notifyChange](type);
  }

  /**
   * @param {string} type 
   */
  [notifyChange](type) {
    this.dispatchEvent(
      new CustomEvent(conditionChangeEvent, {
        detail: {
          type
        }
      })
    );
  }

  render() {
    return html`
      ${this[tutorialTemplate]()}
      ${this[tabsTpl]()}
      ${this[requestActionsTpl]()}
      ${this[responseActionsTpl]()}
    `;
  }

  /**
   * @return {TemplateResult} Template for the tutorial
   */
  [tutorialTemplate]() {
    return html`
      <p class="actions-intro">
        Actions run a custom logic in a context of the current request. When they fail the request is reported as error.
      </p>
    `;
  }

  /**
   * @returns {TemplateResult}  The template for the context tabs
   */
  [tabsTpl]() {
    const { selected, anypoint } = this;
    return html`
      <anypoint-tabs
        .selected="${selected}"
        ?anypoint="${anypoint}"
        @selectedchange="${this[tabHandler]}"
      >
        <anypoint-tab ?anypoint="${anypoint}">Request actions</anypoint-tab>
        <anypoint-tab ?anypoint="${anypoint}">Response actions</anypoint-tab>
      </anypoint-tabs>
    `;
  }

  /**
   * @returns {TemplateResult|string}  The template for the request actions panel
   */
  [requestActionsTpl]() {
    if (this.selected !== 0) {
      return '';
    }
    return this[panelTpl](this.request, 'request');
  }

  /**
   * @returns {TemplateResult|string}  The template for the response actions panel
   */
  [responseActionsTpl]() {
    if (this.selected !== 1) {
      return '';
    }
    return this[panelTpl](this.response, 'response');
  }

  /**
   * @param {ActionCondition[]} conditions The list of conditions to render.
   * @param {string} type The type of the UI.
   * @returns {TemplateResult}  The template for the actions panel
   */
  [panelTpl](conditions, type) {
    const { anypoint, outlined } = this;
    return html`
      <arc-actions-panel
        ?anypoint="${anypoint}"
        ?outlined="${outlined}"
        type="${type}"
        @change="${this[actionsHandler]}"
        .conditions="${conditions}"
      ></arc-actions-panel>
    `;
  }
}
