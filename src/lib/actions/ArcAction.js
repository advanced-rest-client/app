/* eslint-disable no-param-reassign */
import { recursiveDeepCopy } from '../Copy.js';

/** @typedef {import('@advanced-rest-client/events').Actions.RunnableAction} RunnableAction */
/** @typedef {import('@advanced-rest-client/events').Actions.Action} Action */
/** @typedef {import('@advanced-rest-client/events').Actions.ActionType} ActionType */
/** @typedef {import('@advanced-rest-client/events').Actions.ActionViewConfiguration} ActionViewConfiguration */
/** @typedef {import('@advanced-rest-client/events').Actions.ActionConfiguration} ActionConfiguration */

/**
 * A class describing a runnable action in Advanced REST Client.
 */
export class ArcAction {
  /**
   * @param {Action} init The initialization object with predefined values
   */
  constructor(init) {
    const {
      type = 'request',
      name = null,
      enabled = false,
      priority = 1,
      config = {},
      sync = true,
      failOnError = true,
      view = {
        opened: true,
      },
    } = init;
    /**
     * Type of the action. Can be either `request` or `response`. Default to
     * request.
     * @type {ActionType}
     */
    this.type = type;
    /**
     * Action name.
     * @type {string}
     */
    this.name = name;
    /**
     * Whether the action is enabled.
     * @type {boolean}
     */
    this.enabled = enabled;
    /**
     * Action priority
     * @type {number}
     */
    this.priority = priority;
    /**
     * Action configuration
     * @type {ActionConfiguration}
     */
    this.config = config;
    /**
     * Whether or not the action is executed synchronously to request / response
     * @type {boolean}
     */
    this.sync = sync;
    /**
     * Whether or not the request should fail when the action fails.
     * @type {boolean}
     */
    this.failOnError = failOnError;
    /**
     * @type {ActionViewConfiguration}
     */
    this.view = view;
  }

  /**
   * Returns a clone if this object.
   * @return {ArcAction}
   */
  clone() {
    const init = recursiveDeepCopy(this);
    return new ArcAction(init);
  }

  /**
   * Serializes this object
   * @returns {Action}
   */
  toJSON() {
    return {
      type: this.type,
      name: this.name,
      enabled: this.enabled,
      priority: this.priority,
      config: this.config,
      sync: this.sync,
      failOnError: this.failOnError,
      view: this.view,
    }
  }
}


/**
 * Maps actions list to a list of `ArcAction` instances.
 * If an item is not an instance of `ArcAction` then it creates an instance of it
 * by passing the map as an argument.
 *
 * @param {(Action|ArcAction)[]} value Passed list of actions.
 * @returns {ArcAction[]} Mapped actions.
 */
export const mapActions = (value) => {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map((item) => 
     new ArcAction(item)
    // if (!(item instanceof ArcAction)) {
    //   return new ArcAction(item);
    // }
    // return item;
  );
};

/**
 * Sort function for actions to sort them for the execution order.
 * @param {ArcAction} a 
 * @param {ArcAction} b 
 */
export function sortActions(a, b) {
  const { priority: p1 } = a;
  const { priority: p2 } = b;
  if (p1 > p2) {
    return 1;
  }
  if (p2 > p1) {
    return -1;
  }
  return 0;
}
