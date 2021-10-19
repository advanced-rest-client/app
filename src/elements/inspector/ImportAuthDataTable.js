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
/** @typedef {import('@advanced-rest-client/arc-types').DataExport.ExportArcAuthData} ExportArcAuthData */

const styles = css`.no-data {
  margin-left: 16px;
  color: var(--import-table-auth-no-info-color, rgba(0, 0, 0, 0.54));
  font-size: 16px;
}`;

/**
 * An element to display list of authorization data to import.
 */
export class ImportAuthDataTable extends ImportBaseTable {
  /**
   * @type {CSSResult[]}
   */
  static get styles() {
    return [
      /** @type CSSResult */ (ImportBaseTable.styles),
      styles,
    ];
  }

  /**
   * @param {ExportArcAuthData[]} data The data to render.
   * @returns {TemplateResult|string} A template for the list items
   */
  repeaterTemplate(data) {
    if (!data || !data.length) {
      return '';
    }
    return html`
    <p class="no-data">
      ${data.length} items are intentionally hidden.
    </p>`;
  }

  /**
   * @returns {string} This template has no value.
   */
  itemBodyTemplate() {
    return '';
  }
}
