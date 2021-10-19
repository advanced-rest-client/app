import { ImportBaseTable } from './ImportBaseTable.js';
import { TemplateResult } from 'lit-element';
import { DataExport } from '@advanced-rest-client/arc-types';

/**
 * An element to render list of authorization data to import.
 */
export class ImportCcTable extends ImportBaseTable<DataExport.ExportArcClientCertificateData> {
  /**
   * @param {} data Certificates data to render.
   * @return {}
   */
  repeaterTemplate(data: DataExport.ExportArcClientCertificateData[]): TemplateResult[]|string;

  /**
   * @param {ExportArcClientCertificateData} item The certificate item to render
   * @param {number} index
   * @param {string[]} selectedIndexes
   * @returns {TemplateResult}
   */
  _outerTemplate(item: DataExport.ExportArcClientCertificateData, index: number, selectedIndexes: string[]): TemplateResult;

  /**
   * @param {ExportArcClientCertificateData} item The certificate to render.
   * @return {TemplateResult}
   */
  itemBodyContentTemplate(item: DataExport.ExportArcClientCertificateData): TemplateResult;

  itemBodyTemplate(): string;
}
