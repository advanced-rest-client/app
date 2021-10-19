import {ImportBaseTable} from './ImportBaseTable.js';
import {TemplateResult} from 'lit-element';
import { DataExport } from '@advanced-rest-client/arc-types';

/**
 * An element to display list of cookies to import.
 */
export declare  class ImportCookiesTable extends ImportBaseTable<DataExport.ExportArcCookie> {
  itemBodyTemplate(item: DataExport.ExportArcCookie): TemplateResult;
}
