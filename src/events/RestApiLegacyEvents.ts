import { ContextEvent } from "@api-client/core/build/browser.js";
import { EventTypes } from "./EventTypes.js";

/**
 * This interface is temporary until the API processing module is upgraded to support types.
 */
export interface RestApiFileProcessingResult {
  /**
   * The processed data model
   */
  model: unknown;
  /**
   * API type (RAML 1.0, OAS 3.0, etc)
   */
  type: string;
}

export class RestApiLegacyEvents {
  /**
   * @param file The file to process
   */
  static async processFile(file: File, target: EventTarget = window): Promise<RestApiFileProcessingResult | undefined> {
    const e = new ContextEvent<{ file: File }, RestApiFileProcessingResult>(EventTypes.RestApiLegacy.processFile, {
      file,
    });
    target.dispatchEvent(e);
    return e.detail.result;
  }

  /**
   * @param model The processed data model
   * @param type API type (RAML 1.0, OAS 3.0, etc)
   */
  static dataReady(model: unknown, type: string, target: EventTarget = window): void {
    const e = new CustomEvent(EventTypes.RestApiLegacy.dataReady, {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail: {
        model,
        type,
      }
    });
    target.dispatchEvent(e);
  }
}
