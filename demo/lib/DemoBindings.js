import { ConfigurationBindingsWeb } from '../../src/bindings/web/ConfigurationBindingsWeb.js';
import { ApplicationBindingsWeb } from '../../src/bindings/web/ApplicationBindingsWeb.js';
import { ThemeBindingsWeb } from '../../src/bindings/web/ThemeBindingsWeb.js';
import { WorkspaceBindingsWeb } from '../../src/bindings/web/WorkspaceBindingsWeb.js';
import { DataExportBindingsWeb } from '../../src/bindings/web/DataExportBindingsWeb.js';
import { EncryptionBindingsWeb } from '../../src/bindings/web/EncryptionBindingsWeb.js';

/**
 * A class that mocks Electron APIs.
 */
export class DemoBindings {
  constructor() {
    const base = new URL(window.location.href);
    this.config = new ConfigurationBindingsWeb();
    this.application = new ApplicationBindingsWeb();
    this.theme = new ThemeBindingsWeb('http:', `${base.host}/demo/themes`);
    this.workspace = new WorkspaceBindingsWeb();
    this.dataExport = new DataExportBindingsWeb();
    this.encryption = new EncryptionBindingsWeb();
  }

  async initialize() {
    await this.config.initialize();
    await this.application.initialize();
    await this.theme.initialize();
    await this.workspace.initialize();
    await this.dataExport.initialize();
    await this.encryption.initialize();
  }
}
