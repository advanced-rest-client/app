import { TemplateResult } from 'lit-html';
import { ApplicationScreen } from './ApplicationScreen';

export const contentSearchInputHandler: unique symbol;
export const searchBarSuffixTemplate: unique symbol;
export const keydownHandler: unique symbol;
export const searchResultHandler: unique symbol;

/**
 * A page that is opened in the Application's search bar.
 * Communicates with the back end via the DOM events.
 */
export class SearchBar extends ApplicationScreen {
  searchBarCount: number;
  searchBarOrdinal: number;
  searchBarQuery: string;
  constructor();
  initialize(): Promise<void>;
  [searchResultHandler](e: CustomEvent): void;
  [contentSearchInputHandler](e: Event): void;
  [keydownHandler](e: KeyboardEvent): void;
  /**
   * Dispatches the find event to the backend
   */
  findNext(): void;
  /**
   * Dispatches the find event to the backend
   */
  findPrevious(): void;
  close(): void;
  appTemplate(): TemplateResult;
  /**
   * @returns The template for search bar counters, when has search results
   */
  [searchBarSuffixTemplate](): TemplateResult|string;
}
