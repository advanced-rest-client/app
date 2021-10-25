import { LitElement, TemplateResult } from 'lit-element';
import '../arc-actions-panel.js';
import {
  tabHandler,
  actionsHandler,
  notifyChange,
  tabsTpl,
  requestActionsTpl,
  responseActionsTpl,
  panelTpl,
} from './internals.js';
import { ActionCondition } from '../../lib/actions/ActionCondition.js';
import { RunnableAction } from '@advanced-rest-client/events/src/actions/Actions';

export declare const conditionChangeEvent: string;
export declare const selectedChangeEvent: string;
export declare const requestConditionsValue: unique symbol;
export declare const responseConditionsValue: unique symbol;
export declare const tutorialTemplate: unique symbol;
export declare const onChangeValue: unique symbol;
export declare const onSelectedValue: unique symbol;

/**
 * An HTML element that renders a panel with request and response
 * actions.
 * 
 * @fires change When value in the editor change. The detail has the `type` property indicating which property has changes.
 * @fires selectedchange When the panel selection change
 */
export default class ARCActionsElement extends LitElement {

  /**
   * A list of response conditions and actions.
   */
  response: (ActionCondition|RunnableAction)[];
  /**
   * A list of request conditions and actions.
   */
  request: (ActionCondition|RunnableAction)[];
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
   * Currently selected tab.
   * @attribute
   */
  selected: number;

  onchange: EventListener|null;
  [onChangeValue]: EventListener|null;

  onselectedchange: EventListener|null;
  [onSelectedValue]: EventListener|null;

  constructor();

  [tabHandler](e: CustomEvent): void;

  [actionsHandler](e: CustomEvent): void;

  [notifyChange](type: string): void;

  render(): TemplateResult;

  /**
   * @returns Template for the tutorial
   */
  [tutorialTemplate](): TemplateResult;

  /**
   * @returns The template for the context tabs
   */
  [tabsTpl](): TemplateResult;

  /**
   * @returns The template for the request actions panel
   */
  [requestActionsTpl](): TemplateResult|string;

  /**
   * @returns The template for the response actions panel
   */
  [responseActionsTpl](): TemplateResult|string;

  /**
   * @param conditions The list of conditions to render.
   * @param type The type of the UI.
   * @returns  The template for the actions panel
   */
  [panelTpl](conditions: ActionCondition[], type: string): TemplateResult;
}
