/* eslint-disable no-param-reassign */
import { ArcAction, mapActions } from './ArcAction.js';
import { RequestDataExtractor } from './runner/RequestDataExtractor.js';
import { checkCondition } from './runner/ConditionRunner.js';
import { recursiveDeepCopy } from '../Copy.js';

/** @typedef {import('@advanced-rest-client/events').Actions.RunnableAction} RunnableAction */
/** @typedef {import('@advanced-rest-client/events').Actions.Condition} Condition */
/** @typedef {import('@advanced-rest-client/events').Actions.Action} Action */
/** @typedef {import('@advanced-rest-client/events').Actions.ActionType} ActionType */
/** @typedef {import('@advanced-rest-client/events').Actions.OperatorEnum} OperatorEnum */
/** @typedef {import('@advanced-rest-client/events').ArcRequest.ArcBaseRequest} ArcBaseRequest */
/** @typedef {import('@advanced-rest-client/events').ArcRequest.ARCSavedRequest} ARCSavedRequest */
/** @typedef {import('@advanced-rest-client/events').ArcRequest.ARCHistoryRequest} ARCHistoryRequest */
/** @typedef {import('@advanced-rest-client/events').ArcRequest.TransportRequest} TransportRequest */
/** @typedef {import('@advanced-rest-client/events').ArcResponse.Response} Response */
/** @typedef {import('@advanced-rest-client/events').ArcResponse.ErrorResponse} ErrorResponse */

/**
 * A class that represents ARC condition that runs actions when the condition is met.
 */
export class ActionCondition {
  /**
   * Creates a default value for a condition.
   * @param {ActionType} [type='response'] The type of the condition.
   * @return {Condition}
   */
  static defaultCondition(type='response') {
    const source = 'url';
    const operator = 'equal';
    const result = /** @type Condition */ ({
      alwaysPass: false,
      type,
      source,
      operator,
      path: '',
      predictedValue: '',
      view: {
        opened: true,
      }
    });
    return result;
  }

  /**
   * Creates a default configuration of an action
   * @param {ActionType} [type='response'] The type of the action.
   * @return {Action}
   */
  static defaultAction(type='response') {
    return {
      type,
      name: 'New action',
      config: {
        source: {
          type,
          source: 'body',
        },
        name: '',
      },
      failOnError: false,
      priority: 0,
      sync: false,
      view: {},
      enabled: true,
    };
  }

  /**
   * Creates a list of actions from an external source.
   *
   * @param {(RunnableAction|ActionCondition)[]} actions
   * @return {ActionCondition[]}
   */
  static importExternal(actions) {
    if (!Array.isArray(actions)) {
      return [];
    }
    return actions.map((item) => ActionCondition.importAction(item));
  }

  /**
   * @param {RunnableAction|ActionCondition} item
   * @return {ActionCondition} Instance of ArcActions from passed values.
   */
  static importAction(item) {
    const { condition = ActionCondition.defaultCondition(), type = 'request', actions=[], enabled } = item;
    return new ActionCondition({
      condition, 
      type, 
      // @ts-ignore
      actions,
      enabled,
    });
  }
  
  /**
   * @param {RunnableAction} init The condition configuration.
   */
  constructor(init) {
    /**
     * @type {Condition}
     */
    this.condition = { ...init.condition };
    /**
     * @type {ActionType}
     */
    this.type = init.type;
    /**
     * @type {ArcAction[]}
     */
    this.actions = mapActions(init.actions);
    /**
     * @type {boolean}
     */
    this.enabled = init.enabled || false;
  }

  /**
   * Tests whether the condition is satisfied for request and/or response.
   *
   * @param {ArcBaseRequest | ARCSavedRequest | ARCHistoryRequest} request The ARC request object.
   * @param {TransportRequest=} executed The request object representing the actual request that has been executed by the transport library.
   * @param {Response|ErrorResponse=} response The ARC response object, if available.
   * @return {boolean} True when the condition is satisfied.
   */
  satisfied(request, executed, response) {
    if (!this.enabled) {
      return false;
    }
    if (this.condition.alwaysPass === true) {
      return true;
    }
    const extractor = new RequestDataExtractor({
      request,
      response,
      executedRequest: executed,
    });
    const value = extractor.extract(this.condition);
    const op = /** @type OperatorEnum */ (this.condition.operator);
    return checkCondition(value, op, this.condition.predictedValue);
  }

  /**
   * Adds a new, empty action to the list of actions.
   * If actions list hasn't been initialized then it creates the list.
   *
   * @param {string} name The name of the action to add.
   */
  add(name) {
    if (!Array.isArray(this.actions)) {
      this.actions = [];
    }
    const { type } = this;
    const init = ActionCondition.defaultAction(type);
    init.name = name;
    init.view.opened = true;
    const action = new ArcAction(init);
    this.actions.push(action);
  }

  /**
   * Makes a clone of the condition with actions.
   * @returns {ActionCondition} A deep copy of this object.
   */
  clone() {
    const init = recursiveDeepCopy(this);
    const copy = new ActionCondition(init);
    return copy;
  }
}


/**
 * Maps runnables interface to 
 * If an item is not an instance of `ArcAction` then it creates an instance of it
 * by passing the map as an argument.
 *
 * @param {(RunnableAction|ActionCondition)[]} value Passed list of actions.
 * @returns {ActionCondition[]} Mapped actions.
 */
export const mapRunnables = (value) => {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map((item) => {
    if (!(item instanceof ActionCondition)) {
      return new ActionCondition(item);
    }
    return item;
  });
};
