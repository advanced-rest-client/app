/* eslint-disable max-classes-per-file */
import {
  ContextChangeRecord, ContextDeleteEvent, ContextDeleteRecord, ContextEvent, ContextListEvent,
  ContextListOptions, ContextListResult, ContextQueryEvent, ContextReadBulkEvent, ContextReadEvent,
  ContextStateDeleteEvent, ContextStateUpdateEvent, ContextUpdateBulkEvent,
  ContextUpdateEvent,
  IQueryResponse
} from "@api-client/core/build/browser.js";
import {
  ARCAuthData, ARCCertificateIndex, ARCEnvironment, ARCHistoryRequest, ARCHostRule, ARCProject, ARCRequestRestoreOptions,
  ARCRestApi,
  ARCRestApiIndex,
  ARCSavedRequest, ARCUrlHistory, ARCVariable, ARCWebsocketUrlHistory, ClientCertificate, SystemVariables
} from "@api-client/core/build/legacy.js";
import { IndexableRequest, IndexQueryResult } from "../models/Indexer.js";
import { EventTypes } from "./EventTypes.js";

export type RequestType = 'saved' | 'history';

export interface IRequestReadEventOptions extends ARCRequestRestoreOptions {
  /**
   * Requested ARC request revision ID.
   */
  rev?: string;
}

export interface IRequestReadDetail {
  requestType: RequestType;
  id: string;
  opts?: IRequestReadEventOptions;
}

export interface IRequestReadBulkDetail {
  requestType: RequestType;
  ids: string[];
  opts?: IRequestReadEventOptions;
}

export interface IRequestUpdateDetail {
  requestType: RequestType;
  request: ARCHistoryRequest | ARCSavedRequest;
  projects?: string[];
}

export interface IRequestUpdateBulkDetail {
  requestType: RequestType;
  requests: (ARCHistoryRequest | ARCSavedRequest)[];
}

export interface IRequestDeleteDetail {
  requestType: RequestType;
  id: string;
}

export interface IRequestDeleteBulkDetail {
  requestType: RequestType;
  ids: string[];
}

export interface IRequestUndeleteBulkDetail {
  requestType: RequestType;
  records: ContextDeleteRecord[];
}

export interface IRequestQueryDetail {
  term: string;
  requestType?: RequestType;
  detailed?: boolean;
}

export interface IRequestListDetail {
  requestType: RequestType;
  opts?: ContextListOptions;
}

export interface IRequestProjectListDetail {
  id: string;
  opts?: ARCRequestRestoreOptions;
}

export interface IndexQueryDetail {
  term: string;
  requestType?: RequestType;
  detailed?: boolean;
}

/**
 * A definition fo the detail object for the environment change state event.
 */
export interface EnvironmentStateDetail {
  /**
   * The currently (new) selected environment. The components should use this value to select
   * the environment if needed.
   * Note, when the value is not set (has the `null` value) meant that selected environment is the `default`
   * environment which has no representation in the data store.
   */
  environment: ARCEnvironment | null;
  /**
   * The list of variables associated with this environment. It my be an empty list
   * when the environment has no variables.
   */
  variables: ARCVariable[];
  /**
   * An optional and readonly map of system variables that should be applied to the variables processor.
   */
  systemVariables?: SystemVariables;
}

export class ModelEvents {
  /**
   * Dispatches an event handled by the data store to destroy a data store.
   *
   * @param stores A list of store names to affect
   * @param target A node on which to dispatch the event.
   * @return A promise resolved when all requested stores are deleted
   */
  static async destroy(stores: string[], target: EventTarget = window): Promise<void> {
    const e = new ContextEvent(EventTypes.Model.destroy, { stores });
    target.dispatchEvent(e);
    if (Array.isArray(e.detail.result)) {
      await Promise.all(e.detail.result);
    }
  }

  /**
   * Dispatches an event information the app that a store has been destroyed.
   *
   * @param store The name of the deleted store
   * @param target A node on which to dispatch the event.
   */
  static destroyed(store: string, target: EventTarget = window): void {
    const e = new CustomEvent(EventTypes.Model.destroyed, {
      bubbles: true,
      composed: true,
      detail: store,
    });
    target.dispatchEvent(e);
  }

