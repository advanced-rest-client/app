import { BasicAuthorization } from '@advanced-rest-client/events/src/authorization/Authorization';
import { TemplateResult } from 'lit-html';
import { AuthUiInit } from '../types';
import AuthUiBase from './AuthUiBase';

export default class HttpBasic extends AuthUiBase {
  /** 
   * The value of the username filed.
   */
  password: string;
  /** 
  * The value of the password filed.
  */
  username: string;
  
  constructor(init: AuthUiInit);

  /**
   * Restores previously serialized values.
   * @param state Previously serialized values
   */
  restore(state: BasicAuthorization): void;

  /**
   * Serialized input values
   * @return An object with user input
   */
  serialize(): BasicAuthorization;

  reset(): void;

  render(): TemplateResult;
}
