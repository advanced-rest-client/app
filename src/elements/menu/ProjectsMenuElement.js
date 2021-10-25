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
import { classMap } from 'lit-html/directives/class-map.js';
import '@anypoint-web-components/awc/anypoint-menu-button.js';
import '@anypoint-web-components/awc/anypoint-button.js';
import '@anypoint-web-components/awc/anypoint-icon-button.js';
import '@anypoint-web-components/awc/anypoint-listbox.js';
import '@anypoint-web-components/awc/anypoint-icon-item.js';
import '@anypoint-web-components/awc/anypoint-item.js';
import '@anypoint-web-components/awc/anypoint-item-body.js';
import '@advanced-rest-client/icons/arc-icon.js'
import { ArcModelEvents, ArcNavigationEvents } from '@advanced-rest-client/events';
import '../../../define/http-method-label.js';
import ProjectStyles from './styles/ProjectStyles.js'
import { cancelEvent, computeProjectDropEffect } from '../../lib/Utils.js';
import { SavedListMixin } from '../request/SavedListMixin.js';
import { ProjectsListConsumerMixin } from '../request/ProjectsListConsumerMixin.js';
import ListStyles from '../request/ListStyles.js';
import * as internals from '../request/internals.js';

/** @typedef {import('@advanced-rest-client/events').ArcRequest.ARCSavedRequest} ARCSavedRequest */
/** @typedef {import('@advanced-rest-client/events').Project.ARCProject} ARCProject */
/** @typedef {import('lit-element').TemplateResult} TemplateResult */

export const projectsListTemplate = Symbol('projectsListTemplate');
export const projectItemTemplate = Symbol('projectItemTemplate');
export const addProjectTemplate = Symbol('addProjectTemplate');
export const addProjectHandler = Symbol('addProjectHandler');
export const projectMouseOverOut = Symbol('projectMouseOverOut');
export const hoveredProjectValue = Symbol('hoveredProjectValue');
export const listOptionsTemplate = Symbol('listOptionsTemplate');
export const openAllRequestsHandler = Symbol('openAllRequestsHandler');
export const replaceAllRequestsHandler = Symbol('replaceAllRequestsHandler');
export const deleteHandler = Symbol('deleteHandler');
export const projectDragStartHandler = Symbol('projectDragStartHandler');
export const projectDropHandler = Symbol('projectDropHandler');
export const projectDragLeaveHandler = Symbol('projectDragLeaveHandler');
export const projectDragOverHandler = Symbol('projectDragOverHandler');
export const toggleOpen = Symbol('toggleOpen');
export const openedProjectsValue = Symbol('openedProjectsValue');
export const projectRequestsTemplate = Symbol('projectRequestsTemplate');
export const projectRequestTemplate = Symbol('projectRequestTemplate');
export const readProjectRequests = Symbol('readProjectRequests');
export const deleteInvalidRequestsHandler = Symbol('deleteInvalidRequestsHandler');
export const openRequestHandler = Symbol('openRequestHandler');
export const openProjectHandler = Symbol('openProjectHandler');
export const listDragOverHandler = Symbol('listDragOverHandler');
export const listDragLeaveHandler = Symbol('listDragLeaveHandler');
export const listDropHandler = Symbol('listDropHandler');
export const dropPointerReference = Symbol('dropPointerReference');
export const dropPointer = Symbol('dropPointer');
export const openingProjectTimeout = Symbol('removeDropPointer');
export const openProject = Symbol('openProject');

/**
 * A list of projects in the ARC main menu.
 */
export default class ProjectsMenuElement extends ProjectsListConsumerMixin(SavedListMixin(LitElement)) {
  static get styles() {
    return [ListStyles, ProjectStyles];
  }

  static get properties() {
    return {
      /**
       * A timeout after which the project item is opened when dragging a
       * request over.
       *
       * @default 700
       */
      dragOpenTimeout: { type: Number },
    };
  }

  constructor() {
    super();
    this.dragOpenTimeout = 700;
    this.noAuto = true;
    this[openedProjectsValue] = /** @type string[] */ ([]);
  }

