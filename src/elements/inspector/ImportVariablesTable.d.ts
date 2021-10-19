import {ImportBaseTable} from './ImportBaseTable.js';
import {CSSResult, TemplateResult} from 'lit-element';
import { DataExport } from '@advanced-rest-client/arc-types';

/**
 * An element to display list of authorization data to import.
 */
export declare class ImportVariablesTable extends ImportBaseTable<DataExport.ExportArcVariable> {
  static get styles(): CSSResult[];
  /**
   * @param data A variable to render.
   * @returns Template for the variable body.
   */
  itemBodyTemplate(item: DataExport.ExportArcVariable): TemplateResult;
  /**
   * @param data A variable to render.
   * @returns Template for the variable list item.
   */
  itemBodyContentTemplate(item: DataExport.ExportArcVariable): TemplateResult;
}
