/* eslint-disable max-classes-per-file */
import { ContextEvent, ContextReadEvent, ContextStateUpdateEvent } from '@api-client/core/build/browser.js';
import { ARCConfig } from '../models/ArcConfig.js';
import { EventTypes } from './EventTypes.js';

export class ConfigEvents {
  /**
   * Reads a single config value.
   * 
   * @param key The key path where the value is stored.
   * @param target Optional events target
   * @returns Promise resolved to the configuration value
   */
  static async read(key: string, target: EventTarget = window): Promise<unknown | undefined> {
    const e = new ContextReadEvent<unknown>(EventTypes.Config.read, key);
    target.dispatchEvent(e);
    return e.detail.result;
  }

  /**
   * Reads the entire application configuration
   * @param target Optional events target
   * @returns Promise resolved to the configuration value
   */
  static async readAll(target: EventTarget = window): Promise<ARCConfig | undefined> {
    const e = new ContextEvent<Record<string, string>, ARCConfig>(EventTypes.Config.readAll, {});
    target.dispatchEvent(e);
    return e.detail.result;
  }

  /**
   * Updates a single property in the application configuration object.
   * 
   * @param key The key path where to store the value.
   * @param value The value to store.
   * @param target Optional events target
   * @returns Promise resolved when the transaction commits.
   */
  static async update(key: string, value: unknown, target: EventTarget = window): Promise<void> {
    const e = new ContextEvent(EventTypes.Config.update, {
      key, value,
    });
    target.dispatchEvent(e);
    await e.detail.result;
  }

  static State = class {
    /**
     * Propagates configuration change information.
     * @param key The key path of the value
     * @param value The stored value.
     * @param target Optional events target
     * @returns This has no side effects
     */
    static update(key: string, value: unknown, target: EventTarget = window): void {
      const e = new ContextStateUpdateEvent(EventTypes.Config.State.update, { 
        key,
        item: value,
      });
      target.dispatchEvent(e);
    }
  }
}
