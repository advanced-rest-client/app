import { NtlmAuthorization } from '@advanced-rest-client/events/src/authorization/Authorization';
import { TemplateResult } from 'lit-html';
import { AuthUiInit } from '../types';
import AuthUiBase from './AuthUiBase';

export default class Ntlm extends AuthUiBase {
  /** 
   * The value of the username filed.
   */
  password: string;
  /** 
   * The value of the password filed.
   */
  username: string;
  /** 
   * The NT domain.
   */
  domain: string;
  constructor(init: AuthUiInit);

  /**
   * Restores previously serialized Basic authentication values.
   * @param state Previously serialized values
   */
  restore(state: NtlmAuthorization): void;

  /**
   * Serialized input values
   * @return An object with user input
   */
  serialize(): NtlmAuthorization;

  reset(): void;

  render(): TemplateResult;
}
