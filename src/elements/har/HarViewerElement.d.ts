import { LitElement, TemplateResult, CSSResult } from 'lit-element';
import { Entry, Har, Header, Page, QueryString, Request, Response, Timings } from 'har-format';
import { RenderedPage, RenderedEntry, SortableEntry, EntrySizing, RenderedEntryTimings } from '../../types';

export declare const harValue: unique symbol;
export declare const ignorePagesValue: unique symbol;
export declare const processHar: unique symbol;
export declare const computeEntriesOnly: unique symbol;
export declare const computePages: unique symbol;
export declare const pagesValue: unique symbol;
export declare const entriesValue: unique symbol;
export declare const renderPages: unique symbol;
export declare const renderEntries: unique symbol;
export declare const pageTemplate: unique symbol;
export declare const pageHeaderTemplate: unique symbol;
export declare const entriesTemplate: unique symbol;
export declare const entryTemplate: unique symbol;
export declare const openedPagesValue: unique symbol;
export declare const openedEntriesValue: unique symbol;
export declare const computeRenderedEntries: unique symbol;
export declare const computeStatusClasses: unique symbol;
export declare const statusLabel: unique symbol;
export declare const loadingTimeTemplate: unique symbol;
export declare const responseSizeTemplate: unique symbol;
export declare const togglePage: unique symbol;
export declare const pageClickHandler: unique symbol;
export declare const pageKeydownHandler: unique symbol;
export declare const computeTotalTime: unique symbol;
export declare const computeVisualTimes: unique symbol;
export declare const sumTimings: unique symbol;
export declare const timingsTemplate: unique symbol;
export declare const timingTemplate: unique symbol;
export declare const sortEntires: unique symbol;
export declare const entrySelectionHandler: unique symbol;
export declare const entryDetails: unique symbol;
export declare const entryDetailsTabsTemplate: unique symbol;
export declare const selectedTabsValue: unique symbol;
export declare const detailsTabSelectionHandler: unique symbol;
export declare const entryDetailsContentTemplate: unique symbol;
export declare const entryDetailsRequestTemplate: unique symbol;
export declare const entryDetailsResponseTemplate: unique symbol;
export declare const definitionTemplate: unique symbol;
export declare const headersTemplate: unique symbol;
export declare const queryParamsTemplate: unique symbol;
export declare const computeEntrySizeInfo: unique symbol;
export declare const sizesTemplate: unique symbol;
export declare const entryDetailsRequestBodyTemplate: unique symbol;
export declare const entryDetailsResponseBodyTemplate: unique symbol;
export declare const entryDetailsCookiesTemplate: unique symbol;

export default class HarViewerElement extends LitElement {
  static get styles(): CSSResult;

  /** 
   * The HAR object to render.
   */
  har: Har;
  /** 
  * When set it ignores pages matching and renders all requests in a single table.
  * @attribute
  */
  ignorePages: boolean;

  [entriesValue]: RenderedEntry[];
  [pagesValue]: RenderedPage[];
  [openedPagesValue]: string[];
  [openedEntriesValue]: string[];
  [selectedTabsValue]: object;

  constructor();

  /**
   * Called when the `har` or `ignorePages` changed.
   */
  [processHar](): void;

  /**
   * @returns Copy of the entires array with a shallow copy of each entry.
   */
  [sortEntires](entries: Entry[]): SortableEntry[];

  /**
   * Performs computations to render entries only.
   * @param entries The list of entries to process.
   */
  [computeEntriesOnly](entries: SortableEntry[]): void;

  /**
   * Performs computations to render entries by page.
   * @param {} pages The list of pages to process.
   * @param {} entries The list of entries to process.
   */
  [computePages](pages: Page[], entries: SortableEntry[]): void;

  /**
   * @param entries The entries to perform computations on.
   * @param totalTime The total time of all entries rendered in the group
   */
  [computeRenderedEntries](entries: SortableEntry[], totalTime: number): RenderedEntry[];

  [computeEntrySizeInfo](info: Request|Response): EntrySizing;

  /**
   * @param code The status code to test for classes.
   * @returns List of classes to be set on the status code
   */
  [computeStatusClasses](code: number): any;

  /**
   * Computes the total time of page requests.
   * @param first The earliest entry in the range
   * @param last The latest entry in the range
   * @returns The total time of the page. Used to build the timeline.
   */
  [computeTotalTime](first: Entry, last: Entry): number;

  /**
   * @param timings The entry's timings object.
   * @param delay The timestamp when the first request started.
   * @param total The number of milliseconds all entries took.
   */
  [computeVisualTimes](timings: Timings, delay: number, total: number): RenderedEntryTimings|undefined;

