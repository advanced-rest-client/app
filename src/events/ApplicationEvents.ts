/* eslint-disable @typescript-eslint/no-explicit-any */
import { ContextEvent } from '@api-client/core/build/browser.js';
import { AppVersionInfo } from '../models/Application.js';
import { ARCState } from '../models/ArcState.js';
import { EventTypes } from './EventTypes.js';

export class ApplicationEvents {
  /** 
   * Reads application version information.
   * @param target The node on which to dispatch the event.
   * @returns The info about application version
   */
  static async versionInfo(target: EventTarget = window): Promise<AppVersionInfo | undefined> {
    const e = new ContextEvent<Record<string, string>, AppVersionInfo>(EventTypes.App.versionInfo, {});
    target.dispatchEvent(e);
    return e.detail.result;
  }

  /** 
   * Asks the application to run one of the predefined commands.
   * This is initialized in the IO thread and proxied in the renderer process.
   * 
   * @param action The command name to execute
   * @param target The node on which to dispatch the event.
   * @param args The arguments to pass to the application.
   */
  static command(action: string, target: EventTarget = window, ...args: any[]): void {
    const e = new ContextEvent(EventTypes.App.command, {
      action, args,
    });
    target.dispatchEvent(e);
  }

  /** 
   * Asks the application to run one of the predefined request actions.
   * This is initialized in the IO thread and proxied in the renderer process.
   * 
   * @param action The command name to execute
   * @param target The node on which to dispatch the event.
   * @param args The arguments to pass to the application.
   */
  static requestAction(action: string, target: EventTarget = window, ...args: any[]): void {
    const e = new ContextEvent(EventTypes.App.requestAction, {
      action, args,
    });
    target.dispatchEvent(e);
  }

  /** 
   * Reads the application state file.
   * 
   * @param target The node on which to dispatch the event.
   */
  static async readState(target: EventTarget = window): Promise<ARCState | undefined> {
    const e = new ContextEvent<Record<string, string>, ARCState>(EventTypes.App.readState, {});
    target.dispatchEvent(e);
    return e.detail.result;
  }

  /**
   * Updates a single state value
   * 
   * @param name Path to the state preference
   * @param value State value
   * @param target The node on which to dispatch the event.
   */
  static async updateStateProperty(name: string, value: unknown, target: EventTarget = window): Promise<void> {
    const e = new ContextEvent(EventTypes.App.updateStateProperty, { name, value });
    target.dispatchEvent(e);
    await e.detail.result;
  }
}
