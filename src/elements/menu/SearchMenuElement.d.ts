/**
@license
Copyright 2021 The Advanced REST client authors <arc@mulesoft.com>
Licensed under the Apache License, Version 2.0 (the "License"); you may not
use this file except in compliance with the License. You may obtain a copy of
the License at
http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
License for the specific language governing permissions and limitations under
the License.
*/
import { LitElement, TemplateResult, CSSResult } from 'lit-element';
import { ArcRequest } from '@advanced-rest-client/events';
import { ListMixin } from '../request/ListMixin';
import { SavedSearchItem, HistorySearchItem } from '../../types';

export declare const formTemplate: unique symbol;
export declare const searchHandler: unique symbol;
export declare const searchInput: unique symbol;
export declare const noResultsTemplate: unique symbol;
export declare const resultsTemplate: unique symbol;
export declare const commitValue: unique symbol;
export declare const searchItemTemplate: unique symbol;
export declare const itemClickHandler: unique symbol;
export declare const dragStartHandler: unique symbol;
export declare const historyItemTemplate: unique symbol;
export declare const savedItemTemplate: unique symbol;
export declare const readType: unique symbol;
export declare const postQuery: unique symbol;
export declare const postProcessHistoryItem: unique symbol;
export declare const postProcessSavedItem: unique symbol;

/**
 * Advanced REST Client's history menu element.
 */
export default class SearchMenuElement extends ListMixin(LitElement) {
  /**
   * Computed value. True when the query has been performed and no items
   * has been returned. 
   */
  get noResults(): boolean;

  /**
   * Computed value. True when the query has been performed and no items
   * has been returned. 
   */
  get hasResults(): boolean;

  /** 
   * The current search input value
   * @attribute
   */
  q: string;

  /** 
   * When set it queries for the data.
   * @attribute
   */
  querying: boolean;

  /** 
   * The list of query results.
   */
  items: (SavedSearchItem | HistorySearchItem)[];

  /** 
   * When set the search has been performed.
   * @attribute
   */
  inSearch: boolean;
  /**
   * Adds draggable property to the request list item element.
   * The `dataTransfer` object has `arc/request-object` mime type with
   * serialized JSON with request model.
   * @attribute
   */
  draggableEnabled: boolean;

  constructor();

  [searchHandler](): void;

  [searchInput](e: Event): void;

  /**
   * Runs the query for the current term
   */
  query(): Promise<void>;

  /**
   * Updates the requests into the search objects.
   */
  [postQuery](results: (ArcRequest.ARCHistoryRequest | ArcRequest.ARCSavedRequest)[]): Promise<void>;

  /**
   * Post processes history object
   */
  [postProcessHistoryItem](item: ArcRequest.ARCHistoryRequest): Promise<HistorySearchItem>;

  /**
   * Post processes saved object
   */
  [postProcessSavedItem](item: ArcRequest.ARCSavedRequest): Promise<SavedSearchItem>;

  /**
   * @param {string} type
   * @returns {string} The type used in the ARC request model.
   */
  [readType](type: string): string;

  /**
   * Sets draggable properties recognized by the components.
   */
  [dragStartHandler](e: Event): void;

  /**
   * Triggers the navigation
   */
  [itemClickHandler](e: Event): void;

  render(): TemplateResult;

  /**
   * @returns The template for the search input
   */
  [formTemplate](): TemplateResult;

  /**
   * @returns The template for the empty results page
   */
  [noResultsTemplate](): TemplateResult|string;

  /**
   * @returns The template for the search items.
   */
  [resultsTemplate](): TemplateResult|string;

  /**
   * @returns The template for a single list item
   */
  [searchItemTemplate](item: HistorySearchItem | SavedSearchItem, index: number): TemplateResult;

  /**
   * @returns The template for a history list item
   */
  [historyItemTemplate](searchItem: HistorySearchItem, index: number): TemplateResult;

  /**
   * @returns The template for a saved list item
   */
  [savedItemTemplate](searchItem: SavedSearchItem, index: number): TemplateResult;
}
