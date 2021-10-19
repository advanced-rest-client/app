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
import { html, css } from 'lit-element';
import { ImportBaseTable } from './ImportBaseTable.js';
import '@api-components/http-method-label/http-method-label.js';
import '@advanced-rest-client/date-time/date-time.js';

/** @typedef {import('lit-element').CSSResult} CSSResult */
/** @typedef {import('lit-element').TemplateResult} TemplateResult */
/** @typedef {import('@advanced-rest-client/arc-types').DataExport.ExportArcHistoryRequest} ExportArcHistoryRequest */

/**
 * An element to display list of history objects to import.
 */
export class ImportHistoryTable extends ImportBaseTable {
  /**
   * @type {CSSResult[]}
   */
  static get styles() {
    return [
      /** @type CSSResult */ (ImportBaseTable.styles),
      css`.selected-counter {
        margin-left: 32px;
      }`
    ];
  }

  /**
   * @param {ExportArcHistoryRequest} item Request to render.
   * @return {TemplateResult} Template for the history request body.
   */
  itemBodyTemplate(item) {
    return html`
    <div class="no-wrap">${item.url}</div>
    <div data-secondary>
      <date-time
        .date="${item.updated}"
        day="numeric"
        month="numeric"
        year="numeric"
      ></date-time>
    </div>`;
  }

  /**
   * @param {ExportArcHistoryRequest} item Request to render.
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
