import { ArcAction } from '../ArcAction';
import { ArcExecutableInit } from '../../../types';

/**
 * A class that is responsible for running a single action.
 */
export declare class ActionRunner {
  action: ArcAction;
  eventTarget: EventTarget;
  init: ArcExecutableInit;
  
  /**
   * @param action The action configuration
   * @param eventTarget An target to use to dispatch DOM events.
   */
  constructor(action: ArcAction, eventTarget: EventTarget, init: ArcExecutableInit);

  /**
   * Runs the request hook action.
   * 
   * @returns Promise resolved when the actions is executed.
   */
  run(): Promise<void>;
}
