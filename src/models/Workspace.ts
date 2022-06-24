import { ArcBaseRequest, ARCHistoryRequest, ARCSavedRequest, RequestConfig, RunnableAction, Variable } from "@api-client/core/build/legacy.js";
import { Provider, ThingMeta } from "./Meta.js";
import { WebsocketRequest, WebsocketStoredRequest } from "./WebSocket.js";

export interface DomainWorkspaceAuthorization {
  /**
   * The OAuth 2 redirect URI to be used in the request editor instead the one 
   * configured in the application.
   */
  oauth2RedirectUri?: string;
  /**
   * Authorization schemes available for the requests in ths workspace.
   * This is reserved for the future use. Please, report an issue if you have aPOV on this.
   */
  authorization?: any[];
}

export interface DomainWorkspaceWebSession {
  /**
   * An URL of the endpoint that will be pre-filled in the "open login page" dialog.
   */
  webSessionUrl?: string;
}

export interface DomainWorkspace {
  /**
   * Auto generated uuid of the workspace. When not defined it is auto added to the workspace when first opened.
   * Note, this is added to the workspace file even when `readOnly` is set.
   */
  id?: string;
  /**
   * The data kind. The workspace file parser ignores the data with an unknown `kind`.
   */
  kind: 'ARC#DomainWorkspace';
  /**
   * A variables that can be applied to the requests inside this workspace only.
   */
  variables?: Variable[];
  /**
   * Request configuration that is applied to each request in this workspace.
   */
  config?: RequestConfig;
  /**
   * Workspace authorization options configuration.
   */
  authorization?: DomainWorkspaceAuthorization[];
  /**
   * The list of requests in the workspace.
   * If you creating a requests outside ARC / API client then only use `ArcEditorRequest`  type.
   */
  requests?: WorkspaceRequestUnion[];
  /**
   * The list of ARC's request actions to execute before a request in this workspace is executed.
   */
  requestActions?: RunnableAction[];
  /**
   * The list of ARC's response actions to execute after a request in this workspace is executed.
   */
  responseActions?: RunnableAction[];
  /**
   * Freezes everything in this workspace. All changes made to the requests or anything else are only kept in memory.
   */
  readOnly?: boolean;
  /**
   * Workspace meta data.
   */
  meta?: ThingMeta;
  /**
   * The provider of the workspace definition.
   */
  provider?: Provider;
  /**
   * The index id the request that is being rendered as open when the workspace is loaded.
   */
  selected?: number;
  /**
   * The configuration of ARC's web session
   */
  webSession?: DomainWorkspaceWebSession;
}

export interface LegacyWorkspace {
  published?: string;
  description?: string;
  version?: string;
  provider?: Provider;
  selected?: number;
  oauth2RedirectUri?: string;
  webSessionUrl?: string;
  requests?: any[];
  variables: Variable[];
}

export type WorkspaceRequestUnion = ArcBaseRequest | ARCSavedRequest | ARCHistoryRequest | WebsocketRequest | WebsocketStoredRequest;
