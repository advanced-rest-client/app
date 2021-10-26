import { RegisteredResponseModule, RegisteredRequestModule } from '../types';

/**
 * A registry for modules.
 */
export declare class ModulesRegistry {
  static get request(): string;

  static get response(): string;

  /**
   * Registers a new request or response module in the registry.
   * @param context The name of the execution context
   * @param id The identifier of the module
   * @param fn The function to execute
   * @param permissions The list of permissions for the module
   * @throws {Error} When the module is already registered
   */
  static register(context: string, id: string, fn: Function, permissions?: string[]): void;

  /**
   * Checks whether a module is already registered for the given context.
   * @param context The name of the execution context
   * @param id The identifier of the module
   */
  static has(context: string, id: string): boolean;

  /**
   * Removes a registered module
   * @param context The name of the execution context
   * @param id The identifier of the module
   */
  static unregister(context: string, id: string): void;

  /**
   * Reads the list of registered modules
   * @param context The name of the execution context
   * @returns The copy of the map of actions.
   */
  static get(context: string): Map<string, RegisteredRequestModule|RegisteredResponseModule>;
}
