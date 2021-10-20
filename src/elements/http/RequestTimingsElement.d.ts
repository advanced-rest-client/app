import { LitElement, TemplateResult, CSSResult } from 'lit-element';
import { ArcResponse } from '@advanced-rest-client/events';
import {
  timingsValue,
  computeTimings,
  readTimingValue,
  requestTime,
  connectTime,
  receiveTime,
  sendTime,
  waitTime,
  blockedTime,
  dnsTime,
  sslTime,
  timingRowTemplate,
  roundTime,
  startTimeTemplate,
  computeSum,
} from './internals.js';

/**
 * An element to render request timings data according to the HAR 1.2 spec.
 */
export default class RequestTimingsElement extends LitElement {
  get styles(): CSSResult;

  /**
   * A timings object as described in HAR 1.2 spec.
   */
  timings: ArcResponse.RequestTime;
  [timingsValue]: ArcResponse.RequestTime;
  [requestTime]: number;
  [connectTime]: number;
  [receiveTime]: number;
  [sendTime]: number;
  [waitTime]: number;
  [blockedTime]: number;
  [dnsTime]: number;
  [sslTime]: number;

  /**
   * When set it renders mobile friendly view
   * @attribute
   */
  narrow: boolean;
  /** 
   * The request start time
   * @attribute
   */
  startTime?: number;

  constructor();

  /**
   * Reads the timing value and normalizes it to a positive integer.
   * @param value The value to parse
   * @param forceNumber When set it casts `undefined` to a number
   * @returns positive integer value for the request timings.
   */
  [readTimingValue](value: any, forceNumber?: boolean): number|undefined;

  /**
   * Updates the view after `timings` change.
   */
  [computeTimings](timings: ArcResponse.RequestTime): void;
  
  /**
   * Round numeric value to precision defined in the `power` argument.
   *
   * @param value The value to round
   * @return Rounded value.
   */
  [roundTime](value: number): string;

  /**
   * Sums two HAR times.
   * If any argument is `undefined` or `-1` then `0` is assumed.
   * @param a Time #1
   * @param b Time #2
   * @returns Sum of both
   */
  [computeSum](a: number, b: number): number;

  /**
   * Renders a single timing row.
   * @param {string} label Row label
   * @param {string} ariaLabel Aria label for the progress element
   * @param {number} value The value of the progress
   * @param {number} max Max value of the progress
   * @param {number} sec Secondary progress value
   * @param {number} labelValue The time value to render
   * @returns {string|TemplateResult}
   */
  [timingRowTemplate](label: string, ariaLabel: string, value: number, max: number, sec: number, labelValue: number): string|TemplateResult;

  /**
   * Renders the start time row
   * @param time The timestamp of the request
   */
  [startTimeTemplate](time: number): string|TemplateResult;

  render(): TemplateResult;
}
