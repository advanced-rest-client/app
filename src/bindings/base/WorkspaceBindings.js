/* eslint-disable no-unused-vars */
/* eslint-disable class-methods-use-this */
import { EventTypes } from '@advanced-rest-client/events';
import { v4 } from '@advanced-rest-client/uuid';
import { PlatformBindings } from './PlatformBindings.js';

/** @typedef {import('@advanced-rest-client/events').Workspace.DomainWorkspace} DomainWorkspace */
/** @typedef {import('@advanced-rest-client/events').Workspace.LegacyWorkspace} LegacyWorkspace */

/**
 * The base class for workspace bindings.
 * 
 * In Electron app the renderer process has no access to the workspace file location (except for the processor itself).
 * The workspace is identified by an id that is automatically generated when the user 
 * opens a specific workspace location and stored in the internal data file.
 * 
 * When the workspace binding wants to write workspace state it request the IO process for the file location for the given id.
 * The IO process returns the location where the file data should be stored.
 * When the id is missing then the IO process returns the default location to the workspace file.
 * 
 * In this demo, the binding stores the workspace contents in the IDB unless the user request to
 * store the file in the filesystem. In this case it invokes native file picker
 * and stores the handle in the IDB for future use. When the id change to a location that is already used
 * the old handle is restored.
 */
export class WorkspaceBindings extends PlatformBindings {
  async initialize() {
    window.addEventListener(EventTypes.App.command, this.commandHandler.bind(this));
    window.addEventListener(EventTypes.Workspace.setId, this.setIdHandler.bind(this));
    window.addEventListener(EventTypes.Workspace.write, this.writeHandler.bind(this));
    window.addEventListener(EventTypes.Workspace.read, this.readHandler.bind(this));
  }

  /**
   * @param {DomainWorkspace} contents The workspace to store.
   */
  async store(contents) {
    throw new Error('Not implemented');
  }

  /**
   * Handler for application commands.
   *
   * @param {CustomEvent} e 
   */
  async commandHandler(e) {
    const { action } = e.detail;
    if (action === 'export-workspace') {
      await this.exportWorkspace();
    }
  }

  /**
   * Sets the workspace id.
   *
   * @param {CustomEvent} e 
   */
  setIdHandler(e) {
    this.setId(e.detail.id);
  }

  /**
   * Executes the logic to change the workspace id.
   * @param {string} id The new workspace ID.
   */
  setId(id) {
    throw new Error('Not implemented');
  }

  /**
   * Selects a user directory and triggers the save action in the workspace.
   * @returns {Promise<void>}
   */
  async exportWorkspace() {
    throw new Error('Not implemented');
  }

  /**
   * Reads the current state of the workspace.
   * @returns {Promise<DomainWorkspace>}
   */
  async restore() {
    throw new Error('Not implemented');
  }

  /**
   * @param {CustomEvent} e 
   */
  writeHandler(e) {
    const { contents } = e.detail;
    e.detail.result = this.store(contents);
  }

  /**
   * @param {CustomEvent} e 
   */
  readHandler(e) {
    e.detail.result = this.restore();
  }

  /**
   * If needed it upgrades the schema to the current one.
   * It creates a new workspace if it detects that the input is invalid.
   * @param {any} input The data read from the file.
   * @returns {DomainWorkspace} Processed workspace data
   */
  processWorkspaceInput(input) {
    if (!input) {
      return this.createDefaultWorkspace();
    }
    if (input.kind === 'ARC#DomainWorkspace') {
      return input;
    }
    const typedLegacy = /** @type LegacyWorkspace */ (input);
    if (Array.isArray(typedLegacy.requests)) {
      return this.upgradeLegacyWorkspace(typedLegacy);
    }
    return this.createDefaultWorkspace();
  }

  /**
   * Creates an empty workspace definition.
   * @returns {DomainWorkspace} Processed workspace data
   */
  createDefaultWorkspace() {
    return {
      kind: 'ARC#DomainWorkspace',
      id: v4(),
      readOnly: false,
    };
  }

  /**
   * @param {LegacyWorkspace} old
   * @returns {DomainWorkspace} Processed workspace data
   */
  upgradeLegacyWorkspace(old) {
    const info = this.createDefaultWorkspace();
    info.meta = {
      kind: 'ARC#ThingMeta',
    };
    if (typeof old.description === 'string') {
      info.meta.description = old.description;
    }
    if (typeof old.version === 'string') {
      info.meta.version = old.version;
    }
    if (typeof old.published === 'string') {
      info.meta.published = old.published;
      info.meta.updated = old.published;
    }
    if (typeof old.version === 'string') {
      info.meta.version = old.version;
    }
    if (old.provider) {
      info.provider = old.provider;
      info.provider.kind = 'ARC#Provider';
    }
    if (typeof old.selected === 'number') {
      info.selected = old.selected;
    }
    if (Array.isArray(old.variables)) {
      info.variables = old.variables;
    }
    if (Array.isArray(old.requests)) {
      info.requests = old.requests;
    }
    return info;
  }
}
