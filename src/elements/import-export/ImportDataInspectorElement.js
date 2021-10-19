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
import { LitElement, html } from 'lit-element';
import '@advanced-rest-client/date-time/date-time.js';
import '@anypoint-web-components/awc/anypoint-button.js';
import '../../../define/import-projects-table.js';
import '../../../define/import-requests-table.js';
import '../../../define/import-history-table.js';
import '../../../define/import-variables-table.js';
import '../../../define/import-cookies-table.js';
import '../../../define/import-auth-data-table.js';
import '../../../define/import-url-history-table.js';
import '../../../define/import-websocket-url-history-table.js';
import '../../../define/import-cc-table.js';
import styles from '../inspector/InspectorStyles.js';

/** @typedef {import('lit-element').TemplateResult} TemplateResult */
/** @typedef {import('@advanced-rest-client/arc-types').DataExport.ArcExportObject} ArcExportObject */
/** @typedef {import('@advanced-rest-client/arc-types').DataExport.ExportArcSavedRequest} ExportArcSavedRequest */
/** @typedef {import('../inspector/ImportBaseTable').ImportBaseTable} ImportBaseTable */

export const importHandler = Symbol('importHandler');
export const cancelHandler = Symbol('cancelHandler');
export const getTableData = Symbol('getTableData');
export const metaTemplate = Symbol('metaTemplate');
export const createdTemplate = Symbol('createdTemplate');
export const versionTemplate = Symbol('versionTemplate');
export const projectsTemplate = Symbol('projectsTemplate');
export const readNonProjectsData = Symbol('readNonProjectsData');
export const requestsTableTemplate = Symbol('requestsTableTemplate');
export const historyTableTemplate = Symbol('historyTableTemplate');
export const variablesTableTemplate = Symbol('variablesTableTemplate');
export const cookiesTableTemplate = Symbol('cookiesTableTemplate');
export const authDataTableTemplate = Symbol('authDataTableTemplate');
export const urlsTableTemplate = Symbol('urlsTableTemplate');
export const socketUrlsTableTemplate = Symbol('socketUrlsTableTemplate');
export const ccTableTemplate = Symbol('ccTableTemplate');
export const actionsTemplate = Symbol('actionsTemplate');

/**
 * An element to display tables of import data.
 */
export class ImportDataInspectorElement extends LitElement {
  static get styles() {
    return styles;
  }

  static get properties() {
    return {
      // Imported data.
      data: { type: Object },
      /**
       * Enables compatibility with Anypoint platform
       */
      compatibility: { type: Boolean },
    };
  }

  constructor() {
    super();
    /**
     * @type {ArcExportObject}
     */    
    this.data = undefined;
    /**
     * @type {boolean}
     */
    this.compatibility = false;
  }

  /**
   * Dispatches the `cancel` event
   */
  [cancelHandler]() {
    this.dispatchEvent(new CustomEvent('cancel', {
      composed: true
    }));
  }

  /**
   * Dispatches the `import` event
   */
  [importHandler]() {
    const data = this.collectData();
    this.dispatchEvent(new CustomEvent('import', {
      composed: true,
      detail: data
    }));
  }

  /**
   * Collects information about selected data in the data table.
   *
   * @param {string} name Data table element name to check data for.
   * @return {any[]|undefined} List of items or undefined if the table is
   * not in the DOM, the table is hidden or selection is empty.
   */
  [getTableData](name) {
    const table = /** @type ImportBaseTable */ (this.shadowRoot.querySelector(name));
    if (!table) {
      return undefined;
    }
    const selected = table.selectedItems;
    if (!selected || !selected.length) {
      return undefined;
    }
    return selected;
  }

