import { ArcState, Application } from '@advanced-rest-client/events';
import { PlatformBindings } from './PlatformBindings.js';

/**
 * The base class that represent application bindings.
 * The application bindings provide platform specific bindings for the app to query for version info,
 * and reading and manipulating application state.
 */
export class ApplicationBindings extends PlatformBindings {
  initialize(): Promise<void>;
  versionInfo(): Promise<Application.AppVersionInfo>;
  readState(): Promise<ArcState.ARCState>;
  /**
   * @param path Preference name
   * @param value Preference value
   */
  updateStateProperty(path: string, value: string): Promise<void>;
  versionInfoHandler(e: CustomEvent): void;
  readStateHandler(e: CustomEvent): void;
  updateStatePropertyHandler(e: CustomEvent): void;
}
