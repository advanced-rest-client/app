import { RestApiProcessFileEvent, Amf } from '@advanced-rest-client/events';
import { PlatformBindings } from './PlatformBindings.js';

/**
 * The base bindings for the API spec processing.
 */
export class ApiParserBindings extends PlatformBindings {
  initialize(): Promise<void>;
  processApiFileHandler(e: CustomEvent): void;
  processLegacyFileHandler(e: RestApiProcessFileEvent): void;
  processApiLinkHandler(e: CustomEvent): void;
  processBufferHandler(e: CustomEvent): void;
  /**
   * Downloads the file and processes it as a zipped API project.
   *
   * @param url API remote location.
   * @param mainFile API main file. If not set the program will try to find the best match.
   * @param md5 When set it will test data integrity with the MD5 hash
   * @param packaging Default to `zip`.
   * @returns Promise resolved to the AMF json-ld model.
   */
  processApiLink(url: string, mainFile?: string, md5?: string, packaging?: string): Promise<Amf.ApiParseResult>;
  /**
   * Parses API data to AMF model.
   * 
   * @param buffer Buffer created from API file.
   * @param opts Processing options
   * @returns Promise resolved to the AMF json-ld model
   */
  processBuffer(buffer: Buffer, opts?: Amf.AmfServiceProcessingOptions): Promise<Amf.ApiParseResult>;
  /**
   * Processes file data.
   * If the blob is a type of `application/zip` it processes the file as a
   * zip file. Otherwise it processes it as a file.
   *
   * @param file The file to process.
   * @returns Promise resolved to the AMF json-ld model
   */
  processApiFile(file: File|Blob): Promise<Amf.ApiParseResult>;
  /**
   * Handles the file change event and processes the file as an API.
   * This is a legacy flow as this should not trigger an arbitrary process that changes the state of the application
   * (like this one). This should have more intentional flow.
   *
   * @param file The file to process.
   */
  legacyProcessApiFile(file: File|Blob): Promise<any>;
  selectApiMainFile(candidates: string[]): Promise<string|undefined>;
  /**
   * Downloads an API project as zip and returns the ArrayBuffer
   *
   * @TODO: Handle authorization.
   *
   * @param url URL to RAML zip asset.
   */
  downloadApiProject(url: string): Promise<ArrayBuffer>;
}