  refresh() {
    this[internals.setProjects](undefined);
    this.refreshProjects();
    super.refresh();
  }

  async [addProjectHandler]() {
    const project = /** @type ARCProject */({
      name: 'New project',
    });
    await ArcModelEvents.Project.update(this, project);
  }

  /**
   * @param {MouseEvent} e 
   */
  async [projectMouseOverOut](e) {
    const node = /** @type HTMLElement */ (e.currentTarget);
    const opts = node.querySelector('.list-options');
    // @ts-ignore
    if (opts && opts.opened) {
      return undefined;
    }
    if (e.type === 'mouseleave') {
      this[hoveredProjectValue] = undefined;
      return this.requestUpdate();
    }
    const index = Number(node.dataset.index);
    if (Number.isNaN(index)) {
      return undefined;
    }
    this[hoveredProjectValue] = index;
    return this.requestUpdate();
  }

  /**
   * Dispatches an event to open project requests in workspace
   * @param {PointerEvent} e 
   */
  [openAllRequestsHandler](e) {
    const node = /** @type HTMLElement */ (e.currentTarget);
    const index = Number(node.dataset.index);
    if (Number.isNaN(index)) {
      return;
    }
    const project = this.projects[index];
    const { _id } = project;
    ArcNavigationEvents.navigateProject(this, _id, 'addWorkspace');
  }

  /**
   * Dispatches an event to open project requests in workspace and close existing ones.
   * @param {PointerEvent} e 
   */
  [replaceAllRequestsHandler](e) {
    const node = /** @type HTMLElement */ (e.currentTarget);
    const index = Number(node.dataset.index);
    if (Number.isNaN(index)) {
      return;
    }
    const project = this.projects[index];
    const { _id } = project;
    ArcNavigationEvents.navigateProject(this, _id, 'replaceWorkspace');
  }

  /**
   * Deletes a project and its requests.
   * @param {PointerEvent} e 
   */
  async [deleteHandler](e) {
    const node = /** @type HTMLElement */ (e.currentTarget);
    const index = Number(node.dataset.index);
    if (Number.isNaN(index)) {
      return;
    }
    const project = this.projects[index];
    const { _id } = project;
    await ArcModelEvents.Project.delete(this, _id);
  }

  /**
   * Initializes project list item drag operation.
   * @param {DragEvent} e 
   */
  [projectDragStartHandler](e) {
    if (!this.draggableEnabled) {
      return;
    }
    e.stopPropagation();
    const node = /** @type HTMLElement */ (e.currentTarget);
    const index = Number(node.dataset.index);
    if (Number.isNaN(index)) {
      return;
    }
    const project = this.projects[index];
    const { _id } = project;
    const dt = e.dataTransfer;
    dt.setData('arc/id', _id);
    dt.setData('arc/type', 'project');
    dt.setData('arc/source', this.localName);
    dt.setData('arc/project', '1');
    dt.effectAllowed = 'copyMove';
  }

  /**
   * Handles a drag item being dragged over a project item.
   * This is to add support to drop a request into a project.
   *  
   * Both history and saved requests can be dropped here.
   * 
   * @param {DragEvent} e 
   */
  [projectDragOverHandler](e) {
    if (!this.draggableEnabled) {
      return;
    }
    const dt = e.dataTransfer;
    const type = [...dt.types];
    if (!type.includes('arc/request')) {
      return;
    }
    e.preventDefault();
    const node = /** @type HTMLElement */ (e.currentTarget);
    if (!node.classList.contains('drop-target')) {
      node.classList.add('drop-target');
    }
    const { id } = node.dataset;
    const opened = this[openedProjectsValue];
    if (this[openingProjectTimeout] || opened.includes(id)) {
      return;
    }
    this[openingProjectTimeout] = setTimeout(() => {
      this[openingProjectTimeout] = undefined;
      this[openProject](id)
    }, this.dragOpenTimeout);
  }

