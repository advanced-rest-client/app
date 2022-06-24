/* eslint-disable max-classes-per-file */

import { ContextEvent } from '@api-client/core/build/browser.js';
import { EventTypes } from './EventTypes.js';

export interface FindInPageOptions {
  /**
   * Whether to search forward or backward, defaults to `true`.
   */
  forward?: boolean;
  /**
   * Whether to begin a new text finding session with this request. Should be `true`
   * for initial requests, and `false` for follow-up requests. Defaults to `false`.
   */
  findNext?: boolean;
  /**
   * Whether search should be case-sensitive, defaults to `false`.
   */
  matchCase?: boolean;
}

export class SearchEvents {
  /** 
   * Triggers the search action.
   * @param query The search term
   * @param options Optional query options.
   * @param target The node on which to dispatch the event.
   * @returns Resolved when the search command was sent to the backend.
   */
  static async find(query: string, options?: FindInPageOptions, target: EventTarget = window): Promise<void> {
    const e = new ContextEvent<{ query: string, options?: FindInPageOptions }, void>(EventTypes.Search.find, { query, options });
    target.dispatchEvent(e);
    await e.detail.result;
  }

  /** 
   * Clears the search result
   * @param target The node on which to dispatch the event.
   * @returns Resolved when the clear command was sent to the backend.
   */
  static async clear(target: EventTarget = window): Promise<void> {
    const e = new ContextEvent<Record<string, unknown>, void>(EventTypes.Search.clear, {});
    target.dispatchEvent(e);
    await e.detail.result;
  }

  static State = class {
    /**
     * @param matches The number of matches in the search result.
     * @param activeMatchOrdinal The index of the currently highlighted matched item.
     */
    static foundInPage(matches: number, activeMatchOrdinal: number, target: EventTarget = window): void {
      const e = new CustomEvent(EventTypes.Search.State.foundInPage, {
        bubbles: true,
        composed: true,
        detail: {
          matches, 
          activeMatchOrdinal,
        },
      });
      target.dispatchEvent(e);
    }
  }
}
