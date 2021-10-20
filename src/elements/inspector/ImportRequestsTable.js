/* eslint-disable class-methods-use-this */
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
import { html } from 'lit-element';
import '@anypoint-web-components/awc/anypoint-collapse.js';
import '@anypoint-web-components/awc/anypoint-icon-button.js'
import { ImportBaseTable } from './ImportBaseTable.js';
import '../../../define/http-method-label.js';

/** @typedef {import('lit-element').TemplateResult} TemplateResult */
/** @typedef {import('@advanced-rest-client/events').DataExport.ExportArcSavedRequest} ExportArcSavedRequest */

/**
 * An element to display list of request objects to import.
 */
export class ImportRequestsTable extends ImportBaseTable {
  /**
   * @param {ExportArcSavedRequest} item The request to render.
   * @return {TemplateResult} A template for a request
   */
  itemBodyTemplate(item) {
    return html`
    <div class="no-wrap">${item.name}</div>
    <div data-secondary class="no-wrap">${item.url}</div>
    `;
  }

  /**
   * @param {ExportArcSavedRequest} item Request to render.
   * @return {TemplateResult} Template for the history request body.
   */
  itemBodyContentTemplate(item) {
    return html`
    <span class="method-label">
      <http-method-label method="${item.method}"></http-method-label>
    </span>
    <anypoint-item-body twoline>
      ${this.itemBodyTemplate(item)}
    </anypoint-item-body>`;
  }
}