  /**
   * Collects import data from the tables.
   * Only selected items are in the final object.
   *
   * @return {ArcExportObject} ARC import object with updated arrays.
   * Note, the object is a shallow copy of the original data object.
   */
  collectData() {
    const result = { ...this.data };
    let projects;
    let requests = [];
    const table = (this.shadowRoot.querySelector('import-projects-table'));
    if (table) {
      const pItems = table.selectedItems;
      if (pItems) {
        projects = pItems;
        requests = requests.concat(table.selectedRequests);
      }
    }
    const otherRequests = this[getTableData]('import-requests-table');
    if (otherRequests) {
      requests = requests.concat(otherRequests);
    }
    result.projects = projects;
    result.requests = requests;
    result.history = this[getTableData]('import-history-table');
    result.variables = this[getTableData]('import-variables-table');
    result.cookies = this[getTableData]('import-cookies-table');
    result.authdata = this[getTableData]('import-auth-data-table');
    result.urlhistory = this[getTableData]('import-url-history-table');
    result.websocketurlhistory = this[getTableData]('import-websocket-url-history-table');
    result.clientcertificates = this[getTableData]('import-cc-table');
    return result;
  }

  /**
   * @param {ArcExportObject} data
   * @returns {ExportArcSavedRequest[]|null}
   */
  [readNonProjectsData](data) {
    const items = data.requests;
    if (!Array.isArray(items) || !items.length) {
      return null;
    }
    const result = [];
    items.forEach((item) => {
      if (!Array.isArray(item.projects) || !item.projects.length) {
        result.push(item);
      }
    });
    return result;
  }

  render() {
    const { compatibility, data={} } = this;
    if (!data) {
      return '';
    }
    const typedData = /** @type ArcExportObject */ (data);
    return html`
    ${this[metaTemplate](typedData)}
    ${this[projectsTemplate](typedData, compatibility)}
    ${this[requestsTableTemplate](typedData, compatibility)}
    ${this[historyTableTemplate](typedData, compatibility)}
    ${this[variablesTableTemplate](typedData, compatibility)}
    ${this[cookiesTableTemplate](typedData, compatibility)}
    ${this[authDataTableTemplate](typedData, compatibility)}
    ${this[urlsTableTemplate](typedData, compatibility)}
    ${this[socketUrlsTableTemplate](typedData, compatibility)}
    ${this[ccTableTemplate](typedData, compatibility)}
    ${this[actionsTemplate]()}
    `;
  }

  /**
   * @returns {TemplateResult} A template for the table actions.
   */
  [actionsTemplate]() {
    const { compatibility } = this;
    return html`
    <section class="form-actions">
      <anypoint-button
        @click="${this[cancelHandler]}"
        data-action="cancel-import"
        ?compatibility="${compatibility}"
      >Cancel</anypoint-button>
      <anypoint-button
        class="primary-action"
        @click="${this[importHandler]}"
        data-action="import-data"
        emphasis="high"
      >Import data</anypoint-button>
    </section>
    `;
  }

  /**
   * @param {ArcExportObject} data
   * @returns {TemplateResult|string} A template for the import meta data
   */
  [metaTemplate](data) {
    const created = this[createdTemplate](data);
    const version = this[versionTemplate](data);
    if (!created && !version) {
      return '';
    }
    return html`
    <div class="import-meta">
      ${version}
      ${created}
    </div>
    `;
  }

  /**
   * @param {ArcExportObject} data
   * @returns {TemplateResult|string} A template for the import meta data
   */
  [versionTemplate](data) {
    if (!data.version) {
      return '';
    }
    return html`
    <p class="meta">Exported from ARC version ${data.version}</p>
    `
  }

  /**
   * @param {ArcExportObject} data
   * @returns {string|TemplateResult}
   */
  [createdTemplate](data) {
    const t = new Date(data.createdAt);
    const time = t.getTime();
    if (Number.isNaN(time)) {
      return '';
    }
    return html`
    <p class="meta">
      Created at:
      <date-time
        year="numeric"
        month="long"
        day="numeric"
        hour="2-digit"
        minute="2-digit"
        second="2-digit"
        .date="${data.createdAt}"
      ></date-time>
    </p>`;
  }

