import { TemplateResult, LitElement } from 'lit-element';
import { ResizableMixin } from '@anypoint-web-components/awc';
import { Project, ArcRequest, ARCRequestUpdatedEvent } from '@advanced-rest-client/events';
import { ARCProjectNames } from '../../types';

import {
  requestArcRequestEntity,
  requestValue,
  processRequestChange,
  processRequestValue,
  openProjectHandler,
  requestChangeHandler,
  deleteHandler,
  editHandler,
  projectsTemplate,
  deleteButtonTemplate,
  editButtonTemplate,
  requestChanged,
  titleTemplate,
  addressTemplate,
  timeTemplate,
  processProjectsResponse,
  descriptionTemplate,
} from './internals.js';

/**
 * @fires edit An event when requesting to edit current request. The request may not yet be stored in the data store.
 */
export default class RequestMetaDetailsElement extends ResizableMixin(LitElement) {

  /**
   * The request entity id to request from the data store.
   * The `requestType` must also be set to either `history` or `saved`.
   * @attribute
   */
  requestId: string;
  /**
   * The type of the processed request
   * @attribute
   */
  requestType: string;
  /**
   * Enables Anypoint theme
   * @attribute
   */
  anypoint: boolean;

  /**
   * Sets a request object to render without requesting a data from the data store.
   * Useful when dealing with a request that hasn't been stored in the data store.
   */
  request: ArcRequest.ARCSavedRequest|ArcRequest.ARCHistoryRequest;
  [requestValue]: ArcRequest.ARCSavedRequest|ArcRequest.ARCHistoryRequest;

  /**
   * Tests whether the current request object is stored in the data store
   */
  readonly isStored: boolean;
  /**
   * True when the current request is a history type request.
   */
  readonly isHistory: boolean;

  constructor();

  connectedCallback(): void;
  disconnectedCallback(): void;

  [requestChangeHandler](e: ARCRequestUpdatedEvent): void;

  [processRequestChange](): Promise<void>;

  /**
   * Requests for the ARCRequest entity from the requests model.
   */
  [requestArcRequestEntity](requestId: string, requestType: string): Promise<void>;

  /**
   * Reads projects for the request, id any.
   */
  [processRequestValue](): Promise<void>;

  [requestChanged](): void;

  /**
   * Sends `navigate` event set to current read project.
   */
  [openProjectHandler](e: PointerEvent): void;

  /**
   * Sends non-bubbling `delete-request` event to the parent element to perform
   * delete action.
   */
  [deleteHandler](): void;

  /**
   * Sends non-bubbling `edit-request` event to the parent element to perform
   * edit action.
   */
  [editHandler](): void;

  render(): TemplateResult;

  [projectsTemplate](): TemplateResult|string;

  /**
   * Renders the delete button when the request is already saved,
   * meaning when it has `_id` and `_rev`
   */
  [deleteButtonTemplate](request: ArcRequest.ARCSavedRequest|ArcRequest.ARCHistoryRequest): TemplateResult|string;

  [editButtonTemplate](): TemplateResult;

  /**
   * @returns Template for the dialog title
   */
  [titleTemplate](): TemplateResult;

  /**
   * @returns Template for the URL and method
   */
  [addressTemplate](): TemplateResult|string;
  /**
   * Processes query response from the model.
   * @param data The response
   * @param keys Requested keys
   * @returns Processed response or undefined.
   */

  [processProjectsResponse](data: Project.ARCProject[], keys: string[]): ARCProjectNames[];

  /**
   * @returns Template for the description
   */
  [descriptionTemplate](): TemplateResult|string;

  /**
   * @returns Template for a time label
   */
  [timeTemplate](label: string, value: number, other?: number): TemplateResult|string;
}
