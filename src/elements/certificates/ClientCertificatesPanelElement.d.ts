/**
@license
Copyright 2018 The Advanced REST client authors <arc@mulesoft.com>
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
import { ClientCertificatesConsumerMixin, handleException } from './ClientCertificatesConsumerMixin.js';
import { ARCCertificateIndex } from '@advanced-rest-client/events/src/models/ClientCertificate';
import { ExportOptions, ProviderOptions } from '@advanced-rest-client/events/src/dataexport/DataExport';

export declare const renderPage: unique symbol;
export declare const headerTemplate: unique symbol;
export declare const busyTemplate: unique symbol;
export declare const unavailableTemplate: unique symbol;
export declare const listTemplate: unique symbol;
export declare const listItemTemplate: unique symbol;
export declare const exportTemplate: unique symbol;
export declare const certDetailsTemplate: unique symbol;
export declare const clearDialogTemplate: unique symbol;
export declare const renderList: unique symbol;
export declare const renderAddCert: unique symbol;
export declare const cancelImport: unique symbol;
export declare const sheetClosedHandler: unique symbol;
export declare const certDetailsHandler: unique symbol;
export declare const clearDialogResultHandler: unique symbol;
export declare const cancelExportOptions: unique symbol;
export declare const acceptExportOptions: unique symbol;
export declare const doExportItems: unique symbol;
export declare const exportAllFile: unique symbol;
export declare const deleteAllClickHandler: unique symbol;
export declare const errorTemplate: unique symbol;

/**
 * A view that renders list of client certificates installed in the application.
 *
 * It allows to preview certificate details, add new certificate, and
 * to remove certificate from the store.
 *
 * The element uses web events to communicate with the data store. Your application
 * can have own implementation but we suggest using `@advanced-rest-client/arc-models`
 * with `client-certificate-model` to store certificates in browser's internal
 * data store.
 * Consider this when 3rd party scripts runs on your page.
 */
export default class ClientCertificatesPanelElement extends ClientCertificatesConsumerMixin(LitElement) {

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
   * When set a certificate details dialog is opened.
   * @attribute
   */
  certDetailsOpened: boolean;
  /**
   * An ID of the certificate to be passed on the details view element.
   * @attribute
   */
  openedDetailsId: string;
  /**
   * @attribute
   */
  page: number;
  /**
   * Indicates that the export options panel is currently rendered.
   * @attribute
   */
  exportOptionsOpened: boolean;
  /** 
   * The last error message
   * @attribute
   */
  errorMessage: string;

  constructor();

  /**
   * Handles an exception by sending exception details to GA.
   * @param message A message to send.
   */
  [handleException](message: string): void;

  /**
   * Handler for `accept` event dispatched by export options element.
   */
  [acceptExportOptions](e: CustomEvent): Promise<void>;

  [cancelExportOptions](): void;

  /**
   * Calls `_dispatchExportData()` from requests lists mixin with
   * prepared arguments
   *
   * @param options Export configuration
   * @param provider Export provider configuration
   */
  [doExportItems](options: ExportOptions, provider: ProviderOptions): Promise<void>;

  /**
   * Menu item handler to export all data to file
   * @return Result of calling `[doExportItems]()`
   */
  [exportAllFile](): Promise<void>;

  /**
   * Menu item handler to export all data to file
   */
  openExportAll(): void;

  // Handler for delete all menu option click
  [deleteAllClickHandler](): void;

  // Called when delete datastore dialog is closed.
  [clearDialogResultHandler](e): void;

  /**
   * Initializes the cert adding flow
   */
  addCertificate(): void;

  [cancelImport](): void;

  [sheetClosedHandler](e: Event): void;

  [certDetailsHandler](e: Event): void;

  render(): TemplateResult;

  [headerTemplate](): TemplateResult|string;

  [busyTemplate](): TemplateResult|string;

  [unavailableTemplate](): TemplateResult|string;

  [listTemplate](): TemplateResult|string;

  /**
   * @returns The template for a list item.
   */
  [listItemTemplate](item: ARCCertificateIndex, index: number, anypoint: boolean): TemplateResult;

  [exportTemplate](): TemplateResult;

  /**
   * @returns The template for a certificate details dialog
   */
  [certDetailsTemplate](): TemplateResult;

  /**
   * @returns The template for the confirm delete all dialog
   */
  [clearDialogTemplate](): TemplateResult;

  /**
   * @returns The template for the certificates list
   */
  [renderList](): TemplateResult;

  /**
   * @returns The template for the certificate import element
   */
  [renderAddCert](): TemplateResult;

  /**
   * @returns The template for the current page
   */
  [renderPage](): TemplateResult;


  /**
   * @returns {TemplateResult|string} The template for the error message, when set.
   */
  [errorTemplate](): TemplateResult|string;
}
