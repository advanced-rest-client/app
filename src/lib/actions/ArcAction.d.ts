import { Action, ActionConfiguration, ActionViewConfiguration } from '@advanced-rest-client/events/src/actions/Actions';

/**
 * A class describing a runnable action in Advanced REST Client.
 *
 * The difference to using regular object is that it contains utility methods
 * for generating JSON and cloning the object.
 */
export declare class ArcAction {
  /**
   * Type of the action. Can be either `request` or `response`. Default to
   * request.
   */
  type: string;
  /**
   * Action name.
   */
  name: string;
  /**
   * Whether the action is enabled.
   */
  enabled: boolean;
  /**
   * Action priority
   */
  priority: number;
  /**
   * Action configuration
   */
  config: ActionConfiguration;
  /**
   * Whether or not the action is executed synchronously to request / response
   */
  sync: boolean;
  /**
   * Whether or not the request should fail when the action fails.
   */
  failOnError: boolean;
  /**
   * The view configuration
   */
  view: ActionViewConfiguration;
  /**
   * @param init The initialization object with predefined values
   */
  constructor(init: Action);

  /**
   * Returns a clone if this object.
   */
  clone(): ArcAction;

  /**
   * Serializes this object
   */
  toJSON(): Action;
}


/**
 * Maps actions list to a list of `ArcAction` instances.
 * If an item is not an instance of `ArcAction` then it creates an instance of it
 * by passing the map as an argument.
 *
 * @param value Passed list of actions.
 * @returns Mapped actions.
 */
export declare function mapActions(value: (Action|ArcAction)[]): ArcAction[];

/**
 * Sort function for actions to sort them for the execution order.
 */
export declare function sortActions(a: ArcAction, b: ArcAction): number;
