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

import { dedupeMixin } from '@open-wc/dedupe-mixin';
// eslint-disable-next-line no-unused-vars
import { LitElement } from 'lit-element';
import { ArcModelEventTypes, ArcModelEvents, DataImportEventTypes } from '@advanced-rest-client/events';
import { 
  hasProjectsValue,
  projectsValue,
  makingProjectsQueryValue,
  refreshProjectsList,
  handleError,
  setProjects,
  dataImportHandler,
  dataDestroyHandler,
  projectChangeHandler,
  projectDeleteHandler,
  notifyProject,
  computeProjectsAutocomplete,
  computeProjectSelection,
} from './internals.js';
import { projectsSortFn } from '../../lib/Utils.js';

/** @typedef {import('@advanced-rest-client/events').Project.ARCProject} ARCProject */
/** @typedef {import('@advanced-rest-client/events').ArcRequest.ARCSavedRequest} ARCSavedRequest */
/** @typedef {import('@advanced-rest-client/events').ARCModelStateDeleteEvent} ARCModelStateDeleteEvent */
/** @typedef {import('@advanced-rest-client/events').ARCProjectUpdatedEvent} ARCProjectUpdatedEvent */
/** @typedef {import('@advanced-rest-client/events').ARCProjectDeletedEvent} ARCProjectDeletedEvent */
/** @typedef {import('@anypoint-web-components/awc').Suggestion} Suggestion */
/** @typedef {import('./ProjectsListConsumerMixin').ProjectSelectionInfo} ProjectSelectionInfo */

/**
 * @param {typeof LitElement} base
 */
