import {ImportBaseTable} from './ImportBaseTable.js';
import {CSSResult, TemplateResult} from 'lit-element';
import { DataExport } from '@advanced-rest-client/arc-types';

/**
 * An element to display list of authorization data to import.
 */
export declare class ImportAuthDataTable extends ImportBaseTable<DataExport.ExportArcAuthData> {
  static get styles(): CSSResult[];
  /**
   * @param data The data to render.
   * @returns A template for the list items
   */
  repeaterTemplate(data: DataExport.ExportArcAuthData[]): TemplateResult|string;
  itemBodyTemplate(): string;
}
