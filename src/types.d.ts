import { Entry, Page } from "har-format";
import { Variable, ArcRequest, WebSocket, EnvironmentStateDetail, Project } from '@advanced-rest-client/events';
import { ActionType, OperatorEnum, IteratorConfiguration } from "@advanced-rest-client/events/src/actions/Actions";
import { ArcBaseRequest, ARCHistoryRequest, ARCSavedRequest, TransportRequest } from "@advanced-rest-client/events/src/request/ArcRequest";
import { ErrorResponse, Response } from "@advanced-rest-client/events/src/request/ArcResponse";
import * as ArcModelEvents from "@advanced-rest-client/events/src/models/ArcModelEvents";
import { IArcNavigationEvents } from "@advanced-rest-client/events/src/navigation/ArcNavigationEvents";
import { ISessionCookieEvents } from "@advanced-rest-client/events/src/cookies/SessionCookieEvents";
import { IEncryptionEvents } from "@advanced-rest-client/events/src/encryption/EncryptionEvents";
import { IGoogleDriveEvents } from "@advanced-rest-client/events/src/googledrive/GoogleDriveEvents";
import { IProcessEvents } from "@advanced-rest-client/events/src/process/ProcessEvents";
import { IWorkspaceEvents } from "@advanced-rest-client/events/src/workspace/WorkspaceEvents";
import { IRequestEvents } from "@advanced-rest-client/events/src/request/RequestEvents";
import { IAuthorizationEvents } from "@advanced-rest-client/events/src/authorization/AuthorizationEvents";
import { IConfigEvents } from "@advanced-rest-client/events/src/config/ConfigEvents";


export declare interface RenderedPage {
  page: Page;
  entries: RenderedEntry[];
  totalTime: number;
}

export declare interface SortableEntry extends Entry {
  timestamp: number;
}

export declare interface RenderedEntry extends SortableEntry {
  id: number;
  requestTime: string;
  visualTimings: RenderedEntryTimings;
  requestFormattedDate: string;

  requestSizes: EntrySizing;
  responseSizes: EntrySizing;
}

export declare interface RenderedEntryTimings {
  total: number;
  totalValue: number;
  delay?: number;
  blocked?: number;
  connect?: number;
  dns?: number;
  ssl?: number;
  send?: number;
  receive?: number;
  wait?: number;
}

export declare interface EntrySizing {
  headers: string;
  headersComputed: boolean;
  body: string;
  bodyComputed: boolean;
  sum: string;
  sumComputed: boolean;
}

export declare interface EditorType {
  id: string;
  label: string;
  title: string;
}

export declare type allowedEditors = 'raw' | 'urlEncode' | 'multipart' | 'file';

export interface MonacoSchema {
  uri: string;
  schema: any;
  fileMatch?: string[];
}

export declare type VariablesMap = {[key: string]: string};


export declare interface EvaluateOptions {
  /**
   * A list of variables to override in created context.
   */
  override?: Variable.SystemVariables;
  /**
   * The execution context to use instead of creating the context≥
   */
  context?: VariablesMap;
  /**
   * The list of properties to evaluate. If not set then it scans for all keys in the object.
   * This is used when evaluating objects.
   */
  names?: string[];
}

export declare interface ArcConfigSchema {
  version: string;
  kind: string;
  groups: ArcConfigGroup[];
}

export declare interface ArcConfigGroup {
  name: string;
  description?: string;
  enabled: boolean;
  key: string;
  kind: string;
  items: (ArcConfigItem|ArcLinkItem|ArcConfigGroup)[];
  layout?: 'list' | 'input-group';
}

export declare interface ArcConfigItem { 
  kind: string;
  enabled: boolean,
  name: string;
  description?: string;
  key: string;
  default?: any;
  enum: string[];
  type: string;
  suffix?: string;
  /**
   * When set the item is not rendered as a list item but has it's own section with the input.
   */
  topLevel?: boolean;
}

export declare interface ArcLinkItem { 
  kind: string;
  enabled: boolean,
  name: string;
  target: string;
  description?: string;
}

export declare interface SettingsPage {
  /**
   * The sub-page to render.
   */
  page: ArcConfigGroup | ArcConfigItem;
  /**
   * The scroll position to restore after the user click on the back button.
   */
  scrollPosition?: number;
}

export declare type ListType = 'saved' | 'history' | 'project';

export declare interface HistoryDayItem {
  /**
   * The midnight timestamp for the day
   */
  midnight: number;
  /**
   * A label to render in the group
   */
  label: string;
}

export declare interface HistoryListItem {
  /**
   * The history item
   */
  item: ArcRequest.ARCHistoryRequest;
  /**
   * History's ISO time value.
   */
  isoTime: string;
}

