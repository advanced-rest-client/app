import { Workspace } from '@advanced-rest-client/events';
import { WorkspaceBindings } from '../base/WorkspaceBindings.js';

/**
 * Web platform bindings for the request workspace related logic.
 */
export class WorkspaceBindingsWeb extends WorkspaceBindings {
  #id: string;
  /**
   * @param contents The workspace to store.
   */
  store(contents: Workspace.DomainWorkspace): Promise<void>;
  /**
   * @param id The workspace id to use.
   * @param contents The workspace to store.
   */
  #storeId(id: string, contents: Workspace.DomainWorkspace): Promise<void>;
  /**
   * @param contents The workspace to store.
   */
  #storeDefault(contents: Workspace.DomainWorkspace): Promise<void>;
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
   * Requests to pick a file for saving.
   * @returns The id of the picked file or undefined when cancelled.
   */
  pickFile(): Promise<string|undefined>;
  /**
   * Reads the current state of the workspace.
   */
  restore(): Promise<Workspace.DomainWorkspace>;
  #restoreId(id: string): Promise<Workspace.DomainWorkspace>;
  #restoreDefault(): Promise<Workspace.DomainWorkspace>;
}
