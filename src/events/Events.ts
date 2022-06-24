import { AmfEvents } from "./AmfEvents.js";
import { ApplicationEvents } from "./ApplicationEvents.js";
import { ConfigEvents } from "./ConfigEvents.js";
import { DataExportEvents } from "./DataExportEvents.js";
import { DataImportEvents } from "./DataImportEvents.js";
import { GoogleDriveEvents } from "./GoogleDriveEvents.js";
import { ModelEvents } from "./ModelEvents.js";
import { NavigationEvents } from "./NavigationEvents.js";
import { RequestEvents } from "./RequestEvents.js";
import { RestApiLegacyEvents } from "./RestApiLegacyEvents.js";
import { SearchEvents } from "./SearchEvents.js";
import { ThemeEvents } from "./ThemeEvents.js";
import { TransportEvents } from "./TransportEvents.js";
import { UiEvents } from "./UiEvents.js";
import { UpdaterEvents } from "./UpdaterEvents.js";
import { WorkspaceEvents } from "./WorkspaceEvents.js";

export const Events = Object.freeze({
  Amf: AmfEvents,
  App: ApplicationEvents,
  Config: ConfigEvents,
  DataExport: DataExportEvents,
  DataImport: DataImportEvents,
  GoogleDrive: GoogleDriveEvents,
  Model: ModelEvents,
  Navigation: NavigationEvents,
  RestApiLegacy: RestApiLegacyEvents,
  Request: RequestEvents,
  Search: SearchEvents,
  Theme: ThemeEvents,
  Transport: TransportEvents,
  Ui: UiEvents,
  Updater: UpdaterEvents,
  Workspace: WorkspaceEvents,
});
