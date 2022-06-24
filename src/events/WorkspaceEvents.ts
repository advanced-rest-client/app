/* eslint-disable max-classes-per-file */
import { ContextEvent } from "@api-client/core/build/browser.js";
import { ArcExportObject, ARCHistoryRequest, ARCSavedRequest } from "@api-client/core/build/legacy.js";
import { DomainWorkspace } from "../models/Workspace.js";
import { EventTypes } from "./EventTypes.js";

export class WorkspaceEvents {
  /**
   * @param {EventTarget} target
   * @param {ArcExportObject} data The export object to append the requests from
   */
  static appendExport(data: ArcExportObject, target: EventTarget = window): void {
    const e = new CustomEvent(EventTypes.Workspace.appendExport, {
      bubbles: true,
      composed: true,
      detail: { data },
    });
    target.dispatchEvent(e);
  }

  /**
   * Appends a request to the current workspace.
   * 
   * @param request The request to append
   */
  static appendRequest(request: ARCSavedRequest|ARCHistoryRequest, target: EventTarget = window): void {
    const e = new CustomEvent(EventTypes.Workspace.appendRequest, {
      bubbles: true,
      composed: true,
      detail: { request },
    });
    target.dispatchEvent(e);
  }

  /**
   * Reads the workspace data from the store
   */
  static async read(target: EventTarget = window): Promise<DomainWorkspace | undefined> {
    const e = new ContextEvent<Record<string, unknown>, DomainWorkspace>(EventTypes.Workspace.read, {});
    target.dispatchEvent(e);
    return e.detail.result;
  }

  /**
   * @param contents The workspace contents.
   */
  static async write(contents: DomainWorkspace, target: EventTarget = window): Promise<void> {
    const e = new ContextEvent(EventTypes.Workspace.write, { contents });
    target.dispatchEvent(e);
    await e.detail.result;
  }

  /**
   * Informs the workspace processor that the workspace id has changed.
   * Used when initializing the application. The app has no access to the platform bindings.
   * 
   * @param id The id of the workspace identifier.
   */
  static setId(id: string, target: EventTarget = window): void {
    const e = new CustomEvent(EventTypes.Workspace.setId, {
      bubbles: true,
      composed: true,
      detail: { id },
    });
    target.dispatchEvent(e);
  }

  /**
   * Triggers workspace save action remotely. This is handled by the workspace itself.
   */
  static triggerWrite(target: EventTarget = window): void {
    const e = new Event(EventTypes.Workspace.triggerWrite, {
      bubbles: true,
      composed: true,
    });
    target.dispatchEvent(e);
  }

  static State = class {
    /**
     * Informs the application that the workspace identifier has changed.
     * This, most likely, was triggered by the user saving the workspace in a new location.
     * 
     * @param id The id of the workspace file.
     */
    static idChange(id: string, target: EventTarget = window): void {
      const e = new CustomEvent(EventTypes.Workspace.State.idChange, {
        bubbles: true,
        composed: true,
        detail: { id },
      });
      target.dispatchEvent(e);
    }

    /**
     * Informs the application that the workspace state is now committed to the store.
     */
    static write(target: EventTarget = window): void {
      const e = new CustomEvent(EventTypes.Workspace.State.write, {
        bubbles: true,
        composed: true,
      });
      target.dispatchEvent(e);
    }
  }
}
