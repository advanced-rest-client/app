/* eslint-disable max-classes-per-file */

import { EventTypes } from "./EventTypes.js";

export const propertyValue = Symbol('propertyValue');
export const valueValue = Symbol('valueValue');

/**
 * Dispatches when a request property changed.
 * Note, this is only for select number of properties that are globally interesting
 * (like URL or content type header). 
 * 
 * Use `changedProperty` and `changedValue` to read the values.
 */
export class RequestChangeEvent extends Event {
  [propertyValue]: string;

  /**
   * The name of the property that changed used to initialize this event
   */
  get changedProperty(): string {
    return this[propertyValue];
  }

  [valueValue]: unknown;

  /**
   * The value of the property that changed used to initialize this event
   */
  get changedValue(): unknown {
    return this[valueValue];
  }

  /**
   * @param type The type of the event
   * @param property The name of the property that changed
   * @param value The value of the property that changed
   */
  constructor(type: string, property: string, value: unknown) {
    super(type, {
      bubbles: true,
      composed: true,
    });
    this[propertyValue] = property;
    this[valueValue] = value;
  }
}

export class RequestEvents {
  /**
   * Dispatches an event to inform the request logic to send current request.
   * 
   * @param target A node on which to dispatch the event
   */
  static send(target: EventTarget): void {
    const e = new Event(EventTypes.Request.send, {
      bubbles: true,
      cancelable: true,
      composed: true,
    });
    target.dispatchEvent(e);
  }

  static State = class {
    /**
     * Dispatches an event to inform about request URL change
     * 
     * @param value The new URL value
     * @param target A node on which to dispatch the event
     */
    static urlChange(value: string, target: EventTarget = window): void {
      const e = new RequestChangeEvent(EventTypes.Request.State.urlChange, 'url', value);
      target.dispatchEvent(e);
    }

    /**
     * Dispatches an event to inform about content-type header change
     * 
     * @param value The new content-type value
     * @param target A node on which to dispatch the event
     */
    static contentTypeChange(value: string, target: EventTarget = window): void {
      const e = new RequestChangeEvent(EventTypes.Request.State.contentTypeChange, 'content-type', value);
      target.dispatchEvent(e);
    }
  }
}
