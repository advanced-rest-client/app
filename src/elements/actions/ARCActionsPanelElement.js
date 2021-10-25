import { html, LitElement } from 'lit-element';
import { ArcNavigationEvents } from '@advanced-rest-client/events';
import '@anypoint-web-components/awc/anypoint-button.js';
import '@anypoint-web-components/awc/anypoint-menu-button.js';
import '@anypoint-web-components/awc/anypoint-listbox.js';
import '@anypoint-web-components/awc/anypoint-item.js';
import { ActionCondition } from '../../lib/actions/ActionCondition.js';
import styles from './styles/ActionsPanel.styles.js';
import commonStyles from './styles/ActionPanels-common.style.js';
import '../../../define/arc-action-editor.js';
import '../../../define/arc-condition-editor.js';
import { allowedActions } from './Utils.js';
import {
  tutorialTpl,
  addActionTpl,
  addConditionTpl,
  actionsListTpl,
  actionTpl,
  introTextTpl,
  duplicateHandler,
  notifyChange,
  changeHandler,
  removeHandler,
  addHandler,
  openTutorialHandler,
} from './internals.js';

/** @typedef {import('../../lib/actions/ArcAction.js').ArcAction} ArcAction */
/** @typedef {import('lit-html').TemplateResult} TemplateResult */
/** @typedef {import('@anypoint-web-components/awc').AnypointListboxElement} AnypointListbox */
/** @typedef {import('@anypoint-web-components/awc').AnypointMenuButtonElement} AnypointMenuButton */
/** @typedef {import('@advanced-rest-client/events').Actions.Condition} Condition */
/** @typedef {import('@advanced-rest-client/events').Actions.ActionType} ActionType */
/** @typedef {import('@advanced-rest-client/events').Actions.RunnableAction} RunnableAction */

export const conditionsValue = Symbol('conditionsValue');
export const actionsItemTemplate = Symbol('actionsItemTemplate');
export const conditionTemplate = Symbol('conditionTemplate');
export const addConditionHandler = Symbol('addConditionHandler');
export const conditionRemoveHandler = Symbol('conditionRemoveHandler');
export const conditionChangeHandler = Symbol('conditionChangeHandler');
export const addResponseAction = Symbol('addResponseAction');
export const addRequestAction = Symbol('addRequestAction');

/**
 * Reads indexes of an action editor from the editor `data-*` attributes.
 * @param {Event} e
 * @return {number[]} First item is condition index and the second is the action index
 * inside the condition.
 */
const getActionIndexes = (e) => {
  const { target } = e;
  const data = /** @type DOMStringMap */ (/** @type {HTMLElement} */ (target).dataset);
  const cIndex = Number(data.conditionIndex);
  const aIndex = Number(data.actionIndex);
  if (Number.isNaN(cIndex) || Number.isNaN(aIndex)) {
    return [];
  }
  return [cIndex, aIndex];
}

