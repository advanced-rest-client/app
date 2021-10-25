/* eslint-disable arrow-body-style */
/* eslint-disable no-param-reassign */
import { html } from 'lit-element';
import '@advanced-rest-client/icons/arc-icon.js';
import '@anypoint-web-components/awc/anypoint-icon-button.js';
import '@anypoint-web-components/awc/anypoint-chip-input.js';
import { ArcModelEvents } from '@advanced-rest-client/events';
import { SavedListMixin } from './SavedListMixin.js';
import RequestsPanelElement from './RequestsPanelElement.js';
import { 
  customActionsTemplate, 
  contentActionHandler,
  projectSelectorTemplate,
  computeProjectsAutocomplete,
  notifyProject,
  computeProjectSelection,
  selectedItemsValue,
  readType,
} from './internals.js';
import { ProjectsListConsumerMixin } from './ProjectsListConsumerMixin.js';

export const projectsSuggestionsValue = Symbol('projectsSuggestionsValue');
export const projectAddKeydown = Symbol('projectAddKeydown');
export const addSelectedProject = Symbol('addSelectedProject');
export const cancelAddProject = Symbol('cancelAddProject');
export const projectSelectorOpenedValue = Symbol('projectSelectorOpenedValue');
export const projectOverlayClosed = Symbol('projectOverlayClosed');

/** @typedef {import('@advanced-rest-client/events').ArcRequest.ARCSavedRequest} ARCSavedRequest */
/** @typedef {import('@anypoint-web-components/awc').ChipSuggestion} ChipSuggestion */
/** @typedef {import('@anypoint-web-components/awc').AnypointChipInputElement} AnypointChipInput */

export default class SavedPanelElement extends ProjectsListConsumerMixin(SavedListMixin(RequestsPanelElement)) {
  async [notifyProject]() {
    this[projectsSuggestionsValue] = /** @type ChipSuggestion[] */ (this[computeProjectsAutocomplete](this.projects));
    await super[notifyProject]();
  }

  /**
   * @param {PointerEvent} e
   */
  [contentActionHandler](e) {
    const node = /** @type HTMLElement */(e.currentTarget);
    const { action } = node.dataset;
    if (action === 'project-add') {
      this[projectSelectorOpenedValue] = true;
      this.requestUpdate();
    } else {
      super[contentActionHandler](e);
    }
  }

  /**
   * Listens for Enter + cmd/ctrl button to accept project selection.
   * @param {KeyboardEvent} e
   */
  [projectAddKeydown](e) {
    if (e.key !== 'Enter') {
      return;
    }
    if (!e.metaKey && !e.ctrlKey) {
      return;
    }
    this[addSelectedProject]();
  }

  /**
   * Updates projects for requests when confirming the change action.
   */
  async [addSelectedProject]() {
    const chip = /** @type AnypointChipInput */ (this.shadowRoot.querySelector('[name="projects"]'));
    const { chipsValue } = chip;
    const selected = /** @type string[] */(this[selectedItemsValue]);
    if (!chipsValue || !chipsValue.length || !selected || !selected.length) {
      this[cancelAddProject]();
      return;
    }
    const info = this[computeProjectSelection](chipsValue);
    this[cancelAddProject]();
    // create projects
    const projects = info.add.map((name) => {
      return {
        name,
        requests: selected,
      };
    });
    const requests = /** @type ARCSavedRequest[]  */ (this.requests.filter((r) => selected.includes(r._id)));
    let ids = info.existing;
    if (projects.length) {
      const result = await ArcModelEvents.Project.updateBulk(this, projects);
      ids = ids.concat(result.map((record) => record.id));
    }
    requests.forEach((item) => {
      if (!item.projects) {
        item.projects = [];
      }
      item.projects = item.projects.concat(ids).filter((el, i, arr) => arr.indexOf(el) === i);
    });
    const requestType = this[readType]();
    await ArcModelEvents.Request.updateBulk(this, requestType, requests);
  }

  [cancelAddProject]() {
    this[projectSelectorOpenedValue] = false;
    this.requestUpdate();
  }

  [projectOverlayClosed]() {
    this[projectSelectorOpenedValue] = false;
  }

  render() {
    return html`
    ${super.render()}
    ${this[projectSelectorTemplate]()}
    `;
  }

  [customActionsTemplate]() {
    const { selectedItems } = this;
    const hasSelection = !!(selectedItems && selectedItems.length);
    return html`
    <div class="selection-divider"></div>
    <anypoint-icon-button 
      @click="${this[contentActionHandler]}" 
      data-action="project-add" 
      title="Add selected to a project"
      ?disabled="${!hasSelection}"
    >
      <arc-icon icon="collectionsBookmark"></arc-icon>
    </anypoint-icon-button>
    `;
  }

  [projectSelectorTemplate]() {
    const { anypoint } = this;
    const source = this[projectsSuggestionsValue];
    const opened = this[projectSelectorOpenedValue];
    return html`
    <bottom-sheet
      ?opened="${opened}"
      @closed="${this[projectOverlayClosed]}"
    >
      <h3 class="project-selector-title">Select project</h3>
      <anypoint-chip-input
        .source="${source}"
        ?anypoint="${anypoint}"
        @keydown="${this[projectAddKeydown]}"
        name="projects"
      >
        <label slot="label">Select projects</label>
      </anypoint-chip-input>
      <div class="project-actions">
        <anypoint-button
          data-action="cancel-add-project"
          ?anypoint="${anypoint}"
          @click="${this[cancelAddProject]}">Cancel</anypoint-button>
        <anypoint-button
          emphasis="high"
          data-action="project-add"
          class="primary-action"
          ?anypoint="${anypoint}"
          @click="${this[addSelectedProject]}">Add</anypoint-button>
      </div>
    </bottom-sheet>`;
  }
}