export declare interface HistoryGroup {
  /**
   * Group's day definition
   */
  day: HistoryDayItem;
  /**
   * Requests in the group
   */
  requests: HistoryListItem[];
  /**
   * Whether a group is collapsed or opened.
   */
  opened: boolean;
}

export type ListLayout = 'default' | 'comfortable' | 'compact';

export declare interface HistorySearchItem {
  kind: 'ARC#HistorySearchItem';
  /**
   * The history item
   */
  item: ArcRequest. ARCHistoryRequest;
  /**
   * History's ISO time value.
   */
  isoTime: string;
}

export declare interface SavedProjectSearchItem {
  id: string;
  label: string;
}

export declare interface SavedSearchItem {
  kind: 'ARC#SavedSearchItem';
  /**
   * The saved item
   */
  item: ArcRequest.ARCSavedRequest;
  /**
   * List of projects this request belongs to.
   */
  projects: SavedProjectSearchItem[];
}

export declare interface DataExtractorInit {
  /**
   * The request object generated by the request editor.
   */
  request: ArcBaseRequest | ARCSavedRequest | ARCHistoryRequest;
  /**
   * The request object representing the actual request that has been executed by the transport library.
   * Will not be available for the request actions.
   */
  executedRequest?: TransportRequest;
  /**
   * The response generated by the transport library.
   * Will not be available for the request actions.
   */
  response?: Response | ErrorResponse;
}

export declare interface ArcExecutableInit {
  /**
   * The request originating from the request editor. The source of the HTTP request configuration.
   */
  request?: ArcBaseRequest | ARCSavedRequest | ARCHistoryRequest;
  /**
   * The request object representing the actual request that has been executed by the transport library.
   */
  executedRequest?: TransportRequest;
  /**
   * The response generated by the transport library.
   */
  response?: Response | ErrorResponse;
}

export declare interface ActionsRunnerInit {
  /**
   * A node to be used to dispatch events on.
   */
  eventsTarget: EventTarget;
  /**
   * A reference to Jexl object. When set `jexlPath` is not needed.
   */
  jexl: any;
}

export declare interface InputOptions {
  outlined?: boolean;
  anypoint?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  /**
   * When set it notifies given path.
   */
  notify?: string;
  render?: string;
}

export declare interface CheckboxConfiguration extends InputOptions {
  name?: string;
}

export declare interface BaseTemplateOptions extends InputOptions {
  /**
   * Selection or change handler function
   */
  handler?: Function;
}

export declare interface DataSourceTypeSelectorOptions extends BaseTemplateOptions {
  /**
   * Currently selected option.
   */
  selected: ActionType;
  /**
   * input name
   */
  name?: string;
}

export declare interface OperatorTemplateOptions extends BaseTemplateOptions {
  /**
   * Currently selected value
   */
  operator: OperatorEnum;
  /**
   * input name
   */
  name?: string;
}
export declare interface IteratorTemplateOptions extends BaseTemplateOptions {
  /**
   * Iterator configuration
   */
  config: IteratorConfiguration;
  /**
   * Handler for the inputs change event
   */
  inputHandler: Function;

  /**
   * Handler for the operator selection event
   */
  operatorHandler: Function;
}

/**
 * An enum representing a list of supported in this runner/editor actions.
 */
export type SupportedActions = "set-variable" | "set-cookie" | "delete-cookie" | string;

export declare interface RequestProcessOptions {
  /**
   * Whether to run jexl to evaluate variables. Default to true.
   * @default true
   */
  evaluateVariables?: boolean;
  /**
   * Whether to override application variables with system variables
   * @default true
   */
  evaluateSystemVariables?: boolean;
}

export declare interface ResponseProcessOptions {
  /**
   * Whether to run jexl to evaluate variables. Default to true.
   * @default true
   */
  evaluateVariables?: boolean;
  /**
   * Whether to override application variables with system variables
   * @default true
   */
  evaluateSystemVariables?: boolean;
}

export declare interface ViewConnectionResult extends WebSocket.WebsocketConnectionResult {
  sizeLabel: string;
  logs: ViewWebsocketLog[];
}

export declare interface ViewWebsocketLog extends WebSocket.WebsocketLog {
  isBinary: boolean;
  sizeLabel: string;
  isoTime: string;
}

export declare interface RegisteredRequestModule {
  fn: (request: ArcRequest.ArcEditorRequest, context: ExecutionContext, signal: AbortSignal) => Promise<number>;
  permissions: string[];
}

