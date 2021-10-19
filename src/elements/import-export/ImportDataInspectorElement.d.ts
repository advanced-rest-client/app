import {LitElement, CSSResult, TemplateResult} from 'lit-element';
import { DataExport } from '@advanced-rest-client/arc-types';

export declare const importHandler: unique symbol;
export declare const cancelHandler: unique symbol;
export declare const getTableData: unique symbol;
export declare const metaTemplate: unique symbol;
export declare const createdTemplate: unique symbol;
export declare const versionTemplate: unique symbol;
export declare const projectsTemplate: unique symbol;
export declare const readNonProjectsData: unique symbol;
export declare const requestsTableTemplate: unique symbol;
export declare const historyTableTemplate: unique symbol;
export declare const variablesTableTemplate: unique symbol;
export declare const cookiesTableTemplate: unique symbol;
export declare const authDataTableTemplate: unique symbol;
export declare const urlsTableTemplate: unique symbol;
export declare const socketUrlsTableTemplate: unique symbol;
export declare const ccTableTemplate: unique symbol;
export declare const actionsTemplate: unique symbol;

/**
 * An element to display tables of import data.
 * @fires cancel
 * @fires import
 */
export declare class ImportDataInspectorElement extends LitElement {
  static get styles(): CSSResult;

  /**
   * Imported data.
   */
  data: DataExport.ArcExportObject;

  /**
   * Enables compatibility with Anypoint platform
   * @attribute
   */
  compatibility?: boolean;

  constructor();

  /**
   * Dispatches the `cancel` event
   */
  [cancelHandler](): void;

  /**
   * Dispatches the `import` event
   */
  [importHandler](): void;

  /**
   * Collects information about selected data in the data table.
   *
   * @param name Data table element name to check data for.
   * @returns List of items or undefined if the table is
   * not in the DOM, the table is hidden or selection is empty.
   */
  [getTableData](name: string): any[]|undefined;

  /**
   * Collects import data from the tables.
   * Only selected items are in the final object.
   *
   * @returns ARC import object with updated arrays.
   * Note, the object is a shallow copy of the original data object.
   */
  collectData(): DataExport.ArcExportObject;

  render(): TemplateResult;

  /**
   * @returns A template for the table actions.
   */
  [actionsTemplate](): TemplateResult;

  [createdTemplate](data: DataExport.ArcExportObject): boolean;
  [requestsTableTemplate](data: DataExport.ArcExportObject, compatibility: boolean): TemplateResult|string;
  [historyTableTemplate](data: DataExport.ArcExportObject, compatibility: boolean): TemplateResult|string;
  [variablesTableTemplate](data: DataExport.ArcExportObject, compatibility: boolean): TemplateResult|string;
  [cookiesTableTemplate](data: DataExport.ArcExportObject, compatibility: boolean): TemplateResult|string;
  [authDataTableTemplate](data: DataExport.ArcExportObject, compatibility: boolean): TemplateResult|string;
  [urlsTableTemplate](data: DataExport.ArcExportObject, compatibility: boolean): TemplateResult|string;
  [socketUrlsTableTemplate](data: DataExport.ArcExportObject, compatibility: boolean): TemplateResult|string;
  [ccTableTemplate](data: DataExport.ArcExportObject, compatibility: boolean): TemplateResult|string;
}