  /**
   * @param {ArcExportObject} data
   * @param {boolean} compatibility
   * @returns {string|TemplateResult}
   */
  [projectsTemplate](data, compatibility) {
    if (!data.projects) {
      return '';
    }
    return html`
      <import-projects-table
        tableTitle="Projects"
        .data="${data.projects}"
        .requests="${data.requests}"
        ?compatibility="${compatibility}"
      ></import-projects-table>
    `;
  }

  /**
   * @param {ArcExportObject} data
   * @param {boolean} compatibility
   * @returns {string|TemplateResult}
   */
  [requestsTableTemplate](data, compatibility) {
    const items = this[readNonProjectsData](data);
    if (!items) {
      return '';
    }
    return html`
    <import-requests-table
      tableTitle="Other requests"
      .data="${items}"
      ?compatibility="${compatibility}"
    ></import-requests-table>`;
  }

  /**
   * @param {ArcExportObject} data
   * @param {boolean} compatibility
   * @returns {string|TemplateResult}
   */
  [historyTableTemplate](data, compatibility) {
    if (!data.history || !data.history.length) {
      return '';
    }
    return html`
    <import-history-table
      tableTitle="History"
      .data="${data.history}"
      ?compatibility="${compatibility}"
    ></import-history-table>`;
  }

  /**
   * @param {ArcExportObject} data
   * @param {boolean} compatibility
   * @returns {string|TemplateResult}
   */
  [variablesTableTemplate](data, compatibility) {
    if (!data.variables || !data.variables.length) {
      return '';
    }
    return html`
    <import-variables-table
      tableTitle="Variables"
      .data="${data.variables}"
      ?compatibility="${compatibility}"
    ></import-variables-table>`;
  }


  /**
   * @param {ArcExportObject} data
   * @param {boolean} compatibility
   * @returns {string|TemplateResult}
   */
  [cookiesTableTemplate](data, compatibility) {
    if (!data.cookies || !data.cookies.length) {
      return '';
    }
    return html`
    <import-cookies-table
      tableTitle="Cookies"
      .data="${data.cookies}"
      ?compatibility="${compatibility}"
    ></import-cookies-table>`;
  }

  /**
   * @param {ArcExportObject} data
   * @param {boolean} compatibility
   * @returns {string|TemplateResult}
   */
  [authDataTableTemplate](data, compatibility) {
    const items = data.authdata;
    if (!items || !items.length) {
      return '';
    }
    return html`
    <import-auth-data-table
      tabletitle="Auth data"
      .data="${items}"
      ?compatibility="${compatibility}"
    ></import-auth-data-table>`;
  }

  /**
   * @param {ArcExportObject} data
   * @param {boolean} compatibility
   * @returns {string|TemplateResult}
   */
  [urlsTableTemplate](data, compatibility) {
    const items = data.urlhistory;
    if (!items || !items.length) {
      return '';
    }
    return html`
    <import-url-history-table
      tabletitle="URL history for autocomplete"
      .data="${items}"
      ?compatibility="${compatibility}"
    ></import-url-history-table>`;
  }

  /**
   * @param {ArcExportObject} data
   * @param {boolean} compatibility
   * @returns {string|TemplateResult}
   */
  [socketUrlsTableTemplate](data, compatibility) {
    const items = data.websocketurlhistory;
    if (!items || !items.length) {
      return '';
    }
    return html`
    <import-websocket-url-history-table
      tabletitle="Web socket URL history for autocomplete"
      .data="${items}"
      ?compatibility="${compatibility}"
    ></import-websocket-url-history-table>`;
  }

  /**
   * @param {ArcExportObject} data
   * @param {boolean} compatibility
   * @returns {string|TemplateResult}
   */
  [ccTableTemplate](data, compatibility) {
    const items = data.clientcertificates;
    if (!items || !items.length) {
      return '';
    }
    return html`
    <import-cc-table
      tabletitle="Client certificates"
      .data="${items}"
      ?compatibility="${compatibility}"
    ></import-cc-table>`;
  }
}