export declare interface RegisteredResponseModule {
  fn: (request: ArcRequest.ArcEditorRequest, executed: TransportRequest, response: Response|ErrorResponse, context: ExecutionContext, signal: AbortSignal) => Promise<number>;
  permissions: string[];
}

export declare interface ExecutionContext {
  /**
   * The event target for events
   */
  eventsTarget: EventTarget;
  /**
   * The events to use to communicate with ARC
   */
  Events?: ExecutionEvents;
  /**
   * The events to use to communicate with ARC
   */
  environment?: EnvironmentStateDetail;
  /**
   * Event based access to the ARC data store
   */
  Store?: ExecutionStore;
}

export declare interface ExecutionEvents {
  ArcNavigationEvents: IArcNavigationEvents;
  SessionCookieEvents: ISessionCookieEvents;
  EncryptionEvents: IEncryptionEvents;
  GoogleDriveEvents: IGoogleDriveEvents;
  ProcessEvents: IProcessEvents;
  WorkspaceEvents: IWorkspaceEvents;
  RequestEvents: IRequestEvents;
  AuthorizationEvents: IAuthorizationEvents;
  ConfigEvents: IConfigEvents;
}

export declare interface ExecutionStore {
  AuthData: ArcModelEvents.AuthDataFunctions;
  ClientCertificate: ArcModelEvents.ClientCertificateFunctions;
  HostRules: ArcModelEvents.HostRulesFunctions;
  Project: ArcModelEvents.ProjectFunctions;
  Request: ArcModelEvents.RequestFunctions;
  RestApi: ArcModelEvents.RestApiFunctions;
  UrlHistory: ArcModelEvents.UrlHistoryFunctions;
  UrlIndexer: ArcModelEvents.UrlIndexerFunctions;
  WSUrlHistory: ArcModelEvents.WSUrlHistoryFunctions;
  Environment?: ArcModelEvents.EnvironmentFunctions;
  Variable?: ArcModelEvents.VariableFunctions;
}

export declare interface RequestProcessOptions {
  /**
   * Whether to run jexl to evaluate variables. Default to true.
   * @default true
   */
  evaluateVariables?: boolean;
  /**
   * Whether to override application variables with system variables
   * @default true
   */
  evaluateSystemVariables?: boolean;
}

export declare interface ResponseProcessOptions {
  /**
   * Whether to run jexl to evaluate variables. Default to true.
   * @default true
   */
  evaluateVariables?: boolean;
  /**
   * Whether to override application variables with system variables
   * @default true
   */
  evaluateSystemVariables?: boolean;
}

export declare interface ARCProjectNames extends Project.ARCProject {
  missing: boolean;
}

export declare interface AuthorizationTemplateOptions {
  outlined?: boolean;
  anypoint?: boolean;
  ui?: ArcRequest.AuthMeta;
  oauth2RedirectUri: string;
  hidden?: boolean;
}

/**
 * An object that describes a workspace tab 
 */
export declare interface WorkspaceTab {
  /**
   * The internal for the workspace id of the request panel.
   * This has nothing to do with the request id or editor request id. It just keeps track which tabs controls which request panel
   * as both requests and tabs array are out of sync by design.
   * 
   * The id is generated when a tab is being created.
   */
  id: string;
  /**
   * A label to render on the tab.
   */
  label: string;
}

declare interface RequestWithTab {
 /**
   * The ID of the tab
   */
  tab: string;
}

export declare interface WorkspaceHttpRequest extends ArcRequest.ArcEditorRequest, RequestWithTab {
}

export declare interface WorkspaceWebsocketRequest extends WebSocket.WebsocketEditorRequest, RequestWithTab {
}

export declare type WorkspaceRequest = WorkspaceHttpRequest | WorkspaceWebsocketRequest;

export declare interface AddRequestOptions {
  /**
   * Won't check for empty panel before appending it to the list
   */
  skipPositionCheck?: boolean;
  /**
   * Won't attempt to select added request
   */
  noAutoSelect?: boolean;
  /**
   * When set it will not call the `requestUpdate()`
   */
  skipUpdate?: boolean;
  /**
   * When set it ignores call to store workspace data in the store.
   */
  skipStore?: boolean;
}

export interface ThemeManagerInit {
  /**
   * The protocol to use to load themes
   * @example themes:
   */
  protocol: string;
  /**
   * The base URI to use to load themes.
   * @example localhost:8080/path
   */
  baseUri: string;
  /**
   * The target for the DOM events.
   */
  eventsTarget?: EventTarget;
}

export declare interface ArcAppInitOptions {
  /**
   * The backend id of the workspace file.
   */
  workspaceId?: string;
  proxy?: string;
  proxyUsername?: string;
  proxyPassword?: string;
}
