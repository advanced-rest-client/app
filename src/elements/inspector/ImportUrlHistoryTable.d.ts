import {ImportBaseTable} from './ImportBaseTable.js';
import {TemplateResult} from 'lit-element';
import { DataExport } from '@advanced-rest-client/events';

/**
 * An element to render list of URLs history to import.
 */
export declare  class ImportUrlHistoryTable extends ImportBaseTable<DataExport.ExportArcUrlHistory> {
  itemBodyTemplate(item: DataExport.ExportArcUrlHistory): TemplateResult;
}
