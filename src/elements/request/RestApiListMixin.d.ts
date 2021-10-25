import { 
  ARCRestApiUpdatedEvent,
  ARCRestApiDeletedEvent,
  ARCModelStateDeleteEvent,
} from '@advanced-rest-client/events';
import { RestApi } from '@advanced-rest-client/events'
import { TemplateResult } from 'lit-html';
import { ListMixin, ListMixinConstructor } from './ListMixin';
import {
  dataImportHandler,
  dataDestroyHandler,
  indexUpdatedHandler,
  indexDeletedHandler,
  restApiDeleteHandler,
  queryTimeoutValue,
  pageTokenValue,
  loadPage,
  openHandler,
  listScrollHandler,
  busyTemplate,
  dropTargetTemplate,
  unavailableTemplate,
  listTemplate,
  apiItemTemplate,
  itemBodyTemplate,
  itemActionsTemplate,
  noMoreItemsValue,
} from './internals.js';

declare function RestApiListMixin<T extends new (...args: any[]) => {}>(base: T): T & RestApiListMixinConstructor & ListMixinConstructor;

export {RestApiListMixinConstructor};
export {RestApiListMixin};

declare interface RestApiListMixinConstructor {
  new(...args: any[]): RestApiListMixin;
}

declare interface RestApiListMixin extends ListMixin {
  /**
   * The list of request to render.
   * It can be either saved, history or project items.
   */
  items: RestApi.ARCRestApiIndex[];
  /**
   * When set it won't query for data automatically when attached to the DOM.
   * @attribute
   */
  noAuto: boolean;
 
  /**
   * Computed value. `true` if the `items` property has values.
   */
  readonly hasItems: boolean;
  
  /**
   * True when there's no requests after refreshing the state.
   */
  readonly dataUnavailable: boolean;
  
  [noMoreItemsValue]: boolean;
  [pageTokenValue]: string;
  [queryTimeoutValue]: number;

  connectedCallback(): void;
  disconnectedCallback(): void;

  /**
   * Handler for `data-imported` custom event.
   * Refreshes data state.
   */
  [dataImportHandler](): void;

  /**
   * Resets the state of the variables.
   */
  reset(): void;

  /**
   * Refreshes the data from the datastore.
   * It resets the query options, clears requests and makes a query to the datastore.
   */
  refresh(): void;

  /**
   * Handler for the `datastore-destroyed` custom event.
   * If one of destroyed databases is history store then it refreshes the sate.
   */
  [dataDestroyHandler](e: ARCModelStateDeleteEvent): void;

  /**
   * The function to call when new query for data is needed.
   * Use this instead of `[loadPage]()` as this function uses debouncer to
   * prevent multiple calls at once.
   */
  loadNext(): void;

  /**
   * Performs the query and processes the result.
   * This function immediately queries the data model for data.
   * It does this in a loop until all data are read.
   */
  [loadPage](): Promise<void>;

  /**
   * Handler for the `click` event on the list item.
   */
  [openHandler](e: PointerEvent): void;

  /**
   * Index item has been changed and should be updated / added.
   */
  [indexUpdatedHandler](e: ARCRestApiUpdatedEvent): Promise<void>;

  /**
   * Handler for API delete event.
   * Only non-cancelable event is considered.
   */
  [indexDeletedHandler](e: ARCRestApiDeletedEvent): void;

  [listScrollHandler](e: Event): void;

  /**
   * Handler for the delete button click.
   */
  [restApiDeleteHandler](e: PointerEvent): Promise<void>

  /**
   * @returns A template for the loader element
   */
  [busyTemplate](): TemplateResult|string;

  /**
   * @returns A template with the drop request message
   */
  [dropTargetTemplate](): TemplateResult;

  /**
   * @returns A template for when data are unavailable.
   */
  [unavailableTemplate](): TemplateResult|string;

  /**
   * @returns Template for the list items.
   */
  [listTemplate](): string|TemplateResult;

  [apiItemTemplate](api: RestApi.ARCRestApiIndex, index: number): TemplateResult;
  
  [itemBodyTemplate](api: RestApi.ARCRestApiIndex): TemplateResult;

  /**
   * @param id The id of the API index entity
   * @returns Template for a list item actions
   */
  [itemActionsTemplate](id: string): TemplateResult|string;
}
