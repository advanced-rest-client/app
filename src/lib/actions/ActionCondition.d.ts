// import { ConditionSchema, ArcActionsOptions } from './types';
import { ArcAction } from './ArcAction';
import { RunnableAction, Condition, Action, ActionType } from '@advanced-rest-client/events/src/actions/Actions';
import { ArcBaseRequest, ARCSavedRequest, ARCHistoryRequest, TransportRequest } from '@advanced-rest-client/events/src/request/ArcRequest';
import { ErrorResponse, Response } from '@advanced-rest-client/events/src/request/ArcResponse';

/**
 * A class that represents ARC actions that run after meeting a condition.
 */
export declare class ActionCondition {
  /**
   * Creates a default value for a condition.
   * @param type The type of the condition.
   */
  static defaultCondition(type?: ActionType): Condition;

  /**
   * Creates a default configuration of an action
   * @param type The type of the action.
   */
  static defaultAction(type?: ActionType): Action;

  /**
   * Creates a list of actions from an external source.
   */
  static importExternal(actions: (RunnableAction|ActionCondition)[]): ActionCondition[];

  /**
   * @returns Instance of ArcActions from passed values.
   */
  static importAction(item: RunnableAction|ActionCondition): ActionCondition;

  condition: Condition;
  
  type: ActionType;
  
  actions: ArcAction[];
  
  enabled: boolean;
  /**
   * @param condition The condition definition
   * @param type The type of actions held in the `actions`. Either `request` or `response`.
   * @param opts Optional parameters
   */
  constructor(init: RunnableAction);

  /**
   * Tests whether the condition is satisfied for request and/or response.
   *
   * @param request The ARC request object.
   * @param response The ARC response object, if available.
   * @returns True when the condition is satisfied.
   */
  satisfied(request: ArcBaseRequest | ARCSavedRequest | ARCHistoryRequest, executed?: TransportRequest, response?: Response|ErrorResponse): boolean;

  /**
   * Adds a new, empty action to the list of actions.
   * If actions list hasn't been initialized then it creates it.
   *
   * @param name The name of the action to add.
   */
  add(name: string): void;
  /**
   * Makes a clone of the condition with actions.
   * @returns A deep copy of this object.
   */
  clone(): ActionCondition;
}


/**
 * Maps runnables interface to 
 * If an item is not an instance of `ArcAction` then it creates an instance of it
 * by passing the map as an argument.
 *
 * @param value Passed list of actions.
 * @returns Mapped actions.
 */
export declare function mapRunnables(value: (RunnableAction|ActionCondition)[]): ActionCondition[];
