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

/** @typedef {import('lit-element').CSSResult} CSSResult */
/** @typedef {import('lit-element').TemplateResult} TemplateResult */
/** @typedef {import('@advanced-rest-client/arc-types').DataExport.ExportArcVariable} ExportArcVariable */

/**
 * An element to render list of variables to import.
 */
export class ImportVariablesTable extends ImportBaseTable {
  /**
   * @type {CSSResult[]}
   */
  static get styles() {
    return [
      /** @type CSSResult */ (ImportBaseTable.styles),
      css`
      .var-name {
        font-weight: 500;
      }

      .var-value {
        margin-left: 8px;
      }`
    ];
  }

  /**
   * @param {ExportArcVariable} item A variable to render.
   * @return {TemplateResult} Template for the variable body.
   */
  itemBodyTemplate(item) {
    return html`
    <div>
      <span class="var-name">${item.name}</span>:
      <span class="var-value">${item.value}</span>
    </div>
    <div data-secondary>
      Environment: ${item.environment}
    </div>`;
  }

  /**
   * @param {ExportArcVariable} item A variable to render.
   * @return {TemplateResult} Template for the variable list item.
   */
  itemBodyContentTemplate(item) {
    return html`
    <anypoint-item-body twoline>
      ${this.itemBodyTemplate(item)}
    </anypoint-item-body>`;
  }
}
