import { BearerAuthorization } from '@advanced-rest-client/events/src/authorization/Authorization';
import { TemplateResult } from 'lit-html';
import { AuthUiInit } from '../types';
import AuthUiBase from './AuthUiBase';

export default class HttpBearer extends AuthUiBase {
  /** 
   * The token to use with the authorization process.
   */
  token: string;
  constructor(init: AuthUiInit);

  /**
   * Restores previously serialized Basic authentication values.
   * @param {} state Previously serialized values
   */
  restore(state: BearerAuthorization): void;

  /**
   * Serialized input values
   * @return An object with user input
   */
  serialize(): BearerAuthorization;

  reset(): void;

  render(): TemplateResult;
}
