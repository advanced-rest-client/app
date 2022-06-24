import { ContextEvent } from "@api-client/core/build/browser.js";
import { AmfServiceProcessingOptions, ApiParseResult } from "../models/Amf.js";
import { EventTypes } from "./EventTypes.js";

export class AmfEvents {
  /**
   * Downloads the file and processes it as a zipped API project.
   *
   * @param url API remote location.
   * @param mainFile API main file. If not set the program will try to find the best match.
   * @param md5 When set it will test data integrity with the MD5 hash
   * @param packaging Default to `zip`.
   * @returns Promise resolved to the AMF json-ld model.
   */
  static async processApiLink(url: string, mainFile?: string, md5?: string, packaging?: string, target: EventTarget = window): Promise<ApiParseResult | undefined> {
    const e = new ContextEvent<{ url: string, mainFile?: string, md5?: string, packaging?: string }, ApiParseResult>(EventTypes.Amf.processApiLink, {
      url, mainFile, md5, packaging,
    });
    target.dispatchEvent(e);
    return e.detail.result;
  }

  /**
   * Parses API data to AMF model.
   * 
   * @param buffer Buffer created from API file.
   * @param opts Processing options
   * @returns Promise resolved to the AMF json-ld model
   */
  static async processBuffer(buffer: Buffer, opts?: AmfServiceProcessingOptions, target: EventTarget = window): Promise<ApiParseResult | undefined> {
    const e = new ContextEvent<{ buffer: Buffer, opts?: AmfServiceProcessingOptions }, ApiParseResult>(EventTypes.Amf.processBuffer, {
      buffer, opts,
    });
    target.dispatchEvent(e);
    return e.detail.result;
  }

  /**
   * Processes file data.
   * If the blob is a type of `application/zip` it processes the file as a
   * zip file. Otherwise it processes it as a file.
   *
   * @param file The file to process.
   * @returns Promise resolved to the AMF json-ld model
   */
  static async processApiFile(file: File | Blob, target: EventTarget = window): Promise<ApiParseResult | undefined> {
    const e = new ContextEvent<{ file: File | Blob }, ApiParseResult>(EventTypes.Amf.processApiFile, {
      file,
    });
    target.dispatchEvent(e);
    return e.detail.result;
  }

  static async selectApiMainFile(candidates: string[], target: EventTarget = window): Promise<string | undefined> {
    const e = new ContextEvent<{ candidates: string[] }, string>(EventTypes.Amf.selectApiMainFile, {
      candidates,
    });
    target.dispatchEvent(e);
    return e.detail.result;
  }
}
