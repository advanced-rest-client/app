import { LitElement, TemplateResult } from 'lit-element';
import { RunnableAction } from '@advanced-rest-client/events/src/actions/Actions';
import { ActionCondition } from '../../lib/actions/ActionCondition.js';
import { ArcAction } from '../../lib/actions/ArcAction.js';
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

/** @typedef {import('./ArcAction.js').ArcAction} ArcAction */
/** @typedef {import('lit-html').TemplateResult} TemplateResult */
/** @typedef {import('@anypoint-web-components/anypoint-listbox').AnypointListbox} AnypointListbox */
/** @typedef {import('@anypoint-web-components/anypoint-menu-button').AnypointMenuButton} AnypointMenuButton */
/** @typedef {import('@advanced-rest-client/events').Actions.Condition} Condition */

export declare const conditionsValue: unique symbol;
export declare const actionsItemTemplate: unique symbol;
export declare const conditionTemplate: unique symbol;
export declare const addConditionHandler: unique symbol;
export declare const conditionRemoveHandler: unique symbol;
export declare const conditionChangeHandler: unique symbol;
export declare const addResponseAction: unique symbol;
export declare const addRequestAction: unique symbol;
export declare const duplicateRequestAction: unique symbol;
export declare const duplicateResponseAction: unique symbol;

export default class ARCActionsPanelElement extends LitElement {

  /**
   * Enables Anypoint theme
   * @attribute
   */
  anypoint: boolean;
  /**
   * Enables outlined MD theme
   * @attribute
   */
  outlined: boolean;
  /**
   * A type of actions this panel renders. The actions are using
   * type defined in the action definition. This property is used by the tutorial.
   * @attribute
   */
  type: string;

  /**
   * Current list of actions
   */
  conditions: (RunnableAction|ActionCondition)[]|null;
  [conditionsValue]: ActionCondition[]|null;

  /**
   * Returns true when the element has any condition set.
   */
  get hasConditions(): boolean;

  constructor();

  /**
   * Adds a new, empty action to the list of actions for a condition identified by its index.
   *
   * @param name The name of the action to add.
   * @param index For the response actions, index of the condition
   */
  add(name: string, index?: number): void;

  /**
   * Adds a new empty action to the request actions.
   * @param name 
   * @param index For the response actions, index of the condition
   */
  [addRequestAction](name: string, index?: number): void;

  /**
   * Adds a new empty action to the response actions.
   * @param name  The name of the action
   * @param index The condition index to where to put the action into
   */
  [addResponseAction](name: string, index?: number): void;

  /**
   * Dispatches the URL open event to open an URL.
   */
  [openTutorialHandler](): void;

  /**
   * Handler for a click on "Add action button".
   */
  [addHandler](e: CustomEvent): void;

  /**
   * Handler for a click on "Delete action button".
   */
  [removeHandler](e: CustomEvent): void;

  /**
   * Handler for a change made in the editor.
   */
  [changeHandler](e: CustomEvent): void;

  [notifyChange](): void;

  /**
   * A handler for the duplicate action event
   */
  [duplicateHandler](e: CustomEvent): void;

  /**
   * Duplicates a request condition and adds it to the conditions list
   * @param conditionIndex The index of the condition object to copy
   */
  [duplicateRequestAction](conditionIndex: number): void;

  /**
   * Duplicates an action inside a response condition
   * @param conditionIndex The index of the condition object that contains the action to copy
   * @param actionIndex The action index to copy into the condition
   */
  [duplicateResponseAction](conditionIndex: number, actionIndex: number): void;

  [addConditionHandler](): void;

  [conditionChangeHandler](e: CustomEvent): void;

  [conditionRemoveHandler](e: CustomEvent): void;

  render(): TemplateResult;

  /**
   * @returns Template for the tutorial.
   */
  [tutorialTpl](): TemplateResult;

  [introTextTpl](): TemplateResult;

  /**
   * @param index An index of a condition to add the action to.
   * @returns Template for the add action dropdown button
   */
  [addActionTpl](index?: number): TemplateResult;

  [addConditionTpl](): TemplateResult;

  /**
   * @returns List of templates for current actions.
   */
  [actionsListTpl](): TemplateResult[];

  [actionsItemTemplate](conditionAction: ActionCondition, index: number): TemplateResult;

  /**
   * @param conditionAction The definition of the condition
   * @param conditionIndex Condition action's index in the `actions` array.
   * @returns Template for the condition
   */
  [conditionTemplate](conditionAction: ActionCondition, conditionIndex: number): TemplateResult;

  /**
   * @param action An action definition
   * @param conditionIndex Condition action's index in the `actions` array.
   * @param actionIndex Action index in the condition
   * @returns Template for an action
   */
  [actionTpl](action: ArcAction, conditionIndex: number, actionIndex: number): TemplateResult|string;
}
