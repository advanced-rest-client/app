import { DeleteCookieAction } from '../actions/DeleteCookieAction.js';
import { SetCookieAction } from '../actions/SetCookieAction.js';
import { SetVariableAction } from '../actions/SetVariableAction.js';

/** @typedef {import('../ArcAction').ArcAction} ArcAction */
/** @typedef {import('../../../types').ArcExecutableInit} ArcExecutableInit */
/** @typedef {import('@advanced-rest-client/events').ArcRequest.ArcBaseRequest} ArcBaseRequest */
/** @typedef {import('@advanced-rest-client/events').ArcRequest.ARCSavedRequest} ARCSavedRequest */
/** @typedef {import('@advanced-rest-client/events').ArcRequest.ARCHistoryRequest} ARCHistoryRequest */
/** @typedef {import('@advanced-rest-client/events').ArcRequest.TransportRequest} TransportRequest */
/** @typedef {import('@advanced-rest-client/events').ArcResponse.Response} Response */
/** @typedef {import('@advanced-rest-client/events').ArcResponse.ErrorResponse} ErrorResponse */


/**
 * A class that is responsible for running a single action.
 */
export class ActionRunner {
  /**
   * @param {ArcAction} action The action configuration
   * @param {EventTarget} eventTarget An target to use to dispatch DOM events.
   * @param {ArcExecutableInit=} init
   */
  constructor(action, eventTarget, init) {
    this.action = action;
    this.eventTarget = eventTarget;
    this.init = init;
  }

  /**
   * Runs the request hook action.
   * 
   * @return {Promise<void>} Promise resolved when the actions is executed.
   */
  async run() {
    const { name } = this.action;
    let instance;
    switch (name)  {
      case 'set-cookie': instance = new SetCookieAction(this.action, this.eventTarget, this.init); break;
      case 'delete-cookie': instance = new DeleteCookieAction(this.action, this.eventTarget, this.init); break;
      case 'set-variable': instance = new SetVariableAction(this.action, this.eventTarget, this.init); break;
      default: return;
    }
    await instance.execute();
  }
}