const mxFunction = base => {
  class ProjectsListConsumerMixinImpl extends base {
    static get properties() {
      return {
        /**
         * When set the element won't request projects list when attached to the dom.
         * When set `refreshProjects()` has to be called manually.
         * @attribute
         */
        noAutoProjects: { type: Boolean, reflect: true }
      };
    }

    /**
     * @returns {boolean} True if `projects` has any items.
     */
    get hasProjects() {
      return this[hasProjectsValue];
    }
    
    /**
     * @returns {ARCProject[]|undefined} A list of available projects.
     */
    get projects() {
      return this[projectsValue];
    }

    constructor() {
      super();
      this[hasProjectsValue] = false;
      this.noAutoProjects = false;

      this[dataImportHandler] = this[dataImportHandler].bind(this);
      this[dataDestroyHandler] = this[dataDestroyHandler].bind(this);
      this[projectChangeHandler] = this[projectChangeHandler].bind(this);
      this[projectDeleteHandler] = this[projectDeleteHandler].bind(this);
    }

    connectedCallback() {
      super.connectedCallback();
      window.addEventListener(ArcModelEventTypes.Project.State.update, this[projectChangeHandler]);
      window.addEventListener(ArcModelEventTypes.Project.State.delete, this[projectDeleteHandler]);
      window.addEventListener(DataImportEventTypes.dataImported, this[dataImportHandler]);
      window.addEventListener(ArcModelEventTypes.destroyed, this[dataDestroyHandler]);
      if (!this.noAutoProjects && !this.projects) {
        this.refreshProjects();
      }
    }

    disconnectedCallback() {
      super.disconnectedCallback();
      window.removeEventListener(ArcModelEventTypes.Project.State.update, this[projectChangeHandler]);
      window.removeEventListener(ArcModelEventTypes.Project.State.delete, this[projectDeleteHandler]);
      window.removeEventListener(DataImportEventTypes.dataImported, this[dataImportHandler]);
      window.removeEventListener(ArcModelEventTypes.destroyed, this[dataDestroyHandler]);
    }

    /**
     * Refreshes the list of projects after next render frame.
     */
    refreshProjects() {
      if (this[makingProjectsQueryValue]) {
        return;
      }
      this[makingProjectsQueryValue] = true;
      setTimeout(() => {
        this[makingProjectsQueryValue] = false;
        this[refreshProjectsList]();
      });
    }

    /**
     * Updates list of available projects after the overlay is opened.
     * @return {Promise<void>}
     */
    async [refreshProjectsList]() {
      this[makingProjectsQueryValue] = true;
      try {
        const result = await ArcModelEvents.Project.listAll(this);
        this[setProjects](result);
      } catch (cause) {
        this[handleError](cause)
      }
      this[makingProjectsQueryValue] = false;
    }

    /**
     * Sets the projects value.
     * @param {ARCProject[]} projects
     */
    async [setProjects](projects) {
      if (projects) {
        projects.sort(projectsSortFn);
      }
      this[projectsValue] = projects;
      this[hasProjectsValue] = !!(projects && projects.length);
      await this[notifyProject]();
    }

    /**
     * Handler for `data-imported` custom event.
     * Refreshes data state.
     */
    [dataImportHandler]() {
      this.refreshProjects();
      if (super[dataImportHandler]) {
        super[dataImportHandler]();
      }
    }

    /**
     * Handler for the `datastore-destroyed` custom event.
     * If one of destroyed databases is history store then it refreshes the sate.
     * @param {ARCModelStateDeleteEvent} e
     */
    [dataDestroyHandler](e) {
      const { store } = e;
      if (super[dataDestroyHandler]) {
        super[dataDestroyHandler](e);
      }
      if (!['legacy-projects', 'projects', 'all'].includes(store)) {
        return;
      }
      this[setProjects](undefined);
    }

    /**
     * @param {ARCProjectUpdatedEvent} e
     */
    async [projectChangeHandler](e) {
      if (super[projectChangeHandler]) {
        super[projectChangeHandler](e);
      }
      const record = e.changeRecord;
      let item;
      if (record.item) {
        item = /** @type ARCProject */ (record.item);
      } else {
        item = await ArcModelEvents.Project.read(this, record.id);
      }
      if (!this[projectsValue]) {
        this[projectsValue] = /** @type ARCProject[] */ ([]);
      }
      const items = /** @type ARCProject[] */ (this[projectsValue]);
      const index = items.findIndex((i) => i._id === record.id);
      if (index === -1) {
        items.push(item);
      } else {
        items[index] = item;
      }
      items.sort(projectsSortFn);
      this[hasProjectsValue] = true;
      await this[notifyProject]();
    }

    /**
     * @param {ARCProjectDeletedEvent} e
     */
    async [projectDeleteHandler](e) {
      const items = /** @type ARCProject[] */ (this[projectsValue]);
      if (!Array.isArray(items)) {
        return;
      }
      const { id } = e;
      const index = items.findIndex((i) => i._id === id);
      if (index === -1) {
        return;
      }
      items.splice(index, 1);
      this[hasProjectsValue] = !!items.length;
      this[notifyProject]();
    }

    /**
     * Dispatches `projectschange` event, requests update, and notifies any resize.
     */
    async [notifyProject]() {
      this.dispatchEvent(new CustomEvent('projectschange'));
      await this.requestUpdate();
        // @ts-ignore
      if (this.notifyResize) {
        // @ts-ignore
        this.notifyResize();
      }
    }

    /**
     * Computes a list of suggestion for autocomplete element.
     * From the list of `projects` it takes names for each project and returns
     * new list for suggestions.
     * @param {ARCProject[]} projects
     * @returns {Suggestion[]|undefined} AnypointSuggestion element input
     */
    [computeProjectsAutocomplete](projects) {
      if (!Array.isArray(projects) || !projects.length) {
        return undefined;
      }
      const result = [];
      projects.forEach((item) => {
        if (item.name) {
          result[result.length] = {
            value: item.name,
            id: item._id
          };
        }
      });
      return result;
    }

    /**
     * Processes projects name list and returns object with `add` property as a list of project 
     * names that do not yet exists and `existing` property with a list of IDs of existing projects.
     *
     * @param {string[]} selected List of selected projects to process.
     * @return {ProjectSelectionInfo}
     */
    [computeProjectSelection](selected) {
      const result = {
        add: [],
        existing: [],
      };
      if (!Array.isArray(selected) || !selected.length) {
        return result;
      }
      const items = /** @type ARCProject[] */ (this[projectsValue] || []);
      selected.forEach((id) => {
        if (!id) {
          return;
        }
        const project = items.find((p) => p._id === id);
        if (project) {
          result.existing.push(project._id);
        } else {
          result.add.push(id);
        }
      });
      return result;
    }
  }
  return ProjectsListConsumerMixinImpl;
}
/**
 * A mixin with common methods for (legacy) projects list.
 * Use it for components that reads list of projects and requires to keep track
 * of changes in a project object.
 *
 * @mixin
 */
export const ProjectsListConsumerMixin = dedupeMixin(mxFunction);