  static Project = class {
    /**
     * Dispatches an event handled by the data store to read the project metadata.
     *
     * @param id The ID of the project
     * @param target A node on which to dispatch the event.
     * @return Promise resolved to a Project model.
     */
    static async read(id: string, target: EventTarget = window): Promise<ARCProject | undefined> {
      const e = new ContextReadEvent<ARCProject>(EventTypes.Model.Project.read, id);
      target.dispatchEvent(e);
      return e.detail.result;
    }

    /**
     * Dispatches an event handled by the data store to read multiple projects metadata.
     *
     * @param ids The ids of projects to read
     * @param target A node on which to dispatch the event.
     * @returns Promise resolved to the list of projects.
     */
    static async readBulk(ids: string[], target: EventTarget = window): Promise<ARCProject[] | undefined> {
      const e = new ContextReadBulkEvent<ARCProject>(EventTypes.Model.Project.readBulk, ids);
      target.dispatchEvent(e);
      return e.detail.result;
    }

    /**
     * Dispatches an event handled by the data store to update a project metadata.
     *
     * @param item The project object to update.
     * @param target A node on which to dispatch the event.
     * @returns Promise resolved to a Project model.
     */
    static async update(item: ARCProject, target: EventTarget = window): Promise<ContextChangeRecord<ARCProject> | undefined> {
      const e = new ContextUpdateEvent(EventTypes.Model.Project.update, { item });
      target.dispatchEvent(e);
      return e.detail.result;
    }

    /**
     * Dispatches an event handled by the data store to update a list of project metadata.
     *
     * @param projects The list of project objects to update.
     * @param target A node on which to dispatch the event.
     * @returns Promise resolved to a list of change records
     */
    static async updateBulk(projects: ARCProject[], target: EventTarget = window): Promise<ContextChangeRecord<ARCProject>[] | undefined> {
      const e = new ContextUpdateBulkEvent(EventTypes.Model.Project.updateBulk, { items: projects });
      target.dispatchEvent(e);
      return e.detail.result;
    }

    /**
     * Dispatches an event handled by the data store to delete a project metadata.
     *
     * @param id The id of the project to delete.
     * @param target A node on which to dispatch the event.
     * @returns Promise resolved to the delete record
     */
    static async delete(id: string, target: EventTarget = window): Promise<ContextDeleteRecord | undefined> {
      const e = new ContextDeleteEvent(EventTypes.Model.Project.delete, id);
      target.dispatchEvent(e);
      return e.detail.result;
    }

    /**
     * Dispatches an event to list the project data.
     *
     * @param opts Query options.
     * @param target A node on which to dispatch the event.
     * @returns Project list result.
     */
    static async list(opts?: ContextListOptions, target: EventTarget = window): Promise<ContextListResult<ARCProject> | undefined> {
      const e = new ContextListEvent<ARCProject>(EventTypes.Model.Project.list, opts);
      target.dispatchEvent(e);
      return e.detail.result;
    }

    /**
     * Dispatches an event to list all project data.
     *
     * @param keys Project keys to read. When not set it reads all projects
     * @param target A node on which to dispatch the event.
     * @returns The list of projects.
     */
    static async listAll(keys: string[], target: EventTarget = window): Promise<ContextListResult<ARCProject> | undefined> {
      const e = new ContextEvent<{ keys: string[] }, ContextListResult<ARCProject>>(EventTypes.Model.Project.listAll, { keys });
      target.dispatchEvent(e);
      return e.detail.result;
    }

    static State = class {
      /**
       * Dispatches an event after a project was updated
       *
       * @param record The change record
       * @param target A node on which to dispatch the event.
       */
      static update(record: ContextChangeRecord<ARCProject>, target: EventTarget = window): void {
        const e = new ContextStateUpdateEvent(EventTypes.Model.Project.State.update, record);
        target.dispatchEvent(e);
      }

      /**
       * Dispatches an event after a project was deleted
       *
       * @param record The delete record
       * @param target A node on which to dispatch the event.
       */
      static delete(record: ContextDeleteRecord, target: EventTarget = window): void {
        const e = new ContextStateDeleteEvent(EventTypes.Model.Project.State.delete, record);
        target.dispatchEvent(e);
      }
    }
  }

