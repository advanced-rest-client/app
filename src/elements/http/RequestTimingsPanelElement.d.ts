import { LitElement, TemplateResult, CSSResult } from 'lit-element';
import { ArcResponse } from '@advanced-rest-client/events';
import { readTimingValue, computeHarTime, computeRequestTime, redirectsTableTemplate, timingsTemplate, timingItemTemplate } from './internals';

/**
 * An element to render a set of ARC HAR timings.
 */
export default class RequestTimingsPanelElement extends LitElement {
  get styles(): CSSResult;

  /**
   * An array of HAR 1.2 timings object.
   * It describes a timings for any redirect occurrence during the request.
   * The list should should be ordered by the occurrence time.
   */
  redirects: ArcResponse.ResponseRedirect[];
  /** 
   * The main request HAR timings.
   */
  timings: ArcResponse.RequestTime;
  /**
   * When set it renders mobile friendly view
   * @attribute
   */
  narrow: boolean;
  /** 
   * The request general start time
   * @attribute
   */
  startTime: number;

  /**
   * Tests whether redirects list has been set
   */
  readonly hasRedirects: boolean;

  constructor();

  /**
   * @param redirects The timings of the redirects
   * @param timings The timings of the final request
   * @returns The total request time
   */
  [computeRequestTime](redirects: ArcResponse.ResponseRedirect[], timings: ArcResponse.RequestTime): number;

  /**
   * Reads a numeric value
   * @param value The input value
   * @param defValue The default value to return when the input is an invalid number.
   * @returns A positive integer value
   */
  [readTimingValue](value: number, defValue?: number): number;

  /**
   * @param har The timings object
   * @returns The total request time
   */
  [computeHarTime](har: ArcResponse.RequestTime): number;

  render(): TemplateResult;

  /**
   * @returns A template for the timings without redirects.
   */
  [timingsTemplate](): TemplateResult;

  /**
   * @returns A template for the timings with redirects.
   */
  [redirectsTableTemplate](): TemplateResult;

  /**
   * @param item A redirect timings
   * @param startTime The request start timestamp
   * @param index The index in the redirects array
   * @returns A template for a single table
   */
  [timingItemTemplate](item: ArcResponse.RequestTime, startTime: number, index: number): TemplateResult;
}
