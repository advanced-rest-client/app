import { ConfigurationBindings } from './ConfigurationBindings.js';
import { ApplicationBindings } from './ApplicationBindings.js';
import { ThemeBindings } from './ThemeBindings.js';

/**
 * A class that mocks Electron APIs.
 */
export class ElectronBindings {
  constructor() {
    this.config = new ConfigurationBindings();
    this.application = new ApplicationBindings();
    this.theme = new ThemeBindings();
  }

  initialize() {
    this.config.initialize();
    this.application.initialize();
    this.theme.initialize();
  }
}
