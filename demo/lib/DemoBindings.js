import { ConfigurationBindingsWeb } from '../../src/bindings/web/ConfigurationBindingsWeb.js';
import { ApplicationBindingsWeb } from '../../src/bindings/web/ApplicationBindingsWeb.js';
import { ThemeBindingsWeb } from '../../src/bindings/web/ThemeBindingsWeb.js';
import { WorkspaceBindingsWeb } from '../../src/bindings/web/WorkspaceBindingsWeb.js';
import { DataExportBindingsWeb } from '../../src/bindings/web/DataExportBindingsWeb.js';
import { EncryptionBindingsWeb } from '../../src/bindings/web/EncryptionBindingsWeb.js';
import { GoogleDriveBindingsWeb } from '../../src/bindings/web/GoogleDriveBindingsWeb.js';
import { OAuth2BindingsWeb } from '../../src/bindings/web/OAuth2BindingsWeb.js';
import { DemoApiParserBindings } from './DemoApiParserBindings.js';
import { HttpProxyBindings } from './HttpProxyBindings.js';
import { DemoMenuBindings } from './DemoMenuBindings.js';

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
    this.googleDrive = new GoogleDriveBindingsWeb();
    this.oauth2 = new OAuth2BindingsWeb();
    this.apiParser = new DemoApiParserBindings();
    this.http = new HttpProxyBindings();
    this.menu = new DemoMenuBindings();
  }

  async initialize() {
    await this.config.initialize();
    await this.application.initialize();
    await this.theme.initialize();
    await this.workspace.initialize();
    await this.dataExport.initialize();
    await this.encryption.initialize();
    await this.googleDrive.initialize();
    await this.oauth2.initialize();
    await this.apiParser.initialize();
    await this.http.initialize();
    await this.menu.initialize();
  }
}
