import { TemplateResult, CSSResult } from 'lit-element';
import { DataExport } from '@advanced-rest-client/arc-types';
import { ImportBaseTable, dataChanged } from './ImportBaseTable';

export declare interface RenderItem {
  project: DataExport.ExportArcProjects;
  requests: DataExport.ExportArcSavedRequest[];
}

export const requestsValue: unique symbol;
export const renderValue: unique symbol;
export const selectedProjectsValue: unique symbol;
export const selectedRequestsValue: unique symbol;
export const openedProjectsValue: unique symbol;
export const toggleProjectHandler: unique symbol;
export const requestToggleHandler: unique symbol;
export const projectToggleSelectionHandler: unique symbol;

/**
 * An element to render list of projects to import.
 */
export class ImportProjectsTable extends ImportBaseTable<DataExport.ExportArcProjects> {
  static get styles(): CSSResult[];
  /**
   * The list of requests that have a project
   */
  requests: DataExport.ExportArcSavedRequest[];
  
  /**A list of all requests selected in the projects
   * Note, this alters the list of projects in a request when a request belongs to more than a single project
   * and the project is not selected for import. 
   */
  get selectedRequests(): DataExport.ExportArcSavedRequest[];
  /**
   * The list of ids of projects that are currently opened
   */
  [openedProjectsValue]: string[];
  
  constructor();

  [dataChanged](data: DataExport.ExportArcProjects[]): void;

  [toggleProjectHandler](e: PointerEvent): void;

  [projectToggleSelectionHandler](e: PointerEvent): void;

  [requestToggleHandler](e: PointerEvent): void;

  /**
   * @param values The list of selected indexes
   */
  setSelected(values: string[]): void;

  /**
   * Makes sure that projects checkbox is selected
   */
  ensureProjectSelected(): void;

  render(): TemplateResult;

  /**
   * @returns A template for a single project.
   */
  projectTemplate(item: RenderItem): TemplateResult;

  /**
   * @returns A template for a toggle button on the project item.
   */
  projectToggle(items: DataExport.ExportArcSavedRequest[], project: DataExport.ExportArcProjects): TemplateResult|string;

  /**
   * @returns A template for the list of requests
   */
  requestsTemplate(items: DataExport.ExportArcSavedRequest[], project: DataExport.ExportArcProjects): TemplateResult|string;

  /**
   * @param data The data to render.
   * @param project The project the requests belongs to
   * @param selected Selected requests in this project
   * @returns A template for the list items
   */
  requestsItemsTemplate(data: DataExport.ExportArcSavedRequest[], project: DataExport.ExportArcProjects, selected: string[]): TemplateResult;

  /**
   * @param item The request to render.
   * @return A template for a request list item
   */
  itemBodyContentTemplate(item: DataExport.ExportArcSavedRequest): TemplateResult;

  /**
   * @param item Single import item
   * @returns A template for body content of the import item.
   */
  itemBodyTemplate(item: DataExport.ExportArcSavedRequest): TemplateResult;
}