  static Request = class {
    /**
     * Dispatches an event handled by the data store to read an ARC request metadata.
     *
     * @param requestType Request type. Either `saved` or `history`.
     * @param id Request id
     * @param opts ARC request read options.
     * @param target A node on which to dispatch the event.
     * @returns Promise resolved to an ARC request model.
     */
    static async read(requestType: RequestType, id: string, opts?: IRequestReadEventOptions, target: EventTarget = window): Promise<ARCHistoryRequest | ARCSavedRequest | undefined> {
      const e = new ContextEvent<IRequestReadDetail, ARCHistoryRequest | ARCSavedRequest>(EventTypes.Model.Request.read, { requestType, id, opts });
      target.dispatchEvent(e);
      return e.detail.result;
    }

    /**
     * Dispatches an event handled by the data store to read a list of ARC requests metadata.
     *
     * @param requestType Request type. Either `saved` or `history`.
     * @param ids List of ids to read
     * @param opts ARC request read options.
     * @param target A node on which to dispatch the event.
     * @return Promise resolved to a list of ARC requests.
     */
    static async readBulk(requestType: RequestType, ids: string[], opts?: IRequestReadEventOptions, target: EventTarget = window): Promise<(ARCHistoryRequest | ARCSavedRequest | undefined)[] | undefined> {
      const e = new ContextEvent<IRequestReadBulkDetail, (ARCHistoryRequest | ARCSavedRequest | undefined)[]>(EventTypes.Model.Request.readBulk, { requestType, ids, opts });
      target.dispatchEvent(e);
      return e.detail.result;
    }

    /**
     * Dispatches an event handled by the data store to read an ARC request metadata.
     *
     * @param requestType Request type. Either `saved` or `history`.
     * @param request An ARC request to update.
     * @param target A node on which to dispatch the event.
     * @returns Promise resolved to a change record
     */
    static async update(requestType: RequestType, request: ARCHistoryRequest | ARCSavedRequest, target: EventTarget = window): Promise<ContextChangeRecord<ARCHistoryRequest | ARCSavedRequest> | undefined> {
      const e = new ContextEvent<IRequestUpdateDetail, ContextChangeRecord<ARCHistoryRequest | ARCSavedRequest>>(EventTypes.Model.Request.update, { requestType, request });
      target.dispatchEvent(e);
      return e.detail.result;
    }

    /**
     * Dispatches an event handled by the data store to read an ARC request metadata.
     *
     * @param requestType Request type. Either `saved` or `history`.
     * @param requests List of ARC request objects to update.
     * @param target A node on which to dispatch the event.
     * @returns Promise resolved to a list of change record for each object
     */
    static async updateBulk(requestType: RequestType, requests: (ARCHistoryRequest | ARCSavedRequest)[], target: EventTarget = window): Promise<ContextChangeRecord<ARCHistoryRequest | ARCSavedRequest>[] | undefined> {
      const e = new ContextEvent<IRequestUpdateBulkDetail, ContextChangeRecord<ARCHistoryRequest | ARCSavedRequest>[]>(EventTypes.Model.Request.updateBulk, { requestType, requests });
      target.dispatchEvent(e);
      return e.detail.result;
    }

    /**
     * Dispatches an event handled by the data store to save an ARC request object with metadata`.
     *
     * @param requestType Request type. Either `saved` or `history`.
     * @param request An ARC request to update.
     * @param projects List of project names to create with this request and attach it to the request object. Only relevant for `saved` type.
     * @param target A node on which to dispatch the event.
     * @returns Promise resolved to a change record
     */
    static async store(requestType: RequestType, request: ARCHistoryRequest | ARCSavedRequest, projects?: string[], target: EventTarget = window): Promise<ContextChangeRecord<ARCHistoryRequest | ARCSavedRequest> | undefined> {
      const e = new ContextEvent<IRequestUpdateDetail, ContextChangeRecord<ARCHistoryRequest | ARCSavedRequest>>(EventTypes.Model.Request.store, { requestType, request, projects });
      target.dispatchEvent(e);
      return e.detail.result;
    }

    /**
     * Dispatches an event handled by the data store to delete an ARC request from the store.
     *
     * @param requestType Request type. Either `saved` or `history`.
     * @param id The request id
     * @param target A node on which to dispatch the event.
     * @returns Promise resolved to a new revision after delete.
     */
    static async delete(requestType: RequestType, id: string, target: EventTarget = window): Promise<ContextDeleteRecord | undefined> {
      const e = new ContextEvent<IRequestDeleteDetail, ContextDeleteRecord>(EventTypes.Model.Request.delete, { requestType, id });
      target.dispatchEvent(e);
      return e.detail.result;
    }

    /**
     * Dispatches an event handled by the data store to delete an ARC request from the store.
     *
     * @param requestType Request type. Either `saved` or `history`.
     * @param ids List of ids to delete.
     * @param target A node on which to dispatch the event.
     * @returns Promise resolved to a a list of deleted revisions
     */
    static async deleteBulk(requestType: RequestType, ids: string[], target: EventTarget = window): Promise<ContextDeleteRecord[] | undefined> {
      const e = new ContextEvent<IRequestDeleteBulkDetail, ContextDeleteRecord[]>(EventTypes.Model.Request.deleteBulk, { requestType, ids });
      target.dispatchEvent(e);
      return e.detail.result;
    }

    /**
     * Dispatches an event handled by the data store to delete an ARC request from the store.
     *
     * @param requestType Request type. Either `saved` or `history`.
     * @param records List of requests to restore
     * @param target A node on which to dispatch the event.
     * @returns Promise resolved to a a list of change records
     */
    static async undeleteBulk(requestType: RequestType, records: ContextDeleteRecord[], target: EventTarget = window): Promise<ContextChangeRecord<ARCHistoryRequest | ARCSavedRequest>[] | undefined> {
      const e = new ContextEvent<IRequestUndeleteBulkDetail, ContextChangeRecord<ARCHistoryRequest | ARCSavedRequest>[]>(EventTypes.Model.Request.undeleteBulk, { requestType, records });
      target.dispatchEvent(e);
      return e.detail.result;
    }

    /**
     * Dispatches an event handled by the data store to query for ARC request data
     *
     * @param term The search term for the query function
     * @param requestType The type of the requests to search for. By default it returns all data.
     * @param detailed If set it uses slower algorithm but performs full search on the index. When false it only uses filer like query + '*'.
     * @param target A node on which to dispatch the event.
     * @returns Promise resolved to list of results
     */
    static async query(term: string, requestType?: RequestType, detailed?: boolean, target: EventTarget = window): Promise<IQueryResponse<ARCHistoryRequest | ARCSavedRequest> | undefined> {
      // const e = new ContextEvent<IRequestQueryDetail, (ARCHistoryRequest | ARCSavedRequest)[]>(EventTypes.Model.Request.query, { requestType, term, detailed });
      // target.dispatchEvent(e);
      // return e.detail.result;

      const e = new ContextQueryEvent<ARCHistoryRequest | ARCSavedRequest>(EventTypes.Model.Request.query, { term, detailed, type: requestType });
      target.dispatchEvent(e);
      return e.detail.result;
    }

    /**
     * Dispatches an event handled by the data store to read an ARC request metadata.
     *
     * @param requestType Request type. Either `saved` or `history`.
     * @param opts List options.
     * @param target A node on which to dispatch the event.
     * @returns Promise resolved to list of results
     */
    static async list(requestType: RequestType, opts?: ContextListOptions, target: EventTarget = window): Promise<ContextListResult<ARCHistoryRequest | ARCSavedRequest> | undefined> {
      const e = new ContextEvent<IRequestListDetail, ContextListResult<ARCHistoryRequest | ARCSavedRequest>>(EventTypes.Model.Request.list, { requestType, opts });
      target.dispatchEvent(e);
      return e.detail.result;
    }

    /**
     * Dispatches an event handled by the data store to list all requests that are association with a project.
     *
     * @param id The project id
     * @param opts ARC request read options.
     * @param target A node on which to dispatch the event.
     * @returns Promise resolved to a a list of requests
     */
    static async projectList(id: string, opts?: ARCRequestRestoreOptions, target: EventTarget = window): Promise<(ARCHistoryRequest | ARCSavedRequest)[] | undefined> {
      const e = new ContextEvent<IRequestProjectListDetail, (ARCHistoryRequest | ARCSavedRequest)[]>(EventTypes.Model.Request.projectList, { id, opts });
      target.dispatchEvent(e);
      return e.detail.result;
    }

    static State = class {
      /**
       * Dispatches an event after a request was updated
       *
       * @param record The change record
       * @param target A node on which to dispatch the event.
       */
      static update(requestType: RequestType, record: ContextChangeRecord<ARCHistoryRequest | ARCSavedRequest>, target: EventTarget = window): void {
        const e = new CustomEvent(EventTypes.Model.Request.State.update, {
          bubbles: true,
          composed: true,
          detail: {
            requestType,
            record,
          }
        });
        target.dispatchEvent(e);
      }

      /**
       * Dispatches an event after a request was deleted
       *
       * @param record The delete record
       * @param target A node on which to dispatch the event.
       */
      static delete(requestType: RequestType, record: ContextDeleteRecord, target: EventTarget = window): void {
        const e = new CustomEvent(EventTypes.Model.Request.State.delete, {
          bubbles: true,
          composed: true,
          detail: {
            requestType,
            record,
          }
        });
        target.dispatchEvent(e);
      }
    }
  }

