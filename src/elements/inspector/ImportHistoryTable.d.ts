import {ImportBaseTable} from './ImportBaseTable.js';
import {CSSResult, TemplateResult} from 'lit-element';
import { DataExport } from '@advanced-rest-client/arc-types';

/**
 * An element to display list of cookies to import.
 */
export declare class ImportHistoryTable extends ImportBaseTable<DataExport.ExportArcHistoryRequest> {
  static get styles(): CSSResult[];
  /**
   * @param item Request to render.
   * @returns Template for the history request body.
   */
  itemBodyTemplate(item: DataExport.ExportArcHistoryRequest): TemplateResult;
  /**
   * @param item Request to render.
   * @returns Template for the history request body.
   */
  itemBodyContentTemplate(item: DataExport.ExportArcHistoryRequest): TemplateResult;
}
