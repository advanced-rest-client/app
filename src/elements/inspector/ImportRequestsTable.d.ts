import {ImportBaseTable} from './ImportBaseTable.js';
import {TemplateResult} from 'lit-element';
import { DataExport } from '@advanced-rest-client/arc-types';

export declare interface ProjectItem {
  projectId: string;
  requests: DataExport.ExportArcSavedRequest[];
}

/**
 * An element to display list of request objects to import.
 */
export declare class ImportRequestsTable extends ImportBaseTable<DataExport.ExportArcSavedRequest> {
  /**
   * @param item Request to render.
   * @returns Template for the saved request body.
   */
  itemBodyTemplate(item: DataExport.ExportArcSavedRequest): TemplateResult;
  /**
   * @param item Request to render.
   * @returns Template for the saved request body.
   */
  itemBodyContentTemplate(item: DataExport.ExportArcSavedRequest): TemplateResult;
}