  static UrlIndexer = class {
    /**
     * Dispatches an event handled by the data store to update indexed data.
     *
     * @param target A node on which to dispatch the event.
     * @param requests List of requests to index.
     * @returns Promise resolved when indexes were updated
     */
    static async update(requests: IndexableRequest[], target: EventTarget = window): Promise<void> {
      const e = new ContextEvent(EventTypes.Model.UrlIndexer.update, { requests });
      target.dispatchEvent(e);
      await e.detail.result;
    }

    /**
     * Dispatches an event handled by the data store to query for ARC request URL indexed data
     *
     * @param target A node on which to dispatch the event.
     * @param term The search term for the query function
     * @param requestType The type of the requests to search for. By default it returns all data.
     * @param detailed If set it uses slower algorithm but performs full search on the index. When false it only uses filer like query + '*'.
     * @returns Promise resolved to list of results
     */
    static async query(term: string, requestType?: RequestType, detailed?: boolean, target: EventTarget = window): Promise<IQueryResponse<IndexQueryResult> | undefined> {
      // const e = new ContextEvent<IndexQueryDetail, IndexQueryResult>(EventTypes.Model.UrlIndexer.query, { term, requestType, detailed });
      // target.dispatchEvent(e);
      // return e.detail.result;

      const e = new ContextQueryEvent<IndexQueryResult>(EventTypes.Model.UrlIndexer.query, { term, detailed, type: requestType });
      target.dispatchEvent(e);
      return e.detail.result;
    }

    static State = class {
      /**
       * Dispatches an event informing that the indexer has finished the indexing task
       *
       * @param target A node on which to dispatch the event.
       */
      static finished(target: EventTarget = window): void {
        const e = new Event(EventTypes.Model.UrlIndexer.State.finished, {
          bubbles: true,
          composed: true,
        });
        target.dispatchEvent(e);
      }
    }
  }

  static AuthData = class {
    /**
     * Dispatches an event handled by the data store to query for ARC authorization data
     *
     * @param url The URL of the request associated with the authorization method
     * @param method The name of the authorization method
     * @param target A node on which to dispatch the event.
     * @returns A promise resolved to n auth data model.
     */
    static async query(url: string, method: string, target: EventTarget = window): Promise<ARCAuthData | undefined> {
      const e = new ContextEvent<{ url: string, method: string }, ARCAuthData>(EventTypes.Model.AuthData.query, { url, method });
      target.dispatchEvent(e);
      return e.detail.result;
    }

    /**
     * Dispatches an event handled by the data store to update an authorization data.
     *
     * @param url The URL of the request associated with the authorization method
     * @param method The name of the authorization method
     * @param authData The authorization data to store.
     * @param target A node on which to dispatch the event.
     * @returns Promise resolved to a the auth change record
     */
    static async update(url: string, method: string, authData: ARCAuthData, target: EventTarget = window): Promise<ContextChangeRecord<ARCAuthData> | undefined> {
      const e = new ContextEvent<{ url: string, method: string, authData: ARCAuthData }, ContextChangeRecord<ARCAuthData>>(EventTypes.Model.AuthData.update, { url, method, authData });
      target.dispatchEvent(e);
      return e.detail.result;
    }

    static State = class {
      /**
       * Dispatches an event informing about a change in the auth data model.
       *
       * @param record AuthData change record.
       * @param target A node on which to dispatch the event.
       */
      static update(record: ContextChangeRecord<ARCAuthData>, target: EventTarget = window): void {
        const e = new ContextStateUpdateEvent(EventTypes.Model.AuthData.State.update, record);
        target.dispatchEvent(e);
      }
    }
  }

