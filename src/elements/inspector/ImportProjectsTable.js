/* eslint-disable lit-a11y/click-events-have-key-events */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-plusplus */
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

import { html, css } from 'lit-element';
import { classMap } from 'lit-html/directives/class-map.js';
import { keyboardArrowDown } from '@advanced-rest-client/arc-icons/ArcIcons.js';
import { ImportBaseTable, dataChanged } from './ImportBaseTable.js';

/** @typedef {import('lit-element').CSSResult} CSSResult */
/** @typedef {import('lit-element').TemplateResult} TemplateResult */
/** @typedef {import('@advanced-rest-client/arc-types').DataExport.ExportArcProjects} ExportArcProjects */
/** @typedef {import('@advanced-rest-client/arc-types').DataExport.ExportArcSavedRequest} ExportArcSavedRequest */
/** @typedef {import('./ImportProjectsTable').RenderItem} RenderItem */

export const requestsValue = Symbol('requestsValue');
export const renderValue = Symbol('renderValue');
export const selectedProjectsValue = Symbol('selectedProjectsValue');
export const selectedRequestsValue = Symbol('selectedRequestsValue');
export const openedProjectsValue = Symbol('openedProjectsValue');
export const toggleProjectHandler = Symbol('toggleProjectHandler');
export const requestToggleHandler = Symbol('requestToggleHandler');
export const projectToggleSelectionHandler = Symbol('projectToggleSelectionHandler');

const styles = css`
.project-label {
  margin: 4px 12px;
  display: flex;
  align-items: center;
}

.project-name {
  display: block;
  flex: 1;
  font-size: 1.1rem;
  cursor: pointer;
}

.requests-list {
  margin: 4px 12px;
}
`;

/**
 * An element to render list of projects to import.
 */
export class ImportProjectsTable extends ImportBaseTable {
  /**
   * @type {CSSResult[]}
   */
  static get styles() {
    return [
      /** @type CSSResult */ (ImportBaseTable.styles),
      styles,
    ];
  }

  static get properties() {
    return {
      /**
       * List of projects
       */
      requests: { type: Array },
    };
  }

  /**
   * @returns {ExportArcSavedRequest[]|undefined} The list of requests that have a project
   */
  get requests() {
    return this[requestsValue];
  }

  /**
   * @param {ExportArcSavedRequest[]} value The list of requests that have a project
   */
  set requests(value) {
    const old = this[requestsValue];
    if (old === value) {
      return;
    }
    this[requestsValue] = value;
    this[dataChanged](this.data);
  }

  /**
   * @returns {ExportArcSavedRequest[]} A list of all requests selected in the projects
   * Note, this alters the list of projects in a request when a request belongs to more than a single project
   * and the project is not selected for import. 
   */
  get selectedRequests() {
    const result = /** @type ExportArcSavedRequest[] */ ([]);
    const { requests=[] } = this;
    const selectedProjects = /** @type string[] */ (this.selectedIndexes || []);
    const allSelectedRequests = this[selectedRequestsValue];
    const inserted = {};
    selectedProjects.forEach((projectId) => {
      const projectRequests = /** @type string[] */ (allSelectedRequests[projectId] || []);
      projectRequests.forEach((requestId) => {
        if (requestId in inserted) {
          // request may be added to more than one project
          return;
        }
        inserted[requestId] = true;
        const item = requests.find((r) => r.key === requestId);
        if (item) {
          result.push(item);
        }
      });
    });
    // clear up projects array on each request
    return result.map((item) => {
      const projects = Array.from(item.projects);
      for (let i = projects.length - 1; i >= 0; i--) {
        const pid = projects[i];
        if (!selectedProjects.includes(pid)) {
          const index = selectedProjects.indexOf(pid);
          projects.splice(index, 1);
        }
      }
      const cp = { ...item };
      cp.projects = projects;
      return cp;
    });
  }

