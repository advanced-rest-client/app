/* eslint-disable class-methods-use-this */
/**
 * A base class for all platform bindings.
 * 
 * Platform bindings is the way how the application runs a platform specific logic.
 * 
 * For example, it implements how the application stores the state or implements file picker / file saver.
 * Depending on the platform (Electron, web, Chrome, more?)  it uses different set of bindings
 * defined in the target application. This creates a framework for the bindings to exist.
 */
export class PlatformBindings {
  /**
   * Updates the value by path in the settings object.
   * 
   * @param {any} settings The object to update.
   * @param {string} path The path to the data. If the object in the path does not exist it is being created.
   * @param {any} value The value to set.
   */
  updateValue(settings, path, value) {
    const parts = path.split('.');
    const last = parts.pop();
    let current = settings;
    parts.forEach((part) => {
      if (!current[part]) {
        current[part] = {};
      }
      current = current[part];
    });
    current[last] = value;
  }
}