  static HostRules = class {
    /**
     * Dispatches an event handled by the data store to update a host rule entity
     *
     * @param item The rule object to save / update
     * @param target A node on which to dispatch the event.
     * @returns Promise resolved to a the change record
     */
    static async update(item: ARCHostRule, target: EventTarget = window): Promise<ContextChangeRecord<ARCHostRule> | undefined> {
      const e = new ContextUpdateEvent(EventTypes.Model.HostRules.update, { item });
      target.dispatchEvent(e);
      return e.detail.result;
    }

    /**
     * Dispatches an event handled by the data store to update host rule entities in bulk
     *
     * @param rules The rules to save / update
     * @param target A node on which to dispatch the event.
     * @returns Promise resolved to a the list of a change record
     */
    static async updateBulk(rules: ARCHostRule[], target: EventTarget = window): Promise<ContextChangeRecord<ARCHostRule>[] | undefined> {
      const e = new ContextUpdateBulkEvent(EventTypes.Model.HostRules.updateBulk, { items: rules });
      target.dispatchEvent(e);
      return e.detail.result;
    }

    /**
     * Dispatches an event handled by the data store to delete an ARC request from the store.
     *
     * @param id The host rule id
     * @param target A node on which to dispatch the event.
     * @returns Delete record
     */
    static async delete(id: string, target: EventTarget = window): Promise<ContextDeleteRecord | undefined> {
      const e = new ContextDeleteEvent(EventTypes.Model.HostRules.delete, id);
      target.dispatchEvent(e);
      return e.detail.result;
    }

    /**
     * Dispatches an event handled by the data store to read a host rules data.
     *
     * @param opts List options.
     * @param target A node on which to dispatch the event.
     * @returns Promise resolved to list of results
     */
    static async list(opts?: ContextListOptions, target: EventTarget = window): Promise<ContextListResult<ARCHostRule> | undefined> {
      const e = new ContextListEvent<ARCHostRule>(EventTypes.Model.HostRules.list, opts);
      target.dispatchEvent(e);
      return e.detail.result;
    }

    static State = class {
      /**
       * Dispatches an event informing about a change in the host rules model.
       *
       * @param target A node on which to dispatch the event.
       * @param record Host rules change record.
       */
      static update(record: ContextChangeRecord<ARCHostRule>, target: EventTarget = window): void {
        const e = new ContextStateUpdateEvent(EventTypes.Model.HostRules.State.update, record);
        target.dispatchEvent(e);
      }

      /**
       * Dispatches an event after a host rule was deleted
       *
       * @param target A node on which to dispatch the event.
       * @param record The rule delete record.
       */
      static delete(record: ContextDeleteRecord, target: EventTarget = window): void {
        const e = new ContextStateDeleteEvent(EventTypes.Model.HostRules.State.delete, record);
        target.dispatchEvent(e);
      }
    }
  }

  static ClientCertificate = class {
    /**
     * Dispatches an event handled by the data store to read the client certificate.
     *
     * @param id The id of the client certificate
     * @param target A node on which to dispatch the event.
     * @returns Promise resolved to a client certificate model.
     */
    static async read(id: string, target: EventTarget = window): Promise<ClientCertificate | undefined> {
      const e = new ContextReadEvent<ClientCertificate>(EventTypes.Model.ClientCertificate.read, id);
      target.dispatchEvent(e);
      return e.detail.result;
    }

    /**
     * Dispatches an event to list the client certificates data.
     *
     * @param opts Query options.
     * @param target A node on which to dispatch the event.
     * @returns The list result.
     */
    static async list(opts?: ContextListOptions, target: EventTarget = window): Promise<ContextListResult<ARCCertificateIndex> | undefined> {
      const e = new ContextListEvent<ARCCertificateIndex>(EventTypes.Model.ClientCertificate.list, opts);
      target.dispatchEvent(e);
      return e.detail.result;
    }

    /**
     * Dispatches an event handled by the data store to delete a client certificate
     *
     * @param id The id of the project to delete.
     * @param target A node on which to dispatch the event.
     * @returns Promise resolved to a new revision after delete.
     */
    static async delete(id: string, target: EventTarget = window): Promise<ContextDeleteRecord | undefined> {
      const e = new ContextDeleteEvent(EventTypes.Model.ClientCertificate.delete, id);
      target.dispatchEvent(e);
      return e.detail.result;
    }

    // static async update: 'modelclientcertificateupdate',

    /**
     * Dispatches an event handled by the data store to insert a new client certificate.
     *
     * @param item The certificate object.
     * @param target A node on which to dispatch the event.
     * @returns Promise resolved to the change record
     */
    static async insert(item: ClientCertificate, target: EventTarget = window): Promise<ContextChangeRecord<ARCCertificateIndex> | undefined> {
      const e = new ContextUpdateEvent<ClientCertificate, ARCCertificateIndex>(EventTypes.Model.ClientCertificate.insert, { item });
      target.dispatchEvent(e);
      return e.detail.result;
    }

    static State = class {
      /**
       * Dispatches an event after a client certificate was updated
       *
       * @param record The change record
       * @param target A node on which to dispatch the event.
       */
      static update(record: ContextChangeRecord<ARCCertificateIndex>, target: EventTarget = window): void {
        const e = new ContextStateUpdateEvent(EventTypes.Model.ClientCertificate.State.update, record);
        target.dispatchEvent(e);
      }

      /**
       * Dispatches an event after a client certificate was deleted
       *
       * @param record The delete record
       * @param target A node on which to dispatch the event.
       */
      static delete(record: ContextDeleteRecord, target: EventTarget = window): void {
        const e = new ContextStateDeleteEvent(EventTypes.Model.ClientCertificate.State.delete, record);
        target.dispatchEvent(e);
      }
    }
  }