  constructor() {
    super();
    /**
     * The list of ids of projects that are currently opened
     * @type {string[]} 
     */
    this[openedProjectsValue] = [];
  }

  /**
   * @param {ExportArcProjects[]} data
   */
  [dataChanged](data) {
    super[dataChanged](data);
    if (!Array.isArray(data) || !data.length) {
      return;
    }
    const { requests=[] } = this;
    const selectedRequests = {};
    const result = data.map((project) => {
      selectedRequests[project.key] = [];
      const items = requests.filter((i) => i.projects && i.projects.includes(project.key));
      items.forEach((i) => selectedRequests[project.key].push(i.key));
      return /** @type RenderItem */ ({
        project,
        requests: items,
      });
    });
    this[renderValue] = result;
    this[selectedRequestsValue] = selectedRequests;
    this.requestUpdate();
  }

  /**
   * @param {PointerEvent} e
   */
  [toggleProjectHandler](e) {
    e.preventDefault();
    const node = /** @type HTMLElement */ (e.target);
    const { id } = node.dataset;
    if (!id) {
      return;
    }
    if (!Array.isArray(this[openedProjectsValue])) {
      this[openedProjectsValue] = [];
    }
    const allOpened = /** @type string[] */ (this[openedProjectsValue]);
    if (allOpened.includes(id)) {
      const index = allOpened.findIndex((i) => i === id);
      allOpened.splice(index, 1);
    } else {
      allOpened.push(id);
    }
    this.requestUpdate();
  }

  /**
   * @param {PointerEvent} e
   */
  async [projectToggleSelectionHandler](e) {
    e.preventDefault();
    e.stopImmediatePropagation();
    const node = /** @type HTMLElement */ (e.target);
    const { id } = node.dataset;
    if (!id) {
      return;
    }
    await this.updateComplete;
    const selectedItems = /** @type string[] */ (this.selectedIndexes || []);
    const index = selectedItems.findIndex((i) => i === id);
    if (index === -1) {
      selectedItems.push(id);
      this.ensureProjectSelected();
    } else {
      selectedItems.splice(index, 1);
    }
    this.selectedIndexes = selectedItems;
    this.requestUpdate();
  }

  /**
   * @param {PointerEvent} e
   */
  [requestToggleHandler](e) {
    e.preventDefault();
    const node = /** @type HTMLElement */ (e.currentTarget);
    const { key, project } = node.dataset;
    const allSelected = /** @type object */ (this[selectedRequestsValue] || {});
    const projectSelected = /** @type string[] */ (allSelected[project] || []);
    const index = projectSelected.findIndex((i) => i === key);
    if (index === -1) {
      projectSelected.push(key);
    } else {
      projectSelected.splice(index, 1);
    }
    allSelected[project] = projectSelected;
    this[selectedRequestsValue] = allSelected;
    this.requestUpdate();
  }

  /**
   * @param {string[]} values The list of selected indexes
   */
  setSelected(values) {
    this.selectedIndexes = values;
  }

  /**
   * Makes sure that projects checkbox is selected
   */
  ensureProjectSelected() {
    if (!this.allSelected) {
      this.allSelected = true;
    }
  }

  render() {
    const items = /** @type RenderItem[] */ (this[renderValue]);
    if (!Array.isArray(items) || !items.length) {
      return html``;
    }
    return html`
      ${this.headerTemplate()}
      <anypoint-collapse .opened="${this.opened}">
        ${items.map((item) => this.projectTemplate(item))}
      </anypoint-collapse>
    `;
  }

