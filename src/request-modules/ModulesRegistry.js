/** @typedef {import('../types').RegisteredRequestModule} RegisteredRequestModule */
/** @typedef {import('../types').RegisteredResponseModule} RegisteredResponseModule */

/**
 * The list of registered request processing modules.
 * @type {Map<string, RegisteredRequestModule>}
 */
const requestModules = new Map();

/**
 * The list of registered response processing modules.
 * @type {Map<string, RegisteredResponseModule>}
 */
const responseModules = new Map();

/**
 * A registry for modules.
 */
export class ModulesRegistry {
  static get request() { return 'request' };

  static get response() { return 'response' };

  /**
   * Registers a new request or response module in the registry.
   * @param {ModulesRegistry.request|ModulesRegistry.response} context The name of the execution context
   * @param {string} id The identifier of the module
   * @param {Function} fn The function to execute
   * @param {string[]=} permissions The list of permissions for the module
   * @throws {Error} When the module is already registered
   */
  static register(context, id, fn, permissions) {
    const data = {
      fn,
      permissions: Array.isArray(permissions) ? permissions : [],
    };
    const map = context === ModulesRegistry.request ? requestModules : responseModules;
    if (map.has(id)) {
      throw new Error(`Module ${id} already exists`);
    }
    // @ts-ignore
    map.set(id, data);
  }

  /**
   * Checks whether a module is already registered for the given context.
   * @param {ModulesRegistry.request|ModulesRegistry.response} context The name of the execution context
   * @param {string} id The identifier of the module
   * @returns {boolean}
   */
  static has(context, id) {
    const map = context === ModulesRegistry.request ? requestModules : responseModules;
    return map.has(id);
  }

  /**
   * Removes a registered module
   * @param {ModulesRegistry.request|ModulesRegistry.response} context The name of the execution context
   * @param {string} id The identifier of the module
   */
  static unregister(context, id) {
    const map = context === ModulesRegistry.request ? requestModules : responseModules;
    map.delete(id);
  }

  /**
   * Reads the list of registered modules
   * @param {ModulesRegistry.request|ModulesRegistry.response} context The name of the execution context
   * @returns {Map<string, RegisteredRequestModule|RegisteredResponseModule>} The copy of the map of actions.
   */
  static get(context) {
    const map = context === ModulesRegistry.request ? requestModules : responseModules;
    // @ts-ignore
    return new Map(map);
  }
}
