/* eslint-disable class-methods-use-this */
 
/**
@license
Copyright 2020 The Advanced REST client authors <arc@mulesoft.com>
Licensed under the Apache License, Version 2.0 (the "License"); you may not
use this file except in compliance with the License. You may obtain a copy of
the License at
http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
License for the specific language governing permissions and limitations under
the License.
*/
import { TemplateResult, CSSResult } from 'lit-element';
import { AnypointDialogElement } from '@anypoint-web-components/awc';

export declare const inputHandler: unique symbol;

export class AuthDialogElement extends AnypointDialogElement {
  static get styles(): CSSResult[];

  /** 
   * Enables MD outlined theme
   * @attribute
   */
  outlined: boolean;

  constructor();

  /**
   * Handler for value change of an input.
   */
  [inputHandler](e: CustomEvent): void;

  /**
   * To be overridden by the child classes to create a single configuration object for the current method. 
   */
  serialize(): any;

  render(): TemplateResult;

  /**
   * To be overridden by the child classes to provide authorization method specific form.
   */
  authFormTemplate(): TemplateResult;
}