  static WSUrlHistory = class {
    // read: 'modelwsurlhistoryread',

    /**
     * Dispatches an event handled by the data store to list a page of the results
     *
     * @param opts The list options.
     * @param target A node on which to dispatch the event.
     * @returns Promise resolved to the change record for the URL
     */
    static async list(opts?: ContextListOptions, target: EventTarget = window): Promise<ContextListResult<ARCWebsocketUrlHistory> | undefined> {
      const e = new ContextListEvent<ARCWebsocketUrlHistory>(EventTypes.Model.WSUrlHistory.list, opts);
      target.dispatchEvent(e);
      return e.detail.result;
    }

    /**
     * Dispatches an event handled by the data store to add a WS URL to the history
     *
     * @param url The URL to insert
     * @param target A node on which to dispatch the event.
     * @returns Promise resolved to the change record for the URL
     */
    static async insert(url: string, target: EventTarget = window): Promise<ContextChangeRecord<ARCWebsocketUrlHistory> | undefined> {
      const e = new ContextEvent<{ url: string }, ContextChangeRecord<ARCWebsocketUrlHistory>>(EventTypes.Model.WSUrlHistory.insert, { url });
      target.dispatchEvent(e);
      return e.detail.result;
    }

    /**
     * Dispatches an event handled by the data store to list a page of the results
     *
     * @param term The query term
     * @param target A node on which to dispatch the event.
     * @returns Promise resolved to the change record for the URL
     */
    static async query(term: string, target: EventTarget = window): Promise<IQueryResponse<ARCWebsocketUrlHistory> | undefined> {
      const e = new ContextQueryEvent<ARCWebsocketUrlHistory>(EventTypes.Model.WSUrlHistory.query, { term });
      target.dispatchEvent(e);
      return e.detail.result;
    }

    static State = class {
      /**
       * Dispatches an event after an URL entity was updated
       *
       * @param target A node on which to dispatch the event.
       * @param record The change record
       */
      static update(record: ContextChangeRecord<ARCWebsocketUrlHistory>, target: EventTarget = window): void {
        const e = new ContextStateUpdateEvent(EventTypes.Model.WSUrlHistory.State.update, record);
        target.dispatchEvent(e);
      }
    }
  }

  static UrlHistory = class {
    // read: 'modelwsurlhistoryread',

    /**
     * Dispatches an event handled by the data store to list a page of the results
     *
     * @param opts List options.
     * @param target A node on which to dispatch the event.
     * @returns Promise resolved to the change record for the URL
     */
    static async list(opts?: ContextListOptions, target: EventTarget = window): Promise<ContextListResult<ARCUrlHistory> | undefined> {
      const e = new ContextListEvent<ARCUrlHistory>(EventTypes.Model.UrlHistory.list, opts);
      target.dispatchEvent(e);
      return e.detail.result;
    }

    /**
     * Dispatches an event handled by the data store to add an URL to the history
     *
     * @param url The URL to insert
     * @param target A node on which to dispatch the event.
     * @returns Promise resolved to the change record for the URL
     */
    static async insert(url: string, target: EventTarget = window): Promise<ContextChangeRecord<ARCUrlHistory> | undefined> {
      const e = new ContextEvent<{ url: string }, ContextChangeRecord<ARCUrlHistory>>(EventTypes.Model.UrlHistory.insert, { url });
      target.dispatchEvent(e);
      return e.detail.result;
    }

    /**
     * Dispatches an event handled by the data store to list a page of the results
     *
     * @param term The query term
     * @param target A node on which to dispatch the event.
     * @returns Promise resolved to the change record for the URL
     */
    static async query(term: string, target: EventTarget = window): Promise<IQueryResponse<ARCUrlHistory> | undefined> {
      const e = new ContextQueryEvent<ARCUrlHistory>(EventTypes.Model.UrlHistory.query, { term });
      target.dispatchEvent(e);
      return e.detail.result;
    }

    /**
     * Dispatches an event handled by the data store to list a page of the results
     *
     * @param id The store object id to remove.
     * @param target A node on which to dispatch the event.
     * @return Delete record
     */
    static async delete(id: string, target: EventTarget = window): Promise<ContextDeleteRecord | undefined> {
      const e = new ContextDeleteEvent(EventTypes.Model.UrlHistory.delete, id);
      target.dispatchEvent(e);
      return e.detail.result;
    }

    static State = class {
      /**
       * Dispatches an event after an URL entity was updated
       *
       * @param record The change record
       * @param target A node on which to dispatch the event.
       */
      static update(record: ContextChangeRecord<ARCUrlHistory>, target: EventTarget = window): void {
        const e = new ContextStateUpdateEvent(EventTypes.Model.UrlHistory.State.update, record);
        target.dispatchEvent(e);
      }

      /**
       * Dispatches an event after a host rule was deleted
       *
       * @param record The delete record
       * @param target A node on which to dispatch the event.
       */
      static delete(record: ContextDeleteRecord, target: EventTarget = window): void {
        const e = new ContextStateDeleteEvent(EventTypes.Model.UrlHistory.State.delete, record);
        target.dispatchEvent(e);
      }
    }
  }

