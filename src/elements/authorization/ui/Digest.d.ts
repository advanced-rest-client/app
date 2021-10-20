import { DigestAuthorization } from "@advanced-rest-client/events/src/authorization/Authorization";
import { TemplateResult } from "lit-html";
import { AuthUiInit } from "../types";
import AuthUiBase from "./AuthUiBase";

export default class Digest extends AuthUiBase {
  /** 
   * The value of the username filed.
   */
  password: string;
  /** 
  * The value of the password filed.
  */
  username: string;
  /**
  * Server issued realm for Digest authorization.
  */
  realm: string;
  /**
  * Server issued nonce for Digest authorization.
  */
  nonce: string;
  /**
  * The algorithm used to hash the response for Digest authorization.
  *
  * It can be either `MD5` or `MD5-sess`.
  */
  algorithm: string;
  /**
  * The quality of protection value for the digest response.
  * Either '', 'auth' or 'auth-int'
  */
  qop: string;
  /**
  * Nonce count - increments with each request used with the same nonce
  */
  nc: number;
  /**
  * Client nonce
  */
  cnonce: string;
  /**
  * A string of data specified by the server
  */
  opaque: string;
  /**
  * Hashed response to server challenge
  */
  response: string;
  /**
  * Request HTTP method
  */
  httpMethod: string;
  /**
  * Current request URL.
  */
  requestUrl: string;
  _requestUri: string;
  /**
  * Current request body.
  */
  requestBody: string;
  
  constructor(init: AuthUiInit);

  _processRequestUrl(value: string): void;

  /**
   * Restores previously serialized values.
   * @param state Previously serialized values
   */
  restore(stat: DigestAuthorization): void;

  /**
   * Serialized input values
   * @returns An object with user input
   */
  serialize(): DigestAuthorization;

  /**
   * Generates the response header based on the parameters provided in the
   * form.
   *
   * See https://en.wikipedia.org/wiki/Digest_access_authentication#Overview
   *
   * @return A response part of the authenticated digest request.
   */
  _generateDigestResponse(): string;

  // Generates HA1 as defined in Digest spec.
  _getHA1(): string;

  // Generates HA2 as defined in Digest spec.
  _getHA2(): string;

  reset(): void;

  defaults(): void;

  render(): TemplateResult;

  _qopTemplate(): TemplateResult;

  _hashAlgorithmTemplate(): TemplateResult;
}
