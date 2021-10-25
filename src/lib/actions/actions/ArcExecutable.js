/* eslint-disable class-methods-use-this */
/* eslint-disable no-empty-function */
/** @typedef {import('../ArcAction').ArcAction} ArcAction */
/** @typedef {import('../../../types').ArcExecutableInit} ArcExecutableInit */

export class ArcExecutable {
  /**
   * @param {ArcAction} action The action configuration
   * @param {EventTarget=} [eventTarget=window] An target to use to dispatch DOM events.
   * @param {ArcExecutableInit=} init Action additional configuration. All parameters are optional and depends in the context.
   */
  constructor(action, eventTarget=window, init={}) {
    this.action = Object.freeze({ ...action });
    this.eventTarget = eventTarget;
    this.init = Object.freeze({ ...init });
  }

  /**
   * Runs the action.
   *
   * @return {Promise<any>} Promise resolved when the actions is executed.
   */
  async execute() {}
}
