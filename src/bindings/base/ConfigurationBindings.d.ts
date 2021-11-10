import { Config } from '@advanced-rest-client/events';
import { PlatformBindings } from './PlatformBindings.js';

/**
 * The base class for application settings bindings.
 */
export class ConfigurationBindings extends PlatformBindings {
  initialize(): Promise<void>;
  readAllHandler(e: CustomEvent): void;
  readHandler(e: CustomEvent): void;
  updateHandler(e: CustomEvent): void;
  readAll(): Promise<Config.ARCConfig>;
  /**
   * Reads a value of a specific property.
   * @param key The property path.
   */
  read(key: string): Promise<unknown>;
  /**
   * Updates a single property in the app settings.
   */
  update(key: string, value: unknown): Promise<void>;
}
