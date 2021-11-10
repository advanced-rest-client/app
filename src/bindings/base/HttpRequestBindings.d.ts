import { TransportRequestSource, ArcRequest, ArcResponse, Config, ApiTransportEvent, ConfigStateUpdateEvent } from '@advanced-rest-client/events';
import { RequestFactory } from '@advanced-rest-client/base';
import { ApiRequestEvent, AbortRequestEvent, ApiConsoleRequest } from '@api-components/amf-components';
import Jexl from 'jexl'
import { PlatformBindings } from './PlatformBindings.js';

export interface ConnectionFactory {
  abort(): void;
}

export interface ConnectionInfo {
  connection: ConnectionFactory;
  request: ArcRequest.ArcBaseRequest;
  aborted: boolean;
  source: TransportRequestSource;
}

/**
 * Base bindings for handling HTTP request for ARC and API Console.
 */
export class HttpRequestBindings extends PlatformBindings {
  /** 
   * @returns {boolean} Whether the application variables are enabled.
   */
  get variablesEnabled(): boolean

  /** 
   * @returns {boolean} Whether the application should process system variables.
   */
  get systemVariablesEnabled(): boolean

  /** 
   * @returns {boolean} Whether to validate SSL certificates.
   */
  get validateCertificates(): boolean

  /** 
   * @returns {boolean} Whether the request should follow redirects.
   */
  get followRedirects(): boolean

  /** 
   * @returns {boolean} Whether to use NodeJS' HTTP transport
   */
  get nativeTransport(): boolean

  /** 
   * @returns {boolean} Whether to read OS' hosts file.
   */
  get readOsHosts(): boolean

  /** 
   * @returns {boolean} Whether to add the "default" headers.
   */
  get defaultHeaders(): boolean

  /** 
   * @returns {boolean} Whether proxy is enabled.
   */
  get proxyEnabled(): boolean

  /** 
   * @returns The request default timeout.
   */
  get requestTimeout(): number;
  get proxyUsername(): string|undefined;
  get proxyPassword(): string|undefined;
  get proxy(): string|undefined;

  factory: RequestFactory;
  connections: Map<string, ConnectionInfo>;
  config: Config.ARCConfig;
  constructor(jexl: typeof Jexl);
  initialize(): Promise<void>;
  makeRequestHandler(e: CustomEvent): Promise<void>;
  abortRequestHandler(e: CustomEvent): void;
  transportRequestHandler(e: ApiTransportEvent): Promise<void>;
  configStateChangeHandler(e: ConfigStateUpdateEvent): void;
  /**
   * The logic that runs before the request is sent to the transport.
   * This is for ARC request.
   */
  beforeArcTransport(transportRequest: ArcRequest.ArcEditorRequest): Promise<void>;
  /**
   * Aborts a request
   */
  abort(id: string): void;
  transport(request: ArcRequest.ArcBaseRequest, id: string, config?: ArcRequest.RequestConfig, source?: TransportRequestSource): Promise<void>;
  loadHandler(id: string, response: ArcResponse.Response | ArcResponse.ErrorResponse, transport: ArcRequest.TransportRequest): Promise<void>;
  respondArc(info: ConnectionInfo, id: string, response: ArcResponse.Response | ArcResponse.ErrorResponse, transport: ArcRequest.TransportRequest): Promise<void>;
  respondApiConsole(info: ConnectionInfo, id: string, response: ArcResponse.Response | ArcResponse.ErrorResponse, transport: ArcRequest.TransportRequest): Promise<void>;
  /**
   * A handler for the request error.
   */
  errorHandler(error: Error, id: string, transport?: ArcRequest.TransportRequest, response?: ArcResponse.Response): void;
  /**
   * A handler for the request error for ARC.
   */
  errorArc(info: ConnectionInfo, error: Error, id: string, transport?: ArcRequest.TransportRequest, response?: ArcResponse.Response): void;
  /**
   * A handler for the request error for API Console.
   */
  errorApiConsole(info: ConnectionInfo, error: Error, id: string, transport?: ArcRequest.TransportRequest, response?: ArcResponse.Response): void;
  informStatus(type: string, id: string): void;
  apicRequestHandler(e: ApiRequestEvent): void;
  apicAbortHandler(e: AbortRequestEvent): void;
  apiConsoleRequest(request: ApiConsoleRequest): Promise<void>;
}