  static Environment = class {
    /**
     * Dispatches an event handled by the data store to read the environment metadata
     *
     * @param name The name of the environment
     * @param target A node on which to dispatch the event.
     * @returns Promise resolved to an environment model.
     */
    static async read(name: string, target: EventTarget = window): Promise<ARCEnvironment | undefined> {
      const e = new ContextReadEvent<ARCEnvironment>(EventTypes.Model.Environment.read, name);
      target.dispatchEvent(e);
      return e.detail.result;
    }

    /**
     * Dispatches an event handled by the data store to update an environment metadata.
     *
     * @param item The environment object to update.
     * @param target A node on which to dispatch the event.
     * @returns Promise resolved to the change record
     */
    static async update(item: ARCEnvironment, target: EventTarget = window): Promise<ContextChangeRecord<ARCEnvironment> | undefined> {
      const e = new ContextUpdateEvent(EventTypes.Model.Environment.update, { item });
      target.dispatchEvent(e);
      return e.detail.result;
    }

    /**
     * Dispatches an event handled by the data store to delete an environment and its variables.
     *
     * @param id The id of the environment to delete.
     * @param target A node on which to dispatch the event.
     * @returns Promise resolved to the delete record
     */
    static async delete(id: string, target: EventTarget = window): Promise<ContextDeleteRecord | undefined> {
      const e = new ContextDeleteEvent(EventTypes.Model.Environment.delete, id);
      target.dispatchEvent(e);
      return e.detail.result;
    }

    /**
     * Dispatches an event to list the environments data.
     * 
     * @param target A node on which to dispatch the event.
     * @returns Model query result.
     */
    static async list(target: EventTarget = window): Promise<ContextListResult<ARCEnvironment> | undefined> {
      const e = new ContextListEvent<ARCEnvironment>(EventTypes.Model.Environment.list);
      target.dispatchEvent(e);
      return e.detail.result;
    }

    /**
     * Dispatches an event to read current environment information.
     *
     * @param target A node on which to dispatch the event.
     * @returns Promise resolved to the current environment definition.
     */
    static async current(target: EventTarget = window): Promise<EnvironmentStateDetail | undefined> {
      const e = new ContextEvent<Record<string, unknown>, EnvironmentStateDetail>(EventTypes.Model.Environment.current, {});
      target.dispatchEvent(e);
      return e.detail.result;
    }

    /**
     * Dispatches an event to read current environment information.
     *
     * @param target A node on which to dispatch the event.
     * @param id The id of the environment to select. Falsy value if should select the default environment.
     * @returns This has no side effects.
     */
    static select(id: string, target: EventTarget = window): void {
      const e = new CustomEvent(EventTypes.Model.Environment.select, {
        bubbles: true,
        cancelable: true,
        composed: true,
        detail: id,
      });
      target.dispatchEvent(e);
    }

    static State = class {
      /**
       * Dispatches an event after an environment was updated
       *
       * @param target A node on which to dispatch the event.
       * @param record Change record
       */
      static update(record: ContextChangeRecord<ARCEnvironment>, target: EventTarget = window): void {
        const e = new ContextStateUpdateEvent(EventTypes.Model.Environment.State.update, record);
        target.dispatchEvent(e);
      }

      /**
       * Dispatches an event after an environment was deleted
       *
       * @param record The delete record
       * @param target A node on which to dispatch the event.
       */
      static delete(record: ContextDeleteRecord, target: EventTarget = window): void {
        const e = new ContextStateDeleteEvent(EventTypes.Model.Environment.State.delete, record);
        target.dispatchEvent(e);
      }

      /**
       * Dispatches an event to read current environment information.
       *
       * @param target A node on which to dispatch the event.
       * @param state Current environment state definition.
       * @returns This has no side effects.
       */
      static select(state: EnvironmentStateDetail, target: EventTarget = window): void {
        const e = new CustomEvent(EventTypes.Model.Environment.State.select, {
          composed: true,
          bubbles: true,
          cancelable: true,
          detail: state,
        });
        target.dispatchEvent(e);
      }
    }
  }

  static Variable = class {
    /**
     * Dispatches an event handled by the data store to update a variable metadata.
     *
     * @param item The variable object to update.
     * @param target A node on which to dispatch the event.
     * @returns Promise resolved to the change record
     */
    static async update(item: ARCVariable, target: EventTarget = window): Promise<ContextChangeRecord<ARCVariable> | undefined> {
      const e = new ContextUpdateEvent(EventTypes.Model.Variable.update, { item });
      target.dispatchEvent(e);
      return e.detail.result;
    }

    /**
     * Dispatches an event handled by the data store to delete a variable.
     *
     * @param id The id of the variable to delete.
     * @param target A node on which to dispatch the event.
     * @returns Promise resolved to the delete record
     */
    static async delete(id: string, target: EventTarget = window): Promise<ContextDeleteRecord | undefined> {
      const e = new ContextDeleteEvent(EventTypes.Model.Variable.delete, id);
      target.dispatchEvent(e);
      return e.detail.result;
    }

    /**
     * Dispatches an event to list the variables data.
     * 
     * Note, limit is always ignored and it returns all variables in the environment.
     * 
     * @param opts The query options. The `parent` is required and it refers to the `name` or `id` of the environment.
     * @param target A node on which to dispatch the event.
     * @returns Model query result.
     */
    static async list(opts: ContextListOptions, target: EventTarget = window): Promise<ContextListResult<ARCVariable> | undefined> {
      const e = new ContextListEvent<ARCVariable>(EventTypes.Model.Variable.list, opts);
      target.dispatchEvent(e);
      return e.detail.result;
    }

    /**
     * Dispatches an event handled by the data store to set a variable for the current environment.
     *
     * @param name The name of the variable. Case sensitive.
     * @param value The value to set on the variable.
     * @param target A node on which to dispatch the event.
     * @returns Promise resolved to the change record
     */
    static async set(name: string, value: string, target: EventTarget = window): Promise<ContextChangeRecord<ARCVariable> | undefined> {
      const e = new ContextEvent<{ name: string, value: string }, ContextChangeRecord<ARCVariable>>(EventTypes.Model.Environment.current, { name, value });
      target.dispatchEvent(e);
      return e.detail.result;
    }

    static State = class {
      /**
       * Dispatches an event after a variable was updated
       *
       * @param record Change record
       * @param target A node on which to dispatch the event.
       */
      static update(record: ContextChangeRecord<ARCVariable>, target: EventTarget = window): void {
        const e = new ContextStateUpdateEvent(EventTypes.Model.Variable.State.update, record);
        target.dispatchEvent(e);
      }

      /**
       * Dispatches an event after an variable was deleted
       *
       * @param record The delete record
       * @param target A node on which to dispatch the event.
       */
      static delete(record: ContextDeleteRecord, target: EventTarget = window): void {
        const e = new ContextStateDeleteEvent(EventTypes.Model.Variable.State.delete, record);
        target.dispatchEvent(e);
      }
    }
  }

