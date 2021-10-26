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
import { LitElement, TemplateResult } from 'lit-element';
import { ClientCertificate } from '@advanced-rest-client/events';

export declare const startScreenTemplate: unique symbol;
export declare const headerTemplate: unique symbol;
export declare const certTypeButton: unique symbol;
export declare const importTypeHandler: unique symbol;
export declare const importTypeClickHandler: unique symbol;
export declare const filesFormTemplate: unique symbol;
export declare const inputHandler: unique symbol;
export declare const passwordFiledTemplate: unique symbol;
export declare const certificateInput: unique symbol;
export declare const selectCertFileHandler: unique symbol;
export declare const selectKeyFileHandler: unique symbol;
export declare const keyInputTemplate: unique symbol;
export declare const certFileHandler: unique symbol;
export declare const keyFileHandler: unique symbol;
export declare const clearCertHandler: unique symbol;
export declare const clearKeyHandler: unique symbol;
export declare const certPasswordTemplate: unique symbol;
export declare const keyInfoTemplate: unique symbol;
export declare const certificateInfoTemplate: unique symbol;
export declare const importHandler: unique symbol;
export declare const keyPassChangeHandler: unique symbol;
export declare const certPassChangeHandler: unique symbol;
export declare const keyTemplate: unique symbol;
export declare const errorTemplate: unique symbol;

/**
 * A view to import a client certificate into the application.
 * 
 * @fires close When the parent should close the import dialog.
 */
export default class CertificateImportElement extends LitElement {

  /**
   * Enables outlined theme.
   * @attribute
   */
  outlined: boolean;
  /**
   * Enables Anypoint theme.
   * @attribute
   */
  anypoint: boolean;
  /**
   * Either `pem` or `p12`.
   * @attribute
   */
  importType: string;
  /**
   * Import name
   * @attribute
   */
  name: string;
  /**
   * True when the user clicked on the import button
   * @attribute
   */
  loading: boolean;

  /**
   * @attribute
   */
  page: number;

  certificateFile: File;

  keyFile: File;

  /** 
   * The password for the certificate to use.
   * @attribute
   */
  certificatePassword: string;

  /** 
   * The password for the key certificate to use.
   * @attribute
   */
  keyPassword: string;

  /** 
   * Whether the certificate file is password protected,
   * @attribute
   */
  certificateHasPassword: boolean;

  /** 
   * Whether the key file is password protected,
   * @attribute
   */
  keyHasPassword: boolean;

  /** 
   * The error message to render, if any.
   * @attribute
   */
  errorMessage: string;

  get hasKeyImport(): boolean;

  get hasKeyPasswordInput(): boolean;

  get acceptDisabled(): boolean;

  get importInvalid(): boolean;

  constructor();

  [importTypeHandler](e: TransitionEvent): void;

  [importTypeClickHandler](e: Event): void;

  /**
   * Dispatches `close` custom event (non-bubbling) to
   * inform that the parent component should hide the UI.
   */
  cancel(): void;

  /**
   * Accepts current user input and imports a certificate if form is valid.
   * When ready it dispatches `close` event.
   * When error occurs it dispatches `error` event with Error object on the detail.
   */
  accept(): Promise<void>

  [selectCertFileHandler](): void;
  [selectKeyFileHandler](): void;

  [certFileHandler](e: Event): void;

  [keyFileHandler](e: Event): void;

  [clearCertHandler](): void;

  [clearKeyHandler](): void;

  [certPassChangeHandler](e: Event): void;

  [keyPassChangeHandler](e: Event): void;

  /**
   * Handler for the input field change event.
   */
  [inputHandler](e: Event): void;

  [importHandler](): void;

  getConfig(): Promise<ClientCertificate.ClientCertificate>;

  /**
   * Reads file as ArrayBuffer
   */
  fileToBuffer(blob: Blob): Promise<Uint8Array>;

  /**
   * Reads file as string
   */
  fileToString(blob: Blob): Promise<string>;

  render(): TemplateResult;

  /**
   * @returns The template for the import header
   */
  [headerTemplate](): TemplateResult;

  /**
   * @param type The import type
   * @param ico The icon name
   * @param label The label to render
   * @param desc The description of the button action
   * @returns A template for the type selector button.
   */
  [certTypeButton](type: string, ico: string, label: string, desc: string): TemplateResult;

  /**
   * @returns  The template for import type selector.
   */
  [startScreenTemplate](): TemplateResult;

  /**
   * @returns The template for the certificate input trigger,
   */
  [certificateInput](): TemplateResult;

  /**
   * @param file Selected certificate file
   * @returns The template for the certificate file information
   */
  [certificateInfoTemplate](file: File): TemplateResult;

  /**
   * @param name The input name
   * @param label The label for the input
   * @returns A template for an input that has a masked value.
   */
  [passwordFiledTemplate](name: string, label: string): TemplateResult;

  /**
   * @param file Selected key file
   * @returns The template for the key file information
   */
  [keyInfoTemplate](file: File): TemplateResult;

  /**
   * @returns The template for the key input field.
   */
  [keyInputTemplate](): TemplateResult;

  /**
   * @returns The template for the certificate password filed 
   */
  [certPasswordTemplate](): TemplateResult|string;

  /**
   * @returns  The template for the key inputs
   */
  [keyTemplate](): TemplateResult|string;

  /**
   * @returns The template for the inputs form.
   */
  [filesFormTemplate](): TemplateResult;

  /**
   * @returns The template for the error message, when set.
   */
  [errorTemplate](): TemplateResult|string;
}
