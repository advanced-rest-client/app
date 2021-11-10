import { ArcState, Application } from '@advanced-rest-client/events';
import { ApplicationBindings } from '../base/ApplicationBindings.js';

/**
 * Web platform bindings for the general application related logic.
 */
export class ApplicationBindingsWeb extends ApplicationBindings {
  versionInfo(): Promise<Application.AppVersionInfo>;
  readState(): Promise<ArcState.ARCState>;
  /**
   * @param path Preference name
   * @param value Preference value
   */
  updateStateProperty(path: string, value: string): Promise<void>;
}
