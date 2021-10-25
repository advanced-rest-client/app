import { Project, ARCModelStateDeleteEvent, ARCProjectDeletedEvent, ARCProjectUpdatedEvent } from '@advanced-rest-client/events';
import { Suggestion } from '@anypoint-web-components/awc';
import { 
  hasProjectsValue,
  projectsValue,
  makingProjectsQueryValue,
  refreshProjectsList,
  setProjects,
  dataImportHandler,
  dataDestroyHandler,
  projectChangeHandler,
  projectDeleteHandler,
  notifyProject,
  computeProjectsAutocomplete,
  computeProjectSelection,
} from './internals.js';

declare function ProjectsListConsumerMixin<T extends new (...args: any[]) => {}>(base: T): T & ProjectsListConsumerMixinConstructor;

export {ProjectsListConsumerMixinConstructor};
export {ProjectsListConsumerMixin};

declare interface ProjectsListConsumerMixinConstructor {
  new(...args: any[]): ProjectsListConsumerMixin;
}

export declare interface ProjectSelectionInfo {
  /**
   * List of names of a projects to create
   */
  add: string[];
  /**
   * List of IDs of existing projects
   */
  existing: string[];
}

declare interface ProjectsListConsumerMixin {
  /**
   * When set the element won't request projects list when attached to the dom.
   * When set `refreshProjects()` has to be called manually.
   * @attribute
   */
  noAutoProjects: boolean;

  /**
   * True if `projects` has any items.
   */
  readonly hasProjects: boolean;
  [hasProjectsValue]: boolean;

  /**
   * A list of available projects.
   */
  readonly projects: Project.ARCProject[]|undefined;
  [projectsValue]: Project.ARCProject[]|undefined;
  [makingProjectsQueryValue]: boolean;

  connectedCallback(): void;
  disconnectedCallback(): void;

  /**
   * Refreshes the list of projects after next render frame.
   */
  refreshProjects(): Promise<void>;

  /**
   * Updates list of available projects after the overlay is opened.
   */
  [refreshProjectsList](): Promise<void>;

  /**
   * Sets the projects value.
   */
  [setProjects](projects: Project.ARCProject[]): void;

  /**
   * Handler for `data-imported` custom event.
   * Refreshes data state.
   */
  [dataImportHandler](): void;

  /**
   * Handler for the `datastore-destroyed` custom event.
   * If one of destroyed databases is history store then it refreshes the sate.
   */
  [dataDestroyHandler](e: ARCModelStateDeleteEvent): void;

  [projectChangeHandler](e: ARCProjectUpdatedEvent): Promise<void>;

  [projectDeleteHandler](e: ARCProjectDeletedEvent): Promise<void>;

  /**
   * Dispatches `projectschange` event, requests update, and notifies any resize.
   */
  [notifyProject](): Promise<void>;

  /**
   * Computes a list of suggestion for autocomplete element.
   * From the list of `projects` it takes names for each project and returns
   * new list for suggestions.
   * @param projects
   * @returns AnypointSuggestion element input
   */
  [computeProjectsAutocomplete](projects: Project.ARCProject[]): Suggestion[]|undefined;

  /**
   * Processes projects name list and returns object with `add` property as a list of project 
   * names that do not yet exists and `existing` property with a list of IDs of existing projects.
   *
   * @param selected List of selected projects to process.
   */
  [computeProjectSelection](selected: string[]): ProjectSelectionInfo;
}
