import { Entry, Page } from "har-format";

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
