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
import { ImportBaseTable } from './ImportBaseTable.js';

/** @typedef {import('lit-element').CSSResult} CSSResult */
/** @typedef {import('lit-element').TemplateResult} TemplateResult */
/** @typedef {import('@advanced-rest-client/arc-types').DataExport.ExportArcClientCertificateData} ExportArcClientCertificateData */

/**
 * An element to render list of authorization data to import.
 */
export class ImportCcTable extends ImportBaseTable {
  /**
   * @param {ExportArcClientCertificateData[]} data Certificates data to render.
   * @return {TemplateResult[]|string}
   */
  repeaterTemplate(data) {
    if (!data || !data.length) {
      return '';
    }
    const { selectedIndexes } = this;
    return data.map((item, index) => this._outerTemplate(item, index, selectedIndexes));
  }

  /**
   * @param {ExportArcClientCertificateData} item The certificate item to render
   * @param {number} index
   * @param {string[]} selectedIndexes
   * @returns {TemplateResult}
   */
  _outerTemplate(item, index, selectedIndexes) {
    return html`
    <anypoint-icon-item data-index="${index}" data-key="${item.key}">
      <anypoint-checkbox
        data-index="${index}"
        .checked="${selectedIndexes.indexOf(item.key) !== -1}"
        slot="item-icon"
        aria-label="Toggle selection"
        tabindex="-1"
      ></anypoint-checkbox>
      ${this.itemBodyContentTemplate(item)}
    </anypoint-icon-item>`;
  }

  /**
   * @param {ExportArcClientCertificateData} item The certificate to render.
   * @return {TemplateResult}
   */
  itemBodyContentTemplate(item) {
    return html`
    <anypoint-item-body twoline>
      <span class="name-label">${item.name}</span>
      <span class="type-label">Type: ${item.type}</span>
    </anypoint-item-body>`;
  }

  itemBodyTemplate() {
    return '';
  }
}
