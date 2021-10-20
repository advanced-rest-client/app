import { ArcRequest, ArcResponse } from '@advanced-rest-client/events';
import { Content, Cookie, Creator, Entry, Har, Header, Log, PostData, QueryString, Cache, Response } from 'har-format';

export declare const createLog: unique symbol;
export declare const createCreator: unique symbol;
export declare const createEntry: unique symbol;
export declare const createCache: unique symbol;
export declare const createRequest: unique symbol;
export declare const createResponse: unique symbol;
export declare const createResponseContent: unique symbol;
export declare const createHeaders: unique symbol;
export declare const createPostData: unique symbol;
export declare const readBodyString: unique symbol;
export declare const readQueryString: unique symbol;
export declare const readRequestCookies: unique symbol;
export declare const readResponseCookies: unique symbol;

/**
 * A class that transforms ARC request objects into a HAR format.
 */
export declare class HarTransformer {
  name: string;
  version: string;
  /**
   * @param version The application version name.
   * @param name The name of the "creator" field.
   */
  constructor(version?: string, name?: string);

  /**
   * Transforms the request objects to a log.
   */
  transform(requests: ArcRequest.ArcBaseRequest[]): Promise<Har>;

  [createLog](): Log;

  [createCreator](): Creator;

  createEntries(requests: ArcRequest.ArcBaseRequest[]): Promise<Entry[]>;

  createEntry(request: ArcRequest.ArcBaseRequest): Promise<Entry|Entry[]|null>;

  [createEntry](request: ArcRequest.ArcBaseRequest, transportRequest: ArcRequest.TransportRequest, response: ArcResponse.Response): Promise<Entry>;

  createRedirectEntries(request: ArcRequest.ArcBaseRequest, response: ArcResponse.Response): Promise<Entry[]>;

  [createCache](): Cache;

  [createRequest](request: ArcRequest.ArcBaseRequest): Promise<Request>;

  /**
   * @param response The response data
   * @param redirectURL Optional redirect URL for the redirected request.
   */
  [createResponse](response: ArcResponse.HTTPResponse, redirectURL?: string): Promise<Response>;

  [createHeaders](headers: string): Header[];

  [createPostData](payload: string | File | Blob | Buffer | ArrayBuffer | FormData, headers: string): Promise<PostData>;

  /**
   * @param body The body 
   * @param charset The optional charset to use with the text decoder.
   */
  [readBodyString](body: string|Buffer|ArrayBuffer, charset?: string): string;

  [createResponseContent](payload: string | Buffer | ArrayBuffer, headers: string): Promise<Content>;

  [readQueryString](url: string): QueryString[];

  /**
   * Produces a list of cookies for the request.
   * @param headers Request headers
   */
  [readRequestCookies](headers: string): Cookie[];
  /**
   * Produces a list of cookies for the response.
   * @param headers Response headers
   */
  [readResponseCookies](headers: string): Cookie[];
}
