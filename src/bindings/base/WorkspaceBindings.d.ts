import { Workspace } from '@advanced-rest-client/events';
import { PlatformBindings } from './PlatformBindings.js';

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
  initialize(): Promise<void>;
  /**
   * @param contents The workspace to store.
   */
  store(contents: Workspace.DomainWorkspace): Promise<void>;
  /**
   * Handler for application commands.
   */
  commandHandler(e: CustomEvent): Promise<void>;
  /**
   * Sets the workspace id.
   */
  setIdHandler(e: CustomEvent): void;
  /**
   * Executes the logic to change the workspace id.
   * @param id The new workspace ID.
   */
  setId(id: string): void;
  /**
   * Selects a user directory and triggers the save action in the workspace.
   */
  exportWorkspace(): Promise<void>;
  /**
   * Reads the current state of the workspace.
   */
  restore(): Promise<Workspace.DomainWorkspace>;
  writeHandler(e: CustomEvent): void;
  readHandler(e: CustomEvent): void;
  /**
   * If needed it upgrades the schema to the current one.
   * It creates a new workspace if it detects that the input is invalid.
   * @param input The data read from the file.
   * @returns Processed workspace data
   */
  processWorkspaceInput(input: unknown): Workspace.DomainWorkspace;
  /**
   * Creates an empty workspace definition.
   * @returns Processed workspace data
   */
  createDefaultWorkspace(): Workspace.DomainWorkspace;
  /**
   * @returns Processed workspace data
   */
  upgradeLegacyWorkspace(old: Workspace.LegacyWorkspace): Workspace.DomainWorkspace;
}
