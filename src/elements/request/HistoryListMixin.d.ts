import { TemplateResult } from 'lit-element';
import { ARCRequestDeletedEvent, ArcRequest } from '@advanced-rest-client/events';
import { HistoryGroup, HistoryListItem, HistoryDayItem } from '../../types';
import { RequestsListMixinConstructor, RequestsListMixin } from './RequestsListMixin';
import {
  appendItems,
  createHistoryGroup,
  createGroupHeaderLabel,
  createGroupDay,
  createGroupListItem,
  findGroupInsertPosition,
  findHistoryInsertPosition,
  requestChanged,
  listTemplate,
  historyGroupHeaderTemplate,
  toggleHistoryGroupHandler,
  requestItemTemplate,
  requestItemBodyTemplate,
  requestDeletedHandler,
  dragStartHandler,
  unavailableTemplate,
} from './internals';


declare function HistoryListMixin<T extends new (...args: any[]) => {}>(base: T): T & HistoryListMixinConstructor & RequestsListMixinConstructor;

export {HistoryListMixinConstructor};
export {HistoryListMixin};

declare interface HistoryListMixinConstructor {
  new(...args: any[]): HistoryListMixin;
}

/**
 * @fires arcnavigaterequest When a request is being navigated
 * @fires queryingchange
 */
declare interface HistoryListMixin extends RequestsListMixin {
  requests: HistoryGroup[];

  connectedCallback(): void;

  /**
   * Appends a list of requests to the history list.
   */
  [appendItems](requests: ArcRequest.ARCHistoryRequest[]): Promise<void>;

  /**
   * Finds a place in the items array where to put a group giving it's timestamp.
   * @param midnight The midnight timestamp of a group
   * @returns The index at which to put the group in the requests array.
   */
  [findGroupInsertPosition](midnight: number): number;

  /**
   * Finds a place in the requests list where to put a history item.
   * 
   * @param requests The list of requests
   * @param request The request to be inserted into the array.
   * @returns The index at which to put the group in the requests array.
   */
  [findHistoryInsertPosition](requests: HistoryListItem[], request: ArcRequest.ARCHistoryRequest): number;

  /**
   * Creates a group of history items.
   */
  [createHistoryGroup](request: ArcRequest.ARCHistoryRequest): HistoryGroup;

  /**
   * Creates a day definition for a history group.
   */
  [createGroupDay](request: ArcRequest.ARCHistoryRequest): HistoryDayItem;

  /**
   * Creates a list item definition
   */
  [createGroupListItem](request: ArcRequest.ARCHistoryRequest): HistoryListItem;

  /**
   * Computes a label to be put for a history group item.
   */
  [createGroupHeaderLabel](request: ArcRequest.ARCHistoryRequest): string;

  /**
   * Handles request model change when the type is history.
   * This assumes that this mixin is used with the combination with the `RequestsListMixin`.
   * If not then register an event listener for the request change handler.
   * 
   * @param request Changed request object.
   */
  [requestChanged](request: ArcRequest.ARCHistoryRequest): void;

  /**
   * Overrides the delete request handler to remove the appropriate request.
   */
  [requestDeletedHandler](e: ARCRequestDeletedEvent): void;

  /**
   * @param e Toggle visibility of the history group
   */
  [toggleHistoryGroupHandler](e: PointerEvent): void;

  /**
   * Overrides the RequestListMixin's drag start function to add `arc/history` property
   */
  [dragStartHandler](e: DragEvent): void;

  /**
   * @returns Template for the list items.
   */
  [listTemplate](): TemplateResult|string;

  /**
   * @param group A group to render
   * @returns Template for the history group item.
   */
  [historyGroupHeaderTemplate](group: HistoryGroup): TemplateResult;

  /**
   * @param item The request to render
   * @param groupIndex Index of the history group
   * @param requestIndex Index of the request in the group
   * @returns Template for a single request object
   */
  [requestItemTemplate](item: HistoryListItem, groupIndex: number, requestIndex: number): TemplateResult;

  /**
   * @param {HistoryListItem} item The request to render
   * @returns {TemplateResult} Template for a request's content
   */
  [requestItemBodyTemplate](item: HistoryListItem): TemplateResult

  [unavailableTemplate](): TemplateResult|string;
}
