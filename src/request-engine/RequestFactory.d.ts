import { ArcEditorRequest, TransportRequest } from '@advanced-rest-client/events/src/request/ArcRequest';
import { ErrorResponse, Response } from '@advanced-rest-client/events/src/request/ArcResponse';
import { EnvironmentStateDetail } from '@advanced-rest-client/events';
import { RegisteredResponseModule, ExecutionContext, ExecutionEvents, ExecutionStore, RequestProcessOptions, ResponseProcessOptions } from '../types';
import { ActionsRunner } from '../lib/actions/runner/ActionsRunner';

/**
 * The class that is responsible for pre-processing and post-processing the request.
 * 
 * Pre processing part evaluates variables on the request object and then executes request plugins.
 * Post processing 
 */
export declare class RequestFactory {
  eventsTarget: EventTarget;
  jexl: any;
  actions: ActionsRunner;
  abortControllers: Map<string, AbortController>;

  /**
   * @param eventsTarget The reference to a DOM object that is the event target to ARC events.
   * @param jexl A reference to an instance of Jexl library
   */
  constructor(eventsTarget: EventTarget, jexl: any);

  /**
   * Aborts the execution of the current action.
   * @param {string} id
   */
  abort(id: string): void;

  /**
   * Takes the ARC editor request object and runs the request logic.
   * 
   * @param request ARC request object generated by the request editor.
   * @param options Optional processing options.
   * @returns The request object, possible altered by the actions and modules. `null` when the execution was aborted by any of the scripts.
   */
  processRequest(request: ArcEditorRequest, options?: RequestProcessOptions): Promise<ArcEditorRequest|null>;

  /**
   * Processes ARC transport response
   * 
   * @param request ARC request object generated by the request editor.
   * @param executed The request reported by the transport library
   * @param response ARC response object.
   * @param options Optional processing options.
   * @returns A promise resolved when actions were performed.
   */
  processResponse(request: ArcEditorRequest, executed: TransportRequest, response: Response|ErrorResponse, options?: ResponseProcessOptions): Promise<void>;

  /**
   * @param request ARC request object generated by the request editor.
   * @param id The id of the module being executed
   * @param info The module to execute
   * @param environment The current environment
   * @param signal The abort signal
   */
  executeRequestModule(request: ArcEditorRequest, id: string, info: RegisteredResponseModule, environment: EnvironmentStateDetail, signal: AbortSignal): Promise<number>;

  /**
   * @param request ARC request object generated by the request editor.
   * @param executed The request reported by the transport library
   * @param response ARC response object.
   * @param id The id of the module being executed
   * @param info The module to execute
   * @param environment The current environment
   * @param signal The abort signal
   */
  executeResponseModule(request: ArcEditorRequest, executed: TransportRequest, response: Response|ErrorResponse, id: string, info: RegisteredResponseModule, environment: EnvironmentStateDetail, signal: AbortSignal): Promise<number>;

  /**
   * Builds module execution context
   */
  buildExecutionContext(permissions: string[], environment: EnvironmentStateDetail): Promise<Readonly<ExecutionContext>>;

  /**
   * Prepares a map of events passed to the module
   */
  prepareExecutionEvents(): Readonly<ExecutionEvents>;

  /**
   * @param hasEnvironment Whether to add environment events
   */
  prepareExecutionStore(hasEnvironment: boolean): Readonly<ExecutionStore>;
}