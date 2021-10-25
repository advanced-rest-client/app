import { Entry, Page } from "har-format";
import { Variable, ArcRequest } from '@advanced-rest-client/events';

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

export declare interface ArcConfigSchema {
  version: string;
  kind: string;
  groups: ArcConfigGroup[];
}

export declare interface ArcConfigGroup {
  name: string;
  description?: string;
  enabled: boolean;
  key: string;
  kind: string;
  items: (ArcConfigItem|ArcLinkItem|ArcConfigGroup)[];
  layout?: 'list' | 'input-group';
}

export declare interface ArcConfigItem { 
  kind: string;
  enabled: boolean,
  name: string;
  description?: string;
  key: string;
  default?: any;
  enum: string[];
  type: string;
  suffix?: string;
  /**
   * When set the item is not rendered as a list item but has it's own section with the input.
   */
  topLevel?: boolean;
}

export declare interface ArcLinkItem { 
  kind: string;
  enabled: boolean,
  name: string;
  target: string;
  description?: string;
}

export declare interface SettingsPage {
  /**
   * The sub-page to render.
   */
  page: ArcConfigGroup | ArcConfigItem;
  /**
   * The scroll position to restore after the user click on the back button.
   */
  scrollPosition?: number;
}

export declare type ListType = 'saved' | 'history' | 'project';

export declare interface HistoryDayItem {
  /**
   * The midnight timestamp for the day
   */
  midnight: number;
  /**
   * A label to render in the group
   */
  label: string;
}

export declare interface HistoryListItem {
  /**
   * The history item
   */
  item: ArcRequest.ARCHistoryRequest;
  /**
   * History's ISO time value.
   */
  isoTime: string;
}

export declare interface HistoryGroup {
  /**
   * Group's day definition
   */
  day: HistoryDayItem;
  /**
   * Requests in the group
   */
  requests: HistoryListItem[];
  /**
   * Whether a group is collapsed or opened.
   */
  opened: boolean;
}

export type ListLayout = 'default' | 'comfortable' | 'compact';
