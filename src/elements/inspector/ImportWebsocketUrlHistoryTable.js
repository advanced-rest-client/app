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

/** @typedef {import('lit-element').TemplateResult} TemplateResult */
/** @typedef {import('@advanced-rest-client/arc-types').DataExport.ExportArcWebsocketUrl} ExportArcWebsocketUrl */

/**
 * An element to display list of URLs history to import.
 */
export class ImportWebsocketUrlHistoryTable extends ImportBaseTable {

  /**
   * @param {ExportArcWebsocketUrl} item Cookie to render.
   * @return {TemplateResult} Template for the cookie body.
   */
  itemBodyTemplate(item) {
    return html`<div class="no-wrap">${item.key}</div>`;
  }
}