  /**
   * Handles an item leaving a drag.
   * This is to add support for drop a request into a project.
   * 
   * @param {DragEvent} e 
   */
  [projectDragLeaveHandler](e) {
    if (!this.draggableEnabled) {
      return;
    }
    const dt = e.dataTransfer;
    const type = [...dt.types];
    if (!type.includes('arc/request')) {
      return;
    }
    e.preventDefault();
    const node = /** @type HTMLElement */ (e.currentTarget);
    if (node.classList.contains('drop-target')) {
      node.classList.remove('drop-target');
    }
  }

  /**
   * Handles a request item drop on a project.
   * This adds the request to the project
   * 
   * @param {DragEvent} e 
   */
  async [projectDropHandler](e) {
    if (!this.draggableEnabled) {
      return;
    }
    const dt = e.dataTransfer;
    const types = [...dt.types];
    if (!types.includes('arc/request') || !types.includes('arc/id') || !types.includes('arc/type')) {
      return;
    }
    e.preventDefault();
    const node = /** @type HTMLElement */ (e.currentTarget);
    if (node.classList.contains('drop-target')) {
      node.classList.remove('drop-target');
    }
    const index = Number(node.dataset.index);
    if (Number.isNaN(index)) {
      return;
    }
    const project = this.projects[index];
    const { _id: pid } = project;
    const rid = dt.getData('arc/id');
    const type = dt.getData('arc/type');
    const effect = computeProjectDropEffect(e);
    if (effect === 'move') {
      await ArcModelEvents.Project.moveTo(this, pid, rid, type);
    } else {
      await ArcModelEvents.Project.addTo(this, pid, rid, type);
    }
  }

  /**
   * Toggles project open state.
   * @param {PointerEvent} e 
   */
  async [toggleOpen](e) {
    const node = /** @type HTMLElement */ (e.currentTarget);
    const index = Number(node.dataset.index);
    if (Number.isNaN(index)) {
      return;
    }
    const project = this.projects[index];
    const { _id: pid } = project;
    const opened = this[openedProjectsValue];
    if (opened.includes(pid)) {
      const i = opened.indexOf(pid);
      opened.splice(i, 1);
      await this.requestUpdate();
      return;
    }
    await this[openProject](pid);
  }
  
  /**
   * Opens a project and reads its requests
   * @param {string} id Project id to open
   * @returns {Promise<void>}
   */
  async [openProject](id) {
    await this[readProjectRequests](id);
    const opened = this[openedProjectsValue];
    opened.push(id);
    await this.requestUpdate();
  }

  /**
   * Reads project requests from the data store and loads them into the requests list
   * while taking care of duplicates.
   * @param {string} pid Project id
   */
  async [readProjectRequests](pid) {
    if (!this.requests) {
      this.requests = /** @type ARCSavedRequest[] */ ([]);
    }

    const project = this.projects.find((p) => p._id === pid);
    const { requests } = project;
    if (!requests) {
      return;
    }
    const currentRequests = this.requests;
    const unknown = [];
    requests.forEach((id) => {
      const item = currentRequests.find((r) => r._id === id);
      if (!item) {
        unknown.push(id);
      }
    });
    if (!unknown.length) {
      return;
    }
    const items = await ArcModelEvents.Request.readBulk(this, 'saved', unknown);
    items.forEach((request) => {
      if (!request) {
        return;
      }
      currentRequests.push(request);
    });
  }

  /**
   * Deletes a project and its requests.
   * @param {PointerEvent} e 
   */
  async [deleteInvalidRequestsHandler](e) {
    const node = /** @type HTMLElement */ (e.currentTarget);
    const { project, id } = node.dataset;
    if (!project || !id) {
      return;
    }
    const item = this.projects.find((i) => i._id === project);
    const index = item.requests.findIndex((i) => i === id);
    item.requests.splice(index, 1);
    await ArcModelEvents.Project.update(this, item);
  }

  /**
   * Dispatches request navigation event
   * @param {PointerEvent} e 
   */
  [openRequestHandler](e) {
    const node = /** @type HTMLElement */ (e.currentTarget);
    const { id } = node.dataset;
    if (!id) {
      return;
    }
    ArcNavigationEvents.navigateRequest(this, id, 'saved');
  }