  static RestApi = class {
    /**
     * Dispatches an event to list the REST API index data.
     *
     * @param opts Query options.
     * @param target A node on which to dispatch the event.
     * @returns List query result.
     */
    static async list(opts?: ContextListOptions, target: EventTarget = window): Promise<ContextListResult<ARCRestApiIndex> | undefined> {
      const e = new ContextListEvent<ARCRestApiIndex>(EventTypes.Model.RestApi.list, opts);
      target.dispatchEvent(e);
      return e.detail.result;
    }

    /**
     * Dispatches an event handled by the data store to read the REST API index metadata.
     *
     * @param id The entity id
     * @param target A node on which to dispatch the event.
     * @returns Promise resolved to the entity
     */
    static async read(id: string, target: EventTarget = window): Promise<ARCRestApiIndex | undefined> {
      const e = new ContextReadEvent<ARCRestApiIndex>(EventTypes.Model.RestApi.read, id);
      target.dispatchEvent(e);
      return e.detail.result;
    }

    /**
     * Dispatches an event handled by the data store to read the REST API data metadata.
     *
     * @param id The entity id
     * @param target A node on which to dispatch the event.
     * @returns Promise resolved to the entity
     */
    static async dataRead(id: string, target: EventTarget = window): Promise<ARCRestApi | undefined> {
      const e = new ContextReadEvent<ARCRestApi>(EventTypes.Model.RestApi.dataRead, id);
      target.dispatchEvent(e);
      return e.detail.result;
    }

    /**
     * Dispatches an event handled by the data store to update an API Index entity
     *
     * @param entity The entity to update.
     * @param target A node on which to dispatch the event.
     * @returns Promise resolved to a the change record
     */
    static async update(entity: ARCRestApiIndex, target: EventTarget = window): Promise<ContextChangeRecord<ARCRestApiIndex> | undefined> {
      const e = new ContextUpdateEvent(EventTypes.Model.RestApi.update, { item: entity });
      target.dispatchEvent(e);
      return e.detail.result;
    }

    /**
     * Dispatches an event handled by the data store to update a REST API data entity
     *
     * @param target A node on which to dispatch the event.
     * @param entity The entity to update.
     * @returns Promise resolved to a the change record
     */
    static async dataUpdate(entity: ARCRestApi, target: EventTarget = window): Promise<ContextChangeRecord<ARCRestApi> | undefined> {
      const e = new ContextUpdateEvent(EventTypes.Model.RestApi.update, { item: entity });
      target.dispatchEvent(e);
      return e.detail.result;
    }

    /**
     * Dispatches an event handled by the data store to update a list of REST API index entities.
     *
     * @param target A node on which to dispatch the event.
     * @param entities The list of entities to update.
     * @returns Promise resolved to a list of change records
     */
    static async updateBulk(entities: ARCRestApiIndex[], target: EventTarget = window): Promise<ContextChangeRecord<ARCRestApiIndex>[] | undefined> {
      const e = new ContextUpdateBulkEvent(EventTypes.Model.RestApi.updateBulk, { items: entities });
      target.dispatchEvent(e);
      return e.detail.result;
    }

    /**
     * Dispatches an event handled by the data store to delete a RETS API.
     *
     * @param target A node on which to dispatch the event.
     * @param id The id of the entity to delete.
     * @returns Promise resolved to the delete record
     */
    static async delete(id: string, target: EventTarget = window): Promise<ContextDeleteRecord | undefined> {
      const e = new ContextDeleteEvent(EventTypes.Model.RestApi.delete, id);
      target.dispatchEvent(e);
      return e.detail.result;
    }

    /**
     * Dispatches an event handled by the data store to delete a version of a RETS API.
     *
     * @param id The id of the entity to delete.
     * @param version The version of the API to delete
     * @param target A node on which to dispatch the event.
     * @returns Promise resolved to the delete record
     */
    static async versionDelete(id: string, version: string, target: EventTarget = window): Promise<ContextDeleteRecord | undefined> {
      const e = new ContextDeleteEvent(EventTypes.Model.RestApi.State.versionDelete, id, version);
      target.dispatchEvent(e);
      return e.detail.result;
    }

    static State = class {
      /**
       * Dispatches an event after a REST API index entity was updated
       *
       * @param record Change record
       * @param target A node on which to dispatch the event.
       */
      static update(record:ContextChangeRecord<ARCRestApi>, target: EventTarget = window): void {
        const e = new ContextStateUpdateEvent(EventTypes.Model.RestApi.State.update, record);
        target.dispatchEvent(e);
      }

      /**
       * Dispatches an event after a REST API data entity was updated
       *
       * @param target A node on which to dispatch the event.
       * @param record Change record
       */
      static dataUpdate(record: ContextChangeRecord<ARCRestApi>, target: EventTarget = window): void {
        const e = new ContextStateUpdateEvent(EventTypes.Model.RestApi.State.dataUpdate, record);
        target.dispatchEvent(e);
      }

      /**
       * Dispatches an event after a REST API was deleted
       *
       * @param target A node on which to dispatch the event.
       * @param record The delete record
       */
      static delete(record: ContextDeleteRecord, target: EventTarget = window): void {
        const e = new ContextStateDeleteEvent(EventTypes.Model.RestApi.State.delete, record);
        target.dispatchEvent(e);
      }

      /**
       * Dispatches an event after a REST API version was deleted
       *
       * @param target A node on which to dispatch the event.
       * @param record The delete record where the parent is the deleted version.
       */
      static versionDelete(record: ContextDeleteRecord, target: EventTarget = window): void {
        const e = new ContextStateDeleteEvent(EventTypes.Model.RestApi.State.versionDelete, record);
        target.dispatchEvent(e);
      }
    }
  }
}
