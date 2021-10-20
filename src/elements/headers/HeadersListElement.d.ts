import { LitElement, TemplateResult } from 'lit-element';
import { FormTypes } from '@advanced-rest-client/events';
import {
  listValue,
  headersValue,
  processHeaders,
  autoLink,
  listItemTemplate,
} from './internals.js';

export const linkRegexp: RegExp;

/**
 * An element that renders a list of headers.
 */
export default class HeadersListElement extends LitElement {

  /**
   * A HTTP headers to render.
   * @attribute
   */
  headers: string;
  [headersValue]: string;

  /**
   * Tests whether there's anything to render.
   */
  readonly hasHeaders: boolean;
  [listValue]: FormTypes.FormItem[];

  /**
   * @param value Processes the headers value.
   */
  [processHeaders](value: string): void;

  /**
   * Searches for links in the string and wraps it in a HTML.
   * @param input The header value
   * @returns Parsed header
   */
  [autoLink](input: string): string|TemplateResult;

  render(): TemplateResult;

  /**
   * Renders a header list item
   */
  [listItemTemplate](header: FormTypes.FormItem): TemplateResult;
}
