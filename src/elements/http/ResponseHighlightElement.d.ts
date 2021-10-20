import { LitElement, CSSResult, TemplateResult } from 'lit-element';
import {
  codeValue,
  outputElement,
  highlightResults,
  contentTypeValue,
  highlightResponse,
  highlightDebounce,
  tokenize,
  detectLang,
  contentTypeToLang,
  responseClickHandler,
  pendingViewUpdate,
  activeValue,
  contextMenuHandler,
  formatJson,
} from './internals.js';


/**
 * Response syntax highlighting via Prism
 *
 */
export default class ResponseHighlightElement extends LitElement {
  get styles(): CSSResult;

  render(): TemplateResult;

  /**
   * Body to be rendered
   * @attribute
   */
  code: string;
  /**
   * Prism supported language.
   * @attribute
   */
  lang: string;
  /** 
   * Whether or not to add lines counter.
   * @attribute
   */
  lines: boolean;
  /** 
   * Whether the view is currently being rendered or not.
   * When the view is active (in the DOM) but not rendered the 
   * line numbers won't be computed properly because they are not rendered.
   * By changing this status (from `false` to `true`) the element will force
   * line numbers recalculation.
   * 
   * It may always stay not set or false, in which case it has no effect,.
   * @attribute
   */
  active: boolean;
  [activeValue]: boolean;
  [pendingViewUpdate]: boolean;
  [highlightDebounce]: boolean;
  [contentTypeValue]: string;
  [highlightResults]: string;
  [codeValue]: string;

  readonly [outputElement]: HTMLOutputElement;

  constructor();

  disconnectedCallback(): void;

  firstUpdated(): void;

  /**
   * Resets the state of the renderer to the initial state.
   */
  reset(): void;

  /**
   * When supported it formats the current output.
   */
  format(): void;
  
  /**
   * Highligh the code.
   */
  [highlightResponse](): void;

  /**
   * Runs the prism tokenization and writes results into the renderer.
   * @param code The code to tokenize
   * @param lang Code's content type.
   */
  [tokenize](code: string, lang: string): void;

  /**
   * Handler for click events.
   * It dispatches `url-change-action` custom event when a link is clicked.
   */
  [responseClickHandler](e: PointerEvent): void;

  /**
   * Picks a Prism formatter based on the `lang` hint and `code`.
   *
   * @param code The source being highlighted.
   * @param lang A language hint (e.g. ````LANG`).
   */
  [detectLang](code: string, lang: string): any;

  /**
   * Maps popular content type values to a Prism language.
   * @param type Response content type
   * @returns The same content type or language name if found mapping.
   */
  [contentTypeToLang](type: string): string;

   /**
   * Handles the `contextmenu` event and dispatches internal event to be handled by the hosting application.
   */
  [contextMenuHandler](e: MouseEvent): void;

  /**
   * Formats the current code as JSON string and re-renders the view.
   */
  [formatJson](code: string): void;
  /**
   * Removes the `)]}',\n` from the code.
   */
  cleanJsonNp(code: string): string;
}