  /**
   * Dispatches project navigation event
   * @param {PointerEvent} e 
   */
  [openProjectHandler](e) {
    const node = /** @type HTMLElement */ (e.currentTarget);
    const index = Number(node.dataset.index);
    if (Number.isNaN(index)) {
      return;
    }
    const project = this.projects[index];
    ArcNavigationEvents.navigateProject(this, project._id);
  }

  /**
   * Handler for `dragover` event on the list element. If the dragged item is compatible
   * it renders the drop message.
   * @param {DragEvent} e
   */
  [listDragOverHandler](e) {
    if (!this.draggableEnabled) {
      return;
    }
    const dt = e.dataTransfer;
    const types = [...dt.types];
    if (!types.includes('arc/request')) {
      return;
    }
    e.preventDefault();
    e.dataTransfer.dropEffect = computeProjectDropEffect(e);
    const path = /** @type Node[] */ (e.composedPath());
    const item = /** @type HTMLElement */ (path.find((node) => node.nodeType === Node.ELEMENT_NODE && node.nodeName === 'ANYPOINT-ICON-ITEM'));
    if (!item) {
      return;
    }
    const rect = item.getClientRects()[0];
    const aboveHalf = (rect.y + rect.height/2) > e.y;
    if (aboveHalf && !item.classList.contains('drop-above')) {
      item.classList.add('drop-above');
    }
    if (aboveHalf && item.classList.contains('drop-below')) {
      item.classList.remove('drop-below');
    }
    if (!aboveHalf && !item.classList.contains('drop-below')) {
      item.classList.add('drop-below');
    }
    if (!aboveHalf && item.classList.contains('drop-above')) {
      item.classList.remove('drop-above');
    }
  }

  /**
   * Handler for `dragleave` event on the list element. 
   * @param {DragEvent} e
   */
  [listDragLeaveHandler](e) {
    if (!this.draggableEnabled) {
      return;
    }
    const dt = e.dataTransfer;
    const types = [...dt.types];
    if (!types.includes('arc/request')) {
      return;
    }
    e.preventDefault();
    const path = /** @type Node[] */ (e.composedPath());
    const item = /** @type HTMLElement */ (path.find((node) => node.nodeType === Node.ELEMENT_NODE && node.nodeName === 'ANYPOINT-ICON-ITEM'));
    if (!item) {
      return;
    }
    item.classList.remove('drop-above');
    item.classList.remove('drop-below');
  }

  /**
   * Overrides parent's dropHandler function to prohibit adding to saved requests
   */
  async [internals.dropHandler]() {
    // 
  }

  /**
   * Overrides parent's dropHandler function to prohibit adding to saved requests
   */
  async [internals.dragOverHandler]() {
    // 
  }

  /**
   * Handler for `drop` event on the list element. 
   * It rearranges the order if the item is already in the project or adds
   * the request at the position.
   * @param {DragEvent} e
   */
  async [listDropHandler](e) {
    if (!this.draggableEnabled) {
      return;
    }
    const dt = e.dataTransfer;
    const types = [...dt.types];
    if (!types.includes('arc/request')) {
      return;
    }
    e.preventDefault();
    const path = /** @type Node[] */ (e.composedPath());
    const item = /** @type HTMLElement */ (path.find((node) => node.nodeType === Node.ELEMENT_NODE && node.nodeName === 'ANYPOINT-ICON-ITEM'));
    if (!item) {
      return;
    }
    const isAbove = item.classList.contains('drop-above');
    item.classList.remove('drop-above');
    item.classList.remove('drop-below');
    const itemIndex = Number(item.dataset.index);
    const order = isAbove ? itemIndex : itemIndex + 1;
    const targetProject = item.dataset.project;
    const rid = dt.getData('arc/id');
    let requestProject = dt.getData('arc/project-request');
    if (!requestProject) {
      // if the dropped request belongs to the current project then it must be 
      // in the requests array. Check if dropping the same request from saved to a project again
      const requestsTargetProject = this.requests.find((r) => r._id === rid && (r.projects || []).includes(targetProject));
      if (requestsTargetProject) {
        requestProject = targetProject;
      }
    }
    if (targetProject === requestProject) {
      // dragging inside the same project.
      const project = this.projects.find((p) => p._id === targetProject);
      const currentIndex = project.requests.indexOf(rid);
      project.requests.splice(order, 0, project.requests.splice(currentIndex, 1)[0]);
      await ArcModelEvents.Project.update(this, project);
    } else {
      const type = dt.getData('arc/type');
      const effect = computeProjectDropEffect(e);
      if (effect === 'move') {
        await ArcModelEvents.Project.moveTo(this, targetProject, rid, type, order);
      } else {
        await ArcModelEvents.Project.addTo(this, targetProject, rid, type, order);
      }
    }
  }