   /**
    * Sums all timing values.
    * @param timings The timings object to compute
    * @returns The total time, excluding -1s
    */
  [sumTimings](timings: Timings): number;

  /**
   * A handler for the page label click to toggle the page entries.
   */
  [pageClickHandler](e: Event): void;

  /**
   * A handler for the page label keydown to toggle the page entries on space key.
   */
  [pageKeydownHandler](e: KeyboardEvent): void;

  /**
   * Toggles the visibility of the page entries.
   * @param id The id of the page.
   */
  [togglePage](id: string): void;

  /**
   * Handler for the list item selection event.
   */
  [entrySelectionHandler](e: Event): void;

  /**
   * Handler for the list item selection event.
   */
  [detailsTabSelectionHandler](e: Event): void;

  render(): TemplateResult;

  /**
   * @returns Template for the pages table
   */
  [renderPages](pages: RenderedPage[]): TemplateResult;

  /**
   * @returns Template for the entries table
   */
  [renderEntries](entries: RenderedEntry[]): TemplateResult;

  /**
   * @returns Template for a single page
   */
  [pageTemplate](info: RenderedPage): TemplateResult;

  /**
   * @returns Template for the pages table
   */
  [pageHeaderTemplate](page: Page, totalTime: number): TemplateResult;

  /**
   * @returns The template for the entries list
   */
  [entriesTemplate](entries: RenderedEntry[]): TemplateResult;

  /**
   * @returns The template for a single entry
   */
  [entryTemplate](entry: RenderedEntry): TemplateResult;

  /**
   * @param status The response status code
   * @param statusText The response reason part of the status.
   * @returns The template for the status message
   */
  [statusLabel](status: number, statusText?: string): TemplateResult;

  /**
   * @param value The response loading time
   * @returns Template for the loading time message
   */
  [loadingTimeTemplate](value: number): TemplateResult|string;

  /**
   * @returns Template for the response size
   */
  [responseSizeTemplate](sizing: EntrySizing): TemplateResult|string;

  /**
   * @param timings The entry's timings
   * @param visualTimings The computed visual timings for the template
   * @param fullWidth When set then it renders the timeline in the whole available space.
   * @returns The template for the timings timeline
   */
  [timingsTemplate](timings: Timings, visualTimings: RenderedEntryTimings, fullWidth?: boolean): TemplateResult|string;

  /**
   * @param width
   * @param type Added to the class name.
   * @param label The label to use in the title attribute
   * @param timings The entry's timings object
   * @returns The template for a timing timeline item
   */
  [timingTemplate](width: number, type: string, label?: string, timings?: Timings): TemplateResult|string;

  /**
   * @param entry The entry to render
   * @returns The template for an entry details.
   */
  [entryDetails](entry: RenderedEntry): TemplateResult;

  /**
   * @param entry The entry to render
   * @param selected The index of the selected tab
   * @returns The template for entry details content tabs.
   */
  [entryDetailsTabsTemplate](entry: RenderedEntry, selected: number): TemplateResult;

  /**
   * @param entry The entry to render
   * @param selected The index of the selected tab
   * @returns The template for entry details content.
   */
  [entryDetailsContentTemplate](entry: RenderedEntry, selected: number): TemplateResult|string;

  /**
   * @param entry The entry to render
   * @returns The template for entry's request content.
   */
  [entryDetailsRequestTemplate](entry: RenderedEntry): TemplateResult;

  /**
   * @param entry The entry to render
   * @returns The template for entry's response content.
   */
  [entryDetailsResponseTemplate](entry: RenderedEntry): TemplateResult;

  /**
   * @param entry The entry to render
   * @returns The template for entry's request body preview.
   */
  [entryDetailsRequestBodyTemplate](entry: RenderedEntry): TemplateResult;

  /**
   * @param entry The entry to render
   * @returns The template for entry's response body preview.
   */
  [entryDetailsResponseBodyTemplate](entry: RenderedEntry): TemplateResult;

  /**
   * @param entry The entry to render
   * @returns The template for entry's cookies.
   */
  [entryDetailsCookiesTemplate](entry: RenderedEntry): TemplateResult;

  /**
   * @param term Definition label
   * @param value Definition value
   * @returns The template for the definition.
   */
  [definitionTemplate](term: string, value: string): TemplateResult|string;

  /**
   * @returns The template for the list of headers.
   */
  [headersTemplate](headers: Header[]): TemplateResult;

  /**
   * @returns The template for the query parameters.
   */
  [queryParamsTemplate](params: QueryString[]): TemplateResult|string;

  /**
   * @returns The template for sizes information
   */
  [sizesTemplate](sizes: EntrySizing): TemplateResult;
}
