import { Entry, Page } from "har-format";
import { Variable } from '@advanced-rest-client/events';

export declare interface RenderedPage {
  page: Page;
  entries: RenderedEntry[];
  totalTime: number;
}

export declare interface SortableEntry extends Entry {
  timestamp: number;
}

export declare interface RenderedEntry extends SortableEntry {
  id: number;
  requestTime: string;
  visualTimings: RenderedEntryTimings;
  requestFormattedDate: string;

  requestSizes: EntrySizing;
  responseSizes: EntrySizing;
}

export declare interface RenderedEntryTimings {
  total: number;
  totalValue: number;
  delay?: number;
  blocked?: number;
  connect?: number;
  dns?: number;
  ssl?: number;
  send?: number;
  receive?: number;
  wait?: number;
}

export declare interface EntrySizing {
  headers: string;
  headersComputed: boolean;
  body: string;
  bodyComputed: boolean;
  sum: string;
  sumComputed: boolean;
}

export declare interface EditorType {
  id: string;
  label: string;
  title: string;
}

export declare type allowedEditors = 'raw' | 'urlEncode' | 'multipart' | 'file';

export interface MonacoSchema {
  uri: string;
  schema: any;
  fileMatch?: string[];
}

export declare type VariablesMap = {[key: string]: string};


export declare interface EvaluateOptions {
  /**
   * A list of variables to override in created context.
   */
  override?: Variable.SystemVariables;
  /**
   * The execution context to use instead of creating the context≥
   */
  context?: VariablesMap;
  /**
   * The list of properties to evaluate. If not set then it scans for all keys in the object.
   * This is used when evaluating objects.
   */
  names?: string[];
}