  /**
   * @param {DragEvent} e 
   */
  [internals.dragStartHandler](e) {
    super[internals.dragStartHandler](e);
    const node = /** @type HTMLElement */ (e.currentTarget);
    e.dataTransfer.setDragImage(node, 0, 0);
    const pid = node.dataset.project;
    e.dataTransfer.setData('arc/project-request', pid);
  }
  
  render() {
    return html`
    ${this[internals.unavailableTemplate]()}
    ${this[projectsListTemplate]()}
    `;
  }

  /**
   * @returns {TemplateResult|string} Template for the list items.
   */
  [projectsListTemplate]() {
    const { projects } = this;
    if (!projects || !projects.length) {
      return '';
    }
    return html`
    <div 
      class="list"
      role="menu"
    >
    ${projects.map((item, index) => this[projectItemTemplate](item, index))}
    </div>
    `;
  }

  /**
   * 
   * @param {ARCProject} project A project to render
   * @param {number} index An index of the project in the projects array
   * @returns {TemplateResult}
   */
  [projectItemTemplate](project, index) {
    const { draggableEnabled, anypoint } = this;
    const { _id: pid, name, requests } = project;
    const hovered = this[hoveredProjectValue] === index;
    const allOpened = this[openedProjectsValue];
    const opened = allOpened.includes(pid);
    const classes = { 
      hovered,
      opened,
      'project-item': true,
    };
    return html`
    <anypoint-icon-item
      data-index="${index}"
      data-id="${pid}"
      @click="${this[toggleOpen]}"
      class=${classMap(classes)}
      draggable="${draggableEnabled ? 'true' : 'false'}"
      @dragover="${this[projectDragOverHandler]}"
      @dragleave="${this[projectDragLeaveHandler]}"
      @drop="${this[projectDropHandler]}"
      @dragstart="${this[projectDragStartHandler]}"
      role="menuitem"
      ?anypoint="${anypoint}"
      @mouseenter="${this[projectMouseOverOut]}"
      @mouseleave="${this[projectMouseOverOut]}"
    >
      <arc-icon class="project-icon" slot="item-icon" icon="collectionsBookmark"></arc-icon>
      <anypoint-item-body ?anypoint="${anypoint}">
        <div class="project-name">${name}</div>
      </anypoint-item-body>
      ${hovered ? this[listOptionsTemplate](index) : ''}
    </anypoint-icon-item>
    ${opened ? this[projectRequestsTemplate](pid, requests) : ''}
    `;
  }

  [internals.unavailableTemplate]() {
    const { hasProjects } = this;
    if (hasProjects) {
      return '';
    }
    return html`
    <div class="list-empty">
      <p class="empty-info"><b>You have no saved projects.</b></p>
      <p class="empty-info">
        Projects help you organize requests into a group for structure and quick access.
      </p>
      <div class="add-new-button">
        ${this[addProjectTemplate]()}
      </div>
    </div>
    `;
  }

  [addProjectTemplate]() {
    const { anypoint } = this;
    return html`
    <anypoint-button
      ?anypoint="${anypoint}"
      emphasis="high"
      @click="${this[addProjectHandler]}"
      data-action="add-project"
    >
      <arc-icon icon="add"></arc-icon>
      Add a project
    </anypoint-button>
    `;
  }

