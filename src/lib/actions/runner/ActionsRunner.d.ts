import { ArcRequest } from '@advanced-rest-client/events';
import { SystemVariables } from '@advanced-rest-client/events/src/models/Variable';
import { TransportRequest } from '@advanced-rest-client/events/src/request/ArcRequest';
import { ErrorResponse, Response } from '@advanced-rest-client/events/src/request/ArcResponse';
import { VariablesProcessor } from '../../../lib/variables/VariablesProcessor';
import { ArcAction } from '../ArcAction.js';
import { ActionsRunnerInit, RequestProcessOptions, ResponseProcessOptions } from '../../../types';
import { ActionRunner } from './ActionRunner.js';

/**
 * The main class that executes actions for a request and a response in Advanced REST Client.
 */
export declare class ActionsRunner {
  jexl: any;
  eventsTarget: EventTarget;

  /**
   * @param config Configuration options
   */
  constructor(config: ActionsRunnerInit);

  /**
   * Takes the ARC editor request object and runs the request actions added to it.
   * 
   * Note, actions are executed one-by-one in order defined by the `priority` property. The final request object may be changed.
   * 
   * @param request ARC request object generated by the request editor.
   * @returns Promise resolved to the passed request object. It may be a copy.
   * @throws {Error} When required arguments are not set.
   */
  processRequestActions(request: ArcRequest.ArcEditorRequest, options?: RequestProcessOptions): Promise<ArcRequest.ArcEditorRequest>;

  /**
   * Runs asynchronous action
   */
  runAsynchronousAction(runner: ActionRunner): Promise<void>;

  /**
   * Processes actions when response object is ready.
   * 
   * @param request ARC request object generated by the request editor.
   * @param executed The request reported by the transport library
   * @param response ARC response object.
   * @returns A promise resolved when actions were performed.
   */
  processResponseActions(request: ArcRequest.ArcEditorRequest, executed: TransportRequest, response: Response|ErrorResponse, options?: ResponseProcessOptions): Promise<void>;

  /**
   * Evaluates variables in the action.
   * @param action An action to evaluate.
   * @param processor Initialized variables processor with the current environment
   * @returns Resolved to an action without variables.
   */
  evaluateAction(action: ArcAction, processor?: VariablesProcessor, systemVariables?: SystemVariables): Promise<ArcAction>;
}
