import { Config } from '@advanced-rest-client/events';
import { ConfigurationBindings } from '../base/ConfigurationBindings.js';

/**
 * Web platform bindings for the configuration (settings) related logic.
 */
export class ConfigurationBindingsWeb extends ConfigurationBindings {
  readAll(): Promise<Config.ARCConfig>;
  /**
   * Updates a single property in the app settings.
   */
  update(key: string, value: unknown): Promise<void>;
}