  /**
   * 
   * @param {number} index 
   * @returns {TemplateResult} A template for the project list item options
   */
  [listOptionsTemplate](index) {
    const { anypoint } = this;
    return html`
    <anypoint-menu-button
      dynamicalign
      closeOnActivate
      class="list-options"
      horizontalalign="right"
      ?anypoint="${anypoint}"
      @click="${cancelEvent}"
    >
      <anypoint-icon-button
        class="menu-icon"
        aria-label="Activate to open context menu"
        slot="dropdown-trigger"
        ?anypoint="${anypoint}"
      >
        <arc-icon icon="moreVert"></arc-icon>
      </anypoint-icon-button>
      <anypoint-listbox
        slot="dropdown-content"
        ?anypoint="${anypoint}"
        class="dropdown-list"
      >
        <anypoint-item
          data-index="${index}"
          class="menu-item"
          data-action="open-project"
          title="Open project details"
          @click="${this[openProjectHandler]}"
          tabindex="-1"
        >
            Open details
        </anypoint-item>
        <anypoint-item
          data-index="${index}"
          class="menu-item"
          title="Open all requests in the workspace"
          @click="${this[openAllRequestsHandler]}"
          tabindex="-1"
          data-action="open-all-workspace"
        >
          Open all in workspace
        </anypoint-item>
        <anypoint-item
          data-index="${index}"
          class="menu-item"
          title="Replace current workspace with project request"
          @click="${this[replaceAllRequestsHandler]}"
          tabindex="-1"
          data-action="replace-all-workspace"
        >
            Replace all in workspace
        </anypoint-item>
        <anypoint-item
          data-index="${index}"
          class="menu-item"
          title="Delete project"
          @click="${this[deleteHandler]}"
          tabindex="-1"
          data-action="delete-project"
        >
          Delete project
        </anypoint-item>
      </anypoint-listbox>
    </anypoint-menu-button>
    `;
  }

  /**
   * 
   * @param {string} project Parent project id
   * @param {string[]} items The list of requests on the project
   * @return {TemplateResult} A template for the list of requests
   */
  [projectRequestsTemplate](project, items) {
    if (!Array.isArray(items) || !items.length) {
      return html`
        <div class="empty-project-info">
          <p>No requests</p>
          <p>Drop a request here to store it as project request</p>
        </div>
      `;
    }
    return html`
    <div 
      class="project-requests" 
      role="menu" 
      data-id="${project}"
      @dragover="${this[listDragOverHandler]}"
      @dragleave="${this[listDragLeaveHandler]}"
      @drop="${this[listDropHandler]}"
    >
      ${items.map((item, rIndex) => this[projectRequestTemplate](project, item, rIndex))}
    </div>
    `;
  }

  /**
   * 
   * @param {string} project Parent project id
   * @param {string} id Request id to render
   * @param {number} index The index of the request in the project requests list
   * @return {TemplateResult} A template for the request item
   */
  [projectRequestTemplate](project, id, index) {
    const { requests=[], anypoint, draggableEnabled, hasTwoLines } = this;
    const request = requests.find((r) => r._id === id);
    if (!request) {
      return html`
      <div class="unknown-entry">
        <span>Unknown entry</span>
        <anypoint-button 
          @click="${this[deleteInvalidRequestsHandler]}"
          data-project="${project}"
          data-id="${id}"
        >Remove</anypoint-button>
      </div>
      `;
    }
    return html`
    <anypoint-icon-item
      data-index="${index}"
      data-id="${request._id}"
      data-project="${project}"
      @click="${this[openRequestHandler]}"
      class="request-list-item"
      draggable="${draggableEnabled ? 'true' : 'false'}"
      @dragstart="${this[internals.dragStartHandler]}"
      tabindex="-1"
      title="${request.url}"
      role="menuitem"
      ?anypoint="${anypoint}"
    >
      <http-method-label method="${request.method}" title="${request.method}" slot="item-icon"></http-method-label>
      <anypoint-item-body ?twoline="${hasTwoLines}"
        ?anypoint="${anypoint}"
      >
        <div class="name">${request.name}</div>
        <div data-secondary>${request.url}</div>
      </anypoint-item-body>
    </anypoint-icon-item>
    `;
  }
}