  /**
   * @param {RenderItem} item
   * @return {TemplateResult} A template for a single project.
   */
  projectTemplate(item) {
    const { project, requests } = item;
    const selectedItems = /** @type string[] */ (this.selectedIndexes || []);
    const isSelected = selectedItems.includes(project.key);
    const allRequestsSelected = /** @type object */ (this[selectedRequestsValue] || {});
    const requestsSelected = /** @type string[] */ (allRequestsSelected[project.key] || []);
    const size = isSelected ? requestsSelected.length : 0;
    return html`
      <div class="project-label">
        <anypoint-checkbox
          ?checked="${isSelected}"
          title="Select / deselect project"
          aria-label="Activate to select or deselect the project"
          data-id="${project.key}"
          @click="${this[projectToggleSelectionHandler]}"
        ></anypoint-checkbox>
        <span 
          class="project-name"
          data-id="${project.key}"
          @click="${this[toggleProjectHandler]}"
        >${project.name || 'Unnamed project'} (${size} requests)
        </span>
        ${this.projectToggle(requests, project)}
      </div>
      ${this.requestsTemplate(requests, project)}
    `;
  }

  /**
   * @param {ExportArcSavedRequest[]} items
   * @param {ExportArcProjects} project
   * @return {TemplateResult|string} A template for a toggle button on the project item.
   */
  projectToggle(items, project) {
    const size = (items && items.length) || 0;
    const hasRequests = size > 0;
    if (!hasRequests) {
      return '';
    }
    const { compatibility } = this;
    const allOpened = /** @type string[] */ (this[openedProjectsValue] || []);
    const opened = allOpened.includes(project.key);
    const classes = {
      'toggle-icon': true,
      opened,
    };
    return html`
    <anypoint-icon-button 
      aria-label="Activate to toggle project visibility" 
      title="Toggle table opened" 
      class="${classMap(classes)}" 
      data-id="${project.key}"
      ?compatibility="${compatibility}"
      @click="${this[toggleProjectHandler]}"
    >
      <span class="icon">${keyboardArrowDown}</span>
    </anypoint-icon-button>`;
  }

  /**
   * @param {ExportArcSavedRequest[]} items
   * @param {ExportArcProjects} project
   * @return {TemplateResult|string} A template for the list of requests
   */
  requestsTemplate(items, project) {
    if (!items) {
      return '';
    }
    const allOpened = /** @type string[] */ (this[openedProjectsValue] || []);
    const allSelected = /** @type object */ (this[selectedRequestsValue] || {});
    const opened = allOpened.includes(project.key);
    const selected = /** @type string[] */ (allSelected[project.key]);
    return html`
    <anypoint-collapse .opened="${opened}">
      <div class="requests-list">
        ${this.requestsItemsTemplate(items, project, selected)}
      </div>
    </anypoint-collapse>
    `;
  }

  /**
   * @param {ExportArcSavedRequest[]} data The data to render.
   * @param {ExportArcProjects} project The project the requests belongs to
   * @param {string[]} selected Selected requests in this project
   * @returns {TemplateResult[]|string} A template for the list items
   */
  requestsItemsTemplate(data, project, selected=[]) {
    return data.map((item, index) => html`
    <anypoint-icon-item
      data-key="${item.key}"
      data-project="${project.key}"
      @click="${this[requestToggleHandler]}"
    >
      <anypoint-checkbox
        data-index="${index}"
        .checked="${selected.includes(item.key)}"
        slot="item-icon"
        aria-label="Toggle selection"
        tabindex="-1"
      ></anypoint-checkbox>
      ${this.itemBodyContentTemplate(item)}
    </anypoint-icon-item>`);
  }

  /**
   * @param {ExportArcSavedRequest} item The request to render.
   * @return {TemplateResult} A template for a request list item
   */
  itemBodyContentTemplate(item) {
    return html`
    <span class="method-label">
      <http-method-label method="${item.method}"></http-method-label>
    </span>
    <anypoint-item-body twoline>${this.itemBodyTemplate(item)}</anypoint-item-body>`;
  }

  /**
   * @param {ExportArcSavedRequest} item Single import item
   * @returns {TemplateResult|string} A template for body content of the import item.
   */
  // @ts-ignore
  itemBodyTemplate(item) {
    return html`
    <div class="no-wrap">${item.name}</div>
    <div data-secondary class="no-wrap">${item.url}</div>
    `;
  }
}