export default class ARCActionsPanelElement extends LitElement {
  static get styles() {
    return [styles, commonStyles];
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
       * A type of actions this panel renders. The actions are using
       * type defined in the action definition. This property is used by the tutorial.
       */
      type: { type: String, reflect: true }
    };
  }

  /**
   * @return {ActionCondition[]|null} Rendered list of conditions
   */
  get conditions() {
    return this[conditionsValue];
  }

  /**
   * @param {ActionCondition[]|null} value List of conditions to render.
   */
  set conditions(value) {
    const old = this[conditionsValue];
    const items = ActionCondition.importExternal(value);
    if (old === items) {
      return;
    }
    this[conditionsValue] = items;
    this.requestUpdate();
  }

  /**
   * @return {boolean} Returns true when the element has any condition set.
   */
  get hasConditions() {
    const { conditions } = this;
    return !!(conditions && conditions.length);
  }

  constructor() {
    super();
    /**
     * @type {ActionCondition[]|null}
     */
    this.conditions = null;
    /**
     * @type {ActionType}
     */
    this.type = null;
    this.anypoint = false;
    this.outlined = false;
  }

  /**
   * Adds a new, empty action to the list of actions for a condition identified by its index.
   *
   * @param {string} name The name of the action to add.
   * @param {number=} index For the response actions, index of the condition
   */
  add(name, index) {
    if (!Array.isArray(this.conditions)) {
      this.conditions = [];
    }
    if (this.type === 'request') {
      this[addRequestAction](name, index);
    } else {
      this[addResponseAction](name, index);
    }
    this.requestUpdate();
  }

  /**
   * Adds a new empty action to the request actions.
   * @param {string} name 
   * @param {number=} index For the response actions, index of the condition
   */
  [addRequestAction](name, index) {
    if (!this.conditions.length) {
      const condition = ActionCondition.defaultCondition('request');
      condition.alwaysPass = true;
      const action = new ActionCondition({
        condition, 
        type: this.type,
        actions: [],
        enabled: true,
      });
      action.add(name);
      this.conditions.push(action);
    } else {
      const action = this.conditions[index];
      action.add(name);
    }
  }

  /**
   * Adds a new empty action to the response actions.
   * @param {string} name  The name of the action
   * @param {number} index The condition index to where to put the action into
   */
  [addResponseAction](name, index) {
    if (!this.conditions.length) {
      const condition = ActionCondition.defaultCondition(this.type);
      condition.alwaysPass = false;
      const action = new ActionCondition({
        condition, 
        type: this.type,
        enabled: true,
        actions: [],
      });
      action.add(name);
      this.conditions.push(action);
    } else {
      const action = this.conditions[index];
      action.add(name);
    }
  }

  /**
   * Dispatches the URL open event to open an URL.
   */
  [openTutorialHandler]() {
    const url = 'https://docs.advancedrestclient.com/using-arc/request-actions';
    ArcNavigationEvents.navigateExternal(this, url);
  }

  /**
   * Handler for a click on "Add action button".
   *
   * @param {CustomEvent} e
   */
  [addHandler](e) {
    const node = /** @type AnypointListbox */ (e.target);
    const menu = /** @type AnypointMenuButton */ (node.parentElement);
    const { selectedItem } = node;
    const index = Number(menu.dataset.index);
    if (!selectedItem || Number.isNaN(index)) {
      return;
    }
    const { name } = selectedItem.dataset;
    if (!name) {
      return;
    }
    this.add(name, index);
    this[notifyChange]();
  }

  /**
   * Handler for a click on "Delete action button".
   *
   * @param {CustomEvent} e
   */
  [removeHandler](e) {
    const [ci, ai] = getActionIndexes(e);
    if (ci === undefined || ai === undefined) {
      return;
    }
    const cItem = this.conditions[ci];
    cItem.actions.splice(ai, 1);
    this.requestUpdate();
    this[notifyChange]();
  }

  /**
   * Handler for a change made in the editor.
   *
   * @param {CustomEvent} e
   */
  [changeHandler](e) {
    const [ci, ai] = getActionIndexes(e);
    if (ci === undefined || ai === undefined) {
      return;
    }
    const cItem = this.conditions[ci];
    const item = cItem.actions[ai];
    const { prop = '' } = e.detail;
    if (prop.indexOf('.') === -1) {
      item[prop] = e.target[prop];
    } else {
      // Deep paths are passed by a reference so they are already updated
      // on the source object.

      // let tmp = item;
      // let last = '';
      // const parts = String(prop).split('.');
      // parts.forEach((current, i, arr) => {
      //   if (arr.length === i + 1) {
      //     last = current;
      //     return;
      //   }
      //   if (!tmp[current]) {
      //     tmp[current] = {};
      //   }
      //   tmp = tmp[current];
      // });
      // tmp[last] = e.target[last];
    }
    this[notifyChange]();
  }

  [notifyChange]() {
    this.dispatchEvent(new CustomEvent('change'));
  }

  /**
   * A handler for the duplicate action event
   * @param {CustomEvent} e
   */
  [duplicateHandler](e) {
    const [ci, ai] = getActionIndexes(e);
    if (ci === undefined || ai === undefined) {
      return;
    }
    const condition = this.conditions[ci];
    const source = condition.actions[ai];
    const action = source.clone();
    condition.actions.push(action);
    this[notifyChange]();
    this.requestUpdate();
  }

  [addConditionHandler]() {
    const condition = ActionCondition.defaultCondition(this.type);
    const actions = new ActionCondition({
      condition, 
      type: this.type,
      enabled: true,
      actions: [],
    });
    if (!Array.isArray(this.conditions)) {
      this.conditions = [];
    }
    this.conditions.push(actions);
    this[notifyChange]();
    this.requestUpdate();
  }

  [conditionChangeHandler](e) {
    const { target } = e;
    const data = /** @type DOMStringMap */ (/** @type {HTMLElement} */ (target).dataset);
    const cIndex = Number(data.conditionIndex);
    if (Number.isNaN(cIndex)) {
      return;
    }
    const cAction = this.conditions[cIndex];
    const { prop } = e.detail;
    cAction[prop] = target[prop];
    this[notifyChange]();
  }

  [conditionRemoveHandler](e) {
    const { target } = e;
    const data = /** @type DOMStringMap */ (/** @type {HTMLElement} */ (target).dataset);
    const cIndex = Number(data.conditionIndex);
    if (Number.isNaN(cIndex)) {
      return;
    }
    this.conditions.splice(cIndex, 1);
    this[notifyChange]();
    this.requestUpdate();
  }

  render() {
    const { hasConditions } = this;
    return html`
      ${this[tutorialTpl]()}
      ${hasConditions ? this[actionsListTpl]() : ''}
      ${this[addConditionTpl]()}
    `;
  }

  /**
   * @return {TemplateResult} Template for the tutorial.
   */
  [tutorialTpl]() {
    const { anypoint } = this;
    return html`
    <div class="tutorial-section">
      ${this[introTextTpl]()}
      <anypoint-button
        ?anypoint="${anypoint}"
        @click="${this[openTutorialHandler]}"
        class="self-center"
      >Learn more</anypoint-button>
    </div>
    `;
  }

  [introTextTpl]() {
    const { type } = this;
    let label;
    if (type === 'request') {
      label = `Request actions allows you to execute predefined logic before the request is executed.
      When an action fails then the request is not executed.`;
    } else if (type === 'response') {
      label = `Response actions allows you to execute predefined logic after the response is ready.
      Actions are grouped into response conditions. When the condition is meet actions in this group are executed.`;
    }
    return html`
      <p class="content">${label}</p>
    `;
  }

  /**
   * @param {number=} index An index of a condition to add the action to.
   * @return {TemplateResult} Template for the add action dropdown button
   */
  [addActionTpl](index) {
    const { anypoint } = this;
    return html`
      <div class="add-action-line">
        <anypoint-menu-button
          closeOnActivate
          data-index="${index}"
          ?anypoint="${anypoint}"
        >
          <anypoint-button slot="dropdown-trigger" data-action="add-action" ?anypoint="${anypoint}">Add action</anypoint-button>
          <anypoint-listbox ?anypoint="${anypoint}" slot="dropdown-content" @selected="${this[addHandler]}">
            <anypoint-item data-name="set-variable" ?anypoint="${anypoint}">Set variable</anypoint-item>
            <anypoint-item data-name="set-cookie" ?anypoint="${anypoint}">Set cookie</anypoint-item>
            <anypoint-item data-name="delete-cookie" ?anypoint="${anypoint}">Delete cookie</anypoint-item>
          </anypoint-listbox>
        </anypoint-menu-button>
      </div>
    `;
  }

  [addConditionTpl]() {
    const { anypoint } = this;
    return html`
    <anypoint-button
      ?anypoint="${anypoint}"
      @click="${this[addConditionHandler]}"
      data-action="add-condition"
    >Add condition</anypoint-button>
    `;
  }

  /**
   * @return {TemplateResult[]} List of templates for current conditions.
   */
  [actionsListTpl]() {
    const { conditions } = this;
    const result = conditions.map((condition, index) => this[actionsItemTemplate](condition, index));
    return /** @type TemplateResult[] */ (result);
  }

  /**
   * @param {ActionCondition} conditionAction
   * @param {number} index
   * @return {TemplateResult|TemplateResult[]|string[]}
   */
  [actionsItemTemplate](conditionAction, index) {
    const { actions } = conditionAction;
    return html`
    <div class="condition-wrapper">
      ${this[conditionTemplate](conditionAction, index)}
      ${actions.map((action, i) => this[actionTpl](action, index, i))}
      ${this[addActionTpl](index)}
    </div>
    `;
  }

  /**
   * @param {ActionCondition} conditionAction The definition of the condition
   * @param {number} conditionIndex Condition action's index in the `conditions` array.
   * @return {TemplateResult} Template for the condition
   */
  [conditionTemplate](conditionAction, conditionIndex) {
    const { enabled, condition } = conditionAction;
    const { outlined, anypoint, type } = this;
    return html`
      <arc-condition-editor
        .condition="${condition}"
        .type="${type}"
        ?enabled="${enabled}"
        ?outlined="${outlined}"
        ?anypoint="${anypoint}"
        data-condition-index="${conditionIndex}"
        @change="${this[conditionChangeHandler]}"
        @remove="${this[conditionRemoveHandler]}"
      ></arc-condition-editor>
    `;
  }

  /**
   * @param {ArcAction} action An action definition
   * @param {number} conditionIndex Condition action's index in the `conditions` array.
   * @param {number} actionIndex Action index in the condition
   * @return {string|TemplateResult} Template for an action
   */
  [actionTpl](action, conditionIndex, actionIndex) {
    const { name, type, enabled, priority, config, sync, failOnError, view = {} } = action;
    if (allowedActions.indexOf(name) === -1) {
      return '';
    }
    const { outlined, anypoint } = this;
    return html`
      <arc-action-editor
        name="${name}"
        type="${type}"
        ?enabled="${enabled}"
        priority="${priority}"
        .config="${config}"
        ?sync="${sync}"
        ?failOnError="${failOnError}"
        ?opened="${view.opened}"
        ?outlined="${outlined}"
        ?anypoint="${anypoint}"
        data-condition-index="${conditionIndex}"
        data-action-index="${actionIndex}"
        @remove="${this[removeHandler]}"
        @change="${this[changeHandler]}"
        @duplicate="${this[duplicateHandler]}"
      ></arc-action-editor>
    `;
  }
}
