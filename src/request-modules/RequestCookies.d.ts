import { ArcEditorRequest, TransportRequest } from '@advanced-rest-client/events/src/request/ArcRequest';
import { ErrorResponse, Response } from '@advanced-rest-client/events/src/request/ArcResponse';
import { ExecutionContext } from '../types';

/**
 * A request engine request module to apply session cookies to a request.
 * It adds stored session cookies when application configuration applies for it (or request configuration, when apply)
 * 
 * Unregister this module when the application settings change to not to use session storage.
 * 
 * In ARC electron the session storage is a chrome persistent partition with a session shared with the "log in to a web service".
 * This way cookies can be acquired in through the browser login and store in the application to use them with the request.
 */
export declare function processRequestCookies(request: ArcEditorRequest, context: ExecutionContext, signal: AbortSignal): Promise<void>;

/**
 * Processes cookies data from the response and inserts them into the session storage
 * 
 * @param request 
 * @param executed The request reported by the transport library
 * @param response ARC response object.
 */
export declare function processResponseCookies(request: ArcEditorRequest, executed: TransportRequest, response: Response|ErrorResponse, context: ExecutionContext): Promise<void>;
